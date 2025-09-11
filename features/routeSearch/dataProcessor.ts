import { RouteSearchResult } from "@/types/routeSearch";

interface RouteSearchGridData {
  id: number;
  confirmedPath: string;
  confirmedPathDisplay: string | null;
  groupNo: number;
  groupDisplay: string | number | null;
  mainStations: string;
  detailedPath: string;
  isSelected: boolean;
  originalData: RouteSearchResult;
}

export function processRouteSearchResults(
  searchResults: RouteSearchResult[],
  selectedPaths: RouteSearchResult[]
): RouteSearchGridData[] {
  if (!searchResults || searchResults.length === 0) return [];

  // API 응답에서 group_no를 사용하거나, 없으면 path_key별로 그룹화
  const pathKeyGroups = new Map<string, number>();
  let groupCounter = 1;

  // 먼저 path_key별로 그룹 번호 할당 (API에서 group_no가 없는 경우를 대비)
  searchResults.forEach((result) => {
    if (result.path_key && !pathKeyGroups.has(result.path_key)) {
      pathKeyGroups.set(result.path_key, groupCounter++);
    }
  });

  // 먼저 그룹별로 정렬
  const sortedResults = [...searchResults].sort((a, b) => {
    const groupA = a.group_no || pathKeyGroups.get(a.path_key || "") || 0;
    const groupB = b.group_no || pathKeyGroups.get(b.path_key || "") || 0;
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

    const currentGroupNo =
      result.group_no || pathKeyGroups.get(result.path_key || "") || 0;

    // 그룹 표시: 같은 그룹의 첫 번째 행에만 그룹 번호 표시
    const isFirstInGroup =
      index === 0 ||
      (sortedResults[index - 1].group_no ||
        pathKeyGroups.get(sortedResults[index - 1].path_key || "") ||
        0) !== currentGroupNo;

    // 확정경로 포함 여부 표시: 같은 그룹 내에서 같은 값이 연속될 때 첫 번째에만 표시
    const currentConfirmedPath = result.confirmed_path || "N";
    const prevConfirmedPath =
      index > 0 ? sortedResults[index - 1].confirmed_path || "N" : null;

    const isFirstConfirmedPathInGroup =
      isFirstInGroup || // 그룹의 첫 번째 행이거나
      prevConfirmedPath !== currentConfirmedPath; // 이전 행과 확정경로 값이 다르면

    // 상세경로 처리: path_nm을 그대로 사용 (중복역 포함)
    let cleanedDetailedPath = result.path_nm || "";

    return {
      id: result.id || index,
      confirmedPath: currentConfirmedPath,
      confirmedPathDisplay: isFirstConfirmedPathInGroup
        ? currentConfirmedPath
        : null,
      groupNo: currentGroupNo,
      groupDisplay: isFirstInGroup ? currentGroupNo : null,
      mainStations: uniquePathComponents.join(" → "),
      detailedPath: cleanedDetailedPath,
      isSelected: selectedPaths.some((path) => path.id === result.id),
      originalData: result,
    };
  });
}
