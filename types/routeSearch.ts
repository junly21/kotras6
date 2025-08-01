export interface RouteSearchFilter {
  RIDE_STN_ID: string;
  ALGH_STN_ID: string;
}

export interface RouteSearchResult {
  // 실제 API 응답에 맞게 수정 필요
  route_id: string;
  from_station: string;
  to_station: string;
  total_time: number;
  total_distance: number;
  transfers: number;
  path: RouteSegment[];
}

export interface RouteSegment {
  from_station: string;
  to_station: string;
  line: string;
  time: number;
  distance: number;
}

export interface StationOption {
  label: string;
  value: string;
}
