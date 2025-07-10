import { ApiClient, ApiResponse } from "./apiClient";
import {
  CommonCodeData,
  CommonCodeFormData,
  CommonCodeDeleteRequest,
} from "@/types/commonCode";

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
  static async deleteCommonCode(
    data: CommonCodeDeleteRequest
  ): Promise<ApiResponse<{ success: boolean }>> {
    return ApiClient.post<{ success: boolean }>("/common-codes/delete", data);
  }
}
