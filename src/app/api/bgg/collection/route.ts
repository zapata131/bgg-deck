import { fetchBggCollection } from "@/lib/bgg";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchBggCollection(username);

    if ('status' in data && data.status === 202) {
      return NextResponse.json(data, { status: 202 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("BGG API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}
