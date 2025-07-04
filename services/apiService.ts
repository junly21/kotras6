interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  type?: "json" | "html" | "text";
  message?: string;
}

interface PayRecvOperParams {
  oper_id: string;
}

export class ApiService {
  private static baseUrl = "http://192.168.111.152:8080/kotras6";

  static async fetchPayRecvOperList(
    params: PayRecvOperParams
  ): Promise<ApiResponse> {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseUrl}/selectPayRecvOperList.do?${queryString}`;

      console.log("API 요청 URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

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

        // HTML에서 JSON 데이터 추출 시도
        const jsonMatch = textData.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (jsonMatch) {
          console.log("스크립트 태그 내용:", jsonMatch[1]);
        }

        return {
          success: true,
          data: {
            content: textData.substring(0, 1000),
            message: "HTML 응답을 받았습니다. JSON 데이터가 아닙니다.",
          },
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
}
