import { z } from "zod";

// 상세조회 필터 타입
export interface TransactionDetailFilters {
  tradeDate: string; // 거래일자
  cardType?: string; // 카드구분 (선택사항)
  agency: string; // 기관명
  line: string; // 노선명
  stationDiv: string; // 승하차구분
  stations: string[]; // 역선택 (복수선택)
}

// 상세조회 필터 스키마
export const transactionDetailSchema = z.object({
  tradeDate: z.string().min(1, "거래일자를 선택해주세요"),
  cardType: z.string().optional(), // 카드구분 (선택사항)
  agency: z.string().min(1, "기관명을 선택해주세요"),
  line: z.string().min(1, "노선명을 선택해주세요"),
  stationDiv: z.string().min(1, "승하차구분을 선택해주세요"),
  stations: z.array(z.string()).min(1, "역을 하나 이상 선택해주세요"),
});

// 상세조회 데이터 타입
export interface TransactionDetailData {
  line_nm: string; // 노선명
  stn_nm: string; // 역명
  card_div: string; // 카드구분
  oper_nm: string; // 기관명
  cnt: number; // 건수
  ride_oprn_dt: string; // 거래일자
}

// 카드구분 옵션 타입
export interface CardTypeOption {
  value: string;
  label: string;
}
