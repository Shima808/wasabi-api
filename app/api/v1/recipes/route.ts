import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

// GET /api/v1/recipes?category=soup&limit=10&offset=0
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  let query = supabase
    .from("recipes")
    .select(
      `
      id,
      title_ja,
      title_en,
      servings,
      cook_time_min,
      categories (name_ja, name_en, slug)
    `,
      { count: "exact" },
    )
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (!category) {
      return NextResponse.json(
        { error: `Category "${categorySlug}" not found` },
        { status: 404 },
      );
    }

    query = query.eq("category_id", category.id);
  }

  const { data: recipes, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({
    results: recipes,
    total: count ?? 0,
    limit,
    offset,
  });
}
