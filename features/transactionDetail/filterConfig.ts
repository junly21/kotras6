import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

// 필터 스키마
export const transactionDetailSchema = z.object({
  tradeDate: z.string().min(1, "거래일자를 선택해주세요"),
  cardType: z.string().min(1, "카드구분을 선택해주세요"),
  agency: z.string().min(1, "기관명을 선택해주세요"),
  line: z.string().min(1, "노선명을 선택해주세요"),
  stations: z.array(z.string()).min(1, "역을 하나 이상 선택해주세요"),
});

// 필터 필드 설정
export const transactionDetailFields: FieldConfig[] = [
  {
    name: "tradeDate",
    label: "거래일자",
    type: "select",
    required: true,
    placeholder: "거래일자를 선택하세요",
    optionsEndpoint: "/api/transaction-detail/dates",
  },
  {
    name: "cardType",
    label: "카드구분",
    type: "select",
    required: true,
    placeholder: "카드구분을 선택하세요",
    optionsEndpoint: "/api/transaction-detail/card-types",
  },
  {
    name: "agency",
    label: "기관명",
    type: "select",
    required: true,
    placeholder: "기관명을 선택하세요",
    optionsEndpoint: "/api/common/agencies?includeAll=true",
    // 상세조회에서는 기관명 label을 사용
    useLabel: true,
  },
  {
    name: "line",
    label: "노선명",
    type: "select",
    required: true,
    placeholder: "노선명을 선택하세요",
    optionsEndpoint: "/api/transaction-detail/lines",
    disabled: (values) => !values.agency,
    dependsOn: ["agency"],
  },
  {
    name: "stations",
    label: "역선택",
    type: "multicheckbox",
    required: true,
    placeholder: "역을 선택하세요",
    optionsEndpoint: "/api/transaction-detail/stations",
    disabled: (values) => !values.agency,
    dependsOn: ["agency"],
  },
];
