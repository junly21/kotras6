import { RouteSearchResult } from "@/types/routeSearch";

interface RouteDetailPanelProps {
  route: RouteSearchResult | null;
}

export function RouteDetailPanel({ route }: RouteDetailPanelProps) {
  if (!route) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-[400px] rounded-[24px] p-6 flex items-center justify-center border border-blue-100">
        <div className="text-center text-gray-600">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">상세 정보</p>
          <p className="text-sm text-gray-500">
            경로를 선택하면 상세 정보가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  // 운영사 목록 처리: '환승' 제외하고 중복 제거
  const getUniqueOperators = (operList: string) => {
    if (!operList) return [];

    // 쉼표로 구분된 운영사 목록을 배열로 변환
    const operators = operList.split(",").map((op) => op.trim());

    // '환승' 제외하고 중복 제거
    const uniqueOperators = [
      ...new Set(operators.filter((op) => op !== "환승")),
    ];

    return uniqueOperators;
  };

  const uniqueOperators = getUniqueOperators(route.oper_list);

  // 환승역 중복 제거 처리
  const getUniqueTransfers = (transferList: string): string[] => {
    if (!transferList || transferList === "[]") return [];

    try {
      const transfers = JSON.parse(transferList);
      const uniqueTransfers = [
        ...new Set(
          transfers.map((transfer: string) => {
            const stationName = transfer.match(
              /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
            )?.[1];
            return stationName || transfer;
          })
        ),
      ];
      return uniqueTransfers as string[];
    } catch {
      return [];
    }
  };

  const uniqueTransfers = getUniqueTransfers(route.transfer_list);

  // 경로 표시를 위한 포맷팅 함수
  const formatPath = (pathNm: string) => {
    if (!pathNm) return "-";

    // 컴마를 화살표로 변환하고 노선별로 줄바꿈 추가
    const stations = pathNm.split(",").map((station) => station.trim());
    const formattedStations: string[] = [];

    stations.forEach((station, index) => {
      // 첫 번째 역이 아니면 화살표 추가
      if (index > 0) {
        formattedStations.push(" → ");
      }

      // 원본 역 정보 그대로 추가
      formattedStations.push(station);
    });

    return formattedStations.join("");
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 h-[400px] rounded-[24px] p-6 overflow-y-auto border border-gray-200 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          상세 경로 정보
        </h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h3 className="text-xs font-medium text-blue-600 mb-1">거리</h3>
            <p className="text-lg font-bold text-blue-800">
              {route.km?.toFixed(1)}km
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <h3 className="text-xs font-medium text-green-600 mb-1">
              이동시간
            </h3>
            <p className="text-lg font-bold text-green-800">
              {Math.round((route.sta_pass_sec || 0) / 60)}분
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <h3 className="text-xs font-medium text-purple-600 mb-1">
              시간비용
            </h3>
            <p className="text-lg font-bold text-purple-800">
              {route.cost?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            전체 경로
          </h3>
          <div className="bg-gray-50 p-3 rounded-lg border">
            <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-gray-700">
              {formatPath(route.path_nm)}
            </pre>
          </div>
        </div>

        {uniqueTransfers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              환승역
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="flex flex-wrap gap-1.5">
                {uniqueTransfers.map((stationName, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {stationName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
