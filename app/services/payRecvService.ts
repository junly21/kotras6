import { ApiClient, ApiResponse } from "./apiClient";

// 타입 정의
export interface PayRecvOperParams {
  oper_id: string;
}

export interface PayRecvOperData {
  pay_oper: string;
  용인경전철: number;
  공항철도: number;
  새서울철도: number;
  인천교통공사: number;
  서울시메트로9호선: number;
  의정부경전철: number;
  서울교통공사: number;
  김포시청: number;
  한국철도공사: number;
  우이신설경전철: number;
  신림선: number;
  신분당선: number;
  경기철도: number;
}

export class PayRecvService {
  static async getOperList(
    params: PayRecvOperParams
  ): Promise<ApiResponse<PayRecvOperData[]>> {
    return ApiClient.get<PayRecvOperData[]>(
      "/pay-recv/oper-list",
      params as unknown as Record<string, string | number | boolean>
    );
  }

  static async createOper(
    data: Omit<PayRecvOperData, "pay_oper">
  ): Promise<ApiResponse<PayRecvOperData>> {
    return ApiClient.post<PayRecvOperData>("/pay-recv/oper", data);
  }

  static async updateOper(
    oper_id: string,
    data: Partial<PayRecvOperData>
  ): Promise<ApiResponse<PayRecvOperData>> {
    return ApiClient.put<PayRecvOperData>(`/pay-recv/oper`, data, {
      oper_id,
    });
  }

  static async deleteOper(oper_id: string): Promise<ApiResponse<void>> {
    return ApiClient.delete<void>("/pay-recv/oper", { oper_id });
  }
}
