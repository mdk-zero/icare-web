"use client";

import { useEffect, useRef } from "react";
import ChangePasswordForm from "../../../components/ChangePasswordForm";
import { logAuditAction, getCurrentFacultyUser } from "../../../lib/api";

export default function FacultyChangePasswordPage() {
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    const faculty = getCurrentFacultyUser();
    if (faculty) {
      logAuditAction({
        faculty_id: faculty.id,
        faculty_name: faculty.name,
        tab: 'settings',
        action: 'page_view',
        details: 'Navigated to Change Password page',
      });
    }
  }, []);

  return (
    <ChangePasswordForm
      backHref="/faculty/settings"
      backLabel="Back to settings"
      onPasswordChanged={() => {
        const faculty = getCurrentFacultyUser();
        if (faculty) {
          logAuditAction({
            faculty_id: faculty.id,
            faculty_name: faculty.name,
            tab: 'settings',
            action: 'change_password',
            details: 'Changed account password',
          });
        }
      }}
    />
  );
}
