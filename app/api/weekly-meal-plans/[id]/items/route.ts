import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const VALID_MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

function isValidDay(value: unknown): value is string {
  return typeof value === "string" && VALID_DAYS.includes(value);
}

function isValidMealType(value: unknown): value is string {
  return typeof value === "string" && VALID_MEAL_TYPES.includes(value);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const dayOfWeek = body?.day_of_week;
    const mealType = body?.meal_type;
    const recipeId = body?.recipe_id;

    if (!isValidDay(dayOfWeek)) {
      return NextResponse.json({ error: "Invalid day_of_week." }, { status: 400 });
    }

    if (!isValidMealType(mealType)) {
      return NextResponse.json({ error: "Invalid meal_type." }, { status: 400 });
    }

    if (typeof recipeId !== "string" || !recipeId.trim()) {
      return NextResponse.json({ error: "recipe_id is required." }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabase
      .from("weekly_meal_plans")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Weekly meal plan not found." },
        { status: 404 }
      );
    }

    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id, user_id")
      .eq("id", recipeId)
      .eq("user_id", user.id)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { error: "Recipe not found." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("weekly_meal_plan_items")
      .upsert(
        {
          weekly_meal_plan_id: id,
          day_of_week: dayOfWeek,
          meal_type: mealType,
          recipe_id: recipeId,
        },
        {
          onConflict: "weekly_meal_plan_id,day_of_week,meal_type",
        }
      )
      .select("id, weekly_meal_plan_id, day_of_week, meal_type, recipe_id, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to save meal assignment." },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const dayOfWeek = body?.day_of_week;
    const mealType = body?.meal_type;

    if (!isValidDay(dayOfWeek)) {
      return NextResponse.json({ error: "Invalid day_of_week." }, { status: 400 });
    }

    if (!isValidMealType(mealType)) {
      return NextResponse.json({ error: "Invalid meal_type." }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabase
      .from("weekly_meal_plans")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Weekly meal plan not found." },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("weekly_meal_plan_items")
      .delete()
      .eq("weekly_meal_plan_id", id)
      .eq("day_of_week", dayOfWeek)
      .eq("meal_type", mealType);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to remove meal assignment." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}