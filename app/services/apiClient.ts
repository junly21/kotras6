export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  type?: "json" | "html" | "text";
  message?: string;
}

export interface ApiRequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

export class ApiClient {
  // 엔드포인트별 API Routes 사용
  private static baseUrl = "/api";

  static async request<T = unknown>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", headers = {}, body, params = {} } = config;

    try {
      // URL 파라미터 처리
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlParams.append(key, String(value));
        }
      });

      const queryString = urlParams.toString();
      const url = `${this.baseUrl}${endpoint}${
        queryString ? `?${queryString}` : ""
      }`;

      console.log("API 요청:", { method, url, headers, body });

      const requestConfig: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      // GET이 아닌 경우에만 body 추가
      if (method !== "GET" && body) {
        requestConfig.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestConfig);

      console.log("응답 상태:", response.status);
      console.log("응답 헤더:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("서버 응답 에러:", errorText);
        return {
          success: false,
          error: `HTTP error! status: ${response.status}, body: ${errorText}`,
        };
      }

      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("JSON 응답 데이터:", data);
        return {
          success: true,
          data,
          type: "json",
        };
      } else {
        const textData = await response.text();
        console.log(
          "텍스트 응답 데이터 (처음 500자):",
          textData.substring(0, 500)
        );

        return {
          success: true,
          data: {
            content: textData.substring(0, 1000),
            message: "HTML 응답을 받았습니다. JSON 데이터가 아닙니다.",
          } as T,
          type: "html",
        };
      }
    } catch (error) {
      console.error("API 요청 중 오류 발생:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 편의 메서드들
  static async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  static async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, params });
  }

  static async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, params });
  }

  static async delete<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", params });
  }
}
