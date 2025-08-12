import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

// 필터 스키마
export const settlementByRouteSchema = z.object({
  agency: z.string().min(1, "보관기관을 선택해주세요"),
});

export type SettlementByRouteFilters = z.infer<typeof settlementByRouteSchema>;

// 필터 필드 정의
export const settlementByRouteFields: FieldConfig[] = [
  {
    name: "agency",
    label: "기관명",
    type: "select",
    optionsEndpoint: "/api/common/agencies",
    placeholder: "기관명을 선택하세요",
  },
];
