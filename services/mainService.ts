import { callExternalApi } from "@/app/api/utils/externalApi";
import {
  NetworkLink,
  Node,
  Link,
  ApiResponse,
  convertToNode,
  convertToLink,
} from "@/types/network";

export interface CardStats {
  card_div: string;
  cnt: number;
  card_div_nm: string;
}

export interface ODPairStats {
  ride_nm: string;
  algh_nm: string;
  oper_nm: string;
  ride_stn_id: string;
  cnt: number;
  algh_stn_id: string;
  oper_id: string;
}

export class MainService {
  // 네트워크 노드 목록 조회 (NetworkMap용 변환된 데이터)
  static async getNetworkNodes(): Promise<ApiResponse<Node[]>> {
    try {
      // selectNetWorkNodeList API를 사용하여 역 목록 가져오기
      const response = await fetch("/api/selectNetWorkNodeList", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // StationOption을 Node로 변환
      const stationOptions = result.options || [];
      const convertedData = stationOptions.map(
        (station: { value: string; label: string }) =>
          convertToNode({
            sta_num: station.value,
            sta_nm: station.label,
            // NetworkNode의 다른 필드들은 기본값으로 설정
            open_date: 0,
            sta_num_cd: 0,
            avg_stay: 0,
            consign_oper: "0",
            avg_stay_new: 0,
            net_dt: "",
            transfer_cd: 0,
            gate_chk: 0,
            subway: "",
            transfer: 0,
            x: 0,
            y: 0,
            kscc: "",
            oper: "",
            seq: 0,
            remarks: "",
          })
      );
      return { success: true, data: convertedData };
    } catch (error) {
      console.error("네트워크 노드 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 네트워크 링크 목록 조회 (NetworkMap용 변환된 데이터)
  static async getNetworkLinks(): Promise<ApiResponse<Link[]>> {
    try {
      // Next.js API를 통해 링크 데이터 가져오기
      const response = await fetch("/api/main", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "network-lines" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || "링크 데이터 조회 실패",
        };
      }

      // NetworkLink 배열을 Link로 변환
      const rawData = result.data as NetworkLink[];
      const convertedData = (rawData || []).map(convertToLink);
      return { success: true, data: convertedData };
    } catch (error) {
      console.error("네트워크 링크 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 권종별 통행수 조회
  static async getCardStats(): Promise<ApiResponse<CardStats[]>> {
    try {
      const { data } = await callExternalApi("selectCntStatsList.do", {
        method: "POST",
        body: {
          COMMON_CODE: "CARD_DIV",
        },
      });

      // 외부 API에서 직접 배열을 반환하므로 data 자체가 배열
      const rawData = data as CardStats[];
      return { success: true, data: rawData || [] };
    } catch (error) {
      console.error("권종별 통행수 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // OD Pair 통계 조회
  static async getODPairStats(): Promise<ApiResponse<ODPairStats[]>> {
    try {
      const { data } = await callExternalApi("selectCntODPairStatsList.do", {
        method: "POST",
        body: {},
      });

      // 외부 API에서 직접 배열을 반환하므로 data 자체가 배열
      const rawData = data as ODPairStats[];
      return { success: true, data: rawData || [] };
    } catch (error) {
      console.error("OD Pair 통계 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 클라이언트에서 호출할 수 있는 메서드들 (Next.js API 라우트 사용)
  static async getCardStatsFromApi(): Promise<ApiResponse<CardStats[]>> {
    try {
      const response = await fetch("/api/main", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "card-stats" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error("권종별 통행수 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  static async getODPairStatsFromApi(): Promise<ApiResponse<ODPairStats[]>> {
    try {
      const response = await fetch("/api/main", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "od-pair-stats" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error("OD Pair 통계 조회 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
