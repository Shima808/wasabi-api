import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

// GET /api/v1/recipes/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      title_ja,
      title_en,
      instructions_ja,
      instructions_en,
      servings,
      cook_time_min,
      created_at,
      categories (name_ja, name_en, slug),
      recipe_ingredients (
        amount,
        unit,
        ingredients (id, name_ja, name_en, reading)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  return NextResponse.json({ result: recipe });
}
