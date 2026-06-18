import { Suspense } from "react";
import StudentShell from "./StudentShell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#1B6B7B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudentShell>{children}</StudentShell>
    </Suspense>
  );
}
