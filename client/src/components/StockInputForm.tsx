import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockAnalysisSchema, type StockAnalysis } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrendingUp, Sparkles } from "lucide-react";
import FieldInfo from "./FieldInfo";
import { fieldDescriptions } from "@/lib/fieldDescriptions";
import { exampleStockData } from "@/lib/exampleData";


interface StockInputFormProps {
  onAnalyze: (data: StockAnalysis) => void;
  initialData?: StockAnalysis | null;
}

export default function StockInputForm({ onAnalyze, initialData }: StockInputFormProps) {
  const [revenueUnit, setRevenueUnit] = useState(1000000);
  const [netProfitUnit, setNetProfitUnit] = useState(1000000);
  const [totalAssetsUnit, setTotalAssetsUnit] = useState(1000000);
  const [debtUnit, setDebtUnit] = useState(1000000);
  const [equityUnit, setEquityUnit] = useState(1000000);
  const [cashFlowUnit, setCashFlowUnit] = useState(1000000);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<StockAnalysis>({
    resolver: zodResolver(stockAnalysisSchema),
    defaultValues: initialData || undefined,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);
  


  const loadExample = () => {
    reset(exampleStockData);
  };



  const onSubmit = (data: StockAnalysis) => {
    const adjustedData = {
      ...data,
      revenue: data.revenue * revenueUnit,
      netProfit: data.netProfit * netProfitUnit,
      totalAssets: data.totalAssets * totalAssetsUnit,
      debt: data.debt * debtUnit,
      equity: data.equity * equityUnit,
      cashFlow: data.cashFlow * cashFlowUnit,
    };
    console.log('Form submitted successfully:', adjustedData);
    onAnalyze(adjustedData);
  };

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Stock Data Input
            </CardTitle>
            <CardDescription>Enter financial metrics for comprehensive valuation analysis</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={loadExample} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Load Example
          </Button>
        </div>
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
                  <Label htmlFor="sharePrice" className="flex items-center gap-2">
                    Share Price *
                    <FieldInfo {...fieldDescriptions.sharePrice} />
                  </Label>
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
                  <Label htmlFor="epsTTM" className="flex items-center gap-2">
                    EPS (TTM) *
                    <FieldInfo {...fieldDescriptions.epsTTM} />
                  </Label>
                  <Input
                    id="epsTTM"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("epsTTM", { valueAsNumber: true })}
                    data-testid="input-eps-ttm"
                  />
                  {errors.epsTTM && <p className="text-sm text-destructive">{errors.epsTTM.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epsForward" className="flex items-center gap-2">
                    EPS (Forward) <span className="text-muted-foreground text-xs">(Optional)</span>
                    <FieldInfo {...fieldDescriptions.epsForward} />
                  </Label>
                  <Input
                    id="epsForward"
                    type="number"
                    step="0.01"
                    placeholder="Leave blank if unavailable"
                    {...register("epsForward", { setValueAs: v => v === '' ? undefined : Number(v) })}
                    data-testid="input-eps-forward"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Financials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue" className="flex items-center gap-2">
                    Revenue *
                    <FieldInfo {...fieldDescriptions.revenue} />
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="revenue"
                      type="number"
                      step="0.01"
                      placeholder="185"
                      {...register("revenue", { valueAsNumber: true })}
                      data-testid="input-revenue"
                      className="flex-1"
                    />
                    <select className="border rounded-md px-3 text-sm bg-background" value={revenueUnit} onChange={(e) => setRevenueUnit(Number(e.target.value))}>
                      <option value="1">Units</option>
                      <option value="1000">K</option>
                      <option value="1000000">M</option>
                      <option value="1000000000">B</option>
                    </select>
                  </div>
                  {errors.revenue && <p className="text-sm text-destructive">{errors.revenue.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="netProfit" className="flex items-center gap-2">
                    Net Profit *
                    <FieldInfo {...fieldDescriptions.netProfit} />
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="netProfit"
                      type="number"
                      step="0.01"
                      placeholder="12.5"
                      {...register("netProfit", { valueAsNumber: true })}
                      data-testid="input-net-profit"
                      className="flex-1"
                    />
                    <select className="border rounded-md px-3 text-sm bg-background" value={netProfitUnit} onChange={(e) => setNetProfitUnit(Number(e.target.value))}>
                      <option value="1">Units</option>
                      <option value="1000">K</option>
                      <option value="1000000">M</option>
                      <option value="1000000000">B</option>
                    </select>
                  </div>
                  {errors.netProfit && <p className="text-sm text-destructive">{errors.netProfit.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAssets" className="flex items-center gap-2">
                    Total Assets *
                    <FieldInfo {...fieldDescriptions.totalAssets} />
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="totalAssets"
                      type="number"
                      step="0.01"
                      placeholder="200"
                      {...register("totalAssets", { valueAsNumber: true })}
                      data-testid="input-total-assets"
                      className="flex-1"
                    />
                    <select className="border rounded-md px-3 text-sm bg-background" value={totalAssetsUnit} onChange={(e) => setTotalAssetsUnit(Number(e.target.value))}>
                      <option value="1">Units</option>
                      <option value="1000">K</option>
                      <option value="1000000">M</option>
                      <option value="1000000000">B</option>
                    </select>
                  </div>
                  {errors.totalAssets && <p className="text-sm text-destructive">{errors.totalAssets.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt" className="flex items-center gap-2">
                    Debt *
                    <FieldInfo {...fieldDescriptions.debt} />
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="debt"
                      type="number"
                      step="0.01"
                      placeholder="45"
                      {...register("debt", { valueAsNumber: true })}
                      data-testid="input-debt"
                      className="flex-1"
                    />
                    <select className="border rounded-md px-3 text-sm bg-background" value={debtUnit} onChange={(e) => setDebtUnit(Number(e.target.value))}>
                      <option value="1">Units</option>
                      <option value="1000">K</option>
                      <option value="1000000">M</option>
                      <option value="1000000000">B</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equity" className="flex items-center gap-2">
                    Equity *
                    <FieldInfo {...fieldDescriptions.equity} />
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="equity"
                      type="number"
                      step="0.01"
                      placeholder="100"
                      {...register("equity", { valueAsNumber: true })}
                      data-testid="input-equity"
                      className="flex-1"
                    />
                    <select className="border rounded-md px-3 text-sm bg-background" value={equityUnit} onChange={(e) => setEquityUnit(Number(e.target.value))}>
                      <option value="1">Units</option>
                      <option value="1000">K</option>
                      <option value="1000000">M</option>
                      <option value="1000000000">B</option>
                    </select>
                  </div>
                  {errors.equity && <p className="text-sm text-destructive">{errors.equity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashFlow" className="flex items-center gap-2">
                    Cash Flow *
                    <FieldInfo {...fieldDescriptions.cashFlow} />
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="cashFlow"
                      type="number"
                      step="0.01"
                      placeholder="18"
                      {...register("cashFlow", { valueAsNumber: true })}
                      data-testid="input-cash-flow"
                      className="flex-1"
                    />
                    <select className="border rounded-md px-3 text-sm bg-background" value={cashFlowUnit} onChange={(e) => setCashFlowUnit(Number(e.target.value))}>
                      <option value="1">Units</option>
                      <option value="1000">K</option>
                      <option value="1000000">M</option>
                      <option value="1000000000">B</option>
                    </select>
                  </div>
                  {errors.cashFlow && <p className="text-sm text-destructive">{errors.cashFlow.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Market Ratios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peRatio" className="flex items-center gap-2">
                    P/E Ratio *
                    <FieldInfo {...fieldDescriptions.peRatio} />
                  </Label>
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
                  <Label htmlFor="pbvRatio" className="flex items-center gap-2">
                    P/BV Ratio *
                    <FieldInfo {...fieldDescriptions.pbvRatio} />
                  </Label>
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
                  <Label htmlFor="dividendYield" className="flex items-center gap-2">
                    Dividend Yield (%) *
                    <FieldInfo {...fieldDescriptions.dividendYield} />
                  </Label>
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
                  <Label htmlFor="evEbitda" className="flex items-center gap-2">
                    EV/EBITDA *
                    <FieldInfo {...fieldDescriptions.evEbitda} />
                  </Label>
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
                  <Label htmlFor="revenueGrowth" className="flex items-center gap-2">
                    Revenue Growth (%) *
                    <FieldInfo {...fieldDescriptions.revenueGrowth} />
                  </Label>
                  <Input
                    id="revenueGrowth"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("revenueGrowth", { valueAsNumber: true })}
                    data-testid="input-revenue-growth"
                  />
                  {errors.revenueGrowth && <p className="text-sm text-destructive">{errors.revenueGrowth.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epsGrowth" className="flex items-center gap-2">
                    EPS Growth (%) *
                    <FieldInfo {...fieldDescriptions.epsGrowth} />
                  </Label>
                  <Input
                    id="epsGrowth"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("epsGrowth", { valueAsNumber: true })}
                    data-testid="input-eps-growth"
                  />
                  {errors.epsGrowth && <p className="text-sm text-destructive">{errors.epsGrowth.message}</p>}
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
                      <Label htmlFor="industryAvgPE" className="flex items-center gap-2">
                        Industry Avg P/E *
                        <FieldInfo {...fieldDescriptions.industryAvgPE} />
                      </Label>
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
                      <Label htmlFor="industryAvgPBV" className="flex items-center gap-2">
                        Industry Avg P/BV *
                        <FieldInfo {...fieldDescriptions.industryAvgPBV} />
                      </Label>
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
                      <Label htmlFor="industryAvgROE" className="flex items-center gap-2">
                        Industry Avg ROE (%) *
                        <FieldInfo {...fieldDescriptions.industryAvgROE} />
                      </Label>
                      <Input
                        id="industryAvgROE"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("industryAvgROE", { valueAsNumber: true })}
                        data-testid="input-industry-avg-roe"
                      />
                      {errors.industryAvgROE && <p className="text-sm text-destructive">{errors.industryAvgROE.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marketIndexPE" className="flex items-center gap-2">
                        Market Index P/E <span className="text-muted-foreground text-xs">(Optional)</span>
                        <FieldInfo {...fieldDescriptions.marketIndexPE} />
                      </Label>
                      <Input
                        id="marketIndexPE"
                        type="number"
                        step="0.01"
                        placeholder="Defaults to 15"
                        {...register("marketIndexPE", { setValueAs: v => v === '' ? undefined : Number(v) })}
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
