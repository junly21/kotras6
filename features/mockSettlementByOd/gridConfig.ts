import { ColDef } from "ag-grid-community";
import { MockSettlementByOdData } from "@/types/mockSettlementByOd";

export function createMockSettlementByOdColDefs(): ColDef<MockSettlementByOdData>[] {
  return [
    {
      headerName: "번호",
      field: "rn",
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        // 소계 행인 경우 번호 표시 안함
        if (params.value === null || params.value === undefined) {
          return "";
        }
        return params.value;
      },
    },
    {
      headerName: "확정경로 포함 여부",
      field: "confirmed_path",
      width: 180,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const value = params.value;
        if (value === "O") {
          return "포함";
        } else if (value === "X") {
          return "미포함";
        } else if (value === "계") {
          return "소계";
        }
        return value;
      },
      cellStyle: (params: any) => {
        const value = params.value;
        if (value === "O") {
          return { color: "#059669", fontWeight: "bold" }; // 초록색
        } else if (value === "X") {
          return { color: "#DC2626", fontWeight: "bold" }; // 빨간색
        } else if (value === "계") {
          return { color: "#1F2937", fontWeight: "bold" }; // 회색
        }
        return {};
      },
    },
    {
      headerName: "경로",
      field: "path_detail",
      flex: 1,
      minWidth: 600,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        // 소계 행인 경우 경로 표시 안함
        if (params.value === "-") {
          return "";
        }
        return params.value;
      },
      cellStyle: (params: any) => {
        // 소계 행인 경우 bold체만 적용
        if (params.value === "-") {
          return { fontWeight: "bold" };
        }
        return {};
      },
    },
    {
      headerName: "경로 선택 확률",
      field: "path_prob",
      flex: 1,
      minWidth: 150,
      sortable: false,
      filter: false,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toFixed(2) + "%";
        }
        return "";
      },
      cellStyle: (params: any) => {
        // 소계 행인 경우 bold체만 적용
        if (params.data?.path_detail === "-") {
          return { fontWeight: "bold" };
        }
        return {};
      },
    },
    {
      headerName: "배분금",
      field: "amt",
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
      cellStyle: (params: any) => {
        // 소계 행인 경우 bold체와 우측 정렬만 적용
        if (params.data?.path_detail === "-") {
          return {
            fontWeight: "bold",
            textAlign: "right",
          };
        }
        return { textAlign: "right" };
      },
    },
  ];
}
