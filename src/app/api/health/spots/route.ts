import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/client-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VERIFIED_SLUG = "photoatlas-test-verified";
const CANDIDATE_SLUG = "photoatlas-test-candidate";
const REJECTED_SLUG = "photoatlas-test-rejected";

function configurationErrorResponse() {
  return NextResponse.json(
    {
      reachable: false,
      rlsValid: false,
      writeBlocked: false,
      message: "Configuration Supabase publique indisponible.",
    },
    { status: 500 },
  );
}

export async function GET() {
  let supabase;

  try {
    supabase = getSupabaseServerClient();
  } catch {
    return configurationErrorResponse();
  }

  const { data: spots, error: readError } = await supabase
    .from("spots")
    .select("id, name, slug, status")
    .order("slug", { ascending: true });

  if (readError) {
    return NextResponse.json(
      {
        reachable: false,
        rlsValid: false,
        writeBlocked: false,
        message: "Lecture de public.spots impossible avec la configuration publique actuelle.",
      },
      { status: 503 },
    );
  }

  const visibleSpots = spots ?? [];
  const visibleSlugs = new Set(visibleSpots.map((spot) => spot.slug));
  const nonVerifiedVisible = visibleSpots.some((spot) => spot.status !== "verified");
  const verifiedVisible = visibleSlugs.has(VERIFIED_SLUG);
  const candidateInvisible = !visibleSlugs.has(CANDIDATE_SLUG);
  const rejectedInvisible = !visibleSlugs.has(REJECTED_SLUG);
  const rlsValid = verifiedVisible && candidateInvisible && rejectedInvisible && !nonVerifiedVisible;

  const writeTestSlug = `rls-write-test-${Date.now()}`;
  const { data: insertedRows, error: insertError } = await supabase
    .from("spots")
    .insert({
      name: "RLS Write Test",
      slug: writeTestSlug,
      position: "SRID=4326;POINT(-0.719572 44.9096393)",
      country_code: "FR",
      spot_type: "other",
      source: "manual",
      source_type: "healthcheck",
      status: "verified",
      description: "Temporary write test created by PhotoAtlas health check.",
    })
    .select("id, slug")
    .limit(1);

  const writeBlocked = Boolean(insertError);
  let cleanupSucceeded = true;

  if (!writeBlocked && insertedRows && insertedRows.length > 0) {
    const insertedId = insertedRows[0]?.id;
    if (insertedId) {
      const { error: deleteError } = await supabase.from("spots").delete().eq("id", insertedId);
      cleanupSucceeded = !deleteError;
    }
  }

  return NextResponse.json(
    {
      reachable: true,
      rlsValid,
      writeBlocked,
      cleanupSucceeded,
      count: visibleSpots.length,
      verifiedVisible,
      candidateInvisible,
      rejectedInvisible,
      spots: visibleSpots,
    },
    { status: rlsValid && writeBlocked ? 200 : 503 },
  );
}