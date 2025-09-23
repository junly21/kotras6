import React from "react";
import { ColDef } from "ag-grid-community";
import { RouteSearchTestResult } from "@/types/routeSearch";

interface RouteSearchTestGridData {
  id: number;
  confirmedPath: string;
  groupNo: number;
  groupDisplay: string | number | null;
  groupDisplay2: string | number | null;
  mainStations: string;
  detailedPath: string;
  isSelected: boolean;
  originalData: RouteSearchTestResult;
  cnt: number;
  old_cnt: number;
}

export function createRouteSearchTestColDefs(
  onCheckboxChange: (route: RouteSearchTestResult, checked: boolean) => void,
  onDetailClick: (route: RouteSearchTestResult) => void,
  onSelectAllChange: (checked: boolean) => void,
  isAllSelected: boolean,
  isIndeterminate: boolean
): ColDef<RouteSearchTestGridData>[] {
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
        data: { originalData: RouteSearchTestResult };
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
      headerName: "cnt",
      resizable: true,
      field: "cnt",
      width: 100,
      sortable: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      },
    },

    {
      headerName: "경로키",
      resizable: true,
      field: "groupDisplay",
      width: 450,
      sortable: true,
      cellStyle: {
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100%",
        paddingLeft: "8px",
      },
      valueFormatter: (params: { value: string | number | null }) => {
        // null 값은 빈 문자열로 표시 (첫 번째 행이 아닌 경우)
        return params.value !== null ? String(params.value) : "";
      },
    },
    // {
    //   headerName: "old_경로키",
    //   resizable: true,
    //   field: "groupDisplay2",
    //   width: 450,
    //   sortable: true,
    //   cellStyle: {
    //     fontWeight: "bold",
    //     display: "flex",
    //     alignItems: "center",
    //     justifyContent: "flex-start",
    //     height: "100%",
    //     paddingLeft: "8px",
    //   },
    //   valueFormatter: (params: { value: string | number | null }) => {
    //     // null 값은 빈 문자열로 표시 (첫 번째 행이 아닌 경우)
    //     return params.value !== null ? String(params.value) : "";
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

          // (노선)번호_역명(역번호) 형태에서 역명만 추출
          const stationMatch = station.match(/\([^)]+\)\d+_([^(]+)\(/);
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
      cellRenderer: (params: {
        data: { originalData: RouteSearchTestResult };
      }) => {
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
