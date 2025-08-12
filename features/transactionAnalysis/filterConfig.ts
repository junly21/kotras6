import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

// 필터 스키마
export const transactionAnalysisSchema = z.object({
  agency: z.string().min(1, "기관을 선택해주세요"),
});

// 필터 필드 설정
export const transactionAnalysisFields: FieldConfig[] = [
  {
    name: "agency",
    label: "기관명",
    type: "select",
    required: true,
    placeholder: "기관명을 선택하세요",
    optionsEndpoint: "/api/common/agencies",
  },
];
