import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

// 필터 스키마
export const networkMapSchema = z.object({
  network: z.string().min(1, "네트워크를 선택해주세요"),
  line: z.string().optional(),
});

// 필터 필드 설정
export const networkMapFields: FieldConfig[] = [
  {
    name: "network",
    label: "네트워크명",
    type: "select",
    required: true,
    placeholder: "네트워크를 선택하세요",
    optionsEndpoint: "/api/network/list",
  },
  {
    name: "line",
    label: "노선",
    type: "select",
    required: false,
    placeholder: "노선을 선택하세요",
    optionsEndpoint: "/api/network/lines",
  },
];
