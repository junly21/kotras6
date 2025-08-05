export interface SettlementByOdFilters {
  STN_ID1: string; // 출발역
  STN_ID2: string; // 도착역
}

export interface SettlementByOdData {
  path_detail: string; // 경로 상세
  path_prob: number; // 경로 선택 확률
  path_id: string; // 경로 ID
  amt: number; // 배분금
  rn: number; // 순위
  path_id_list: string; // 경로 ID 목록 (쉼표로 구분)
  path_key: string; // 경로 키
  confirmed_path: string; // 확정경로 포함 여부 (O/X/계)
}

export interface SettlementByOdDetailData {
  stn_nm: string; // 역명
  base_amt: number; // 기본배분금
  km: number; // 인.km
  stn_seq: number; // 역 순서
  recv_oper: string; // 기관
  ubrw_amt: number; // 도시철도부가사용금
  recv_line: string; // 노선
}
