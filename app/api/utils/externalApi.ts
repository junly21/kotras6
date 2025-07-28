const EXTERNAL_BASE_URL = "http://192.168.111.152:8080/kotras6";
// const EXTERNAL_BASE_URL = "http://192.168.110.21:28480/kotras6";

export interface ExternalApiConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

export async function callExternalApi(
  endpoint: string,
  config: ExternalApiConfig = {}
): Promise<{ data: unknown; contentType: string | null }> {
  const { method = "GET", headers = {}, body, params = {} } = config;

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

  console.log("외부 API 호출:", { method, url: externalUrl, headers, body });

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

  const response = await fetch(externalUrl, requestConfig);

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
    console.log("외부 API JSON 응답 데이터:", data);
  } else {
    const textData = await response.text();
    console.log(
      "외부 API 텍스트 응답 데이터 (처음 500자):",
      textData.substring(0, 500)
    );

    data = {
      type: "html",
      content: textData.substring(0, 1000),
      message: "HTML 응답을 받았습니다. JSON 데이터가 아닙니다.",
    };
  }

  return { data, contentType };
}

export function createCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
