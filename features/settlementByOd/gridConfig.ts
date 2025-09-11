import { ColDef } from "ag-grid-community";

interface SettlementByOdData {
  path_detail: string;
  path_prob: number;
  path_id: string;
  amt: number;
  rn: number;
  path_key: string;
  confirmed_path: string;
}

export function createSettlementByOdColDefs(): ColDef<SettlementByOdData>[] {
  return [
    {
      headerName: "번호",
      field: "rn",
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        // null 값인 경우 빈 문자열 표시
        if (params.value === null || params.value === undefined) {
          return "";
        }
        // 문자열인 경우 (소계) 그대로 표시, 숫자인 경우 숫자 표시
        return params.value;
      },
      cellStyle: {
        fontWeight: "bold",
        textAlign: "center",
      },
    },
    {
      headerName: "확정경로",
      field: "confirmed_path",
      width: 120,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const value = params.value;
        if (value === null || value === undefined) {
          return ""; // null 값은 빈 문자열로 표시
        }
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
          return { color: "#000000", fontWeight: "bold", textAlign: "center" };
        } else if (value === "X") {
          return { color: "#000000", fontWeight: "bold", textAlign: "center" };
        } else if (value === "계") {
          return { color: "#1F2937", fontWeight: "bold", textAlign: "center" };
        }
        return { color: "inherit", fontWeight: "normal", textAlign: "center" };
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
        return { fontWeight: "normal" };
      },
    },
    {
      headerName: "경로선택확률(%)",
      field: "path_prob",
      flex: 1,
      maxWidth: 200,
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
          return { fontWeight: "bold", textAlign: "right" };
        }
        return { fontWeight: "normal", textAlign: "right" };
      },
    },
    {
      headerName: "배분금(원)",
      field: "amt",
      flex: 1,
      maxWidth: 200,
      sortable: false,
      filter: false,
      valueFormatter: (params) => {
        if (params.value != null) {
          return params.value.toLocaleString();
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
        return { fontWeight: "normal", textAlign: "right" };
      },
    },
  ];
}
