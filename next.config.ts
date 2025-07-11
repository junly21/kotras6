import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API 라우트를 사용하므로 정적 내보내기 비활성화
  // output: "export", // 정적 파일로 내보내기
  trailingSlash: true, // URL 끝에 슬래시 추가
  images: {
    unoptimized: true, // 정적 배포를 위해 이미지 최적화 비활성화
  },
  // ESLint 비활성화
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript 체크 비활성화
  typescript: {
    ignoreBuildErrors: true,
  },
  // 외부 접근 허용 설정
  allowedDevOrigins: ["192.168.111.84", "localhost", "127.0.0.1"],
  // 외부 API와 연동하므로 basePath 설정 (필요시)
  // basePath: '/your-app-path',
};

export default nextConfig;
