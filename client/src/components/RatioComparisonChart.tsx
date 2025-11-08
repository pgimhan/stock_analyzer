import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisResult } from '@shared/schema';

interface RatioComparisonChartProps {
  result: AnalysisResult;
  industryData: { avgPE: number; avgPBV: number; avgROE: number };
}

export default function RatioComparisonChart({ result, industryData }: RatioComparisonChartProps) {
  const data = [
    {
      metric: 'P/E Ratio',
      Stock: result.ratios.pe,
      Industry: industryData.avgPE,
    },
    {
      metric: 'P/BV Ratio',
      Stock: result.ratios.pbv,
      Industry: industryData.avgPBV,
    },
    {
      metric: 'ROE %',
      Stock: result.ratios.roe,
      Industry: industryData.avgROE,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock vs Industry Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Stock" fill="#8884d8" />
            <Bar dataKey="Industry" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
