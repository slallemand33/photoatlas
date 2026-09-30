import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/client-server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function configuredErrorResponse() {
  return NextResponse.json(
    {
      configured: false,
      reachable: false,
      message: "Configuration publique Supabase manquante.",
    },
    { status: 500 },
  );
}

export async function GET() {
  try {
    getSupabaseServerClient();
  } catch {
    return configuredErrorResponse();
  }

  const { url, publishableKey } = getSupabasePublicEnv();

  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      method: "GET",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          configured: true,
          reachable: false,
          message: "Le projet Supabase ne répond pas correctement avec la configuration publique actuelle.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ configured: true, reachable: true });
  } catch {
    return NextResponse.json(
      {
        configured: true,
        reachable: false,
        message: "Le projet Supabase est actuellement injoignable.",
      },
      { status: 503 },
    );
  }
}