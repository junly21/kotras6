// 노드 데이터 타입
export interface NodeData {
  open_date: number;
  sta_num_cd: number;
  avg_stay: number;
  consign_oper: string;
  sta_num: string;
  avg_stay_new: number;
  net_dt: string;
  transfer_cd: number;
  gate_chk: number;
  sta_nm: string;
  subway: string;
  transfer: number;
  x: number;
  y: number;
  kscc: string;
  oper: string;
  seq: number;
  remarks: string;
}

// 링크 데이터 타입
export interface LinkData {
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

// 플랫폼 데이터 타입
export interface PlatformData {
  to_dic: string;
  tot_mv_m: number;
  flat_mv_m: number;
  to_dic_sub: string;
  only_step_down: number;
  to_sta_num: string;
  net_dt: string;
  link_cd: string;
  step_esc_up_step: number;
  only_step_up: number;
  from_dic_sub: string;
  only_esc_down_m: number;
  step_esc_down_step: number;
  tot_sty_sec: number;
  seq: number;
  from_sta_num: string;
  step_esc_down_yn: string;
  to_sta_nm: string;
  step_esc_down_m: number;
  tot_step_down: number;
  tot_step_up: number;
  step_esc_up_m: number;
  only_esc_up_m: number;
  only_step_up_m: number;
  link_seq: number;
  trans_cnt: number;
  step_esc_up_yn: string;
  from_sta_nm: string;
  only_esc_up_yn: string;
  only_step_down_m: number;
  tot_mv_sec: number;
  from_dic: string;
  only_esc_down_yn: string;
}
