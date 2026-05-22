import { NextRequest, NextResponse } from "next/server";

const TOMCAT_URL = process.env.TOMCAT_BASE_URL || "http://localhost:8080/TelecomBillingWebsite";

// 1. GET: Check Session Status
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const res = await fetch(`${TOMCAT_URL}/auth`, {
      method: "GET",
      headers: { "Cookie": cookieHeader },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ error: "Auth server unreachable" }, { status: 500 });
  }
}

// 2. POST: Login (Converts incoming data to URL-encoded parameters for Java)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 💡 CRITICAL FIX: Convert JSON to x-www-form-urlencoded so req.getParameter() works!
    const formParams = new URLSearchParams();
    formParams.append("username", body.username || "");
    formParams.append("password", body.password || "");

    const response = await fetch(`${TOMCAT_URL}/auth`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: formParams.toString(),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      try {
        const errJson = JSON.parse(responseText);
        return NextResponse.json(errJson, { status: response.status });
      } catch {
        return NextResponse.json({ error: "Invalid credentials" }, { status: response.status });
      }
    }

    const userData = JSON.parse(responseText);
    const nextRes = NextResponse.json(userData);

    // Forward the JSESSIONID cookie from Tomcat, but rewrite the path to / so
    // the browser sends it back to the Next.js proxy on subsequent requests.
    const tomcatCookie = response.headers.get("set-cookie");
    if (tomcatCookie) {
      const rewrittenCookie = tomcatCookie.replace(/Path=\/TelecomBillingWebsite/i, "Path=/");
      nextRes.headers.set("set-cookie", rewrittenCookie);
    }
    
    return nextRes;
  } catch (e) {
    console.error("Proxy error:", e);
    return NextResponse.json({ error: "Auth proxy connection error" }, { status: 500 });
  }
}

// 3. DELETE: Logout
export async function DELETE(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const res = await fetch(`${TOMCAT_URL}/auth`, {
      method: "DELETE",
      headers: { "Cookie": cookieHeader },
    });
    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ error: "Failed to terminate session" }, { status: 500 });
  }
}