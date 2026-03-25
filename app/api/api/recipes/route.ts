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
    ingredients: body.ingredients ?? [],
    preparation_steps: body.preparation_steps ?? body.steps ?? [],
    preparation_time: body.preparation_time ?? body.prep_time_minutes ?? null,
    cost: body.cost ?? body.estimated_cost ?? null,
    dietary_tags: body.dietary_tags ?? null,
  };

  const { data, error } = await supabase.from("recipes").insert(payload).select("id").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}

// DELETE /api/recipes with JSON { id }
export async function DELETE(req: Request) {
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing recipe id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
