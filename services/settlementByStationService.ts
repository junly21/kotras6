import { ApiResponse } from "./apiClient";
import {
  SettlementByStationFilters,
  SettlementByStationData,
} from "@/types/settlementByStation";

export class SettlementByStationService {
  static async getSettlementData(
    filters: SettlementByStationFilters
  ): Promise<ApiResponse<SettlementByStationData[]>> {
    try {
      const response = await fetch("/api/settlement/by-station", {
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
      console.log("SettlementByStationService - 역사별 정산 API 응답:", result);

      if (result.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return { success: true, data: result || [] };
    } catch (error) {
      console.error("역사별 정산 데이터 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
