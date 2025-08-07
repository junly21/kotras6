import { OptimalRouteItem } from "@/types/optimalRoute";

interface RouteDetailProps {
  route: OptimalRouteItem;
}

export function RouteDetail({ route }: RouteDetailProps) {
  if (!route?.path_nm) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">상세 경로</h3>
        <div>경로 정보가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">상세 경로</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {route.path_nm.map((station, index) => (
          <div key={index} className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
              {index + 1}
            </div>
            <div className="ml-3 flex-1">
              <span className="text-gray-900">{station}</span>
              {route.transfer_list && route.transfer_list.includes(station) && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                  환승
                </span>
              )}
            </div>
            {index < route.path_nm.length - 1 && (
              <div className="w-4 h-0.5 bg-gray-300 mx-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
