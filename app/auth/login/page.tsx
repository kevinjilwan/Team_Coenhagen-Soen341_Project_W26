import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
  <div className="flex min-h-svh w-full items-start justify-center pt-10 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
