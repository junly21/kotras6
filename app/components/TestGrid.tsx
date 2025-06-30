import { AgGridReact } from "ag-grid-react";

export default function TestGrid({
  rowData,
  columnDefs,
  pinnedBottomRowData,
  gridRef,
}: any) {
  return (
    <div className="ag-theme-alpine" style={{ height: 500 }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        pinnedBottomRowData={pinnedBottomRowData}
      />
    </div>
  );
}
