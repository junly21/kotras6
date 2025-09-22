import {
  AgencyLevel,
  AgencyInfo,
  FeaturePermissions,
  DetailedPermissions,
} from "@/types/agency";

// 기관 코드를 기관 정보로 매핑
export function getAgencyInfo(agencyCode: string): AgencyInfo {
  // 대도시광역교통위원회 (최고 레벨)
  if (agencyCode === "ALL") {
    return {
      code: "ALL",
      name: "대도시권광역교통위원회",
      level: "ALL",
    };
  }

  // 서비스 기관 (중간 레벨)
  const serviceAgencies: Record<string, string> = {
    서울교통공사: "서울교통공사",
    인천교통공사: "인천교통공사",
    // 더 추가 가능
  };

  if (serviceAgencies[agencyCode]) {
    return {
      code: agencyCode,
      name: agencyCode,
      level: "SERVICE",
    };
  }

  // 그 외 기관 (최하 레벨)
  return {
    code: agencyCode,
    name: agencyCode,
    level: "OTHER",
  };
}

// 기관 레벨별 권한 설정
export function getFeaturePermissions(level: AgencyLevel): FeaturePermissions {
  switch (level) {
    case "ALL": // 대도시광역교통위원회 - 모든 기능 접근 가능
      return {
        mockSettlement: true, // 모의정산 접근 가능
        settlement: true, // 정산 접근 가능
        transactionAnalysis: true, // 거래분석 접근 가능
        networkManagement: true, // 네트워크 관리 접근 가능
      };

    case "SERVICE": // 한국철도공사, 서울교통공사, 인천교통공사
      return {
        mockSettlement: false, // 모의정산만 접근 불가
        settlement: true, // 정산 접근 가능
        transactionAnalysis: true, // 거래분석 접근 가능
        networkManagement: true, // 네트워크 관리 접근 가능
      };

    case "OTHER": // 그 외 기관
      return {
        mockSettlement: false, // 모의정산만 접근 불가
        settlement: true, // 정산 접근 가능
        transactionAnalysis: true, // 거래분석 접근 가능
        networkManagement: true, // 네트워크 관리 접근 가능
      };

    default:
      return {
        mockSettlement: false,
        settlement: true,
        transactionAnalysis: true,
        networkManagement: true,
      };
  }
}

// 2depth 세부 권한 설정
export function getDetailedPermissions(
  level: AgencyLevel
): DetailedPermissions {
  switch (level) {
    case "ALL": // 대도시광역교통위원회 - 모든 기능 접근 가능
      return {
        transaction: {
          analysis: true, // 내역 분석 - 모든 기관
          amount: true, // 금액 분석 - 대광위 + SERVICE
          detail: true, // 상세 조회 - 대광위만
        },
        settlement: {
          overview: true, // 정산 결과 - 모든 기관
          byInstitution: true, // 기관별 조회 - 모든 기관
          byRoute: true, // 노선별 조회 - 대광위 + SERVICE
          byStation: true, // 역사별 조회 - 대광위 + SERVICE
          byOd: true, // OD별 조회 - 대광위만
        },
        mockSettlement: {
          register: true, // 정산 등록 - 대광위만
          result: true, // 정산 결과 - 대광위만
          byInstitution: true, // 기관별 조회 - 대광위만
          byRoute: true, // 노선별 조회 - 대광위만
          byStation: true, // 역사별 조회 - 대광위만
          byOd: true, // OD별 조회 - 대광위만
        },
        network: {
          map: true, // 지도 조회 - 모든 기관
          line: true, // 노선도 조회 - 모든 기관
          optimalRoute: true, // 최적경로 - 모든 기관
          fileUpload: true, // 파일등록 - 대광위만
        },
        settings: {
          commonCodes: true, // 공통코드 관리 - 대광위만
          detailCodes: true, // 상세코드 관리 - 대광위만
          logs: true, // 작업로그 조회 - 대광위만
        },
      };

    case "SERVICE": //  서울교통공사, 인천교통공사
      return {
        transaction: {
          analysis: true, // 내역 분석 - 모든 기관
          amount: true, // 대광위 + SERVICE
          detail: true, // 상세 조회 - 대광위만 - 서교공 인교공 대광위요청으로 추가
        },
        settlement: {
          overview: true, // 정산 결과 - 모든 기관
          byInstitution: true, // 기관별 조회 - 모든 기관
          byRoute: true, // 노선별 조회 - 대광위 + SERVICE
          byStation: true, // 역사별 조회 - 대광위 + SERVICE
          byOd: false, // OD별 조회 - 대광위만
        },
        mockSettlement: {
          register: false, // 정산 등록 - 대광위만
          result: false, // 정산 결과 - 대광위만
          byInstitution: false, // 기관별 조회 - 대광위만
          byRoute: false, // 노선별 조회 - 대광위만
          byStation: false, // 역사별 조회 - 대광위만
          byOd: false, // OD별 조회 - 대광위만
        },
        network: {
          map: false, // 지도 조회 - 대광위만
          line: true, // 노선도 조회 - 모든 기관
          optimalRoute: true, // 최적경로 - 모든 기관
          fileUpload: false, // 파일등록 - 대광위만
        },
        settings: {
          commonCodes: false, // 공통코드 관리 - 대광위만
          detailCodes: false, // 상세코드 관리 - 대광위만
          logs: false, // 작업로그 조회 - 대광위만
        },
      };

    case "OTHER": // 그 외 기관
      return {
        transaction: {
          analysis: true, // 내역 분석 - 모든 기관
          amount: false, // 대광위 + SERVICE
          detail: false, // 상세 조회 - 대광위만
        },
        settlement: {
          overview: true, // 정산 결과 - 모든 기관
          byInstitution: true, // 기관별 조회 - 모든 기관
          byRoute: false, // 노선별 조회 - 대광위 + SERVICE
          byStation: false, // 역사별 조회 - 대광위 + SERVICE
          byOd: false, // OD별 조회 - 대광위만
        },
        mockSettlement: {
          register: false, // 정산 등록 - 대광위만
          result: false, // 정산 결과 - 대광위만
          byInstitution: false, // 기관별 조회 - 대광위만
          byRoute: false, // 노선별 조회 - 대광위만
          byStation: false, // 역사별 조회 - 대광위만
          byOd: false, // OD별 조회 - 대광위만
        },
        network: {
          map: false, // 지도 조회 - 대광위만
          line: true, // 노선도 조회 - 모든 기관
          optimalRoute: true, // 최적경로 - 모든 기관
          fileUpload: false, // 파일등록 - 대광위만
        },
        settings: {
          commonCodes: false, // 공통코드 관리 - 대광위만
          detailCodes: false, // 상세코드 관리 - 대광위만
          logs: false, // 작업로그 조회 - 대광위만
        },
      };

    default:
      return {
        transaction: { analysis: false, amount: false, detail: false },
        settlement: {
          overview: false,
          byInstitution: false,
          byRoute: false,
          byStation: false,
          byOd: false,
        },
        mockSettlement: {
          register: false,
          result: false,
          byInstitution: false,
          byRoute: false,
          byStation: false,
          byOd: false,
        },
        network: {
          map: false,
          line: false,
          optimalRoute: false,
          fileUpload: false,
        },
        settings: {
          commonCodes: false,
          detailCodes: false,
          logs: false,
        },
      };
  }
}

// 2depth 세부 권한 확인 함수
export function hasDetailedPermission(
  agencyCode: string,
  category: keyof DetailedPermissions,
  subFeature: string
): boolean {
  const agencyInfo = getAgencyInfo(agencyCode);
  const detailedPermissions = getDetailedPermissions(agencyInfo.level);
  const categoryPermissions = detailedPermissions[category];

  if (typeof categoryPermissions === "object" && categoryPermissions !== null) {
    return (
      (categoryPermissions as Record<string, boolean>)[subFeature] || false
    );
  }

  return false;
}

// 경로별 권한 확인 함수
export function hasPathPermission(agencyCode: string, path: string): boolean {
  // Transaction 권한 체크
  if (path.includes("/transaction/detail")) {
    return hasDetailedPermission(agencyCode, "transaction", "detail");
  }
  if (path.includes("/transaction/analysis")) {
    return hasDetailedPermission(agencyCode, "transaction", "analysis");
  }
  if (path.includes("/transaction/amount")) {
    return hasDetailedPermission(agencyCode, "transaction", "amount");
  }

  // Settlement 권한 체크
  if (path.includes("/settlement/overview")) {
    return hasDetailedPermission(agencyCode, "settlement", "overview");
  }
  if (path.includes("/settlement/by-institution")) {
    return hasDetailedPermission(agencyCode, "settlement", "byInstitution");
  }
  if (path.includes("/settlement/by-route")) {
    return hasDetailedPermission(agencyCode, "settlement", "byRoute");
  }
  if (path.includes("/settlement/by-station")) {
    return hasDetailedPermission(agencyCode, "settlement", "byStation");
  }
  if (path.includes("/settlement/by-od")) {
    return hasDetailedPermission(agencyCode, "settlement", "byOd");
  }

  // Mock Settlement 권한 체크
  if (path.includes("/mock-settlement/register")) {
    return hasDetailedPermission(agencyCode, "mockSettlement", "register");
  }
  if (path.includes("/mock-settlement/result")) {
    return hasDetailedPermission(agencyCode, "mockSettlement", "result");
  }
  if (path.includes("/mock-settlement/by-institution")) {
    return hasDetailedPermission(agencyCode, "mockSettlement", "byInstitution");
  }
  if (path.includes("/mock-settlement/by-route")) {
    return hasDetailedPermission(agencyCode, "mockSettlement", "byRoute");
  }
  if (path.includes("/mock-settlement/by-station")) {
    return hasDetailedPermission(agencyCode, "mockSettlement", "byStation");
  }
  if (path.includes("/mock-settlement/by-od")) {
    return hasDetailedPermission(agencyCode, "mockSettlement", "byOd");
  }

  // Network 권한 체크
  if (path.includes("/network/file-upload")) {
    return hasDetailedPermission(agencyCode, "network", "fileUpload");
  }

  // Settings 권한 체크
  if (path.includes("/settings/common-codes")) {
    return hasDetailedPermission(agencyCode, "settings", "commonCodes");
  }
  if (path.includes("/settings/detail-codes")) {
    return hasDetailedPermission(agencyCode, "settings", "detailCodes");
  }
  if (path.includes("/settings/logs")) {
    return hasDetailedPermission(agencyCode, "settings", "logs");
  }

  // 기본적으로 접근 가능 (지도, 노선도, 최적경로 등)
  return true;
}

// 특정 기능에 대한 접근 권한 확인
export function hasPermission(
  agencyCode: string,
  feature: keyof FeaturePermissions
): boolean {
  const agencyInfo = getAgencyInfo(agencyCode);
  const permissions = getFeaturePermissions(agencyInfo.level);
  return permissions[feature];
}

// 기관명 표시용 텍스트 변환
export function getAgencyDisplayName(agencyCode: string): string {
  const agencyInfo = getAgencyInfo(agencyCode);
  return agencyInfo.name;
}

// 기관 레벨 확인
export function getAgencyLevel(agencyCode: string): AgencyLevel {
  const agencyInfo = getAgencyInfo(agencyCode);
  return agencyInfo.level;
}
