import { z } from "zod";
import { NetworkFileUploadFilters } from "@/types/networkFileUpload";

// 필터 스키마
export const networkFileUploadSchema = z.object({
  network: z.string().min(1, "네트워크를 선택해주세요"),
});

// 필터 필드 설정
export const networkFileUploadFields = [
  {
    name: "network",
    label: "네트워크명",
    type: "select" as const,
    options: [], // 동적으로 로드됨
    required: true,
  },
];
