// 위탁구간 조회 필터 타입
export interface SettlementConsignmentFilters {
  oper_id: string;
  stmtGrpId: string;
  lineCd: string;
  targetOperId: string;
}

// 위탁구간 조회 데이터 타입
export interface SettlementConsignmentData {
  stn_nm: string; // 역명
  oper_nm: string; // 기관명
  pay_amt: number; // 지급액
  recv_amt: number; // 수급액
  settle_amt: number; // 정산금액
  cnt_28: number; // 28일 통행량
}
