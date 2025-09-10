import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { useNetworkData } from "@/hooks/useNetworkData";
import type { NetworkMapHighlight } from "@/types/network";
import { OptimalRouteItem } from "@/types/optimalRoute";

interface OptimalRouteMapProps {
  route: OptimalRouteItem;
  startStationId?: string;
  endStationId?: string;
}

export function OptimalRouteMap({
  route,
  startStationId: filterStartStationId,
  endStationId: filterEndStationId,
}: OptimalRouteMapProps) {
  const {
    nodes,
    links,
    svgText,
    isLoading: isMapLoading,
    error: mapError,
  } = useNetworkData();

  // 최적경로 하이라이트 계산
  const routeHighlights: NetworkMapHighlight[] = route?.path_num
    ? [
        {
          type: "path",
          value: route.path_num,
          priority: 1,
        },
      ]
    : [];

  // 출발역/도착역 ID 추출
  // 필터에서 선택한 역 ID가 있으면 그것을 사용, 없으면 route의 노드 ID 사용
  const startStationId = filterStartStationId || route?.start_node;
  const endStationId = filterEndStationId || route?.end_node;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">노선도</h3>
      {isMapLoading ? (
        <div className="flex items-center justify-center h-[464px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">노선도를 불러오는 중...</span>
        </div>
      ) : mapError ? (
        <div className="flex items-center justify-center h-[464px] text-red-600">
          노선도 로드 실패: {mapError}
        </div>
      ) : (
        <div className="h-[464px]">
          <NetworkMap
            nodes={nodes}
            links={links}
            svgText={svgText}
            highlights={routeHighlights}
            startStationId={startStationId}
            endStationId={endStationId}
            config={{
              width: "100%",
              height: "100%",
              showZoomControls: true,
              showTooltips: true,
              showLegend: true,
              defaultZoom: 0.25,
              defaultPan: { x: 100, y: -600 },
            }}
          />
        </div>
      )}
    </div>
  );
}
