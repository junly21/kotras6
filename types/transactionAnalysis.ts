// 거래내역 분석 필터 타입
export interface TransactionAnalysisFilters {
  agency: string; // 기관명
}

// 거래내역 분석 데이터 타입
export interface TransactionAnalysisData {
  oper_nm: string; // 승차기관명
  ride_nm: string; // 승차역
  algh_nm: string; // 하차역
  cnt: number; // 데이터 건수
}

// 기관 옵션 타입
export interface AgencyOption {
  value: string;
  label: string;
}
