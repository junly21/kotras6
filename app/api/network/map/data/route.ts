import { NextRequest, NextResponse } from "next/server";
import {
  callExternalApi,
  createCorsHeaders,
} from "@/app/api/utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const { network, line, networkLabel } = await request.json();

    if (!network || !line || !networkLabel) {
      return NextResponse.json(
        { error: "network, line, networkLabel 값이 필요합니다." },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    // 외부 API에 POST 요청 (노드 목록)
    const { data: nodeData } = await callExternalApi(
      "selectNetWorkNodeList.do",
      {
        method: "POST",
        body: {
          NET_DT: network,
          OPER_NM: networkLabel,
          SUBWAY: line,
        },
      }
    );

    // 외부 API에 POST 요청 (노선 상세 목록)
    const { data: lineData } = await callExternalApi(
      "selectNetWorkLineList.do",
      {
        method: "POST",
        body: {
          NET_DT: network,
          OPER_NM: networkLabel,
          SUBWAY: line,
        },
      }
    );

    return NextResponse.json(
      { nodeData, lineData },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}
