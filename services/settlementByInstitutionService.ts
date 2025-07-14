import { ApiClient } from "./apiClient";
import {
  SettlementByInstitutionFilters,
  SettlementByInstitutionData,
} from "@/types/settlementByInstitution";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class SettlementByInstitutionService {
  static async getSettlementData(
    filters: SettlementByInstitutionFilters
  ): Promise<ApiResponse<SettlementByInstitutionData[]>> {
    return ApiClient.post<SettlementByInstitutionData[]>(
      "/settlement/by-institution",
      filters
    );
  }
}
