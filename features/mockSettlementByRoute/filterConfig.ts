import { z } from "zod";

export const mockSettlementByRouteSchema = z.object({
  settlementName: z.string().min(1, "정산명을 선택해주세요"),
  agency: z.string().min(1, "보관기관을 선택해주세요"),
});

export const mockSettlementByRouteFilterConfig = [
  {
    name: "settlementName",
    label: "정산명",
    type: "select" as const,
    placeholder: "정산명을 선택하세요",
    optionsEndpoint: "/api/mock-settlement/settlement-names-select",
    required: true,
  },
  {
    name: "agency",
    label: "보관기관",
    type: "select" as const,
    placeholder: "보관기관을 선택하세요",
    optionsEndpoint: "/api/common/agencies?includeAll=false",
    required: true,
  },
];

export type MockSettlementByRouteFilters = z.infer<
  typeof mockSettlementByRouteSchema
>;
