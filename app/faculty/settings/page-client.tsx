"use client";

import ProfileEditor from "../../components/ProfileEditor";
import { logAuditAction, getCurrentFacultyUser } from "../../lib/api";

export default function FacultySettingsClient() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Settings</h1>
        <p className="text-gray-500">Manage your profile and account security</p>
      </div>
      <ProfileEditor
        changePasswordHref="/faculty/settings/change-password"
        onUserUpdate={(user) => {
          const faculty = getCurrentFacultyUser();
          if (faculty) {
            logAuditAction({
              faculty_id: faculty.id,
              faculty_name: faculty.name,
              tab: 'settings',
              action: 'update_profile',
              details: `Updated profile to ${user.name}`,
            });
          }
        }}
      />
    </div>
  );
}
