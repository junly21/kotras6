// 모의정산 등록 필터 타입
export interface MockSettlementRegisterFilters {
  settlementName: string; // 정산명
  transactionDate: string; // 거래일자
}

// 모의정산 등록 데이터 타입
export interface MockSettlementRegisterData {
  settlementName: string; // 정산명
  transactionDate: string; // 거래일자
  tagAgency: string; // 태그기관
  initialLine: string; // 초승노선
  lineSection: string; // 노선동등
  distanceKm: number; // 인.km
  weightRatio: string; // 가중치(지상:지하:고가)
  registrationDate: string; // 등록일자
  status: "대기" | "완료"; // 상태
}

// 모의정산 등록 폼 데이터 타입
export interface MockSettlementRegisterFormData {
  settlementName: string;
  tradeDate: string;
  // 기본운임 배분 비율
  tagAgencyRatio: number;
  initialLineRatio: number;
  lineSectionRatio: number;
  distanceKmRatio: number;
  // 기본운임 인·km 가중치
  undergroundWeight: number;
  elevatedWeight: number;
  // 도시철도부가사용금 인·km 가중치
  subwayUndergroundWeight: number;
  subwayElevatedWeight: number;
  // 수송기여도 (4x4 그리드)
  contribution: {
    [key: string]: number;
  };
}

// API 응답 타입
export interface MockSettlementRegisterApiResponse {
  success: boolean;
  data?: MockSettlementRegisterData[];
  error?: string;
}
