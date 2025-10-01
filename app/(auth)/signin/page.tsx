"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email, // Using email as username
          password: password,
        }),
      });

      const data = await response.json();
      console.log(data, "data");
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        // Store token in cookie
        document.cookie = `token=${data.data.token}; path=/; max-age=${
          60 * 60 * 24 * 7
        }; secure; samesite=strict`;

        // Store user info in cookie (optional)
        document.cookie = `user-info=${JSON.stringify(
          data.data.user
        )}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;

        // Redirect to admin panel using the user ID
        router.push(`/${data.data.user.username}/panel`);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-4 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-50 to-green-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
            <svg
              className="h-8 w-8 sm:h-10 sm:w-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome Back
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your store admin panel
          </p>
        </div>

        {/* Sign In Form */}
        <form
          onSubmit={handleSignIn}
          className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-8 rounded-2xl shadow-xl border border-green-100"
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email/Username Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                Email / Username / Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-black pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white placeholder-gray-500 text-sm sm:text-base"
                  placeholder="Enter your email, username, or phone"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-black pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white placeholder-gray-500 text-sm sm:text-base"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878L12 12m0 0l2.122 2.122M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              {/* <div className="text-xs sm:text-sm">
                <a
                  href="#"
                  className="text-green-500 hover:text-green-600 font-medium"
                >
                  Forgot password?
                </a>
              </div> */}
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-2.5 sm:py-3 px-4 rounded-lg text-base sm:text-lg font-medium hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In to Admin Panel"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Store Info */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border border-green-100">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-700">
            <div className="bg-green-500 p-1 rounded-full flex-shrink-0">
              <svg
                className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span>Secure access to your complete e-commerce solution</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
