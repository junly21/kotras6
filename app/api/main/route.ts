import { NextRequest, NextResponse } from "next/server";
import { MainService } from "@/services/mainService";
import { createCorsHeaders } from "../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    let result;

    switch (type) {
      case "network-nodes":
        result = await MainService.getNetworkNodes();
        break;

      case "network-lines":
        result = await MainService.getNetworkLinks();
        break;

      case "card-stats":
        result = await MainService.getCardStats();
        break;

      case "od-pair-stats":
        result = await MainService.getODPairStats();
        break;

      default:
        return NextResponse.json(
          { error: "Invalid request type" },
          { status: 400, headers: createCorsHeaders() }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500, headers: createCorsHeaders() }
      );
    }

    return NextResponse.json(result, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("Main API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}
