import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { useNetworkData } from "@/hooks/useNetworkData";
import type { NetworkMapHighlight } from "@/types/network";
import { OptimalRouteItem } from "@/types/optimalRoute";

interface OptimalRouteMapProps {
  route: OptimalRouteItem;
}

export function OptimalRouteMap({ route }: OptimalRouteMapProps) {
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">노선도</h3>
      {isMapLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">노선도를 불러오는 중...</span>
        </div>
      ) : mapError ? (
        <div className="flex items-center justify-center h-96 text-red-600">
          노선도 로드 실패: {mapError}
        </div>
      ) : (
        <div className="h-96">
          <NetworkMap
            nodes={nodes}
            links={links}
            svgText={svgText}
            highlights={routeHighlights}
            config={{
              width: "100%",
              height: 360,
              showZoomControls: true,
              showTooltips: true,
              defaultZoom: 1,
              defaultPan: { x: -2400, y: -2500 },
            }}
          />
        </div>
      )}
    </div>
  );
}
