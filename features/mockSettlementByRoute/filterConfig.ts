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
    label: "기관명",
    type: "select" as const,
    optionsEndpoint: "/api/common/agencies",
    placeholder: "기관명을 선택하세요",
    filterOptions: (options) => options.filter((opt) => opt.label !== "전체"),
  },
];

export type MockSettlementByRouteFilters = z.infer<
  typeof mockSettlementByRouteSchema
>;
