"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface PieChartData {
  name: string;
  value: number;
}

interface Props {
  data: {
    card_div: string;
    cnt: number;
    card_div_nm: string;
  }[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
];

export function PieChart({ data }: Props) {
  console.log("PieChart 데이터:", data);

  const chartData = data.map((item) => ({
    name: item.card_div_nm,
    value: item.cnt,
  }));

  console.log("PieChart 변환된 데이터:", chartData);

  const formatValue = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatValue(value), "통행수"]}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
