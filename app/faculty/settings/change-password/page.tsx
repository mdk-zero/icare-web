"use client";

import ChangePasswordForm from "../../../components/ChangePasswordForm";

export default function FacultyChangePasswordPage() {
  return (
    <ChangePasswordForm
      backHref="/faculty/settings"
      backLabel="Back to settings"
    />
  );
}
