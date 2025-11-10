import OpenAI from "openai";
import type { ExtractedFinancialData, CalculatedRatios, FinancialReportResult } from "../shared/financialSchema";

export async function extractFinancialData(text: string, apiKey: string): Promise<FinancialReportResult> {
  const openai = new OpenAI({ apiKey });
  const prompt = `Extract financial data from this report. Return ONLY valid JSON with these fields (use null for missing data):
{
  "companyName": string or null,
  "tickerSymbol": string or null,
  "reportPeriod": string or null,
  "periodStart": string or null (format: YYYY-MM-DD),
  "periodEnd": string or null (format: YYYY-MM-DD),
  "sharePrice": number or null,
  "totalAssets": number or null,
  "totalLiabilities": number or null,
  "totalEquity": number or null,
  "currentAssets": number or null,
  "currentLiabilities": number or null,
  "revenue": number or null,
  "netIncome": number or null,
  "operatingIncome": number or null,
  "grossProfit": number or null,
  "ebitda": number or null,
  "operatingCashFlow": number or null,
  "eps": number or null,
  "bookValuePerShare": number or null,
  "dividendPerShare": number or null,
  "revenueGrowth": number or null,
  "epsGrowth": number or null,
  "peRatio": number or null,
  "pbvRatio": number or null,
  "pegRatio": number or null,
  "evEbitda": number or null,
  "dividendYield": number or null,
  "roe": number or null,
  "roa": number or null,
  "currentRatio": number or null,
  "debtToEquity": number or null,
  "profitMargin": number or null
}

IMPORTANT: If values are in thousands (Rs.'000), multiply by 1000 to get actual values. Per-share values and ratios should NOT be multiplied.

Report text:
${text.slice(0, 15000)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  let content = response.choices[0].message.content || "{}";
  
  // Remove markdown code blocks if present
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const extracted: ExtractedFinancialData = JSON.parse(content);

  const calculated = calculateRatios(extracted);
  const missing = identifyMissing(extracted);
  
  console.log('Extracted data:', extracted);
  console.log('Calculated ratios:', calculated);

  return { extracted, calculated, missing };
}

function calculateRatios(data: ExtractedFinancialData): CalculatedRatios {
  const ratios: CalculatedRatios = {};

  // Profitability Ratios
  if (data.netIncome && data.totalEquity) {
    ratios.roe = (data.netIncome / data.totalEquity) * 100;
  }
  if (data.netIncome && data.totalAssets) {
    ratios.roa = (data.netIncome / data.totalAssets) * 100;
  }
  if (data.netIncome && data.revenue) {
    ratios.profitMargin = (data.netIncome / data.revenue) * 100;
  }
  if (data.grossProfit && data.revenue) {
    ratios.grossMargin = (data.grossProfit / data.revenue) * 100;
  }
  if (data.operatingIncome && data.revenue) {
    ratios.operatingMargin = (data.operatingIncome / data.revenue) * 100;
  }

  // Liquidity Ratios
  if (data.currentAssets && data.currentLiabilities) {
    ratios.currentRatio = data.currentAssets / data.currentLiabilities;
    const quickAssets = data.currentAssets * 0.7; // Approximation
    ratios.quickRatio = quickAssets / data.currentLiabilities;
  }

  // Leverage Ratios
  if (data.totalLiabilities && data.totalEquity) {
    ratios.debtToEquity = data.totalLiabilities / data.totalEquity;
  }
  if (data.totalLiabilities && data.totalAssets) {
    ratios.debtRatio = (data.totalLiabilities / data.totalAssets) * 100;
  }
  if (data.totalEquity && data.totalAssets) {
    ratios.equityRatio = (data.totalEquity / data.totalAssets) * 100;
  }

  // Efficiency Ratios
  if (data.revenue && data.totalAssets) {
    ratios.assetTurnover = data.revenue / data.totalAssets;
  }
  if (data.revenue && data.totalEquity) {
    ratios.equityTurnover = data.revenue / data.totalEquity;
  }

  // Per Share Ratios (if share price available)
  if (data.sharePrice && data.eps) {
    ratios.peRatio = data.sharePrice / data.eps;
  }
  if (data.sharePrice && data.bookValuePerShare) {
    ratios.pbvRatio = data.sharePrice / data.bookValuePerShare;
  }
  if (data.dividendPerShare && data.sharePrice) {
    ratios.dividendYield = (data.dividendPerShare / data.sharePrice) * 100;
  }

  return ratios;
}

function identifyMissing(extracted: ExtractedFinancialData): string[] {
  const missing: string[] = [];
  const fields = [
    { key: "eps", label: "EPS" },
    { key: "revenue", label: "Revenue" },
    { key: "netIncome", label: "Net Income" },
    { key: "totalAssets", label: "Total Assets" },
    { key: "totalEquity", label: "Total Equity" },
    { key: "operatingCashFlow", label: "Cash Flow" },
  ];

  fields.forEach(({ key, label }) => {
    if (!extracted[key as keyof ExtractedFinancialData]) {
      missing.push(label);
    }
  });

  return missing;
}
