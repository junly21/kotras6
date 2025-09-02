// 서버에서만 실행되도록 보호
if (typeof window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Agent, setGlobalDispatcher } = require("undici");

  const agent = new Agent({
    // 헤더 수신까지 허용 시간
    headersTimeout: 40 * 60 * 1000, // 40분
    // 본문 수신까지 허용 시간
    bodyTimeout: 40 * 60 * 1000, // 40분
    // 읽기 타임아웃 (ETIMEDOUT 해결)
    connectTimeout: 40 * 60 * 1000, // 40분
    // keep-alive 관련 (인프라 상황에 맞게 조정)
    keepAliveTimeout: 60_000,
    keepAliveMaxTimeout: 60_000,
  });

  setGlobalDispatcher(agent);
  console.log("[undici] 전역 Dispatcher 설정 완료 - headersTimeout: 40분");
}

// 파일을 모듈로 만들기 위한 빈 export
export {};
