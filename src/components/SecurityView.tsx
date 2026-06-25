import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Key,
  Users,
  Briefcase,
  Layers,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Check,
  FileText,
  DollarSign,
  Building,
  Server,
  Zap,
  Flame,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface SecurityViewProps {
  state: {
    employees: any[];
    settings: any;
    projects: any[];
  };
  isRtl: boolean;
  onRefresh: () => void;
}

// Preset security roles
const INITIAL_ROLES = [
  { code: 'SYS_ADMIN', name: 'System Administrator', nameAr: 'مسؤول النظام', desc: 'Full root access to all system modules, configurations, and audit trails.', count: 3, isSystem: true },
  { code: 'HR_ADMIN', name: 'HR Administrator', nameAr: 'مدير الموارد البشرية', desc: 'Complete HR personnel administration, payroll oversight, and organizational structuring.', count: 5, isSystem: true },
  { code: 'HR_OFFICER', name: 'HR Officer', nameAr: 'أخصائي موارد بشرية', desc: 'Manages employee directory, tracks attendance, and reviews leave applications.', count: 12, isSystem: false },
  { code: 'PAYROLL_MAN', name: 'Payroll Manager', nameAr: 'مدير الرواتب', desc: 'Approves salaries, modifies bonuses, manages loans, and generates financial files.', count: 2, isSystem: true },
  { code: 'PAYROLL_OFF', name: 'Payroll Officer', nameAr: 'أخصائي رواتب', desc: 'Processes monthly timesheets, calculates deductions, and drafts payroll sheets.', count: 6, isSystem: false },
  { code: 'FIN_MAN', name: 'Finance Manager', nameAr: 'المدير المالي', desc: 'Full budgetary control, financial approval authorization, and audit capability.', count: 3, isSystem: true },
  { code: 'EQ_SUP', name: 'Equipment Supervisor', nameAr: 'مشرف المعدات', desc: 'Monitors machinery logs, assigns heavy vehicle operators, and issues maintenance alerts.', count: 14, isSystem: false },
  { code: 'PROJ_MAN', name: 'Project Manager', nameAr: 'مدير المشروع', desc: 'Controls assigned site projects, tasks progress, and localized workforce schedules.', count: 18, isSystem: false }
];

// Position permissions mapping
const POSITION_PERMISSIONS_PRESETS: Record<string, string[]> = {
  'HR Officer': ['Personnel View', 'Personnel Edit', 'Leave Approve', 'Attendance View'],
  'Payroll Officer': ['Payroll Edit', 'Loan Create', 'Deduction Edit'],
  'Equipment Supervisor': ['Equipment Edit', 'Maintenance Create', 'Operator Assign'],
  'Finance Manager': ['Budget Approve', 'Payroll Approve', 'Audit View'],
  'System Administrator': ['All Modules View', 'All Modules Edit', 'Security Policies Edit', 'Audit Logs Clear']
};

export default function SecurityView({ state, isRtl, onRefresh }: SecurityViewProps) {
  // Navigation inside IAM Console
  const [activeSubTab, setActiveSubTab] = useState<'iam' | 'rbac' | 'scopes' | 'compliance'>('iam');

  // Interactive states
  const [provisioningEmployeeId, setProvisioningEmployeeId] = useState<string>('');
  const [provisioningStep, setProvisioningStep] = useState<number>(0);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [activationCode, setActivationCode] = useState<string>('');
  const [provisionedUsers, setProvisionedUsers] = useState<any[]>([
    { username: 'S.ALGHAMDI', email: 's.ghamdi@gcc-hr.com', position: 'HR Manager', role: 'HR Administrator', status: 'Active', scope: 'Company Records', mfa: true },
    { username: 'M.AL-HARBI', email: 'm.harbi@gcc-hr.com', position: 'Finance Manager', role: 'Finance Manager', status: 'Active', scope: 'Global Records', mfa: true },
    { username: 'A.AL-SHEHRI', email: 'a.shehri@gcc-hr.com', position: 'Equipment Supervisor', role: 'Equipment Supervisor', status: 'Pending Activation', scope: 'Project Records', mfa: false },
    { username: 'K.AL-QAHTANI', email: 'k.qahtani@gcc-hr.com', position: 'Payroll Officer', role: 'Payroll Officer', status: 'Active', scope: 'Branch Records', mfa: true }
  ]);

  // Roles list
  const [roles, setRoles] = useState<any[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>('HR_OFFICER');
  const [customRoleName, setCustomRoleName] = useState<string>('');
  const [customRoleDesc, setCustomRoleDesc] = useState<string>('');
  const [showRoleSuccess, setShowRoleSuccess] = useState<boolean>(false);

  // Permission settings for the selected role
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, boolean>>>({
    SYS_ADMIN: { View: true, Create: true, Edit: true, Delete: true, Approve: true, Reject: true, Export: true, Print: true, Audit: true },
    HR_ADMIN: { View: true, Create: true, Edit: true, Delete: false, Approve: true, Reject: true, Export: true, Print: true, Audit: true },
    HR_OFFICER: { View: true, Create: true, Edit: true, Delete: false, Approve: false, Reject: false, Export: true, Print: true, Audit: false },
    PAYROLL_MAN: { View: true, Create: true, Edit: true, Delete: false, Approve: true, Reject: true, Export: true, Print: true, Audit: true },
    PAYROLL_OFF: { View: true, Create: false, Edit: true, Delete: false, Approve: false, Reject: false, Export: false, Print: true, Audit: false },
    FIN_MAN: { View: true, Create: false, Edit: false, Delete: false, Approve: true, Reject: true, Export: true, Print: true, Audit: true },
    EQ_SUP: { View: true, Create: true, Edit: true, Delete: false, Approve: false, Reject: false, Export: true, Print: false, Audit: false },
    PROJ_MAN: { View: true, Create: true, Edit: true, Delete: false, Approve: true, Reject: false, Export: true, Print: true, Audit: false },
  });

  // Data scope security state
  const [dataScope, setDataScope] = useState<string>('Department Records');
  const [scopeDetails, setScopeDetails] = useState<string>(
    'Restricts the active user to reading and managing personnel documents, logs, and timesheets exclusively belonging to their current organizational department.'
  );

  // Dynamic Permission Inheritance Simulator
  const [testEmployeeId, setTestEmployeeId] = useState<string>('');
  const [testPosition, setTestPosition] = useState<string>('HR Officer');
  const [testDepartment, setTestDepartment] = useState<string>('Human Resources');
  const [testInheritedPerms, setTestInheritedPerms] = useState<string[]>(POSITION_PERMISSIONS_PRESETS['HR Officer']);
  const [testLog, setTestLog] = useState<string[]>(['Initialization of local directory test simulation system.']);

  // Role templates listing
  const roleTemplates = [
    { name: 'HR Template', target: 'HR Staff onboarding', reduction: '90%', activePermissions: ['Personnel View', 'Personnel Create', 'Personnel Edit', 'Leave Approve'] },
    { name: 'Payroll Template', target: 'Finance & Compensation', reduction: '85%', activePermissions: ['Payroll View', 'Payroll Edit', 'Loan Review', 'Salary Recalculate'] },
    { name: 'Equipment Template', target: 'Fleet & Logistical Operations', reduction: '80%', activePermissions: ['Fleet View', 'Odometer Edit', 'Work Order Create'] },
    { name: 'Executive Template', target: 'Corporate C-Suite', reduction: '95%', activePermissions: ['Corporate Dashboard View', 'Financial Audit', 'Export Worldwide'] }
  ];

  // Exceptions panel state
  const [exceptionUser, setExceptionUser] = useState<string>('Sajid Mahmood');
  const [exceptionType, setExceptionType] = useState<string>('Additional Permissions');
  const [exceptionPermission, setExceptionPermission] = useState<string>('Payroll Override Access');
  const [exceptionDuration, setExceptionDuration] = useState<number>(120); // minutes
  const [exceptionsList, setExceptionsList] = useState<any[]>([
    { user: 'Sajid Mahmood', type: 'Additional Permissions', permission: 'Heavy Equipment Maintenance Bypass', durationLeft: 45, status: 'Active' },
    { user: 'Ali Al-Mansoori', type: 'Temporary Access', permission: 'Full System Audit View', durationLeft: 110, status: 'Active' }
  ]);

  // Pending elevation requests inbox
  const [elevationRequests, setElevationRequests] = useState<any[]>([
    { id: 'EL-9032', requester: 'Aisha Fahad', position: 'HR Officer', requestedRole: 'HR Administrator', reason: 'Covering department manager leave for Q2 audit preparation.', status: 'Pending', date: '2026-06-25' },
    { id: 'EL-9033', requester: 'Sami Yusuf', position: 'Project Manager', requestedRole: 'Finance Approver', reason: 'Approve urgent concrete supply invoices exceeding normal department budget.', status: 'Pending', date: '2026-06-25' }
  ]);

  // Segregation of Duties (SoD) Engine
  const [sodStatus, setSodStatus] = useState<'clean' | 'violation'>('violation');
  const [sodViolations, setSodViolations] = useState<any[]>([
    { id: 'SOD-ERR-101', rule: 'Double-Entry Processing Restraint', description: 'User Sarah Khalid Al-Ghamdi currently possesses both "Payroll Processing" and "Payroll Approver" authorizations, breaching SoD Policy 4.2.', severity: 'CRITICAL', resolutionStatus: 'Unresolved' }
  ]);

  // Field level security state
  const [fieldSecRole, setFieldSecRole] = useState<string>('HR Officer');
  const [maskState, setMaskState] = useState<boolean>(true);

  // Emergency access Break-Glass states
  const [breakGlassActive, setBreakGlassActive] = useState<boolean>(false);
  const [breakGlassUser, setBreakGlassUser] = useState<string>('Super Admin Override');
  const [breakGlassReason, setBreakGlassReason] = useState<string>('');
  const [breakGlassCountdown, setBreakGlassCountdown] = useState<number>(3600); // 1 hour

  // Audit Logs array
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'LOG-88091', timestamp: '2026-06-25 06:40:12', user: 'SARAH.KH', role: 'Super Administrator', action: 'CREATE_USER', detail: 'Provisioned user account for Ahmed Ghamdi (EMP-2026-102)', ip: '10.140.2.19' },
    { id: 'LOG-88090', timestamp: '2026-06-25 05:12:44', user: 'SYSTEM', role: 'Automated IAM Engine', action: 'INHERIT_PERM', detail: 'Recalculated role assignment permissions for Sami Yusuf due to project relocation.', ip: 'localhost' },
    { id: 'LOG-88089', timestamp: '2026-06-25 04:30:11', user: 'M.AL-HARBI', role: 'Finance Manager', action: 'APPROVE_PAYROLL', detail: 'Authorized central bank salary transmission sheet for Riyadh branch.', ip: '10.140.4.88' },
    { id: 'LOG-88088', timestamp: '2026-06-25 03:01:05', user: 'EXTERNAL_HACK', role: 'Anonymous User', action: 'LOGIN_FAILURE', detail: 'Suspicious login block on user admin. Attempted IP banned.', ip: '198.51.100.42' }
  ]);

  // Simulate exception creation
  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    const newEx = {
      user: exceptionUser,
      type: exceptionType,
      permission: exceptionPermission,
      durationLeft: exceptionDuration,
      status: 'Active'
    };
    setExceptionsList([newEx, ...exceptionsList]);
    addAuditLog('GRANT_EXCEPTION', `Granted temporary [${exceptionType}] exceptions for [${exceptionPermission}] to ${exceptionUser}`);
  };

  // Helper to append audit logs
  const addAuditLog = (action: string, detail: string) => {
    const newLog = {
      id: `LOG-${Math.floor(Math.random() * 100000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'SARAH.KH',
      role: 'Super Administrator',
      action,
      detail,
      ip: '10.140.2.19'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Simulate employee-to-user account provisioning
  const handleSimulateProvisioning = () => {
    if (!provisioningEmployeeId) return;
    const selectedEmp = state.employees.find(e => e.id === provisioningEmployeeId);
    if (!selectedEmp) return;

    setProvisioningStep(1);
    
    // Step-by-step automatic generation simulation
    setTimeout(() => {
      setProvisioningStep(2); // Generate employee details
      setTimeout(() => {
        setProvisioningStep(3); // Assign departments and role templates
        const newUsername = selectedEmp.fullName.split(' ')[0].toUpperCase() + '.' + selectedEmp.id.substring(4);
        const newEmail = `${selectedEmp.fullName.split(' ')[0].toLowerCase()}@gcc-hr.com`;
        const tempPass = 'GCC-TEMP-' + Math.floor(100000 + Math.random() * 900000);
        
        setTempPassword(tempPass);
        setActivationCode('ACT-' + Math.floor(1000 + Math.random() * 9000));
        
        // Add user to provisioned database state representation
        const newUser = {
          username: newUsername,
          email: newEmail,
          position: selectedEmp.position,
          role: selectedEmp.position.includes('Manager') ? 'HR Administrator' : 'HR Officer',
          status: 'Pending Activation',
          scope: 'Department Records',
          mfa: false
        };

        setProvisionedUsers([newUser, ...provisionedUsers]);
        setProvisioningStep(4); // Activation email simulated

        addAuditLog('PROVISION_USER', `Automatically provisioned user account ${newUsername} for employee ${selectedEmp.fullName} (${selectedEmp.id})`);
      }, 1000);
    }, 1000);
  };

  // Trigger dynamic inheritance calculation
  const handleInheritanceTestChange = (pos: string) => {
    setTestPosition(pos);
    const newPerms = POSITION_PERMISSIONS_PRESETS[pos] || ['General View Only'];
    setTestInheritedPerms(newPerms);
    
    const timestamp = new Date().toLocaleTimeString();
    setTestLog([
      `[${timestamp}] Position updated to "${pos}". Recalculating permission graph...`,
      `[${timestamp}] Dynamically inherited permissions: ${newPerms.join(', ')}`,
      `[${timestamp}] Revoking preceding position specific access policies.`,
      ...testLog
    ]);

    addAuditLog('DYNAMIC_INHERIT', `Dynamically updated clearance levels to match position "${pos}"`);
  };

  // Custom role creator
  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleName) return;

    const newCode = 'CUSTOM_' + customRoleName.toUpperCase().replace(/\s+/g, '_');
    const newRole = {
      code: newCode,
      name: customRoleName,
      nameAr: isRtl ? 'دور مخصص' : 'Custom Role',
      desc: customRoleDesc || 'Custom defined organizational permission template.',
      count: 0,
      isSystem: false
    };

    setRoles([...roles, newRole]);
    setPermissionsMatrix({
      ...permissionsMatrix,
      [newCode]: { View: true, Create: false, Edit: false, Delete: false, Approve: false, Reject: false, Export: false, Print: false, Audit: false }
    });
    
    setSelectedRole(newCode);
    setCustomRoleName('');
    setCustomRoleDesc('');
    setShowRoleSuccess(true);
    setTimeout(() => setShowRoleSuccess(false), 4000);

    addAuditLog('CREATE_ROLE', `Created brand new custom security role template [${newCode}]`);
  };

  // Toggle permission matrix checkbox
  const handleToggleMatrix = (roleCode: string, permissionKey: string) => {
    const roleMap = permissionsMatrix[roleCode] || {};
    const updatedRoleMap = {
      ...roleMap,
      [permissionKey]: !roleMap[permissionKey]
    };
    setPermissionsMatrix({
      ...permissionsMatrix,
      [roleCode]: updatedRoleMap
    });

    addAuditLog('MODIFY_PERMISSION', `Adjusted [${permissionKey}] action token for role [${roleCode}]`);
  };

  // Resolve Segregation of Duties Violation
  const handleResolveSod = (violationId: string) => {
    setSodViolations([]);
    setSodStatus('clean');
    addAuditLog('RESOLVE_SOD', `Automated SoD Engine revoked conflicting approvals privilege. System is 100% compliant.`);
  };

  // Trigger emergency Break Glass access
  const handleTriggerBreakGlass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassReason) return;

    setBreakGlassActive(true);
    addAuditLog('BREAK_GLASS_ACTIVE', `WARNING: Critical break-glass override activated by Sarah Khalid Al-Ghamdi. Access rationale: "${breakGlassReason}"`);
  };

  // Reset emergency mode
  const handleRevokeEmergency = () => {
    setBreakGlassActive(false);
    setBreakGlassReason('');
    addAuditLog('BREAK_GLASS_REVOKE', 'Emergency access terminated. All credentials reset and security keys rotated.');
  };

  // Update scope details text helper
  const handleScopeChange = (scope: string) => {
    setDataScope(scope);
    const textMap: Record<string, string> = {
      'Own Records Only': 'Restricts the account strictly to viewing and modifying their own personal log, payroll slips, and leave records. Absolutely no corporate oversight.',
      'Team Records': 'Enables visibility across direct reports or designated peer groupings. Designed primarily for shift leads and line supervisors.',
      'Department Records': 'Enables absolute department-wide access (e.g. all engineering personnel, or all logistics operators). Blocked from seeing other branches.',
      'Branch Records': 'Confines access to the localized region or physical branch (e.g., Jeddah Site Expansion, Riyadh Head Office).',
      'Company Records': 'Allows full operations view across the selected legal entity including regional subsidiaries under the main umbrella.',
      'Project Records': 'Allows specific cross-functional task allocation and status updates localized to active construction projects.',
      'Region Records': 'Spans operations across multi-cities or regions (e.g. Western Region, Eastern Province).',
      'Global Records': 'Complete unrestricted access across all companies, regional branches, active project zones, and national headquarters.'
    };
    setScopeDetails(textMap[scope] || '');
  };

  return (
    <div id="security_iam_view" className="space-y-6">
      {/* Visual Header Banner - Geometric Balance design */}
      <div className="bg-[#1565C0] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Abstract design elements to express geometric balance */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none transform skew-x-12"></div>
        
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-lg">
              <Shield className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/80">
              {isRtl ? 'منصة الأمان والهوية الفيدرالية' : 'Enterprise Identity & Access Console (IAM)'}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight font-sans">
            {isRtl ? 'إدارة الهوية والصلاحيات والتحكم بالوصول' : 'Central Identity, RBAC & Security Governance'}
          </h2>
          <p className="text-xs text-white/80 max-w-2xl">
            {isRtl 
              ? 'بوابة الأمن المركزي للتحكم في تهيئة الحسابات تلقائياً، والتحقق المزدوج وصلاحيات الهياكل التنظيمية والتكامل مع حماية الحقول والبيانات.' 
              : 'Enterprise-grade IAM framework governing dynamic user provisioning, position security, segregation of duties, field-level masking, and emergency break-glass triggers.'}
          </p>
        </div>

        <div className="flex gap-2.5 z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl text-center min-w-[90px]">
            <p className="text-[9px] uppercase tracking-wider text-white/60 font-mono">System Posture</p>
            <p className="text-sm font-black text-green-300">SECURE</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl text-center min-w-[90px]">
            <p className="text-[9px] uppercase tracking-wider text-white/60 font-mono">SoD State</p>
            <p className={`text-sm font-black ${sodStatus === 'clean' ? 'text-green-300' : 'text-amber-300'}`}>
              {sodStatus === 'clean' ? 'COMPLIANT' : 'CONFL_DET'}
            </p>
          </div>
        </div>
      </div>

      {/* Break-Glass active status warning bar */}
      {breakGlassActive && (
        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse">
          <div className="flex gap-3.5 items-start">
            <Flame className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900 text-sm">CRITICAL OVERRIDE: EMERGENCY BREAK-GLASS ACCESS IS ACTIVE</h4>
              <p className="text-xs text-red-700 mt-1">
                Root level administrative tokens have been bypassed under the label <span className="font-mono font-bold bg-red-100 px-1.5 py-0.5 rounded">{breakGlassUser}</span>. All actions are logged and auto-reported to international compliance nodes.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-bold text-red-900 font-mono">System auto-revokes in: 59 min 42 sec</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleRevokeEmergency}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
          >
            Revoke Access & Recalculate Now
          </button>
        </div>
      )}

      {/* Main Tab bar */}
      <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-xs gap-1">
        <button
          onClick={() => setActiveSubTab('iam')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'iam' ? 'bg-[#1565C0] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{isRtl ? 'حسابات المستخدمين التلقائية' : '1. Auto Provisioning & Directory'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('rbac')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'rbac' ? 'bg-[#1565C0] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isRtl ? 'مستويات الصلاحيات وRBAC' : '2. Positions & RBAC Matrix'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('scopes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'scopes' ? 'bg-[#1565C0] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isRtl ? 'حدود البيانات وحماية الحقول' : '3. Scopes & Field Security'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('compliance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'compliance' ? 'bg-[#1565C0] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isRtl ? 'الامتثال وطلب الصلاحيات' : '4. Compliance & Break-Glass'}</span>
        </button>
      </div>

      {/* Content panes */}

      {/* TAB 1: AUTO PROVISIONING */}
      {activeSubTab === 'iam' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Automatic Account Generation Wizard */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
            <div className="border-b pb-3.5">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4.5 h-4.5 text-[#1565C0]" />
                {isRtl ? 'محاكي تهيئة الحسابات التلقائي' : 'Employee-to-User Account Provisioning'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {isRtl 
                  ? 'عند تسجيل موظف جديد، يحصل فوراً على حساب مستخدم مخصص مع الرقم الوظيفي وصلاحيات الهيكل التنظيمي.'
                  : 'Automatic IAM provisioning flow upon registration. No manual IT creation required.'}
              </p>
            </div>

            {/* Simulated interactive provision trigger */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-700">
                1. Select Newly Registered Employee
              </label>
              <select
                value={provisioningEmployeeId}
                onChange={(e) => {
                  setProvisioningEmployeeId(e.target.value);
                  setProvisioningStep(0);
                }}
                className="w-full text-xs border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-[#1565C0]"
              >
                <option value="">-- Choose Employee --</option>
                {state.employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.id} - {emp.fullName} ({emp.position})
                  </option>
                ))}
              </select>

              {provisioningEmployeeId && (
                <button
                  type="button"
                  onClick={handleSimulateProvisioning}
                  disabled={provisioningStep > 0 && provisioningStep < 4}
                  className="w-full bg-[#1565C0] hover:bg-[#1E88E5] text-white text-xs font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:bg-gray-300"
                >
                  <RefreshCw className={`w-4 h-4 ${provisioningStep > 0 && provisioningStep < 4 ? 'animate-spin' : ''}`} />
                  Trigger Auto-Provisioning Sequence
                </button>
              )}

              {/* Real-time provisioning step visualizer */}
              {provisioningStep > 0 && (
                <div className="bg-[#F5F7FA] border border-gray-200 p-4 rounded-xl space-y-3 font-mono text-[11px]">
                  <p className="font-bold text-[#1565C0] mb-2">IAM Provisioning Pipeline Progress:</p>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[9px]">✓</div>
                    <span className="text-gray-800">Assign Unique Employee Number</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[9px]">
                      {provisioningStep >= 2 ? '✓' : '•'}
                    </div>
                    <span className={provisioningStep >= 2 ? 'text-gray-800 font-bold' : 'text-gray-400'}>
                      Generate User Account & Corporate Email
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[9px]">
                      {provisioningStep >= 3 ? '✓' : '•'}
                    </div>
                    <span className={provisioningStep >= 3 ? 'text-gray-800 font-bold' : 'text-gray-400'}>
                      Inherit Role Template based on Position
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[9px]">
                      {provisioningStep >= 4 ? '✓' : '•'}
                    </div>
                    <span className={provisioningStep >= 4 ? 'text-gray-800 font-bold' : 'text-gray-400'}>
                      Generate Temp Password & Dispatch Email
                    </span>
                  </div>

                  {provisioningStep === 4 && (
                    <div className="mt-4 p-3.5 bg-green-50 border border-green-100 rounded-lg text-green-950 font-sans space-y-1 text-xs">
                      <p className="font-bold flex items-center gap-1.5 text-green-800">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Account Created Successfully!
                      </p>
                      <p className="text-[11px] mt-1">
                        Temporary Password: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border">{tempPassword}</strong>
                      </p>
                      <p className="text-[11px]">
                        Activation Link: <strong className="font-mono text-blue-700 underline cursor-pointer hover:text-blue-900">https://gcc-portal.com/activate?token={activationCode}</strong>
                      </p>
                      <p className="text-[10px] text-green-700 italic pt-1">
                        First Login Activation policy has been locked on this account.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Provisioned Directory */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b pb-3.5">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {isRtl ? 'دليل الحسابات النشطة والمحمية' : 'Provisioned Corporate User Directory'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    System security status of mapped employees with federated user logs.
                  </p>
                </div>
                <span className="text-xs bg-blue-50 text-[#1565C0] font-bold px-2.5 py-1 rounded-full border border-blue-100">
                  {provisionedUsers.length} Logged Users
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-gray-400 uppercase font-mono border-b">
                      <th className="pb-2">User / Email</th>
                      <th className="pb-2">Position & Role</th>
                      <th className="pb-2">Security Scope</th>
                      <th className="pb-2">MFA</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y">
                    {provisionedUsers.map((u, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-3">
                          <p className="font-bold text-gray-800">{u.username}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{u.email}</p>
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-gray-700">{u.position}</p>
                          <p className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">{u.role}</p>
                        </td>
                        <td className="py-3 text-gray-500 font-medium">
                          {u.scope}
                        </td>
                        <td className="py-3">
                          <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${u.mfa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.mfa ? 'MFA-ON' : 'MFA-OFF'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.status === 'Active' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-[#1565C0] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-[#1565C0]" />
              <div>
                <p className="font-bold">Bilingual Automatic Enforcer</p>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  Upon first portal login, users are requested to finalize security profiles (authenticator setup, phone registration) to ensure complete alignment with Ministry of HR cyber mandates.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POSITION BASED SECURITY & RBAC */}
      {activeSubTab === 'rbac' && (
        <div className="space-y-6">
          {/* Position Based automatic inheritance simulator & Custom role builder */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Position Inheritance Recalculation Engine */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="border-b pb-3.5">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4.5 h-4.5 text-[#1565C0]" />
                  {isRtl ? 'محاكاة وراثة الصلاحيات التلقائية' : 'Dynamic Permission Inheritance Simulator'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Watch permissions automatically recalculate when an employee undergoes Promotion, Demotion, or Department Transfer!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">1. Target Employee</label>
                  <select
                    value={testEmployeeId}
                    onChange={(e) => {
                      setTestEmployeeId(e.target.value);
                      const selected = state.employees.find(emp => emp.id === e.target.value);
                      if (selected) {
                        handleInheritanceTestChange(selected.position);
                        setTestDepartment(selected.department);
                      }
                    }}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50"
                  >
                    <option value="">-- Choose Employee --</option>
                    {state.employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">2. Mutated Job Position</label>
                  <select
                    value={testPosition}
                    onChange={(e) => handleInheritanceTestChange(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50"
                  >
                    {Object.keys(POSITION_PERMISSIONS_PRESETS).map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Recalculation Dashboard output */}
              <div className="bg-[#151619] text-gray-300 p-4 rounded-xl font-mono text-[11px] space-y-3.5 border border-gray-800">
                <div className="flex justify-between items-center text-white border-b border-gray-800 pb-1.5">
                  <span className="text-amber-400 font-bold">● SIMULATOR LOGS</span>
                  <span className="text-[10px] text-gray-500">Live Recalculation</span>
                </div>
                
                <div className="max-h-[140px] overflow-y-auto space-y-1 scrollbar-thin text-xs">
                  {testLog.map((log, idx) => (
                    <p key={idx} className={idx === 0 ? 'text-green-400' : 'text-gray-400'}>{log}</p>
                  ))}
                </div>

                <div className="bg-gray-900 p-3 rounded border border-gray-800 space-y-2">
                  <p className="font-sans font-bold text-xs text-white uppercase tracking-wider">
                    Effective Active Security Clearance Mappings:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {testInheritedPerms.map((perm, pIdx) => (
                      <span key={pIdx} className="bg-[#1565C0]/20 text-[#42A5F5] border border-[#1565C0]/40 rounded-full px-2.5 py-0.5 text-[10px]">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Role Template Builder */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="border-b pb-3.5">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5 text-[#1565C0]" />
                  {isRtl ? 'منشئ قوالب الأدوار المخصصة' : 'Custom Security Role Template Builder'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Define unlimited custom roles without editing source code. Apply globally immediately.
                </p>
              </div>

              <form onSubmit={handleCreateCustomRole} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Role Display Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Procurement Officer"
                      value={customRoleName}
                      onChange={(e) => setCustomRoleName(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Role Target Description</label>
                    <input
                      type="text"
                      placeholder="Allocates materials workflow authority."
                      value={customRoleDesc}
                      onChange={(e) => setCustomRoleDesc(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2.5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Publish Role Template Globally
                </button>
              </form>

              {showRoleSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-green-600" />
                  Successfully created new security template and added to master directory!
                </div>
              )}

              {/* Role templates cards */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reusable System Templates</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roleTemplates.map((rt, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 p-3 rounded-xl hover:border-[#1565C0] transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-800">{rt.name}</span>
                        <span className="text-[10px] text-[#1565C0] font-black bg-blue-50 px-1.5 rounded">{rt.reduction} Faster</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{rt.target}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rt.activePermissions.slice(0, 2).map((ap, apIdx) => (
                          <span key={apIdx} className="bg-white border text-gray-500 px-1.5 py-0.5 rounded text-[8px] font-mono">
                            {ap}
                          </span>
                        ))}
                        {rt.activePermissions.length > 2 && <span className="text-[8px] text-gray-400 font-mono">+{rt.activePermissions.length - 2} more</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Granular Permissions Framework Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="border-b pb-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-[#1565C0]" />
                  {isRtl ? 'مصفوفة التحكم الدقيقة في الصلاحيات' : 'Granular Access Token Permissions Matrix'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Map and alter actions permission on module levels for selected security role. Immediate enforcement.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-gray-600">Selected Role Profile:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-gray-50 text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 text-blue-900 cursor-pointer"
                >
                  {roles.map(r => (
                    <option key={r.code} value={r.code}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-gray-400 border-b">
                    <th className="pb-3 text-gray-800">System Modules / Action tokens</th>
                    <th className="pb-3 text-center">View slip</th>
                    <th className="pb-3 text-center">Create</th>
                    <th className="pb-3 text-center">Edit</th>
                    <th className="pb-3 text-center">Delete</th>
                    <th className="pb-3 text-center">Approve</th>
                    <th className="pb-3 text-center">Reject</th>
                    <th className="pb-3 text-center">Export</th>
                    <th className="pb-3 text-center">Print</th>
                    <th className="pb-3 text-center">Audit logs</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y font-mono">
                  {['Personnel & Documents', 'Timesheets & Leaves', 'Payroll & Adjustments', 'Projects & Tasks', 'Heavy Machinery Fleet', 'Warehouses Spareparts'].map((moduleName, mIdx) => {
                    const rowPerms = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Print', 'Audit'];
                    return (
                      <tr key={mIdx} className="hover:bg-gray-50/50">
                        <td className="py-3 font-sans font-bold text-gray-800">{moduleName}</td>
                        {rowPerms.map((tok) => {
                          const val = permissionsMatrix[selectedRole]?.[tok] ?? false;
                          return (
                            <td key={tok} className="py-3 text-center">
                              <input
                                type="checkbox"
                                checked={val}
                                onChange={() => handleToggleMatrix(selectedRole, tok)}
                                className="w-4 h-4 text-[#1565C0] focus:ring-[#1565C0] border-gray-300 rounded cursor-pointer"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2.5 items-center bg-[#F5F7FA] p-3 rounded-lg border text-xs text-gray-600">
              <span className="bg-[#1565C0] text-white text-[9px] font-black font-mono px-1.5 py-0.5 rounded">AUTO-ENFORCED</span>
              <span>Modifying any value triggers background session recalculation immediately, safely logging change telemetry in security trails.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA SCOPE & FIELD SECURITY */}
      {activeSubTab === 'scopes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Data Scope controls */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
            <div className="border-b pb-3.5">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-[#1565C0]" />
                {isRtl ? 'حماية البيانات وحدود الوصول الفيدرالية' : 'Organizational Data Scope Boundaries'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Establish visibility parameters restricting record access to specific organizational domains.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-700">Active Visibility Scope Filter</label>
              <div className="grid grid-cols-2 gap-2">
                {['Own Records Only', 'Team Records', 'Department Records', 'Branch Records', 'Company Records', 'Project Records', 'Region Records', 'Global Records'].map((sc) => (
                  <button
                    key={sc}
                    onClick={() => handleScopeChange(sc)}
                    className={`py-3 px-3 text-left rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      dataScope === sc
                        ? 'bg-blue-50 border-[#1565C0] text-[#1565C0]'
                        : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>

              {/* Dynamic Scope Detail description card */}
              <div className="bg-[#F5F7FA] border border-gray-200 p-4 rounded-xl space-y-2">
                <p className="text-xs font-bold text-gray-800">Scope Restriction Parameters:</p>
                <p className="text-xs text-gray-500 leading-relaxed font-sans">{scopeDetails}</p>
              </div>
            </div>
          </div>

          {/* Field Level Security Demonstration */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="border-b pb-3.5">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <EyeOff className="w-4.5 h-4.5 text-[#1565C0]" />
                {isRtl ? 'حماية الحقول الحساسة وإخفائها' : 'Field-Level Security Controls (PII Masking)'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Mask sensitive fields dynamically (Salary, National ID, Bank Details) based on role privileges.
              </p>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-800">Simulate Viewer Position:</p>
                <p className="text-[11px] text-gray-500">How fields look to this role.</p>
              </div>

              <div className="flex gap-2">
                {['HR Officer', 'Payroll Officer', 'Equipment Supervisor'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => {
                      setFieldSecRole(pos);
                      if (pos === 'Payroll Officer') setMaskState(false);
                      else setMaskState(true);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      fieldSecRole === pos
                        ? 'bg-[#1565C0] text-white'
                        : 'bg-white border text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live mask record view */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs font-mono text-xs">
              <div className="bg-gray-50 p-3 border-b font-sans font-bold text-gray-700 flex justify-between items-center">
                <span>Employee Secure Profile Card (Preview)</span>
                <span className="text-[10px] text-gray-400">Target: Ahmed Ghamdi</span>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Full Name:</span>
                  <span className="font-bold font-sans text-gray-800">Ahmed Al-Ghamdi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Position:</span>
                  <span className="font-semibold text-gray-800">Excavator Operator</span>
                </div>
                
                {/* Sensitive field 1 */}
                <div className="flex justify-between items-center border-t border-dashed pt-2">
                  <span className="text-amber-700 font-sans font-semibold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Basic Salary:
                  </span>
                  <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border">
                    {maskState ? '••••••• SAR' : '12,500.00 SAR'}
                  </span>
                </div>

                {/* Sensitive field 2 */}
                <div className="flex justify-between items-center">
                  <span className="text-amber-700 font-sans font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> National ID:
                  </span>
                  <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border">
                    {maskState ? '109•••••••' : '1093245091'}
                  </span>
                </div>

                {/* Sensitive field 3 */}
                <div className="flex justify-between items-center">
                  <span className="text-amber-700 font-sans font-semibold flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> IBAN Bank details:
                  </span>
                  <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border">
                    {maskState ? 'SA820000••••••••••••' : 'SA8200001009320149021'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 text-amber-900 border border-amber-150 p-3.5 rounded-lg text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                PII Protection Warning
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Only the Payroll Officer & Finance Manager roles are authorized to unmask and read detailed compensatory parameters. Systems block and flag any manual script query attempt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE, ELEVATION & BREAK-GLASS */}
      {activeSubTab === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Segregation of Duties (SoD) Verification Engine */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="border-b pb-3.5">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Server className="w-4.5 h-4.5 text-[#1565C0]" />
                  {isRtl ? 'محرك فحص الفصل بين المهام' : 'Segregation of Duties (SoD) Audit Engine'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Automated verification mapping to prevent conflicting credentials (e.g., creating vs. approving payroll).
                </p>
              </div>

              {sodStatus === 'violation' ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <div className="flex gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                    <div>
                      <p className="text-xs font-bold">Policy Conflict Detected</p>
                      <p className="text-[11px] text-red-700 mt-1 leading-relaxed">
                        A critical violation has been caught. User possesses both operational and auditor clearance for financial databases, breaching Ministry SoD code 12.1.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-3 font-mono text-[11px] text-gray-700">
                    <p className="font-bold">Violation ID: {sodViolations[0]?.id}</p>
                    <p className="text-gray-500 mt-1">{sodViolations[0]?.description}</p>
                  </div>

                  <button
                    onClick={() => handleResolveSod('SOD-ERR-101')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Enforce Segregation Policy (Revoke Approver Role)
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-green-900 text-sm">Security Matrix Compliant</h4>
                  <p className="text-xs text-green-700 max-w-sm mx-auto">
                    All users are verified. No conflicting permission bundles (SoD) detected.
                  </p>
                </div>
              )}

              {/* Reusable Exceptions Management */}
              <div className="bg-gray-50 rounded-xl p-4 border space-y-3">
                <p className="text-xs font-bold text-gray-800">Controlled Permanent / Temporary Exceptions</p>
                <form onSubmit={handleAddException} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="User"
                      value={exceptionUser}
                      onChange={(e) => setExceptionUser(e.target.value)}
                      className="border rounded p-2 bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Permission Overrule"
                      value={exceptionPermission}
                      onChange={(e) => setExceptionPermission(e.target.value)}
                      className="border rounded p-2 bg-white"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 rounded cursor-pointer">
                    Inject Temporary Access Exemption
                  </button>
                </form>

                <div className="space-y-1.5">
                  {exceptionsList.map((ex, idx) => (
                    <div key={idx} className="bg-white border rounded p-2 text-[10px] font-mono flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{ex.user}</p>
                        <p className="text-gray-400">{ex.permission}</p>
                      </div>
                      <span className="bg-amber-50 text-amber-700 font-bold px-1.5 rounded border border-amber-150">
                        {ex.durationLeft}m left
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Break-Glass Controls */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="border-b pb-3.5">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 text-red-700">
                  <Flame className="w-4.5 h-4.5 text-red-600 animate-pulse" />
                  {isRtl ? 'نظام تفعيل بروتوكول الطوارئ الأقصى' : 'Emergency Access Management (Break-Glass)'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Controlled procedures to provision root level system parameters bypass under strict regulatory supervision.
                </p>
              </div>

              {!breakGlassActive ? (
                <form onSubmit={handleTriggerBreakGlass} className="space-y-4">
                  <div className="bg-red-50 text-red-950 p-4 rounded-xl border border-red-200 text-xs space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5 text-red-800">
                      <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
                      CRITICAL PROTOCOL WARNING
                    </p>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      Activating "Break-Glass" overrides all security limitations and grants root administrative access. This triggers immediate automated alerting to the external security auditing committee.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">State Reason for Override Activation</label>
                    <textarea
                      rows={3}
                      value={breakGlassReason}
                      onChange={(e) => setBreakGlassReason(e.target.value)}
                      placeholder="e.g. Critical database reconstruction required after localized network crash."
                      className="w-full text-xs border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-red-500 focus:bg-white"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Flame className="w-4 h-4 text-white" />
                    Activate System-Wide Override
                  </button>
                </form>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 mx-auto">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-green-900 text-sm">Emergency Override Active</h4>
                  <p className="text-xs text-green-700 max-w-sm mx-auto">
                    A secure 60-minute window is enabled. Full operations are audited automatically.
                  </p>
                  <button
                    onClick={handleRevokeEmergency}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Manually Revoke Bypasses Now
                  </button>
                </div>
              )}

              {/* Elevated Requests Inbox */}
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Approval-Based Permission Changes Inbox</p>
                <div className="space-y-2">
                  {elevationRequests.map((req, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {req.id}
                          </span>
                          <p className="font-bold text-gray-800 mt-1">{req.requester} ({req.position})</p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[9px]">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-sans">
                        Requested Role: <strong className="text-gray-700">{req.requestedRole}</strong>
                      </p>
                      <p className="text-[11px] text-gray-500 italic font-mono">
                        "{req.reason}"
                      </p>
                      <div className="flex gap-2 pt-1 border-t border-gray-150">
                        <button
                          onClick={() => {
                            setElevationRequests(elevationRequests.filter(r => r.id !== req.id));
                            addAuditLog('APPROVE_ELEVATE', `Approved privilege escalation request ${req.id} for ${req.requester}`);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1 rounded text-[10px] cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setElevationRequests(elevationRequests.filter(r => r.id !== req.id));
                            addAuditLog('REJECT_ELEVATE', `Rejected privilege escalation request ${req.id} for ${req.requester}`);
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 rounded text-[10px] cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {elevationRequests.length === 0 && (
                    <p className="text-[11px] text-gray-400 italic text-center py-2">No pending administrative clearance requests.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent System Security Audit Logging Log */}
      <div className="bg-[#151619] rounded-2xl p-6 text-gray-300 border border-gray-800 space-y-4 shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3.5">
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Server className="w-4.5 h-4.5 text-[#42A5F5]" />
              {isRtl ? 'سجل تتبع تدقيق أمان الهوية المركزي' : 'Live Corporate IAM Access & Activity Audit Log'}
            </h4>
            <p className="text-xs text-gray-500">
              Immutable log record of user session events, login logs, privilege updates, and boundary violations.
            </p>
          </div>

          <button
            onClick={() => {
              setAuditLogs([
                { id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'SYSTEM', role: 'Audit Rotator', action: 'ROTATE_KEYS', detail: 'Rotated server session encryption master keys.', ip: '127.0.0.1' },
                ...auditLogs
              ]);
            }}
            className="px-3 py-1.5 bg-[#1E88E5]/20 hover:bg-[#1E88E5]/30 border border-[#1E88E5]/40 text-[#42A5F5] font-bold text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Rotate Sessions
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800 pb-2">
                <th className="pb-2">Audit ID</th>
                <th className="pb-2">Timestamp (UTC)</th>
                <th className="pb-2">Executing User</th>
                <th className="pb-2">Role Clearance</th>
                <th className="pb-2">Security Event Action</th>
                <th className="pb-2">Metadata Details</th>
                <th className="pb-2 text-right">Host IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5">
                  <td className="py-2.5 text-[#42A5F5] font-bold">{log.id}</td>
                  <td className="py-2.5 text-gray-400">{log.timestamp}</td>
                  <td className="py-2.5 text-white font-bold">{log.user}</td>
                  <td className="py-2.5">
                    <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.2 rounded text-gray-400">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                      log.action.includes('ERR') || log.action.includes('FAILURE') || log.action.includes('GLASS')
                        ? 'bg-red-900/40 text-red-300 border border-red-900/60'
                        : 'bg-green-900/40 text-green-300 border border-green-900/60'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-300">{log.detail}</td>
                  <td className="py-2.5 text-right text-gray-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
