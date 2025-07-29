import { ApiClient } from "./apiClient";
import { NetworkFileUploadFilters } from "@/types/networkFileUpload";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class NetworkFileUploadService {
  // 네트워크 파일 목록 조회
  static async getNetworkFileList(
    filters: NetworkFileUploadFilters
  ): Promise<ApiResponse<unknown>> {
    return ApiClient.post<unknown>("/selectNetWorkList", {
      NET_DT: filters.network,
    });
  }

  // 네트워크 노드 목록 조회
  static async getNetworkNodeList(
    netDt: string
  ): Promise<ApiResponse<unknown>> {
    return ApiClient.post<unknown>("/selectNetWorkNodeList", {
      NET_DT: netDt,
    });
  }

  // 네트워크 링크 목록 조회
  static async getNetworkLineList(
    netDt: string
  ): Promise<ApiResponse<unknown>> {
    return ApiClient.post<unknown>("/selectNetWorkLineList", {
      NET_DT: netDt,
    });
  }

  // 네트워크 플랫폼 목록 조회
  static async getNetworkPlatformList(
    netDt: string
  ): Promise<ApiResponse<unknown>> {
    return ApiClient.post<unknown>("/selectNetWorkPlatformList", {
      NET_DT: netDt,
    });
  }
}
