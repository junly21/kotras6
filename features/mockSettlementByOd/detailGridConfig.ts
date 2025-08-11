import { ColDef } from "ag-grid-community";
import { MockSettlementByOdDetailData } from "@/types/mockSettlementByOd";

export function createMockSettlementByOdDetailColDefs(): ColDef<MockSettlementByOdDetailData>[] {
  return [
    {
      headerName: "역명",
      field: "stn_nm",
      width: 200,
      sortable: false,
      filter: false,
    },
    {
      headerName: "기본금",
      field: "base_amt",
      width: 150,
      sortable: false,
      filter: false,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toLocaleString() + "원";
        }
        return "";
      },
    },
    {
      headerName: "UBRW 금액",
      field: "ubrw_amt",
      width: 150,
      sortable: false,
      filter: false,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toLocaleString() + "원";
        }
        return "";
      },
    },
    {
      headerName: "거리(km)",
      field: "km",
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