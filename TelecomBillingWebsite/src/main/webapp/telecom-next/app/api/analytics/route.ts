import { NextRequest, NextResponse } from "next/server";

const TOMCAT_URL = process.env.TOMCAT_BASE_URL || "http://localhost:8080/BillingWebService";

// GET DATA FOR THE ANALYTICS DASHBOARD
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

    // Forward request with active JSESSIONID cookie to AnalyticsServlet
    const response = await fetch(`${TOMCAT_URL}/analytics`, {
      method: "GET",
      headers: { 
        "Cookie": cookieHeader,
        "Cache-Control": "no-store"
      }
    });

    // Handle role management security flags from the Java backend
    if (response.status === 401) {
      return NextResponse.json({ error: "Unauthorized: Please log in again" }, { status: 401 });
    }
    if (response.status === 403) {
      return NextResponse.json({ error: "Forbidden: Admin clearance required" }, { status: 403 });
    }

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch analytics from servlet" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Analytics proxy connection failed" }, { status: 500 });
  }
}