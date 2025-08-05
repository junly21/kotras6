import { ApiResponse } from "./apiClient";
import {
  SettlementByOdFilters,
  SettlementByOdData,
  SettlementByOdDetailData,
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

  static async getSettlementDetailData(
    pathKey: string,
    pathId: string
  ): Promise<ApiResponse<SettlementByOdDetailData[]>> {
    try {
      const response = await fetch("/api/settlement/by-od/detail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          PATH_KEY: pathKey,
          PATH_ID: pathId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(
        "SettlementByOdService - OD별 정산 상세정보 API 응답:",
        result
      );

      if (result.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return { success: true, data: result || [] };
    } catch (error) {
      console.error("OD별 정산 상세정보 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
