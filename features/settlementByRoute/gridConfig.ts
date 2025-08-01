import { ColDef, ColGroupDef } from "ag-grid-community";
import type { SettlementByRouteData } from "@/types/settlementByRoute";

// 동적으로 컬럼을 생성하는 함수 (그룹핑 포함)
export function createSettlementByRouteColDefs(
  data: SettlementByRouteData[]
): (ColDef<SettlementByRouteData> | ColGroupDef<SettlementByRouteData>)[] {
  if (!data || data.length === 0) {
    // 기본 컬럼 정의 (데이터가 없을 때)
    return [
      {
        headerName: "노선명",
        field: "line_nm",
        width: 150,
        pinned: "left",
      },
      {
        headerName: "수급액",
        field: "receiveAmount",
        width: 120,
        resizable: true,
        type: "numericColumn",
      },
      {
        headerName: "지급액",
        field: "payAmount",
        width: 120,
        resizable: true,
        type: "numericColumn",
      },
      {
        headerName: "차액",
        field: "difference",
        width: 120,
        resizable: true,
        type: "numericColumn",
      },
    ];
  }

  const firstItem = data[0];
  const keys = Object.keys(firstItem);

  // 첫 번째 컬럼은 항상 line_nm (노선명)으로 고정
  const columns: (
    | ColDef<SettlementByRouteData>
    | ColGroupDef<SettlementByRouteData>
  )[] = [
    {
      headerName: "노선명",
      field: "line_nm",
      width: 150,
      resizable: true,
      pinned: "left",
      cellStyle: { fontWeight: "bold" },
      valueFormatter: (params) => {
        if (params.value && typeof params.value === "string") {
          // 기관명_노선명 형태에서 노선명만 추출
          const parts = params.value.split("_");
          if (parts.length >= 2) {
            return parts[1]; // 노선명 부분만 반환
          }
        }
        return params.value || "";
      },
    },
  ];

  // 나머지 키들을 분석하여 그룹핑
  const groupMap = new Map<
    string,
    { groupName: string; columns: ColDef<SettlementByRouteData>[] }
  >();

  keys.forEach((key) => {
    if (key === "line_nm") return; // line_nm은 이미 처리됨

    const parts = key.split("_");
    if (parts.length >= 3) {
      const agencyName = parts[0]; // 기관명
      const lineName = parts[1]; // 노선명
      const type = parts[2]; // 지급/수급

      const groupKey = `${agencyName}_${lineName}`;
      // 노선명만 표시 (기관명 제거)
      const groupName = lineName;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          groupName,
          columns: [],
        });
      }

      const group = groupMap.get(groupKey)!;
      group.columns.push({
        headerName: type === "지급" ? "지급" : "수급",
        field: key,
        width: 170,
        resizable: true,
        type: "numericColumn",
        valueFormatter: (params) => {
          if (params.value != null && typeof params.value === "number") {
            return params.value.toLocaleString();
          }
          return params.value || "";
        },
        cellStyle: { textAlign: "right" },
      });
    } else {
      // 그룹핑할 수 없는 키는 개별 컬럼으로 추가
      const value = firstItem[key];
      const isNumber = typeof value === "number";

      columns.push({
        headerName: key,
        field: key,
        width: isNumber ? 120 : 150,
        resizable: true,
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
  console.log("dd", columns);
  return columns;
}
