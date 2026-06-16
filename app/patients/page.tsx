"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
}

function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('icare_user');
  return userStr ? JSON.parse(userStr) : null;
}

function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('icare_user');
    localStorage.removeItem('icare_token');
    void fetch('/api/auth/logout', { method: 'POST' });
  }
}

function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('icare_token') === 'logged_in';
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  room_number: string;
  diagnosis: string;
  vital_signs: {
    heart_rate: number | null;
    blood_pressure: string | null;
    temperature: number | null;
    respiratory_rate: number | null;
    oxygen_saturation: number | null;
  };
}

const patients: Patient[] = [
  {
    id: "1",
    name: "Juan dela Cruz",
    age: 45,
    gender: "Male",
    room_number: "Room 101",
    diagnosis: "Hypertension",
    vital_signs: { heart_rate: 72, blood_pressure: "140/90", temperature: 36.5, respiratory_rate: 16, oxygen_saturation: 98 },
  },
  {
    id: "2",
    name: "Maria Santos",
    age: 32,
    gender: "Female",
    room_number: "Room 102",
    diagnosis: "Post-operative care",
    vital_signs: { heart_rate: 80, blood_pressure: "120/80", temperature: 37.0, respiratory_rate: 18, oxygen_saturation: 97 },
  },
  {
    id: "3",
    name: "Pedro Garcia",
    age: 58,
    gender: "Male",
    room_number: "Room 103",
    diagnosis: "Diabetes Type 2",
    vital_signs: { heart_rate: 76, blood_pressure: "130/85", temperature: 36.8, respiratory_rate: 15, oxygen_saturation: 96 },
  },
  {
    id: "4",
    name: "Ana Reyes",
    age: 28,
    gender: "Female",
    room_number: "Room 104",
    diagnosis: "Prenatal care",
    vital_signs: { heart_rate: 78, blood_pressure: "110/70", temperature: 36.6, respiratory_rate: 16, oxygen_saturation: 99 },
  },
  {
    id: "5",
    name: "Carlos Mendoza",
    age: 65,
    gender: "Male",
    room_number: "Room 105",
    diagnosis: "Pneumonia",
    vital_signs: { heart_rate: 88, blood_pressure: "125/82", temperature: 38.2, respiratory_rate: 22, oxygen_saturation: 94 },
  },
];

export default function PatientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const getVitalStatus = (vital: number | null, type: string): { status: string; color: string } => {
    if (vital === null) return { status: "N/A", color: "text-gray-400" };
    
    const ranges: Record<string, { low: number; high: number }> = {
      heart_rate: { low: 60, high: 100 },
      temperature: { low: 36.1, high: 37.2 },
      respiratory_rate: { low: 12, high: 20 },
      oxygen_saturation: { low: 95, high: 100 },
    };
    
    const range = ranges[type];
    if (!range) return { status: "Normal", color: "text-green-600" };
    
    if (vital < range.low) return { status: "Low", color: "text-yellow-600" };
    if (vital > range.high) return { status: "High", color: "text-red-600" };
    return { status: "Normal", color: "text-green-600" };
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-[#1B6B7B] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold">iCARE++</h1>
          <p className="text-sm text-white/70">Student Portal</p>
        </div>
        
        <nav className="flex-1 p-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 bg-white/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Patients
          </button>
          <button
            onClick={() => router.push("/quizzes")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Quizzes
          </button>
          <button
            onClick={() => router.push("/performance")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance
          </button>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-white/70">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Patient Records (Simulated EHR)</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Patient</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Room</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Diagnosis</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">HR (bpm)</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">BP (mmHg)</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Temp (°C)</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">RR</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">SpO2 (%)</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        selectedPatient?.id === patient.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.age}yo {patient.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{patient.room_number}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {patient.diagnosis}
                        </span>
                      </td>
                      <td className={`py-4 px-6 font-medium ${getVitalStatus(patient.vital_signs.heart_rate, 'heart_rate').color}`}>
                        {patient.vital_signs.heart_rate ?? "—"}
                      </td>
                      <td className="py-4 px-6 text-gray-600">{patient.vital_signs.blood_pressure ?? "—"}</td>
                      <td className={`py-4 px-6 font-medium ${getVitalStatus(patient.vital_signs.temperature, 'temperature').color}`}>
                        {patient.vital_signs.temperature ?? "—"}
                      </td>
                      <td className={`py-4 px-6 font-medium ${getVitalStatus(patient.vital_signs.respiratory_rate, 'respiratory_rate').color}`}>
                        {patient.vital_signs.respiratory_rate ?? "—"}
                      </td>
                      <td className={`py-4 px-6 font-medium ${getVitalStatus(patient.vital_signs.oxygen_saturation, 'oxygen_saturation').color}`}>
                        {patient.vital_signs.oxygen_saturation ?? "—"}%
                      </td>
                      <td className="py-4 px-6">
                        <button className="text-[#1B6B7B] hover:underline text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-blue-800">Clinical Information</p>
                <p className="text-sm text-blue-600/70">
                  Patient data is simulated for educational purposes. Vital signs in red indicate abnormal values requiring attention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}