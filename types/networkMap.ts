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

// 노드 데이터 타입
export interface NodeData {
  avg_stay: number;
  avg_stay_new: number;
  consign_oper: string;
  gate_chk: number;
  kscc: string;
  net_dt: string;
  open_date: number;
  oper: string;
  remarks: string;
  seq: number;
  sta_nm: string;
  sta_num: string;
  sta_num_cd: number;
  subway: string;
  transfer: number;
  transfer_cd: number;
  x: number;
  y: number;
}

// 링크(선) 데이터 타입
export interface LineData {
  trans_sty_sec: number;
  sta_pass_sec: number;
  consign_oper: string;
  to_sta_num: string;
  net_dt: string;
  link_cd: string;
  elev_tot: number;
  km_ung: number;
  end_x: number;
  end_y: number;
  seq: string;
  from_sta_num: string;
  direction: string;
  to_sta_nm: string;
  open_date: number;
  km: number;
  cost: number;
  end_oper: string;
  trans_mv_sec: number;
  from_sta_nm: string;
  start_x: number;
  start_oper: string;
  subway: string;
  start_y: number;
  elev: number;
  km_g: number;
  oper: string;
  elev_ung: number;
  elev_g: number;
  oper_line: string;
}
