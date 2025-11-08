import { useState } from "react";
import { type StockAnalysis, type AnalysisResult } from "@shared/schema";
import Header from "@/components/Header";
import StockInputForm from "@/components/StockInputForm";
import ScoreCard from "@/components/ScoreCard";
import MetricsGrid from "@/components/MetricsGrid";
import RatioTable from "@/components/RatioTable";
import DetailedBreakdown from "@/components/DetailedBreakdown";
import ScoreBreakdownChart from "@/components/ScoreBreakdownChart";
import RatioComparisonChart from "@/components/RatioComparisonChart";
import WeightDistributionChart from "@/components/WeightDistributionChart";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const calculateAnalysis = (data: StockAnalysis): AnalysisResult => {
    const peScore = data.peRatio < data.industryAvgPE ? 5 : data.peRatio < data.industryAvgPE * 1.2 ? 4 : data.peRatio < data.industryAvgPE * 1.5 ? 3 : data.peRatio < data.industryAvgPE * 2 ? 2 : 1;
    
    const pbvScore = data.pbvRatio < 1 ? 5 : data.pbvRatio < 1.5 ? 4 : data.pbvRatio < 2 ? 3 : data.pbvRatio < 2.5 ? 2 : 1;
    
    const roeScore = data.roe > 20 ? 5 : data.roe > 15 ? 4 : data.roe > 10 ? 3 : data.roe > 5 ? 2 : 1;
    
    const epsGrowthScore = data.epsGrowth > 20 ? 5 : data.epsGrowth > 15 ? 4 : data.epsGrowth > 10 ? 3 : data.epsGrowth > 5 ? 2 : 1;
    
    const debtToEquity = data.debt / (data.revenue * 0.2);
    const debtScore = debtToEquity < 0.3 ? 5 : debtToEquity < 0.5 ? 4 : debtToEquity < 0.7 ? 3 : debtToEquity < 1 ? 2 : 1;
    
    const cashFlowScore = data.cashFlow > 0 ? (data.cashFlow > data.netProfit ? 5 : 4) : 2;
    
    const dividendScore = data.dividendYield > 5 ? 5 : data.dividendYield > 4 ? 4 : data.dividendYield > 3 ? 3 : data.dividendYield > 2 ? 2 : 1;

    const weights = {
      peVsIndustry: 0.20,
      pbvVsBook: 0.15,
      roeScore: 0.15,
      epsGrowthScore: 0.20,
      debtScore: 0.10,
      cashFlowScore: 0.10,
      dividendScore: 0.10,
    };

    const overallScore = 
      peScore * weights.peVsIndustry +
      pbvScore * weights.pbvVsBook +
      roeScore * weights.roeScore +
      epsGrowthScore * weights.epsGrowthScore +
      debtScore * weights.debtScore +
      cashFlowScore * weights.cashFlowScore +
      dividendScore * weights.dividendScore;

    let verdict: "Undervalued" | "Fairly Valued" | "Overvalued";
    let recommendation: "Strong Buy" | "Buy" | "Hold" | "Avoid" | "Sell";

    // Methodology from PDF: 
    // 4.0+ → Undervalued / Strong buy
    // 3.0–3.9 → Fairly valued / Hold
    // <3.0 → Overvalued / Risky buy (Avoid/Sell)
    if (overallScore >= 4.0) {
      verdict = "Undervalued";
      recommendation = "Strong Buy";
    } else if (overallScore >= 3.0) {
      verdict = "Fairly Valued";
      recommendation = "Hold";
    } else if (overallScore >= 2.0) {
      verdict = "Overvalued";
      recommendation = "Avoid";
    } else {
      verdict = "Overvalued";
      recommendation = "Sell";
    }

    const strengths: string[] = [];
    const concerns: string[] = [];

    if (peScore >= 4) strengths.push("P/E ratio is attractive compared to industry");
    else if (peScore <= 2) concerns.push(`P/E ratio significantly higher than industry average (${data.peRatio.toFixed(1)}× vs ${data.industryAvgPE.toFixed(1)}×)`);

    if (roeScore >= 4) strengths.push(`Strong ROE of ${data.roe.toFixed(1)}% indicates excellent profitability`);
    else if (roeScore <= 2) concerns.push(`Low ROE of ${data.roe.toFixed(1)}% suggests poor profitability`);

    if (epsGrowthScore >= 4) strengths.push(`Impressive EPS growth of ${data.epsGrowth.toFixed(1)}%`);
    else if (epsGrowthScore <= 2) concerns.push("Weak earnings growth trajectory");

    if (debtScore >= 4) strengths.push("Moderate debt-to-equity ratio indicates financial stability");
    else if (debtScore <= 2) concerns.push("High debt levels pose financial risk");

    if (cashFlowScore >= 4) strengths.push("Positive cash flow generation");
    else if (cashFlowScore <= 2) concerns.push("Negative or weak cash flow");

    if (dividendScore <= 2) concerns.push(`Weak dividend yield at ${data.dividendYield.toFixed(1)}%`);
    else if (dividendScore >= 4) strengths.push(`Attractive dividend yield of ${data.dividendYield.toFixed(1)}%`);

    if (data.pegRatio > 2) concerns.push("High PEG ratio indicates overpricing relative to growth");
    else if (data.pegRatio < 1) strengths.push("Low PEG ratio suggests undervaluation");

    const peVsIndustry = ((data.peRatio - data.industryAvgPE) / data.industryAvgPE) * 100;
    const pbvVsIndustry = ((data.pbvRatio - data.industryAvgPBV) / data.industryAvgPBV) * 100;
    const roeVsIndustry = ((data.roe - data.industryAvgROE) / data.industryAvgROE) * 100;

    return {
      stockName: data.stockName,
      tickerSymbol: data.tickerSymbol,
      overallScore,
      verdict,
      recommendation,
      scores: {
        peVsIndustry: peScore,
        pbvVsBook: pbvScore,
        roeScore,
        epsGrowthScore,
        debtScore,
        cashFlowScore,
        dividendScore,
      },
      weights,
      ratios: {
        pe: data.peRatio,
        pbv: data.pbvRatio,
        roe: data.roe,
        peg: data.pegRatio,
        evEbitda: data.evEbitda,
        dividendYield: data.dividendYield,
        debtToEquity,
      },
      comparisons: {
        peVsIndustry,
        pbvVsIndustry,
        roeVsIndustry,
      },
      strengths,
      concerns,
    };
  };

  const handleAnalyze = (data: StockAnalysis) => {
    const result = calculateAnalysis(data);
    setAnalysisResult(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!analysisResult ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Professional Stock Valuation</h2>
              <p className="text-muted-foreground">
                Analyze stocks using fundamental ratios and comprehensive scoring methodology
              </p>
            </div>
            <StockInputForm onAnalyze={handleAnalyze} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{analysisResult.stockName}</h2>
                <p className="text-muted-foreground font-mono">{analysisResult.tickerSymbol}</p>
              </div>
              <button
                onClick={() => setAnalysisResult(null)}
                className="text-sm text-primary hover:underline"
                data-testid="button-new-analysis"
              >
                New Analysis
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <MetricsGrid result={analysisResult} />
                <RatioTable 
                  result={analysisResult} 
                  industryData={{
                    avgPE: 12,
                    avgPBV: 1.0,
                    avgROE: 10,
                  }}
                />
                <DetailedBreakdown result={analysisResult} />
              </div>
              
              <div className="lg:col-span-1">
                <ScoreCard result={analysisResult} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <ScoreBreakdownChart result={analysisResult} />
              <RatioComparisonChart 
                result={analysisResult} 
                industryData={{
                  avgPE: 12,
                  avgPBV: 1.0,
                  avgROE: 10,
                }}
              />
            </div>

            <div className="mt-8">
              <WeightDistributionChart result={analysisResult} />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Stock Valuation Analyzer - For informational purposes only. Not financial advice.
        </div>
      </footer>
    </div>
  );
}
