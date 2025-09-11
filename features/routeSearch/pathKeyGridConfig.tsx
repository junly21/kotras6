import React from "react";
import { ColDef } from "ag-grid-community";
import { RouteSearchResult } from "@/types/routeSearch";

interface PathKeyGridData {
  id: number;
  confirmedPath: string;
  groupNo: number;
  groupDisplay: string | number | null;
  mainStations: string;
  pathKey: string;
  cnt: number | null;
  isSelected: boolean;
  originalData: RouteSearchResult;
}

export function createPathKeyColDefs(
  onCheckboxChange: (route: RouteSearchResult, checked: boolean) => void,
  onDetailClick: (route: RouteSearchResult) => void,
  onSelectAllChange: (checked: boolean) => void,
  isAllSelected: boolean,
  isIndeterminate: boolean
): ColDef<PathKeyGridData>[] {
  return [
    {
      headerName: "선택",
      resizable: false,
      field: "isSelected",
      width: 50,
      sortable: false,
      headerComponent: () => {
        return React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            },
          },
          React.createElement("input", {
            type: "checkbox",
            checked: isAllSelected,
            ref: (input: HTMLInputElement) => {
              if (input) {
                input.indeterminate = isIndeterminate;
              }
            },
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onSelectAllChange(e.target.checked),
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
            className: "w-4 h-4",
          })
        );
      },
      cellRenderer: (params: {
        value: boolean;
        data: { originalData: RouteSearchResult };
      }) => {
        return React.createElement("input", {
          type: "checkbox",
          checked: params.value,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            onCheckboxChange(params.data.originalData, e.target.checked),
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
          className: "w-4 h-4",
        });
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      },
    },
    {
      headerName: "확정경로",
      resizable: false,
      field: "confirmedPath",
      width: 120,
      sortable: false,
      cellRenderer: (params: { value: string }) => {
        const value = params.value;
        if (!value) return ""; // 빈 값일 때는 아무것도 표시하지 않음
        if (value === "Y") {
          return React.createElement(
            "span",
            {
              style: { color: "#000000", fontWeight: "bold" },
            },
            "포함"
          );
        } else if (value === "N") {
          return React.createElement(
            "span",
            {
              style: { color: "#000000", fontWeight: "bold" },
            },
            "미포함"
          );
        }
        return value;
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
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
      headerName: "주요경유지",
      resizable: true,
      field: "mainStations",
      width: 400,
      flex: 2,
      sortable: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
      cellRenderer: (params: { value: string }) => {
        const pathParts = params.value.split(" → ");
        return React.createElement(
          "div",
          { className: "flex items-center gap-1" },
          pathParts.map((part: string, index: number) =>
            React.createElement(
              React.Fragment,
              { key: index },
              React.createElement("span", { className: "text-sm" }, part),
              index < pathParts.length - 1 &&
                React.createElement(
                  "span",
                  {
                    className: "mx-2 text-gray-400",
                  },
                  "→"
                )
            )
          )
        );
      },
    },
    {
      headerName: "path_key",
      resizable: true,
      field: "pathKey",
      width: 200,
      flex: 1,
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
    {
      headerName: "상세정보",
      resizable: false,
      field: "originalData",
      maxWidth: 120,
      flex: 1,
      sortable: false,
      cellRenderer: (params: { data: { originalData: RouteSearchResult } }) => {
        return React.createElement(
          "button",
          {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              onDetailClick(params.data.originalData);
            },
            className:
              "px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors",
          },
          "보기"
        );
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      },
    },
  ];
}
