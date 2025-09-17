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
    const max = Math.max(1, ...chartData.map((item) => Math.abs(item.value)));
    const maxInEok = max / 100000000;

    // 데이터 크기에 따라 적절한 단위로 올림
    let roundedMax: number;

    if (maxInEok <= 0.5) {
      roundedMax = Math.ceil(maxInEok / 0.1) * 0.1; // 0.1억 단위
    } else if (maxInEok <= 2) {
      roundedMax = Math.ceil(maxInEok / 0.2) * 0.2; // 0.2억 단위
    } else if (maxInEok <= 5) {
      roundedMax = Math.ceil(maxInEok / 0.5) * 0.5; // 0.5억 단위
    } else if (maxInEok <= 10) {
      roundedMax = Math.ceil(maxInEok / 1) * 1; // 1억 단위
    } else if (maxInEok <= 50) {
      roundedMax = Math.ceil(maxInEok / 5) * 5; // 5억 단위
    } else if (maxInEok <= 100) {
      roundedMax = Math.ceil(maxInEok / 10) * 10; // 10억 단위
    } else if (maxInEok <= 500) {
      roundedMax = Math.ceil(maxInEok / 50) * 50; // 50억 단위
    } else {
      roundedMax = Math.ceil(maxInEok / 100) * 100; // 100억 단위
    }

    return roundedMax * 100000000; // 원 단위로 변환
  }, [chartData]);

  // 틱 간격을 동적으로 계산
  const tickInterval = useMemo(() => {
    const maxAbsInEok = maxAbs / 100000000;

    if (maxAbsInEok <= 0.5) {
      return 0.1; // 0.5억 이하면 0.1억 간격
    } else if (maxAbsInEok <= 2) {
      return 0.2; // 2억 이하면 0.2억 간격
    } else if (maxAbsInEok <= 5) {
      return 0.5; // 5억 이하면 0.5억 간격
    } else if (maxAbsInEok <= 10) {
      return 1; // 10억 이하면 1억 간격
    } else if (maxAbsInEok <= 50) {
      return 5; // 50억 이하면 5억 간격
    } else if (maxAbsInEok <= 100) {
      return 10; // 100억 이하면 10억 간격
    } else if (maxAbsInEok <= 500) {
      return 50; // 500억 이하면 50억 간격
    } else {
      return 100; // 500억 초과면 100억 간격
    }
  }, [maxAbs]);

  const formatValue = (value: number) => {
    // '억' 단위로 고정하고 소수점 1자리까지 표시
    const valueInEok = value / 100000000;
    // 0.0억은 0억으로 표시
    if (valueInEok === 0) return "0";
    return valueInEok.toFixed(0);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 단위 표시 */}
      <div className="flex justify-end mb-2">
        <span className="text-sm text-gray-600 font-medium">단위: 억 원</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
            // 0을 기준으로 한 수직선 강조
            verticalPoints={[0]}
            vertical={{
              stroke: "#999",
              strokeWidth: 2,
              strokeDasharray: "none",
            }}
          />
          <XAxis
            type="number"
            domain={[-maxAbs, maxAbs]}
            tickFormatter={(v) => {
              // 음수는 -표시, 양수는 + 없이 표시 (0은 그대로)
              if (v === 0) return "0";
              if (v < 0) return "-" + formatValue(Math.abs(v));
              return formatValue(v); // 양수는 + 없이
            }}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: "#666" }}
            tickLine={{ stroke: "#666" }}
            interval={0} // 모든 틱 표시 강제
            // 동적으로 계산된 틱 간격으로 틱 생성
            ticks={(() => {
              const ticks = [];
              const interval = tickInterval * 100000000; // 억 단위를 원 단위로 변환

              // 음수 틱들 생성 (0 제외)
              for (let i = -maxAbs; i < 0; i += interval) {
                // -0.0억 같은 값은 제외
                if (Math.abs(i) >= interval) {
                  ticks.push(i);
                }
              }

              // 0 추가
              ticks.push(0);

              // 양수 틱들 생성 (0 제외)
              for (let i = interval; i <= maxAbs; i += interval) {
                ticks.push(i);
              }

              return ticks;
            })()}
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
