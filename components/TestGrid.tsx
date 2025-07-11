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
}

export default function TestGrid({
  rowData,
  columnDefs,
  pinnedBottomRowData,
  gridRef,
  gridOptions = {},
}: TestGridProps) {
  return (
    <div className="ag-theme-alpine" style={{ height: 500 }}>
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
