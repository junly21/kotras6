import React, { useEffect, useState, useRef } from "react";
import { parseSvg, toCamelCaseAttrs } from "./utils";
import { TooltipContent, TooltipContentLink } from "./TooltipContent";
import type { Node, Link } from "@/types/network";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent as RadixTooltipContent,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import type { INode } from "svgson";

interface NetworkMapProps {
  nodes: Node[];
  links: Link[];
  svgText: string;
  width?: number | string;
  height?: number | string;
  onNodeClick?: (node: Node) => void;
  activeLine?: string | null;
}

export function NetworkMap({
  nodes,
  links,
  svgText,
  width = "100%",
  height = 800,
  onNodeClick,
  activeLine,
}: NetworkMapProps) {
  const [svgReactTree, setSvgReactTree] = useState<React.ReactNode>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: -2400, y: -2500 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    parseSvg(svgText).then((svgJson) => {
      setSvgReactTree(
        renderSvgNode(svgJson, nodes, links, onNodeClick, undefined, activeLine)
      );
    });
  }, [svgText, nodes, links, onNodeClick, activeLine]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
  // 화면 중앙 기준 확대/축소
  const handleZoom = (delta: number) => {
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
  };

  const handleReset = () => {
    setScale(1);
    setPan({ x: -2400, y: -2500 });
  };

  return (
    <div style={{ width, height, position: "relative", overflow: "hidden" }}>
      {/* zoom buttons... */}
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
  key?: string,
  activeLine?: string | null
): React.ReactNode {
  // 1) **Node**: id 가 숫자만
  if (node.name === "path" && /^\d+$/.test(node.attributes.id)) {
    const id = node.attributes.id;
    const nodeData = nodesData.find((n) => n.id === id);
    // 툴팁용 opacity 처리
    const opacity = !activeLine || nodeData?.line === activeLine ? 1 : 0.2;

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

    return (
      <g key={key || id} style={{ opacity }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <path
              {...toCamelCaseAttrs(node.attributes)}
              onClick={
                nodeData && onNodeClick
                  ? () => onNodeClick(nodeData)
                  : undefined
              }
              style={{
                cursor: nodeData && onNodeClick ? "pointer" : undefined,
              }}
            />
          </TooltipTrigger>
          <RadixTooltipContent>
            {nodeData && <TooltipContent node={nodeData} />}
          </RadixTooltipContent>
        </Tooltip>
        {nodeData && (
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
        )}
      </g>
    );
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
    }
    const linkLine = link?.line;
    const opacity = !activeLine || linkLine === activeLine ? 1 : 0.2;
    return (
      <Tooltip key={key || id}>
        <TooltipTrigger asChild>
          <path
            {...toCamelCaseAttrs(node.attributes)}
            style={{ opacity, cursor: link ? "pointer" : undefined }}
          />
        </TooltipTrigger>
        <RadixTooltipContent>
          {link && <TooltipContentLink link={link} />}
        </RadixTooltipContent>
      </Tooltip>
    );
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
        `${node.name}-${i}`,
        activeLine
      )
    )
  );
}
