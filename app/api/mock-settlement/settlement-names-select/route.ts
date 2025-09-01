import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    console.log("정산명 selectBox API 호출됨 (GET)");

    const { data } = await callExternalApi("selectSimPayRecvInfoSelectBox.do", {
      method: "POST",
      body: {},
    });

    console.log("외부 API 정산명 selectBox 결과:", data);

    // 응답 데이터를 selectBox 형식으로 변환
    const options = Array.isArray(data)
      ? data.map(
          (item: {
            stmt_nm?: string;
            sim_stmt_grp_id?: string;
            label?: string;
            value?: string;
          }) => ({
            label: item?.stmt_nm || item?.label || "",
            value: item?.sim_stmt_grp_id || item?.value || item?.stmt_nm || "",
          })
        )
      : [];

    return NextResponse.json({ options }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("정산명 selectBox API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

export async function POST() {
  try {
    console.log("정산명 selectBox API 호출됨 (POST)");

    const { data } = await callExternalApi("selectSimPayRecvInfoSelectBox.do", {
      method: "POST",
      body: {},
    });

    console.log("외부 API 정산명 selectBox 결과:", data);

    // 응답 데이터를 selectBox 형식으로 변환
    const options = Array.isArray(data)
      ? data.map(
          (item: {
            stmt_nm?: string;
            sim_stmt_grp_id?: string;
            label?: string;
            value?: string;
          }) => ({
            label: item?.stmt_nm || item?.label || "",
            value: item?.sim_stmt_grp_id || item?.value || item?.stmt_nm || "",
          })
        )
      : [];

    return NextResponse.json({ options }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("정산명 selectBox API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}
