import { ApiResponse } from "./apiClient";
import {
  MockSettlementByOdFilters,
  MockSettlementByOdData,
  MockSettlementByOdDetailData,
  MockSettlementInfo,
} from "@/types/mockSettlementByOd";

export class MockSettlementByOdService {
  // 모의정산 정보 조회
  static async getSettlementInfo(
    settlementName: string
  ): Promise<ApiResponse<MockSettlementInfo[]>> {
    try {
      const response = await fetch("/api/mock-settlement/settlement-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settlementName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("모의정산 정보 조회 실패:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  // 모의정산 OD별 정산 데이터 조회
  static async getSettlementData(
    filters: MockSettlementByOdFilters
  ): Promise<ApiResponse<MockSettlementByOdData[]>> {
    try {
      const response = await fetch("/api/mock-settlement/by-od", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settlementName: filters.settlementName,
          STN_ID1: filters.STN_ID1,
          STN_ID2: filters.STN_ID2,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("모의정산 OD별 정산 데이터 조회 실패:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  // 모의정산 OD별 정산 상세정보 조회
  static async getSettlementDetailData(
    pathKey: string,
    pathId: string
  ): Promise<ApiResponse<MockSettlementByOdDetailData[]>> {
    try {
      const response = await fetch("/api/mock-settlement/by-od/detail", {
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

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("모의정산 OD별 정산 상세정보 조회 실패:", error);
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
