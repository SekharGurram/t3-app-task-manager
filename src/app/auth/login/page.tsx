"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SimpleToast from "~/components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const router = useRouter();

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setSubmitError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Login failed");
        return;
      }

      setToastMessage("Logged in successfully");
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        router.push("/tasks");
      }, 1000);
    } catch (err: any) {
      setSubmitError(err.message || "Login failed");
      setToastMessage("Login failed");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-8 font-semibold">
        Task Manager
      </h1>

      <div className="relative bg-white p-10 rounded shadow-md w-full max-w-md">
        <div className="absolute top-4 right-4 text-sm">
          <span className="text-gray-600">Don’t have an account? </span>
          <Link
            href="/auth/register"
            className="text-blue-700 font-semibold hover:underline"
          >
            Sign up!
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-center">Login</h2>

        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="w-full border border-gray-300 rounded px-4 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && (
          <p className="text-red-600 text-sm mt-1 mb-4">{emailError}</p>
        )}

        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full border border-gray-300 rounded px-4 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && (
          <p className="text-red-600 text-sm mt-1 mb-4">{passwordError}</p>
        )}

        {submitError && (
          <p className="text-red-600 text-sm text-center mb-4">
            {submitError}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer disabled:opacity-60 mt-3"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        {showToast && (
          <SimpleToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
}
