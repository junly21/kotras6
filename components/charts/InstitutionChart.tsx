"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SettlementByInstitutionData } from "@/types/settlementByInstitution";
import { MockSettlementByInstitutionData } from "@/types/mockSettlementByInstitution";

interface Props {
  data: SettlementByInstitutionData[] | MockSettlementByInstitutionData[];
}

export function InstitutionChart({ data }: Props) {
  // 차액만 표시: 지급 > 수급이면 음수, 수급 > 지급이면 양수
  const chartData = useMemo(() => {
    return data.map((item) => {
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
  }, [data]);

  // 최대 절대값 계산 (0이면 1로 방어)
  const maxAbs = useMemo(() => {
    return Math.max(1, ...chartData.map((item) => Math.abs(item.value)));
  }, [chartData]);

  const formatValue = (value: number) => {
    // '억' 단위로 고정
    return (value / 100000000).toFixed(2) + "억";
  };

  return (
    <div className="h-full flex flex-col">
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
          <Bar
            dataKey="value"
            name="정산 차액"
            isAnimationActive={false}
            barSize={10}
            radius={[0, 5, 5, 0]}>
            {chartData.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry.value < 0 ? "#3b82f6" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 간단한 범례 */}
      <div className="flex justify-center gap-6 mt-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>지급 금액</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>수급 금액</span>
        </div>
      </div>
    </div>
  );
}
