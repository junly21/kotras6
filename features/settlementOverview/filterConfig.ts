import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

// 필터 스키마
export const settlementOverviewSchema = z.object({
  stmtGrpId: z.string().min(1, "대안을 선택해주세요"),
});

export type SettlementOverviewFilters = z.infer<
  typeof settlementOverviewSchema
>;

// 필터 필드 정의
export const settlementOverviewFields: FieldConfig[] = [
  {
    name: "stmtGrpId",
    label: "대안",
    type: "select",
    required: true,
    placeholder: "대안을 선택하세요",
    optionsEndpoint: "/api/stmt_grp_id",
  },
];
