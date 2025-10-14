// 기관 레벨 정의
export type AgencyLevel = "ALL" | "SERVICE" | "OTHER";

// 기관 정보
export interface AgencyInfo {
  code: string; // OPER_CODE_NM_DECR 값
  name: string; // 표시용 이름
  level: AgencyLevel; // 기관 레벨
}

// 기능별 접근 권한 (1depth)
export interface FeaturePermissions {
  mockSettlement: boolean; // 모의정산
  settlement: boolean; // 정산
  transactionAnalysis: boolean; // 거래분석
  networkManagement: boolean; // 네트워크 관리
}

// 2depth 세부 권한
export interface DetailedPermissions {
  // Transaction 하위 권한
  transaction: {
    analysis: boolean; // 내역 분석 - 모든 기관
    amount: boolean; // 금액 분석 - 대광위 + SERVICE
    detail: boolean; // 상세 조회 - 대광위만
  };

  // Settlement 하위 권한
  settlement: {
    overview: boolean; // 정산 결과 - 모든 기관
    byInstitution: boolean; // 기관별 조회 - 모든 기관
    byRoute: boolean; // 노선별 조회 - 대광위 + SERVICE
    byStation: boolean; // 역별 조회 - 대광위 + SERVICE
    byOd: boolean; // OD별 조회 - 대광위 + SERVICE
    consignment: boolean; // 위탁구간 조회 - 대광위 + SERVICE
  };

  // Mock Settlement 하위 권한
  mockSettlement: {
    register: boolean; // 정산 등록 - 대광위만
    result: boolean; // 정산 결과 - 대광위만
    byInstitution: boolean; // 기관별 조회 - 대광위만
    byRoute: boolean; // 노선별 조회 - 대광위만
    byStation: boolean; // 역별 조회 - 대광위만
    byOd: boolean; // OD별 조회 - 대광위만
  };

  // Network 하위 권한
  network: {
    map: boolean; // 지도 조회 - 모든 기관
    line: boolean; // 노선도 조회 - 모든 기관
    optimalRoute: boolean; // 최적경로 - 모든 기관
    fileUpload: boolean; // 파일등록 - 대광위만
  };

  // Settings 하위 권한
  settings: {
    commonCodes: boolean; // 공통코드 관리 - 대광위만
    detailCodes: boolean; // 상세코드 관리 - 대광위만
    logs: boolean; // 작업로그 조회 - 대광위만
  };
}

// 기관별 권한 설정
export interface AgencyPermissions {
  agency: AgencyInfo;
  permissions: FeaturePermissions;
  detailedPermissions: DetailedPermissions;
}
