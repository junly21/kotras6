import { ApiClient, ApiResponse } from "./apiClient";
import type { CommonCodeData, CommonCodeFormData } from "@/types/commonCode";

export class CommonCodeService {
  // 공통코드 목록 조회
  static async getCommonCodeList(): Promise<ApiResponse<CommonCodeData[]>> {
    return ApiClient.post<CommonCodeData[]>("/common-codes", {});
  }

  // 공통코드 등록
  static async addCommonCode(
    data: CommonCodeFormData
  ): Promise<ApiResponse<{ success: boolean }>> {
    return ApiClient.post<{ success: boolean }>("/common-codes/add", data);
  }

  // 공통코드 수정
  static async updateCommonCode(
    data: CommonCodeFormData
  ): Promise<ApiResponse<{ success: boolean }>> {
    return ApiClient.post<{ success: boolean }>("/common-codes/update", data);
  }

  // 공통코드 삭제
  static async deleteCommonCode(data: {
    COMMON_CODE: string;
  }): Promise<ApiResponse<{ success: boolean }>> {
    return ApiClient.post<{ success: boolean }>("/common-codes/delete", data);
  }

  // 상세코드 존재 여부 확인
  static async checkDetailCodesExist(
    commonCode: string
  ): Promise<ApiResponse<{ hasDetailCodes: boolean; count: number }>> {
    return ApiClient.post<{ hasDetailCodes: boolean; count: number }>(
      "/common-codes/check-detail-codes",
      { COMMON_CODE: commonCode }
    );
  }
}
