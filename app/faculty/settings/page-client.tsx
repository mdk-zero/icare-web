"use client";

import ProfileEditor from "../../components/ProfileEditor";

export default function FacultySettingsClient() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Settings</h1>
        <p className="text-gray-500">Manage your profile and account security</p>
      </div>
      <ProfileEditor changePasswordHref="/faculty/settings/change-password" />
    </div>
  );
}
