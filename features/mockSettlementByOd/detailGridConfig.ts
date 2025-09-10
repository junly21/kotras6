import { ColDef } from "ag-grid-community";
import { MockSettlementByOdDetailData } from "@/types/mockSettlementByOd";

export function createMockSettlementByOdDetailColDefs(): ColDef<MockSettlementByOdDetailData>[] {
  return [
    {
      headerName: "기관명",
      field: "recv_oper",
      flex: 1,
      minWidth: 200,
      sortable: false,
      filter: false,
    },
    {
      headerName: "노선명",
      field: "recv_line",
      flex: 1,
      minWidth: 200,
      sortable: false,
      filter: false,
    },
    {
      headerName: "역명",
      field: "stn_nm",
      flex: 1,
      minWidth: 200,
      sortable: false,
      filter: false,
    },
    {
      headerName: "기본배분금(원)",
      field: "base_amt",
      flex: 1,
      minWidth: 200,
      sortable: false,
      filter: false,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toLocaleString();
        }
        return "";
      },
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "도시철도부가사용금(원)",
      field: "ubrw_amt",
      flex: 1,
      minWidth: 250,
      sortable: false,
      filter: false,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toLocaleString();
        }
        return "";
      },
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "구간거리(km)",
      field: "km",
      flex: 1,
      minWidth: 200,
      sortable: false,
      filter: false,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toFixed(1);
        }
        return "";
      },
    },
  ];
}
