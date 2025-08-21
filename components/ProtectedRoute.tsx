"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@/contexts/SessionContext";
import { hasPathPermission } from "@/utils/agencyPermissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string; // 기존 1depth 권한 (하위 호환성)
  requiredPath?: string; // 2depth 경로 권한 체크
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  requiredPath,
  fallbackPath = "/",
}: ProtectedRouteProps) {
  const { canAccess, session, isInitialized } = useSessionContext();
  const router = useRouter();

  React.useEffect(() => {
    if (!isInitialized) return;

    let hasAccess = true;

    // 2depth 경로 권한 체크 (우선순위 높음)
    if (requiredPath) {
      hasAccess = hasPathPermission(session.agencyCode || "", requiredPath);
    }
    // 기존 1depth 권한 체크 (하위 호환성)
    else if (requiredPermission) {
      hasAccess = canAccess(
        requiredPermission as keyof import("@/types/agency").FeaturePermissions
      );
    }

    if (!hasAccess) {
      console.warn(`권한이 없습니다: ${requiredPath || requiredPermission}`);
      router.push(fallbackPath);
    }
  }, [
    canAccess,
    requiredPermission,
    requiredPath,
    router,
    fallbackPath,
    isInitialized,
    session.agencyCode,
  ]);

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

  // 권한 체크
  let hasAccess = true;
  if (requiredPath) {
    hasAccess = hasPathPermission(session.agencyCode || "", requiredPath);
  } else if (requiredPermission) {
    hasAccess = canAccess(
      requiredPermission as keyof import("@/types/agency").FeaturePermissions
    );
  }

  // 권한이 없는 경우 접근 차단
  if (!hasAccess) {
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
