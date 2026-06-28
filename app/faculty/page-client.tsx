"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  fetchFacultyDashboard, 
  fetchFacultyAlerts, 
  fetchFacultyNotifications,
  fetchFacultyStudents,
  FacultyStats, 
  FacultyAlert,
  FacultyNotification,
  AuditLog,
  FacultyStudent
} from "../lib/api";

export default function FacultyDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<FacultyStats | null>(null);
  const [students, setStudents] = useState<FacultyStudent[]>([]);
  const [alerts, setAlerts] = useState<FacultyAlert[]>([]);
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      const [dashboardData, alertsData, studentsData] = await Promise.all([
        fetchFacultyDashboard(),
        fetchFacultyAlerts(),
        fetchFacultyStudents()
      ]);

      if (dashboardData) {
        setStats(dashboardData.stats);
        setActivities(dashboardData.recent_activities);
      }

      if (alertsData) {
        setAlerts(alertsData.alerts.slice(0, 5));
      }

      if (studentsData) {
        setStudents(studentsData.slice(0, 5));
      }

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    if (type.toLowerCase().includes('alert')) {
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    } else if (type.toLowerCase().includes('scenario')) {
      return 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.414 1.414.586 3.414-1.414 3.414H12m8 0h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2';
    }
    return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1B6B7B] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, Faculty!</h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your students today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/faculty/students')}
            className="px-4 py-2.5 bg-[#1B6B7B] text-white rounded-xl font-medium hover:bg-[#145a63] transition-colors shadow-lg shadow-[#1B6B7B]/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            View Students
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{stats?.total_students ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Total Students</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-50 rounded-xl">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{stats?.at_risk_students ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">At-Risk Students</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 rounded-xl">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{stats?.active_alerts ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Active Alerts</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{stats?.active_scenarios ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Active Scenarios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My Students</h2>
              <p className="text-sm text-gray-500 mt-0.5">Students under your supervision</p>
            </div>
            <button 
              onClick={() => router.push('/faculty/students')}
              className="text-sm text-[#1B6B7B] font-medium hover:text-[#145a63] transition-colors"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {students.map((student) => (
              <div 
                key={student.id} 
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/faculty/students/${student.student_id}`)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1B6B7B] to-[#145a63] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{student.name}</p>
                      <p className="text-sm text-gray-500 truncate">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskColor(student.risk_level)}`}>
                      {student.risk_level
                        ? student.risk_level.charAt(0).toUpperCase() + student.risk_level.slice(1)
                        : 'Unknown'} Risk
                    </span>
                    <span className="text-xs text-gray-400">{student.last_activity}</span>
                  </div>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No students assigned yet
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500 mt-0.5">Latest updates and actions</p>
          </div>
          <div className="p-4 space-y-4">
            {activities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getActivityIcon(activity.action)} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.details}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.created_at}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pending Alerts</h2>
            <p className="text-sm text-gray-500 mt-0.5">Alerts requiring your attention</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Alert Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{alert.student_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-gray-600">{alert.alert_type}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-gray-500 text-sm">{alert.created_at}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      alert.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-sm text-[#1B6B7B] font-medium hover:text-[#145a63] transition-colors">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    No pending alerts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}