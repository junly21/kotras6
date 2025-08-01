"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ODPairData {
  ride_nm: string;
  algh_nm: string;
  oper_nm: string;
  ride_stn_id: string;
  cnt: number;
  algh_stn_id: string;
  oper_id: string;
}

interface Props {
  data: ODPairData[];
}

export function ODPairChart({ data }: Props) {
  console.log("ODPairChart 데이터:", data);

  // 상위 10개만 표시
  const topData = data
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      순위: index + 1,
      출발도착: `${item.ride_nm} → ${item.algh_nm}`,
    }));

  console.log("ODPairChart 상위 10개 데이터:", topData);

  const formatValue = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={topData}
        layout="horizontal"
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(v) => formatValue(v)} />
        <YAxis
          type="category"
          dataKey="출발도착"
          width={120}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          formatter={(value: number) => [formatValue(value), "통행수"]}
          labelFormatter={(label) => `경로: ${label}`}
        />
        <Legend />
        <Bar
          dataKey="cnt"
          name="통행수"
          fill="#3b82f6"
          isAnimationActive={false}
          radius={[0, 5, 5, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
