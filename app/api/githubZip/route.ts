// app/api/githubZip/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const githubUrl = searchParams.get("githubUrl");
  const githubToken = searchParams.get("githubToken");

  if (!githubUrl) {
    return NextResponse.json(
      { error: "githubUrl parameter is required" },
      { status: 400 }
    );
  }

  const apiUrl =
    githubUrl.replace("github.com", "api.github.com/repos").replace(/\/$/, "") +
    "/zipball";

  const headers: HeadersInit = {
    "User-Agent": "YourAppName",
    Accept: "application/vnd.github.v3+json",
  };

  if (githubToken) {
    headers["Authorization"] = `token ${githubToken}`;
  }

  try {
    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
      return NextResponse.json(
        { error: response.statusText },
        { status: response.status }
      );
    }
    const buffer = await response.arrayBuffer();
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
