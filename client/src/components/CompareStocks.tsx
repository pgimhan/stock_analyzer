import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitCompare, X, TrendingUp, TrendingDown } from "lucide-react";
import type { AnalysisResult, StockAnalysis } from "@shared/schema";

interface CompareStocksProps {
  currentStock: { result: AnalysisResult; inputData: StockAnalysis };
}

export default function CompareStocks({ currentStock }: CompareStocksProps) {
  const [compareStocks, setCompareStocks] = useState<Array<{ result: AnalysisResult; inputData: StockAnalysis }>>([]);
  const [showSelector, setShowSelector] = useState(false);

  const addFromHistory = () => {
    const saved = localStorage.getItem("stock_analyses");
    if (!saved) return [];
    
    const analyses = JSON.parse(saved);
    return analyses
      .filter((a: any) => a.result.tickerSymbol !== currentStock.result.tickerSymbol)
      .slice(0, 5);
  };

  const addStock = (stock: any) => {
    if (compareStocks.length < 2) {
      setCompareStocks([...compareStocks, { result: stock.result, inputData: stock.inputData }]);
      setShowSelector(false);
    }
  };

  const removeStock = (index: number) => {
    setCompareStocks(compareStocks.filter((_, i) => i !== index));
  };

  const allStocks = [currentStock, ...compareStocks];

  const metrics = [
    { label: "Overall Score", key: "overallScore", format: (v: number) => `${v.toFixed(2)}/5.0` },
    { label: "Verdict", key: "verdict" },
    { label: "Recommendation", key: "recommendation" },
    { label: "P/E Ratio", key: "pe", format: (v: number) => `${v.toFixed(2)}x` },
    { label: "P/BV Ratio", key: "pbv", format: (v: number) => `${v.toFixed(2)}x` },
    { label: "ROE", key: "roe", format: (v: number) => `${v.toFixed(2)}%` },
    { label: "EPS Growth", key: "epsGrowth", format: (v: number) => `${v.toFixed(2)}%` },
    { label: "Debt/Equity", key: "debtToEquity", format: (v: number) => v.toFixed(2) },
    { label: "Dividend Yield", key: "dividendYield", format: (v: number) => `${v.toFixed(2)}%` },
  ];

  const getBestValue = (key: string) => {
    if (key === "overallScore") return Math.max(...allStocks.map(s => s.result.overallScore));
    if (key === "roe" || key === "epsGrowth" || key === "dividendYield") {
      return Math.max(...allStocks.map(s => {
        if (key === "roe") return s.result.ratios.roe;
        if (key === "epsGrowth") return s.inputData.epsGrowth;
        return s.result.ratios.dividendYield;
      }));
    }
    if (key === "pe" || key === "pbv" || key === "debtToEquity") {
      return Math.min(...allStocks.map(s => {
        if (key === "pe") return s.result.ratios.pe;
        if (key === "pbv") return s.result.ratios.pbv;
        return s.result.ratios.debtToEquity;
      }));
    }
    return null;
  };

  const getValue = (stock: any, key: string) => {
    if (key === "overallScore") return stock.result.overallScore;
    if (key === "verdict") return stock.result.verdict;
    if (key === "recommendation") return stock.result.recommendation;
    if (key === "pe") return stock.result.ratios.pe;
    if (key === "pbv") return stock.result.ratios.pbv;
    if (key === "roe") return stock.result.ratios.roe;
    if (key === "epsGrowth") return stock.inputData.epsGrowth;
    if (key === "debtToEquity") return stock.result.ratios.debtToEquity;
    if (key === "dividendYield") return stock.result.ratios.dividendYield;
    return null;
  };

  const isBest = (stock: any, key: string) => {
    const value = getValue(stock, key);
    const best = getBestValue(key);
    return value === best && allStocks.length > 1;
  };

  if (compareStocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Compare Stocks
          </CardTitle>
          <CardDescription>Add up to 2 stocks from history to compare</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowSelector(true)} variant="outline" className="w-full gap-2">
            <GitCompare className="h-4 w-4" />
            Add Stock to Compare
          </Button>

          {showSelector && (
            <div className="mt-4 border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
              {addFromHistory().map((stock: any, i: number) => (
                <div
                  key={i}
                  className="p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => addStock(stock)}
                >
                  <div className="font-medium text-sm">{stock.inputData.stockName}</div>
                  <div className="text-xs text-muted-foreground">
                    {stock.inputData.tickerSymbol} • Score: {stock.result.overallScore.toFixed(2)}
                  </div>
                </div>
              ))}
              {addFromHistory().length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No other stocks in history. Analyze more stocks first.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Stock Comparison
        </CardTitle>
        <CardDescription>Side-by-side comparison of {allStocks.length} stocks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Metric</th>
                {allStocks.map((stock, i) => (
                  <th key={i} className="text-center p-3">
                    <div className="font-bold">{stock.result.stockName}</div>
                    <div className="text-xs text-muted-foreground font-normal">{stock.result.tickerSymbol}</div>
                    {i > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStock(i - 1)}
                        className="mt-1 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, i) => (
                <tr key={i} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{metric.label}</td>
                  {allStocks.map((stock, j) => {
                    const value = getValue(stock, metric.key);
                    const best = isBest(stock, metric.key);
                    const displayValue = metric.format ? metric.format(value as number) : value;
                    
                    return (
                      <td key={j} className={`p-3 text-center ${best ? 'bg-green-50 dark:bg-green-950/20 font-bold' : ''}`}>
                        {best && <TrendingUp className="h-3 w-3 inline mr-1 text-green-600" />}
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {compareStocks.length < 2 && (
          <Button onClick={() => setShowSelector(true)} variant="outline" className="w-full mt-4 gap-2">
            <GitCompare className="h-4 w-4" />
            Add Another Stock
          </Button>
        )}

        {showSelector && (
          <div className="mt-4 border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
            {addFromHistory()
              .filter((s: any) => !compareStocks.find(cs => cs.result.tickerSymbol === s.result.tickerSymbol))
              .map((stock: any, i: number) => (
                <div
                  key={i}
                  className="p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => addStock(stock)}
                >
                  <div className="font-medium text-sm">{stock.inputData.stockName}</div>
                  <div className="text-xs text-muted-foreground">
                    {stock.inputData.tickerSymbol} • Score: {stock.result.overallScore.toFixed(2)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
