import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, TrendingUp, AlertCircle, Target } from "lucide-react";
import type { AnalysisResult, StockAnalysis } from "@shared/schema";

interface SmartRecommendationsProps {
  result: AnalysisResult;
  inputData: StockAnalysis;
}

export default function SmartRecommendations({ result, inputData }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      setRecommendations("Please save your OpenAI API key in AI Insights section first.");
      return;
    }

    setLoading(true);

    const prompt = `As a financial advisor, provide actionable recommendations for improving this stock's performance:

Stock: ${result.stockName} (${result.tickerSymbol})
Score: ${result.overallScore.toFixed(2)}/5.0 - ${result.verdict}

Current Metrics:
- P/E: ${result.ratios.pe.toFixed(2)} vs Industry: ${inputData.industryAvgPE.toFixed(2)}
- ROE: ${result.ratios.roe.toFixed(2)}% vs Industry: ${inputData.industryAvgROE.toFixed(2)}%
- Debt/Equity: ${result.ratios.debtToEquity.toFixed(2)}
- EPS Growth: ${inputData.epsGrowth.toFixed(2)}%
- Dividend Yield: ${result.ratios.dividendYield.toFixed(2)}%

Provide 3-5 specific, actionable recommendations in this format:

**1. [Category]**
- What needs improvement
- Why it matters
- Specific action

Keep it concise and practical.`;

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
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setRecommendations(`Error: ${data.error.message}`);
      } else {
        setRecommendations(data.choices[0].message.content);
      }
    } catch (error) {
      setRecommendations(`Error: ${error instanceof Error ? error.message : "Failed to generate"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("openai_api_key")) {
      generateRecommendations();
    }
  }, []);

  const getScoreColor = () => {
    if (result.overallScore >= 4) return "text-green-600 dark:text-green-400";
    if (result.overallScore >= 3) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Recommendations
        </CardTitle>
        <CardDescription>AI-powered suggestions to improve investment potential</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-muted rounded-md text-center">
            <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className={`text-lg font-bold ${getScoreColor()}`}>
              {result.overallScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Current Score</div>
          </div>
          <div className="p-3 bg-muted rounded-md text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">
              {result.scores.epsGrowthScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Growth Score</div>
          </div>
          <div className="p-3 bg-muted rounded-md text-center">
            <AlertCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">
              {result.scores.debtScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Debt Score</div>
          </div>
        </div>

        {!recommendations && !loading && (
          <Button onClick={generateRecommendations} className="w-full gap-2">
            <Lightbulb className="h-4 w-4" />
            Generate Recommendations
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Analyzing and generating recommendations...</span>
          </div>
        )}

        {recommendations && !loading && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
              {recommendations}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
