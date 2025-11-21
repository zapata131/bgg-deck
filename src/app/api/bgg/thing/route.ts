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
    const data = await fetchBggThing(idList);
    return NextResponse.json(data);
  } catch (error) {
    console.error("BGG API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch game details" },
      { status: 500 }
    );
  }
}
