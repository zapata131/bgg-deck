import { fetchBggThing } from "@/lib/bgg";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ids = searchParams.get("id");

  if (!ids) {
    return NextResponse.json(
      { error: "Game ID(s) are required" },
      { status: 400 }
    );
  }

  const idList = ids.split(",");

  try {
    console.log(`[API] Fetching things for IDs: ${ids}`);
    const data = await fetchBggThing(idList);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API] BGG API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch game details", details: error.message },
      { status: 500 }
    );
  }
}
