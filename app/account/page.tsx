import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const supabase = await createClient();

  // logged-in user (Supabase Auth)
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  // not logged in => go to login page
  if (!user) redirect("/auth/login");

  // Load existing data (if it exists)
  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("preferences")
      .select("allergies, diet_focus, lactose_intolerant")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <AccountClient
      userId={user.id}
      initialProfile={{
        full_name: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
      }}
      initialPreferences={{
        allergies: preferences?.allergies ?? [],
        diet_focus: preferences?.diet_focus ?? "balanced",
        lactose_intolerant: preferences?.lactose_intolerant ?? false,
      }}
    />
  );
}
