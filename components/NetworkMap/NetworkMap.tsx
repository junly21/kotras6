import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { parseSvg, toCamelCaseAttrs } from "./utils";
import { DefaultNodeTooltip, DefaultLinkTooltip } from "./DefaultTooltips";
import type { Node, Link, NetworkMapProps } from "@/types/network";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent as RadixTooltipContent,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import type { INode } from "svgson";

export function NetworkMap({
  nodes,
  links,
  svgText,
  config = {},
  highlights = [],
  tooltips,
  onNodeClick,
  onLinkClick,
}: NetworkMapProps) {
  const {
    width = "100%",
    height = 800,
    showZoomControls = true,
    showTooltips = true,
    defaultZoom = 1,
    defaultPan = { x: -2400, y: -2500 },
  } = config;

  const [svgReactTree, setSvgReactTree] = useState<React.ReactNode>(null);
  const [scale, setScale] = useState(defaultZoom);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState(defaultPan);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 하이라이트 상태 계산 - 메모이제이션
  const highlightState = useMemo(() => {
    console.log("NetworkMap 하이라이트 상태 계산:", {
      highlights,
      nodesLength: nodes.length,
      linksLength: links.length,
    });

    const highlightedNodes = new Set<string>();
    const highlightedLinks = new Set<string>();
    const activeLines = new Set<string>();

    highlights.forEach((highlight) => {
      console.log("하이라이트 처리:", highlight);

      if (highlight.type === "line") {
        const line = highlight.value as string;
        activeLines.add(line);
        // 해당 노선의 모든 노드와 링크 하이라이트
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
      } else if (highlight.type === "nodes") {
        const nodeIds = Array.isArray(highlight.value)
          ? highlight.value
          : [highlight.value];
        console.log("nodes 타입 하이라이트 - 노드 ID들:", nodeIds);
        nodeIds.forEach((id) => highlightedNodes.add(id));
        // nodes 타입의 경우 선택된 노드들만 표시하고 나머지는 투명하게 처리
        // activeLines를 사용하여 선택되지 않은 노드들을 투명하게 처리
        activeLines.add("__nodes_highlight__");
      } else if (highlight.type === "path") {
        const nodeIds = Array.isArray(highlight.value)
          ? highlight.value
          : [highlight.value];
        console.log("path 타입 하이라이트 - 노드 ID들:", nodeIds);
        nodeIds.forEach((id) => highlightedNodes.add(id));
        // 경로의 연속된 노드들 사이의 링크도 하이라이트
        for (let i = 0; i < nodeIds.length - 1; i++) {
          const linkId1 = `${nodeIds[i]}-${nodeIds[i + 1]}`;
          const linkId2 = `${nodeIds[i + 1]}-${nodeIds[i]}`;
          highlightedLinks.add(linkId1);
          highlightedLinks.add(linkId2);
          console.log(`링크 추가: ${linkId1}, ${linkId2}`);
        }
        // path 타입의 경우 선택된 노드들만 표시하고 나머지는 투명하게 처리
        activeLines.add("__nodes_highlight__");
      }
    });

    const result = {
      highlightedNodes,
      highlightedLinks,
      activeLines,
    };

    console.log("하이라이트 상태 결과:", {
      highlightedNodesSize: highlightedNodes.size,
      highlightedLinksSize: highlightedLinks.size,
      activeLines: Array.from(activeLines),
    });

    return result;
  }, [highlights, nodes, links]);

  // SVG 파싱 및 렌더링 - 메모이제이션
  useEffect(() => {
    if (!svgText || !nodes.length || !links.length) return;

    let isMounted = true;

    parseSvg(svgText)
      .then((svgJson) => {
        if (!isMounted) return;

        setSvgReactTree(
          renderSvgNode(
            svgJson,
            nodes,
            links,
            onNodeClick,
            onLinkClick,
            undefined,
            highlightState,
            showTooltips,
            tooltips
          )
        );
      })
      .catch((error) => {
        console.error("NetworkMap parseSvg 에러:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [
    svgText,
    nodes,
    links,
    onNodeClick,
    onLinkClick,
    highlightState,
    showTooltips,
    tooltips,
  ]);

  // 이벤트 핸들러 메모이제이션
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleMouseLeave = useCallback(() => setIsDragging(false), []);

  // 화면 중앙 기준 확대/축소
  const handleZoom = useCallback(
    (delta: number) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const newScale = Math.max(0.5, Math.min(2.0, scale + delta * 0.1));
      const scaleRatio = newScale / scale;

      // 화면 중앙을 기준으로 pan 조정
      const newPanX = centerX - (centerX - pan.x) * scaleRatio;
      const newPanY = centerY - (centerY - pan.y) * scaleRatio;

      setScale(newScale);
      setPan({ x: newPanX, y: newPanY });
    },
    [scale, pan]
  );

  const handleReset = useCallback(() => {
    setScale(defaultZoom);
    setPan(defaultPan);
  }, [defaultZoom, defaultPan]);

  // wheel 이벤트 리스너 추가 (passive 문제 해결)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelEvent = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        const newScale = Math.max(0.5, Math.min(2.0, scale + delta * 0.1));

        if (newScale !== scale) {
          const rect = container.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const scaleRatio = newScale / scale;

          // 화면 중앙을 기준으로 pan 조정
          const newPanX = centerX - (centerX - pan.x) * scaleRatio;
          const newPanY = centerY - (centerY - pan.y) * scaleRatio;

          setScale(newScale);
          setPan({ x: newPanX, y: newPanY });
        }
      }
    };

    container.addEventListener("wheel", handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheelEvent);
    };
  }, [scale, pan]);

  return (
    <div style={{ width, height, position: "relative", overflow: "hidden" }}>
      {/* zoom buttons */}
      {showZoomControls && (
        <div className="flex gap-2 mb-2">
          <Button onClick={() => handleZoom(1)} size="sm">
            확대
          </Button>
          <Button onClick={() => handleZoom(-1)} size="sm">
            축소
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline">
            리셋
          </Button>
          <span className="flex items-center px-2 text-sm text-muted-foreground">
            확대율: {Math.round(scale * 100)}%
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 2721 1747"
          style={{ display: "block" }}>
          <g
            transform={`translate(${pan.x},${pan.y}) scale(${scale})`}
            style={{
              transition: "transform 0.3s ease-out",
              transformOrigin: "center",
            }}>
            {svgReactTree}
          </g>
        </svg>
      </div>
    </div>
  );
}

// matrix parsing & application (unchanged)
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

// **핵심: 모든 <path>를 순회하면서 id 패턴에 따라 node / link 분기**
function renderSvgNode(
  node: INode,
  nodesData: Node[],
  linksData: Link[],
  onNodeClick?: (node: Node) => void,
  onLinkClick?: (link: Link) => void,
  key?: string,
  highlightState?: {
    highlightedNodes: Set<string>;
    highlightedLinks: Set<string>;
    activeLines: Set<string>;
  },
  showTooltips = true,
  tooltips?: {
    node?: (node: Node) => React.ReactNode;
    link?: (link: Link) => React.ReactNode;
  }
): React.ReactNode {
  // 1) **Node**: id 가 숫자만
  if (node.name === "path" && /^\d+$/.test(node.attributes.id)) {
    const id = node.attributes.id;
    const nodeData = nodesData.find((n) => n.id === id);

    if (!nodeData) return null;

    // 활성 노선 확인
    const isActiveLine =
      !highlightState?.activeLines.size ||
      highlightState.activeLines.has(nodeData.line);

    // nodes/path 하이라이트 타입 처리
    const isNodesHighlight = highlightState?.activeLines.has(
      "__nodes_highlight__"
    );
    const isHighlightedNode = highlightState?.highlightedNodes.has(id) || false;

    // opacity 계산
    let opacity = 1;
    if (highlightState?.activeLines.has("__nodes_highlight__")) {
      // path 타입 전용
      opacity = isHighlightedNode ? 1 : 0.1;
    } else if (highlightState?.activeLines.size && !isActiveLine) {
      opacity = 0.2;
    }

    // nodes/path 하이라이트 타입의 경우 선택되지 않은 노드는 투명하게 처리
    if (isNodesHighlight && !isHighlightedNode) {
      opacity = 0.1;
    }

    // 디버깅: 하이라이트 상태 로그
    if (isNodesHighlight) {
      console.log(
        `노드 ${id} (${nodeData.name}): isHighlighted=${isHighlightedNode}, opacity=${opacity}`
      );
    }

    // 텍스트 위치: d 첫 번째 M 좌표를 찍어서 offset
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
        <g key={key || id} style={{ opacity }}>
          <Tooltip>
            <TooltipTrigger asChild>{nodeElement}</TooltipTrigger>
            <RadixTooltipContent>{tooltips.node(nodeData)}</RadixTooltipContent>
          </Tooltip>
          {textElement}
        </g>
      );
    } else if (showTooltips) {
      return (
        <g key={key || id} style={{ opacity }}>
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
        <g key={key || id} style={{ opacity }}>
          {nodeElement}
          {textElement}
        </g>
      );
    }
  }

  // 2) **Link**: id 가 "숫자-숫자"
  if (node.name === "path" && /^\d+-\d+$/.test(node.attributes.id)) {
    const id = node.attributes.id;
    const [src, dst] = id.split("-");
    const link = linksData.find(
      (l) =>
        (l.source === src && l.target === dst) ||
        (l.source === dst && l.target === src)
    );

    if (!link) {
      console.log("linksData에 없는 링크:", id, "source:", src, "target:", dst);
      return null;
    }

    // 활성 노선 확인
    const isActiveLine =
      !highlightState?.activeLines.size ||
      highlightState.activeLines.has(link.line);

    // nodes/path 하이라이트 타입 처리
    const isNodesHighlight = highlightState?.activeLines.has(
      "__nodes_highlight__"
    );
    const isHighlightedLink = highlightState?.highlightedLinks.has(id) || false;
    // opacity 계산 (path 타입 전용 모드 먼저 체크)
    let opacity: number;
    if (highlightState?.activeLines.has("__nodes_highlight__")) {
      // path 하이라이트 모드: 실제 하이라이트된 링크만 1, 나머지는 0.1
      opacity = isHighlightedLink ? 1 : 0.1;
    } else if (highlightState?.activeLines.size && !isActiveLine) {
      // 일반적인 line 하이라이트 모드: 선택 외엔 0.2
      opacity = 0.2;
    } else {
      // 필터 없을 때
      opacity = 1;
    }

    // 디버깅: 하이라이트 상태 로그
    if (isNodesHighlight) {
      console.log(
        `링크 ${id}: isHighlighted=${isHighlightedLink}, opacity=${opacity}`
      );
    }

    const linkElement = (
      <path
        {...toCamelCaseAttrs(node.attributes)}
        style={{ opacity, cursor: onLinkClick ? "pointer" : undefined }}
        onClick={onLinkClick ? () => onLinkClick(link) : undefined}
      />
    );

    if (showTooltips && tooltips?.link) {
      return (
        <Tooltip key={key || id}>
          <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
          <RadixTooltipContent>{tooltips.link(link)}</RadixTooltipContent>
        </Tooltip>
      );
    } else if (showTooltips) {
      return (
        <Tooltip key={key || id}>
          <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
          <RadixTooltipContent>
            <DefaultLinkTooltip link={link} />
          </RadixTooltipContent>
        </Tooltip>
      );
    } else {
      return <g key={key || id}>{linkElement}</g>;
    }
  }

  // 3) 나머지 원소(예: <g>, <rect> 등)는 그대로 재귀
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
