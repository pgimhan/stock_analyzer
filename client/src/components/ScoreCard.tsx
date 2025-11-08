import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AnalysisResult } from "@shared/schema";

interface ScoreCardProps {
  result: AnalysisResult;
}

export default function ScoreCard({ result }: ScoreCardProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "Undervalued":
        return "text-green-600 dark:text-green-400";
      case "Fairly Valued":
        return "text-yellow-600 dark:text-yellow-400";
      case "Overvalued":
        return "text-red-600 dark:text-red-400";
      default:
        return "";
    }
  };

  const getRecommendationVariant = (recommendation: string): "default" | "secondary" | "destructive" => {
    if (recommendation.includes("Buy")) return "default";
    if (recommendation === "Hold") return "secondary";
    return "destructive";
  };

  const getVerdictIcon = () => {
    if (result.verdict === "Undervalued") return <TrendingUp className="h-8 w-8" />;
    if (result.verdict === "Overvalued") return <TrendingDown className="h-8 w-8" />;
    return <Minus className="h-8 w-8" />;
  };

  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>Valuation Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className={`text-7xl font-bold tabular-nums ${getVerdictColor(result.verdict)}`} data-testid="text-overall-score">
            {result.overallScore.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">out of 5.0</div>
          
          <div className={`flex items-center gap-2 text-2xl font-semibold ${getVerdictColor(result.verdict)}`}>
            {getVerdictIcon()}
            <span data-testid="text-verdict">{result.verdict}</span>
          </div>
          
          <Badge variant={getRecommendationVariant(result.recommendation)} className="text-base px-4 py-1" data-testid="badge-recommendation">
            {result.recommendation}
          </Badge>
        </div>

        <div className="space-y-3 border-t pt-6">
          <div>
            <h4 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">Key Strengths</h4>
            <ul className="space-y-1.5 text-sm">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2" data-testid={`text-strength-${index}`}>
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span className="text-muted-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3">
            <h4 className="text-sm font-semibold mb-2 text-red-600 dark:text-red-400">Key Concerns</h4>
            <ul className="space-y-1.5 text-sm">
              {result.concerns.map((concern, index) => (
                <li key={index} className="flex items-start gap-2" data-testid={`text-concern-${index}`}>
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span className="text-muted-foreground">{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
