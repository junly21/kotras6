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
    try {
      const response = await fetch("/api/selectNetWorkList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          NET_DT: filters.network,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 네트워크 목록을 네트워크 파일 목록 형태로 변환
      if (data.options && Array.isArray(data.options)) {
        const networkFileList = data.options.map(
          (item: { value: string; label: string }) => ({
            net_dt: item.value,
            net_nm: item.label,
            upload_date: new Date().toISOString().split("T")[0], // 임시 업로드 날짜
            file_count: 3, // 임시 파일 개수 (노드, 링크, 플랫폼)
          })
        );

        return {
          success: true,
          data: networkFileList,
        };
      }

      return {
        success: true,
        data: [],
      };
    } catch (error) {
      console.error("네트워크 파일 목록 조회 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 네트워크 노드 목록 조회
  static async getNetworkNodeList(
    netDt: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch("/api/selectNetWorkNodeList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          NET_DT: netDt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("네트워크 노드 목록 조회 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 네트워크 링크 목록 조회
  static async getNetworkLineList(
    netDt: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch("/api/selectNetWorkLineList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          NET_DT: netDt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("네트워크 링크 목록 조회 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 네트워크 플랫폼 목록 조회
  static async getNetworkPlatformList(
    netDt: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch("/api/selectNetWorkPlatformList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          NET_DT: netDt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("네트워크 플랫폼 목록 조회 실패:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
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
