import { ApiResponse } from "./apiClient";
import {
  MockSettlementResultFilters,
  MockSettlementResultData,
  SettlementResultData,
} from "@/types/mockSettlementResult";

export class MockSettlementResultService {
  // 모의정산 정보 데이터 조회
  static async getMockSettlementInfoData(
    simStmtGrpId: string
  ): Promise<ApiResponse<MockSettlementResultData[]>> {
    try {
      const response = await fetch("/api/mock-settlement/settlement-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ simStmtGrpId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("모의정산 정보 데이터 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 정산결과 데이터 조회
  static async getSettlementResultData(
    simStmtGrpId: string
  ): Promise<ApiResponse<SettlementResultData[]>> {
    try {
      const response = await fetch("/api/mock-settlement/result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ simStmtGrpId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("정산결과 데이터 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
