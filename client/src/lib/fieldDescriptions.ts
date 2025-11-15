export const fieldDescriptions = {
  sharePrice: {
    title: "Share Price",
    description: "The current trading price of one share of the company's stock in the market.",
    example: "If JKH trades at Rs. 125.50, enter 125.50"
  },
  epsTTM: {
    title: "EPS (TTM)",
    description: "Earnings Per Share for the Trailing Twelve Months. Shows how much profit the company made per share over the last year.",
    formula: "Net Income ÷ Total Shares Outstanding",
    goodRange: "Higher is better. Compare with previous years to see growth.",
    example: "If net income is Rs. 10M and 1M shares exist, EPS = 10"
  },
  epsForward: {
    title: "EPS (Forward)",
    description: "Projected earnings per share for the next 12 months based on analyst estimates. Optional - leave blank if unavailable.",
    goodRange: "Should be higher than TTM EPS for growing companies",
    example: "If analysts expect Rs. 9.20 per share next year"
  },
  revenue: {
    title: "Revenue",
    description: "Total income generated from business operations before any expenses are deducted.",
    example: "If company sold Rs. 185M worth of goods/services"
  },
  netProfit: {
    title: "Net Profit",
    description: "The actual profit remaining after all expenses, taxes, and costs are deducted from revenue.",
    formula: "Revenue - All Expenses - Taxes",
    goodRange: "Positive and growing year-over-year",
    example: "If Rs. 12.5M remains after all deductions"
  },
  totalAssets: {
    title: "Total Assets",
    description: "The total value of everything the company owns (cash, property, equipment, inventory, etc.).",
    formula: "Current Assets + Non-Current Assets",
    goodRange: "Should be greater than total liabilities",
    example: "Rs. 200M in total assets"
  },
  debt: {
    title: "Total Debt",
    description: "The total amount of money the company owes to lenders and creditors.",
    goodRange: "Lower is better. Compare with equity and cash flow",
    example: "Rs. 45M in loans and bonds"
  },
  equity: {
    title: "Shareholder Equity",
    description: "Total shareholder equity (assets minus liabilities). Represents the net worth of the company.",
    formula: "Total Assets - Total Liabilities",
    goodRange: "Higher is better. Should be positive and growing",
    example: "Rs. 100M in shareholder equity"
  },
  cashFlow: {
    title: "Operating Cash Flow",
    description: "Actual cash generated from core business operations, not accounting profits.",
    goodRange: "Positive and higher than net profit is ideal",
    example: "Rs. 18M cash generated from operations"
  },
  peRatio: {
    title: "P/E Ratio (Price-to-Earnings)",
    description: "Shows how much investors are willing to pay for each rupee of earnings. Lower values may indicate undervaluation.",
    formula: "Share Price ÷ EPS",
    goodRange: "10-20 is typical. Below industry average may be undervalued",
    example: "14.34 means paying Rs. 14.34 for every Rs. 1 of earnings"
  },
  pbvRatio: {
    title: "P/BV Ratio (Price-to-Book Value)",
    description: "Compares market price to the company's book value (assets minus liabilities).",
    formula: "Share Price ÷ Book Value per Share",
    goodRange: "Below 3 is reasonable. Below 1 may be undervalued",
    example: "1.85 means market values company at 1.85× its book value"
  },
  dividendYield: {
    title: "Dividend Yield",
    description: "The annual dividend payment as a percentage of the current share price. Shows income return.",
    formula: "(Annual Dividend per Share ÷ Share Price) × 100",
    goodRange: "2-6% is attractive for income investors",
    example: "3.2% means Rs. 3.20 annual dividend per Rs. 100 invested"
  },
  pegRatio: {
    title: "PEG Ratio (Price/Earnings to Growth)",
    description: "P/E ratio adjusted for earnings growth rate. Helps identify growth stocks at reasonable prices.",
    formula: "P/E Ratio ÷ EPS Growth Rate",
    goodRange: "Below 1 is undervalued, 1-2 is fair, above 2 is expensive",
    example: "1.15 means fairly valued considering growth"
  },
  roe: {
    title: "ROE (Return on Equity)",
    description: "Return on Equity shows how efficiently the company uses shareholder equity to generate profit.",
    formula: "(Net Profit ÷ Shareholder Equity) × 100",
    goodRange: "Above 15% is excellent, above 20% is exceptional",
    example: "14.5% means company generates Rs. 14.50 profit per Rs. 100 of equity"
  },
  evEbitda: {
    title: "EV/EBITDA",
    description: "Enterprise Value to Earnings Before Interest, Taxes, Depreciation & Amortization. Used for company valuation.",
    formula: "Enterprise Value ÷ EBITDA",
    goodRange: "Below 10 is attractive, varies by industry",
    example: "8.5 means company valued at 8.5× its EBITDA"
  },
  revenueGrowth: {
    title: "Revenue Growth",
    description: "Year-over-year percentage increase in total revenue.",
    formula: "((Current Revenue - Previous Revenue) ÷ Previous Revenue) × 100",
    goodRange: "Above 10% is strong growth",
    example: "12.5% means revenue increased by 12.5% from last year"
  },
  epsGrowth: {
    title: "EPS Growth",
    description: "Year-over-year percentage increase in earnings per share.",
    formula: "((Current EPS - Previous EPS) ÷ Previous EPS) × 100",
    goodRange: "Above 10% is excellent",
    example: "8.3% means earnings per share grew by 8.3%"
  },

  industryAvgPE: {
    title: "Industry Average P/E",
    description: "The average P/E ratio of companies in the same industry sector.",
    goodRange: "Use for comparison. Stock P/E below this may be undervalued",
    example: "If industry average is 16.5"
  },
  industryAvgPBV: {
    title: "Industry Average P/BV",
    description: "The average P/BV ratio of companies in the same industry sector.",
    goodRange: "Use for comparison. Stock P/BV below this may be undervalued",
    example: "If industry average is 2.1"
  },
  industryAvgROE: {
    title: "Industry Average ROE",
    description: "The average Return on Equity of companies in the same industry sector.",
    goodRange: "Stock ROE above this indicates better efficiency",
    example: "If industry average is 12%"
  },
  marketIndexPE: {
    title: "Market Index P/E",
    description: "The P/E ratio of the overall stock market index (e.g., ASPI). Optional - defaults to 15 if not provided.",
    goodRange: "Provides broader market context for valuation",
    example: "If ASPI P/E is 18.2"
  }
};
