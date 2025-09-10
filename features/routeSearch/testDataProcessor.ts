import { RouteSearchTestResult } from "@/types/routeSearch";

interface RouteSearchTestGridData {
  id: number;
  confirmedPath: string;
  groupNo: number;
  groupDisplay: string | number | null;
  mainStations: string;
  detailedPath: string;
  isSelected: boolean;
  originalData: RouteSearchTestResult;
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

    // 상세경로 처리: path_nm에서 역명만 추출하여 정리
    let cleanedDetailedPath = "";
    if (result.path_nm) {
      // path_nm을 공백으로 분할하고 각 부분에서 역명만 추출
      const pathParts = result.path_nm
        .split(/\s+/)
        .filter((part) => part.trim());
      const cleanedParts = pathParts
        .map((part) => {
          const match = part.match(/\([^)]+\)[^_]*_([^(]+)\([^)]+\)/);
          return match ? match[1] : part;
        })
        .filter((part) => part && part.trim());

      // 중복 제거: 연속된 같은 역을 제거
      const uniqueCleanedParts = cleanedParts.filter((station, index) => {
        return index === 0 || station !== cleanedParts[index - 1];
      });

      cleanedDetailedPath = uniqueCleanedParts.join(" → ");
    }

    return {
      id: result.id || index,
      confirmedPath: result.confirmed_path || "N",
      groupNo: currentGroupNo,
      groupDisplay: null, // 그룹 표시 제거
      mainStations: uniquePathComponents.join(" → "),
      detailedPath: cleanedDetailedPath || result.path_nm || "",
      isSelected: selectedPaths.some((path) => path.id === result.id),
      originalData: result,
    };
  });
}
