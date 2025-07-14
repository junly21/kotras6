import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

// 필터 스키마
export const jobLogSchema = z.object({
  processDiv: z.string().min(1, "프로세스구분을 선택해주세요"),
});

// 필터 필드 정의
export const jobLogFields: FieldConfig[] = [
  {
    name: "processDiv",
    label: "프로세스구분",
    type: "select",
    required: true,
    placeholder: "프로세스구분을 선택하세요",
    optionsEndpoint: "/api/job-logs/process-div-options",
  },
];

export type JobLogField = (typeof jobLogFields)[number];
