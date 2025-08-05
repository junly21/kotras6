"use client";

import React, { useMemo } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  data: {
    card_div: string;
    cnt: number;
    card_div_nm: string;
  }[];
}

// 세련된 그라데이션 색상 팔레트
const GRADIENTS = [
  { id: "gradient1", colors: ["#667eea", "#764ba2"] },
  { id: "gradient2", colors: ["#f093fb", "#f5576c"] },
  { id: "gradient3", colors: ["#4facfe", "#00f2fe"] },
  { id: "gradient4", colors: ["#43e97b", "#38f9d7"] },
  { id: "gradient5", colors: ["#fa709a", "#fee140"] },
  { id: "gradient6", colors: ["#a8edea", "#fed6e3"] },
  { id: "gradient7", colors: ["#ffecd2", "#fcb69f"] },
  { id: "gradient8", colors: ["#ff9a9e", "#fecfef"] },
];

export function PieChart({ data }: Props) {
  // 차트 데이터 메모이제이션
  const chartData = useMemo(() => {
    console.log("PieChart 데이터:", data);
    const transformed = data.map((item) => ({
      name: item.card_div_nm,
      value: item.cnt,
    }));
    console.log("PieChart 변환된 데이터:", transformed);
    return transformed;
  }, [data]);

  const formatValue = useMemo(
    () => (value: number) => {
      return value.toLocaleString();
    },
    []
  );

  // 커스텀 라벨 렌더러 메모이제이션
  const renderCustomLabel = useMemo(() => {
    return (props: any) => {
      const { cx, cy, midAngle, outerRadius, percent, name } = props;
      if (!percent || percent < 0.05) return null; // 5% 미만은 라벨 숨김

      const RADIAN = Math.PI / 180;
      const radius = outerRadius * 1.2;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill="#374151"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={500}
          fontFamily="Inter, system-ui, sans-serif">
          {`${name} ${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };
  }, []);

  // 커스텀 툴팁 메모이제이션
  const CustomTooltip = useMemo(() => {
    return ({
      active,
      payload,
    }: {
      active?: boolean;
      payload?: Array<{
        value: number;
        payload: { name: string; value: number };
      }>;
    }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <p className="text-gray-900 font-medium">
              {payload[0].payload.name}
            </p>
            <p className="text-blue-600 font-semibold">
              {formatValue(payload[0].value)} 통행수
            </p>
            <p className="text-gray-500 text-sm">
              {(
                (payload[0].payload.value /
                  chartData.reduce((sum, item) => sum + item.value, 0)) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        );
      }
      return null;
    };
  }, [chartData, formatValue]);

  // Legend formatter 메모이제이션
  const legendFormatter = useMemo(() => {
    return (value: string) => (
      <span style={{ color: "#374151", fontWeight: 500 }}>{value}</span>
    );
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        {/* SVG 필터 정의 - 그림자 효과 */}
        <defs>
          {GRADIENTS.map((gradient) => (
            <linearGradient
              key={gradient.id}
              id={gradient.id}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%">
              <stop offset="0%" stopColor={gradient.colors[0]} />
              <stop offset="100%" stopColor={gradient.colors[1]} />
            </linearGradient>
          ))}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="3"
              floodColor="#000000"
              floodOpacity="0.1"
            />
          </filter>
        </defs>

        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          label={renderCustomLabel}
          labelLine={false}
          animationDuration={800}
          isAnimationActive={true}
          filter="url(#shadow)">
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`url(#${GRADIENTS[index % GRADIENTS.length].id})`}
            />
          ))}
        </Pie>

        <Tooltip content={<CustomTooltip />} />

        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            paddingTop: "20px",
            fontSize: "12px",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
          formatter={legendFormatter}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
