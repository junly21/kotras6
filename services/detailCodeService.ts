import { ApiClient, ApiResponse } from "./apiClient";
import type {
  DetailCodeData,
  DetailCodeRequest,
  DetailCodeFormData,
  DetailCodeDeleteRequest,
} from "@/types/detailCode";
import type { CommonCodeData } from "@/types/commonCode";

export class DetailCodeService {
  // 상세코드용 공통코드 목록 조회
  static async getCommonCodeList(): Promise<ApiResponse<CommonCodeData[]>> {
    return ApiClient.post<CommonCodeData[]>("/detail-codes/common-codes", {});
  }

  // 상세코드 목록 조회
  static async getDetailCodeList(
    request: DetailCodeRequest
  ): Promise<ApiResponse<DetailCodeData[]>> {
    return ApiClient.post<DetailCodeData[]>("/detail-codes", request);
  }

  // 상세코드 등록
  static async addDetailCode(
    data: DetailCodeFormData
  ): Promise<ApiResponse<{ success: boolean }>> {
    return ApiClient.post<{ success: boolean }>("/detail-codes/add", data);
  }

  // 상세코드 수정
  static async updateDetailCode(
    data: DetailCodeFormData
  ): Promise<ApiResponse<{ success: boolean }>> {
    return ApiClient.post<{ success: boolean }>("/detail-codes/update", data);
  }

  // 상세코드 삭제
  static async deleteDetailCode(
    request: DetailCodeDeleteRequest
  ): Promise<ApiResponse<{ success: boolean }>> {
    return ApiClient.post<{ success: boolean }>(
      "/detail-codes/delete",
      request
    );
  }
}
