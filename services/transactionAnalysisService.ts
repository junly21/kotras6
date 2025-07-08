import { ApiClient, ApiResponse } from "./apiClient";
import {
  TransactionAnalysisFilters,
  TransactionAnalysisData,
  AgencyOption,
} from "@/types/transactionAnalysis";

export class TransactionAnalysisService {
  // 기관 목록 조회 (GET 요청)
  static async getAgencyList(): Promise<ApiResponse<AgencyOption[]>> {
    return ApiClient.get<AgencyOption[]>("/transaction-analysis/agencies");
  }

  // 거래내역 분석 데이터 조회 (POST 요청)
  static async getAnalysisData(
    filters: TransactionAnalysisFilters
  ): Promise<ApiResponse<TransactionAnalysisData[]>> {
    const requestBody = {
      params: {
        agency: filters.agency,
      },
    };

    return ApiClient.post<TransactionAnalysisData[]>(
      "/transaction-analysis/data",
      requestBody
    );
  }
}
