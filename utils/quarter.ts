/**
 * YYYY-MM-DD 형식 날짜 문자열에서 분기(1~4) 반환
 * 1~3월=1, 4~6월=2, 7~9월=3, 10~12월=4
 */
export function getQuarter(dateStr: string): number {
  const month = parseInt(dateStr.slice(5, 7), 10);
  if (month >= 1 && month <= 3) return 1;
  if (month >= 4 && month <= 6) return 2;
  if (month >= 7 && month <= 9) return 3;
  if (month >= 10 && month <= 12) return 4;
  return 0;
}

/**
 * 옵션 목록에서 해당 분기에 속한 날짜 value만 추출
 */
export function getDateValuesInQuarter(
  options: { value: string; label: string }[],
  quarter: 1 | 2 | 3 | 4
): string[] {
  return options
    .filter((opt) => getQuarter(String(opt.value)) === quarter)
    .map((opt) => String(opt.value));
}

const QUARTER_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "1분기",
  2: "2분기",
  3: "3분기",
  4: "4분기",
};

/**
 * 선택된 날짜와 옵션 목록을 기준으로, 완전히 선택된 분기는 "1분기" 등으로,
 * 나머지는 개별 날짜로 표시용 배열 생성
 */
export function buildSelectedDateDisplay(
  dateOptions: { value: string; label: string }[],
  selectedDates: string[]
): string[] {
  const selectedSet = new Set(selectedDates);
  const display: string[] = [];
  const usedDates = new Set<string>();

  for (const q of [1, 2, 3, 4] as const) {
    const quarterDates = getDateValuesInQuarter(dateOptions, q);
    if (quarterDates.length === 0) continue;
    const allSelected = quarterDates.every((d) => selectedSet.has(d));
    if (allSelected) {
      display.push(QUARTER_LABELS[q]);
      quarterDates.forEach((d) => usedDates.add(d));
    }
  }

  const remainder = selectedDates.filter((d) => !usedDates.has(d)).sort();
  return [...display, ...remainder];
}
