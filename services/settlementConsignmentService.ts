import { ApiResponse } from "./apiClient";
import {
  SettlementConsignmentFilters,
  SettlementConsignmentData,
} from "@/types/settlementConsignment";

export class SettlementConsignmentService {
  static async getSettlementData(
    filters: SettlementConsignmentFilters
  ): Promise<ApiResponse<SettlementConsignmentData[]>> {
    try {
      console.log("위탁구간 조회 API 호출:", filters);

      const response = await fetch("/api/settlement/consignment", {
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
      console.log("위탁구간 조회 API 응답:", result);

      if (result.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error("위탁구간 조회 API 호출 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
