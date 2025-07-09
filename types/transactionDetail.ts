// 상세조회 필터 타입
export interface TransactionDetailFilters {
  tradeDate: string; // 거래일자
  cardType: string; // 카드구분
}

// 상세조회 데이터 타입
export interface TransactionDetailData {
  cardNumber: string; // 카드번호
  boardingDateTime: string; // 승차일시
  alightingDateTime: string; // 하차일시
  firstBoardingStation: string; // 최초승차역
  finalAlightingStation: string; // 최종하차역
  totalAmount: number; // 총배분금
  baseFare: number; // 기본운임
  subwaySurcharge: number; // 도시철도 부가금
}

// 카드구분 옵션 타입
export interface CardTypeOption {
  value: string;
  label: string;
}
