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
  path_key: string; // 경로 키
  confirmed_path: string; // 확정경로 포함 여부 (O/X/계)
}
