"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { Toast } from "@/components/ui/Toast";
import { FilterForm } from "@/components/ui/FilterForm";
import { NetworkService } from "@/services/networkService";
import { OptimalRouteService } from "@/services/optimalRouteService";
import { OptimalRouteFilters, OptimalRouteData } from "@/types/optimalRoute";
import type { NetworkOption, StationOption } from "@/types/optimalRoute";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { useNetworkData } from "@/hooks/useNetworkData";
import type { NetworkMapHighlight } from "@/types/network";

export default function NetworkOptimalRoutePage() {
  const [filters, setFilters] = useState<OptimalRouteFilters>({
    network: "",
    startStation: "",
    endStation: "",
  });

  // 검색 수행 여부 상태
  const [hasSearched, setHasSearched] = useState(false);

  // 토스트 상태
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isVisible: false,
    message: "",
    type: "info",
  });

  // 옵션 상태
  const [networkOptions, setNetworkOptions] = useState<NetworkOption[]>([]);
  const [stationOptions, setStationOptions] = useState<StationOption[]>([]);

  // 결과 데이터 상태
  const [routeData, setRouteData] = useState<OptimalRouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 네트워크 데이터 로드
  const {
    nodes,
    links,
    svgText,
    isLoading: isMapLoading,
    error: mapError,
  } = useNetworkData();

  // 최적경로 하이라이트 계산
  const routeHighlights = useMemo((): NetworkMapHighlight[] => {
    if (!routeData?.data || routeData.data.length === 0) {
      return [];
    }

    // rank 1인 경로만 사용
    const bestRoute = routeData.data.find((route) => route.rank === 1);
    if (!bestRoute?.path_num) {
      return [];
    }

    return [
      {
        type: "path",
        value: bestRoute.path_num,
        priority: 1,
      },
    ];
  }, [routeData]);

  // 네트워크 목록 로드
  useEffect(() => {
    NetworkService.getNetworkList()
      .then((res) => {
        if (res.success) {
          const options = (res.data || []).map((option) => ({
            value: String(option.value),
            label: String(option.label),
          }));
          setNetworkOptions(options);
          // 네트워크 옵션 받아오면 첫 번째 값 자동 설정
          if (options.length > 0) {
            setFilters((prev) => ({
              ...prev,
              network: options[0].value,
            }));
          }
        } else {
          setNetworkOptions([]);
          setToast({
            isVisible: true,
            message: res.error || "네트워크 목록 로드 실패",
            type: "error",
          });
        }
      })
      .catch((error) => {
        setNetworkOptions([]);
        setToast({
          isVisible: true,
          message: String(error),
          type: "error",
        });
      });
  }, []);

  // 역 목록 로드
  useEffect(() => {
    if (filters.network) {
      fetch("/api/selectNetWorkNodeList")
        .then((res) => res.json())
        .then((data) => {
          const options: StationOption[] = Array.isArray(data.options)
            ? data.options.map((option: StationOption) => ({
                value: String(option.value),
                label: String(option.label),
              }))
            : [];
          setStationOptions(options);
        })
        .catch(() => {
          setStationOptions([]);
          setToast({
            isVisible: true,
            message: "역 목록 로드 실패",
            type: "error",
          });
        });
    } else {
      setStationOptions([]);
    }
  }, [filters.network]);

  // 최적경로 조회
  const handleSearch = useCallback(async (values: OptimalRouteFilters) => {
    setHasSearched(true);
    setFilters(values);
    setIsLoading(true);

    try {
      const result = await OptimalRouteService.getOptimalRoute(values);

      if (result.success && result.data) {
        setRouteData(result.data);
        setToast({
          isVisible: true,
          message: "최적경로를 성공적으로 조회했습니다.",
          type: "success",
        });
      } else {
        setRouteData(null);
        setToast({
          isVisible: true,
          message: result.error || "최적경로 조회 실패",
          type: "error",
        });
      }
    } catch (error) {
      setRouteData(null);
      setToast({
        isVisible: true,
        message: String(error),
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">최적경로</h1>

      {/* 필터폼 */}
      <FilterForm<OptimalRouteFilters>
        fields={[
          {
            name: "network",
            label: "네트워크명",
            type: "select",
            options: networkOptions,
            required: true,
          },
          {
            name: "startStation",
            label: "출발역",
            type: "combobox",
            options: stationOptions,
            required: true,
            disabled: !filters.network,
          },
          {
            name: "endStation",
            label: "도착역",
            type: "combobox",
            options: stationOptions,
            required: true,
            disabled: !filters.network,
          },
        ]}
        defaultValues={{ network: "", startStation: "", endStation: "" }}
        values={filters}
        onChange={setFilters}
        onSearch={handleSearch}
      />

      {/* 결과 표시 영역 */}
      {hasSearched && (
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : routeData && routeData.data && routeData.data.length > 0 ? (
            <div className="space-y-6">
              {/* 상단: 경로 요약 + 상세 경로 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 경로 요약 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    경로 요약
                  </h3>
                  {(() => {
                    const bestRoute = routeData.data.find(
                      (route) => route.rank === 1
                    );
                    if (!bestRoute) return <div>경로 정보가 없습니다.</div>;

                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <span className="text-blue-600 font-medium">
                              출발역:
                            </span>
                            <span className="ml-2">{bestRoute.start_node}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-blue-600 font-medium">
                              도착역:
                            </span>
                            <span className="ml-2">{bestRoute.end_node}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-blue-600 font-medium">
                              거리:
                            </span>
                            <span className="ml-2">{bestRoute.km}km</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-blue-600 font-medium">
                              소요시간:
                            </span>
                            <span className="ml-2">
                              {Math.round(bestRoute.sta_pass_sec / 60)}분
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-blue-600 font-medium">
                              환승:
                            </span>
                            <span className="ml-2">
                              {bestRoute.transfers_cnt}회
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-blue-600 font-medium">
                              비용:
                            </span>
                            <span className="ml-2">
                              {bestRoute.total_cost}원
                            </span>
                          </div>
                        </div>
                        {bestRoute.transfer_list &&
                          bestRoute.transfer_list.length > 0 && (
                            <div>
                              <span className="text-blue-600 font-medium">
                                환승역:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {bestRoute.transfer_list.map((station, idx) => (
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
                    );
                  })()}
                </div>

                {/* 상세 경로 */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    상세 경로
                  </h3>
                  {(() => {
                    const bestRoute = routeData.data.find(
                      (route) => route.rank === 1
                    );
                    if (!bestRoute?.path_nm)
                      return <div>경로 정보가 없습니다.</div>;

                    return (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {bestRoute.path_nm.map((station, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="ml-3 flex-1">
                              <span className="text-gray-900">{station}</span>
                              {bestRoute.transfer_list &&
                                bestRoute.transfer_list.includes(station) && (
                                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                    환승
                                  </span>
                                )}
                            </div>
                            {index < bestRoute.path_nm.length - 1 && (
                              <div className="w-4 h-0.5 bg-gray-300 mx-2"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 하단: 노선도 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  노선도
                </h3>
                {isMapLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      노선도를 불러오는 중...
                    </span>
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
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              조회 결과가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 토스트 알림 */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
