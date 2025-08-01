"use client";

import { useEffect, useState } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { PieChart } from "@/components/charts/PieChart";
import { ODPairChart } from "@/components/charts/ODPairChart";
import Spinner from "@/components/Spinner";
import type { Node, Link } from "@/types/network";

interface CardStatsData {
  card_div: string;
  cnt: number;
  card_div_nm: string;
}

interface ODPairData {
  ride_nm: string;
  algh_nm: string;
  oper_nm: string;
  ride_stn_id: string;
  cnt: number;
  algh_stn_id: string;
  oper_id: string;
}

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [svgText, setSvgText] = useState<string>("");
  const [cardStats, setCardStats] = useState<CardStatsData[]>([]);
  const [odPairStats, setOdPairStats] = useState<ODPairData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMainData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. SVG 파일 로드
        const svgResponse = await fetch("/subway_link 1.svg");
        const svgData = await svgResponse.text();
        setSvgText(svgData);

        // 2. 정적 노드/링크 데이터 로드 (network/line/page.tsx와 동일한 방식)
        const [nodesRes, linksRes] = await Promise.all([
          fetch("/nodes.json"),
          fetch("/links.json"),
        ]);

        const nodesText = await nodesRes.text();
        const cleanedNodesText = nodesText.replace(/:\s*NaN/g, ": null");
        setNodes(JSON.parse(cleanedNodesText));
        setLinks(await linksRes.json());

        // 3. 권종별 통행수 데이터
        const cardStatsResponse = await fetch("/api/main", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "card-stats" }),
        });
        const cardStatsData = await cardStatsResponse.json();
        if (cardStatsData.success) {
          console.log("권종별 통행수 데이터:", cardStatsData.data);
          setCardStats(cardStatsData.data || []);
        } else {
          console.error("권종별 통행수 로딩 실패:", cardStatsData.error);
        }

        // 4. OD Pair 통계 데이터
        const odPairResponse = await fetch("/api/main", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "od-pair-stats" }),
        });
        const odPairData = await odPairResponse.json();
        if (odPairData.success) {
          console.log("OD Pair 통계 데이터:", odPairData.data);
          setOdPairStats(odPairData.data || []);
        } else {
          console.error("OD Pair 통계 로딩 실패:", odPairData.error);
        }
      } catch (err) {
        console.error("메인 데이터 로딩 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMainData();
  }, []);

  const handleNodeClick = (node: Node) => {
    console.log("노드 클릭:", node);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 gap-4 overflow-hidden">
      {/* 상단: 네트워크 맵 */}
      <div className="h-[500px] bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">네트워크 맵</h2>
        <NetworkMap
          nodes={nodes}
          links={links}
          svgText={svgText}
          onNodeClick={handleNodeClick}
          width="100%"
          height={400}
        />
      </div>

      {/* 하단: 좌우 분할 */}
      <div className="flex gap-4 h-80">
        {/* 좌측: 권종별 통행수 파이차트 */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">권종별 통행수</h2>
          <div className="h-full">
            {cardStats.length > 0 ? (
              <PieChart data={cardStats} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                데이터를 불러오는 중...
              </div>
            )}
          </div>
        </div>

        {/* 우측: OD Pair 차트 */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">
            OD Pair 통계 (상위 10개)
          </h2>
          <div className="h-full">
            {odPairStats.length > 0 ? (
              <ODPairChart data={odPairStats} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                데이터를 불러오는 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
