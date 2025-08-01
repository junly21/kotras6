"use client";

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

// 세련된 색상 팔레트 (10가지)
const BAR_COLORS = [
  "#667eea", // 보라색
  "#f093fb", // 핑크
  "#4facfe", // 파란색
  "#43e97b", // 초록색
  "#fa709a", // 로즈
  "#a8edea", // 민트
  "#ffecd2", // 크림
  "#ff9a9e", // 살구색
  "#fecfef", // 연핑크
  "#fad0c4", // 연주황
];

export function ODPairChart({ data }: Props) {
  console.log("ODPairChart 원본 데이터:", data);

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

  // 커스텀 툴팁
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-gray-900 font-medium mb-1">{label}</p>
          <p className="text-blue-600 font-semibold">
            통행수: {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // 데이터가 없거나 빈 배열인 경우 처리
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        데이터가 없습니다.
      </div>
    );
  }

  // topData가 비어있는 경우 처리
  if (!topData || topData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* 차트 제목과 단위 */}

      {/* 차트 영역 */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topData}
            margin={{ top: 20, right: 30, left: -20, bottom: 60 }}>
            {/* Y축 그리드 (가로선만) */}
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#f0f0f0"
            />

            {/* X축 (카테고리) */}
            <XAxis
              type="category"
              dataKey="출발도착"
              tick={{ fontSize: 11, fill: "#666" }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />

            {/* Y축 (숫자) */}
            <YAxis
              type="number"
              domain={[0, (dataMax: number) => dataMax * 1.1]}
              tickFormatter={formatValue}
              tick={{ fontSize: 11, fill: "#666" }}
              width={80}
            />

            {/* 툴팁 */}
            <Tooltip content={<CustomTooltip />} />

            {/* 막대 */}
            <Bar
              dataKey="cnt"
              radius={[5, 5, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}>
              {topData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
