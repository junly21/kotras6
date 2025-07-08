import { AgGridReact } from "ag-grid-react";

interface CsvExportButtonProps {
  gridRef: React.RefObject<AgGridReact | null>;
  fileName?: string;
  className?: string;
}

export default function CsvExportButton({
  gridRef,
  fileName = "data.csv",
  className = "",
}: CsvExportButtonProps) {
  const handleExport = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName,
        // utf8Bom 옵션은 AG Grid Community 버전에서 지원되지 않을 수 있음
        // 대신 기본 옵션만 사용
      });
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`bg-primary hover:bg-secondary-600 text-white px-4 py-2 rounded transition-colors duration-200 cursor-pointer ${className}`}
      title="CSV 파일로 내보내기">
      CSV 내보내기
    </button>
  );
}
