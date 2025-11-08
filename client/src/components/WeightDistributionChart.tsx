import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisResult } from '@shared/schema';

interface WeightDistributionChartProps {
  result: AnalysisResult;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function WeightDistributionChart({ result }: WeightDistributionChartProps) {
  const data = [
    { name: 'P/E vs Industry', value: result.weights.peVsIndustry * 100 },
    { name: 'P/BV Ratio', value: result.weights.pbvVsBook * 100 },
    { name: 'ROE', value: result.weights.roeScore * 100 },
    { name: 'EPS Growth', value: result.weights.epsGrowthScore * 100 },
    { name: 'Debt', value: result.weights.debtScore * 100 },
    { name: 'Cash Flow', value: result.weights.cashFlowScore * 100 },
    { name: 'Dividend', value: result.weights.dividendScore * 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring Weight Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
