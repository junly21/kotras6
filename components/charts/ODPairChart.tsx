"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
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

export const ODPairChart = React.memo(
  function ODPairChart({ data }: Props) {
    // 상위 10개 데이터 메모이제이션
    const topData = useMemo(() => {
      console.log("ODPairChart 원본 데이터:", data);
      const sorted = data
        .sort((a, b) => b.cnt - a.cnt)
        .slice(0, 10)
        .map((item, index) => ({
          ...item,
          순위: index + 1,
          출발도착: `${item.ride_nm} → ${item.algh_nm}`,
        }));
      console.log("ODPairChart 상위 10개 데이터:", sorted);
      return sorted;
    }, [data]);

    // Y축 최대값과 틱 간격 계산
    const yAxisConfig = useMemo(() => {
      if (!topData || topData.length === 0) {
        return { maxValue: 100, tickInterval: 20 };
      }

      const maxValue = Math.max(...topData.map((item) => item.cnt));

      // 최대값을 깔끔하게 올림
      let roundedMax: number;
      let tickInterval: number;

      if (maxValue <= 1000) {
        tickInterval = 100;
        roundedMax = Math.ceil(maxValue / 100) * 100;
      } else if (maxValue <= 10000) {
        tickInterval = 1000;
        roundedMax = Math.ceil(maxValue / 1000) * 1000;
      } else if (maxValue <= 50000) {
        tickInterval = 5000;
        roundedMax = Math.ceil(maxValue / 5000) * 5000;
      } else if (maxValue <= 200000) {
        tickInterval = 40000;
        roundedMax = Math.ceil(maxValue / 20000) * 20000;
      } else if (maxValue <= 1000000) {
        tickInterval = 100000;
        roundedMax = Math.ceil(maxValue / 100000) * 100000;
      } else {
        tickInterval = 200000;
        roundedMax = Math.ceil(maxValue / 200000) * 200000;
      }

      return { maxValue: roundedMax, tickInterval };
    }, [topData]);

    // x축 텍스트 정리 함수 (transition 제거, (~~~) 제거)
    const cleanXAxisText = useMemo(() => {
      return (text: string) => {
        return text
          .replace(/\([^)]*\)/g, "") // (~~~) 제거
          .replace(/transition/gi, "") // transition 제거 (대소문자 구분 없이)
          .trim(); // 앞뒤 공백 제거
      };
    }, []);

    const formatValue = useMemo(
      () => (value: number) => {
        return value.toLocaleString();
      },
      []
    );

    // 커스텀 툴팁 메모이제이션
    const CustomTooltip = useMemo(() => {
      const TooltipComponent = ({
        active,
        payload,
        label,
      }: {
        active?: boolean;
        payload?: Array<{ value: number }>;
        label?: string;
      }) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
              <p className="text-gray-900 font-medium mb-1">{label}</p>
              <p className="text-blue-600 font-semibold flex justify-center">
                {formatValue(payload[0].value)}
              </p>
            </div>
          );
        }
        return null;
      };
      TooltipComponent.displayName = "CustomTooltip";
      return TooltipComponent;
    }, [formatValue]);

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
              margin={{ top: 40, right: 30, left: -20, bottom: -20 }}>
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
                angle={0}
                textAnchor="middle"
                height={80}
                interval={0}
                tickFormatter={cleanXAxisText}
              />

              {/* Y축 (숫자) */}
              <YAxis
                type="number"
                domain={[0, yAxisConfig.maxValue]}
                tickFormatter={formatValue}
                tick={{ fontSize: 11, fill: "#666" }}
                width={80}
                // 동적으로 계산된 틱 간격으로 깔끔한 Y축 설정
                ticks={(() => {
                  const ticks = [];
                  for (
                    let i = 0;
                    i <= yAxisConfig.maxValue;
                    i += yAxisConfig.tickInterval
                  ) {
                    ticks.push(i);
                  }
                  return ticks;
                })()}
              />

              {/* 툴팁 */}
              <Tooltip content={<CustomTooltip />} />

              {/* 막대 */}
              <Bar
                dataKey="cnt"
                radius={[5, 5, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
                barSize={30}>
                <LabelList
                  dataKey="cnt"
                  position="top"
                  formatter={(value: React.ReactNode) =>
                    formatValue(value as number)
                  }
                  style={{
                    fontSize: 11,
                    fill: "#666",
                    fontWeight: "500",
                    textAnchor: "middle",
                    pointerEvents: "none",
                  }}
                  offset={10}
                />
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
  },
  (prevProps, nextProps) => {
    // 데이터 배열의 길이가 다르면 리렌더링
    if (prevProps.data.length !== nextProps.data.length) {
      return false;
    }

    // 각 항목의 cnt 값이 다르면 리렌더링
    for (let i = 0; i < prevProps.data.length; i++) {
      if (prevProps.data[i].cnt !== nextProps.data[i].cnt) {
        return false;
      }
    }

    // 데이터가 같으면 리렌더링하지 않음
    return true;
  }
);
