import Link from "next/link";
import Image from "next/image";
import { Reenie_Beanie } from "next/font/google";

const font = Reenie_Beanie({ subsets: ["latin"], weight: "400" });

function Logo() {
  return(
  <Link href="/">
    <Image src="/logo.png" alt="Meal Major Logo" width={200} height={200} />
  </Link>
  );
}

function HeaderText(){
  return (
    <Link href="/" className={`text-8xl font-semibold text-center italic ${font.className} text-gray-700`} >
      Meal Major
    </Link>
  );
}


function WelcomeText(){
  return (
    <p className={`text-6xl text-gray-700 ${font.className}`}>
      Welcome to Meal Major
    </p>
    );
  }

function SubWelcomeText(){
  return (
  <p className={`text-2xl text-gray-700 ${font.className}`} >
    MealMajor helps students plan meals and stay organized by managing recipes and creating a personalized <br />
    weekly meal plan. Easily track dietary preferences, assign meals to each day, and avoid repetition.
  </p>
  );
}

function GetStartedButton() {
  return (
  <Link href="/auth/sign-up" className=" text-xl font-medium px-4 py-1.5 rounded-full
    text-white bg-[#e0d5c5]">
    Get started
  </Link>
  );
}

function LoginButton() {
  return (
  <Link href="/auth/login" className="text-sm font-medium px-4 py-1.5 rounded-full
    text-white bg-[#e0d5c5]">
    Login
  </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-200 to-amber-100 flex flex-col">
      
      <header className="grid grid-cols-3 items-center px-6 py-0 border-b border-stone-300">
        <div className="justify-self-start px-40">
          <Logo />
        </div>

        <div className="justify-self-center text-center">
          <HeaderText />
        </div>

        <div className="justify-self-end px-40">
          <GetStartedButton />
        </div>

        <hr className="border-stone-300" />

      </header>

      <section className="grid place-items-center text-center gap-10 mt-12">
        <WelcomeText />
        <SubWelcomeText />
        <LoginButton />
      </section>

    </main>
  );
}



