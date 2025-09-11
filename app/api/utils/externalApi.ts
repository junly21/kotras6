// 환경별 엔드포인트 자동 설정
const isDevelopment = process.env.NODE_ENV === "development";

// 개발 환경: 8080, 5001 포트 / 프로덕션 환경: 28480, 28482 포트
// export const EXTERNAL_BASE_URL = isDevelopment
//   ? "http://192.168.111.152:8080/kotras6"
//   : "http://192.168.110.21:28480/kotras6";

// export const OPTIMAL_ROUTE_BASE_URL = isDevelopment
//   ? "http://192.168.111.152:5001"
//   : "http://192.168.110.21:28482";

// 0912 테스트용 포트 번호에 따라 API URL 자동 설정
const getApiUrlByPort = () => {
  const port = process.env.PORT || "3000";

  // 포트별 API 서버 매핑
  switch (port) {
    case "3000":
      return "http://192.168.111.152:8080/kotras6";
    case "3001":
      return "http://192.168.111.152:8081/kotras6";
    default:
      // 기본값 (개발 환경: 8080, 프로덕션 환경: 28480)
      return isDevelopment
        ? "http://192.168.111.152:8080/kotras6"
        : "http://192.168.110.21:28480/kotras6";
  }
};

export const EXTERNAL_BASE_URL = getApiUrlByPort();
export const OPTIMAL_ROUTE_BASE_URL = "http://192.168.111.152:5001";

//개발 중 서버로 돌리고싶을때
// export const EXTERNAL_BASE_URL = "http://192.168.110.21:28480/kotras6";

// export const OPTIMAL_ROUTE_BASE_URL = "http://192.168.110.21:28482";

//도커용 url
// export const EXTERNAL_BASE_URL = "http://java-api:8080/kotras6";

// export const OPTIMAL_ROUTE_BASE_URL = "http://flask-api:5001";

// 환경 정보 로깅 (개발 시에만)
if (isDevelopment) {
  console.log("🔧 개발 환경 설정:", {
    EXTERNAL_BASE_URL,
    OPTIMAL_ROUTE_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}

export interface ExternalApiConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  sessionId?: string; // 세션 ID를 매개변수로 받음
  timeout?: number; // 타임아웃 설정 (밀리초)
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 기존 API 호출 함수 (개선된 버전)
export async function callExternalApi(
  endpoint: string,
  config: ExternalApiConfig = {}
): Promise<{ data: unknown; contentType: string | null }> {
  const {
    method = "GET",
    headers = {},
    body,
    params = {},
    sessionId,
    timeout = 30 * 60 * 1000, // 30분 타임아웃
  } = config;

  // 세션 쿠키 설정 (매개변수로 받은 sessionId 사용)
  let sessionCookie = "";
  if (sessionId) {
    sessionCookie = `JSESSIONID=${sessionId}`;
    console.log("세션 쿠키 설정:", sessionCookie);
  }

  // URL 파라미터 처리
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlParams.append(key, String(value));
    }
  });

  const queryString = urlParams.toString();
  const externalUrl = `${EXTERNAL_BASE_URL}/${endpoint}${
    queryString ? `?${queryString}` : ""
  }`;

  // 세션 쿠키가 있으면 헤더에 추가
  const finalHeaders = {
    "Content-Type": "application/json",
    ...(sessionCookie && { Cookie: sessionCookie }),
    ...headers,
  };

  console.log("외부 API 호출:", {
    method,
    url: externalUrl,
    headers: finalHeaders,
    body,
  });

  // 타임아웃 설정을 위한 AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestConfig: RequestInit = {
    method,
    headers: finalHeaders,
    signal: controller.signal,
  };

  // GET이 아닌 경우에만 body 추가
  if (method !== "GET" && body) {
    requestConfig.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(externalUrl, requestConfig);
    clearTimeout(timeoutId); // 타임아웃 타이머 정리

    console.log("외부 API 응답 상태:", response.status);
    console.log(
      "외부 API 응답 헤더:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("외부 API 응답 에러:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const contentType = response.headers.get("content-type");
    console.log("외부 API Content-Type:", contentType);

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      // console.log("외부 API JSON 응답 데이터:", data);
      // console.log(
      //   "외부 API JSON 응답 데이터:",
      //   JSON.stringify(data).substring(0, 300) + "..."
      // );
      console.log(data);
    } else {
      // const textData = await response.text();
      // console.log(
      //   "외부 API 텍스트 응답 데이터 (처음 500자):",
      //   textData.substring(0, 500)
      // );

      data = {
        type: "html",
        content: textData.substring(0, 1000),
        message: "HTML 응답을 받았습니다. JSON 데이터가 아닙니다.",
      };
    }

    return { data, contentType };
  } catch (error) {
    clearTimeout(timeoutId); // 에러 발생 시에도 타이머 정리

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`외부 API 호출 타임아웃 (${timeout / 1000}초)`);
    }

    throw error;
  }
}

// 최적경로 API 호출 함수
export async function callOptimalRouteApi(
  endpoint: string,
  config: ExternalApiConfig = {}
): Promise<ApiResponse> {
  try {
    const url = `${OPTIMAL_ROUTE_BASE_URL}/${endpoint}`;
    const method = config.method || "GET";

    console.log("최적경로 API 호출 URL:", url);
    console.log("최적경로 API HTTP 메서드:", method);
    console.log("최적경로 API 요청 데이터:", config.body);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    console.log("최적경로 API 응답 상태:", response.status);
    console.log(
      "최적경로 API 응답 헤더:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      // 에러 응답의 내용도 확인
      const errorText = await response.text();
      console.log("최적경로 API 에러 응답 내용:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("최적경로 API 응답 데이터:", data);
    return { success: true, data };
  } catch (error) {
    console.error(`최적경로 API 호출 실패 (${endpoint}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function createCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
