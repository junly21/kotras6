import { ColDef } from "ag-grid-community";
import { MockSettlementInfo } from "@/types/mockSettlementByOd";

export function createMockSettlementInfoColDefs(): ColDef<MockSettlementInfo>[] {
  return [
    {
      headerName: "정산명",
      field: "settlementName",
      width: 200,
      sortable: false,
      filter: false,
    },
    {
      headerName: "거래일자",
      field: "transactionDate",
      width: 150,
      sortable: false,
      filter: false,
    },
    {
      headerName: "태그사업자",
      field: "tagAgency",
      width: 120,
      sortable: false,
      filter: false,
    },
    {
      headerName: "초기노선",
      field: "initialLine",
      width: 120,
      sortable: false,
      filter: false,
    },
    {
      headerName: "노선구간",
      field: "lineSection",
      width: 120,
      sortable: false,
      filter: false,
    },
    {
      headerName: "거리(km)",
      field: "distanceKm",
      width: 120,
      sortable: false,
      filter: false,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toFixed(2) + "km";
        }
        return "";
      },
    },
  ];
} 