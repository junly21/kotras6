import { RouteSearchResult } from "@/types/routeSearch";

/**
 * 경로의 고유 식별자를 생성합니다.
 * path_key와 path_seq를 조합하여 안정적인 ID를 만듭니다.
 *
 * @param route 경로 데이터
 * @returns 고유 식별자 문자열
 */
export function getRouteIdentifier(route: RouteSearchResult): string {
  // path_key와 path_seq가 모두 있는 경우
  if (route.path_key && route.path_seq !== undefined) {
    return `${route.path_key}_${route.path_seq}`;
  }

  // path_key만 있는 경우
  if (route.path_key) {
    return route.path_key;
  }

  // fallback: 기존 id 사용 (없으면 빈 문자열)
  return route.id ? String(route.id) : "";
}

/**
 * 두 경로가 같은 경로인지 비교합니다.
 *
 * @param route1 첫 번째 경로
 * @param route2 두 번째 경로
 * @returns 같은 경로인지 여부
 */
export function isSameRoute(
  route1: RouteSearchResult,
  route2: RouteSearchResult
): boolean {
  // 1. 고유 식별자로 비교
  const id1 = getRouteIdentifier(route1);
  const id2 = getRouteIdentifier(route2);

  if (id1 && id2 && id1 === id2) {
    return true;
  }

  // 2. 기존 id로 비교 (fallback)
  if (route1.id && route2.id && route1.id === route2.id) {
    return true;
  }

  return false;
}

/**
 * 경로 배열에서 특정 경로를 찾습니다.
 *
 * @param routes 경로 배열
 * @param target 찾을 경로
 * @returns 찾은 경로의 인덱스 (-1이면 없음)
 */
export function findRouteIndex(
  routes: RouteSearchResult[],
  target: RouteSearchResult
): number {
  return routes.findIndex((route) => isSameRoute(route, target));
}

/**
 * 경로 배열에서 특정 경로를 제거합니다.
 *
 * @param routes 경로 배열
 * @param target 제거할 경로
 * @returns 제거된 경로가 포함된 새 배열
 */
export function removeRoute(
  routes: RouteSearchResult[],
  target: RouteSearchResult
): RouteSearchResult[] {
  return routes.filter((route) => !isSameRoute(route, target));
}
