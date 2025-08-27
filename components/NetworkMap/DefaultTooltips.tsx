import React from "react";
import type { Node, Link } from "@/types/network";

// 기본 노드 툴팁
export function DefaultNodeTooltip({ node }: { node: Node }) {
  return (
    <div>
      <div style={{ fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>
        역 정보
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div>
          <b>역명:</b> {node.name}
        </div>
        <div>
          <b>노선:</b> {node.line}
        </div>
        <div>
          <b>운영사:</b> {node.operator}
        </div>
        <div>
          <b>개통일:</b> {node.open_date}
        </div>
        <div>
          <b>환승역:</b> {node.is_transfer >= 2 ? "환승역" : "일반역"}
        </div>
        <div>
          <b>평균 체류시간:</b> {node.avg_stay_sec_new}초
        </div>
      </div>
    </div>
  );
}

// 정산 정보가 포함된 노드 툴팁
export function SettlementNodeTooltip({
  node,
  settlementData,
}: {
  node: Node;
  settlementData?: { base_amt?: number; ubrw_amt?: number; km?: number };
}) {
  return (
    <div>
      <div style={{ fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>
        역 정보
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div>
          <b>역명:</b> {node.name}
        </div>
        <div>
          <b>노선:</b> {node.line}
        </div>
        <div>
          <b>운영사:</b> {node.operator}
        </div>
        {settlementData && (
          <>
            {settlementData.base_amt !== undefined && (
              <div>
                <b>기본배분금:</b> {settlementData.base_amt.toLocaleString()}원
              </div>
            )}
            {settlementData.ubrw_amt !== undefined && (
              <div>
                <b>도시철도부가사용금:</b>{" "}
                {settlementData.ubrw_amt.toLocaleString()}원
              </div>
            )}
            {settlementData.km !== undefined && (
              <div>
                <b>인.km:</b> {settlementData.km.toFixed(1)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 정산 정보가 포함된 링크 툴팁
export function SettlementLinkTooltip({ link }: { link: Link }) {
  return (
    <div>
      <div style={{ fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>
        노선 정보
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div>
          <b>노선명:</b> {link.line}
        </div>
        <div>
          <b>운영사:</b> {link.operator}
        </div>
        <div>
          <b>거리:</b> {link.distance?.toFixed(1)}km
        </div>
      </div>
    </div>
  );
}
