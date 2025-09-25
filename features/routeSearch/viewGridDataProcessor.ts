import { RouteSearchResult } from "@/types/routeSearch";
import { isSameRoute } from "@/utils/routeIdentifier";
import { Node } from "@/types/network";

interface ViewGridData {
  id: number;
  startStation: string;
  endStation: string;
  groupNo: number;
  groupDisplay: string | number | null;
  detailedPath: string;
  cnt: number | null;
  isSelected: boolean;
  originalData: RouteSearchResult;
}

export function processViewResults(
  searchResults: RouteSearchResult[],
  selectedPaths: RouteSearchResult[],
  nodes: Node[] = []
): ViewGridData[] {
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
    // 출발역과 도착역 추출
    let startStationName = "";
    let endStationName = "";

    if (result.start_node) {
      const startStation = result.start_node.match(
        /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
      );
      if (startStation) {
        // @_ 형태의 prefix 제거 (A_, SH_, 2_ 등)
        startStationName = startStation[1].replace(/^[A-Z0-9]+_/, "");
      }
    }

    if (result.end_node) {
      const endStation = result.end_node.match(
        /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
      );
      if (endStation) {
        // @_ 형태의 prefix 제거 (A_, SH_, 2_ 등)
        endStationName = endStation[1].replace(/^[A-Z0-9]+_/, "");
      }
    }

    // 상세경로 구성: path_num의 노드 ID를 역명으로 변환
    let detailedPath = "";
    if (result.path_num) {
      const nodeIds = result.path_num
        .split(", ")
        .map((id: string) => id.trim())
        .filter((id: string) => id.length > 0);

      const stationNames = nodeIds.map((nodeId: string) => {
        // 노드 데이터에서 해당 ID의 역명 찾기
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          // 노드 이름에서 @_ 형태의 prefix 제거 (A_, SH_, 2_ 등)
          const nodeName = node.name || nodeId;
          return nodeName.replace(/^[A-Z0-9]+_/, "");
        }
        return nodeId; // 노드를 찾지 못한 경우 ID 그대로 표시
      });

      // 연속된 같은 역명 제거 (A역 -> A역 -> B역 -> B역 -> C역 → A역 -> B역 -> C역)
      const uniqueStationNames = stationNames.filter((station, index) => {
        return index === 0 || station !== stationNames[index - 1];
      });

      detailedPath = uniqueStationNames.join(" → ");
    }

    const currentGroupNo =
      result.group_no || pathKeyGroups.get(result.path_key || "") || 0;

    // 그룹 표시: 같은 그룹의 첫 번째 행에만 그룹 번호 표시
    const isFirstInGroup =
      index === 0 ||
      (sortedResults[index - 1].group_no ||
        pathKeyGroups.get(sortedResults[index - 1].path_key || "") ||
        0) !== currentGroupNo;

    return {
      id: result.id || index,
      //   startStation: isFirstInGroup ? startStationName : "",
      //   endStation: isFirstInGroup ? endStationName : "",
      startStation: index === 0 ? startStationName : "",
      endStation: index === 0 ? endStationName : "",
      groupNo: result.group_no || 0,
      groupDisplay: isFirstInGroup ? currentGroupNo : null,
      detailedPath: detailedPath,
      cnt: isFirstInGroup ? result.cnt || 0 : null,
      isSelected: selectedPaths.some((path) => isSameRoute(path, result)),
      originalData: result,
    };
  });
}
