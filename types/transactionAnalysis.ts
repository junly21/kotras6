// 거래내역 분석 필터 타입
export interface TransactionAnalysisFilters {
  agency: string; // 기관명
}

// 거래내역 분석 데이터 타입
export interface TransactionAnalysisData {
  rank: number; // 순위
  agency: string; // 기관명
  boardingStation: string; // 승차역
  alightingStation: string; // 하차역
  dataCount: number; // 데이터 건수
}

// 기관 옵션 타입
export interface AgencyOption {
  value: string;
  label: string;
}
