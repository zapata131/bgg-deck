import { NextRequest, NextResponse } from "next/server";
import { fetchShortDescription } from "@/lib/scraper";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing 'id' parameter" }, { status: 400 });
  }

  try {
    const description = await fetchShortDescription(id);
    return NextResponse.json({ id, description });
  } catch (error) {
    console.error("Error in description API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
