import React, { useEffect, useState, useRef } from "react";
import { parseSvg, toCamelCaseAttrs } from "./utils";
import { TooltipContent } from "./TooltipContent";
import type { Node, Link } from "./types";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent as RadixTooltipContent,
} from "../ui/tooltip";
import type { INode } from "svgson";

interface NetworkMapProps {
  nodes: Node[];
  links: Link[];
  svgText: string;
  width?: number | string;
  height?: number | string;
  onNodeClick?: (node: Node) => void;
}

export function NetworkMap({
  nodes,
  links,
  svgText,
  width = "100%",
  height = 800,
  onNodeClick,
}: NetworkMapProps) {
  const [svgReactTree, setSvgReactTree] = useState<React.ReactNode>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    parseSvg(svgText).then((svgJson) => {
      setSvgReactTree(renderSvgNode(svgJson, nodes, links, onNodeClick));
    });
  }, [svgText, nodes, links, onNodeClick]);

  // 확대/축소/드래그 핸들러
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const delta = e.deltaY > 0 ? -1 : 1;
      setScale((prev) => Math.max(0.1, Math.min(5, prev + delta * 0.1)));
    }
  };
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
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.max(0.1, Math.min(5, prev + delta * 0.1)));
  };
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div style={{ width, height, position: "relative", overflow: "hidden" }}>
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => handleZoom(1)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          확대
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          축소
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
          리셋
        </button>
        <span className="px-3 py-1 bg-gray-100 rounded text-sm">
          확대율: {Math.round(scale * 100)}%
        </span>
      </div>
      <div
        style={{ width: "100%", height: "100%" }}
        onWheel={handleWheel}
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
          <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
            {svgReactTree}
          </g>
        </svg>
      </div>
    </div>
  );
}

// SVG 파싱 후 React로 변환 (툴팁/역명 포함)
function renderSvgNode(
  node: INode,
  nodesData: Node[],
  linksData: Link[],
  onNodeClick?: (node: Node) => void,
  key?: string
): React.ReactNode {
  if (node.name === "circle") {
    const { id, ...rest } = node.attributes;
    const nodeData = nodesData.find((n) => n.id === id);
    const cx = rest.cx ? Number(rest.cx) : 0;
    const cy = rest.cy ? Number(rest.cy) : 0;
    const fontSize = 32;
    const offset = 40;
    return (
      <g key={key || id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <circle
              {...toCamelCaseAttrs(rest)}
              id={id}
              style={{ cursor: "pointer" }}
              onClick={
                nodeData && onNodeClick
                  ? () => onNodeClick(nodeData)
                  : undefined
              }
            />
          </TooltipTrigger>
          <RadixTooltipContent style={{ background: "white", color: "black" }}>
            {nodeData && <TooltipContent node={nodeData} />}
          </RadixTooltipContent>
        </Tooltip>
        {/* 역명 표시 */}
        {nodeData && (
          <text
            x={cx + offset}
            y={cy + offset}
            fontSize={fontSize}
            fontFamily="Arial, sans-serif"
            fill="#374151"
            pointerEvents="none"
            dominantBaseline="hanging">
            {/* 역명에서 '_' 이후, 괄호 전까지만 표시 */}
            {(() => {
              const raw = nodeData.name.split("_")[1] || nodeData.name;
              const parenIdx = raw.indexOf("(");
              return parenIdx > -1 ? raw.slice(0, parenIdx) : raw;
            })()}
          </text>
        )}
      </g>
    );
  }
  if (node.name === "line") {
    const { id, ...rest } = node.attributes;
    return <line key={key || id} {...toCamelCaseAttrs(rest)} />;
  }
  return React.createElement(
    node.name,
    { ...toCamelCaseAttrs(node.attributes), key: key || node.attributes.id },
    node.children?.map((child: INode, i: number) =>
      renderSvgNode(
        child,
        nodesData,
        linksData,
        onNodeClick,
        `${node.name}-${i}`
      )
    )
  );
}
