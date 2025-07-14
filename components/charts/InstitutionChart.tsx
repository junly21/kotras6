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
import { SettlementByInstitutionData } from "@/types/settlementByInstitution";
import { Unit } from "@/components/ui/UnitRadioGroup";

interface Props {
  data: SettlementByInstitutionData[];
  unit: Unit;
}

export function InstitutionChart({ data, unit }: Props) {
  // 데이터가 없으면 빈 div 반환
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">차트 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  // 데이터 디버깅
  console.log("InstitutionChart - 원본 데이터:", data);

  // 차트용 데이터 변환 - 단순화
  const chartData = data.map((item) => ({
    name: item.oper_nm,
    지급: Number(item.payment_amount),
    수급: Number(item.receipt_amount),
  }));

  console.log("InstitutionChart - 변환된 차트 데이터:", chartData);

  // 단위별 포맷터 함수
  const formatValue = (value: number) => {
    if (unit === "원") {
      return value.toLocaleString() + "원";
    } else {
      return value.toLocaleString() + unit;
    }
  };

  // 툴팁 포맷터
  const tooltipFormatter = (value: number, name: string) => {
    return [formatValue(value), name];
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => formatValue(value)} />
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
          <Bar dataKey="지급" fill="#8884d8" isAnimationActive={false} />
          <Bar dataKey="수급" fill="#82ca9d" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
