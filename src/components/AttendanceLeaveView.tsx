import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  QrCode,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowRight,
  User,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Attendance, LeaveRequest, Employee } from '../types';

interface AttendanceLeaveViewProps {
  state: {
    attendance: Attendance[];
    leaves: LeaveRequest[];
    employees: Employee[];
  };
  currentUser: { id: string; fullName: string; role: string };
  isRtl: boolean;
  onRefresh: () => void;
}

export default function AttendanceLeaveView({ state, currentUser, isRtl, onRefresh }: AttendanceLeaveViewProps) {
  const { attendance, leaves, employees } = state;
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'leaves'>('attendance');
  const [method, setMethod] = useState<'Web' | 'GPS' | 'QR'>('Web');
  const [leaveType, setLeaveType] = useState<'Annual Leave' | 'Sick Leave' | 'Emergency Leave' | 'Unpaid Leave' | 'Business Leave'>('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated GPS Locations
  const gpsSites = [
    { name: 'NEOM Sector 4 Construction Site', lat: 28.1123, lng: 35.1234 },
    { name: 'Riyadh Metro Line 7 Linkway', lat: 24.7136, lng: 46.6753 },
    { name: 'Jeddah Cargo Terminal base', lat: 21.4858, lng: 39.1925 }
  ];
  const [selectedGps, setSelectedGps] = useState(gpsSites[0]);

  // Attendance simulation submission
  const handleCheckInOut = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        employeeId: currentUser.id,
        employeeName: currentUser.fullName,
        method,
        lat: method === 'GPS' ? selectedGps.lat : undefined,
        lng: method === 'GPS' ? selectedGps.lng : undefined,
        locationName: method === 'GPS' ? selectedGps.name : 'Web Console'
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Attendance logging failed');
      onRefresh();
      alert(isRtl ? 'تم تسجيل حضورك بنجاح!' : 'Attendance check successfully recorded!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit leave request
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          employeeName: currentUser.fullName,
          leaveType,
          startDate,
          endDate,
          reason: leaveReason
        })
      });

      if (!res.ok) throw new Error('Failed to submit leave request');
      onRefresh();
      setStartDate('');
      setEndDate('');
      setLeaveReason('');
      alert(isRtl ? 'تم تقديم طلب الإجازة بنجاح!' : 'Leave request submitted successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle leave approvals
  const handleLeaveApproval = async (id: string, action: 'approve' | 'reject' | 'return', comment: string) => {
    try {
      const res = await fetch(`/api/leaves/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approverId: currentUser.id,
          approverName: currentUser.fullName,
          role: currentUser.role,
          action,
          comment
        })
      });

      if (!res.ok) throw new Error('Approval action failed');
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Filter leaves for the active user if role is just Employee
  const visibleLeaves = currentUser.role === 'Employee'
    ? leaves.filter((l) => l.employeeId === currentUser.id)
    : leaves;

  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayAttendance = attendance.find((a) => a.employeeId === currentUser.id && a.date === todayStr);

  return (
    <div id="attendance_leave_view" className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-sm">
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'attendance' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'إدارة وحضور الميدان' : 'Field Attendance & GPS'}
        </button>
        <button
          onClick={() => setActiveSubTab('leaves')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'leaves' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'طلبات الإجازات والموافقات' : 'Leaves & Workflow Engine'}
        </button>
      </div>

      {activeSubTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Check-In Console Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              {isRtl ? 'منصة تسجيل الدخول الذاتية' : 'Self-Check Console'}
            </h3>

            {userTodayAttendance ? (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                <p className="text-xs text-blue-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {isRtl ? 'لقد سجلت الحضور اليوم اليوم!' : 'Check-In registered for today!'}
                </p>
                <div className="text-xs text-gray-700 grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-gray-400 block font-sans">{isRtl ? 'وقت الحضور:' : 'In Time:'}</span>
                    <span className="font-bold">{userTodayAttendance.checkIn}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-sans">{isRtl ? 'وقت الانصراف:' : 'Out Time:'}</span>
                    <span className="font-bold">{userTodayAttendance.checkOut || '--:--:--'}</span>
                  </div>
                </div>
                {!userTodayAttendance.checkOut && (
                  <button
                    onClick={handleCheckInOut}
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg text-xs cursor-pointer transition-colors mt-2"
                  >
                    {isRtl ? 'تسجيل الانصراف المباشر' : 'Log Direct Check-Out'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Method Switcher */}
                <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                  <button
                    onClick={() => setMethod('Web')}
                    className={`py-1.5 rounded-md text-[10px] font-bold cursor-pointer ${
                      method === 'Web' ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    Web Console
                  </button>
                  <button
                    onClick={() => setMethod('GPS')}
                    className={`py-1.5 rounded-md text-[10px] font-bold cursor-pointer ${
                      method === 'GPS' ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    GPS Mobile
                  </button>
                  <button
                    onClick={() => setMethod('QR')}
                    className={`py-1.5 rounded-md text-[10px] font-bold cursor-pointer ${
                      method === 'QR' ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    QR Code
                  </button>
                </div>

                {method === 'GPS' && (
                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-gray-600 block">
                      {isRtl ? 'محاكاة موقع المشروع الحالي' : 'Simulate GCC Construction Location'}
                    </label>
                    <select
                      value={selectedGps.name}
                      onChange={(e) => {
                        const s = gpsSites.find((site) => site.name === e.target.value);
                        if (s) setSelectedGps(s);
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    >
                      {gpsSites.map((site) => (
                        <option key={site.name} value={site.name}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                    <div className="bg-gray-50 p-2.5 rounded border text-[10px] text-gray-500 font-mono">
                      Lat: {selectedGps.lat} | Lng: {selectedGps.lng}
                    </div>
                  </div>
                )}

                {method === 'QR' && (
                  <div className="flex flex-col items-center justify-center p-3 border border-dashed rounded-xl bg-gray-50 space-y-2">
                    <QrCode className="w-24 h-24 text-gray-800" />
                    <span className="text-[10px] text-gray-400 font-mono">GCC-HR-PASS-RYD-01</span>
                  </div>
                )}

                <button
                  onClick={handleCheckInOut}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {isRtl ? 'تسجيل الحضور اليومي الفوري' : 'Submit Instant Check-In'}
                </button>
              </div>
            )}
          </div>

          {/* Attendance logs list */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {isRtl ? 'سجل الحضور اليومي للمشروع' : 'Project Daily Attendance Sheet'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-3 text-gray-500">{isRtl ? 'الموظف' : 'Employee'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'الحضور' : 'In'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'الانصراف' : 'Out'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'طريقة البصمة' : 'Method'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'الإضافي' : 'OT (hrs)'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-semibold text-gray-900">{att.employeeName}</td>
                      <td className="p-3 font-mono text-gray-500">{att.date}</td>
                      <td className="p-3 font-mono">{att.checkIn || '--:--'}</td>
                      <td className="p-3 font-mono">{att.checkOut || '--:--'}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-600">
                          {att.method === 'GPS' && <MapPin className="w-3 h-3 text-blue-600" />}
                          {att.method === 'QR' && <QrCode className="w-3 h-3 text-purple-600" />}
                          {att.method}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-600">{att.overtimeHours} h</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            att.status === 'Present'
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : att.status === 'Late'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit Leave Request */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              {isRtl ? 'تقديم طلب إجازة رسمي' : 'File Leave Application'}
            </h3>

            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 block">{isRtl ? 'نوع الإجازة' : 'Leave Type'}</label>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 text-gray-700"
                >
                  <option value="Annual Leave">Annual Leave (Regular)</option>
                  <option value="Sick Leave">Sick Leave (Medical Report Required)</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                  <option value="Business Leave">Business Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 block">{isRtl ? 'تاريخ البدء' : 'Start Date'}</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 block">{isRtl ? 'تاريخ الانتهاء' : 'End Date'}</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 block">{isRtl ? 'مبررات وسبب الإجازة' : 'Detailed Justification'}</label>
                <textarea
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g., Annual family travel back home..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-800"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
              >
                {isSubmitting ? (isRtl ? 'جاري الإرسال...' : 'Submitting...') : (isRtl ? 'إرسال لطلب الموافقات' : 'Submit Leave Request')}
              </button>
            </form>
          </div>

          {/* Outbox & Approvals Panel */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {isRtl ? 'تدفق العمل والموافقات المعلقة الإدارية' : 'Leave Workflow Pipeline'}
            </h3>

            {visibleLeaves.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                {isRtl ? 'لا توجد طلبات إجازة نشطة في السجل حالياً.' : 'No active leave request pipelines registered.'}
              </p>
            ) : (
              <div className="space-y-4">
                {visibleLeaves.map((l) => (
                  <div key={l.id} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {l.id}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-1">{l.employeeName}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {l.leaveType} • {l.durationDays} {isRtl ? 'أيام' : 'days'} ({l.startDate} {isRtl ? 'إلى' : 'to'} {l.endDate})
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                            l.status === 'Approved'
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : l.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {l.status}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {isRtl ? 'الخطوة الحالية:' : 'Current Workflow Step:'} <span className="font-semibold text-blue-600">{l.workflowStep}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 bg-white p-2.5 rounded border border-gray-100 italic">
                      "{l.reason}"
                    </p>

                    {/* Progress Pipeline Visualization */}
                    <div className="grid grid-cols-4 gap-2 text-[9px] font-semibold text-center border-t pt-3">
                      <div className={`p-1.5 rounded ${l.approvals.supervisor ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-400'}`}>
                        {isRtl ? 'المشرف المباشر' : 'Supervisor'}
                      </div>
                      <div className={`p-1.5 rounded ${l.approvals.deptManager ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-400'}`}>
                        {isRtl ? 'مدير القسم' : 'Dept Manager'}
                      </div>
                      <div className={`p-1.5 rounded ${l.approvals.hr ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-400'}`}>
                        {isRtl ? 'مدير الموارد البشرية' : 'HR Manager'}
                      </div>
                      <div className={`p-1.5 rounded ${l.status === 'Approved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {isRtl ? 'مكتمل ومقرر' : 'Completed'}
                      </div>
                    </div>

                    {/* Accountant / HR Approval Actions Tray */}
                    {l.status === 'Pending' && currentUser.role !== 'Employee' && (
                      <div className="flex gap-2 justify-end pt-2 border-t border-dashed">
                        <button
                          onClick={() => handleLeaveApproval(l.id, 'reject', 'Rejected by Management')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> {isRtl ? 'رفض الطلب' : 'Reject'}
                        </button>
                        <button
                          onClick={() => handleLeaveApproval(l.id, 'approve', 'Approved by Management')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> {isRtl ? 'اعتماد ومتابعة' : 'Approve & Advance'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
