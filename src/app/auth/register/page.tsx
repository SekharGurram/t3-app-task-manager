"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "~/trpc/react";
import SimpleToast from "~/components/Toast";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  const createUser = api.auth.register.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm password";
    else if (confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await createUser.mutateAsync({
        firstName,
        lastName,
        email,
        password,
      });

      setToastType("success");
      setToastMessage("Account created successfully");
      setShowToast(true);

      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);
    } catch (error) {
      setToastType("error");
      setToastMessage("Failed to create account");
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
          <span className="text-gray-600">Already have an account? </span>
          <Link
            href="/auth/login"
            className="text-blue-700 font-semibold hover:underline"
          >
            Login
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-center">Register</h2>

        <label htmlFor="firstName" className="block text-sm font-medium mb-1">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          placeholder="John"
          className="w-full border border-gray-300 rounded px-4 py-2 mb-1"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm mb-2">{errors.firstName}</p>
        )}

        <label htmlFor="lastName" className="block text-sm font-medium mb-1">
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          placeholder="Doe"
          className="w-full border border-gray-300 rounded px-4 py-2 mb-1"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm mb-2">{errors.lastName}</p>
        )}

        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="w-full border border-gray-300 rounded px-4 py-2 mb-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email}</p>
        )}

        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full border border-gray-300 rounded px-4 py-2 mb-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-2">{errors.password}</p>
        )}

        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="w-full border border-gray-300 rounded px-4 py-2 mb-1"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mb-4">{errors.confirmPassword}</p>
        )}

        <button
          onClick={handleRegister}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer mt-2"
        >
          {isSubmitting ? "Registering..." : "Register"}
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
