import { parse, INode } from "svgson";

// SVG 속성 camelCase 변환
export function toCamelCaseAttrs(attrs: Record<string, string>) {
  const map: Record<string, string> = {
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "fill-opacity": "fillOpacity",
    "font-size": "fontSize",
    // 필요한 속성 추가
  };
  return Object.fromEntries(
    Object.entries(attrs).map(([k, v]) => [map[k] || k, v])
  );
}

export async function parseSvg(svgText: string): Promise<INode> {
  return parse(svgText);
}
