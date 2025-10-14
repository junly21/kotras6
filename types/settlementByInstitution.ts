// 정산결과 기관별 조회 필터 타입
export interface SettlementByInstitutionFilters {
  agency: string; // 기관명
  stmtGrpId: string; // 대안 (STMT_GRP_ID)
}

// 정산결과 기관별 조회 데이터 타입 (외부 API 응답 구조)
export interface SettlementByInstitutionData {
  차액: number; // 계 (수급액 - 지급액)
  지급액: number; // 지급
  대상기관: string; // 기관명
  seq: number; // 순번
  수급액: number; // 수급
}

// 정산결과 기관별 조회 폼 데이터 타입
export interface SettlementByInstitutionFormData {
  oper_id: string;
  oper_nm: string;
  payment_amount: number;
  receipt_amount: number;
  total_amount: number;
}
