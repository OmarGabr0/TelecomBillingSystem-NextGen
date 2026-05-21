import { NextRequest, NextResponse } from "next/server";

const TOMCAT_URL = process.env.TOMCAT_BASE_URL || "http://localhost:8080/BillingWebService";

// FETCH USER CONTRACTS BY EMAIL
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const cookieHeader = req.headers.get("cookie") || "";

    const response = await fetch(`${TOMCAT_URL}/contract?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Cookie": cookieHeader }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to retrieve contracts" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Contract read proxy error" }, { status: 500 });
  }
}

// CREATE A NEW CONTRACT
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const body = await req.text(); // Forward raw string payload down cleanly

    const response = await fetch(`${TOMCAT_URL}/contract`, {
      method: "POST",
      headers: { 
        "Cookie": cookieHeader,
        "Content-Type": "application/json"
      },
      body: body
    });

    const data = await response.text();
    return new NextResponse(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Contract create proxy error" }, { status: 500 });
  }
}

// UPDATE RATEPLAN OR CREDIT LIMIT
export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const body = await req.text();

    const response = await fetch(`${TOMCAT_URL}/contract`, {
      method: "PUT",
      headers: { 
        "Cookie": cookieHeader,
        "Content-Type": "application/json"
      },
      body: body
    });

    const data = await response.text();
    return new NextResponse(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Contract update proxy error" }, { status: 500 });
  }
}