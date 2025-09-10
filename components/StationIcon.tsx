import React from "react";

export type StationIconType = "start" | "end";

interface StationIconProps {
  type: StationIconType;
  x: number;
  y: number;
  scale?: number;
}

/**
 * 출발역/도착역을 표시하는 SVG 아이콘 컴포넌트
 * 여러 페이지에서 재사용 가능하도록 설계
 */
export function StationIcon({ type, x, y, scale = 1 }: StationIconProps) {
  // 스케일에 따른 아이콘 크기 조정 (최소 크기 보장)
  const minSize = 80;
  const iconSize = Math.max(minSize, 24 * scale);
  const iconHeight = Math.max(minSize * 1.4, 34 * scale);

  // 아이콘을 노드 중심에 정확히 배치
  const adjustedY = y - iconHeight / 2 - 75;

  // SVG 아이콘을 인라인으로 정의
  const StartIcon = () => (
    <svg
      width={iconSize}
      height={iconHeight}
      viewBox="0 0 24 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 33.1784C11.0895 31.9802 8.74046 28.828 6.41671 25.2089C2.54597 19.1804 0.5 14.6129 0.5 12C0.5 8.92824 1.69621 6.04033 3.86827 3.86827C6.04033 1.69621 8.92824 0.5 12 0.5C15.0718 0.5 17.9597 1.69621 20.1317 3.86827C22.3038 6.04033 23.5 8.92824 23.5 12C23.5 14.6138 21.4527 19.1835 17.5793 25.2151C15.2559 28.8331 12.9098 31.9813 12 33.1784Z"
        fill="#008000"
      />
      <path
        d="M12 1C9.06179 1 6.29945 2.1442 4.22182 4.22182C2.1442 6.29945 1 9.06179 1 12C1 13.7544 2.01205 17.4223 6.83345 24.9325C8.8639 28.0953 10.9149 30.9015 12 32.3485C13.0833 30.9041 15.1292 28.1051 17.1586 24.9449C21.9866 17.4268 23 13.7558 23 12C23 9.06179 21.8558 6.29945 19.7782 4.22182C17.7006 2.1442 14.9382 1 12 1ZM12 0C18.6274 0 24 5.37258 24 12C24 18.6274 12 34 12 34C12 34 0 18.6274 0 12C0 5.37258 5.37258 0 12 0Z"
        fill="#004500"
      />
      <path
        d="M11.9546 10.8008V11.709H8.53662V12.2656H10.9878V14.4336H6.03662V14.9219H11.2222V15.8398H4.81592V13.5938H9.75732V13.1543H4.80615V12.2656H7.29639V11.709H3.88818V10.8008H11.9546ZM4.20068 9.63867C5.97803 9.56055 6.88135 9.13574 7.14014 8.62305H4.6499V7.70508H7.29639V7.00195H8.52686V7.70508H11.1929V8.62305H8.67822C8.93213 9.13574 9.84033 9.56055 11.6323 9.63867L11.271 10.5566C9.62061 10.4736 8.47314 10.0586 7.91162 9.38965C7.3501 10.0586 6.20752 10.4736 4.54248 10.5566L4.20068 9.63867ZM14.0151 7.41211V8.4668H15.8315V7.41211H17.0815V11.2891H12.7749V7.41211H14.0151ZM13.6636 12.832V11.8652H19.562V14.2773H14.9038V14.8535H19.8159V15.8398H13.6831V13.3887H18.3218V12.832H13.6636ZM14.0151 10.3125H15.8315V9.4043H14.0151V10.3125ZM18.312 11.5332V7.01172H19.562V8.74023H20.7632V9.74609H19.562V11.5332H18.312Z"
        fill="white"
      />
    </svg>
  );

  const EndIcon = () => (
    <svg
      width={iconSize}
      height={iconHeight}
      viewBox="0 0 24 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 33.1784C11.0895 31.9802 8.74046 28.828 6.41671 25.2089C2.54597 19.1804 0.5 14.6129 0.5 12C0.5 8.92824 1.69621 6.04033 3.86827 3.86827C6.04033 1.69621 8.92824 0.5 12 0.5C15.0718 0.5 17.9597 1.69621 20.1317 3.86827C22.3038 6.04033 23.5 8.92824 23.5 12C23.5 14.6138 21.4527 19.1835 17.5793 25.2151C15.2559 28.8331 12.9098 31.9813 12 33.1784Z"
        fill="#EA5656"
      />
      <path
        d="M12 1C9.06179 1 6.29945 2.1442 4.22182 4.22182C2.1442 6.29945 1 9.06179 1 12C1 13.7544 2.01205 17.4223 6.83345 24.9325C8.8639 28.0953 10.9149 30.9015 12 32.3485C13.0833 30.9041 15.1292 28.1051 17.1586 24.9449C21.9866 17.4268 23 13.7558 23 12C23 9.06179 21.8558 6.29945 19.7782 4.22182C17.7006 2.1442 14.9382 1 12 1ZM12 0C18.6274 0 24 5.37258 24 12C24 18.6274 12 34 12 34C12 34 0 18.6274 0 12C0 5.37258 5.37258 0 12 0Z"
        fill="#EA1414"
      />
      <path
        d="M11.1147 10.9863V11.9727H8.53662V13.8672H12.0034V14.8828H3.86865V13.8672H7.29639V11.9727H4.82568V7.63672H11.0464V8.63281H6.07568V10.9863H11.1147ZM15.7827 8.92578C15.7876 9.84375 16.4224 10.8008 17.8726 11.1816L17.2964 12.168C16.2856 11.8945 15.5825 11.3086 15.1772 10.5762C14.7866 11.3818 14.0786 12.0166 13.0386 12.3145L12.4429 11.3379C13.8833 10.9473 14.5425 9.92188 14.5425 8.92578H12.7554V7.93945H14.5425V6.98242H15.8022V7.93945H17.5796V8.92578H15.7827ZM13.5757 13.8184V12.8223H19.562V15.9082H18.312V13.8184H13.5757ZM18.312 12.4609V7.01172H19.562V9.19922H20.7632V10.2441H19.562V12.4609H18.312Z"
        fill="white"
      />
    </svg>
  );

  return (
    <g transform={`translate(${x - iconSize / 2}, ${adjustedY})`}>
      {/* SVG 아이콘 */}
      {type === "start" ? <StartIcon /> : <EndIcon />}
    </g>
  );
}

/**
 * 역 이름으로부터 아이콘 위치를 계산하는 유틸리티 함수
 * SVG 렌더러에서 사용하는 것과 동일한 로직 적용
 */
export function calculateStationIconPosition(
  nodeName: string,
  textPos: { x: number; y: number }
): { x: number; y: number } {
  // 중복 역 이름 통합 함수 (렌더링용)
  const getUnifiedStationName = (nodeName: string): string => {
    // 7_이수를 총신대입구(이수)로 통합 표시
    if (nodeName === "7_이수") {
      return "4_총신대입구(이수)";
    }
    return nodeName;
  };

  const unifiedName = getUnifiedStationName(nodeName);
  const raw = unifiedName.split("_")[1] || unifiedName;
  const idx = raw.indexOf("(");
  const stationName = idx > -1 ? raw.slice(0, idx) : raw;

  // 텍스트 위치 계산 로직 (svgRenderer.tsx와 동일)
  let adjustedX = textPos.x;
  let adjustedY = textPos.y;

  if (stationName.length >= 8) adjustedX = textPos.x - 50;
  else if (stationName.length >= 6) adjustedX = textPos.x - 35;
  else if (stationName.length >= 5) adjustedX = textPos.x - 25;
  else adjustedX = textPos.x - 2;

  if (stationName.length >= 5) adjustedY = textPos.y + 20;
  else if (stationName.length >= 4) adjustedY = textPos.y + 10;
  else adjustedY = textPos.y + 3;

  return { x: adjustedX, y: adjustedY };
}
