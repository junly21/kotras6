import React from "react";
import { ColDef } from "ag-grid-community";
import { RouteSearchResult } from "@/types/routeSearch";

interface ViewGridData {
  id: number;
  startStation: string;
  endStation: string;
  groupNo: number;
  groupDisplay: string | number | null;
  detailedPath: string;
  cnt: number | null;
  originalData: RouteSearchResult;
}

export function createPathKeyColDefs(): ColDef<ViewGridData>[] {
  return [
    {
      headerName: "출발역",
      resizable: false,
      field: "startStation",
      width: 120,
      sortable: false,
      cellRenderer: (params: { value: string }) => {
        // 빈 값일 때는 아무것도 표시하지 않음
        return params.value || "";
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontWeight: "bold",
      },
    },
    {
      headerName: "도착역",
      resizable: false,
      field: "endStation",
      width: 120,
      sortable: false,
      cellRenderer: (params: { value: string }) => {
        // 빈 값일 때는 아무것도 표시하지 않음
        return params.value || "";
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontWeight: "bold",
      },
    },
    {
      headerName: "그룹",
      resizable: false,
      field: "groupDisplay",
      width: 90,
      sortable: false, // 정렬 비활성화
      filter: false, // 필터 비활성화
      cellStyle: {
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      },
      valueFormatter: (params: { value: string | number | null }) => {
        // null 값은 빈 문자열로 표시
        return params.value !== null ? String(params.value) : "";
      },
    },
    {
      headerName: "상세경로",
      resizable: true,
      field: "detailedPath",
      width: 500,
      flex: 3,
      sortable: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
      cellRenderer: (params: { value: string }) => {
        if (!params.value) return "-";

        return React.createElement(
          "div",
          {
            className: "truncate",
            style: {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            title: params.value, // 전체 텍스트를 툴팁으로 표시
          },
          params.value
        );
      },
    },
    {
      headerName: "내역(건)",
      resizable: false,
      field: "cnt",
      width: 140,
      sortable: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontWeight: "bold",
      },
      cellRenderer: (params: { value: number | null }) => {
        if (params.value === null) return ""; // null 값일 때는 아무것도 표시하지 않음
        return params.value || 0;
      },
    },
  ];
}
