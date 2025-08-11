import { MockSettlementByStationData } from "@/types/mockSettlementByStation";

export interface MockSettlementByStationResponse {
  success: boolean;
  data?: MockSettlementByStationData[];
  error?: string;
}

export class MockSettlementByStationService {
  static async getMockSettlementByStationData(filters: {
    settlementName: string;
    STN_ID1?: string;
    STN_ID2?: string;
    STN_ID3?: string;
    STN_ID4?: string;
    STN_ID5?: string;
  }): Promise<MockSettlementByStationResponse> {
    try {
      const response = await fetch("/api/mock-settlement/by-station", {
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
      console.error("모의정산 역사별 조회 데이터 조회 실패:", error);
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
