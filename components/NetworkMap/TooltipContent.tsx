import React from "react";
import type { Node } from "./types";
import type { Link } from "./types";

interface TooltipContentProps {
  node: Node;
}

export function TooltipContent({ node }: TooltipContentProps) {
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

export function TooltipContentLink({ link }: { link: Link }) {
  return (
    <div>
      <div style={{ fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>
        링크 정보
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div>
          <b>출발역:</b> {link.source}
        </div>
        <div>
          <b>도착역:</b> {link.target}
        </div>
        <div>
          <b>노선:</b> {link.line}
        </div>
        <div>
          <b>소요시간:</b> {link.time}초
        </div>
      </div>
    </div>
  );
}
