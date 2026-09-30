interface SupabasePublicEnv {
  url: string;
  publishableKey: string;
}

let cachedEnv: SupabasePublicEnv | null = null;

function readRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"): string {
  const value = process.env[name]?.trim();
  if (value) return value;

  if (process.env.NODE_ENV !== "production") {
    throw new Error(
      `[Supabase] Variable d'environnement manquante : ${name}. Ajoutez-la dans votre environnement local ou Vercel.`,
    );
  }

  throw new Error("[Supabase] Configuration publique manquante.");
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  if (cachedEnv) return cachedEnv;

  cachedEnv = {
    url: readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: readRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };

  return cachedEnv;
}