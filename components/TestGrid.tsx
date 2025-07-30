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
}

export default function TestGrid({
  rowData,
  columnDefs,
  pinnedBottomRowData,
  gridRef,
  gridOptions = {},
  height = "100%", // 기본값
}: TestGridProps) {
  return (
    <div className="ag-theme-alpine" style={{ height, ['--ag-header-row-border' as any]: "1px solid #363636", ['--ag-wrapper-border' as any]: 'transparent', ['--ag-wrapper-border-radius' as any]: '24px', ['--ag-header-background-color' as any]: '#fff'}}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        pinnedBottomRowData={pinnedBottomRowData}
        // 기본 그리드 옵션
        suppressColumnResize={false} // 컬럼 리사이징 허용 (개별 컬럼에서 제어)
        suppressRowClickSelection={true} // 행 클릭 선택 비활성화
        suppressCellFocus={true} // 셀 포커스 비활성화
        suppressRowHoverHighlight={false} // 행 호버 하이라이트 허용
        // 추가 옵션들
        {...gridOptions}
      />
    </div>
  );
}
