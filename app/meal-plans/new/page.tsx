import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import CreateWeeklyMealPlanClient from "./CreateWeeklyMealPlanClient";

export default async function NewWeeklyMealPlanPage() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <CreateWeeklyMealPlanClient />;
}