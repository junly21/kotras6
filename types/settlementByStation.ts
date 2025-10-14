// 정산결과 역별 조회 필터 타입
export interface SettlementByStationFilters {
  stmtGrpId: string; // 대안 (STMT_GRP_ID)
  STN_ID1: string; // 선택역1
  STN_ID2: string; // 선택역2
  STN_ID3: string; // 선택역3
  STN_ID4: string; // 선택역4
  STN_ID5: string; // 선택역5
}

// 정산결과 역별 조회 데이터 타입 (외부 API 응답 구조)
export interface SettlementByStationData {
  [key: string]: unknown;
}

// 정산결과 역별 조회 폼 데이터 타입
export interface SettlementByStationFormData {
  STN_ID1: string;
  STN_ID2: string;
  STN_ID3: string;
  STN_ID4: string;
  STN_ID5: string;
}
