"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  changePassword,
  getCurrentUser,
  refreshCurrentUser,
  User,
} from "../lib/api";

interface ChangePasswordFormProps {
  backHref: string;
  backLabel?: string;
}

export default function ChangePasswordForm({
  backHref,
  backLabel = "Back to profile",
}: ChangePasswordFormProps) {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) return;
    // Hydrate from localStorage after mount to avoid SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(current);
  }, []);

  const hasPassword = user?.has_password ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        const fresh = await refreshCurrentUser();
        if (fresh) setUser(fresh);
        setMessage({
          type: "success",
          text: hasPassword
            ? "Password changed successfully."
            : "Password set successfully. You can now sign in with your email and password.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Unable to update password.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Unable to update password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {hasPassword ? "Change Password" : "Set Password"}
          </h2>
          <p className="text-gray-500 text-sm">
            {hasPassword
              ? "Choose a strong password to keep your account secure."
              : "Create a password so you can sign in with your email address without Google."}
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {hasPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required={hasPassword}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {hasPassword ? "New password" : "Password"}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm {hasPassword ? "new password" : "password"}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Link
              href={backHref}
              className="text-[#1B6B7B] hover:text-[#145A63] text-sm font-medium transition-colors"
            >
              {backLabel}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#1B6B7B] text-white font-medium rounded-xl hover:bg-[#145A63] transition-all disabled:opacity-60"
            >
              {isSubmitting
                ? hasPassword
                  ? "Updating..."
                  : "Setting..."
                : hasPassword
                ? "Update password"
                : "Set password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
