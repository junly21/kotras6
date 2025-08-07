export interface OptimalRouteFilters {
  network: string;
  startStation: string;
  endStation: string;
}

export interface OptimalRouteItem {
  end_node: string;
  is_end_transfer: boolean;
  is_start_transfer: boolean;
  km: number;
  path_len: number;
  path_nm: string[];
  path_num: string[];
  rank: number;
  score: number;
  search_time_sec: number;
  sta_pass_sec: number;
  start_node: string;
  total_cost: number;
  trans_mv_sec: number;
  trans_sty_sec: number;
  transfer_gate_yn: boolean;
  transfer_list: string[];
  transfers_cnt: number;
}

export interface OptimalRouteRequestInfo {
  end_station: string;
  files_used: {
    station_lines: string;
    subway_map: string;
  };
  network_timestamp: string;
  start_station: string;
}

export interface OptimalRouteData {
  data: OptimalRouteItem[];
  request_info: OptimalRouteRequestInfo;
  success: boolean;
}

export interface NetworkOption {
  value: string;
  label: string;
}

export interface StationOption {
  value: string;
  label: string;
}
