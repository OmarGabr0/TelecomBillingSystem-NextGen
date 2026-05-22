import { NextRequest, NextResponse } from "next/server";

const TOMCAT_URL = process.env.TOMCAT_BASE_URL || "http://localhost:8080/TelecomBillingWebsite";

async function proxyFetch(targetUrl: string, options: RequestInit) {
  const response = await fetch(targetUrl, options);
  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      return new NextResponse(text, { status: response.status, headers: { "content-type": "application/json" } });
    }
    return new NextResponse(text, { status: response.status });
  }

  if (contentType.includes("application/json")) {
    return NextResponse.json(JSON.parse(text));
  }
  return new NextResponse(text, { status: response.status });
}

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const { searchParams, pathname } = new URL(req.url);
    const subPath = pathname.replace("/api/customer", "");
    const targetUrl = `${TOMCAT_URL}/customer${subPath}?${searchParams.toString()}`;

    return await proxyFetch(targetUrl, {
      method: "GET",
      headers: { "Cookie": cookieHeader }
    });
  } catch (error) {
    return NextResponse.json({ error: "Customer endpoint proxy failure" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const rawBody = await req.text();

    const response = await fetch(`${TOMCAT_URL}/customer`, {
      method: "POST",
      headers: {
        "Cookie": cookieHeader,
        "Content-Type": "application/json"
      },
      body: rawBody
    });

    return new NextResponse(await response.text(), { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const rawBody = await req.text();

    const response = await fetch(`${TOMCAT_URL}/customer`, {
      method: "PUT",
      headers: {
        "Cookie": cookieHeader,
        "Content-Type": "application/json"
      },
      body: rawBody
    });

    return new NextResponse(await response.text(), { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const { searchParams, pathname } = new URL(req.url);
    const subPath = pathname.replace("/api/customer", "");
    const targetUrl = `${TOMCAT_URL}/customer${subPath}?${searchParams.toString()}`;

    const response = await fetch(targetUrl, {
      method: "DELETE",
      headers: { "Cookie": cookieHeader }
    });

    return new NextResponse(await response.text(), { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
