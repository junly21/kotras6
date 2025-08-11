export interface MockSettlementByRouteFilters {
  settlementName: string;
  agency: string;
}

export interface MockSettlementByRouteData {
  [key: string]: unknown; // 실제 API 응답 구조에 따라 동적으로 정의
}
