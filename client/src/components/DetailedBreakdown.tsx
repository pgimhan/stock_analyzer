import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import type { AnalysisResult } from "@shared/schema";
import { useState, useEffect } from "react";

interface DetailedBreakdownProps {
  result: AnalysisResult;
  inputData?: any;
}

interface QualitativeFactor {
  title: string;
  points: string[];
  analysis?: string;
}

export default function DetailedBreakdown({ result, inputData }: DetailedBreakdownProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem("openai_api_key") || "");
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [qualitativeFactors, setQualitativeFactors] = useState<QualitativeFactor[]>([]);

  useEffect(() => {
    if (apiKey) {
      generateQualitativeFactors();
    }
  }, [result.stockName, apiKey]);

  useEffect(() => {
    const handleStorageChange = () => {
      setApiKey(localStorage.getItem("openai_api_key") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const generateQualitativeFactors = async () => {
    if (!apiKey) return;
    setLoading(true);

    try {
      const prompt = "As a financial analyst, provide qualitative investment factors for " + result.stockName + " (" + result.tickerSymbol + "). Generate 4-5 key factors with 3-4 bullet points each covering: management quality, competitive position, business model, innovation, and macroeconomic environment. Return ONLY a JSON array: [{\"title\": \"Factor Title\", \"points\": [\"Point 1\", \"Point 2\"]}]. Make points specific and investor-focused.";

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const data = await response.json();
      if (!data.error && data.choices?.[0]?.message?.content) {
        const content = data.choices[0].message.content.trim();
        const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const factors = JSON.parse(jsonMatch[0]);
          setQualitativeFactors(factors);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateDetailedAnalysis = async () => {
    if (!apiKey || qualitativeFactors.length === 0) return;
    setLoading(true);

    try {
      const updatedFactors = await Promise.all(
        qualitativeFactors.map(async (factor) => {
          const prompt = "Provide detailed analysis (2-3 paragraphs) for " + result.stockName + " (" + result.tickerSymbol + ") on: " + factor.title + ". Points: " + factor.points.join(", ") + ". Context: Score " + result.overallScore.toFixed(2) + ", " + result.recommendation + ". Professional tone, no headers.";

          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + apiKey,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 500,
            }),
          });

          const data = await response.json();
          return { ...factor, analysis: data.error ? "Error: " + data.error.message : data.choices[0].message.content };
        })
      );

      setQualitativeFactors(updatedFactors);
      setExpandedSections(new Set(updatedFactors.map(f => f.title)));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const hasAnalysis = qualitativeFactors.some(f => f.analysis);

  const factors = [
    { 
      name: "P/E vs Industry", 
      score: result.scores.peVsIndustry, 
      weight: result.weights.peVsIndustry,
      calculation: inputData ? "P/E Ratio: " + inputData.peRatio.toFixed(2) + " vs Industry Avg: " + inputData.industryAvgPE.toFixed(2) : null,
      logic: "Score 5: P/E < Industry Avg | Score 4: P/E < 1.2× Industry | Score 3: P/E < 1.5× Industry | Score 2: P/E < 2× Industry | Score 1: P/E ≥ 2× Industry"
    },
    { 
      name: "P/BV vs Book Value", 
      score: result.scores.pbvVsBook, 
      weight: result.weights.pbvVsBook,
      calculation: inputData ? "P/BV Ratio: " + inputData.pbvRatio.toFixed(2) : null,
      logic: "Score 5: P/BV < 1 | Score 4: P/BV < 1.5 | Score 3: P/BV < 2 | Score 2: P/BV < 2.5 | Score 1: P/BV ≥ 2.5"
    },
    { 
      name: "ROE", 
      score: result.scores.roeScore, 
      weight: result.weights.roeScore,
      calculation: inputData ? "ROE: " + result.ratios.roe.toFixed(2) + "% vs Industry Avg: " + inputData.industryAvgROE.toFixed(2) + "%" : null,
      logic: "Score 5: ROE > 20% | Score 4: ROE > 15% | Score 3: ROE > 10% | Score 2: ROE > 5% | Score 1: ROE ≤ 5%"
    },
    { 
      name: "EPS Growth", 
      score: result.scores.epsGrowthScore, 
      weight: result.weights.epsGrowthScore,
      calculation: inputData ? "EPS Growth: " + inputData.epsGrowth.toFixed(2) + "%" : null,
      logic: "Score 5: Growth > 20% | Score 4: Growth > 15% | Score 3: Growth > 10% | Score 2: Growth > 5% | Score 1: Growth ≤ 5%"
    },
    { 
      name: "Debt Level", 
      score: result.scores.debtScore, 
      weight: result.weights.debtScore,
      calculation: inputData ? "Debt/Equity: " + result.ratios.debtToEquity.toFixed(2) : null,
      logic: "Score 5: D/E < 0.3 | Score 4: D/E < 0.5 | Score 3: D/E < 0.7 | Score 2: D/E < 1 | Score 1: D/E ≥ 1"
    },
    { 
      name: "Cash Flow", 
      score: result.scores.cashFlowScore, 
      weight: result.weights.cashFlowScore,
      calculation: inputData ? "Cash Flow: " + inputData.cashFlow.toFixed(2) + " vs Net Profit: " + inputData.netProfit.toFixed(2) : null,
      logic: "Score 5: Positive & > Net Profit | Score 4: Positive | Score 2: Negative"
    },
    { 
      name: "Dividend Yield", 
      score: result.scores.dividendScore, 
      weight: result.weights.dividendScore,
      calculation: inputData ? "Dividend Yield: " + inputData.dividendYield.toFixed(2) + "%" : null,
      logic: "Score 5: Yield > 5% | Score 4: Yield > 4% | Score 3: Yield > 3% | Score 2: Yield > 2% | Score 1: Yield ≤ 2%"
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Analysis Breakdown</CardTitle>
        <CardDescription>Comprehensive evaluation of all valuation factors</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quantitative" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quantitative" data-testid="tab-quantitative">Quantitative Analysis</TabsTrigger>
            <TabsTrigger value="qualitative" data-testid="tab-qualitative">Qualitative Factors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quantitative" className="space-y-4 mt-6">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                <div className="col-span-4">Factor</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Weight</div>
                <div className="col-span-4 text-center">Contribution</div>
              </div>
              {factors.map((factor, index) => {
                const contribution = factor.score * factor.weight;
                const scorePercentage = (factor.score / 5) * 100;
                const isOpen = openItems.includes(index);
                
                return (
                  <Collapsible key={index} open={isOpen} onOpenChange={() => toggleItem(index)}>
                    <div className="border-b last:border-b-0">
                      <CollapsibleTrigger className="w-full hover:bg-muted/50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 p-4 items-center">
                          <div className="col-span-4 font-medium text-sm flex items-center gap-2">
                            <ChevronDown className={"h-4 w-4 transition-transform " + (isOpen ? "rotate-180" : "")} />
                            {factor.name}
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="text-lg font-semibold tabular-nums" data-testid={"text-score-" + index}>
                              {factor.score.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">/ 5.0</div>
                          </div>
                          <div className="col-span-2 text-center text-sm text-muted-foreground tabular-nums">
                            {(factor.weight * 100).toFixed(0)}%
                          </div>
                          <div className="col-span-4 space-y-2">
                            <Progress value={scorePercentage} className="h-2" />
                            <div className="text-xs text-center text-muted-foreground tabular-nums">
                              {contribution.toFixed(2)} points
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-2 bg-muted/30 space-y-2 text-sm">
                          {factor.calculation && (
                            <div>
                              <span className="font-medium">Input Values: </span>
                              <span className="text-muted-foreground">{factor.calculation}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Scoring Logic: </span>
                            <span className="text-muted-foreground">{factor.logic}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
              <span className="font-semibold">Total Weighted Score</span>
              <span className="text-2xl font-bold tabular-nums">{result.overallScore.toFixed(2)} / 5.0</span>
            </div>
          </TabsContent>
          
          <TabsContent value="qualitative" className="space-y-6 mt-6">
            {!apiKey ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Please set your OpenAI API key in the AI Insights section to generate qualitative analysis.</p>
              </div>
            ) : loading && qualitativeFactors.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
                <p className="text-muted-foreground">Generating qualitative factors...</p>
              </div>
            ) : qualitativeFactors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Unable to generate qualitative factors. Please try again.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {!hasAnalysis && (
                  <div className="flex justify-end">
                    <Button onClick={generateDetailedAnalysis} disabled={loading} size="sm">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Detailed Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {hasAnalysis && (
                  <div className="flex justify-end">
                    <Button onClick={generateDetailedAnalysis} disabled={loading} size="sm" variant="outline">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Regenerate
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {qualitativeFactors.map((factor) => (
                  <div key={factor.title} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(factor.title)}
                      className="w-full px-4 py-3 bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <div className="text-left">
                        <h3 className="font-semibold">{factor.title}</h3>
                        <div className="text-xs text-muted-foreground mt-1">
                          {factor.points.map((point, i) => (
                            <span key={i}>
                              {i > 0 && " • "}
                              {point}
                            </span>
                          ))}
                        </div>
                      </div>
                      {expandedSections.has(factor.title) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {expandedSections.has(factor.title) && factor.analysis && (
                      <div className="p-4 bg-background">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{factor.analysis}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
