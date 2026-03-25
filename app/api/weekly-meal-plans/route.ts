import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeWeekStartDate(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // expects YYYY-MM-DD
  const match = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  if (!match) return null;

  return trimmed;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("weekly_meal_plans")
      .select("id, title, week_start_date, created_at")
      .eq("user_id", user.id)
      .order("week_start_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load weekly meal plans." },
        { status: 500 }
      );
    }

    return NextResponse.json({ weeklyMealPlans: data ?? [] }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
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

    const weekStartDate = normalizeWeekStartDate(body?.week_start_date);

    if (!weekStartDate) {
      return NextResponse.json(
        { error: "week_start_date is required and must be in YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("weekly_meal_plans")
      .insert({
        user_id: user.id,
        title,
        week_start_date: weekStartDate,
      })
      .select("id, title, week_start_date, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You already have a weekly meal plan for that week." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Failed to create weekly meal plan." },
        { status: 500 }
      );
    }

    return NextResponse.json({ weeklyMealPlan: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}