import { ApiClient } from "./apiClient";
import {
  NetworkFileUploadFilters,
  NetworkFileUploadData,
} from "@/types/networkFileUpload";

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

  // 네트워크 파일 업로드
  static async uploadNetworkFiles(data: {
    networkName: string;
    date: string;
    nodeFile: File;
    linkFile: File;
    platformFile: File;
  }): Promise<ApiResponse<NetworkFileUploadData>> {
    try {
      const formData = new FormData();
      formData.append("NET_NM", data.networkName);
      formData.append("NET_DT", data.date);
      formData.append("nodeFile", data.nodeFile);
      formData.append("linkFile", data.linkFile);
      formData.append("platformFile", data.platformFile);

      const response = await fetch("/api/network/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "업로드 실패");
      }

      return result;
    } catch (error) {
      console.error("네트워크 파일 업로드 중 오류:", error);
      throw error;
    }
  }
}
