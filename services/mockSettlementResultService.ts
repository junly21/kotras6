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

      const raw = await response.json();

      // 외부 응답 필드를 그리드에서 기대하는 필드로 매핑
      const mapped: MockSettlementResultData[] = Array.isArray(raw)
        ? raw.map((item: any) => {
            const toIsoDate = (ms: unknown) => {
              if (typeof ms === "number") {
                try {
                  return new Date(ms).toISOString().slice(0, 10);
                } catch (_e) {
                  return "";
                }
              }
              return "";
            };

            return {
              // 정산명(표시용)
              settlementName: item?.stmt_nm ?? "",
              // 거래일자: 우선 문자열 날짜, 없으면 타임스탬프 포맷
              transactionDate: item?.to_char ?? toIsoDate(item?.card_dt),
              // 태그기관/초승노선/노선동등/인.km 매핑
              tagAgency:
                item?.tag_oper_prop != null ? String(item.tag_oper_prop) : "-",
              initialLine:
                item?.start_oper_prop != null
                  ? String(item.start_oper_prop)
                  : "-",
              lineSection:
                item?.equal_prop != null ? String(item.equal_prop) : "-",
              distanceKm:
                typeof item?.km_prop === "number"
                  ? item.km_prop
                  : Number(item?.km_prop) || 0,
              // 상세 조회용 ID 보존
              simStmtGrpId: item?.sim_stmt_grp_id ?? "",
            };
          })
        : [];

      return { success: true, data: mapped };
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
