import { RouteSearchResult } from "@/types/routeSearch";
import { getRouteIdentifier } from "@/utils/routeIdentifier";

interface RouteSearchGridData {
  id: string; // path_key + path_seq 조합으로 변경
  rn: number; // 순번
  confirmedPath: string;
  confirmedPathDisplay: string | null;
  groupNo: number;
  groupDisplay: string | number | null;
  mainStations: string;
  detailedPath: string;
  isSelected: boolean;
  originalData: RouteSearchResult;
  cnt?: number;
  path_key?: string;
}

export function processRouteSearchResults(
  searchResults: RouteSearchResult[],
  selectedPaths: RouteSearchResult[]
): RouteSearchGridData[] {
  if (!searchResults || searchResults.length === 0) return [];

  // API 응답에서 group_no와 transfer_list를 조합해서 그룹화
  const groupKeyMap = new Map<string, number>();
  let groupCounter = 1;

  // 먼저 그룹 키별로 그룹 번호 할당
  searchResults.forEach((result) => {
    // group_no + transfer_list 조합으로 고유 그룹 키 생성
    const groupKey = `${result.group_no || 0}_${result.transfer_list || ""}`;
    if (!groupKeyMap.has(groupKey)) {
      groupKeyMap.set(groupKey, groupCounter++);
    }
  });

  // 먼저 그룹별로 정렬
  const sortedResults = [...searchResults].sort((a, b) => {
    const groupKeyA = `${a.group_no || 0}_${a.transfer_list || ""}`;
    const groupKeyB = `${b.group_no || 0}_${b.transfer_list || ""}`;
    const groupA = groupKeyMap.get(groupKeyA) || 0;
    const groupB = groupKeyMap.get(groupKeyB) || 0;
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

    // 현재 그룹 키 생성
    const currentGroupKey = `${result.group_no || 0}_${
      result.transfer_list || ""
    }`;
    const currentGroupNo = groupKeyMap.get(currentGroupKey) || 0;

    // 그룹 표시: 같은 그룹의 첫 번째 행에만 그룹 번호 표시
    const isFirstInGroup =
      index === 0 ||
      (() => {
        const prevGroupKey = `${sortedResults[index - 1].group_no || 0}_${
          sortedResults[index - 1].transfer_list || ""
        }`;
        const prevGroupNo = groupKeyMap.get(prevGroupKey) || 0;
        return prevGroupNo !== currentGroupNo;
      })();

    // 확정경로 포함 여부 표시: 같은 그룹 내에서 같은 값이 연속될 때 첫 번째에만 표시
    const currentConfirmedPath = result.confirmed_path || "N";
    const prevConfirmedPath =
      index > 0 ? sortedResults[index - 1].confirmed_path || "N" : null;

    const isFirstConfirmedPathInGroup =
      isFirstInGroup || // 그룹의 첫 번째 행이거나
      prevConfirmedPath !== currentConfirmedPath; // 이전 행과 확정경로 값이 다르면

    // 상세경로 처리: path_nm을 그대로 사용 (중복역 포함)
    const cleanedDetailedPath = result.path_nm || "";

    // 고유 식별자 생성 (path_key + path_seq 조합)
    const routeId = getRouteIdentifier(result) || `route_${index}`;

    return {
      id: routeId, // 문자열로 변경
      rn: result.rn || 0, // 순번
      confirmedPath: currentConfirmedPath,
      confirmedPathDisplay: isFirstConfirmedPathInGroup
        ? currentConfirmedPath
        : null,
      // groupNo: currentGroupNo,
      groupNo: result.group_no || 0,
      groupDisplay: isFirstInGroup ? currentGroupNo : null,
      mainStations: isFirstInGroup ? uniquePathComponents.join(" → ") : "",
      detailedPath: cleanedDetailedPath,
      isSelected: selectedPaths.some((path) => {
        const pathId = getRouteIdentifier(path);
        const resultId = getRouteIdentifier(result);
        return pathId && resultId && pathId === resultId;
      }),
      originalData: result,
      cnt: result.cnt || 0,
      path_key: result.path_key || "",
    };
  });
}
