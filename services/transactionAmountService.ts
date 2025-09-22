import { ApiClient, ApiResponse } from "./apiClient";
import {
  TransactionAmountFilters,
  TransactionAmountRawData,
  AgencyOption,
} from "@/types/transactionAmount";

export class TransactionAmountService {
  // 기관 목록 조회 (GET 요청)
  static async getAgencyList(): Promise<ApiResponse<AgencyOption[]>> {
    return ApiClient.get<AgencyOption[]>("/transaction-analysis/agencies");
  }

  // 거래내역 분석 데이터 조회 (POST 요청)
  static async getAmountData(
    filters: TransactionAmountFilters
  ): Promise<ApiResponse<TransactionAmountRawData[]>> {
    const requestBody = {
      params: {
        agency: filters.agency,
      },
    };

    return ApiClient.post<TransactionAmountRawData[]>(
      "/transaction-amount/data",
      requestBody
    );
  }
}
