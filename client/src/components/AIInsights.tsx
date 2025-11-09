import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import type { AnalysisResult, StockAnalysis } from "@shared/schema";

interface AIInsightsProps {
  result: AnalysisResult;
  inputData: StockAnalysis;
}

export default function AIInsights({ result, inputData }: AIInsightsProps) {
  const [apiKey, setApiKey] = useState(localStorage.getItem("openai_api_key") || "");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const saveApiKey = () => {
    localStorage.setItem("openai_api_key", apiKey);
  };

  const askAI = async () => {
    if (!apiKey) {
      setAnswer("");
      return;
    }

    setLoading(true);
    setAnswer("");

    const prompt = `You are a financial analyst. Analyze this stock data and answer the question.

Stock: ${result.stockName} (${result.tickerSymbol})
Overall Score: ${result.overallScore.toFixed(2)}/5.0
Verdict: ${result.verdict}
Recommendation: ${result.recommendation}

Financial Metrics:
- P/E Ratio: ${result.ratios.pe.toFixed(2)} (Industry Avg: ${inputData.industryAvgPE.toFixed(2)})
- P/BV Ratio: ${result.ratios.pbv.toFixed(2)}
- ROE: ${result.ratios.roe.toFixed(2)}%
- EPS Growth: ${inputData.epsGrowth.toFixed(2)}%
- Debt/Equity: ${result.ratios.debtToEquity.toFixed(2)}
- Dividend Yield: ${result.ratios.dividendYield.toFixed(2)}%

Strengths: ${result.strengths.join(", ")}
Concerns: ${result.concerns.join(", ")}

Question: ${question}

Provide a clear, concise answer in 2-3 paragraphs.`;

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
          max_tokens: 500,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setAnswer(`Error: ${data.error.message}`);
      } else {
        setAnswer(data.choices[0].message.content);
      }
    } catch (error) {
      setAnswer(`Error: ${error instanceof Error ? error.message : "Failed to connect to OpenAI"}`);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Why is this stock undervalued/overvalued?",
    "What are the main risks?",
    "Should I buy this stock now?",
    "How does this compare to industry peers?",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Insights
        </CardTitle>
        <CardDescription>Ask ChatGPT about this stock analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!localStorage.getItem("openai_api_key") && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button onClick={saveApiKey} variant="outline">Save</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">OpenAI</a>
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Quick Questions</Label>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => setQuestion(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question">Your Question</Label>
          <Textarea
            id="question"
            placeholder="Ask anything about this stock analysis..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={askAI} disabled={loading || !question} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Ask AI
            </>
          )}
        </Button>

        {answer && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-sm whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
