import { ApiClient, ApiResponse } from "./apiClient";
import { TransactionAnalysisData } from "@/types/transactionAnalysis";

export interface RawAnalysisData {
  ride_nm: string; // 승차역
  algh_nm: string; // 하차역
  cnt: number; // 데이터건수
  OPER_NM: string; // 승차기관명
}

export class TransactionAnalysisService {
  static async getAnalysisData(filters: {
    agency: string;
  }): Promise<ApiResponse<RawAnalysisData[]>> {
    // 실제 API에 맞는 요청 파라미터로 전송
    const response = await ApiClient.post<RawAnalysisData[]>(
      "/selectCntStatsList.do",
      {
        params: {
          OPER_ID: filters.agency || "ALL",
        },
      }
    );

    // 응답 매핑
    const mapped: RawAnalysisData[] = (response.data || []).map((item) => ({
      agency: item.OPER_NM,
      boardingStation: item.ride_nm,
      alightingStation: item.algh_nm,
      dataCount: item.cnt,
    }));

    return { ...response, data: mapped };
  }
}
