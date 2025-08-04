export interface SettlementByOdFilters {
  STN_ID1: string; // 출발역
  STN_ID2: string; // 도착역
}

export interface SettlementByOdData {
  stn_nm1: string; // 출발역명
  stn_nm2: string; // 도착역명
  pay_amt: number; // 정산금액
  recv_amt: number; // 수취금액
  net_amt: number; // 순정산금액
  [key: string]: string | number; // 동적 필드 지원
}
