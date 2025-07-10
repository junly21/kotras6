// 상세조회 필터 타입
export interface TransactionDetailFilters {
  tradeDate: string; // 거래일자
  cardType: string; // 카드구분
}

// 상세조회 데이터 타입
export interface TransactionDetailData {
  trcr_no: string; // 카드번호
  ride_dtm: number; // 승차시간 (timestamp)
  algh_dtm: number; // 하차시간 (timestamp)
  ride_nm: string; // 최초승차역
  algh_nm: string; // 최종하차역
  fnl_dist_amt: number; // 총배분금
  base_dist_amt: number; // 기본배분금
  ubrw_adtn_use_amt: number; // 도시철도부가사용금
  card_div: string; // 카드구분
}

// 카드구분 옵션 타입
export interface CardTypeOption {
  value: string;
  label: string;
}
