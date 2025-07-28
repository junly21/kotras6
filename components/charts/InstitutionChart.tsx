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
  Cell,
} from "recharts";
import { SettlementByInstitutionData } from "@/types/settlementByInstitution";
import { Unit } from "@/components/ui/UnitRadioGroup";

interface Props {
  data: SettlementByInstitutionData[];
  unit: Unit;
}

export function InstitutionChart({ data, unit }: Props) {
  // 차액만 표시: 지급 > 수급이면 음수, 수급 > 지급이면 양수
  const chartData = data.map((item) => {
    const payment = Number(item.지급액);
    const receipt = Number(item.수급액);
    let value = 0;
    let type: "지급" | "수급" = "지급";
    if (receipt > payment) {
      value = receipt - payment; // 오른쪽(양수)
      type = "수급";
    } else if (payment > receipt) {
      value = -(payment - receipt); // 왼쪽(음수)
      type = "지급";
    }
    return {
      name: item.대상기관,
      value,
      type,
    };
  });

  // 최대 절대값 계산 (0이면 1로 방어)
  const maxAbs = Math.max(1, ...chartData.map((item) => Math.abs(item.value)));

  const formatValue = (value: number) => {
    if (unit === "원") return value.toLocaleString() + "원";
    return value.toLocaleString() + unit;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={[-maxAbs, maxAbs]}
          tickFormatter={(v) => formatValue(Math.abs(v))}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(
            v: number,
            n: string,
            p: { payload?: { type?: "지급" | "수급" } }
          ) => [formatValue(Math.abs(v)), p?.payload?.type ?? ""]}
          labelFormatter={(label) => `기관: ${label}`}
        />
        <Legend />
        <Bar
          dataKey="value"
          name="정산 차액"
          isAnimationActive={false}
          barSize={10} // 굵기를 절반으로 줄임 (기존 20에서 10으로)
          radius={[0, 5, 5, 0]} // 막대 끝을 둥글게
        >
          {chartData.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={entry.value < 0 ? "#3b82f6" : "#ef4444"} // 왼쪽(음수)은 파란색, 오른쪽(양수)은 빨간색
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
