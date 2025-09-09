import { RouteSearchResult } from "@/types/routeSearch";

interface RouteSearchGridData {
  id: number;
  rank: number;
  startStation: string;
  endStation: string;
  path: string;
  transferCount: number;
  isSelected: boolean;
  originalData: RouteSearchResult;
}

export function processRouteSearchResults(
  searchResults: RouteSearchResult[],
  selectedPaths: RouteSearchResult[]
): RouteSearchGridData[] {
  if (!searchResults || searchResults.length === 0) return [];

  return searchResults.map((result, index) => {
    // transfer_list 파싱 (JSON 문자열을 배열로 변환)
    let transferStations: string[] = [];
    try {
      if (result.transfer_list && result.transfer_list !== "[]") {
        transferStations = JSON.parse(result.transfer_list);
      }
    } catch {
      console.warn("transfer_list 파싱 실패:", result.transfer_list);
    }

    // 경로 구성: 출발역 + 환승역 + 도착역
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

    return {
      id: result.id || index,
      rank: result.rn || index + 1,
      startStation: result.start_node
        ? result.start_node.match(/\([^)]+\)[^_]*_([^(]+)\([^)]+\)/)?.[1] || ""
        : "",
      endStation: result.end_node
        ? result.end_node.match(/\([^)]+\)[^_]*_([^(]+)\([^)]+\)/)?.[1] || ""
        : "",
      path: uniquePathComponents.join(" → "),
      transferCount: result.transfer_cnt || 0,
      isSelected: selectedPaths.some((path) => path.id === result.id),
      originalData: result,
    };
  });
}
