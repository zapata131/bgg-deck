import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ids = searchParams.get("ids");

  if (!ids) {
    return NextResponse.json(
      { error: "Game IDs are required" },
      { status: 400 }
    );
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Construct the URL to the print page
    // Note: In production, this should use the actual deployment URL
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const printUrl = `${protocol}://${host}/print?ids=${ids}`;

    console.log(`[PDF] Generating PDF for URL: ${printUrl}`);

    await page.goto(printUrl, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bgg-deck-sheet.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("[PDF] Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}
