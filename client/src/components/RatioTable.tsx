import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Check } from "lucide-react";
import type { AnalysisResult } from "@shared/schema";

interface RatioTableProps {
  result: AnalysisResult;
  industryData: {
    avgPE: number;
    avgPBV: number;
    avgROE: number;
  };
}

export default function RatioTable({ result, industryData }: RatioTableProps) {
  const ratios = [
    {
      name: "P/E Ratio",
      stock: result.ratios.pe,
      industry: industryData.avgPE,
      unit: "×",
      lowerIsBetter: true,
    },
    {
      name: "P/BV Ratio",
      stock: result.ratios.pbv,
      industry: industryData.avgPBV,
      unit: "×",
      lowerIsBetter: true,
    },
    {
      name: "ROE",
      stock: result.ratios.roe,
      industry: industryData.avgROE,
      unit: "%",
      lowerIsBetter: false,
    },
    {
      name: "PEG Ratio",
      stock: result.ratios.peg,
      industry: 1.0,
      unit: "×",
      lowerIsBetter: true,
    },
    {
      name: "EV/EBITDA",
      stock: result.ratios.evEbitda,
      industry: 10,
      unit: "×",
      lowerIsBetter: true,
    },
    {
      name: "Dividend Yield",
      stock: result.ratios.dividendYield,
      industry: 3,
      unit: "%",
      lowerIsBetter: false,
    },
  ];

  const getStatus = (stock: number, industry: number, lowerIsBetter: boolean) => {
    const diff = ((stock - industry) / industry) * 100;
    if (Math.abs(diff) < 10) return "neutral";
    if (lowerIsBetter) {
      return stock < industry ? "positive" : "negative";
    } else {
      return stock > industry ? "positive" : "negative";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "positive") {
      return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><Check className="h-3 w-3" /></Badge>;
    }
    if (status === "negative") {
      return <Badge variant="destructive"><ArrowUp className="h-3 w-3" /></Badge>;
    }
    return <Badge variant="secondary"><Check className="h-3 w-3" /></Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratio Comparison</CardTitle>
        <CardDescription>Comparing stock metrics against industry benchmarks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Ratio</TableHead>
                <TableHead className="text-right">Your Stock</TableHead>
                <TableHead className="text-right">Industry Avg</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead className="text-center w-[80px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratios.filter(ratio => ratio.stock != null && ratio.stock !== 0).map((ratio, index) => {
                const diff = ((ratio.stock - ratio.industry) / ratio.industry) * 100;
                const status = getStatus(ratio.stock, ratio.industry, ratio.lowerIsBetter);
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{ratio.name}</TableCell>
                    <TableCell className="text-right tabular-nums" data-testid={`text-ratio-stock-${index}`}>
                      {ratio.stock.toFixed(2)}{ratio.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {ratio.industry.toFixed(2)}{ratio.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(status)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
