import { NextRequest, NextResponse } from "next/server";

const TOMCAT_URL = process.env.TOMCAT_BASE_URL || "http://localhost:8080/TelecomBillingWebsite";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const { searchParams, pathname } = new URL(req.url);
    const subPath = pathname.replace("/api/profiles", "");

    const response = await fetch(`${TOMCAT_URL}/profiles${subPath}?${searchParams.toString()}`, {
      method: "GET",
      headers: { "Cookie": cookieHeader }
    });

    return NextResponse.json(await response.json());
  } catch (e) {
    return NextResponse.json({ error: "Profiles mapping link offline" }, { status: 500 });
  }
}

// POST handler to match your req.getParameter updates for creating plans/fees
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const { pathname } = new URL(req.url);
    const subPath = pathname.replace("/api/profiles", "");

    // Convert incoming JSON body into URL-encoded data parameters for your req.getParameter lookups
    const body = await req.json();
    const formParams = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      formParams.append(key, String(value));
    }

    const response = await fetch(`${TOMCAT_URL}/profiles${subPath}`, {
      method: "POST",
      headers: { 
        "Cookie": cookieHeader,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formParams.toString()
    });

    return new NextResponse(await response.text(), { status: response.status });
  } catch (e) {
    return NextResponse.json({ error: "Failed to post parameter mapping" }, { status: 500 });
  }
}