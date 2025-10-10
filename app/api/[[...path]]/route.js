import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { FETCH_USER_DETAIL, FETCH_USERS } from "@/app/api-main-file/APIUrl";

export async function fetchGASApi(paramUrl) {
  if (!paramUrl) throw new Error("GAS_BASE_URL is not set");

  if (paramUrl.includes("/a/macros/")) {
    throw new Error(
      "Use public GAS URL: https://script.google.com/macros/s/<id>/exec"
    );
  }

  try {
    const response = await fetch(paramUrl);
    const json = await response.json();

    return json;
  } catch (error) {
    return error;
  }
}

export async function GET(request) {
  try {
    const { pathname, searchParams } = new URL(request.url);
    const pathSegments = pathname.split("/").filter(Boolean);
    const endpoint = pathSegments[pathSegments.length - 1];

    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = (session.user.email || "").trim().toLowerCase();

    switch (endpoint) {
      case "users":
        const users = await fetchGASApi(FETCH_USERS);
        return NextResponse.json(users);
      case "user":
        const rep = searchParams.get("rep");
        const userDetail = await fetchGASApi(`${FETCH_USER_DETAIL}?rep=${rep}`);
        return NextResponse.json(userDetail);

      default:
        return NextResponse.json(
          { error: "Endpoint not found" },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT(request) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(request) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
