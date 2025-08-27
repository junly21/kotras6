export type FieldType =
  | "text"
  | "date"
  | "daterange"
  | "select"
  | "autocomplete"
  | "combobox";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  optionsEndpoint?: string; // select/auto 완성용 API 경로
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  dependsOn?: string; // 다른 필드에 의존하는 경우 해당 필드명
  filterOptions?: (options: FieldOption[]) => FieldOption[]; // 옵션 필터링 함수
  error?: string; // 에러 메시지
  className?: string; // CSS 클래스명
}
