// 정산결과 노선별 조회 필터 타입
export interface SettlementByRouteFilters {
  agency: string; // 기관명
}

// 정산결과 노선별 조회 데이터 타입 (외부 API 응답 구조)
export interface SettlementByRouteData {
  [key: string]: unknown; // 실제 API 응답 구조에 따라 동적으로 정의
}

// 정산결과 노선별 조회 폼 데이터 타입
export interface SettlementByRouteFormData {
  agency: string;
}
