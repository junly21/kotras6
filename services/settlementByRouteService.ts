import { ApiClient } from "./apiClient";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SettlementByRouteData {
  // 외부 API 응답에 따라 타입 정의 필요
  [key: string]: unknown;
}

export class SettlementByRouteService {
  // 정산결과 노선별 조회
  static async getSettlementByRoute(
    agency: string
  ): Promise<ApiResponse<SettlementByRouteData[]>> {
    return ApiClient.post<SettlementByRouteData[]>("/settlement/by-route", {
      agency,
    });
  }
}
