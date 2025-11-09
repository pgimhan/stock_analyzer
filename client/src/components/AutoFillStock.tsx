import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, AlertTriangle, ExternalLink, Search, BookOpen } from "lucide-react";
import type { StockAnalysis } from "@shared/schema";
import { sriLankaStocks, dataSources } from "@/lib/sriLankaStocks";

interface AutoFillStockProps {
  onAutoFill: (data: Partial<StockAnalysis>) => void;
}

export default function AutoFillStock({ onAutoFill }: AutoFillStockProps) {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [showStockList, setShowStockList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectStock = (symbol: string, name: string) => {
    setTicker(symbol);
    setShowStockList(false);
    onAutoFill({ stockName: name, tickerSymbol: symbol });
  };

  const filteredStocks = sriLankaStocks.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="mb-6 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🇱🇰 Sri Lanka Stock Market (CSE)
        </CardTitle>
        <CardDescription>Select a stock and enter financial data manually for accurate analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              onClick={() => setShowStockList(!showStockList)}
            >
              <Search className="h-4 w-4" />
              {ticker ? `Selected: ${ticker}` : "Browse CSE Stocks"}
            </Button>
          </div>

          {showStockList && (
            <div className="border rounded-md p-3 space-y-3 max-h-64 overflow-y-auto">
              <Input
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => selectStock(stock.symbol, stock.name)}
                >
                  <div className="font-medium text-sm">{stock.name}</div>
                  <div className="text-xs text-muted-foreground">{stock.symbol} • {stock.sector}</div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
            <div className="flex items-start gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                  Reliable Data Sources
                </p>
                <div className="space-y-2">
                  {dataSources.map((source, i) => (
                    <div key={i} className="text-xs">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        className="text-blue-700 dark:text-blue-500 hover:underline inline-flex items-center gap-1"
                      >
                        {source.name} <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-blue-600 dark:text-blue-600 ml-1">- {source.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-600">
              ✓ Use official sources for highest accuracy
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
