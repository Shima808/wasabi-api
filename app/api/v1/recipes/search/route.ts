import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

// GET /api/v1/recipes/search?ingredients=豆腐,醤油&lang=ja
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ingredientsParam = searchParams.get("ingredients");
  const lang = searchParams.get("lang") ?? "ja";
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  if (!ingredientsParam) {
    return NextResponse.json(
      { error: "ingredients parameter is required" },
      { status: 400 },
    );
  }

  const ingredientNames = ingredientsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (ingredientNames.length === 0) {
    return NextResponse.json(
      { error: "at least one ingredient is required" },
      { status: 400 },
    );
  }

  // Find ingredient IDs matching the given names
  const nameField = lang === "en" ? "name_en" : "name_ja";
  const { data: matchedIngredients, error: ingredientError } = await supabase
    .from("ingredients")
    .select("id, name_ja, name_en")
    .in(nameField, ingredientNames);


  if (ingredientError) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!matchedIngredients || matchedIngredients.length === 0) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const ingredientIds = matchedIngredients.map((i) => i.id);

  // Find recipes that contain ANY of these ingredients
  const { data: recipeIds, error: riError } = await supabase
    .from("recipe_ingredients")
    .select("recipe_id")
    .in("ingredient_id", ingredientIds);

  if (riError) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const uniqueRecipeIds = [
    ...new Set(recipeIds?.map((r) => r.recipe_id) ?? []),
  ];

  if (uniqueRecipeIds.length === 0) {
    return NextResponse.json({ results: [], total: 0 });
  }

  // Fetch full recipe data
  const {
    data: recipes,
    error: recipesError,
    count,
  } = await supabase
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
    .in("id", uniqueRecipeIds)
    .range(offset, offset + limit - 1);

  if (recipesError) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({
    results: recipes,
    total: count ?? 0,
    matched_ingredients: matchedIngredients.map((i) => ({
      name_ja: i.name_ja,
      name_en: i.name_en,
    })),
    limit,
    offset,
  });
}
