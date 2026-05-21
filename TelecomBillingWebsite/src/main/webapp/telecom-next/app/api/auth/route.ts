import { NextRequest, NextResponse } from "next/server";

const TOMCAT_URL = process.env.TOMCAT_BASE_URL || "http://localhost:8080/BillingWebService";

// 1. GET: Check if current session is active
export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  
  const res = await fetch(`${TOMCAT_URL}/auth`, {
    method: "GET",
    headers: { "Cookie": cookieHeader }
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

// 2. POST: Execute secure account authentication
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

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Capture the JSESSIONID set by Tomcat and send it back to the browser
    const tomcatCookies = response.headers.get("set-cookie");
    const nextResponse = NextResponse.json(data);
    if (tomcatCookies) {
      nextResponse.headers.set("set-cookie", tomcatCookies);
    }
    return nextResponse;

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Proxy Error" }, { status: 500 });
  }
}

// 3. DELETE: Log out and clear session state
export async function DELETE(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const response = await fetch(`${TOMCAT_URL}/auth`, {
    method: "DELETE",
    headers: { "Cookie": cookieHeader }
  });

  const data = await response.json();
  return NextResponse.json(data);
}