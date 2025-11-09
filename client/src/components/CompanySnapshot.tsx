import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Loader2, Users, MapPin, Calendar, TrendingUp } from "lucide-react";
import type { AnalysisResult, StockAnalysis } from "@shared/schema";

interface CompanySnapshotProps {
  result: AnalysisResult;
  inputData: StockAnalysis;
}

export default function CompanySnapshot({ result, inputData }: CompanySnapshotProps) {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateSnapshot = async () => {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      alert("Please save your OpenAI API key in AI Insights section first.");
      return;
    }

    setLoading(true);

    const prompt = `Provide a company snapshot for ${result.stockName} (${result.tickerSymbol}) listed on Colombo Stock Exchange.

Return ONLY valid JSON in this exact format:
{
  "industry": "Industry name",
  "sector": "Sector name",
  "founded": "Year or N/A",
  "headquarters": "City, Country",
  "employees": "Number or N/A",
  "marketCap": "Value in LKR billions or N/A",
  "description": "2-3 sentence company description",
  "topShareholders": [
    {"name": "Shareholder name", "stake": "Percentage"},
    {"name": "Shareholder name", "stake": "Percentage"}
  ],
  "businessSegments": ["Segment 1", "Segment 2", "Segment 3"]
}

Use real data for Sri Lankan companies. If data unavailable, use "N/A".`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(`Error: ${data.error.message}`);
      } else {
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setSnapshot(JSON.parse(jsonMatch[0]));
        }
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Failed to generate"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("openai_api_key")) {
      generateSnapshot();
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Snapshot
        </CardTitle>
        <CardDescription>Overview and key information</CardDescription>
      </CardHeader>
      <CardContent>
        {!snapshot && !loading && (
          <Button onClick={generateSnapshot} variant="outline" className="w-full gap-2">
            <Building2 className="h-4 w-4" />
            Load Company Info
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading company data...</span>
          </div>
        )}

        {snapshot && !loading && (
          <div className="space-y-4">
            {/* Company Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-muted rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Industry</div>
                <div className="text-sm font-semibold">{snapshot.industry}</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Sector</div>
                <div className="text-sm font-semibold">{snapshot.sector}</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Founded</div>
                <div className="text-sm font-semibold flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {snapshot.founded}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                <div className="text-sm font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {snapshot.marketCap}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
              <p className="text-sm text-blue-900 dark:text-blue-300">{snapshot.description}</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Shareholders */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">Top Shareholders</h4>
                </div>
                <div className="space-y-2">
                  {snapshot.topShareholders.map((sh: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{sh.name}</span>
                      <span className="font-semibold">{sh.stake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Segments */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">Business Segments</h4>
                </div>
                <div className="space-y-2">
                  {snapshot.businessSegments.map((seg: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>{seg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {snapshot.headquarters}
              </div>
              {snapshot.employees !== "N/A" && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {snapshot.employees} employees
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
