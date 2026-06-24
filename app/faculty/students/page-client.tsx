"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchFacultyStudents, createFacultyStudent, fetchAllStudentUsers, updateStudentUser, deleteStudentUser, FacultyStudent, StudentUser } from "../../lib/api";

export default function FacultyStudentsClient() {
  const router = useRouter();
  const [students, setStudents] = useState<FacultyStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [studentUsers, setStudentUsers] = useState<StudentUser[]>([]);
  const [loadingStudentUsers, setLoadingStudentUsers] = useState(true);

  useEffect(() => {
    loadStudents();
    loadStudentUsers();
  }, [riskFilter, searchQuery]);

  const loadStudents = async () => {
    setLoading(true);
    const data = await fetchFacultyStudents(riskFilter, searchQuery);
    setStudents(data);
    setLoading(false);
  };

  const loadStudentUsers = async () => {
    setLoadingStudentUsers(true);
    const data = await fetchAllStudentUsers();
    setStudentUsers(data);
    setLoadingStudentUsers(false);
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const newEmailRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingStudent, setUpdatingStudent] = useState<StudentUser | null>(null);
  const [updateName, setUpdateName] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const updateEmailRef = useRef<HTMLInputElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const firstNameTrimmed = firstName.trim();
    const middleInitialTrimmed = middleInitial.trim();
    const lastNameTrimmed = lastName.trim();
    const emailTrimmed = (newEmailRef.current?.value ?? newEmail).trim();

    if (!firstNameTrimmed) {
      setMessage({ type: "error", text: "First name is required" });
      return;
    }

    if (!lastNameTrimmed) {
      setMessage({ type: "error", text: "Last name is required" });
      return;
    }

    if (!emailTrimmed) {
      setMessage({ type: "error", text: "Student email is required" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    const duplicateEmail = students.some(s => s.email.toLowerCase() === emailTrimmed.toLowerCase());
    if (duplicateEmail) {
      setMessage({ type: "warning", text: "A student with this email already exists" });
      return;
    }

    const fullName = middleInitialTrimmed
      ? `${firstNameTrimmed} ${middleInitialTrimmed} ${lastNameTrimmed}`
      : `${firstNameTrimmed} ${lastNameTrimmed}`;

    setIsSubmitting(true);

    try {
      const { data, error } = await createFacultyStudent(fullName, emailTrimmed);

      if (error) {
        setMessage({ type: "error", text: error });
        return;
      }

      if (data?.warning) {
        setMessage({ type: "warning", text: `${data.student.name} has been created. ${data.warning}` });
      } else {
        setMessage({ type: "success", text: `${data!.student.name} has been invited successfully!` });
      }

      setCreatedPassword(data?.password ?? null);
      setFirstName("");
      setMiddleInitial("");
      setLastName("");
      setNewEmail("");
      if (newEmailRef.current) newEmailRef.current.value = "";
      loadStudents();
      loadStudentUsers();
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingStudent) return;

    const nameTrimmed = updateName.trim();
    const emailTrimmed = (updateEmailRef.current?.value ?? updateEmail).trim();

    if (!nameTrimmed) {
      setMessage({ type: "error", text: "Student name is required" });
      return;
    }

    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setIsUpdating(true);

    try {
      const { data, error } = await updateStudentUser(updatingStudent.id, nameTrimmed, emailTrimmed);

      if (error) {
        setMessage({ type: "error", text: error });
        return;
      }

      setMessage({ type: "success", text: `${data!.name} has been updated successfully!` });
      setShowUpdateModal(false);
      setUpdatingStudent(null);
      loadStudentUsers();
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;

    setIsDeleting(true);

    try {
      const { error } = await deleteStudentUser(deletingStudent.id);

      if (error) {
        setMessage({ type: "error", text: error });
        return;
      }

      setMessage({ type: "success", text: `${deletingStudent.name} has been deleted successfully!` });
      setShowDeleteModal(false);
      setDeletingStudent(null);
      loadStudentUsers();
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsDeleting(false);
    }
  };

  const openUpdateModal = (student: StudentUser) => {
    setUpdatingStudent(student);
    setUpdateName(student.name);
    setUpdateEmail(student.email);
    if (updateEmailRef.current) updateEmailRef.current.value = student.email;
    setShowUpdateModal(true);
    setMessage(null);
  };

  const openDeleteModal = (student: StudentUser) => {
    setDeletingStudent(student);
    setShowDeleteModal(true);
    setMessage(null);
  };
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const filteredStudents = students.filter(student => 
    searchQuery === "" || 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentUsers = studentUsers.filter(user =>
    searchQuery === "" ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Students</h1>
        <p className="text-gray-500">Manage and monitor students under your supervision</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#1B6B7B]/30 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B6B7B]/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1B6B7B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-red-200 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{students.filter(s => s.risk_level === 'high').length}</p>
              <p className="text-xs text-gray-500">High Risk</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{students.filter(s => s.risk_level === 'medium').length}</p>
              <p className="text-xs text-gray-500">Medium Risk</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setShowCreateModal(true); setMessage(null); setCreatedPassword(null); setCopiedPassword(false); if (newEmailRef.current) newEmailRef.current.value = ""; }}
            className="px-4 py-2.5 bg-[#1B6B7B] text-white font-medium rounded-xl hover:bg-[#145A63] transition-all flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register Student
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all w-64"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#1B6B7B]/30 transition-all duration-300 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-[#1B6B7B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Student</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Program</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Avg Score</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Quizzes</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Risk Level</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/faculty/students/${student.student_id}`)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1B6B7B]/10 rounded-full flex items-center justify-center text-[#1B6B7B] font-semibold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {student.program} - Year {student.year}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${getScoreColor(student.average_score)}`}>
                        {student.average_score}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{student.quiz_count}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(student.risk_level)}`}>
                        {student.risk_level.charAt(0).toUpperCase() + student.risk_level.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{student.last_activity}</td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">Create New Student</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFirstName("");
                  setMiddleInitial("");
                  setLastName("");
                  setNewEmail("");
                  if (newEmailRef.current) newEmailRef.current.value = "";
                  setMessage(null);
                  setCreatedPassword(null);
                  setCopiedPassword(false);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-7 space-y-6 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={middleInitial}
                        onChange={(e) => setMiddleInitial(e.target.value)}
                        placeholder="M.I."
                        maxLength={3}
                        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="new-student-email" className="block text-sm font-medium text-gray-700 mb-3">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="new-student-email"
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    ref={newEmailRef}
                    defaultValue={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="@batstate-u.edu.ph"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all"
                  />
                </div>
              </div>

              {message && showCreateModal && (
                <div className={`p-3 rounded-lg text-sm border ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : message.type === "warning"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {message.text}
                </div>
              )}

              {createdPassword && (
                <div className="p-4 rounded-xl border border-[#1B6B7B]/20 bg-[#1B6B7B]/5">
                  <p className="text-sm font-medium text-[#1B6B7B] mb-2">
                    Temporary password for {firstName ? `${firstName} ` : ""}{lastName}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdPassword}
                      className="flex-1 px-3 py-2 bg-white border border-[#1B6B7B]/20 rounded-lg text-sm font-mono text-gray-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createdPassword);
                        setCopiedPassword(true);
                        setTimeout(() => setCopiedPassword(false), 2000);
                      }}
                      className="px-3 py-2 text-sm font-medium text-[#1B6B7B] bg-white border border-[#1B6B7B]/20 rounded-lg hover:bg-[#1B6B7B]/10 transition-all"
                    >
                      {copiedPassword ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-[#1B6B7B]/70 mt-2">
                    This password has been emailed to the student. They will be asked to change it on first login.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFirstName("");
                    setMiddleInitial("");
                    setLastName("");
                    setNewEmail("");
                    setMessage(null);
                    setCreatedPassword(null);
                    setCopiedPassword(false);
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#1B6B7B] text-white font-medium rounded-xl hover:bg-[#145A63] transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Student"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Accounts</h2>
          <p className="text-gray-500">All registered users with the student role</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#1B6B7B]/30 transition-all duration-300 overflow-hidden">
          {loadingStudentUsers ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Student</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Role</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
                          <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Student</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Role</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1B6B7B]/10 rounded-full flex items-center justify-center text-[#1B6B7B] font-semibold">
                            {user.name?.charAt(0) || "?"}
                          </div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#1B6B7B]/10 text-[#1B6B7B] border border-[#1B6B7B]/20">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUpdateModal(user)}
                            className="px-3 py-1.5 text-xs font-medium text-[#1B6B7B] bg-[#1B6B7B]/10 hover:bg-[#1B6B7B]/20 rounded-lg transition-all"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudentUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        No student accounts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showUpdateModal && updatingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Update Student</h2>
              <button
                onClick={() => { setShowUpdateModal(false); setUpdatingStudent(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateStudent} className="p-7 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={updateName}
                    onChange={(e) => setUpdateName(e.target.value)}
                    placeholder="Full name"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="update-student-email" className="block text-sm font-medium text-gray-700 mb-3">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="update-student-email"
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    ref={updateEmailRef}
                    defaultValue={updateEmail}
                    onChange={(e) => setUpdateEmail(e.target.value)}
                    placeholder="student@example.edu"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowUpdateModal(false); setUpdatingStudent(null); }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-[#1B6B7B] text-white font-medium rounded-xl hover:bg-[#145A63] transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Student"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Delete Student</h2>
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingStudent(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-7">
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{deletingStudent.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeletingStudent(null); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Student"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}