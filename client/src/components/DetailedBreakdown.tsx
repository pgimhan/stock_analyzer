import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { AnalysisResult } from "@shared/schema";
import { useState } from "react";

interface DetailedBreakdownProps {
  result: AnalysisResult;
  inputData?: any;
}

export default function DetailedBreakdown({ result, inputData }: DetailedBreakdownProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const factors = [
    { 
      name: "P/E vs Industry", 
      score: result.scores.peVsIndustry, 
      weight: result.weights.peVsIndustry,
      calculation: inputData ? `P/E Ratio: ${inputData.peRatio.toFixed(2)} vs Industry Avg: ${inputData.industryAvgPE.toFixed(2)}` : null,
      logic: `Score 5: P/E < Industry Avg | Score 4: P/E < 1.2× Industry | Score 3: P/E < 1.5× Industry | Score 2: P/E < 2× Industry | Score 1: P/E ≥ 2× Industry`
    },
    { 
      name: "P/BV vs Book Value", 
      score: result.scores.pbvVsBook, 
      weight: result.weights.pbvVsBook,
      calculation: inputData ? `P/BV Ratio: ${inputData.pbvRatio.toFixed(2)}` : null,
      logic: `Score 5: P/BV < 1 | Score 4: P/BV < 1.5 | Score 3: P/BV < 2 | Score 2: P/BV < 2.5 | Score 1: P/BV ≥ 2.5`
    },
    { 
      name: "ROE", 
      score: result.scores.roeScore, 
      weight: result.weights.roeScore,
      calculation: inputData ? `ROE: ${inputData.roe.toFixed(2)}%` : null,
      logic: `Score 5: ROE > 20% | Score 4: ROE > 15% | Score 3: ROE > 10% | Score 2: ROE > 5% | Score 1: ROE ≤ 5%`
    },
    { 
      name: "EPS Growth", 
      score: result.scores.epsGrowthScore, 
      weight: result.weights.epsGrowthScore,
      calculation: inputData ? `EPS Growth: ${inputData.epsGrowth.toFixed(2)}%` : null,
      logic: `Score 5: Growth > 20% | Score 4: Growth > 15% | Score 3: Growth > 10% | Score 2: Growth > 5% | Score 1: Growth ≤ 5%`
    },
    { 
      name: "Debt Level", 
      score: result.scores.debtScore, 
      weight: result.weights.debtScore,
      calculation: inputData ? `Debt/Equity: ${result.ratios.debtToEquity.toFixed(2)}` : null,
      logic: `Score 5: D/E < 0.3 | Score 4: D/E < 0.5 | Score 3: D/E < 0.7 | Score 2: D/E < 1 | Score 1: D/E ≥ 1`
    },
    { 
      name: "Cash Flow", 
      score: result.scores.cashFlowScore, 
      weight: result.weights.cashFlowScore,
      calculation: inputData ? `Cash Flow: ${inputData.cashFlow.toFixed(2)} vs Net Profit: ${inputData.netProfit.toFixed(2)}` : null,
      logic: `Score 5: Positive & > Net Profit | Score 4: Positive | Score 2: Negative`
    },
    { 
      name: "Dividend Yield", 
      score: result.scores.dividendScore, 
      weight: result.weights.dividendScore,
      calculation: inputData ? `Dividend Yield: ${inputData.dividendYield.toFixed(2)}%` : null,
      logic: `Score 5: Yield > 5% | Score 4: Yield > 4% | Score 3: Yield > 3% | Score 2: Yield > 2% | Score 1: Yield ≤ 2%`
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
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            {factor.name}
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="text-lg font-semibold tabular-nums" data-testid={`text-score-${index}`}>
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
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3">Management Quality</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" data-testid="checkbox-management-quality" />
                    <label>Proven leadership with transparent reporting</label>
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" data-testid="checkbox-corporate-governance" />
                    <label>Strong corporate governance practices</label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Brand & Market Position</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" data-testid="checkbox-market-share" />
                    <label>Strong market share in key segments</label>
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" data-testid="checkbox-brand-reputation" />
                    <label>Growing brand reputation and customer loyalty</label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Innovation & Diversification</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" data-testid="checkbox-new-projects" />
                    <label>Active new projects and technology upgrades</label>
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" data-testid="checkbox-export-growth" />
                    <label>Export market expansion and diversification</label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Economic Context</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" data-testid="checkbox-sector-recovery" />
                    <label>Sector recovery and favorable interest rates</label>
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" data-testid="checkbox-policy-environment" />
                    <label>Stable policy environment and low regulatory risk</label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
