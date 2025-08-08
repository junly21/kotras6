import { ApiResponse } from "./apiClient";
import {
  MockSettlementByInstitutionFilters,
  MockSettlementByInstitutionData,
} from "@/types/mockSettlementByInstitution";

export class MockSettlementByInstitutionService {
  // 모의정산 기관별 조회 데이터 조회
  static async getMockSettlementByInstitutionData(
    filters: MockSettlementByInstitutionFilters
  ): Promise<ApiResponse<MockSettlementByInstitutionData[]>> {
    try {
      const response = await fetch("/api/mock-settlement/by-institution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("모의정산 기관별 조회 데이터 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
