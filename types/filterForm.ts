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
}
