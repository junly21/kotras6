import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

// 필터 스키마
export const optimalRouteSchema = z.object({
  network: z.string().min(1, "네트워크를 선택해주세요"),
  startStation: z.string().min(1, "출발역을 선택해주세요"),
  endStation: z.string().min(1, "도착역을 선택해주세요"),
});

// 필터 필드 설정
export const optimalRouteFields: FieldConfig[] = [
  {
    name: "network",
    label: "네트워크명",
    type: "select",
    required: true,
    placeholder: "네트워크를 선택하세요",
    optionsEndpoint: "/api/selectNetWorkList",
  },
  {
    name: "startStation",
    label: "출발역",
    type: "combobox",
    required: true,
    placeholder: "출발역을 선택하세요",
    optionsEndpoint: "/api/selectNetWorkNodeList",
    disabled: (values) => !values.network,
  },
  {
    name: "endStation",
    label: "도착역",
    type: "combobox",
    required: true,
    placeholder: "도착역을 선택하세요",
    optionsEndpoint: "/api/selectNetWorkNodeList",
    disabled: (values) => !values.network,
  },
];
