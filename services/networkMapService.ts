import { ApiClient } from "./apiClient";
import { NetworkMapFilters, NodeData, LineData } from "@/types/networkMap";

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

interface RawLineItem {
  value?: string | number;
  label?: string;
  LINE_DT?: string | number;
  LINE_NM?: string;
  id?: string | number;
  name?: string;
}

export class NetworkMapService {
  // 네트워크 목록 조회
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

  // 노선 목록 조회
  static async getLineList({
    network,
    networkLabel,
  }: {
    network: string;
    networkLabel: string;
  }): Promise<ApiResponse<OptionItem[]>> {
    try {
      const response = await fetch("/api/network/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network, networkLabel }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // 응답 데이터 검증 및 변환
      if (data.options && Array.isArray(data.options)) {
        const options = data.options.map((item: RawLineItem) => ({
          value: String(item.value || item.LINE_DT || item.id || ""),
          label: String(item.label || item.LINE_NM || item.name || ""),
        }));
        return { success: true, data: options };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error("노선 목록 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 네트워크 지도 데이터 조회
  static async getMapData(
    filters: NetworkMapFilters & { networkLabel: string }
  ): Promise<ApiResponse<{ nodeData: NodeData[]; lineData: LineData[] }>> {
    return ApiClient.post<{ nodeData: NodeData[]; lineData: LineData[] }>(
      "/network/map/data",
      filters
    );
  }

  // 네트워크 노드 목록 조회
  static async getNodeList({
    network,
    networkLabel,
    lineLabel,
  }: {
    network: string; // NET_DT
    networkLabel: string; // OPER_NM
    lineLabel: string; // SUBWAY
  }) {
    const response = await fetch("/api/network/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        network,
        networkLabel,
        lineLabel,
      }),
    });
    return response.json();
  }

  // 노선 상세 목록 조회
  static async getLineDetailList({
    network,
    networkLabel,
    lineLabel,
  }: {
    network: string;
    networkLabel: string;
    lineLabel: string;
  }) {
    const response = await fetch("/api/network/line-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        network,
        networkLabel,
        lineLabel,
      }),
    });
    return response.json();
  }
}
