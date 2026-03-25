export default function Page() {
  return (
    <div className="min-h-screen bg-[#f2edda] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6 text-center">
            
            {/* Eyebrow */}
            <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] justify-center">
              <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
              Success
              <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
            </p>

            <h1 className="font-serif text-4xl font-normal tracking-tight text-[#151e2d]">
              Thank you for signing up!
            </h1>
            
            <p className="text-sm text-[#6b6450] font-light mb-2">
              Check your email to confirm
            </p>

            <p className="text-sm text-[#6b6450] font-light leading-relaxed">
              You&apos;ve successfully signed up. Please check your email to confirm your account before signing in.
            </p>

          </div>
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