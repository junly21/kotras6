// 모의정산 기관별 조회 필터 타입
export interface MockSettlementByInstitutionFilters {
  settlementName: string; // 정산명 (SIM_STMT_GRP_ID로 사용)
  agency: string; // 기관명 (OPER_ID로 사용)
}

// 모의정산 기관별 조회 데이터 타입
export interface MockSettlementByInstitutionData {
  대상기관: string; // 기관명
  지급액: number; // 지급액
  수급액: number; // 수급액
  차액: number; // 차액
}
