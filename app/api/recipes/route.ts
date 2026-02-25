import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  // Minimal validation
  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const payload = {
    user_id: authData.user.id,
    title: body.title.trim(),
    description: body.description ?? null,
    prep_time_minutes: body.prep_time_minutes ?? null,
    cook_time_minutes: body.cook_time_minutes ?? null,
    difficulty: body.difficulty ?? null,
    estimated_cost: body.estimated_cost ?? null,
    ingredients: body.ingredients ?? [],
    steps: body.steps ?? [],
  };

  const { data, error } = await supabase.from("recipes").insert(payload).select("id").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}