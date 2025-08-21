import React from "react";
import { ColDef } from "ag-grid-community";
import { RouteSearchResult } from "@/types/routeSearch";

interface RouteSearchGridData {
  id: number;
  rank: number;
  startStation: string;
  endStation: string;
  path: string;
  transferCount: number;
  isSelected: boolean;
  originalData: RouteSearchResult;
}

export function createRouteSearchColDefs(
  onCheckboxChange: (route: RouteSearchResult, checked: boolean) => void,
  onDetailClick: (route: RouteSearchResult) => void
): ColDef<RouteSearchGridData>[] {
  return [
    {
      headerName: "선택",
      field: "isSelected",
      width: 100,
      sortable: false,
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
      headerName: "순번",
      field: "rank",
      width: 100,
      sortable: true,
      cellStyle: {
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
    },
    {
      headerName: "출발역",
      field: "startStation",
      minWidth: 150,
      flex: 1,
      sortable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
    },
    {
      headerName: "도착역",
      field: "endStation",
      minWidth: 150,
      flex: 1,
      sortable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
    },
    {
      headerName: "경로",
      field: "path",
      minWidth: 400,
      flex: 2,
      sortable: true,
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
      headerName: "환승",
      field: "transferCount",
      minWidth: 200,
      flex: 1,
      sortable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
      cellRenderer: (params: { value: number }) => {
        const count = params.value;
        const className = `px-2 py-1 rounded text-xs font-medium ${
          count === 0
            ? "bg-green-100 text-green-800"
            : count <= 2
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`;
        return React.createElement("span", { className }, `${count}회`);
      },
    },
    {
      headerName: "상세정보",
      field: "detail",
      minWidth: 150,
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
