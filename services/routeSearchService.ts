import { ApiResponse } from "@/services/apiClient";
import { RouteSearchFilter, RouteSearchResult } from "@/types/routeSearch";

export class RouteSearchService {
  // 네트워크 노드 목록 조회 (역 목록용) - Next.js API 라우트 사용
  static async getStationOptions(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch("/api/selectNetWorkNodeList", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("RouteSearchService - 역 목록 API 응답:", result);

      if (result.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return { success: true, data: result.options || [] };
    } catch (error) {
      console.error("역 목록 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 경로탐색 결과 조회 - Next.js API 라우트 사용
  static async getRouteSearchResults(
    filter: RouteSearchFilter
  ): Promise<ApiResponse<RouteSearchResult[]>> {
    try {
      const response = await fetch("/api/route-search/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filter),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("RouteSearchService - 경로탐색 결과 API 응답:", result);

      if (result.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return { success: true, data: result || [] };
    } catch (error) {
      console.error("경로탐색 결과 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
