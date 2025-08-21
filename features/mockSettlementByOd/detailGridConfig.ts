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
      flex: 1,
      minWidth: 150,
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
      headerName: "도시철도부가사용금액",
      field: "ubrw_amt",
      flex: 1,
      minWidth: 150,
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
      flex: 1,
      minWidth: 120,
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
