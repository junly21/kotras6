import { NextRequest } from "next/server";

/**
 * Next.js 요청에서 클라이언트의 실제 IP 주소를 추출합니다.
 * 프록시나 로드밸런서를 통한 요청도 고려합니다.
 */
export function getClientIp(request: NextRequest): string {
  // 1. X-Forwarded-For 헤더 확인 (가장 우선순위)
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // X-Forwarded-For는 쉼표로 구분된 IP 목록일 수 있음 (첫 번째가 원본 클라이언트 IP)
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    const clientIp = ips[0];
    if (clientIp && clientIp !== "unknown") {
      return clientIp;
    }
  }

  // 2. X-Real-IP 헤더 확인
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp && xRealIp !== "unknown") {
    return xRealIp;
  }

  // 3. CF-Connecting-IP 헤더 확인 (Cloudflare 사용 시)
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp && cfConnectingIp !== "unknown") {
    return cfConnectingIp;
  }

  // 4. X-Client-IP 헤더 확인
  const xClientIp = request.headers.get("x-client-ip");
  if (xClientIp && xClientIp !== "unknown") {
    return xClientIp;
  }

  // 5. 마지막으로 Next.js의 connection.remoteAddress 사용
  const remoteAddress = request.ip;
  if (
    remoteAddress &&
    remoteAddress !== "127.0.0.1" &&
    remoteAddress !== "::1"
  ) {
    // IPv4-mapped IPv6 주소를 IPv4로 변환
    if (remoteAddress.startsWith("::ffff:")) {
      return remoteAddress.substring(7); // ::ffff: 제거
    }
    return remoteAddress;
  }

  // 6. 모든 방법이 실패하면 기본값 반환
  return "unknown";
}

/**
 * 클라이언트 IP를 X-Forwarded-For 헤더 형식으로 포맷팅합니다.
 */
export function formatXForwardedFor(
  clientIp: string,
  existingXForwardedFor?: string
): string {
  if (existingXForwardedFor) {
    // 기존 X-Forwarded-For 헤더가 있으면 앞에 추가
    return `${clientIp}, ${existingXForwardedFor}`;
  }
  return clientIp;
}
