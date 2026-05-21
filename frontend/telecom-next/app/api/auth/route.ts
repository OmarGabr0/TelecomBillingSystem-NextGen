import { NextRequest, NextResponse } from "next/server";

const TOMCAT_URL = process.env.TOMCAT_BASE_URL || "http://localhost:8080/TelecomBillingWebsite";
// CHECK SESSION STATUS
export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const res = await fetch(`${TOMCAT_URL}/auth`, {
    method: "GET",
    headers: { "Cookie": cookieHeader },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  return NextResponse.json(await res.json());
}

// EXECUTE LOGIN (FORWARDS TO SERVLET AS URL-ENCODED FORM DATA)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = new URLSearchParams();
    params.append("username", body.username || "");
    params.append("password", body.password || "");

    const response = await fetch(`${TOMCAT_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json(data, { status: response.status });

    // Extract JSESSIONID and pipe it back to user's browser storage
    const tomcatCookie = response.headers.get("set-cookie");
    const nextRes = NextResponse.json(data);
    if (tomcatCookie) nextRes.headers.set("set-cookie", tomcatCookie);
    return nextRes;
  } catch (e) {
    return NextResponse.json({ error: "Auth proxy connection error" }, { status: 500 });
  }
}

// LOGOUT REMOVAL
export async function DELETE(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const res = await fetch(`${TOMCAT_URL}/auth`, {
    method: "DELETE",
    headers: { "Cookie": cookieHeader },
  });
  return NextResponse.json(await res.json());
}