import { FieldConfig } from "@/types/filterForm";
import { z } from "zod";

// 검증 스키마
export const networkMapSchema = z.object({
  network: z.string().min(1, "네트워크명은 필수입니다"),
  agency: z.string().min(1, "기관명은 필수입니다"),
  line: z.string().min(1, "노선은 필수입니다"),
});

// 필터 필드 설정
export const networkMapFilterConfig: FieldConfig[] = [
  {
    name: "network",
    label: "네트워크명",
    type: "select",
    required: true,
  },
  {
    name: "agency",
    label: "기관명",
    type: "select",
    required: true,
  },
  {
    name: "line",
    label: "노선",
    type: "select",
    required: true,
  },
];
