"use client";

import { useCallback, useState, useEffect } from "react";
import { Toast } from "@/components/ui/Toast";
import { FilterForm } from "@/components/ui/FilterForm";
import { NetworkService } from "@/services/networkService";
import { OptimalRouteService } from "@/services/optimalRouteService";
import { OptimalRouteFilters, OptimalRouteData } from "@/types/optimalRoute";
import type { NetworkOption, StationOption } from "@/types/optimalRoute";
import { RouteSummary } from "@/components/optimalRoute/RouteSummary";
import { RouteDetail } from "@/components/optimalRoute/RouteDetail";
import { OptimalRouteMap } from "@/components/optimalRoute/OptimalRouteMap";
import { optimalRouteSchema } from "@/features/optimalRoute/filterConfig";

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

  // 네트워크 목록 로드
  useEffect(() => {
    NetworkService.getNetworkList()
      .then((res) => {
        if (res.success) {
          const options = (res.data || []).map((option) => ({
            value: String(option.value), // NET_DT 값
            label: String(option.label), // net_nm 값
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

  // 네트워크가 변경될 때 역 목록 로드
  useEffect(() => {
    if (filters.network) {
      fetch("/api/selectNetWorkNodeSelectBox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          NET_DT: filters.network,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const options = Array.isArray(data.options)
            ? data.options.map(
                (option: { value: string | number; label: string }) => ({
                  value: String(option.value),
                  label: String(option.label),
                })
              )
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
  const handleSearch = useCallback(
    async (values: OptimalRouteFilters) => {
      setHasSearched(true);
      setFilters(values);
      setIsLoading(true);

      try {
        // 선택된 역의 label(역 이름)을 찾아서 전달
        const startStationOption = stationOptions.find(
          (option) => option.value === values.startStation
        );
        const endStationOption = stationOptions.find(
          (option) => option.value === values.endStation
        );

        const searchValues = {
          ...values,
          startStation: startStationOption?.label || values.startStation,
          endStation: endStationOption?.label || values.endStation,
        };

        const result = await OptimalRouteService.getOptimalRoute(searchValues);

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
    },
    [stationOptions]
  );

  // 최고 순위 경로 가져오기
  const bestRoute = routeData?.data?.find((route) => route.rank === 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">네트워크 최적경로</h1>

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
        schema={optimalRouteSchema}
        onChange={setFilters}
        onSearch={handleSearch}
      />

      {/* 결과 표시 영역 */}
      {!hasSearched ? (
        // 조회 전 안내 메시지
        <div className="space-y-6">
          {/* 결과 영역 미리보기 */}
          <div className="space-y-6 opacity-50">
            {/* 상단: 경로 요약 + 상세 경로 미리보기 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-[24px] p-3 h-[200px] flex flex-col">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  경로 요약
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">출발역:</span>
                      <span className="ml-2 text-gray-400">-</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">도착역:</span>
                      <span className="ml-2 text-gray-400">-</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">
                        이동 거리:
                      </span>
                      <span className="ml-2 text-gray-400">-</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">
                        소요시간:
                      </span>
                      <span className="ml-2 text-gray-400">-</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">
                        환승 횟수:
                      </span>
                      <span className="ml-2 text-gray-400">-</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">
                        환승이동시간:
                      </span>
                      <span className="ml-2 text-gray-400">-</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">
                        환승대기시간:
                      </span>
                      <span className="ml-2 text-gray-400">-</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-medium">환승역:</span>
                      <span className="ml-2 text-gray-400">-</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-[24px] p-3 h-[200px] flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  상세 경로
                </h3>
                <div className="space-y-2 flex-1 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    경로 정보가 여기에 표시됩니다
                  </div>
                </div>
              </div>
            </div>

            {/* 하단: 노선도 미리보기 */}
            <h3 className="text-lg font-semibold text-gray-800 mb-3">노선도</h3>
            <div className="bg-white border border-gray-200 rounded-[24px] p-4">
              <div className="h-[400px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                    />
                  </svg>
                  <p className="text-sm">최적경로가 노선도에 표시됩니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : routeData &&
            routeData.data &&
            routeData.data.length > 0 &&
            bestRoute ? (
            <div className="space-y-6">
              {/* 상단: 경로 요약 + 상세 경로 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RouteSummary route={bestRoute} />
                <RouteDetail route={bestRoute} />
              </div>

              {/* 하단: 노선도 */}
              <OptimalRouteMap
                route={bestRoute}
                startStationId={filters.startStation}
                endStationId={filters.endStation}
              />
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
