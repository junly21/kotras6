// 모의정산 결과 필터 타입
export interface MockSettlementResultFilters {
  settlementName: string; // 정산명 (SIM_STMT_GRP_ID로 사용)
}

// 모의정산 결과 데이터 타입 (상단 그리드용)
export interface MockSettlementResultData {
  settlementName: string; // 정산명
  transactionDate: string; // 거래일자
  tagAgency: string; // 태그기관
  initialLine: string; // 초승노선
  lineSection: string; // 노선동등
  distanceKm: number; // 인.km
}

// 정산결과 데이터 타입 (하단 그리드용 - settlement/overview와 동일)
export interface SettlementResultData {
  pay_oper: string;
  용인경전철: number;
  공항철도: number;
  새서울철도: number;
  인천교통공사: number;
  서울시메트로9호선: number;
  의정부경전철: number;
  서울교통공사: number;
  김포시청: number;
  한국철도공사: number;
  우이신설경전철: number;
  신림선: number;
  신분당선: number;
  경기철도: number;
}
