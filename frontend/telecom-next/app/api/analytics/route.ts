import { NextRequest, NextResponse } from "next/server";

const TOMCAT_URL = process.env.TOMCAT_BASE_URL || "http://localhost:8080/TelecomBillingWebsite";
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const response = await fetch(`${TOMCAT_URL}/analytics`, {
      method: "GET",
      headers: { "Cookie": cookieHeader, "Cache-Control": "no-store" }
    });

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json({ error: "Unauthorized access path" }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: "Analytics proxy connection error" }, { status: 500 });
  }
}