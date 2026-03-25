import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/recipes/:id  -> returns { recipe }
export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ recipe: data });
}

// PATCH /api/recipes/:id -> updates recipe fields
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const updatePayload = {
    title: body.title ?? null,
    description: body.description ?? null,
    ingredients: body.ingredients ?? null,                 // jsonb array
    preparation_steps: body.preparation_steps ?? null,     // jsonb array
    preparation_time: body.preparation_time ?? null,       // integer
    cost: body.cost ?? null,                               // numeric
    dietary_tags: body.dietary_tags ?? null,               // jsonb array
  };

  const { error } = await supabase
    .from("recipes")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
