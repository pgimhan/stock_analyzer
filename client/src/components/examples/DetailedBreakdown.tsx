import DetailedBreakdown from '../DetailedBreakdown';

export default function DetailedBreakdownExample() {
  const mockResult = {
    stockName: "John Keells Holdings",
    tickerSymbol: "JKH",
    overallScore: 2.45,
    verdict: "Overvalued" as const,
    recommendation: "Avoid" as const,
    scores: {
      peVsIndustry: 1.5,
      pbvVsBook: 3.0,
      roeScore: 2.0,
      epsGrowthScore: 3.0,
      debtScore: 3.5,
      cashFlowScore: 2.5,
      dividendScore: 2.0,
    },
    weights: {
      peVsIndustry: 0.20,
      pbvVsBook: 0.15,
      roeScore: 0.15,
      epsGrowthScore: 0.20,
      debtScore: 0.10,
      cashFlowScore: 0.10,
      dividendScore: 0.10,
    },
    ratios: {
      pe: 65,
      pbv: 1.8,
      roe: 5,
      peg: 6.5,
      evEbitda: 15.2,
      dividendYield: 2,
      debtToEquity: 0.45,
    },
    comparisons: {
      peVsIndustry: 441.67,
      pbvVsIndustry: 80,
      roeVsIndustry: -50,
    },
    strengths: [],
    concerns: [],
  };

  return <DetailedBreakdown result={mockResult} />;
}
