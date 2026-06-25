"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAuditTrail, logAuditAction, clearAuditTrail, getCurrentFacultyUser, AuditLog } from "../../lib/api";

export default function FacultyAuditClient() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const loggedRef = useRef(false);

  useEffect(() => {
    loadAuditTrail();
  }, [actionFilter]);

  useEffect(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    const faculty = getCurrentFacultyUser();
    if (faculty) {
      logAuditAction({
        faculty_id: faculty.id,
        faculty_name: faculty.name,
        tab: 'audit',
        action: 'page_view',
        details: 'Navigated to Audit Trail tab',
      });
    }
  }, []);

  const handleClearAll = async () => {
    setClearing(true);
    const { success } = await clearAuditTrail();
    if (success) {
      setAuditLogs([]);
    }
    setClearing(false);
    setShowClearConfirm(false);
  };

  const loadAuditTrail = async () => {
    setLoading(true);
    const action = actionFilter !== "all" ? actionFilter : undefined;
    const data = await fetchAuditTrail(action);
    setAuditLogs(data);
    setLoading(false);
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTabColor = (tab: string) => {
    const t = tab.toLowerCase();
    if (t === 'students' || t === 'student_detail') return 'bg-blue-50 text-blue-700';
    if (t === 'scenarios') return 'bg-purple-50 text-purple-700';
    if (t === 'reports') return 'bg-blue-50 text-blue-700';
    if (t === 'notifications') return 'bg-amber-50 text-amber-700';
    if (t === 'settings') return 'bg-gray-50 text-gray-700';
    if (t === 'overview') return 'bg-emerald-50 text-emerald-700';
    if (t === 'analytics') return 'bg-indigo-50 text-indigo-700';
    if (t === 'patients') return 'bg-rose-50 text-rose-700';
    if (t === 'audit') return 'bg-cyan-50 text-cyan-700';
    return 'bg-gray-50 text-gray-700';
  };

  const getActionColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('alert')) return 'bg-red-50 text-red-700';
    if (lowerAction.includes('scenario')) return 'bg-purple-50 text-purple-700';
    if (lowerAction.includes('report')) return 'bg-blue-50 text-blue-700';
    if (lowerAction.includes('review')) return 'bg-emerald-50 text-emerald-700';
    return 'bg-gray-50 text-gray-700';
  };

  const getActionIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('alert')) {
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    } else if (lowerAction.includes('scenario')) {
      return 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.414 1.414.586 3.414-1.414 3.414H12m8 0h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2';
    } else if (lowerAction.includes('report')) {
      return 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    } else if (lowerAction.includes('reviewed')) {
      return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4';
    }
    return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Trail</h1>
        <p className="text-gray-500">Complete history of all faculty activities and interactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B6B7B]/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1B6B7B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{auditLogs.length}</p>
              <p className="text-xs text-gray-500">Total Activities</p>
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
              <p className="text-2xl font-bold text-gray-800">{auditLogs.filter(a => a.action.toLowerCase().includes('alert')).length}</p>
              <p className="text-xs text-gray-500">Alert Activities</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.414 1.414.586 3.414-1.414 3.414H12m8 0h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{auditLogs.filter(a => a.action.toLowerCase().includes('scenario')).length}</p>
              <p className="text-xs text-gray-500">Scenario Activities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B6B7B]/50 focus:border-[#1B6B7B] transition-all cursor-pointer"
        >
          <option value="all">All Actions</option>
          <option value="alert">Alerts</option>
          <option value="scenario">Scenarios</option>
          <option value="report">Reports</option>
          <option value="review">Reviews</option>
        </select>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All Trails
        </button>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
            <div className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Clear All Audit Trails?</h3>
              </div>
              <p className="text-gray-600 text-sm">
                This will permanently delete all audit log entries. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {clearing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Clearing...
                  </>
                ) : (
                  'Yes, Clear All'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Tab</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Action</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Details</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Faculty</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-5 w-16 bg-gray-200 rounded-lg" /></td>
                    <td className="py-4 px-6"><div className="h-6 w-24 bg-gray-200 rounded-full" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full" />
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getTabColor(log.tab)}`}>
                        {log.tab.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getActionIcon(log.action)} />
                        </svg>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{log.details}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                          {log.faculty_name.charAt(0)}
                        </div>
                        <span className="text-gray-800">{log.faculty_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{formatTimestamp(log.created_at)}</td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}