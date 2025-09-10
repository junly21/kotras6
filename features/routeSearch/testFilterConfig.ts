import { FieldConfig } from "@/types/filterForm";

export const routeSearchTestFilterConfig: FieldConfig[] = [
  {
    name: "PAGE",
    label: "페이지",
    type: "text",
    placeholder: "페이지 번호를 입력하세요",
    required: true,
  },
  {
    name: "PAGESIZE",
    label: "페이지 크기",
    type: "text",
    placeholder: "페이지 크기를 입력하세요",
    required: true,
  },
];
