import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  Wrench,
  DollarSign,
  AlertTriangle,
  Clock,
  TrendingUp,
  MapPin,
  FileText,
  Percent,
  Warehouse
} from 'lucide-react';
import { Employee, Project, Equipment, MaintenanceWorkOrder, SparePart, LeaveRequest, Loan } from '../types';
import EnterpriseRequestsCenter from './EnterpriseRequestsCenter';

interface DashboardViewProps {
  state: {
    employees: Employee[];
    projects: Project[];
    equipment: Equipment[];
    workOrders: MaintenanceWorkOrder[];
    spareParts: SparePart[];
    leaves: LeaveRequest[];
    loans: Loan[];
    attendance: any[];
  };
  currentUser: { id: string; fullName: string; role: string; department?: string };
  isRtl: boolean;
  hasPermission: (permissionId: string) => boolean;
  onAddNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning', module: string) => void;
}

export default function DashboardView({ state, currentUser, isRtl, hasPermission, onAddNotification }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'ceo' | 'hr' | 'equip' | 'proj'>('ceo');
  const hasDashboardPermission = hasPermission ? hasPermission('view_dashboard') : true;

  const { employees, projects, equipment, workOrders, spareParts, leaves, loans, attendance } = state;

  if (!hasDashboardPermission) {
    // Regular employee - show their requests, attendance, and profile
    const myLeaves = leaves.filter((l) => l.employeeId === currentUser.id);
    const myLoans = loans.filter((l) => l.employeeId === currentUser.id || l.employeeName === currentUser.fullName);
    const myAttendance = attendance ? attendance.filter((a: any) => a.employeeId === currentUser.id) : [];

    return (
      <div id="employee_dashboard" className="space-y-6 animate-fade-in">
        {/* Profile Card / Welcome Block */}
        <div className="bg-gradient-to-r from-[#1565C0] to-[#1E88E5] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-100 bg-white/20 px-2.5 py-1 rounded-full">
              {isRtl ? 'ملف الموظف الرقمي الموحد' : 'Unified Digital Employee Profile'}
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-1">
              {isRtl ? `أهلاً بك، ${currentUser.fullName}` : `Welcome back, ${currentUser.fullName}`}
            </h2>
            <p className="text-xs text-blue-50 max-w-xl">
              {isRtl
                ? 'مرحباً بك في لوحة الخدمة الذاتية للموظفين. يمكنك هنا متابعة وتقديم طلبات الإجازات، السلف، تتبع الحضور، وعرض الصلاحيات الممنوحة لك.'
                : 'Welcome to your Self-Service employee workspace. Track your leave requests, cash loans, clock-in logs, and view your granted active credentials.'}
            </p>
          </div>
          <div className="bg-white/10 border border-white/25 rounded-xl p-4 text-xs space-y-1 font-mono">
            <div>
              <span className="opacity-75">{isRtl ? 'الرقم الوظيفي:' : 'Employee ID:'}</span>{' '}
              <span className="font-bold">{currentUser.id}</span>
            </div>
            <div>
              <span className="opacity-75">{isRtl ? 'المنصب الحركي:' : 'Position:'}</span>{' '}
              <span className="font-bold">{currentUser.role}</span>
            </div>
            <div>
              <span className="opacity-75">{isRtl ? 'القسم الإداري:' : 'Department:'}</span>{' '}
              <span className="font-bold">{currentUser.department || 'Operations'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic System Privileges Panel (الصلاحيات الممنوحة من الإدارة) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              {isRtl ? 'الصلاحيات والوصول النشط الممنوح لك من الإدارة' : 'Active Privileges & IAM Credentials Granted by Admin'}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {isRtl
                ? 'صلاحيات النظام الممنوحة لك حالياً لإجراء المعاملات وعرض الشاشات.'
                : 'System features you are currently authorized to access and perform activities on.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'view_dashboard', label: 'View Dashboard Statistics', labelAr: 'مشاهدة إحصائيات لوحة القيادة' },
              { id: 'manage_employees', label: 'Manage Personnel Master', labelAr: 'إدارة سجلات الموظفين والوثائق' },
              { id: 'manage_attendance', label: 'Manage Attendance & Leaves', labelAr: 'إدارة الحضور والإجازات' },
              { id: 'manage_payroll', label: 'Manage Payroll & Loans', labelAr: 'إدارة الرواتب والسلف' },
              { id: 'manage_projects', label: 'Manage Construction Projects', labelAr: 'إدارة المشاريع والمهام' },
              { id: 'manage_operations', label: 'Manage Heavy Equipment & Fleet', labelAr: 'إدارة المعدات والأسطول' },
              { id: 'manage_inventory', label: 'Manage Warehouse Spare Parts', labelAr: 'إدارة مستودعات قطع الغيار' },
              { id: 'manage_approvals', label: 'Manage Workflow & Approvals', labelAr: 'إدارة الموافقات والحوكمة' },
              { id: 'manage_security', label: 'Manage System Security & IAM', labelAr: 'إدارة الأمن وصلاحيات الهوية' },
            ].map((perm) => {
              const isGranted = hasPermission(perm.id);
              return (
                <span
                  key={perm.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    isGranted
                      ? 'bg-green-50 text-green-700 border-green-200 font-bold shadow-2xs'
                      : 'bg-gray-50/50 text-gray-400 border-gray-100 opacity-60 line-through'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isGranted ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                  {isRtl ? perm.labelAr : perm.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Employee Requests Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaves Table */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {isRtl ? 'طلبات الإجازات الخاصة بي' : 'My Leave Requests'}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {isRtl ? 'سجل تتبع ومستجدات إجازاتك السنوية والمرضية' : 'Annual, sick, and emergency leave statuses'}
                </p>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                {myLeaves.length} {isRtl ? 'طلبات' : 'Requests'}
              </span>
            </div>

            {myLeaves.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs italic">
                {isRtl ? 'لا توجد طلبات إجازة نشطة حالياً.' : 'No leave requests submitted yet.'}
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {myLeaves.map((l) => (
                  <div key={l.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">{isRtl ? l.leaveType : l.leaveType}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          l.status === 'Approved'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : l.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : l.status === 'Returned'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}
                      >
                        {isRtl ? (l.status === 'Pending' ? 'قيد المراجعة' : l.status) : l.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                      <span>{l.startDate} ➔ {l.endDate}</span>
                      <span className="font-semibold text-gray-700">{l.durationDays} {isRtl ? 'أيام' : 'days'}</span>
                    </div>
                    {l.reason && (
                      <p className="text-[10px] text-gray-500 bg-white p-1.5 rounded border border-gray-100 mt-1">
                        <span className="font-semibold">{isRtl ? 'السبب:' : 'Reason:'}</span> {l.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cash Loans & Advances Table */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {isRtl ? 'طلبات السلف والقروض المالية الخاصة بي' : 'My Cash Loans & Advances'}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {isRtl ? 'سجل السلف وقروض الشركات والمستحقات والخصومات' : 'Outstanding company cash advances & logs'}
                </p>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                {myLoans.length} {isRtl ? 'طلبات' : 'Loans'}
              </span>
            </div>

            {myLoans.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs italic">
                {isRtl ? 'لا توجد طلبات سلف أو قروض نشطة.' : 'No cash advances or loans registered.'}
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {myLoans.map((loan) => (
                  <div key={loan.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">{isRtl ? 'طلب سلفة مالية' : 'Company Cash Loan'}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          loan.status === 'Approved' || loan.status === 'Active'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : loan.status === 'Closed'
                            ? 'bg-gray-100 text-gray-600 border border-gray-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-mono">
                      <div>
                        <span>{isRtl ? 'مبلغ القرض الأساسي:' : 'Principal Amount:'}</span>
                        <p className="font-extrabold text-gray-800 text-xs mt-0.5">{loan.amount.toLocaleString()} SAR</p>
                      </div>
                      <div>
                        <span>{isRtl ? 'القسط الشهري المقتطع:' : 'Monthly Installment:'}</span>
                        <p className="font-semibold text-blue-700 mt-0.5">{loan.monthlyInstallment.toLocaleString()} SAR/m</p>
                      </div>
                      <div>
                        <span>{isRtl ? 'فترة السداد الإجمالية:' : 'Repayment Period:'}</span>
                        <p className="font-medium text-gray-700 mt-0.5">{loan.repaymentMonths} {isRtl ? 'أشهر' : 'months'}</p>
                      </div>
                      <div>
                        <span>{isRtl ? 'الرصيد المتبقي المستحق:' : 'Outstanding Balance:'}</span>
                        <p className="font-bold text-amber-700 mt-0.5">{loan.outstandingBalance.toLocaleString()} SAR</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance Logs (سجل التحضير اليومي) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {isRtl ? 'سجل تسجيل الحضور والانصراف الأخير الخاص بي' : 'My Recent Attendance & Clock-in History'}
              </h3>
              <p className="text-[10px] text-gray-400">
                {isRtl ? 'متابعة سجلات الحضور اليومية، الدخول والخروج، والتأخير' : 'View daily check-in, check-out, and punctuality status'}
              </p>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
              {myAttendance.length} {isRtl ? 'سجلات' : 'Logs'}
            </span>
          </div>

          {myAttendance.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs italic">
              {isRtl ? 'لا توجد سجلات حضور مسجلة مؤخراً.' : 'No attendance logs found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[9px] font-bold">
                    <th className="py-2.5 px-3">{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th className="py-2.5 px-3">{isRtl ? 'وقت الدخول' : 'Clock In'}</th>
                    <th className="py-2.5 px-3">{isRtl ? 'وقت الخروج' : 'Clock Out'}</th>
                    <th className="py-2.5 px-3">{isRtl ? 'طريقة التحضير' : 'Method'}</th>
                    <th className="py-2.5 px-3">{isRtl ? 'الموقع' : 'Location'}</th>
                    <th className="py-2.5 px-3">{isRtl ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {myAttendance.slice(0, 10).map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium">{a.date}</td>
                      <td className="py-2.5 px-3 text-green-700 font-mono font-semibold">{a.checkIn || '—'}</td>
                      <td className="py-2.5 px-3 text-amber-700 font-mono font-semibold">{a.checkOut || '—'}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-600">{a.method}</td>
                      <td className="py-2.5 px-3 text-gray-500 max-w-xs truncate">{a.locationName || 'HQ'}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            a.status === 'Present'
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : a.status === 'Late'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Real-time calculation helpers
  const totalEmployees = employees.filter((e) => e.status !== 'Offboarded').length;
  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const totalEquipment = equipment.length;
  const activeWorkOrdersCount = workOrders.filter((w) => w.status !== 'Completed' && w.status !== 'Closed').length;

  // Calculate Monthly Payroll cost (summing basic salaries + allowances)
  const totalPayroll = employees
    .filter((e) => e.status === 'Active' || e.status === 'On Leave')
    .reduce((acc, e) => {
      const gross = e.basicSalary + e.housingAllowance + e.transportationAllowance + e.communicationAllowance + e.foodAllowance;
      return acc + gross;
    }, 0);

  // Document alerts count (under 90 days)
  const expiringDocsCount = employees.flatMap((e) =>
    e.documents.filter((d) => {
      const diff = new Date(d.expiryDate).getTime() - Date.now();
      const days = diff / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 90;
    })
  ).length;

  // Low Stock Parts alert count
  const lowStockPartsCount = spareParts.filter((sp) => sp.quantityInStock <= sp.reorderLevel).length;

  // Department distribution
  const deptCounts: { [key: string]: number } = {};
  employees.forEach((e) => {
    if (e.status !== 'Offboarded') {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    }
  });

  // Equipment Status distribution
  const equipStatus = {
    Active: equipment.filter((e) => e.status === 'Active').length,
    Idle: equipment.filter((e) => e.status === 'Idle').length,
    Maintenance: equipment.filter((e) => e.status === 'Under Maintenance').length,
    OOS: equipment.filter((e) => e.status === 'Out of Service' || e.status === 'Retired').length
  };

  // Render responsive SVG Bar Chart for Department Workforce
  const renderDeptChart = () => {
    const keys = Object.keys(deptCounts);
    const maxVal = Math.max(...Object.values(deptCounts), 1);
    const height = 180;
    const width = 450;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
        {keys.map((key, idx) => {
          const val = deptCounts[key];
          const barHeight = (val / maxVal) * 120;
          const x = idx * (width / Math.max(keys.length, 1)) + 15;
          const y = height - barHeight - 30;
          const barWidth = 35;

          return (
            <g key={key} className="group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                className="fill-[#1565C0] group-hover:fill-[#1E88E5] transition-all duration-300"
                rx={4}
              />
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="text-[10px] font-semibold font-mono fill-gray-800">
                {val}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="text-[9px] fill-gray-500 font-sans tracking-tight"
                transform={`rotate(0, ${x + barWidth / 2}, ${height - 10})`}
              >
                {key.split(' ')[0]}
              </text>
              {/* Tooltip trigger */}
              <title>{`${key}: ${val} employees`}</title>
            </g>
          );
        })}
        {/* Baseline */}
        <line x1="0" y1={height - 25} x2={width} y2={height - 25} stroke="#E5E7EB" strokeWidth="1.5" />
      </svg>
    );
  };

  // Render SVG Project Budget vs Cost comparison
  const renderProjectCostsChart = () => {
    const activePrjs = projects.slice(0, 4);
    const maxBudget = Math.max(...activePrjs.map((p) => p.budget), 1);
    const height = 180;
    const width = 450;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
        {activePrjs.map((p, idx) => {
          const x = idx * (width / Math.max(activePrjs.length, 1)) + 25;
          const budgetH = (p.budget / maxBudget) * 110;
          const costH = (p.costToDate / maxBudget) * 110;
          const barW = 16;

          return (
            <g key={p.code}>
              {/* Budget Bar */}
              <rect
                x={x}
                y={height - budgetH - 35}
                width={barW}
                height={budgetH}
                className="fill-blue-200"
                rx={2}
              />
              {/* Cost Bar */}
              <rect
                x={x + 18}
                y={height - costH - 35}
                width={barW}
                height={costH}
                className="fill-[#1565C0] hover:fill-[#1E88E5] transition-colors"
                rx={2}
              />
              {/* Labels */}
              <text x={x + 17} y={height - Math.max(budgetH, costH) - 42} textAnchor="middle" className="text-[8px] font-mono fill-gray-700">
                {Math.round(p.costToDate / 1000)}k/{Math.round(p.budget / 1000000)}M
              </text>
              <text x={x + 17} y={height - 15} textAnchor="middle" className="text-[9px] fill-gray-500 font-mono">
                {p.code}
              </text>
            </g>
          );
        })}
        <line x1="0" y1={height - 30} x2={width} y2={height - 30} stroke="#E5E7EB" strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div id="dashboard_view" className="space-y-6">
      {/* Category Tabs with Geometric Balance styling */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('ceo')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'ceo'
              ? 'border-[#1565C0] text-[#1565C0] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'لوحة القيادة التنفيذية' : 'CEO Executive Dashboard'}
        </button>
        <button
          onClick={() => setActiveTab('hr')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'hr'
              ? 'border-[#1565C0] text-[#1565C0] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'إحصائيات الموارد البشرية' : 'HR & Workforce Stats'}
        </button>
        <button
          onClick={() => setActiveTab('equip')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'equip'
              ? 'border-[#1565C0] text-[#1565C0] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'المعدات والأسطول' : 'Equipment & Fleet'}
        </button>
        <button
          onClick={() => setActiveTab('proj')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'proj'
              ? 'border-[#1565C0] text-[#1565C0] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'المشاريع والعمليات' : 'Projects & Operations'}
        </button>
      </div>

      {activeTab === 'ceo' && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Workforce Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-gray-500 text-xs font-medium block">
                  {isRtl ? 'إجمالي الموظفين الفاعلين' : 'Total Active Employees'}
                </span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">{totalEmployees}</span>
                <span className="text-green-600 text-[11px] font-semibold flex items-center gap-0.5 mt-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +100% {isRtl ? 'تشغيل آمن' : 'Compliance Rate'}
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-[#1565C0] rounded-lg">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Project Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-gray-500 text-xs font-medium block">
                  {isRtl ? 'المشاريع النشطة' : 'Active GCC Projects'}
                </span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">{activeProjects}</span>
                <span className="text-gray-500 text-[11px] font-medium block mt-1.5">
                  {projects.filter((p) => p.status === 'Planned').length} {isRtl ? 'مخطط مستقبلاً' : 'Planned'}
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-[#1565C0] rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            {/* Heavy Equipment Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-gray-500 text-xs font-medium block">
                  {isRtl ? 'المعدات الثقيلة والأسطول' : 'Machinery & Fleet'}
                </span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">{totalEquipment}</span>
                <span className="text-yellow-600 text-[11px] font-semibold flex items-center gap-1 mt-1.5">
                  <Clock className="w-3.5 h-3.5" /> {equipStatus.Maintenance} {isRtl ? 'تحت الصيانة' : 'Under Service'}
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-[#1565C0] rounded-lg">
                <Wrench className="w-6 h-6" />
              </div>
            </div>

            {/* Payroll Budget Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-gray-500 text-xs font-medium block">
                  {isRtl ? 'فاتورة الأجور الشهرية المقدرة' : 'Est. Monthly Payroll'}
                </span>
                <span className="text-2xl font-bold text-[#1565C0] mt-1 block">
                  {totalPayroll.toLocaleString()} <span className="text-xs font-normal text-gray-500">SAR</span>
                </span>
                <span className="text-gray-400 text-[10px] block mt-1.5">
                  {isRtl ? 'تشمل الراتب الأساسي والبدلات المقررة' : 'Includes basic + allowances'}
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-[#1565C0] rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Action Alerts Block */}
          {(expiringDocsCount > 0 || lowStockPartsCount > 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 text-sm">
                  {isRtl ? 'تنبيهات الحوكمة والامتثال المعلقة' : 'Pending Governance & Compliance Alerts'}
                </h4>
                <div className="text-xs text-amber-800 mt-1 space-y-1">
                  {expiringDocsCount > 0 && (
                    <p>
                      • {isRtl ? 'هناك' : 'There are'}{' '}
                      <span className="font-bold">{expiringDocsCount}</span>{' '}
                      {isRtl
                        ? 'مستندات إقامة أو جوازات سفر لموظفين تنتهي في غضون 90 يوماً.'
                        : 'employee residency permits (Iqamas) or passports expiring within 90 days.'}
                    </p>
                  )}
                  {lowStockPartsCount > 0 && (
                    <p>
                      • {isRtl ? 'هناك' : 'There are'}{' '}
                      <span className="font-bold">{lowStockPartsCount}</span>{' '}
                      {isRtl
                        ? 'قطع غيار هامة في المستودعات تدنت تحت مستوى الطلب الحرج.'
                        : 'critical spare parts in warehouse inventories that have met reorder levels.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Unified Enterprise Pending Requests Center */}
          <EnterpriseRequestsCenter
            isRtl={isRtl}
            employees={employees}
            onAddNotification={onAddNotification}
          />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1 */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">
                {isRtl ? 'توزيع القوى العاملة بحسب الإدارات' : 'Workforce Distribution by Department'}
              </h3>
              {renderDeptChart()}
            </div>

            {/* Chart 2 */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">
                {isRtl ? 'مقارنة الميزانيات والنفقات للمشاريع الكبرى' : 'GCC Major Project Budget vs Realized Costs'}
              </h3>
              {renderProjectCostsChart()}
            </div>
          </div>
        </>
      )}

      {activeTab === 'hr' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500 block">{isRtl ? 'المواطنون السعوديون' : 'Saudi Citizens'}</span>
            <span className="text-2xl font-bold mt-1 block">
              {employees.filter((e) => e.nationality === 'Saudi Arabia').length}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? 'الامتثال لنسب التوطين (نطاقات)' : 'Nitaqat localization compliance'}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500 block">{isRtl ? 'إقامات منتهية أو منتهية قريباً' : 'Expiring Residency Cards (Iqama)'}</span>
            <span className="text-2xl font-bold mt-1 block text-red-600">{expiringDocsCount}</span>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? 'تتطلب إجراء تجديد فوري للمكفولين' : 'Requires proactive sponsor renewals'}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500 block">{isRtl ? 'إجازات معلقة للموافقة' : 'Pending Leave Approvals'}</span>
            <span className="text-2xl font-bold mt-1 block text-blue-600">
              {leaves.filter((l) => l.status === 'Pending').length}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? 'تنتظر توجيه المشرفين أو الموارد البشرية' : 'Awaiting team supervisor reviews'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'equip' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 block">{isRtl ? 'جاهزة وتحت العمل' : 'Operational (Active)'}</span>
            <span className="text-2xl font-bold text-green-600 mt-1 block">{equipStatus.Active}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 block">{isRtl ? 'خاملة / بدون مهام' : 'Idle Machines'}</span>
            <span className="text-2xl font-bold text-gray-500 mt-1 block">{equipStatus.Idle}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 block">{isRtl ? 'خارج الخدمة للصيانة' : 'Under Maintenance'}</span>
            <span className="text-2xl font-bold text-yellow-600 mt-1 block">{equipStatus.Maintenance}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 block">{isRtl ? 'معطلة أو منسقة' : 'Out of Service'}</span>
            <span className="text-2xl font-bold text-red-600 mt-1 block">{equipStatus.OOS}</span>
          </div>
        </div>
      )}

      {activeTab === 'proj' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => {
              const spentPercent = Math.min(Math.round((p.costToDate / p.budget) * 100) || 0, 100);

              return (
                <div key={p.code} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-gray-400 block">{p.code}</span>
                      <h4 className="font-semibold text-gray-900 text-sm mt-0.5">{p.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        p.status === 'Active'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{isRtl ? 'نسبة الإنجاز الميداني' : 'Field Progress'}</span>
                      <span className="font-semibold">{p.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.progressPercent}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 text-xs">
                    <div>
                      <span className="text-gray-400 block">{isRtl ? 'إجمالي الميزانية' : 'Total Budget'}</span>
                      <span className="font-bold font-mono text-gray-800">{(p.budget / 1000000).toFixed(1)}M SAR</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">{isRtl ? 'المصروف الفعلي' : 'Realized Spend'}</span>
                      <span
                        className={`font-bold font-mono ${
                          p.costToDate > p.budget ? 'text-red-600' : 'text-gray-800'
                        }`}
                      >
                        {(p.costToDate / 1000000).toFixed(1)}M SAR ({spentPercent}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
