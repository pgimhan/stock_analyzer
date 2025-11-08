import { z } from "zod";

export const stockAnalysisSchema = z.object({
  stockName: z.string().min(1, "Stock name is required"),
  tickerSymbol: z.string().min(1, "Ticker symbol is required"),
  sharePrice: z.number().positive("Share price must be positive"),
  epsTTM: z.number(),
  epsForward: z.number(),
  revenue: z.number().positive("Revenue must be positive"),
  netProfit: z.number(),
  roe: z.number(),
  roa: z.number(),
  debt: z.number().nonnegative("Debt cannot be negative"),
  cashFlow: z.number(),
  peRatio: z.number().positive("P/E ratio must be positive"),
  pbvRatio: z.number().positive("P/BV ratio must be positive"),
  dividendYield: z.number().nonnegative("Dividend yield cannot be negative"),
  pegRatio: z.number().positive("PEG ratio must be positive"),
  evEbitda: z.number().positive("EV/EBITDA must be positive"),
  revenueGrowth: z.number(),
  epsGrowth: z.number(),
  profitMargin: z.number(),
  industryAvgPE: z.number().positive("Industry avg P/E must be positive"),
  industryAvgPBV: z.number().positive("Industry avg P/BV must be positive"),
  industryAvgROE: z.number(),
  marketIndexPE: z.number().positive("Market index P/E must be positive").optional(),
});

export type StockAnalysis = z.infer<typeof stockAnalysisSchema>;

export interface AnalysisResult {
  stockName: string;
  tickerSymbol: string;
  overallScore: number;
  verdict: "Undervalued" | "Fairly Valued" | "Overvalued";
  recommendation: "Strong Buy" | "Buy" | "Hold" | "Avoid" | "Sell";
  scores: {
    peVsIndustry: number;
    pbvVsBook: number;
    roeScore: number;
    epsGrowthScore: number;
    debtScore: number;
    cashFlowScore: number;
    dividendScore: number;
  };
  weights: {
    peVsIndustry: number;
    pbvVsBook: number;
    roeScore: number;
    epsGrowthScore: number;
    debtScore: number;
    cashFlowScore: number;
    dividendScore: number;
  };
  ratios: {
    pe: number;
    pbv: number;
    roe: number;
    peg: number;
    evEbitda: number;
    dividendYield: number;
    debtToEquity: number;
  };
  comparisons: {
    peVsIndustry: number;
    pbvVsIndustry: number;
    roeVsIndustry: number;
  };
  strengths: string[];
  concerns: string[];
}
