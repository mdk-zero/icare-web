"use client";

import { useState, useEffect, useRef } from "react";
import { fetchFacultyScenarios, createScenario, generateAIScenario, SimulationScenario, fetchFacultyStudents, FacultyStudent, assignScenarioToStudents, logAuditAction, getCurrentFacultyUser } from "../../lib/api";

export default function FacultyScenariosClient() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [students, setStudents] = useState<FacultyStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignDeadline, setAssignDeadline] = useState("");
  const [assignRequired, setAssignRequired] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    const faculty = getCurrentFacultyUser();
    if (faculty) {
      logAuditAction({
        faculty_id: faculty.id,
        faculty_name: faculty.name,
        tab: 'scenarios',
        action: 'page_view',
        details: 'Navigated to Scenarios tab',
      });
    }
  }, []);

  useEffect(() => {
    loadScenarios();
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await fetchFacultyStudents();
    setStudents(data);
  };

  const loadScenarios = async () => {
    setLoading(true);
    const data = await fetchFacultyScenarios();
    setScenarios(data);
    setLoading(false);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    const newScenario = await generateAIScenario(aiPrompt);
    if (newScenario) {
      setScenarios([...scenarios, newScenario]);
      const faculty = getCurrentFacultyUser();
      if (faculty) {
        logAuditAction({
          faculty_id: faculty.id,
          faculty_name: faculty.name,
          tab: 'scenarios',
          action: 'ai_generate_scenario',
          details: `AI generated scenario: ${newScenario.title}`,
          target_type: 'scenario',
          target_id: newScenario.id,
          metadata: { scenario_title: newScenario.title },
        });
      }
    }
    setGenerating(false);
    setShowAIModal(false);
    setAiPrompt("");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced': return 'bg-red-100 text-red-700';
      case 'intermediate': return 'bg-amber-100 text-amber-700';
      case 'beginner': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewDetails = (scenario: SimulationScenario) => {
    setSelectedScenario(scenario);
    setShowDetailsModal(true);
  };

  const handleOpenAssignModal = (scenario: SimulationScenario) => {
    setSelectedScenario(scenario);
    setSelectedStudents([]);
    setAssignDeadline("");
    setAssignRequired(false);
    setShowAssignModal(true);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignScenario = async () => {
    if (!selectedScenario || selectedStudents.length === 0 || !assignDeadline) return;
    
    await assignScenarioToStudents(
      selectedScenario.id,
      selectedStudents,
      assignDeadline,
      assignRequired
    );
    
    alert(`Scenario "${selectedScenario.title}" assigned to ${selectedStudents.length} student(s)`);
    const faculty = getCurrentFacultyUser();
    if (faculty) {
      logAuditAction({
        faculty_id: faculty.id,
        faculty_name: faculty.name,
        tab: 'scenarios',
        action: 'assign_scenario',
        details: `Assigned scenario "${selectedScenario.title}" to ${selectedStudents.length} student(s)`,
        target_type: 'scenario',
        target_id: selectedScenario.id,
        metadata: { scenario_title: selectedScenario.title, student_count: selectedStudents.length, required: assignRequired },
      });
    }
    setShowAssignModal(false);
    setSelectedScenario(null);
    setSelectedStudents([]);
    setStudentSearchQuery("");
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulation Scenarios</h1>
          <p className="text-gray-500">Manage clinical simulation scenarios for student training</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B6B7B]/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1B6B7B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.414 1.414.586 3.414-1.414 3.414H12m8 0h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{scenarios.length}</p>
              <p className="text-xs text-gray-500">Total Scenarios</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{scenarios.filter(s => s.is_ai_generated).length}</p>
              <p className="text-xs text-gray-500">AI Generated</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{scenarios.reduce((sum, s) => sum + s.student_count, 0)}</p>
              <p className="text-xs text-gray-500">Students Assigned</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#1B6B7B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#1B6B7B]/30 transition-all duration-300 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{scenario.title}</h3>
                  {scenario.is_ai_generated && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{scenario.description}</p>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">{scenario.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{scenario.student_count} students</span>
                  <span className="text-gray-400">{scenario.created_at}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => handleViewDetails(scenario)}
                    className="flex-1 text-center text-[#1B6B7B] font-medium hover:text-[#145a63] transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleOpenAssignModal(scenario)}
                    className="flex-1 text-center text-[#1B6B7B] font-medium hover:text-[#145a63] transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Scenario Generator</h3>
            <p className="text-sm text-gray-500 mb-4">Describe the clinical scenario you want to generate. The AI will create a patient case based on your description.</p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., A 55-year-old male with chest pain and shortness of breath..."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B6B7B] focus:border-[#1B6B7B] resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAI}
                disabled={generating || !aiPrompt.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && selectedScenario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedScenario.title}</h2>
                    {selectedScenario.is_ai_generated && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Generated
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">{selectedScenario.description}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedScenario.difficulty)}`}>
                  {selectedScenario.difficulty}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  {selectedScenario.category}
                </span>
                <span className="text-sm text-gray-500">{selectedScenario.student_count} students</span>
                <span className="text-sm text-gray-400">Created: {selectedScenario.created_at}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Case</h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  {selectedScenario.patient_case ? (
                    <div className="space-y-4">
                      {selectedScenario.patient_case.chief_complaint && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Chief Complaint</p>
                          <p className="text-gray-800">{selectedScenario.patient_case.chief_complaint}</p>
                        </div>
                      )}
                      {selectedScenario.patient_case.vitals && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">Vital Signs</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Object.entries(selectedScenario.patient_case.vitals).map(([key, value]) => (
                              <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                                <p className="font-semibold text-gray-800">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedScenario.patient_case.medical_history && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Medical History</p>
                          <p className="text-gray-800">{selectedScenario.patient_case.medical_history}</p>
                        </div>
                      )}
                      {selectedScenario.patient_case.physical_exam && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Physical Examination</p>
                          <p className="text-gray-800">{selectedScenario.patient_case.physical_exam}</p>
                        </div>
                      )}
                      {selectedScenario.patient_case.diagnosis && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Diagnosis</p>
                          <p className="text-gray-800">{selectedScenario.patient_case.diagnosis}</p>
                        </div>
                      )}
                      {selectedScenario.patient_case.treatment_plan && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Treatment Plan</p>
                          <p className="text-gray-800">{selectedScenario.patient_case.treatment_plan}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No patient case details available</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Objectives</h3>
                <ul className="space-y-2">
                  {selectedScenario.learning_objectives && selectedScenario.learning_objectives.length > 0 ? (
                    selectedScenario.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#1B6B7B]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-sm font-medium text-[#1B6B7B]">{index + 1}</span>
                        </div>
                        <p className="text-gray-700">{objective}</p>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No learning objectives defined</p>
                  )}
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-white transition-all"
                >
                  Close
                </button>
                <button className="px-4 py-2.5 bg-[#1B6B7B] text-white rounded-xl font-medium hover:bg-[#145a63] transition-all">
                  Start Simulation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAssignModal && selectedScenario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Assign Scenario</h2>
                  <p className="text-gray-500 mt-1">{selectedScenario.title}</p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Assignment Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                    <input
                      type="date"
                      value={assignDeadline}
                      onChange={(e) => setAssignDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B6B7B] focus:border-[#1B6B7B]"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignRequired}
                        onChange={(e) => setAssignRequired(e.target.checked)}
                        className="w-4 h-4 text-[#1B6B7B] rounded focus:ring-[#1B6B7B]"
                      />
                      <span className="text-sm font-medium text-gray-700">Required for all students</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Select Students</h3>
                  <button
                    onClick={() => setSelectedStudents(filteredStudents.map(s => s.id))}
                    className="text-sm text-[#1B6B7B] hover:text-[#145a63]"
                  >
                    Select All
                  </button>
                </div>
                <div className="mb-3">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B6B7B] focus:border-[#1B6B7B]"
                    />
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl max-h-[250px] overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {studentSearchQuery ? "No students match your search" : "No students available"}
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Select</th>
                          <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Name</th>
                          <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Email</th>
                          <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => toggleStudentSelection(student.id)}
                                className="w-4 h-4 text-[#1B6B7B] rounded focus:ring-[#1B6B7B]"
                              />
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-800">{student.name}</td>
                            <td className="py-2 px-4 text-sm text-gray-500">{student.email}</td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                student.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                                student.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {student.risk_level}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">{selectedStudents.length} student(s) selected</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignScenario}
                  disabled={selectedStudents.length === 0 || !assignDeadline}
                  className="px-4 py-2.5 bg-[#1B6B7B] text-white rounded-xl font-medium hover:bg-[#145a63] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign to {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}