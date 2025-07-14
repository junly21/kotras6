// 정산결과 기관별 조회 필터 타입
export interface SettlementByInstitutionFilters {
  agency: string; // 기관명
}

// 정산결과 기관별 조회 데이터 타입
export interface SettlementByInstitutionData {
  oper_id: string; // 기준 기관 ID (필수)
  oper_nm: string; // 상대 기관명 (필수)
  payment_amount: number; // 지급
  receipt_amount: number; // 수급
  total_amount: number; // 계
}

// 정산결과 기관별 조회 폼 데이터 타입
export interface SettlementByInstitutionFormData {
  oper_id: string;
  oper_nm: string;
  payment_amount: number;
  receipt_amount: number;
  total_amount: number;
}
