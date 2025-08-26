import { ColDef, ColGroupDef } from "ag-grid-community";
import type { SettlementByStationData } from "@/types/settlementByStation";

// 동적으로 컬럼을 생성하는 함수 (그룹핑 포함)
export function createSettlementByStationColDefs(
  data: SettlementByStationData[],
  selectedStations: string[]
): (ColDef<SettlementByStationData> | ColGroupDef<SettlementByStationData>)[] {
  if (!data || data.length === 0) {
    // 기본 컬럼 정의 (데이터가 없을 때)
    return [
      {
        headerName: "역명",
        field: "stn_nm",
        width: 150,
        pinned: "left",
      },
    ];
  }

  const firstItem = data[0];
  const keys = Object.keys(firstItem);

  // 첫 번째 컬럼은 항상 stn_nm (역명)으로 고정
  const columns: (
    | ColDef<SettlementByStationData>
    | ColGroupDef<SettlementByStationData>
  )[] = [
    {
      headerName: "역명",
      field: "stn_nm",
      width: 150,
      resizable: false,
      pinned: "left",
      cellStyle: { fontWeight: "bold" },
    },
  ];

  // 선택된 역들에 대한 그룹핑
  const groupMap = new Map<
    string,
    { groupName: string; columns: ColDef<SettlementByStationData>[] }
  >();

  keys.forEach((key) => {
    if (key === "stn_nm") return; // stn_nm은 이미 처리됨

    const parts = key.split("_");
    if (parts.length >= 2) {
      const stationName = parts[0]; // 역명
      const type = parts[1]; // 지급/수급

      // 선택된 역인지 확인
      if (selectedStations.includes(stationName)) {
        if (!groupMap.has(stationName)) {
          groupMap.set(stationName, {
            groupName: stationName,
            columns: [],
          });
        }

        const group = groupMap.get(stationName)!;
        group.columns.push({
          headerName: type === "지급" ? "지급" : "수급",
          field: key,
          flex: 1,
          minWidth: 170,
          resizable: false,
          type: "numericColumn",
          valueFormatter: (params) => {
            if (params.value != null && typeof params.value === "number") {
              return params.value.toLocaleString();
            }
            return params.value || "";
          },
          cellStyle: { textAlign: "right" },
        });
      }
    } else {
      // 그룹핑할 수 없는 키는 개별 컬럼으로 추가
      const value = firstItem[key];
      const isNumber = typeof value === "number";

      columns.push({
        headerName: key,
        field: key,
        width: isNumber ? 120 : 150,
        resizable: false,
        type: isNumber ? "numericColumn" : undefined,
        valueFormatter: isNumber
          ? (params) => {
              if (params.value != null && typeof params.value === "number") {
                return params.value.toLocaleString();
              }
              return params.value || "";
            }
          : undefined,
        cellStyle: isNumber ? { textAlign: "right" } : undefined,
      });
    }
  });

  // 그룹핑된 컬럼들을 추가
  groupMap.forEach((group) => {
    columns.push({
      headerName: group.groupName,
      children: group.columns,
      headerClass: "ag-header-group-cell center-group-header",
    });
  });

  return columns;
}
