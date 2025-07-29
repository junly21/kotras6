// CSV 다운로드 유틸리티 함수
export const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("다운로드할 데이터가 없습니다.");
    return;
  }

  try {
    // 헤더 추출 (첫 번째 객체의 키들을 사용)
    const headers = Object.keys(data[0]);

    // CSV 헤더 행 생성
    const csvHeader = headers.join(",") + "\n";

    // CSV 데이터 행 생성
    const csvRows = data
      .map((row) => {
        return headers
          .map((header) => {
            const value = row[header];
            // 값에 쉼표나 따옴표가 있으면 따옴표로 감싸기
            if (
              typeof value === "string" &&
              (value.includes(",") ||
                value.includes('"') ||
                value.includes("\n"))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          })
          .join(",");
      })
      .join("\n");

    // 전체 CSV 문자열 생성
    const csvContent = csvHeader + csvRows;

    // BOM 추가 (한글 깨짐 방지)
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csvContent;

    // Blob 생성
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });

    // 다운로드 링크 생성 및 클릭
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URL 해제
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("CSV 다운로드 중 오류:", error);
    alert("다운로드 중 오류가 발생했습니다.");
  }
};
