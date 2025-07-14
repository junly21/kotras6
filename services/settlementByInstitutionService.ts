import { ApiClient, ApiResponse } from "./apiClient";
import {
  SettlementByInstitutionFilters,
  SettlementByInstitutionData,
} from "@/types/settlementByInstitution";

export class SettlementByInstitutionService {
  // 정산결과 기관별 조회 데이터 조회 (POST 요청)
  static async getSettlementData(
    filters: SettlementByInstitutionFilters
  ): Promise<ApiResponse<SettlementByInstitutionData[]>> {
    const requestBody = {
      agency: filters.agency,
    };

    return ApiClient.post<SettlementByInstitutionData[]>(
      "/settlement/by-institution",
      requestBody
    );
  }
}
