import Link from "next/link";
import Image from "next/image";
import { Reenie_Beanie } from "next/font/google";

const font = Reenie_Beanie({ subsets: ["latin"], weight: "400" });

function Logo() {
  return(
  <Link href="/" className="top-[-25px] left-[150px] absolute">
  <Image src="/logo.png" alt="Meal Major Logo" width={200} height={200} />
  </Link>
  );
}

function HeaderText(){
  return (
    <Link href="/" className={`top-[75px] left-[48%] -translate-x-1/2 -translate-y-1/2 absolute
    text-8xl font-semibold text-center italic ${font.className}
    text-gray-700`} >
      Meal Major
    </Link>
  );
}


function WelcomeText(){
  return (
    <p className={`top-[250px] left-[48%] -translate-x-1/2 -translate-y-1/2 absolute 
    text-6xl text-gray-700 ${font.className}`}>
      Welcome to Meal Major
      </p>
    );
  }

function SubWelcomeText(){
  return (
    <p className={`top-[375px] left-[48%] -translate-x-1/2 -translate-y-1/2 absolute
    text-2xl text-gray-700 text-center ${font.className}`} >
MealMajor helps students plan meals and stay organized by managing recipes and creating a personalized 
weekly meal plan. Easily track dietary preferences, assign meals to each day, and avoid repetition.
    </p>
  );
}

function GetStartedButton() {
  return (
  <Link href="/auth/sign-up" className="top-[50px] right-[200px] absolute 
  text-sm font-medium px-4 py-1.5 rounded-full
  text-white bg-[#e0d5c5]">

  Get started
</Link>
  );
}

function StartForFreeButton() {
  return (
  <Link href="/auth/sign-up" className="top-[60%] left-[43%] -translate-x-1/2 -translate-y-1/2 absolute 
  text-sm font-medium px-4 py-1.5 rounded-full
  text-white bg-[#e0d5c5]">

  Start For Free
</Link>
  );
}

function LoginButton() {
  return (
  <Link href="/auth/login" className="top-[60%] left-[53%] -translate-x-1/2 -translate-y-1/2 absolute 
  text-sm font-medium px-4 py-1.5 rounded-full
  text-white bg-[#e0d5c5]">
  Login
</Link>
  );
}

export default function HomePage() {
  return (
    <main className="h-screen bg-gradient-to-b from-stone-200 to-amber-100">
    <header className="px-[150px] pt-[100px] flex items-center justify-between">

<Logo />
<HeaderText />
<WelcomeText />
<SubWelcomeText />

<GetStartedButton />
<StartForFreeButton />
<LoginButton />

      </header>
      <hr className="mt-12 border-stone-300" />
    </main>
  );
}


