"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@/contexts/SessionContext";
import { FeaturePermissions } from "@/types/agency";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: keyof FeaturePermissions;
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  fallbackPath = "/",
}: ProtectedRouteProps) {
  const { canAccess, isInitialized } = useSessionContext();
  const router = useRouter();

  React.useEffect(() => {
    if (isInitialized && !canAccess(requiredPermission)) {
      console.warn(`권한이 없습니다: ${requiredPermission}`);
      router.push(fallbackPath);
    }
  }, [canAccess, requiredPermission, router, fallbackPath, isInitialized]);

  // 권한 체크 중이거나 권한이 없는 경우 로딩 표시
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 권한이 없는 경우 접근 차단
  if (!canAccess(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600 mb-4">
            이 페이지에 접근할 수 있는 권한이 없습니다.
          </p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
