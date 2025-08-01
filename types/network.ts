// 네트워크 노드 타입
export interface NetworkNode {
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

// 네트워크 링크 타입
export interface NetworkLink {
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

// NetworkMap 컴포넌트에서 사용하는 노드 타입 (기존 타입과 호환)
export interface Node {
  id: string;
  name: string;
  line: string;
  x: number;
  y: number;
  operator: string;
  consign_operator: number | null;
  open_date: number;
  gate_count: number | null;
  is_transfer: number;
  avg_stay_sec: number;
  avg_stay_sec_new: number;
  remarks: string | number | null;
  // 추가 필드들
  oper?: string;
  subway?: string;
  transfer?: number;
}

// NetworkMap 컴포넌트에서 사용하는 링크 타입 (기존 타입과 호환)
export interface Link {
  source: string;
  target: string;
  line: string;
  time: number;
  // 추가 필드들
  km?: number;
  cost?: number;
  direction?: string;
  oper?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 네트워크 데이터 변환 함수들
export function convertToNode(networkNode: NetworkNode): Node {
  return {
    id: networkNode.sta_num,
    name: networkNode.sta_nm,
    line: networkNode.subway,
    x: networkNode.x,
    y: networkNode.y,
    operator: networkNode.oper,
    consign_operator:
      networkNode.consign_oper === "0"
        ? null
        : parseInt(networkNode.consign_oper),
    open_date: networkNode.open_date,
    gate_count: networkNode.gate_chk === 0 ? null : networkNode.gate_chk,
    is_transfer: networkNode.transfer,
    avg_stay_sec: networkNode.avg_stay,
    avg_stay_sec_new: networkNode.avg_stay_new,
    remarks: networkNode.remarks,
    // 추가 필드들
    oper: networkNode.oper,
    subway: networkNode.subway,
    transfer: networkNode.transfer,
  };
}

export function convertToLink(networkLink: NetworkLink): Link {
  return {
    source: networkLink.from_sta_num,
    target: networkLink.to_sta_num,
    line: networkLink.subway,
    time: networkLink.sta_pass_sec,
    // 추가 필드들
    km: networkLink.km,
    cost: networkLink.cost,
    direction: networkLink.direction,
    oper: networkLink.oper,
  };
}
