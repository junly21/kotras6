import { NextRequest, NextResponse } from "next/server";
import { createCorsHeaders } from "../../utils/externalApi";
import { EXTERNAL_BASE_URL } from "../../utils/externalApi";
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    console.log("네트워크 파일 업로드 API 호출됨");

    // 폼 데이터 추출
    const netNm = formData.get("NET_NM") as string;
    const netDt = formData.get("NET_DT") as string;
    const nodeFile = formData.get("nodeFile") as File;
    const linkFile = formData.get("linkFile") as File;
    const platformFile = formData.get("platformFile") as File;

    console.log("추출된 데이터:", {
      netNm,
      netDt,
      nodeFileName: nodeFile?.name,
      linkFileName: linkFile?.name,
      platformFileName: platformFile?.name,
    });

    // 필수 필드 검증
    if (!netNm || !netDt || !nodeFile || !linkFile || !platformFile) {
      return NextResponse.json(
        { success: false, error: "필수 필드가 누락되었습니다." },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    // 파일 타입 검증 (CSV 파일인지 확인)
    const allowedTypes = ["text/csv", "application/csv"];
    const files = [nodeFile, linkFile, platformFile];

    for (const file of files) {
      if (
        !allowedTypes.includes(file.type) &&
        !file.name.toLowerCase().endsWith(".csv")
      ) {
        return NextResponse.json(
          { success: false, error: "CSV 파일만 업로드 가능합니다." },
          { status: 400, headers: createCorsHeaders() }
        );
      }
    }

    // 외부 API 호출을 위한 FormData 생성
    const externalFormData = new FormData();
    externalFormData.append("NET_NM", netNm);
    externalFormData.append("NET_DT", netDt);
    externalFormData.append("nodeFile", nodeFile);
    externalFormData.append("linkFile", linkFile);
    externalFormData.append("platformFile", platformFile);

    console.log("외부 API로 전송할 FormData 내용:");
    for (const [key, value] of externalFormData.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // FormData를 직접 외부 API로 전송
    const externalApiUrl = EXTERNAL_BASE_URL;

    console.log("외부 API URL:", externalApiUrl);

    // 방법 1: FormData로 전송 (기본)
    let response = await fetch(`${externalApiUrl}/selectNetWorkUpload.do`, {
      method: "POST",
      body: externalFormData,
      // Content-Type 헤더를 명시적으로 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
    });

    console.log(
      "FormData 방식 요청 URL:",
      `${externalApiUrl}/selectNetWorkUpload.do`
    );
    console.log("외부 API 응답 상태:", response.status);
    console.log(
      "외부 API 응답 헤더:",
      Object.fromEntries(response.headers.entries())
    );

    // FormData 방식이 실패하면 JSON 방식으로 재시도
    if (!response.ok) {
      console.log("FormData 방식 실패, JSON 방식으로 재시도...");

      // 파일을 base64로 인코딩
      const nodeFileBase64 = await fileToBase64(nodeFile);
      const linkFileBase64 = await fileToBase64(linkFile);
      const platformFileBase64 = await fileToBase64(platformFile);

      const jsonData = {
        NET_NM: netNm,
        NET_DT: netDt,
        nodeFile: nodeFileBase64,
        linkFile: linkFileBase64,
        platformFile: platformFileBase64,
        nodeFileName: nodeFile.name,
        linkFileName: linkFile.name,
        platformFileName: platformFile.name,
      };

      const jsonRequestUrl = `${externalApiUrl}/selectNetWorkUpload.do`;
      console.log("JSON 방식 요청 URL:", jsonRequestUrl);

      response = await fetch(jsonRequestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      console.log("JSON 방식 외부 API 응답 상태:", response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("외부 API 응답 에러:", errorText);
      throw new Error(`외부 API 호출 실패: ${response.status}, ${errorText}`);
    }

    const result = await response.json();
    console.log("네트워크 파일 업로드 성공:", result);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "네트워크 파일이 성공적으로 업로드되었습니다.",
      },
      {
        headers: createCorsHeaders(),
      }
    );
  } catch (error) {
    console.error("네트워크 파일 업로드 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "파일 업로드 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

// 파일을 base64로 변환하는 헬퍼 함수 (Node.js 환경용)
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}
