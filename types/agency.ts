// 기관 레벨 정의
export type AgencyLevel = "ALL" | "SERVICE" | "OTHER";

// 기관 정보
export interface AgencyInfo {
  code: string; // OPER_CODE_NM_DECR 값
  name: string; // 표시용 이름
  level: AgencyLevel; // 기관 레벨
}

// 기능별 접근 권한
export interface FeaturePermissions {
  mockSettlement: boolean; // 모의정산
  settlement: boolean; // 정산
  transactionAnalysis: boolean; // 거래분석
  networkManagement: boolean; // 네트워크 관리
  // 필요에 따라 더 추가 가능
}

// 기관별 권한 설정
export interface AgencyPermissions {
  agency: AgencyInfo;
  permissions: FeaturePermissions;
}
