import { MockSettlementByRouteData } from "@/types/mockSettlementByRoute";

export interface MockSettlementByRouteResponse {
  success: boolean;
  data?: MockSettlementByRouteData[];
  error?: string;
}

export class MockSettlementByRouteService {
  static async getMockSettlementByRouteData(filters: {
    settlementName: string;
    agency: string;
  }): Promise<MockSettlementByRouteResponse> {
    try {
      const response = await fetch("/api/mock-settlement/by-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("모의정산 노선별 조회 데이터 조회 실패:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      };
    }
  }
}
