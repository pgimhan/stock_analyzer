import { z } from "zod";

export const extractedFinancialDataSchema = z.object({
  companyName: z.string().optional(),
  tickerSymbol: z.string().optional(),
  reportPeriod: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  sharePrice: z.number().optional(),
  
  // Balance Sheet
  totalAssets: z.number().optional(),
  totalLiabilities: z.number().optional(),
  totalEquity: z.number().optional(),
  currentAssets: z.number().optional(),
  currentLiabilities: z.number().optional(),
  
  // Income Statement
  revenue: z.number().optional(),
  netIncome: z.number().optional(),
  operatingIncome: z.number().optional(),
  grossProfit: z.number().optional(),
  ebitda: z.number().optional(),
  
  // Cash Flow
  operatingCashFlow: z.number().optional(),
  
  // Per Share Data
  eps: z.number().optional(),
  bookValuePerShare: z.number().optional(),
  dividendPerShare: z.number().optional(),
  
  // Growth Metrics
  revenueGrowth: z.number().optional(),
  epsGrowth: z.number().optional(),
  
  // Market Data
  peRatio: z.number().optional(),
  pbvRatio: z.number().optional(),
  pegRatio: z.number().optional(),
  evEbitda: z.number().optional(),
  dividendYield: z.number().optional(),
  
  // Extracted Ratios
  roe: z.number().optional(),
  roa: z.number().optional(),
  currentRatio: z.number().optional(),
  debtToEquity: z.number().optional(),
  profitMargin: z.number().optional(),
});

export type ExtractedFinancialData = z.infer<typeof extractedFinancialDataSchema>;

export interface CalculatedRatios {
  // Profitability Ratios
  roe?: number;
  roa?: number;
  profitMargin?: number;
  grossMargin?: number;
  operatingMargin?: number;
  
  // Liquidity Ratios
  currentRatio?: number;
  quickRatio?: number;
  
  // Leverage Ratios
  debtToEquity?: number;
  debtRatio?: number;
  equityRatio?: number;
  
  // Efficiency Ratios
  assetTurnover?: number;
  equityTurnover?: number;
  
  // Market Ratios (calculated if share price available)
  peRatio?: number;
  pbvRatio?: number;
  dividendYield?: number;
}

export interface FinancialReportResult {
  extracted: ExtractedFinancialData;
  calculated: CalculatedRatios;
  missing: string[];
}
