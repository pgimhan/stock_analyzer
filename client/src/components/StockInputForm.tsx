import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockAnalysisSchema, type StockAnalysis } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrendingUp } from "lucide-react";

interface StockInputFormProps {
  onAnalyze: (data: StockAnalysis) => void;
}

export default function StockInputForm({ onAnalyze }: StockInputFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<StockAnalysis>({
    resolver: zodResolver(stockAnalysisSchema),
  });

  const onSubmit = (data: StockAnalysis) => {
    console.log('Form submitted successfully:', data);
    onAnalyze(data);
  };

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Stock Data Input
        </CardTitle>
        <CardDescription>Enter financial metrics for comprehensive valuation analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockName">Stock Name *</Label>
                <Input
                  id="stockName"
                  placeholder="e.g., John Keells Holdings"
                  {...register("stockName")}
                  data-testid="input-stock-name"
                />
                {errors.stockName && <p className="text-sm text-destructive">{errors.stockName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tickerSymbol">Ticker Symbol *</Label>
                <Input
                  id="tickerSymbol"
                  placeholder="e.g., JKH"
                  className="font-mono"
                  {...register("tickerSymbol")}
                  data-testid="input-ticker-symbol"
                />
                {errors.tickerSymbol && <p className="text-sm text-destructive">{errors.tickerSymbol.message}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Price & Earnings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sharePrice">Share Price *</Label>
                  <Input
                    id="sharePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("sharePrice", { valueAsNumber: true })}
                    data-testid="input-share-price"
                  />
                  {errors.sharePrice && <p className="text-sm text-destructive">{errors.sharePrice.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epsTTM">EPS (TTM)</Label>
                  <Input
                    id="epsTTM"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("epsTTM", { valueAsNumber: true })}
                    data-testid="input-eps-ttm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epsForward">EPS (Forward)</Label>
                  <Input
                    id="epsForward"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("epsForward", { valueAsNumber: true })}
                    data-testid="input-eps-forward"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Financials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue *</Label>
                  <Input
                    id="revenue"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("revenue", { valueAsNumber: true })}
                    data-testid="input-revenue"
                  />
                  {errors.revenue && <p className="text-sm text-destructive">{errors.revenue.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="netProfit">Net Profit</Label>
                  <Input
                    id="netProfit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("netProfit", { valueAsNumber: true })}
                    data-testid="input-net-profit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roe">ROE (%)</Label>
                  <Input
                    id="roe"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("roe", { valueAsNumber: true })}
                    data-testid="input-roe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roa">ROA (%)</Label>
                  <Input
                    id="roa"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("roa", { valueAsNumber: true })}
                    data-testid="input-roa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt">Debt *</Label>
                  <Input
                    id="debt"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("debt", { valueAsNumber: true })}
                    data-testid="input-debt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashFlow">Cash Flow</Label>
                  <Input
                    id="cashFlow"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("cashFlow", { valueAsNumber: true })}
                    data-testid="input-cash-flow"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Market Ratios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peRatio">P/E Ratio *</Label>
                  <Input
                    id="peRatio"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("peRatio", { valueAsNumber: true })}
                    data-testid="input-pe-ratio"
                  />
                  {errors.peRatio && <p className="text-sm text-destructive">{errors.peRatio.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pbvRatio">P/BV Ratio *</Label>
                  <Input
                    id="pbvRatio"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("pbvRatio", { valueAsNumber: true })}
                    data-testid="input-pbv-ratio"
                  />
                  {errors.pbvRatio && <p className="text-sm text-destructive">{errors.pbvRatio.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dividendYield">Dividend Yield (%) *</Label>
                  <Input
                    id="dividendYield"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("dividendYield", { valueAsNumber: true })}
                    data-testid="input-dividend-yield"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pegRatio">PEG Ratio *</Label>
                  <Input
                    id="pegRatio"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("pegRatio", { valueAsNumber: true })}
                    data-testid="input-peg-ratio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evEbitda">EV/EBITDA *</Label>
                  <Input
                    id="evEbitda"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("evEbitda", { valueAsNumber: true })}
                    data-testid="input-ev-ebitda"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Growth Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenueGrowth">Revenue Growth (%)</Label>
                  <Input
                    id="revenueGrowth"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("revenueGrowth", { valueAsNumber: true })}
                    data-testid="input-revenue-growth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epsGrowth">EPS Growth (%)</Label>
                  <Input
                    id="epsGrowth"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("epsGrowth", { valueAsNumber: true })}
                    data-testid="input-eps-growth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("profitMargin", { valueAsNumber: true })}
                    data-testid="input-profit-margin"
                  />
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="border rounded-md">
              <AccordionItem value="industry" className="border-0">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <span className="text-sm font-semibold">Industry Benchmarks</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="industryAvgPE">Industry Avg P/E *</Label>
                      <Input
                        id="industryAvgPE"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("industryAvgPE", { valueAsNumber: true })}
                        data-testid="input-industry-avg-pe"
                      />
                      {errors.industryAvgPE && <p className="text-sm text-destructive">{errors.industryAvgPE.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industryAvgPBV">Industry Avg P/BV *</Label>
                      <Input
                        id="industryAvgPBV"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("industryAvgPBV", { valueAsNumber: true })}
                        data-testid="input-industry-avg-pbv"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industryAvgROE">Industry Avg ROE (%)</Label>
                      <Input
                        id="industryAvgROE"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("industryAvgROE", { valueAsNumber: true })}
                        data-testid="input-industry-avg-roe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marketIndexPE">Market Index P/E</Label>
                      <Input
                        id="marketIndexPE"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("marketIndexPE", { valueAsNumber: true })}
                        data-testid="input-market-index-pe"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Button type="submit" className="w-full" size="lg" data-testid="button-analyze">
            Analyze Stock
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
