import Link from "next/link";
import Image from "next/image";

function Logo() {
  return(
  <Link
  href="/"
  className="absolute"
  style={{
    top: "50px",
    left: "150px",   
  }}
>
  <Image src="/logo.png" alt="Meal Planner Logo" width={200} height={200} />
</Link>
  );
}

function SignupButton() {
  return (
  <Link
  href="/signup"
  className="text-sm font-medium px-4 py-1.5 rounded-full absolute"
  style={{
    background: "#e0d5c5",
    color: "#fff",
    top : "50px",
    right: "200px",
  }}
>
  Get started
</Link>
  );
}

export default function HomePage() {
  return (
<main className="h-screen bg-gradient-to-b from-stone-200 to-amber-100">
<Logo />
<SignupButton />
</main>
  );
}

