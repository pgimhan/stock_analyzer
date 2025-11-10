import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ExtractedData {
  companyName?: string;
  reportPeriod?: string;
  periodStart?: string;
  periodEnd?: string;
  revenue?: number;
  netIncome?: number;
  totalAssets?: number;
  totalEquity?: number;
  eps?: number;
}

interface CalculatedRatios {
  roe?: number;
  roa?: number;
  currentRatio?: number;
  profitMargin?: number;
}

interface CompanySnapshot {
  industry: string;
  sector: string;
  founded: string;
  headquarters: string;
  employees: string;
  marketCap: string;
  description: string;
  topShareholders: Array<{ name: string; stake: string }>;
  businessSegments: string[];
}

interface FinancialReportResult {
  extracted: ExtractedData;
  calculated: CalculatedRatios;
  missing: string[];
  snapshot?: CompanySnapshot;
}

interface Props {
  onDataExtracted: (data: FinancialReportResult) => void;
}

export default function FinancialReportUpload({ onDataExtracted }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FinancialReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharePrice, setSharePrice] = useState<string>("");
  const [apiKey, setApiKey] = useState(localStorage.getItem("openai_api_key") || "");

  useEffect(() => {
    const handleStorageChange = () => {
      setApiKey(localStorage.getItem("openai_api_key") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("apiKeyUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("apiKeyUpdated", handleStorageChange);
    };
  }, []);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem("openai_api_key", value);
    window.dispatchEvent(new Event("apiKeyUpdated"));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!apiKey) {
      setError("Please enter your OpenAI API key first");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-financial-report", {
        method: "POST",
        headers: {
          "X-OpenAI-API-Key": apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process report");
      }

      const data: FinancialReportResult = await response.json();
      setResult(data);
      
      // Recalculate with share price if provided
      if (sharePrice && data.extracted.eps) {
        const price = parseFloat(sharePrice);
        if (!isNaN(price)) {
          data.calculated.peRatio = price / data.extracted.eps;
          if (data.extracted.bookValuePerShare) {
            data.calculated.pbvRatio = price / data.extracted.bookValuePerShare;
          }
          if (data.extracted.dividendPerShare) {
            data.calculated.dividendYield = (data.extracted.dividendPerShare / price) * 100;
          }
        }
      }
      
      onDataExtracted(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Financial Report
        </CardTitle>
        <CardDescription>
          Upload a PDF financial report to automatically extract data and calculate ratios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!apiKey && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">OpenAI</a>
            </p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </span>
            </Button>
          </label>
          {file && <span className="text-sm text-muted-foreground">{file.name}</span>}
        </div>

        {file && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Price (Optional)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter current share price"
                value={sharePrice}
                onChange={(e) => setSharePrice(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground">Share price is needed to calculate P/E, P/BV ratios</p>
            </div>
            <Button onClick={handleUpload} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Extract Data"
              )}
            </Button>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Data extracted successfully!
                {result.snapshot && " Company snapshot extracted from report."}
              </AlertDescription>
            </Alert>

            {(result.extracted.periodStart || result.extracted.periodEnd || result.extracted.reportPeriod) && (
              <div className="bg-blue-50 border-l-4 border-blue-600 rounded-md p-4 mb-4">
                <p className="text-xs text-blue-600 font-medium mb-1">FINANCIAL DATA FOR PERIOD</p>
                {result.extracted.periodStart && result.extracted.periodEnd ? (
                  <p className="text-lg font-bold text-blue-900">{result.extracted.periodStart} to {result.extracted.periodEnd}</p>
                ) : (
                  <p className="text-lg font-bold text-blue-900">{result.extracted.reportPeriod}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Extracted Data</h4>
                {result.extracted.companyName && (
                  <p>Company: {result.extracted.companyName}</p>
                )}
                {result.extracted.revenue && (
                  <p>Revenue: {(result.extracted.revenue / 1000000).toFixed(2)}M</p>
                )}
                {result.extracted.netIncome && (
                  <p>Net Income: {(result.extracted.netIncome / 1000000).toFixed(2)}M</p>
                )}
                {result.extracted.totalAssets && (
                  <p>Total Assets: {(result.extracted.totalAssets / 1000000).toFixed(2)}M</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Calculated Ratios</h4>
                <div className="space-y-1 text-xs">
                  {result.calculated.roe && <p>ROE: {result.calculated.roe.toFixed(2)}%</p>}
                  {result.calculated.roa && <p>ROA: {result.calculated.roa.toFixed(2)}%</p>}
                  {result.calculated.profitMargin && <p>Profit Margin: {result.calculated.profitMargin.toFixed(2)}%</p>}
                  {result.calculated.grossMargin && <p>Gross Margin: {result.calculated.grossMargin.toFixed(2)}%</p>}
                  {result.calculated.operatingMargin && <p>Operating Margin: {result.calculated.operatingMargin.toFixed(2)}%</p>}
                  {result.calculated.currentRatio && <p>Current Ratio: {result.calculated.currentRatio.toFixed(2)}</p>}
                  {result.calculated.quickRatio && <p>Quick Ratio: {result.calculated.quickRatio.toFixed(2)}</p>}
                  {result.calculated.debtToEquity && <p>Debt-to-Equity: {result.calculated.debtToEquity.toFixed(2)}</p>}
                  {result.calculated.debtRatio && <p>Debt Ratio: {result.calculated.debtRatio.toFixed(2)}%</p>}
                  {result.calculated.assetTurnover && <p>Asset Turnover: {result.calculated.assetTurnover.toFixed(2)}</p>}
                  {result.calculated.peRatio && <p>P/E Ratio: {result.calculated.peRatio.toFixed(2)}</p>}
                  {result.calculated.pbvRatio && <p>P/BV Ratio: {result.calculated.pbvRatio.toFixed(2)}</p>}
                  {result.calculated.dividendYield && <p>Dividend Yield: {result.calculated.dividendYield.toFixed(2)}%</p>}
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Data Status:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="font-medium text-green-600">✓ Extracted:</p>
                      {result.extracted.eps && <p>• EPS: {result.extracted.eps}</p>}
                      {result.extracted.revenue && <p>• Revenue: {(result.extracted.revenue / 1000000).toFixed(2)}M</p>}
                      {result.extracted.netIncome && <p>• Net Income: {(result.extracted.netIncome / 1000000).toFixed(2)}M</p>}
                      {result.extracted.totalAssets && <p>• Total Assets: {(result.extracted.totalAssets / 1000000).toFixed(2)}M</p>}
                      {result.extracted.totalEquity && <p>• Total Equity: {(result.extracted.totalEquity / 1000000).toFixed(2)}M</p>}
                      {result.extracted.operatingCashFlow && <p>• Cash Flow: {(result.extracted.operatingCashFlow / 1000000).toFixed(2)}M</p>}
                      {result.extracted.bookValuePerShare && <p>• Book Value/Share: {result.extracted.bookValuePerShare}</p>}
                      {result.extracted.revenueGrowth && <p>• Revenue Growth: {(result.extracted.revenueGrowth * 100).toFixed(1)}%</p>}
                    </div>
                    <div>
                      <p className="font-medium text-red-600">✗ Missing (Manual Entry Needed):</p>
                      {!result.extracted.sharePrice && <p>• Share Price</p>}
                      {!result.extracted.operatingCashFlow && <p>• Cash Flow</p>}
                      {!result.extracted.epsGrowth && <p>• EPS Growth</p>}
                      {!result.extracted.pegRatio && <p>• PEG Ratio</p>}
                      {!result.extracted.evEbitda && <p>• EV/EBITDA</p>}
                      {!result.extracted.dividendPerShare && <p>• Dividend Per Share</p>}
                      {!result.extracted.totalLiabilities && <p>• Total Debt</p>}
                      <p className="text-muted-foreground mt-2">• Industry Averages (P/E, P/BV, ROE)</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="text-xs text-muted-foreground mt-4">
              <p>💡 Tip: You can manually enter missing data in the stock analysis form below</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
