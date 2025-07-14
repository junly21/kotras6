import { ApiClient, ApiResponse } from "./apiClient";
import type { JobLogData, JobLogFilters } from "@/types/jobLog";

export class JobLogService {
  // 작업로그 목록 조회
  static async getJobLogList(
    filters: JobLogFilters
  ): Promise<ApiResponse<JobLogData[]>> {
    return ApiClient.post<JobLogData[]>("/job-logs", filters);
  }
}
