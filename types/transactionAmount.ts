// 거래내역 분석 필터 타입
export interface TransactionAmountFilters {
  agency: string; // 기관명
}

// API 응답 원본 데이터 구조
export interface TransactionAmountRawData {
  acc_year: string;
  ride_oprn_dt: string;
  oper_id: string;
  subway: string;
  fnl_dist_amt: number; // 총배분금
  ubrw_adtn_use_amt: number; // 도시철도부가사용금
  base_dist_amt: number; // 기본배분금
  fnl_dist_amt_sum?: number; // 해당 날짜의 모든 노선별 총배분금 합계
}

// 그리드에 표시할 데이터 구조 (날짜별로 각 지하철 노선의 금액)
export interface TransactionAmountData {
  ride_oprn_dt: string; // 날짜 (row)
  [key: string]: string | number; // 각 지하철 노선별 금액 (dynamic columns)
}

// 기관 옵션 타입
export interface AgencyOption {
  value: string;
  label: string;
}
