import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouteSearchResult } from "@/types/routeSearch";

interface RouteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: RouteSearchResult | null;
}

export function RouteDetailDialog({
  open,
  onOpenChange,
  route,
}: RouteDetailDialogProps) {
  if (!route) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>상세 경로 정보</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid  grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">거리</h3>
              <p className="text-lg font-semibold">{route.km?.toFixed(1)}km</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                이동시간
              </h3>
              <p className="text-lg font-semibold">
                {Math.round((route.sta_pass_sec || 0) / 60)}분
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                시간비용
              </h3>
              <p className="text-lg font-semibold">
                {route.cost?.toLocaleString()}
              </p>
            </div>
          </div>
          {/* 운영사 정보 - 중복 제거 및 '환승' 제외
          {uniqueOperators.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">운영사</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueOperators.map((operator, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {operator}
                  </span>
                ))}
              </div>
            </div>
          )} */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              전체 경로
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {formatPath(route.path_nm)}
              </pre>
            </div>
          </div>
          {/* <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">환승역</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {uniqueTransfers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {uniqueTransfers.map((stationName, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {stationName}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">환승역 없음</p>
              )}
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
