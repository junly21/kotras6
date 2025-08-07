import { ApiClient, ApiResponse } from "./apiClient";
import {
  TransactionDetailFilters,
  TransactionDetailData,
} from "@/types/transactionDetail";

export class TransactionDetailService {
  // 상세조회 데이터 조회 (POST 요청)
  static async getDetailData(
    filters: TransactionDetailFilters
  ): Promise<ApiResponse<TransactionDetailData[]>> {
    const requestBody = {
      params: {
        tradeDate: filters.tradeDate,
        cardType: filters.cardType,
        agency: filters.agency,
        line: filters.line,
        stationDiv: filters.stationDiv,
        stations: filters.stations,
      },
    };

    console.log("TransactionDetailService requestBody:", requestBody);

    return ApiClient.post<TransactionDetailData[]>(
      "/transaction-detail/data",
      requestBody
    );
  }
}
