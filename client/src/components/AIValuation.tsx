import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AnalysisResult, StockAnalysis } from "@shared/schema";

interface AIValuationProps {
  result: AnalysisResult;
  inputData: StockAnalysis;
}

export default function AIValuation({ result, inputData }: AIValuationProps) {
  const [aiVerdict, setAiVerdict] = useState<"Undervalued" | "Fairly Valued" | "Overvalued">("Fairly Valued");
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [aiScore, setAiScore] = useState<number>(0);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateAIValuation = async () => {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      setAnalysis("Please save your OpenAI API key in AI Insights section first.");
      return;
    }

    setLoading(true);

    const prompt = `As a valuation expert, analyze this Sri Lankan stock and provide your independent assessment:

Stock: ${result.stockName} (${result.tickerSymbol})

Score-Based Analysis:
- Overall Score: ${result.overallScore.toFixed(2)}/5.0
- Verdict: ${result.verdict}
- Recommendation: ${result.recommendation}

Financial Data:
- P/E: ${result.ratios.pe.toFixed(2)} vs Industry: ${inputData.industryAvgPE.toFixed(2)}
- P/BV: ${result.ratios.pbv.toFixed(2)} vs Industry: ${inputData.industryAvgPBV.toFixed(2)}
- ROE: ${result.ratios.roe.toFixed(2)}% vs Industry: ${inputData.industryAvgROE.toFixed(2)}%
- EPS Growth: ${inputData.epsGrowth.toFixed(2)}%
- Revenue Growth: ${inputData.revenueGrowth.toFixed(2)}%
- Debt/Equity: ${result.ratios.debtToEquity.toFixed(2)}
- Dividend Yield: ${result.ratios.dividendYield.toFixed(2)}%
- PEG Ratio: ${result.ratios.peg.toFixed(2)}

Provide your assessment in this format:

AI_SCORE: [0.0-5.0]
AI_VERDICT: [Undervalued/Fairly Valued/Overvalued]
AI_RECOMMENDATION: [Strong Buy/Buy/Hold/Avoid/Sell]

Then explain in 2-3 paragraphs:
1. Your valuation assessment and why it may differ from score-based
2. Key factors influencing your decision
3. Market context and Sri Lankan market considerations`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          max_tokens: 700,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setAnalysis(`Error: ${data.error.message}`);
      } else {
        const content = data.choices[0].message.content;
        
        const scoreMatch = content.match(/AI_SCORE:\s*([\d.]+)/);
        const verdictMatch = content.match(/AI_VERDICT:\s*(Undervalued|Fairly Valued|Overvalued)/);
        const recommendationMatch = content.match(/AI_RECOMMENDATION:\s*(.+)/);
        
        if (scoreMatch) setAiScore(parseFloat(scoreMatch[1]));
        if (verdictMatch) setAiVerdict(verdictMatch[1] as "Undervalued" | "Fairly Valued" | "Overvalued");
        if (recommendationMatch) setAiRecommendation(recommendationMatch[1].trim());
        
        const cleanContent = content
          .replace(/AI_SCORE:.*\n/, '')
          .replace(/AI_VERDICT:.*\n/, '')
          .replace(/AI_RECOMMENDATION:.*\n/, '')
          .trim();
        
        setAnalysis(cleanContent);
      }
    } catch (error) {
      setAnalysis(`Error: ${error instanceof Error ? error.message : "Failed to generate"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("openai_api_key")) {
      generateAIValuation();
    }

    const handleApiKeyUpdate = () => {
      if (localStorage.getItem("openai_api_key")) {
        generateAIValuation();
      }
    };
    window.addEventListener("apiKeyUpdated", handleApiKeyUpdate);
    return () => window.removeEventListener("apiKeyUpdated", handleApiKeyUpdate);
  }, []);

  const getVerdictColor = (verdict: string) => {
    if (verdict === "Undervalued") return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900";
    if (verdict === "Overvalued") return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
    return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900";
  };

  const getVerdictIcon = (verdict: string) => {
    if (verdict === "Undervalued") return <TrendingUp className="h-5 w-5" />;
    if (verdict === "Overvalued") return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Valuation
        </CardTitle>
        <CardDescription>AI-powered independent valuation assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Score-Based */}
          <div className={`p-4 rounded-md border ${getVerdictColor(result.verdict)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getVerdictIcon(result.verdict)}
              <span className="font-bold text-sm">Score-Based</span>
            </div>
            <div className="text-2xl font-bold mb-1">{result.overallScore.toFixed(2)}/5.0</div>
            <div className="text-sm font-semibold mb-1">{result.verdict}</div>
            <div className="text-xs opacity-90">{result.recommendation}</div>
          </div>

          {/* AI Valuation */}
          <div className={`p-4 rounded-md border ${getVerdictColor(aiVerdict)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getVerdictIcon(aiVerdict)}
              <span className="font-bold text-sm">AI Assessment</span>
            </div>
            <div className="text-2xl font-bold mb-1">{aiScore > 0 ? `${aiScore.toFixed(2)}/5.0` : "—"}</div>
            <div className="text-sm font-semibold mb-1">{aiVerdict}</div>
            <div className="text-xs opacity-90">{aiRecommendation || "—"}</div>
          </div>
        </div>

        {!analysis && !loading && (
          <Button onClick={generateAIValuation} variant="outline" className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            Get AI Valuation
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Analyzing valuation...</span>
          </div>
        )}

        {analysis && !loading && (
          <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
            {analysis}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
