export interface MockSettlementByStationFilters {
  settlementName: string;
  STN_ID1?: string;
  STN_ID2?: string;
  STN_ID3?: string;
  STN_ID4?: string;
  STN_ID5?: string;
}

export interface MockSettlementByStationData {
  [key: string]: string | number;
}
