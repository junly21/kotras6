import { NextRequest, NextResponse } from "next/server";
import {
  callExternalApi,
  createCorsHeaders,
} from "@/app/api/utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const { network, networkLabel, lineLabel } = await request.json();

    // 외부 API에 POST 요청
    const { data } = await callExternalApi("selectNetWorkNodeList.do", {
      method: "POST",
      body: {
        NET_DT: network,
        OPER_NM: networkLabel,
        SUBWAY: lineLabel,
      },
    });

    return NextResponse.json({ data }, { headers: createCorsHeaders() });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}
