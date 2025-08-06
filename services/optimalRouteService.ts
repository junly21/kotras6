import type {
  OptimalRouteData,
  OptimalRouteFilters,
} from "@/types/optimalRoute";

export class OptimalRouteService {
  static async getOptimalRoute(filters: OptimalRouteFilters): Promise<{
    success: boolean;
    data?: OptimalRouteData;
    error?: string;
  }> {
    try {
      const response = await fetch("/api/selectOptimalRoute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_station: filters.startStation,
          end_station: filters.endStation,
          network_timestamp: filters.network,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("최적경로 조회 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
