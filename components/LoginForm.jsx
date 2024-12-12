"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid Credentials");
        return;
      }

      router.replace("activities");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="grid place-items-start min-h-screen bg-gray-100 px-4 mt-8">
      <div className="shadow-lg p-6 rounded-lg border-t-4 border-green-400 bg-white max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) => setEmail((e.target.value || "").toLowerCase())}
            type="email"
            placeholder="Email"
            required
          />
          <input
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-bold rounded-md cursor-pointer transition-all duration-200">
            Login
          </button>

          {error && (
            <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md">
              {error}
            </div>
          )}

          <Link
            className="text-sm mt-2 text-right text-green-800 hover:underline"
            href={"/register"}
          >
            Don&apos;t have an account?{" "}
            <span className="font-medium">Register</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
