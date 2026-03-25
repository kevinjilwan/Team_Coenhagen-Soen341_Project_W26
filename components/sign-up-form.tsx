"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2edda] flex flex-col">

      {/* FORM */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className={cn("w-full max-w-sm", className)} {...props}>

          {/* Eyebrow */}
          <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-5">
            <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
            Create your account
          </p>

          <h1 className="font-serif text-4xl font-normal tracking-tight text-[#151e2d] mb-2">
            Sign up
          </h1>
          <p className="text-sm text-[#6b6450] font-light mb-8">
            Start planning your meals in minutes.
          </p>

          <form onSubmit={handleSignUp} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium tracking-wide uppercase text-[#6b6450]">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] placeholder:text-[#6b6450]/50 focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium tracking-wide uppercase text-[#6b6450]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light"
              />
            </div>

            {/* Repeat Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="repeat-password" className="text-xs font-medium tracking-wide uppercase text-[#6b6450]">
                Repeat Password
              </label>
              <input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 font-light">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 mt-1"
            >
              {isLoading ? "Creating account..." : "Sign up →"}
            </button>

            {/* Login link */}
            <p className="text-center text-xs text-[#6b6450] font-light">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#9a7a2e] hover:text-[#151e2d] transition-colors">
                Log in
              </Link>
            </p>

          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mx-10 py-5 border-t border-[#9a7a2e]/20 flex items-center justify-between">
        <p className="text-xs text-[#6b6450]">© 2026 Meal Major</p>
        <p className="text-xs text-[#6b6450]">Made for students who actually want to eat well.</p>
      </footer>

    </div>
  );
}
