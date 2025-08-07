"use client";

import { useCallback, useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { FilterForm } from "@/components/ui/FilterForm";
import { OptimalRouteService } from "@/services/optimalRouteService";
import { OptimalRouteFilters, OptimalRouteData } from "@/types/optimalRoute";
import { optimalRouteFields } from "@/features/optimalRoute/filterConfig";
import { RouteSummary } from "@/components/optimalRoute/RouteSummary";
import { RouteDetail } from "@/components/optimalRoute/RouteDetail";
import { OptimalRouteMap } from "@/components/optimalRoute/OptimalRouteMap";

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

  // 결과 데이터 상태
  const [routeData, setRouteData] = useState<OptimalRouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // 최고 순위 경로 가져오기
  const bestRoute = routeData?.data?.find((route) => route.rank === 1);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">최적경로</h1>

      {/* 필터폼 */}
      <FilterForm<OptimalRouteFilters>
        fields={optimalRouteFields}
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
              <OptimalRouteMap route={bestRoute} />
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
