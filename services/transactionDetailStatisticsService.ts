import { ApiClient, ApiResponse } from "./apiClient";
import {
  TransactionDetailStatisticsData,
} from "@/types/transactionDetailStatistics";

export interface DetailStatisticsParams {
  tradeDates: string[];
  agency: string;
  lineNms: string[];
  stationDiv: string;
  cardType: string;
}

export class TransactionDetailStatisticsService {
  static async getStatisticsData(
    params: DetailStatisticsParams
  ): Promise<ApiResponse<TransactionDetailStatisticsData[]>> {
    const requestBody = {
      params: {
        tradeDates: params.tradeDates,
        agency: params.agency,
        lineNms: params.lineNms,
        stationDiv: params.stationDiv,
        cardType: params.cardType,
      },
    };

    return ApiClient.post<TransactionDetailStatisticsData[]>(
      "/transaction-detail-statistics/data",
      requestBody
    );
  }
}
