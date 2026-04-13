import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import EditWeeklyMealPlanClient from "./EditWeeklyMealPlanClient";

export default async function EditWeeklyMealPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <EditWeeklyMealPlanClient id={id} />;
}