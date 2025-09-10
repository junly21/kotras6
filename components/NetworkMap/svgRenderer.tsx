import React from "react";
import { toCamelCaseAttrs } from "./utils";
import { DefaultNodeTooltip } from "./DefaultTooltips";
import type { Node, Link } from "@/types/network";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent as RadixTooltipContent,
} from "../ui/tooltip";
import type { INode } from "svgson";
import { calculateOpacity, type HighlightState } from "./highlightUtils";

// matrix parsing & application
function parseMatrix(transform: string): number[] | null {
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match) return null;
  return match[1]
    .replace(/,/g, " ")
    .split(/\s+/)
    .map(Number)
    .filter((n) => !isNaN(n));
}

function applyMatrixToPoint(cx: number, cy: number, m: number[]) {
  const [a, b, c, d, e, f] = m;
  return { x: a * cx + c * cy + e, y: b * cx + d * cy + f };
}

/**
 * 노드(역) 요소를 렌더링합니다.
 */
function renderNodeElement(
  node: INode,
  nodeData: Node,
  highlightState: HighlightState,
  onNodeClick?: (node: Node) => void,
  showTooltips = true,
  tooltips?: {
    node?: (node: Node) => React.ReactNode;
  }
): React.ReactNode {
  const id = node.attributes.id;
  const opacity = calculateOpacity(id, highlightState, true, nodeData.line);

  // 색상 결정: RGB 기반 색상 적용 (RGB가 설정된 경우에만)
  let strokeColor = node.attributes.stroke;
  if (highlightState.nodeColors.has(id)) {
    // RGB 색상이 설정된 경우에만 색상 변경
    strokeColor = highlightState.nodeColors.get(id)!;
  } else if (
    highlightState.otherNodes.has(id) &&
    !highlightState.selectedNodes.has(id) &&
    highlightState.nodeColors.size > 0 // RGB 색상이 설정된 경로가 있는 경우에만 회색 처리
  ) {
    strokeColor = "#6B7280"; // 다른 경로만 회색 (선택된 경로 제외)
  }
  // RGB 색상이 설정되지 않은 경우 원본 stroke 색상 유지

  // 중복 역 이름 통합 함수 (렌더링용)
  const getUnifiedStationName = (nodeName: string): string => {
    // 7_이수를 총신대입구(이수)로 통합 표시
    if (nodeName === "7_이수") {
      return "4_총신대입구(이수)";
    }
    return nodeName;
  };

  // 텍스트 위치 계산 - 노드의 실제 중심점을 기준으로 계산
  let textPos = { x: 0, y: 0 };
  const d = node.attributes.d || "";

  // 원의 중심점을 정확히 계산
  const coordMatches = d.match(/([-\d.]+)/g);
  if (coordMatches && coordMatches.length >= 4) {
    const coords = coordMatches.map(parseFloat);

    // 원의 중심점을 찾기 위해 x, y 좌표의 중간값을 계산
    const xCoords = coords.filter((_, i) => i % 2 === 0); // 짝수 인덱스 (x 좌표)
    const yCoords = coords.filter((_, i) => i % 2 === 1); // 홀수 인덱스 (y 좌표)

    let centerX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2;
    let centerY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2;

    if (node.attributes.transform?.includes("matrix")) {
      const mat = parseMatrix(node.attributes.transform);
      if (mat) {
        const pt = applyMatrixToPoint(centerX, centerY, mat);
        centerX = pt.x;
        centerY = pt.y;
      }
    }

    // 모든 노드에 대해 일관되게 우하단에 텍스트 배치
    textPos = { x: centerX + 40, y: centerY + 35 };
  }

  const nodeElement = (
    <path
      {...toCamelCaseAttrs(node.attributes)}
      stroke={strokeColor}
      onClick={onNodeClick ? () => onNodeClick(nodeData) : undefined}
      style={{
        cursor: onNodeClick ? "pointer" : undefined,
      }}
    />
  );

  const textElement = (
    <text
      x={(() => {
        const unifiedName = getUnifiedStationName(nodeData.name);
        const raw = unifiedName.split("_")[1] || unifiedName;
        const idx = raw.indexOf("(");
        const stationName = idx > -1 ? raw.slice(0, idx) : raw;
        if (stationName.length >= 8) return textPos.x - 50;
        if (stationName.length >= 6) return textPos.x - 35;
        if (stationName.length >= 5) return textPos.x - 25;
        return textPos.x - 2;
      })()}
      y={(() => {
        const unifiedName = getUnifiedStationName(nodeData.name);
        const raw = unifiedName.split("_")[1] || unifiedName;
        const idx = raw.indexOf("(");
        const stationName = idx > -1 ? raw.slice(0, idx) : raw;
        if (stationName.length >= 5) return textPos.y + 20;
        if (stationName.length >= 4) return textPos.y + 10;
        return textPos.y + 3;
      })()}
      fontSize={(() => {
        const unifiedName = getUnifiedStationName(nodeData.name);
        const raw = unifiedName.split("_")[1] || unifiedName;
        const idx = raw.indexOf("(");
        const stationName = idx > -1 ? raw.slice(0, idx) : raw;
        if (stationName.length >= 8) return 22;
        if (stationName.length >= 6) return 24;
        if (stationName.length >= 5) return 26;
        if (stationName.length >= 4) return 28;
        if (stationName.length >= 3) return 36;
        return 40;
      })()}
      fontFamily="Arial, sans-serif"
      fill="#000000"
      fontWeight="bold"
      pointerEvents="none"
      dominantBaseline="middle"
      textAnchor="start"
      stroke="white"
      strokeWidth="0.5"
      paintOrder="stroke fill"
      style={{ opacity }}>
      {(() => {
        const unifiedName = getUnifiedStationName(nodeData.name);
        const raw = unifiedName.split("_")[1] || unifiedName;
        const idx = raw.indexOf("(");
        return idx > -1 ? raw.slice(0, idx) : raw;
      })()}
    </text>
  );

  // 하이라이트된 요소만 툴팁 표시 (opacity가 0.6 이상인 경우)
  const shouldShowTooltip = opacity >= 0.6;

  // 하이라이트 상태에 따라 z-index 조정 (하이라이트된 요소를 최상위로)
  const zIndex = shouldShowTooltip ? 10 : 1;

  // 텍스트 요소를 별도로 반환하여 최상위에서 렌더링되도록 함
  const textElementWithKey = React.cloneElement(textElement, {
    key: `text-${id}`,
  });

  if (showTooltips && shouldShowTooltip && tooltips?.node) {
    return (
      <>
        <g key={id} style={{ opacity, zIndex }}>
          <Tooltip>
            <TooltipTrigger asChild>{nodeElement}</TooltipTrigger>
            <RadixTooltipContent>{tooltips.node(nodeData)}</RadixTooltipContent>
          </Tooltip>
        </g>
        {textElementWithKey}
      </>
    );
  } else if (showTooltips && shouldShowTooltip) {
    return (
      <>
        <g key={id} style={{ opacity, zIndex }}>
          <Tooltip>
            <TooltipTrigger asChild>{nodeElement}</TooltipTrigger>
            <RadixTooltipContent>
              <DefaultNodeTooltip node={nodeData} />
            </RadixTooltipContent>
          </Tooltip>
        </g>
        {textElementWithKey}
      </>
    );
  } else {
    return (
      <>
        <g key={id} style={{ opacity, zIndex }}>
          {nodeElement}
        </g>
        {textElementWithKey}
      </>
    );
  }
}

/**
 * 링크(간선) 요소를 렌더링합니다.
 */
function renderLinkElement(
  node: INode,
  link: Link,
  highlightState: HighlightState,
  onLinkClick?: (link: Link) => void
): React.ReactNode {
  const id = node.attributes.id;
  const opacity = calculateOpacity(id, highlightState, false, link.line);

  // 색상 결정: RGB 기반 색상 적용 (RGB가 설정된 경우에만)
  let strokeColor = node.attributes.stroke;
  if (highlightState.linkColors.has(id)) {
    // RGB 색상이 설정된 경우에만 색상 변경
    strokeColor = highlightState.linkColors.get(id)!;
  } else if (
    highlightState.otherLinks.has(id) &&
    !highlightState.selectedLinks.has(id) &&
    highlightState.linkColors.size > 0 // RGB 색상이 설정된 경로가 있는 경우에만 회색 처리
  ) {
    strokeColor = "#6B7280"; // 다른 경로만 회색 (선택된 경로 제외)
  }
  // RGB 색상이 설정되지 않은 경우 원본 stroke 색상 유지

  const linkElement = (
    <path
      {...toCamelCaseAttrs(node.attributes)}
      stroke={strokeColor}
      style={{ opacity, cursor: onLinkClick ? "pointer" : undefined }}
      onClick={onLinkClick ? () => onLinkClick(link) : undefined}
    />
  );

  // 간선은 툴팁을 표시하지 않음
  return <g key={id}>{linkElement}</g>;
}

/**
 * SVG 노드를 렌더링합니다.
 *
 * @param node SVG 노드
 * @param nodesData 노드 데이터 배열
 * @param linksData 링크 데이터 배열
 * @param onNodeClick 노드 클릭 핸들러
 * @param onLinkClick 링크 클릭 핸들러
 * @param key React key
 * @param highlightState 하이라이트 상태
 * @param showTooltips 툴팁 표시 여부
 * @param tooltips 커스텀 툴팁
 * @returns 렌더링된 React 노드와 텍스트 요소들
 */
export function renderSvgNode(
  node: INode,
  nodesData: Node[],
  linksData: Link[],
  onNodeClick?: (node: Node) => void,
  onLinkClick?: (link: Link) => void,
  key?: string,
  highlightState?: HighlightState,
  showTooltips = true,
  tooltips?: {
    node?: (node: Node) => React.ReactNode;
  }
): {
  pathElements: React.ReactNode[];
  textElements: React.ReactNode[];
  defsElements: React.ReactNode[];
} {
  const pathElements: React.ReactNode[] = [];
  const textElements: React.ReactNode[] = [];
  const defsElements: React.ReactNode[] = [];

  // 0) defs 태그 처리
  if (node.name === "defs") {
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: INode, i: number) => {
        if (child.name === "pattern") {
          defsElements.push(
            <pattern
              key={`pattern-${i}`}
              {...toCamelCaseAttrs(child.attributes)}>
              {child.children?.map((patternChild: INode, j: number) => {
                if (patternChild.name === "image") {
                  return (
                    <image
                      key={`image-${j}`}
                      {...toCamelCaseAttrs(patternChild.attributes)}
                    />
                  );
                }
                return null;
              })}
            </pattern>
          );
        }
      });
    }
    return { pathElements, textElements, defsElements };
  }

  // 1) 역(Station): id가 숫자만
  if (node.name === "path" && /^\d+$/.test(node.attributes.id)) {
    const nodeData = nodesData.find((n) => n.id === node.attributes.id);
    if (!nodeData)
      return { pathElements: [], textElements: [], defsElements: [] };

    // 하이라이트 상태 확인 - 하이라이트되지 않은 요소는 pointer-events: none 적용
    if (highlightState) {
      const opacity = calculateOpacity(
        node.attributes.id,
        highlightState,
        true,
        nodeData.line
      );
      if (opacity < 0.6) {
        // 하이라이트되지 않은 요소는 pointer-events: none 적용
        const disabledNode = {
          ...node,
          attributes: {
            ...node.attributes,
            pointerEvents: "none",
          },
        };
        const result = renderNodeElement(
          disabledNode,
          nodeData,
          highlightState!,
          onNodeClick,
          showTooltips,
          tooltips
        );

        // 결과에서 텍스트 요소와 경로 요소 분리
        if (result && typeof result === "object" && "props" in result) {
          const props = result.props as { children?: React.ReactNode[] };
          if (props.children && Array.isArray(props.children)) {
            props.children.forEach((child: React.ReactNode) => {
              if (
                child &&
                typeof child === "object" &&
                "type" in child &&
                child.type === "text"
              ) {
                textElements.push(child);
              } else {
                pathElements.push(child);
              }
            });
          } else {
            pathElements.push(result);
          }
        } else {
          pathElements.push(result);
        }

        return { pathElements, textElements, defsElements };
      }
    }

    const result = renderNodeElement(
      node,
      nodeData,
      highlightState!,
      onNodeClick,
      showTooltips,
      tooltips
    );

    // 결과에서 텍스트 요소와 경로 요소 분리
    if (result && typeof result === "object" && "props" in result) {
      const props = result.props as { children?: React.ReactNode[] };
      if (props.children && Array.isArray(props.children)) {
        props.children.forEach((child: React.ReactNode) => {
          if (
            child &&
            typeof child === "object" &&
            "type" in child &&
            child.type === "text"
          ) {
            textElements.push(child);
          } else {
            pathElements.push(child);
          }
        });
      } else {
        pathElements.push(result);
      }
    } else {
      pathElements.push(result);
    }

    return { pathElements, textElements, defsElements };
  }

  // 2) 간선(Link): id가 "숫자-숫자"
  if (node.name === "path" && /^\d+-\d+$/.test(node.attributes.id)) {
    const id = node.attributes.id;
    const [src, dst] = id.split("-");
    const link = linksData.find(
      (l) =>
        (l.source === src && l.target === dst) ||
        (l.source === dst && l.target === src)
    );

    if (!link) return { pathElements: [], textElements: [], defsElements: [] };

    const result = renderLinkElement(node, link, highlightState!, onLinkClick);
    pathElements.push(result);
    return { pathElements, textElements, defsElements };
  }

  // 3) 나머지 원소들은 그대로 재귀
  if (node.children && node.children.length > 0) {
    node.children.forEach((child: INode, i: number) => {
      const childResult = renderSvgNode(
        child,
        nodesData,
        linksData,
        onNodeClick,
        onLinkClick,
        `${node.name}-${i}`,
        highlightState,
        showTooltips,
        tooltips
      );
      pathElements.push(...childResult.pathElements);
      textElements.push(...childResult.textElements);
      defsElements.push(...childResult.defsElements);
    });
  }

  return { pathElements, textElements, defsElements };
}

/**
 * SVG 구조를 하이라이트 상태에 따라 재구성합니다.
 * 하이라이트된 요소를 최상위에 배치하여 마우스 이벤트 우선순위를 높입니다.
 */
export function reorderSvgForHighlightPriority(
  svgNode: INode,
  highlightState: HighlightState
): INode {
  if (!svgNode.children || svgNode.children.length === 0) {
    return svgNode;
  }

  // 요소들을 카테고리별로 분리
  const highlightedElements: INode[] = [];
  const normalElements: INode[] = [];
  const defsElements: INode[] = [];

  svgNode.children.forEach((child) => {
    // defs 요소는 그대로 유지
    if (child.name === "defs") {
      defsElements.push(child);
      return;
    }
    if (child.name === "path") {
      const id = child.attributes.id;
      if (id && /^\d+$/.test(id)) {
        // 역 노드인 경우 - activeLines에서 노선 정보 찾기
        let nodeLine = "";
        if (highlightState.activeLines.size > 0) {
          // 첫 번째 활성 노선 사용 (대부분의 경우 하나의 노선만 선택됨)
          nodeLine = Array.from(highlightState.activeLines)[0];
        }

        const opacity = calculateOpacity(id, highlightState, true, nodeLine);

        if (opacity >= 0.6) {
          // 하이라이트된 요소는 최상위로
          highlightedElements.push(child);
        } else {
          // 하이라이트되지 않은 요소는 제거하지 않음 (시각적 표시 유지)
          normalElements.push(child);
        }
      } else if (id && /^\d+-\d+$/.test(id)) {
        // 간선인 경우 - activeLines에서 노선 정보 찾기
        let linkLine = "";
        if (highlightState.activeLines.size > 0) {
          linkLine = Array.from(highlightState.activeLines)[0];
        }

        const opacity = calculateOpacity(id, highlightState, false, linkLine);

        if (opacity >= 0.6) {
          // 하이라이트된 요소는 최상위로
          highlightedElements.push(child);
        } else {
          // 하이라이트되지 않은 요소는 제거하지 않음 (시각적 표시 유지)
          normalElements.push(child);
        }
      } else {
        // 기타 path 요소는 그대로 유지
        normalElements.push(child);
      }
    } else if (child.children && child.children.length > 0) {
      // 자식이 있는 요소는 재귀적으로 처리
      const reorderedChild = reorderSvgForHighlightPriority(
        child,
        highlightState
      );
      normalElements.push(reorderedChild);
    } else {
      // 기타 요소는 그대로 유지
      normalElements.push(child);
    }
  });

  // 렌더링 순서: defs 요소 → 일반 요소 → 하이라이트된 요소
  return {
    ...svgNode,
    children: [...defsElements, ...normalElements, ...highlightedElements],
  };
}
