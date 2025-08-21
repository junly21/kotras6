interface RawDataCsvExportButtonProps {
  fileName?: string;
  className?: string;
  columnOrder?: string[]; // 칼럼 순서 지정
  rawData: Record<string, unknown>[]; // 원본 API 데이터
}

export default function RawDataCsvExportButton({
  fileName = "data.csv",
  className = "",
  columnOrder,
  rawData,
}: RawDataCsvExportButtonProps) {
  const handleExport = () => {
    if (!rawData || rawData.length === 0) {
      alert("내보낼 데이터가 없습니다.");
      return;
    }

    // 칼럼 순서 결정
    let columns: string[];
    if (columnOrder && columnOrder.length > 0) {
      // 지정된 칼럼 순서 사용
      columns = columnOrder.filter((col) => {
        // 실제 데이터에 존재하는 칼럼만 필터링
        return rawData[0].hasOwnProperty(col);
      });
    } else {
      // 기본: 첫 번째 행의 키값을 기준으로 컬럼 생성
      columns = Object.keys(rawData[0]);
    }

    // CSV 헤더 생성
    const csvHeader = columns.join(",");

    // CSV 데이터 생성
    const csvData = rawData.map((row) => {
      return columns
        .map((col) => {
          let value = row[col];

          // open_date 필드 가공 (timestamp를 YYYYMMDD로 변환)
          if (col === "open_date" && value) {
            try {
              const timestamp = parseInt(String(value));
              if (!isNaN(timestamp)) {
                const date = new Date(timestamp);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                value = `${year}${month}${day}`;
              }
            } catch {
              // 변환 실패 시 원본 값 유지
              console.warn("open_date 변환 실패:", value);
            }
          }

          // 값이 쉼표를 포함하거나 줄바꿈이 있는 경우 따옴표로 감싸기
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes("\n") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          // 0값도 유효한 데이터이므로 포함
          return value !== undefined && value !== null ? value : "";
        })
        .join(",");
    });

    // CSV 전체 내용 생성
    const csvContent = [csvHeader, ...csvData].join("\n");

    // 파일 다운로드
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className={`bg-primary font-bold hover:bg-secondary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${className}`}
      title="원본 데이터로 CSV 파일 내보내기">
      CSV 내보내기
    </button>
  );
}
