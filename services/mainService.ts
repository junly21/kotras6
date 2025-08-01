import { callExternalApi } from "@/app/api/utils/externalApi";
import {
  NetworkNode,
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
      const { data } = await callExternalApi("selectNetWorkNodeList.do", {
        method: "POST",
        body: {
          NET_DT: "LATEST",
        },
      });

      console.log("MainService - 원본 데이터:", data);

      // 외부 API에서 직접 배열을 반환하므로 data 자체가 배열
      const rawData = data as NetworkNode[];
      const convertedData = (rawData || []).map(convertToNode);

      console.log("MainService - 변환된 데이터:", convertedData);
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
      const { data } = await callExternalApi("selectNetWorkLineList.do", {
        method: "POST",
        body: {
          NET_DT: "LATEST",
        },
      });

      console.log("MainService - 원본 링크 데이터:", data);

      // 외부 API에서 직접 배열을 반환하므로 data 자체가 배열
      const rawData = data as NetworkLink[];
      const convertedData = (rawData || []).map(convertToLink);

      console.log("MainService - 변환된 링크 데이터:", convertedData);
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

      console.log("MainService - 원본 카드 통계 데이터:", data);

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

      console.log("MainService - 원본 OD Pair 데이터:", data);

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
}
