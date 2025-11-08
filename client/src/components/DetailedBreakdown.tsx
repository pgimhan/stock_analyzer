import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult } from "@shared/schema";

interface DetailedBreakdownProps {
  result: AnalysisResult;
}

export default function DetailedBreakdown({ result }: DetailedBreakdownProps) {
  const factors = [
    { name: "P/E vs Industry", score: result.scores.peVsIndustry, weight: result.weights.peVsIndustry },
    { name: "P/BV vs Book Value", score: result.scores.pbvVsBook, weight: result.weights.pbvVsBook },
    { name: "ROE", score: result.scores.roeScore, weight: result.weights.roeScore },
    { name: "EPS Growth", score: result.scores.epsGrowthScore, weight: result.weights.epsGrowthScore },
    { name: "Debt Level", score: result.scores.debtScore, weight: result.weights.debtScore },
    { name: "Cash Flow", score: result.scores.cashFlowScore, weight: result.weights.cashFlowScore },
    { name: "Dividend Yield", score: result.scores.dividendScore, weight: result.weights.dividendScore },
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
                
                return (
                  <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 items-center">
                    <div className="col-span-4 font-medium text-sm">{factor.name}</div>
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
