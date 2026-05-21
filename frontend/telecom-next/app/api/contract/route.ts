import { NextRequest, NextResponse } from "next/server";

const TOMCAT_URL = process.env.TOMCAT_BASE_URL || "http://localhost:8080/TelecomBillingWebsite";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "";
  const cookieHeader = req.headers.get("cookie") || "";

  const response = await fetch(`${TOMCAT_URL}/contract?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { "Cookie": cookieHeader }
  });
  return NextResponse.json(await response.json());
}

export async function PUT(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const body = await req.text();

  const response = await fetch(`${TOMCAT_URL}/contract`, {
    method: "PUT",
    headers: { "Cookie": cookieHeader, "Content-Type": "application/json" },
    body: body
  });
  return new NextResponse(await response.text(), { status: response.status });
}