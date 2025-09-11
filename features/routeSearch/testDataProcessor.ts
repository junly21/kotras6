import { RouteSearchTestResult } from "@/types/routeSearch";
import { getRouteIdentifier } from "@/utils/routeIdentifier";

interface RouteSearchTestGridData {
  id: string; // path_key + path_seq 조합으로 변경
  confirmedPath: string;
  groupNo: number;
  groupDisplay: string | number | null;
  mainStations: string;
  detailedPath: string;
  isSelected: boolean;
  originalData: RouteSearchTestResult;
  cnt: number;
}

export function processRouteSearchTestResults(
  searchResults: RouteSearchTestResult[],
  selectedPaths: RouteSearchTestResult[]
): RouteSearchTestGridData[] {
  if (!searchResults || searchResults.length === 0) return [];

  // path_key별로 그룹화 (테스트 페이지는 path_key 기준으로만 그룹화)
  const pathKeyGroups = new Map<string, number>();
  let groupCounter = 1;

  // path_key별로 그룹 번호 할당
  searchResults.forEach((result) => {
    if (result.path_key && !pathKeyGroups.has(result.path_key)) {
      pathKeyGroups.set(result.path_key, groupCounter++);
    }
  });

  // path_key 기준으로 정렬
  const sortedResults = [...searchResults].sort((a, b) => {
    const groupA = pathKeyGroups.get(a.path_key || "") || 0;
    const groupB = pathKeyGroups.get(b.path_key || "") || 0;
    return groupA - groupB;
  });

  return sortedResults.map((result, index) => {
    // transfer_list 파싱 (JSON 문자열을 배열로 변환)
    let transferStations: string[] = [];
    try {
      if (result.transfer_list && result.transfer_list !== "[]") {
        transferStations = JSON.parse(result.transfer_list);
      }
    } catch {
      console.warn("transfer_list 파싱 실패:", result.transfer_list);
    }

    // 주요경유지 구성: 출발역 + 환승역 + 도착역
    const pathComponents: string[] = [];

    // 출발역
    if (result.start_node) {
      const startStation = result.start_node.match(
        /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
      );
      if (startStation) {
        pathComponents.push(startStation[1]);
      }
    }

    // 환승역들
    transferStations.forEach((transfer) => {
      const transferStation = transfer.match(/\([^)]+\)[^_]*_([^(]+)\([^)]+\)/);
      if (transferStation) {
        pathComponents.push(transferStation[1]);
      }
    });

    // 도착역
    if (result.end_node) {
      const endStation = result.end_node.match(
        /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
      );
      if (endStation) {
        pathComponents.push(endStation[1]);
      }
    }

    // 중복 제거: 연속된 같은 역을 제거
    const uniquePathComponents = pathComponents.filter((station, index) => {
      return index === 0 || station !== pathComponents[index - 1];
    });

    const currentGroupNo = pathKeyGroups.get(result.path_key || "") || 0;

    // 그룹 표시: 같은 그룹의 첫 번째 행에만 그룹 번호 표시
    const isFirstInGroup =
      index === 0 ||
      pathKeyGroups.get(sortedResults[index - 1].path_key || "") !==
        currentGroupNo;

    // 상세경로 처리: path_nm을 그대로 사용 (중복역 포함)
    const cleanedDetailedPath = result.path_nm || "";
    // 고유 식별자 생성 (path_key + path_seq 조합)
    const routeId = getRouteIdentifier(result) || `route_${index}`;

    return {
      id: routeId, // 문자열로 변경
      confirmedPath: result.confirmed_path || "N",
      groupNo: currentGroupNo,
      groupDisplay: isFirstInGroup ? result.path_key : null,
      mainStations: uniquePathComponents.join(" → "),
      detailedPath: cleanedDetailedPath,
      isSelected: selectedPaths.some((path) => {
        const pathId = getRouteIdentifier(path);
        const resultId = getRouteIdentifier(result);
        return pathId && resultId && pathId === resultId;
      }),
      originalData: result,
      cnt: result.cnt || 0, // API에서 cnt 필드가 추가될 예정
    };
  });
}
