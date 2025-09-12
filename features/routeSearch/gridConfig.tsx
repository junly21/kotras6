import React from "react";
import { ColDef } from "ag-grid-community";
import { RouteSearchResult } from "@/types/routeSearch";

interface RouteSearchGridData {
  id: number;
  rn: number; // 순번
  confirmedPath: string;
  confirmedPathDisplay: string | null;
  groupNo: number;
  groupDisplay: string | number | null;
  mainStations: string;
  detailedPath: string;
  isSelected: boolean;
  originalData: RouteSearchResult;
}

export function createRouteSearchColDefs(
  onCheckboxChange: (route: RouteSearchResult, checked: boolean) => void,
  onDetailClick: (route: RouteSearchResult) => void,
  onSelectAllChange: (checked: boolean) => void,
  isAllSelected: boolean,
  isIndeterminate: boolean
): ColDef<RouteSearchGridData>[] {
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
    // {
    //   headerName: "번호",
    //   resizable: false,
    //   field: "groupDisplay",
    //   width: 110,
    //   sortable: false, // 정렬 비활성화
    //   filter: false, // 필터 비활성화
    //   cellStyle: {
    //     fontWeight: "bold",
    //     display: "flex",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     height: "100%",
    //   },
    //   valueFormatter: (params: { value: string | number | null }) => {
    //     // null 값은 빈 문자열로 표시
    //     return params.value !== null ? String(params.value) : "";
    //   },
    // },
    {
      headerName: "순번",
      resizable: false,
      field: "rn",
      width: 80,
      sortable: false,
      filter: false,
      cellStyle: {
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      },
      valueFormatter: (params: { value: number }) => {
        return params.value ? String(params.value) : "";
      },
    },
    // {
    //   headerName: "확정경로",
    //   resizable: false,
    //   field: "confirmedPathDisplay",
    //   width: 120,
    //   sortable: false,
    //   cellRenderer: (params: { value: string | null }) => {
    //     const value = params.value;
    //     if (value === "Y") {
    //       return React.createElement(
    //         "span",
    //         {
    //           style: { color: "#000000", fontWeight: "bold" },
    //         },
    //         "포함"
    //       );
    //     } else if (value === "N") {
    //       return React.createElement(
    //         "span",
    //         {
    //           style: { color: "#000000", fontWeight: "bold" },
    //         },
    //         "미포함"
    //       );
    //     }
    //     return ""; // null 값은 빈 문자열로 표시
    //   },
    //   cellStyle: {
    //     display: "flex",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     height: "100%",
    //   },
    // },

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

        // 컴마를 화살표로 변환하고 역명만 추출 (중복역 제거 없음)
        const stations = params.value
          .split(",")
          .map((station: string) => station.trim());
        const formattedStations: string[] = [];

        stations.forEach((station: string, index: number) => {
          // 첫 번째 역이 아니면 화살표 추가
          if (index > 0) {
            formattedStations.push(" → ");
          }

          // (노선)호선_역명(역번호) 형태에서 역명만 추출 (호선이 숫자 또는 문자열 모두 가능)
          const stationMatch = station.match(/\([^)]+\)[^_]*_([^(]+)\(/);
          const stationName = stationMatch ? stationMatch[1] : station;
          formattedStations.push(stationName);
        });

        return React.createElement(
          "div",
          {
            className: "truncate",
            style: {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            title: formattedStations.join(""), // 전체 텍스트를 툴팁으로 표시
          },
          formattedStations.join("")
        );
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
