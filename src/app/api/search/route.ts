import { type NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 3) {
    return NextResponse.json([]);
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query.trim());
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("accept-language", "fr,en");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "PhotoAtlas/1.0 (contact@photoatlas.app)",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return NextResponse.json([], { status: response.status });
  }

  const data: unknown = await response.json();
  return NextResponse.json(data);
}
