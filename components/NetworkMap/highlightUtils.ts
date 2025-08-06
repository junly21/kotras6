import type { NetworkMapHighlight, Node, Link } from "@/types/network";

export interface HighlightState {
  highlightedNodes: Set<string>;
  highlightedLinks: Set<string>;
  activeLines: Set<string>;
  isPathMode: boolean;
  // 우선순위별 하이라이트 정보 추가
  selectedNodes: Set<string>; // 선택된 경로의 노드들 (우선순위 1)
  selectedLinks: Set<string>; // 선택된 경로의 링크들 (우선순위 1)
  otherNodes: Set<string>; // 다른 경로의 노드들 (우선순위 0)
  otherLinks: Set<string>; // 다른 경로의 링크들 (우선순위 0)
  // RGB 기반 색상 정보 추가
  nodeColors: Map<string, string>; // 노드 ID -> RGB 색상
  linkColors: Map<string, string>; // 링크 ID -> RGB 색상
  pathNodes: Map<string, Set<string>>; // 경로 ID -> 노드 ID들
  pathLinks: Map<string, Set<string>>; // 경로 ID -> 링크 ID들
}

/**
 * 하이라이트 상태를 계산합니다.
 *
 * @param highlights 하이라이트 설정 배열
 * @param nodes 노드 데이터
 * @param links 링크 데이터
 * @returns 계산된 하이라이트 상태
 */
export function calculateHighlightState(
  highlights: NetworkMapHighlight[],
  nodes: Node[],
  links: Link[]
): HighlightState {
  const highlightedNodes = new Set<string>();
  const highlightedLinks = new Set<string>();
  const activeLines = new Set<string>();
  const selectedNodes = new Set<string>();
  const selectedLinks = new Set<string>();
  const otherNodes = new Set<string>();
  const otherLinks = new Set<string>();
  const nodeColors = new Map<string, string>();
  const linkColors = new Map<string, string>();
  const pathNodes = new Map<string, Set<string>>();
  const pathLinks = new Map<string, Set<string>>();

  const isPathMode = highlights.some(
    (h) => h.type === "path" || h.type === "nodes"
  );

  highlights.forEach((highlight) => {
    const priority = highlight.priority || 0;
    const isSelected = priority > 0;
    const rgb = highlight.rgb || "#000000";
    const pathId = highlight.pathId || "";

    if (highlight.type === "line") {
      // 노선별 하이라이트: 해당 노선의 모든 노드와 링크
      const line = highlight.value as string;
      activeLines.add(line);

      nodes.forEach((node) => {
        if (node.line === line) {
          highlightedNodes.add(node.id);
          if (isSelected) {
            selectedNodes.add(node.id);
          } else {
            otherNodes.add(node.id);
          }
          if (pathId) {
            nodeColors.set(node.id, rgb);
            if (!pathNodes.has(pathId)) {
              pathNodes.set(pathId, new Set());
            }
            pathNodes.get(pathId)!.add(node.id);
          }
        }
      });

      links.forEach((link) => {
        if (link.line === line) {
          const linkId1 = `${link.source}-${link.target}`;
          const linkId2 = `${link.target}-${link.source}`;
          highlightedLinks.add(linkId1);
          highlightedLinks.add(linkId2);
          if (isSelected) {
            selectedLinks.add(linkId1);
            selectedLinks.add(linkId2);
          } else {
            otherLinks.add(linkId1);
            otherLinks.add(linkId2);
          }
          if (pathId) {
            linkColors.set(linkId1, rgb);
            linkColors.set(linkId2, rgb);
            if (!pathLinks.has(pathId)) {
              pathLinks.set(pathId, new Set());
            }
            pathLinks.get(pathId)!.add(linkId1);
            pathLinks.get(pathId)!.add(linkId2);
          }
        }
      });
    } else if (highlight.type === "nodes" || highlight.type === "path") {
      // 특정 노드들 하이라이트
      const nodeIds = Array.isArray(highlight.value)
        ? highlight.value
        : [highlight.value];

      nodeIds.forEach((id) => {
        highlightedNodes.add(id);
        if (isSelected) {
          selectedNodes.add(id);
        } else {
          otherNodes.add(id);
        }
        if (pathId) {
          nodeColors.set(id, rgb);
          if (!pathNodes.has(pathId)) {
            pathNodes.set(pathId, new Set());
          }
          pathNodes.get(pathId)!.add(id);
        }
      });

      // path 타입의 경우 연속된 노드들 사이의 링크도 하이라이트
      if (highlight.type === "path") {
        for (let i = 0; i < nodeIds.length - 1; i++) {
          const linkId1 = `${nodeIds[i]}-${nodeIds[i + 1]}`;
          const linkId2 = `${nodeIds[i + 1]}-${nodeIds[i]}`;
          highlightedLinks.add(linkId1);
          highlightedLinks.add(linkId2);
          if (isSelected) {
            selectedLinks.add(linkId1);
            selectedLinks.add(linkId2);
          } else {
            otherLinks.add(linkId1);
            otherLinks.add(linkId2);
          }
          if (pathId) {
            linkColors.set(linkId1, rgb);
            linkColors.set(linkId2, rgb);
            if (!pathLinks.has(pathId)) {
              pathLinks.set(pathId, new Set());
            }
            pathLinks.get(pathId)!.add(linkId1);
            pathLinks.get(pathId)!.add(linkId2);
          }
        }
      }
    }
  });

  return {
    highlightedNodes,
    highlightedLinks,
    activeLines,
    isPathMode,
    selectedNodes,
    selectedLinks,
    otherNodes,
    otherLinks,
    nodeColors,
    linkColors,
    pathNodes,
    pathLinks,
  };
}

/**
 * 요소의 opacity를 계산합니다.
 *
 * @param id 요소 ID
 * @param highlightState 하이라이트 상태
 * @param isNode 노드 여부 (true: 노드, false: 링크)
 * @param line 노선명 (선택사항)
 * @returns opacity 값 (0.1 ~ 1.0)
 */
export function calculateOpacity(
  id: string,
  highlightState: HighlightState,
  isNode: boolean,
  line?: string
): number {
  const {
    highlightedNodes,
    highlightedLinks,
    activeLines,
    isPathMode,
    selectedNodes,
    selectedLinks,
    otherNodes,
    otherLinks,
  } = highlightState;

  // OD별 정산 등 단일 path 하이라이트일 때는 무조건 1.0
  if (
    isPathMode &&
    highlightedNodes.size > 0 &&
    selectedNodes.size === 0 &&
    otherNodes.size === 0
  ) {
    if (isNode) {
      return highlightedNodes.has(id) ? 1 : 0.1;
    } else {
      return highlightedLinks.has(id) ? 1 : 0.1;
    }
  }

  // 기존 경로탐색 다중 하이라이트 로직
  if (isPathMode) {
    if (isNode) {
      if (selectedNodes.has(id)) return 1;
      if (otherNodes.has(id)) return 0.6;
      return highlightedNodes.has(id) ? 1 : 0.1;
    } else {
      if (selectedLinks.has(id)) return 1;
      if (otherLinks.has(id)) return 0.6;
      return highlightedLinks.has(id) ? 1 : 0.1;
    }
  }

  if (activeLines.size > 0) {
    if (line && activeLines.has(line)) {
      return 1;
    }
    return 0.2;
  }

  return 1; // 기본값
}
