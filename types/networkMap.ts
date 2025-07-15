// 네트워크 지도 필터 타입
export interface NetworkMapFilters {
  network: string; // 네트워크명
  line: string; // 노선
}

// 네트워크 옵션 타입
export interface NetworkOption {
  value: string;
  label: string;
}

// 노선 옵션 타입
export interface LineOption {
  value: string;
  label: string;
}

// 네트워크 지도 데이터 타입 (필요시 확장)
export type NetworkMapData = Record<string, unknown>;
