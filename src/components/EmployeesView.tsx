import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  CreditCard,
  Building,
  User,
  ShieldAlert,
  Download
} from 'lucide-react';
import { Employee, EmployeeDocument } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  currentUser: {
    id: string;
    fullName: string;
    role: string;
    department: string;
  };
  isRtl: boolean;
  departments: string[];
  positions: string[];
  projects: { code: string; name: string }[];
  onRefresh: () => void;
}

export default function EmployeesView({ employees, currentUser, isRtl, departments, positions, projects, onRefresh }: EmployeesViewProps) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedProj, setSelectedProj] = useState('');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardResult, setOnboardResult] = useState<{ employee: Employee; temporaryPassword: string } | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [nationality, setNationality] = useState('Saudi Arabia');
  const [nationalId, setNationalId] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [department, setDepartment] = useState(departments[0] || '');
  const [position, setPosition] = useState(positions[0] || '');
  const [projectAssignment, setProjectAssignment] = useState('HQ');
  const [employmentType, setEmploymentType] = useState<'Full-Time' | 'Contract' | 'Part-Time' | 'Temporary'>('Full-Time');
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [basicSalary, setBasicSalary] = useState('');
  const [housingAllowance, setHousingAllowance] = useState('');
  const [transportationAllowance, setTransportationAllowance] = useState('');
  const [communicationAllowance, setCommunicationAllowance] = useState('');
  const [foodAllowance, setFoodAllowance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Role permissions
  const isGM = currentUser.role === 'Super Administrator';
  const isHR = currentUser.role === 'HR Manager';
  const isEmployeeOnly = currentUser.role === 'Employee';
  const canOnboard = isGM || isHR;

  // Filtered employees based on organizational hierarchies & user scope
  const visibleEmployees = employees.filter((e) => {
    if (isGM || isHR) {
      return true; // General Manager and HR Director see everyone
    }
    if (isEmployeeOnly) {
      // Field employee only sees their own profile
      return e.id === currentUser.id || e.fullName === currentUser.fullName;
    }
    // Managers only see employees in their designated department
    return e.department === currentUser.department;
  });

  const filtered = visibleEmployees.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.nationalId.includes(search);
    const matchesDept = selectedDept ? e.department === selectedDept : true;
    const matchesProj = selectedProj ? e.projectAssignment === selectedProj : true;
    return matchesSearch && matchesDept && matchesProj;
  });

  // Expiry alert calculation
  const getDocumentAlertClass = (expiryStr: string) => {
    const diff = new Date(expiryStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return { bg: 'bg-red-100 text-red-800 border-red-200', text: isRtl ? 'منتهي' : 'Expired' };
    if (days <= 7) return { bg: 'bg-red-50 text-red-700 border-red-100 animate-pulse', text: isRtl ? 'حرج (7 أيام)' : 'Critical (7 days)' };
    if (days <= 15) return { bg: 'bg-orange-50 text-orange-700 border-orange-100', text: isRtl ? 'إنذار (15 يوم)' : 'Alert (15 days)' };
    if (days <= 30) return { bg: 'bg-amber-50 text-amber-700 border-amber-100', text: isRtl ? 'تحذير (30 يوم)' : 'Warning (30 days)' };
    if (days <= 60) return { bg: 'bg-yellow-50 text-yellow-800 border-yellow-100', text: isRtl ? 'إنذار مبكر (60 يوم)' : 'Early Alert (60 days)' };
    if (days <= 90) return { bg: 'bg-blue-50 text-blue-700 border-blue-100', text: isRtl ? 'قريب (90 يوم)' : 'Upcoming (90 days)' };

    return { bg: 'bg-green-50 text-green-700 border-green-100', text: isRtl ? 'ساري العمل' : 'Active' };
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !nationalId) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          mobile,
          nationality,
          nationalId,
          passportNumber,
          department,
          position,
          projectAssignment,
          employmentType,
          hireDate,
          basicSalary: Number(basicSalary),
          housingAllowance: Number(housingAllowance),
          transportationAllowance: Number(transportationAllowance),
          communicationAllowance: Number(communicationAllowance),
          foodAllowance: Number(foodAllowance),
          grantedPermissions: selectedPermissions
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOnboardResult(data);
      onRefresh();

      // Clear states
      setFullName('');
      setEmail('');
      setMobile('');
      setNationalId('');
      setPassportNumber('');
      setBasicSalary('');
      setHousingAllowance('');
      setTransportationAllowance('');
      setSelectedPermissions([]);
    } catch (err: any) {
      alert(err.message || 'Onboarding registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="employees_view" className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">{isRtl ? 'سجل الموظفين المعتمد' : 'Employee Master Records'}</h2>
          <p className="text-xs text-gray-500">{isRtl ? 'إدارة وتتبع الهويات والوثائق وبدء عمليات التعيين' : 'Manage employee profiles, monitor document expires, and execute formal onboarding'}</p>
        </div>
        {canOnboard ? (
          <button
            onClick={() => setShowOnboardModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            {isRtl ? 'بدء تعيين موظف جديد' : 'New Employee Onboarding'}
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isRtl 
                ? 'التعيين مقتصر على المدير العام ومدير الموارد البشرية' 
                : 'Onboarding is restricted to General Manager & HR Director'}
            </span>
          </div>
        )}
      </div>

      {/* Filter Tray */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder={isRtl ? 'ابحث بالاسم، الرقم الوظيفي، الهوية...' : 'Search Name, ID, Iqama...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-gray-800"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
        >
          <option value="">{isRtl ? 'جميع الإدارات' : 'All Departments'}</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={selectedProj}
          onChange={(e) => setSelectedProj(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
        >
          <option value="">{isRtl ? 'جميع المشاريع' : 'All Projects / Locations'}</option>
          <option value="HQ">HQ / Main Office</option>
          {projects.map((p) => (
            <option key={p.code} value={p.code}>
              {p.code} - {p.name}
            </option>
          ))}
        </select>

        <div className="text-right flex items-center justify-end text-xs font-semibold text-gray-500">
          {isRtl ? 'تطابق السجلات:' : 'Matched Profiles:'} {filtered.length} / {employees.length}
        </div>
      </div>

      {/* Employee List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((emp) => (
          <div key={emp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 hover:border-blue-200 transition-colors">
            {/* ID Card Top */}
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <img
                  src={emp.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                  alt={emp.fullName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{emp.fullName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">
                      {emp.id}
                    </span>
                    <span className="text-xs text-gray-500">{emp.position}</span>
                  </div>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  emp.status === 'Active'
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}
              >
                {emp.status}
              </span>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-gray-50 py-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Building className="w-3.5 h-3.5" />
                  <span>{emp.department}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {isRtl ? 'التعيين:' : 'Hired:'} {emp.hireDate}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>
                    {isRtl ? 'الهوية:' : 'ID/Iqama:'} <span className="font-mono font-semibold">{emp.nationalId}</span>
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{emp.mobile}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  <span>{emp.nationality}</span>
                </div>
              </div>
            </div>

            {/* Expiring Docs Sub-list */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {isRtl ? 'تراخيص ووثائق الموظف' : 'Regulatory Permits & Expiries'}
              </h4>
              {emp.documents.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  {isRtl ? 'لا توجد وثائق مؤرشفة حالياً' : 'No documents digitized yet.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {emp.documents.map((doc) => {
                    const alertClass = getDocumentAlertClass(doc.expiryDate);

                    return (
                      <div
                        key={doc.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${alertClass.bg}`}
                      >
                        <div>
                          <p className="font-semibold">{doc.name}</p>
                          <p className="text-[10px] font-mono opacity-80">{doc.fileNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold">{alertClass.text}</p>
                          <p className="text-[9px] font-mono opacity-70">{doc.expiryDate}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Onboarding Form Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-700 text-white rounded-t-xl">
              <div>
                <h3 className="font-bold text-lg">{isRtl ? 'إجراء تعيين موظف جديد' : 'New Employee Onboarding'}</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  {isRtl ? 'تعبئة حقول الموظف الرسمية لتنشيط الملف الوظيفي' : 'Populate core administrative fields to initialize profile'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOnboardModal(false);
                  setOnboardResult(null);
                }}
                className="text-white hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {onboardResult ? (
              /* Success screen displaying generated credentials */
              <div className="p-6 space-y-6">
                <div className="bg-green-50 border border-green-200 p-5 rounded-xl flex items-start gap-4">
                  <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-900 text-base">
                      {isRtl ? 'تم التعيين وتنشيط الملف الوظيفي بنجاح!' : 'Onboarding Registration Completed!'}
                    </h4>
                    <p className="text-xs text-green-800 mt-1">
                      {isRtl
                        ? 'تم تنشيط الحساب وسجل الأنشطة والمستحقات بنجاح.'
                        : 'The system has initialized the core employee profile and recorded onboarding activity in the audit logs.'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm border-b pb-2">
                    {isRtl ? 'بيانات اعتماد الحساب المؤقتة' : 'Temporary Account Credentials'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-400 block">{isRtl ? 'الرقم الوظيفي:' : 'Employee ID:'}</span>
                      <span className="font-bold text-blue-700 text-sm">{onboardResult.employee.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">{isRtl ? 'البريد الإلكتروني:' : 'Email Address:'}</span>
                      <span className="font-bold text-gray-800">{onboardResult.employee.email}</span>
                    </div>
                    <div className="col-span-2 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-amber-800 block text-[10px] font-sans font-bold">
                          {isRtl ? 'كلمة المرور المؤقتة (تطلب تغيير عند تسجيل الدخول الأول):' : 'Temporary Secure Password (First login reset required):'}
                        </span>
                        <span className="text-base font-bold tracking-wider text-amber-900 font-mono">
                          {onboardResult.temporaryPassword}
                        </span>
                      </div>
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowOnboardModal(false);
                      setOnboardResult(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    {isRtl ? 'إكمال وإغلاق' : 'Finalize & Close'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOnboardSubmit} className="p-6 space-y-5 flex-1">
                {/* 2 Column Field Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'الاسم الكامل المعتمد' : 'Full Name *'}</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Tariq Abdulaziz Al-Otaibi"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-gray-800"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'البريد الإلكتروني الرسمي *' : 'Email Address *'}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tariq@almansoori.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-gray-800"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'رقم الهاتف المتنقل' : 'Mobile Number'}</label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+966 50 123 4567"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-gray-800"
                    />
                  </div>

                  {/* National ID */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'رقم الهوية الوطنية أو الإقامة *' : 'National ID / Iqama *'}</label>
                    <input
                      type="text"
                      required
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="10XXXXXXXX"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-gray-800"
                    />
                  </div>

                  {/* Passport */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'رقم جواز السفر' : 'Passport Number'}</label>
                    <input
                      type="text"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="NXXXXXXXX"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-gray-800"
                    />
                  </div>

                  {/* Nationality */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'الجنسية' : 'Nationality'}</label>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
                    >
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="India">India</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Philippines">Philippines</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'الإدارة الرسمية' : 'Department'}</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Position */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'المسمى الوظيفي' : 'Position'}</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
                    >
                      {positions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Assignment */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'الموقع أو تعيين المشروع' : 'Project Assignment'}</label>
                    <select
                      value={projectAssignment}
                      onChange={(e) => setProjectAssignment(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
                    >
                      <option value="HQ">HQ / Main Office</option>
                      {projects.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employment Type */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'نوع عقد العمل' : 'Employment Type'}</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
                    >
                      <option value="Full-Time">Full-Time (Mofadaw)</option>
                      <option value="Contract">Contract (Moaqat)</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>

                  {/* Hire Date */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'تاريخ مباشرة العمل' : 'Hire Date'}</label>
                    <input
                      type="date"
                      value={hireDate}
                      onChange={(e) => setHireDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-gray-800"
                    />
                  </div>

                  {/* Salary details */}
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700 block">{isRtl ? 'الراتب الأساسي (ريال سعودي)' : 'Basic Monthly Salary (SAR)'}</label>
                    <input
                      type="number"
                      required
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(e.target.value)}
                      placeholder="e.g., 12000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-gray-800"
                    />
                  </div>
                </div>

                {/* System Permissions (صلاحيات النظام للموظف الجديد) */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      {isRtl ? 'صلاحيات الوصول والتحكم المعطاة من الإدارة' : 'Administrative Access & System Permissions'}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {isRtl
                        ? 'افتراضياً، الموظف الذي لا يُعيّن كمدير لن يرى أي إحصائيات أو أقسام إدارية. حدد الصلاحيات أدناه لمنحه وصولاً إضافياً.'
                        : 'By default, employees not appointed as managers will not see statistics or administration tabs. Check permissions below to grant additional access.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {[
                      { id: 'view_dashboard', label: 'View Dashboard Statistics', labelAr: 'مشاهدة إحصائيات لوحة القيادة (المقاييس والرسوم البيانية)' },
                      { id: 'manage_employees', label: 'Manage Personnel Master', labelAr: 'إدارة السجل الرئيسي للموظفين والوثائق' },
                      { id: 'manage_attendance', label: 'Manage Attendance & Leaves', labelAr: 'إدارة كشوفات الحضور وطلبات الإجازات العامة' },
                      { id: 'manage_payroll', label: 'Manage Payroll & Loans', labelAr: 'إدارة كشوفات الرواتب وسلف وقروض الموظفين' },
                      { id: 'manage_projects', label: 'Manage Construction Projects', labelAr: 'إدارة المشاريع الإنشائية وتعيين المهام' },
                      { id: 'manage_operations', label: 'Manage Heavy Equipment & Fleet', labelAr: 'إدارة المعدات الثقيلة والأسطول والصيانة' },
                      { id: 'manage_inventory', label: 'Manage Warehouse Spare Parts', labelAr: 'إدارة المستودعات وقطع الغيار والأصول' },
                      { id: 'manage_approvals', label: 'Manage Workflow & Approvals', labelAr: 'إدارة واعتماد طلبات حوكمة الموافقات' },
                      { id: 'manage_security', label: 'Manage System Security & IAM', labelAr: 'إدارة أمن وصلاحيات الهوية والأمان' },
                    ].map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                            isChecked
                              ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-semibold'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedPermissions(selectedPermissions.filter((id) => id !== perm.id));
                              } else {
                                setSelectedPermissions([...selectedPermissions, perm.id]);
                              }
                            }}
                            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span>{isRtl ? perm.labelAr : perm.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowOnboardModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                  >
                    {isRtl ? 'إلغاء الأمر' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {isLoading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'اعتماد وبدء التعيين' : 'Approve Onboarding')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
