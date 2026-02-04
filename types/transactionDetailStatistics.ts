import { z } from "zod";

// 이용내역 상세통계 필터 타입
export interface TransactionDetailStatisticsFilters {
  tradeDates: string[]; // 거래일자 (복수)
  agency: string;
  lines: string[]; // 노선명 (복수)
  stationDiv: string; // RIDE | ALGH
  cardType: string; // Y | N
}

export const transactionDetailStatisticsSchema = z.object({
  tradeDates: z.array(z.string()).min(1, "거래일자를 하나 이상 선택해주세요"),
  agency: z.string().min(1, "기관명을 선택해주세요"),
  lines: z.array(z.string()).min(1, "노선명을 하나 이상 선택해주세요"),
  stationDiv: z.string().min(1, "승하차구분을 선택해주세요"),
  cardType: z.string().min(1, "카드구분을 선택해주세요"),
});

// 이용내역 상세통계 그리드 데이터 타입
export interface TransactionDetailStatisticsData {
  ride_oprn_dt?: string;
  card_div: string;
  ride_oper_nm: string;
  algh_oper_nm: string;
  ride_line_nm: string;
  algh_line_nm: string;
  ride_stn_nm: string;
  algh_stn_nm: string;
  cnt: number;
}

// 카드구분 Y일 때 표시 텍스트
export const CARD_DIV_Y_LABEL = "선후불권, 1회권, 정기권";

export const DUMMY_DATA: TransactionDetailStatisticsData[] = [
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "신중동",
    algh_stn_nm: "상동",
    cnt: 899,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "상동",
    algh_stn_nm: "신중동",
    cnt: 838,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "서울교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "신중동",
    algh_stn_nm: "가산디지털단지",
    cnt: 837,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "서울교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "부천시청",
    algh_stn_nm: "가산디지털단지",
    cnt: 755,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "춘의",
    algh_stn_nm: "상동",
    cnt: 747,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "서울교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "굴포천",
    algh_stn_nm: "가산디지털단지",
    cnt: 708,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "인천2호선",
    algh_line_nm: "인천2호선",
    ride_stn_nm: "가정(루원시티)",
    algh_stn_nm: "서구청",
    cnt: 693,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "인천1호선",
    algh_line_nm: "인천1호선",
    ride_stn_nm: "간석오거리",
    algh_stn_nm: "동춘",
    cnt: 676,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "상동",
    algh_stn_nm: "춘의",
    cnt: 658,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "굴포천",
    algh_stn_nm: "상동",
    cnt: 653,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "서울교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "까치울",
    algh_stn_nm: "가산디지털단지",
    cnt: 649,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "인천2호선",
    algh_line_nm: "인천2호선",
    ride_stn_nm: "남동구청",
    algh_stn_nm: "모래내시장",
    cnt: 648,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "인천2호선",
    algh_line_nm: "인천2호선",
    ride_stn_nm: "서구청",
    algh_stn_nm: "가정(루원시티)",
    cnt: 647,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "상동",
    algh_stn_nm: "굴포천",
    cnt: 642,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "인천2호선",
    algh_line_nm: "인천2호선",
    ride_stn_nm: "모래내시장",
    algh_stn_nm: "남동구청",
    cnt: 642,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "서울교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "상동",
    algh_stn_nm: "가산디지털단지",
    cnt: 640,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "인천1호선",
    algh_line_nm: "인천1호선",
    ride_stn_nm: "인천터미널",
    algh_stn_nm: "동춘",
    cnt: 640,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "인천2호선",
    algh_line_nm: "인천2호선",
    ride_stn_nm: "서구청",
    algh_stn_nm: "가정중앙시장",
    cnt: 640,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "서울교통공사",
    ride_line_nm: "7호선",
    algh_line_nm: "7호선",
    ride_stn_nm: "산곡",
    algh_stn_nm: "가산디지털단지",
    cnt: 629,
  },
  {
    ride_oprn_dt: "",
    card_div: "-",
    ride_oper_nm: "인천교통공사",
    algh_oper_nm: "인천교통공사",
    ride_line_nm: "인천2호선",
    algh_line_nm: "인천2호선",
    ride_stn_nm: "가정중앙시장",
    algh_stn_nm: "서구청",
    cnt: 625,
  },
];
