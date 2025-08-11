// 모의정산 OD별 조회 필터 타입
export interface MockSettlementByOdFilters {
  settlementName: string; // 정산명 (SIM_STMT_GRP_ID로 사용)
  STN_ID1: string; // 출발역
  STN_ID2: string; // 도착역
}

// 모의정산 OD별 조회 데이터 타입
export interface MockSettlementByOdData {
  path_detail: string;
  path_prob: number;
  path_id: string;
  amt: number;
  rn: number;
  path_key: string;
  confirmed_path: string;
  path_id_list: string; // 경로 ID 목록 (쉼표로 구분)
}

// 모의정산 OD별 조회 상세정보 데이터 타입
export interface MockSettlementByOdDetailData {
  stn_nm: string;
  base_amt: number;
  ubrw_amt: number;
  km: number;
}

// 모의정산 정보 데이터 타입
export interface MockSettlementInfo {
  settlementName: string;
  transactionDate: string;
  tagAgency: string;
  initialLine: string;
  lineSection: string;
  distanceKm: number;
}
