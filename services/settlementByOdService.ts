import { ApiResponse } from "./apiClient";
import {
  SettlementByOdFilters,
  SettlementByOdData,
} from "@/types/settlementByOd";

export class SettlementByOdService {
  static async getSettlementData(
    filters: SettlementByOdFilters
  ): Promise<ApiResponse<SettlementByOdData[]>> {
    try {
      const response = await fetch("/api/settlement/by-od", {
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
      console.log("SettlementByOdService - OD별 정산 API 응답:", result);

      if (result.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return { success: true, data: result || [] };
    } catch (error) {
      console.error("OD별 정산 데이터 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
