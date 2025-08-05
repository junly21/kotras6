import type { NetworkMapHighlight, Node, Link } from "@/types/network";

export interface HighlightState {
  highlightedNodes: Set<string>;
  highlightedLinks: Set<string>;
  activeLines: Set<string>;
  isPathMode: boolean;
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
  const isPathMode = highlights.some(
    (h) => h.type === "path" || h.type === "nodes"
  );

  highlights.forEach((highlight) => {
    if (highlight.type === "line") {
      // 노선별 하이라이트: 해당 노선의 모든 노드와 링크
      const line = highlight.value as string;
      activeLines.add(line);

      nodes.forEach((node) => {
        if (node.line === line) {
          highlightedNodes.add(node.id);
        }
      });

      links.forEach((link) => {
        if (link.line === line) {
          highlightedLinks.add(`${link.source}-${link.target}`);
          highlightedLinks.add(`${link.target}-${link.source}`);
        }
      });
    } else if (highlight.type === "nodes" || highlight.type === "path") {
      // 특정 노드들 하이라이트
      const nodeIds = Array.isArray(highlight.value)
        ? highlight.value
        : [highlight.value];

      nodeIds.forEach((id) => highlightedNodes.add(id));

      // path 타입의 경우 연속된 노드들 사이의 링크도 하이라이트
      if (highlight.type === "path") {
        for (let i = 0; i < nodeIds.length - 1; i++) {
          const linkId1 = `${nodeIds[i]}-${nodeIds[i + 1]}`;
          const linkId2 = `${nodeIds[i + 1]}-${nodeIds[i]}`;
          highlightedLinks.add(linkId1);
          highlightedLinks.add(linkId2);
        }
      }
    }
  });

  return {
    highlightedNodes,
    highlightedLinks,
    activeLines,
    isPathMode,
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
  const { highlightedNodes, highlightedLinks, activeLines, isPathMode } =
    highlightState;

  if (isPathMode) {
    // Path/Nodes 모드: 하이라이트된 요소만 1, 나머지는 0.1
    if (isNode) {
      return highlightedNodes.has(id) ? 1 : 0.1;
    } else {
      return highlightedLinks.has(id) ? 1 : 0.1;
    }
  } else if (activeLines.size > 0) {
    // Line 모드: 활성 노선이 있으면 해당 노선만 1, 나머지는 0.2
    if (line && activeLines.has(line)) {
      return 1;
    }
    return 0.2;
  }

  return 1; // 기본값
}
