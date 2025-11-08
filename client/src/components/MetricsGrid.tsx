import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { AnalysisResult } from "@shared/schema";

interface MetricsGridProps {
  result: AnalysisResult;
}

export default function MetricsGrid({ result }: MetricsGridProps) {
  const metrics = [
    {
      label: "P/E Ratio",
      value: result.ratios.pe.toFixed(2) + "×",
      comparison: result.comparisons.peVsIndustry,
      trend: result.comparisons.peVsIndustry > 0 ? "up" : result.comparisons.peVsIndustry < 0 ? "down" : "neutral",
    },
    {
      label: "ROE",
      value: result.ratios.roe.toFixed(1) + "%",
      comparison: result.comparisons.roeVsIndustry,
      trend: result.comparisons.roeVsIndustry > 0 ? "up" : result.comparisons.roeVsIndustry < 0 ? "down" : "neutral",
    },
    {
      label: "PEG Ratio",
      value: result.ratios.peg.toFixed(2) + "×",
      comparison: result.ratios.peg > 1 ? ((result.ratios.peg - 1) * 100) : -((1 - result.ratios.peg) * 100),
      trend: result.ratios.peg > 1 ? "up" : result.ratios.peg < 1 ? "down" : "neutral",
    },
    {
      label: "Dividend Yield",
      value: result.ratios.dividendYield.toFixed(2) + "%",
      comparison: 0,
      trend: "neutral",
    },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <ArrowUp className="h-4 w-4" />;
    if (trend === "down") return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (trend: string, label: string) => {
    if (label === "P/E Ratio" || label === "PEG Ratio") {
      return trend === "down" ? "text-green-600 dark:text-green-400" : trend === "up" ? "text-red-600 dark:text-red-400" : "text-muted-foreground";
    }
    return trend === "up" ? "text-green-600 dark:text-green-400" : trend === "down" ? "text-red-600 dark:text-red-400" : "text-muted-foreground";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4 space-y-2">
            <div className="text-sm text-muted-foreground">{metric.label}</div>
            <div className="text-2xl font-semibold tabular-nums" data-testid={`text-metric-${index}`}>{metric.value}</div>
            {metric.comparison !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(metric.trend, metric.label)}`}>
                {getTrendIcon(metric.trend)}
                <span>{Math.abs(metric.comparison).toFixed(1)}% vs industry</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
