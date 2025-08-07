import { OptimalRouteItem } from "@/types/optimalRoute";

interface RouteSummaryProps {
  route: OptimalRouteItem;
}

export function RouteSummary({ route }: RouteSummaryProps) {
  // 시간을 분:초 형식으로 변환하는 함수
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">경로 요약</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <span className="text-blue-600 font-medium">출발역:</span>
            <span className="ml-2">{route.start_node}</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-medium">도착역:</span>
            <span className="ml-2">{route.end_node}</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-medium">거리:</span>
            <span className="ml-2">{route.km}km</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-medium">소요시간:</span>
            <span className="ml-2">
              {Math.round(route.sta_pass_sec / 60)}분
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-medium">환승:</span>
            <span className="ml-2">{route.transfers_cnt}회</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-medium">환승이동시간:</span>
            <span className="ml-2">{formatTime(route.trans_mv_sec)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-medium">환승대기시간:</span>
            <span className="ml-2">{formatTime(route.trans_sty_sec)}</span>
          </div>
        </div>
        {route.transfer_list && route.transfer_list.length > 0 && (
          <div>
            <span className="text-blue-600 font-medium">환승역:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {route.transfer_list.map((station, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {station}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
