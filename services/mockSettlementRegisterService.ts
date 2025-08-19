import { ApiResponse } from "./apiClient";
import {
  MockSettlementRegisterFilters,
  MockSettlementRegisterData,
  MockSettlementRegisterFormData,
} from "@/types/mockSettlementRegister";

export class MockSettlementRegisterService {
  // 모의정산 등록 데이터 조회
  static async getMockSettlementData(
    filters: MockSettlementRegisterFilters
  ): Promise<ApiResponse<MockSettlementRegisterData[]>> {
    try {
      const response = await fetch("/api/mock-settlement/register", {
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
      console.error("모의정산 등록 데이터 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 정산명 목록 조회
  static async getSettlementNames(): Promise<
    ApiResponse<{ label: string; value: string }[]>
  > {
    try {
      const response = await fetch("/api/mock-settlement/settlement-names", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.options || [] };
    } catch (error) {
      console.error("정산명 목록 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 거래일자 목록 조회
  static async getTransactionDates(): Promise<
    ApiResponse<{ label: string; value: string }[]>
  > {
    try {
      const response = await fetch("/api/mock-settlement/transaction-dates", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.options || [] };
    } catch (error) {
      console.error("거래일자 목록 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 모의정산 등록
  static async registerMockSettlement(
    formData: MockSettlementRegisterFormData
  ): Promise<ApiResponse> {
    try {
      // 모의정산 등록은 장시간 작업이므로 20분 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30 * 60 * 1000); // 20분

      const response = await fetch("/api/mock-settlement/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          data: formData,
        }),
        signal: controller.signal,
      });

      // 타임아웃 타이머 정리
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      // 타임아웃 타이머 정리
      if (error instanceof Error && error.name === "AbortError") {
        console.error("모의정산 등록 타임아웃:", error);
        return {
          success: false,
          error: "모의정산 등록이 타임아웃되었습니다. (20분)",
        };
      }

      console.error("모의정산 등록 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
