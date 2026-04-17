import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function proxy(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is required. Add x-api-key header." },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, plan, request_count")
    .eq("key", apiKey)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  await supabase
    .from("api_keys")
    .update({
      request_count: data.request_count + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  return NextResponse.next();
}

export const config = {
  matcher: "/api/v1/:path*",
};
