import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisResult } from '@shared/schema';

interface ScoreBreakdownChartProps {
  result: AnalysisResult;
}

export default function ScoreBreakdownChart({ result }: ScoreBreakdownChartProps) {
  const data = [
    { metric: 'P/E vs Industry', score: result.scores.peVsIndustry, fullMark: 5 },
    { metric: 'P/BV Ratio', score: result.scores.pbvVsBook, fullMark: 5 },
    { metric: 'ROE', score: result.scores.roeScore, fullMark: 5 },
    { metric: 'EPS Growth', score: result.scores.epsGrowthScore, fullMark: 5 },
    { metric: 'Debt Level', score: result.scores.debtScore, fullMark: 5 },
    { metric: 'Cash Flow', score: result.scores.cashFlowScore, fullMark: 5 },
    { metric: 'Dividend', score: result.scores.dividendScore, fullMark: 5 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 5]} />
            <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
