import React from "react";
import { toCamelCaseAttrs } from "./utils";
import { DefaultNodeTooltip, DefaultLinkTooltip } from "./DefaultTooltips";
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

  // 텍스트 위치 계산
  let textPos = { x: 0, y: 0 };
  const d = node.attributes.d || "";
  const m = d.match(/M\s*([-\d.]+)[ ,]?([-\d.]+)/);
  if (m) {
    let [x, y] = [parseFloat(m[1]), parseFloat(m[2])];
    if (node.attributes.transform?.includes("matrix")) {
      const mat = parseMatrix(node.attributes.transform);
      if (mat) {
        const pt = applyMatrixToPoint(x, y, mat);
        x = pt.x;
        y = pt.y;
      }
    }
    textPos = { x: x + 40, y: y + 5 };
  }

  const nodeElement = (
    <path
      {...toCamelCaseAttrs(node.attributes)}
      onClick={onNodeClick ? () => onNodeClick(nodeData) : undefined}
      style={{
        cursor: onNodeClick ? "pointer" : undefined,
      }}
    />
  );

  const textElement = (
    <text
      x={textPos.x}
      y={textPos.y}
      fontSize={24}
      fontFamily="Arial, sans-serif"
      fill="#374151"
      pointerEvents="none">
      {(() => {
        const raw = nodeData.name.split("_")[1] || nodeData.name;
        const idx = raw.indexOf("(");
        return idx > -1 ? raw.slice(0, idx) : raw;
      })()}
    </text>
  );

  if (showTooltips && tooltips?.node) {
    return (
      <g key={id} style={{ opacity }}>
        <Tooltip>
          <TooltipTrigger asChild>{nodeElement}</TooltipTrigger>
          <RadixTooltipContent>{tooltips.node(nodeData)}</RadixTooltipContent>
        </Tooltip>
        {textElement}
      </g>
    );
  } else if (showTooltips) {
    return (
      <g key={id} style={{ opacity }}>
        <Tooltip>
          <TooltipTrigger asChild>{nodeElement}</TooltipTrigger>
          <RadixTooltipContent>
            <DefaultNodeTooltip node={nodeData} />
          </RadixTooltipContent>
        </Tooltip>
        {textElement}
      </g>
    );
  } else {
    return (
      <g key={id} style={{ opacity }}>
        {nodeElement}
        {textElement}
      </g>
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
  onLinkClick?: (link: Link) => void,
  showTooltips = true,
  tooltips?: {
    link?: (link: Link) => React.ReactNode;
  }
): React.ReactNode {
  const id = node.attributes.id;
  const opacity = calculateOpacity(id, highlightState, false, link.line);

  const linkElement = (
    <path
      {...toCamelCaseAttrs(node.attributes)}
      style={{ opacity, cursor: onLinkClick ? "pointer" : undefined }}
      onClick={onLinkClick ? () => onLinkClick(link) : undefined}
    />
  );

  if (showTooltips && tooltips?.link) {
    return (
      <Tooltip key={id}>
        <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
        <RadixTooltipContent>{tooltips.link(link)}</RadixTooltipContent>
      </Tooltip>
    );
  } else if (showTooltips) {
    return (
      <Tooltip key={id}>
        <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
        <RadixTooltipContent>
          <DefaultLinkTooltip link={link} />
        </RadixTooltipContent>
      </Tooltip>
    );
  } else {
    return <g key={id}>{linkElement}</g>;
  }
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
 * @returns 렌더링된 React 노드
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
    link?: (link: Link) => React.ReactNode;
  }
): React.ReactNode {
  // 1) 역(Station): id가 숫자만
  if (node.name === "path" && /^\d+$/.test(node.attributes.id)) {
    const nodeData = nodesData.find((n) => n.id === node.attributes.id);
    if (!nodeData) return null;

    return renderNodeElement(
      node,
      nodeData,
      highlightState!,
      onNodeClick,
      showTooltips,
      tooltips
    );
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

    if (!link) return null;

    return renderLinkElement(
      node,
      link,
      highlightState!,
      onLinkClick,
      showTooltips,
      tooltips
    );
  }

  // 3) 나머지 원소들은 그대로 재귀
  return React.createElement(
    node.name,
    { ...toCamelCaseAttrs(node.attributes), key: key || node.attributes.id },
    node.children?.map((child: INode, i: number) =>
      renderSvgNode(
        child,
        nodesData,
        linksData,
        onNodeClick,
        onLinkClick,
        `${node.name}-${i}`,
        highlightState,
        showTooltips,
        tooltips
      )
    )
  );
}
