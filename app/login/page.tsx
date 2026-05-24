"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { login, isAuthenticated, getCurrentUser, User } from "../lib/api";
import logo from "../../public/logo-no-bg.png";
import logo_white from "../../public/logo-white-no-bg.png";
import logo_pill from "../../public/logo-pill.png";

const features = [
  {
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    label: "Student Portal",
    description: "Access clinical simulations and adaptive quizzes",
  },
  {
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    label: "Faculty Portal",
    description: "Monitor student performance and manage scenarios",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    label: "Admin Portal",
    description: "System administration and data analytics",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    label: "ML-Powered Analytics",
    description: "Early identification of at-risk students",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user) {
        router.push(
          user.role === "student" ? "/dashboard" : user.role === "faculty" ? "/faculty" : "/admin",
        );
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result) {
        const user = result.user as User;
        router.push(
          user.role === "student" ? "/dashboard" : user.role === "faculty" ? "/faculty" : "/admin",
        );
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Connection error. Please make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1B6B7B] via-[#0F4C5C] to-[#0A3640] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/4 right-1/4 w-24 h-24 border border-white/10 rounded-full" />
        <div className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-white/10 rounded-full" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          <div className="mb-4">
            <Image src={logo_white} alt="iCare++ Logo" className="h-20 w-auto" />
          </div>
          <p className="text-xl text-white/90 text-center max-w-md mb-10">
            A Scalable Machine Learning-Driven Clinical Competency Assessment and Adaptive Learning
            System For Nursing Students
          </p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(activeFeature === index ? null : index)}
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
                className={`
                  relative p-4 rounded-2xl text-left transition-all duration-300 group cursor-pointer
                  ${
                    activeFeature === index
                      ? "bg-white/20 shadow-xl shadow-white/10 scale-[1.02]"
                      : "bg-white/5 hover:bg-white/10 hover:scale-[1.01]"
                  }
                `}
              >
                <div
                  className={`
                  flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-all duration-300
                  ${activeFeature === index ? "bg-white/30" : "bg-white/10 group-hover:bg-white/20"}
                `}
                >
                  <svg
                    className={`w-6 h-6 text-white transition-transform duration-300 ${activeFeature === index ? "scale-110" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{feature.label}</h3>
                <p
                  className={`
                  text-xs text-white/70 transition-all duration-300 overflow-hidden
                  ${activeFeature === index ? "max-h-8 opacity-100" : "max-h-0 opacity-0"}
                `}
                >
                  {feature.description}
                </p>
                <div
                  className={`
                  absolute bottom-2 right-2 w-2 h-2 rounded-full transition-all duration-300
                  ${activeFeature === index ? "bg-white scale-100" : "bg-white/30 scale-0 group-hover:scale-100"}
                `}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Image src={logo} alt="iCare++ Logo" className="h-20 w-auto mb-4" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-gray-500">Please enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-[#1B6B7B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B6B7B] focus:border-[#1B6B7B] transition-all bg-gray-50/50 shadow-sm text-gray-800 placeholder:text-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-[#1B6B7B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B6B7B] focus:border-[#1B6B7B] transition-all bg-gray-50/50 shadow-sm text-gray-800 placeholder:text-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5 text-[#1B6B7B]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-[#1B6B7B]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#1B6B7B] border-gray-300 rounded focus:ring-[#1B6B7B] cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1B6B7B] text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-[#155663] focus:outline-none focus:ring-2 focus:ring-[#1B6B7B] focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-[#1B6B7B]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50/80 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">Test Credentials</p>
                <div className="space-y-1.5 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>admin@icare.edu / admin123</span>
                    <span className="text-blue-600 font-medium">Admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span>student@icare.edu / student123</span>
                    <span className="text-blue-600 font-medium">Student</span>
                  </div>
                  <div className="flex justify-between">
                    <span>faculty@icare.edu / faculty123</span>
                    <span className="text-blue-600 font-medium">Faculty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-gray-100"></div>
          <p className="text-center text-xs text-gray-400">
            &copy; 2026 iCARE++. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
