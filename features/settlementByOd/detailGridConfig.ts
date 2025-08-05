import { ColDef } from "ag-grid-community";
import { SettlementByOdDetailData } from "@/types/settlementByOd";

export function createSettlementByOdDetailColDefs(): ColDef<SettlementByOdDetailData>[] {
  return [
    {
      headerName: "기관",
      field: "recv_oper",
      width: 200,
      sortable: false,
      filter: false,
    },
    {
      headerName: "노선",
      field: "recv_line",
      width: 200,
      sortable: false,
      filter: false,
    },
    {
      headerName: "역명",
      field: "stn_nm",
      width: 200,
      sortable: false,
      filter: false,
    },
    {
      headerName: "기본배분금",
      field: "base_amt",
      width: 200,
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
      headerName: "도시철도부가사용금",
      field: "ubrw_amt",
      width: 250,
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
      headerName: "인.km",
      field: "km",
      width: 200,
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
