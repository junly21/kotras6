"use client";

import React, { useEffect, useState } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import type { Node, Link } from "@/components/NetworkMap/types";

export default function NetworkLinePage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [svgText, setSvgText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [nodesRes, linksRes, svgRes] = await Promise.all([
          fetch("/nodes.json"),
          fetch("/links.json"),
          fetch("/sub_line_test.svg"),
        ]);
        const nodesText = await nodesRes.text();
        const cleanedNodesText = nodesText.replace(/:\s*NaN/g, ": null");
        setNodes(JSON.parse(cleanedNodesText));
        setLinks(await linksRes.json());
        setSvgText(await svgRes.text());
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">노선도 조회</h1>
      <div className="flex gap-6">
        <div className="flex-1 h-[920px] border rounded-lg p-4 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              노선도를 불러오는 중...
            </div>
          ) : (
            <NetworkMap
              nodes={nodes}
              links={links}
              svgText={svgText}
              width="100%"
              height={800}
              onNodeClick={setSelectedNode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
