"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHeartPulse,
  faTriangleExclamation,
  faFlask,
  faPlus,
  faPen,
  faTrash,
  faSpinner,
  faSearch,
  faTimes,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import {
  fetchFacultyPatients,
  createFacultyPatient,
  updateFacultyPatient,
  deleteFacultyPatient,
  FacultyPatient,
} from "../../lib/api";

interface PatientForm {
  name: string;
  age: string;
  gender: string;
  room_number: string;
  diagnosis: string;
  admission_date: string;
  vital_signs: {
    heart_rate: string;
    blood_pressure: string;
    temperature: string;
    respiratory_rate: string;
    oxygen_saturation: string;
  };
  labs: Record<string, string | number | null>;
}

const emptyPatient: PatientForm = {
  name: "",
  age: "",
  gender: "",
  room_number: "",
  diagnosis: "",
  admission_date: new Date().toISOString().slice(0, 16),
  vital_signs: {
    heart_rate: "",
    blood_pressure: "",
    temperature: "",
    respiratory_rate: "",
    oxygen_saturation: "",
  },
  labs: {},
};

export default function FacultyPatientsClient() {
  const [patients, setPatients] = useState<FacultyPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<FacultyPatient | null>(null);
  const [form, setForm] = useState<PatientForm>(emptyPatient);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    const data = await fetchFacultyPatients(search);
    setPatients(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadPatients();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadPatients]);

  const getVitalStatus = (
    value: number | null,
    type: string,
  ): { status: string; color: string } => {
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

  const openAddModal = () => {
    setEditingPatient(null);
    setForm(emptyPatient);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (patient: FacultyPatient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      age: String(patient.age ?? ""),
      gender: patient.gender,
      room_number: patient.room_number,
      diagnosis: patient.diagnosis,
      admission_date: patient.admission_date
        ? new Date(patient.admission_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      vital_signs: {
        heart_rate: patient.vital_signs.heart_rate?.toString() ?? "",
        blood_pressure: patient.vital_signs.blood_pressure ?? "",
        temperature: patient.vital_signs.temperature?.toString() ?? "",
        respiratory_rate: patient.vital_signs.respiratory_rate?.toString() ?? "",
        oxygen_saturation: patient.vital_signs.oxygen_saturation?.toString() ?? "",
      },
      labs: patient.labs || {},
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setForm(emptyPatient);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      age: parseInt(form.age, 10),
      gender: form.gender,
      room_number: form.room_number,
      diagnosis: form.diagnosis,
      admission_date: form.admission_date,
      vital_signs: {
        heart_rate: form.vital_signs.heart_rate ? Number(form.vital_signs.heart_rate) : null,
        blood_pressure: form.vital_signs.blood_pressure || null,
        temperature: form.vital_signs.temperature ? Number(form.vital_signs.temperature) : null,
        respiratory_rate: form.vital_signs.respiratory_rate
          ? Number(form.vital_signs.respiratory_rate)
          : null,
        oxygen_saturation: form.vital_signs.oxygen_saturation
          ? Number(form.vital_signs.oxygen_saturation)
          : null,
      },
      labs: form.labs,
    };

    let result;
    if (editingPatient) {
      result = await updateFacultyPatient(editingPatient.id, payload);
    } else {
      result = await createFacultyPatient(payload);
    }

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await loadPatients();
    setSaving(false);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient record?")) return;
    setDeletingId(id);
    const result = await deleteFacultyPatient(id);
    if (result.error) {
      alert(result.error);
    } else {
      await loadPatients();
    }
    setDeletingId(null);
  };

  const updateFormField = (field: keyof PatientForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateVitalField = (field: keyof PatientForm["vital_signs"], value: string) => {
    setForm((prev) => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [field]: value,
      },
    }));
  };

  const criticalCount = patients.filter((p) => {
    const vitals = p.vital_signs;
    const hr = vitals.heart_rate ?? 0;
    const temp = vitals.temperature ?? 0;
    const rr = vitals.respiratory_rate ?? 0;
    const spo2 = vitals.oxygen_saturation ?? 100;
    return hr > 100 || temp > 37.5 || rr > 20 || spo2 < 95;
  }).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Patient Records</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            MIMIC-IV Demo
          </span>
        </div>
        <p className="text-gray-500">
          View and manage patient cases with clinical decision support
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B6B7B]/10 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-[#1B6B7B]" />
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
              <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{criticalCount}</p>
              <p className="text-xs text-gray-500">Critical Vitals</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faFlask} className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {patients.filter((p) => Object.keys(p.labs || {}).length > 0).length}
              </p>
              <p className="text-xs text-gray-500">Lab Results Available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search patients, diagnosis, MIMIC ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
          />
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B6B7B] hover:bg-[#145a68] text-white text-sm font-medium rounded-xl transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Add Patient
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#1B6B7B] animate-spin" />
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <FontAwesomeIcon icon={faUsers} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No patients found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {search
              ? "Try adjusting your search terms."
              : "Seed MIMIC-IV Demo data with npm run db:seed:mimic-demo."}
          </p>
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
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => {
                  const hrStatus = getVitalStatus(patient.vital_signs.heart_rate, "heart_rate");
                  const tempStatus = getVitalStatus(
                    patient.vital_signs.temperature,
                    "temperature",
                  );
                  const rrStatus = getVitalStatus(
                    patient.vital_signs.respiratory_rate,
                    "respiratory_rate",
                  );
                  const spo2Status = getVitalStatus(
                    patient.vital_signs.oxygen_saturation,
                    "oxygen_saturation",
                  );

                  return (
                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{patient.name}</p>
                            <p className="text-sm text-gray-500">
                              {patient.age}yo {patient.gender}
                            </p>
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
                      <td className="py-4 px-6 text-gray-600">
                        {patient.vital_signs.blood_pressure || "—"}
                      </td>
                      <td className={`py-4 px-6 font-medium ${tempStatus.color}`}>
                        {patient.vital_signs.temperature !== null
                          ? `${patient.vital_signs.temperature}°C`
                          : "—"}
                      </td>
                      <td className={`py-4 px-6 font-medium ${rrStatus.color}`}>
                        {patient.vital_signs.respiratory_rate ?? "—"}
                      </td>
                      <td className={`py-4 px-6 font-medium ${spo2Status.color}`}>
                        {patient.vital_signs.oxygen_saturation !== null
                          ? `${patient.vital_signs.oxygen_saturation}%`
                          : "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs text-gray-500 font-mono">{patient.mimic_id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(patient)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit patient"
                          >
                            <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            disabled={deletingId === patient.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete patient"
                          >
                            {deletingId === patient.id ? (
                              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                            ) : (
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPatient ? "Edit Patient" : "Add Patient"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name || ""}
                    onChange={(e) => updateFormField("name", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    required
                    value={form.gender || ""}
                    onChange={(e) => updateFormField("gender", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="U">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    required
                    type="number"
                    min={0}
                    max={150}
                    value={form.age ?? ""}
                    onChange={(e) => updateFormField("age", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={form.room_number || ""}
                    onChange={(e) => updateFormField("room_number", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diagnosis
                  </label>
                  <input
                    required
                    type="text"
                    value={form.diagnosis || ""}
                    onChange={(e) => updateFormField("diagnosis", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admission Date
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={form.admission_date || ""}
                    onChange={(e) => updateFormField("admission_date", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faHeartPulse} className="w-4 h-4 text-red-500" />
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={form.vital_signs?.heart_rate ?? ""}
                      onChange={(e) => updateVitalField("heart_rate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={form.vital_signs?.blood_pressure || ""}
                      onChange={(e) => updateVitalField("blood_pressure", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.vital_signs?.temperature ?? ""}
                      onChange={(e) => updateVitalField("temperature", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Respiratory Rate
                    </label>
                    <input
                      type="number"
                      value={form.vital_signs?.respiratory_rate ?? ""}
                      onChange={(e) => updateVitalField("respiratory_rate", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      SpO2 (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.vital_signs?.oxygen_saturation ?? ""}
                      onChange={(e) => updateVitalField("oxygen_saturation", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/20 focus:border-[#1B6B7B] text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B6B7B] hover:bg-[#145a68] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {saving && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
                  <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
