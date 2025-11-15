import { useState, useEffect } from "react";
import { type StockAnalysis, type AnalysisResult } from "@shared/schema";
import { saveAnalysisToDb, getAnalysesFromDb, deleteAnalysisFromDb } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import StockInputForm from "@/components/StockInputForm";
import { Button } from "@/components/ui/button";
import { History, Plus, ArrowLeft, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReportGenerator from "@/components/ReportGenerator";
import ScoreCard from "@/components/ScoreCard";
import MetricsGrid from "@/components/MetricsGrid";
import RatioTable from "@/components/RatioTable";
import DetailedBreakdown from "@/components/DetailedBreakdown";
import ScoreBreakdownChart from "@/components/ScoreBreakdownChart";
import RatioComparisonChart from "@/components/RatioComparisonChart";
import WeightDistributionChart from "@/components/WeightDistributionChart";
import AIInsights from "@/components/AIInsights";
import RiskAssessment from "@/components/RiskAssessment";
import AIValuation from "@/components/AIValuation";


export default function Home() {
  const { user } = useAuth();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingData, setEditingData] = useState<StockAnalysis | null>(null);

  useEffect(() => {
    if (user?.id) {
      getAnalysesFromDb(user.id).then(setSavedAnalyses).catch(console.error);
    }
  }, [user?.id]);

  const calculateAnalysis = (data: StockAnalysis): AnalysisResult => {
    console.log('=== STOCK ANALYSIS CALCULATION START ===');
    console.log('Input Data:', data);
    
    // Calculate ratios from raw data
    const roe = data.roe;
    console.log(`ROE (User Input): ${roe.toFixed(2)}%`);
    
    const roa = (data.netProfit / data.totalAssets) * 100;
    
    const profitMargin = (data.netProfit / data.revenue) * 100;
    console.log(`Profit Margin: (${data.netProfit} / ${data.revenue}) * 100 = ${profitMargin.toFixed(2)}%`);
    
    // Calculate PEG ratio from raw data (P/E / EPS Growth)
    // Note: Negative or zero growth makes PEG ratio invalid/meaningless
    const calculatedPegRatio = data.epsGrowth !== 0 ? data.peRatio / data.epsGrowth : null;
    console.log(`PEG Ratio: ${calculatedPegRatio === null ? 'N/A (zero growth)' : calculatedPegRatio.toFixed(2)} (P/E: ${data.peRatio} / EPS Growth: ${data.epsGrowth}%)`);
    
    const peScore = data.peRatio < data.industryAvgPE ? 5 : data.peRatio < data.industryAvgPE * 1.2 ? 4 : data.peRatio < data.industryAvgPE * 1.5 ? 3 : data.peRatio < data.industryAvgPE * 2 ? 2 : 1;
    console.log(`P/E Score: ${peScore} (P/E: ${data.peRatio} vs Industry: ${data.industryAvgPE})`);
    
    const pbvScore = data.pbvRatio < 1 ? 5 : data.pbvRatio < 1.5 ? 4 : data.pbvRatio < 2 ? 3 : data.pbvRatio < 2.5 ? 2 : 1;
    console.log(`P/BV Score: ${pbvScore} (P/BV: ${data.pbvRatio})`);
    
    const roeScore = roe > 20 ? 5 : roe > 15 ? 4 : roe > 10 ? 3 : roe > 5 ? 2 : 1;
    console.log(`ROE Score: ${roeScore} (ROE: ${roe.toFixed(2)}%)`);
    
    const epsGrowthScore = data.epsGrowth > 20 ? 5 : data.epsGrowth > 15 ? 4 : data.epsGrowth > 10 ? 3 : data.epsGrowth > 5 ? 2 : 1;
    console.log(`EPS Growth Score: ${epsGrowthScore} (Growth: ${data.epsGrowth}%)`);
    
    const debtToEquity = data.debt / data.equity;
    console.log(`Debt-to-Equity: ${data.debt} / ${data.equity} = ${debtToEquity.toFixed(2)}`);
    
    const debtScore = debtToEquity < 0.3 ? 5 : debtToEquity < 0.5 ? 4 : debtToEquity < 0.7 ? 3 : debtToEquity < 1 ? 2 : 1;
    console.log(`Debt Score: ${debtScore} (D/E: ${debtToEquity.toFixed(2)})`);
    
    const cashFlowScore = data.cashFlow > 0 ? (data.cashFlow > data.netProfit ? 5 : 4) : 2;
    console.log(`Cash Flow Score: ${cashFlowScore} (CF: ${data.cashFlow} vs NP: ${data.netProfit})`);
    
    const dividendScore = data.dividendYield > 5 ? 5 : data.dividendYield > 4 ? 4 : data.dividendYield > 3 ? 3 : data.dividendYield > 2 ? 2 : 1;
    console.log(`Dividend Score: ${dividendScore} (Yield: ${data.dividendYield}%)`);

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
    
    console.log('\n=== WEIGHTED SCORE CALCULATION ===');
    console.log(`P/E: ${peScore} × ${weights.peVsIndustry} = ${(peScore * weights.peVsIndustry).toFixed(2)}`);
    console.log(`P/BV: ${pbvScore} × ${weights.pbvVsBook} = ${(pbvScore * weights.pbvVsBook).toFixed(2)}`);
    console.log(`ROE: ${roeScore} × ${weights.roeScore} = ${(roeScore * weights.roeScore).toFixed(2)}`);
    console.log(`EPS Growth: ${epsGrowthScore} × ${weights.epsGrowthScore} = ${(epsGrowthScore * weights.epsGrowthScore).toFixed(2)}`);
    console.log(`Debt: ${debtScore} × ${weights.debtScore} = ${(debtScore * weights.debtScore).toFixed(2)}`);
    console.log(`Cash Flow: ${cashFlowScore} × ${weights.cashFlowScore} = ${(cashFlowScore * weights.cashFlowScore).toFixed(2)}`);
    console.log(`Dividend: ${dividendScore} × ${weights.dividendScore} = ${(dividendScore * weights.dividendScore).toFixed(2)}`);
    console.log(`Overall Score: ${overallScore.toFixed(2)} / 5.0`);

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

    if (roeScore >= 4) strengths.push(`Strong ROE of ${roe.toFixed(1)}% indicates excellent profitability`);
    else if (roeScore <= 2) concerns.push(`Low ROE of ${roe.toFixed(1)}% suggests poor profitability`);

    if (epsGrowthScore >= 4) strengths.push(`Impressive EPS growth of ${data.epsGrowth.toFixed(1)}%`);
    else if (epsGrowthScore <= 2) concerns.push("Weak earnings growth trajectory");

    if (debtScore >= 4) strengths.push("Moderate debt-to-equity ratio indicates financial stability");
    else if (debtScore <= 2) concerns.push("High debt levels pose financial risk");

    if (cashFlowScore >= 4) strengths.push("Positive cash flow generation");
    else if (cashFlowScore <= 2) concerns.push("Negative or weak cash flow");

    if (dividendScore <= 2) concerns.push(`Weak dividend yield at ${data.dividendYield.toFixed(1)}%`);
    else if (dividendScore >= 4) strengths.push(`Attractive dividend yield of ${data.dividendYield.toFixed(1)}%`);

    if (calculatedPegRatio !== null) {
      if (calculatedPegRatio > 0 && calculatedPegRatio < 1) {
        strengths.push("Low PEG ratio suggests undervaluation");
      } else if (calculatedPegRatio > 2) {
        concerns.push("High PEG ratio indicates overpricing relative to growth");
      } else if (calculatedPegRatio < 0) {
        concerns.push("Negative earnings growth makes valuation challenging");
      }
    }

    const peVsIndustry = ((data.peRatio - data.industryAvgPE) / data.industryAvgPE) * 100;
    const pbvVsIndustry = ((data.pbvRatio - data.industryAvgPBV) / data.industryAvgPBV) * 100;
    const roeVsIndustry = ((roe - data.industryAvgROE) / data.industryAvgROE) * 100;
    
    console.log('\n=== INDUSTRY COMPARISONS ===');
    console.log(`P/E vs Industry: ${peVsIndustry.toFixed(2)}%`);
    console.log(`P/BV vs Industry: ${pbvVsIndustry.toFixed(2)}%`);
    console.log(`ROE vs Industry: ${roeVsIndustry.toFixed(2)}%`);
    console.log(`\nVerdict: ${verdict}`);
    console.log(`Recommendation: ${recommendation}`);
    console.log('=== CALCULATION END ===\n');

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
        roe,
        peg: calculatedPegRatio,
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

  const [inputData, setInputData] = useState<StockAnalysis | null>(null);

  const handleAnalyze = async (data: StockAnalysis) => {
    const result = calculateAnalysis(data);
    setAnalysisResult(result);
    setInputData(data);
    
    if (user?.id) {
      await saveAnalysisToDb(user.id, data.stockName, data.tickerSymbol, data, result);
      const updated = await getAnalysesFromDb(user.id);
      setSavedAnalyses(updated);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadSavedAnalysis = (analysis: any) => {
    setAnalysisResult(analysis.result);
    setInputData(analysis.inputData);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    await deleteAnalysisFromDb(id);
    if (user?.id) {
      const updated = await getAnalysesFromDb(user.id);
      setSavedAnalyses(updated);
    }
  };

  const handleEdit = (analysis: any) => {
    setEditingData(analysis.inputData);
    setAnalysisResult(null);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {showHistory ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Saved Analyses</h2>
              <Button variant="outline" size="sm" onClick={() => setShowHistory(false)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            {savedAnalyses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No saved analyses yet</p>
            ) : (
              <div className="space-y-3">
                {savedAnalyses.map((analysis) => (
                  <div key={analysis.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors flex items-center justify-between gap-4">
                    <div onClick={() => loadSavedAnalysis(analysis)} className="flex-1 cursor-pointer">
                      <div className="font-semibold">{analysis.inputData.stockName}</div>
                      <div className="text-sm text-muted-foreground">
                        {analysis.inputData.tickerSymbol} • {new Date(analysis.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-sm mt-1">
                        Score: <span className="font-semibold">{analysis.result.overallScore.toFixed(2)}</span> • {analysis.result.recommendation}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(analysis); }} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(analysis.id); }} className="text-destructive hover:text-destructive" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !analysisResult ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Professional Stock Valuation</h2>
              <p className="text-muted-foreground">
                Analyze stocks using fundamental ratios and comprehensive scoring methodology
              </p>
              {savedAnalyses.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="mt-4 gap-2">
                  <History className="h-4 w-4" />
                  View {savedAnalyses.length} saved analysis{savedAnalyses.length !== 1 ? 'es' : ''}
                </Button>
              )}
            </div>
            <StockInputForm onAnalyze={handleAnalyze} initialData={editingData} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{analysisResult.stockName}</h2>
                <p className="text-muted-foreground font-mono">{analysisResult.tickerSymbol}</p>
              </div>
              <div className="flex gap-2">
                <ReportGenerator result={analysisResult} inputData={inputData!} />
                <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="gap-2">
                  <History className="h-4 w-4" />
                  History
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setAnalysisResult(null)}
                  className="gap-2"
                  data-testid="button-new-analysis"
                >
                  <Plus className="h-4 w-4" />
                  New Analysis
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <MetricsGrid result={analysisResult} />
                <RatioTable 
                  result={analysisResult} 
                  industryData={{
                    avgPE: inputData!.industryAvgPE,
                    avgPBV: inputData!.industryAvgPBV,
                    avgROE: inputData!.industryAvgROE,
                  }}
                />
                <DetailedBreakdown result={analysisResult} inputData={inputData} />
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
                  avgPE: inputData!.industryAvgPE,
                  avgPBV: inputData!.industryAvgPBV,
                  avgROE: inputData!.industryAvgROE,
                }}
              />
            </div>

            <div className="space-y-8 mt-8">
              <AIValuation result={analysisResult} inputData={inputData!} />
              <WeightDistributionChart result={analysisResult} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RiskAssessment result={analysisResult} inputData={inputData!} />
                <AIInsights result={analysisResult} inputData={inputData!} />
              </div>
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
