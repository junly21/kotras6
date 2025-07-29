export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface OptionItem {
  value: string;
  label: string;
}

interface RawNetworkItem {
  value?: string | number;
  label?: string;
  net_dt?: string | number;
  net_nm?: string;
}

export class NetworkService {
  // 네트워크 목록 조회 (공통)
  static async getNetworkList(): Promise<ApiResponse<OptionItem[]>> {
    try {
      const response = await fetch("/api/network/list");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // 응답 데이터 검증 및 변환
      if (data.options && Array.isArray(data.options)) {
        const options = data.options.map((item: RawNetworkItem) => ({
          value: String(item.value || item.net_dt || ""),
          label: String(item.label || item.net_nm || ""),
        }));
        return { success: true, data: options };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error("네트워크 목록 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
