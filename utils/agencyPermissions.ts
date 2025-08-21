import { AgencyLevel, AgencyInfo, FeaturePermissions } from "@/types/agency";

// 기관 코드를 기관 정보로 매핑
export function getAgencyInfo(agencyCode: string): AgencyInfo {
  // 대도시광역교통위원회 (최고 레벨)
  if (agencyCode === "ALL") {
    return {
      code: "ALL",
      name: "대도시광역교통위원회",
      level: "ALL",
    };
  }

  // 서비스 기관 (중간 레벨)
  const serviceAgencies: Record<string, string> = {
    한국철도공사: "한국철도공사",
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
