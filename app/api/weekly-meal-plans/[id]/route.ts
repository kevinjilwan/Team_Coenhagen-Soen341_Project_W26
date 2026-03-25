import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
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

    const { data: plan, error: planError } = await supabase
      .from("weekly_meal_plans")
      .select("id, title, week_start_date, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Weekly meal plan not found." },
        { status: 404 }
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from("weekly_meal_plan_items")
      .select(`
        id,
        day_of_week,
        meal_type,
        recipe_id,
        created_at,
        recipes (
          id,
          title,
          description
        )
      `)
      .eq("weekly_meal_plan_id", id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message || "Failed to load weekly meal plan items." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        weeklyMealPlan: plan,
        items: items ?? [],
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
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

    const { error } = await supabase
      .from("weekly_meal_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete weekly meal plan." },
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

export async function PATCH(
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

    const title =
      typeof body?.title === "string" && body.title.trim()
        ? body.title.trim()
        : null;

    const weekStartDate =
      typeof body?.week_start_date === "string" ? body.week_start_date.trim() : "";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
      return NextResponse.json(
        { error: "week_start_date is required and must be in YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("weekly_meal_plans")
      .update({
        title,
        week_start_date: weekStartDate,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, title, week_start_date, created_at")
      .single();
    
      if (!error && !data) {
      return NextResponse.json(
        { error: "Weekly meal plan not found." },
        { status: 404 }
      );
    }
    
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You already have a weekly meal plan for that week." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Failed to update weekly meal plan." },
        { status: 500 }
      );
    }

    return NextResponse.json({ weeklyMealPlan: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}