"use client";

import { useState, useEffect } from "react";
import { fetchFacultyPatients, FacultyPatient } from "../../lib/api";

export default function FacultyPatientsClient() {
  const [patients, setPatients] = useState<FacultyPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<FacultyPatient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    const data = await fetchFacultyPatients();
    setPatients(data);
    setLoading(false);
  };

  const getVitalStatus = (value: number | null, type: string): { status: string; color: string } => {
    if (value === null) return { status: "N/A", color: "text-gray-400" };
    
    const ranges: Record<string, { min: number; max: number }> = {
      heart_rate: { min: 60, max: 100 },
      temperature: { min: 36.1, max: 37.2 },
      respiratory_rate: { min: 12, max: 20 },
      oxygen_saturation: { min: 95, max: 100 },
    };
    
    const range = ranges[type];
    if (!range) return { status: "Normal", color: "text-gray-600" };
    
    if (value < range.min) return { status: "Low", color: "text-amber-600" };
    if (value > range.max) return { status: "High", color: "text-red-600" };
    return { status: "Normal", color: "text-emerald-600" };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Patient Records</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            MIMIC-III Data
          </span>
        </div>
        <p className="text-gray-500">View patient cases with clinical decision support</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B6B7B]/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1B6B7B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{patients.length}</p>
              <p className="text-xs text-gray-500">Total Patients</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{patients.filter(p => {
                const vitals = p.vital_signs;
                return vitals.heart_rate > 100 || vitals.temperature > 37.5 || vitals.respiratory_rate > 20;
              }).length}</p>
              <p className="text-xs text-gray-500">Critical Vitals</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{patients.length}</p>
              <p className="text-xs text-gray-500">Lab Results Available</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#1B6B7B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Patient</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Room</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Diagnosis</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">HR</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">BP</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Temp</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">RR</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">SpO2</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">MIMIC ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => {
                  const hrStatus = getVitalStatus(patient.vital_signs.heart_rate, 'heart_rate');
                  const tempStatus = getVitalStatus(patient.vital_signs.temperature, 'temperature');
                  const rrStatus = getVitalStatus(patient.vital_signs.respiratory_rate, 'respiratory_rate');
                  const spo2Status = getVitalStatus(patient.vital_signs.oxygen_saturation, 'oxygen_saturation');
                  
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{patient.name}</p>
                            <p className="text-sm text-gray-500">{patient.age}yo {patient.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{patient.room_number}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {patient.diagnosis}
                        </span>
                      </td>
                      <td className={`py-4 px-6 font-medium ${hrStatus.color}`}>
                        {patient.vital_signs.heart_rate ?? "—"}
                      </td>
                      <td className="py-4 px-6 text-gray-600">{patient.vital_signs.blood_pressure}</td>
                      <td className={`py-4 px-6 font-medium ${tempStatus.color}`}>
                        {patient.vital_signs.temperature}°C
                      </td>
                      <td className={`py-4 px-6 font-medium ${rrStatus.color}`}>
                        {patient.vital_signs.respiratory_rate}
                      </td>
                      <td className={`py-4 px-6 font-medium ${spo2Status.color}`}>
                        {patient.vital_signs.oxygen_saturation}%
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs text-gray-500 font-mono">{patient.mimic_id}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}