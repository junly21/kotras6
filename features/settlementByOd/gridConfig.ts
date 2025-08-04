import { ColDef } from "ag-grid-community";
import { SettlementByOdData } from "@/types/settlementByOd";

export function createSettlementByOdColDefs(): ColDef<SettlementByOdData>[] {
  return [
    {
      headerName: "출발역",
      field: "stn_nm1",
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: "도착역",
      field: "stn_nm2",
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: "정산금액",
      field: "pay_amt",
      width: 120,
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toLocaleString() + "원";
        }
        return "";
      },
    },
    {
      headerName: "수취금액",
      field: "recv_amt",
      width: 120,
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toLocaleString() + "원";
        }
        return "";
      },
    },
    {
      headerName: "순정산금액",
      field: "net_amt",
      width: 120,
      sortable: true,
      filter: true,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toLocaleString() + "원";
        }
        return "";
      },
    },
  ];
}
