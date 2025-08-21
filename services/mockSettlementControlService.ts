export interface MockSettlementControlResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  originalData?: unknown; // 원본 백엔드 응답 데이터 (디버깅용)
}

export class MockSettlementControlService {
  // 모의정산 실행여부 체크
  static async checkIsRunning(): Promise<MockSettlementControlResponse> {
    try {
      const response = await fetch("/api/mock-settlement/is-running", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // 백엔드 응답의 data 필드가 배열이고 실제 데이터가 있는 경우에만 실행 중으로 판단
      const isRunning =
        Array.isArray(responseData.data) && responseData.data.length > 0;

      return {
        success: true,
        data: isRunning, // boolean 값으로 변환하여 반환
        originalData: responseData, // 원본 데이터도 함께 반환 (디버깅용)
      };
    } catch (error) {
      console.error("모의정산 실행여부 체크 실패:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      };
    }
  }

  // 모의정산 강제종료
  static async stopSimulation(): Promise<MockSettlementControlResponse> {
    try {
      const response = await fetch("/api/mock-settlement/stop", {
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
      return { success: true, data };
    } catch (error) {
      console.error("모의정산 강제종료 실패:", error);
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
