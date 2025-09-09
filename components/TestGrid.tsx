import { AgGridReact } from "ag-grid-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TestGridProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rowData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columnDefs: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pinnedBottomRowData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gridRef: React.RefObject<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gridOptions?: any;
  height?: number | string; // 높이 props 추가
  enableNumberColoring?: boolean; // 숫자 색상 적용 여부
}

export default function TestGrid({
  rowData,
  columnDefs,
  pinnedBottomRowData,
  gridRef,
  gridOptions = {},
  height = "100%", // 기본값
  enableNumberColoring = false, // 기본값
}: TestGridProps) {
  return (
    <>
      <style>{`
        .ag-theme-alpine .ag-header-cell-comp-wrapper {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 100% !important;
          width: 100% !important;
        }
      `}</style>
      <div
        className="ag-theme-alpine"
        style={{
          height,
          ["--ag-header-row-border" as any]: "1px solid #363636",
          ["--ag-wrapper-border" as any]: "transparent",
          ["--ag-wrapper-border-radius" as any]: "24px",
          ["--ag-header-background-color" as any]: "#fff",
        }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          pinnedBottomRowData={pinnedBottomRowData}
          // 기본 그리드 옵션
          rowHeight={35}
          suppressColumnResize={false} // 컬럼 리사이징 허용 (개별 컬럼에서 제어)
          suppressRowClickSelection={true} // 행 클릭 선택 비활성화
          suppressCellFocus={true} // 셀 포커스 비활성화
          suppressRowHoverHighlight={false} // 행 호버 하이라이트 허용
          localeText={{
            noRowsToShow: "조회된 결과가 없습니다. 조회를 진행해주세요",
          }}
          // 숫자 색상 적용이 활성화된 경우 기본 스타일 설정
          {...(enableNumberColoring && {
            defaultColDef: {
              sortable: false,
              filter: false,
              resizable: false,
              suppressMovable: true,
              ...gridOptions.defaultColDef,
              cellStyle: (params: any) => {
                // 기존 cellStyle이 있으면 먼저 적용
                const baseStyle = gridOptions.defaultColDef?.cellStyle
                  ? typeof gridOptions.defaultColDef.cellStyle === "function"
                    ? gridOptions.defaultColDef.cellStyle(params)
                    : gridOptions.defaultColDef.cellStyle
                  : {};

                // 순번 칼럼(#)은 색상 적용 제외
                if (params.column.colDef.headerName === "#") {
                  return baseStyle;
                }

                // 숫자 값에 대한 색상 적용 (순번 칼럼 제외)
                if (typeof params.value === "number") {
                  return {
                    ...baseStyle,
                    color:
                      params.value > 0
                        ? "#dc2626"
                        : params.value < 0
                        ? "#2563eb"
                        : "#000000",
                    fontWeight: "bold",
                  };
                }

                return baseStyle;
              },
            },
          })}
          // 추가 옵션들
          {...gridOptions}
        />
      </div>
    </>
  );
}
