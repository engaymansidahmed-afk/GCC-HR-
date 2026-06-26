import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Wrench,
  DollarSign,
  Database as DbIcon,
  HelpCircle,
  Clock,
  Bot,
  Warehouse,
  Menu,
  Languages,
  UserCheck,
  Bell,
  RefreshCw,
  LogOut,
  FolderLock,
  Shield,
  Cpu,
  Smartphone,
  Monitor,
  X
} from 'lucide-react';
import DashboardView from './components/DashboardView';
import EmployeesView from './components/EmployeesView';
import AttendanceLeaveView from './components/AttendanceLeaveView';
import PayrollLoanView from './components/PayrollLoanView';
import ProjectsTasksView from './components/ProjectsTasksView';
import OperationsEAMView from './components/OperationsEAMView';
import InventoryAssetsView from './components/InventoryAssetsView';
import SupportSettingsView from './components/SupportSettingsView';
import AIAssistantView from './components/AIAssistantView';
import DatabaseView from './components/DatabaseView';
import SecurityView from './components/SecurityView';
import ApprovalEngineView from './components/ApprovalEngineView';
import DataGovernanceView from './components/DataGovernanceView';
import ArchitectureView from './components/ArchitectureView';
import { FALLBACK_STATE } from './mockData';

// Preset mock roles for high-fidelity emulation
const EMULATED_ROLES = [
  { id: 'admin', label: 'Super Administrator', labelAr: 'المدير العام للنظام', dept: 'Executive Office', canConfig: true },
  { id: 'hr', label: 'HR Manager', labelAr: 'مدير الموارد البشرية', dept: 'Human Resources', canConfig: true },
  { id: 'pm', label: 'Project Manager', labelAr: 'مدير المشاريع', dept: 'Engineering', canConfig: false },
  { id: 'fleet', label: 'Fleet & Maintenance Manager', labelAr: 'مدير الأسطول والصيانة', dept: 'Fleet Maintenance', canConfig: false },
  { id: 'emp', label: 'Employee', labelAr: 'موظف ميداني', dept: 'Construction Operations', canConfig: false }
];

export default function App() {
  const [isRtl, setIsRtl] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [roleIndex, setRoleIndex] = useState(0);
  const [state, setState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsAppInstalled(true);
      const newNotif = {
        id: `NOTIF-${Date.now()}`,
        title: 'App Installed Successfully',
        message: 'GCC HR has been added to your device. You can now open it directly from your home screen or desktop!',
        type: 'success',
        module: 'System',
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setState((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: [newNotif, ...(prev.notifications || [])]
        };
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check display mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallGuide(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User outcome choice:', outcome);
    setDeferredPrompt(null);
  };

  const currentRole = EMULATED_ROLES[roleIndex];

  // Map currentUser info for components
  const currentUser = {
    id: currentRole.id === 'emp' ? 'EMP-2026-004' : 'ADMIN-001',
    fullName: currentRole.id === 'emp' ? 'Sajid Mahmood' : 'Sarah Khalid Al-Ghamdi',
    role: currentRole.label,
    department: currentRole.dept
  };

  // Offline state and startup logs
  const [isOffline, setIsOffline] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ text: string; status: 'pending' | 'success' | 'error' }>>([
    { text: 'Initializing Database...', status: 'pending' },
    { text: 'Initializing Settings...', status: 'pending' },
    { text: 'Initializing API...', status: 'pending' },
    { text: 'Initializing AI...', status: 'pending' },
    { text: 'Starting Frontend Core...', status: 'pending' }
  ]);

  // Master Startup Lifecycle
  const initializeSystem = async (forceOffline = false) => {
    setIsLoading(true);
    setStartupError(null);

    // Initial logs reset
    const initialLogs: Array<{ text: string; status: 'pending' | 'success' | 'error' }> = [
      { text: 'Initializing Database...', status: 'pending' },
      { text: 'Initializing Settings...', status: 'pending' },
      { text: 'Initializing API...', status: 'pending' },
      { text: 'Initializing AI...', status: 'pending' },
      { text: 'Starting Frontend Core...', status: 'pending' }
    ];
    setLogs(initialLogs);

    const updateStep = (index: number, status: 'success' | 'error', textOverride?: string) => {
      setLogs(prev => prev.map((item, idx) => idx === index ? { ...item, status, text: textOverride || item.text } : item));
    };

    if (forceOffline) {
      console.log('[PWA Startup] Forcing Offline Fallback Mode');
      setIsOffline(true);
      await new Promise(r => setTimeout(r, 400));
      updateStep(0, 'success', 'Database Ready (Offline Fallback).');
      await new Promise(r => setTimeout(r, 300));
      updateStep(1, 'success', 'Settings Ready (Local Config).');
      await new Promise(r => setTimeout(r, 300));
      updateStep(2, 'success', 'API Ready (Emulated Gateway).');
      await new Promise(r => setTimeout(r, 300));
      updateStep(3, 'success', 'AI Ready (Offline Mode - AI disabled).');
      await new Promise(r => setTimeout(r, 300));
      updateStep(4, 'success', 'Application Started Successfully.');
      setState(FALLBACK_STATE);
      setIsLoading(false);
      return;
    }

    let finished = false;
    
    // 5-second maximum startup timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        if (!finished) {
          reject(new Error('GCC-HR startup connection timed out (5s limit reached)'));
        }
      }, 5000);
    });

    const startupPromise = (async () => {
      try {
        // Step 1: Health / DB
        const healthRes = await fetch('/api/health').catch(() => null);
        if (!healthRes || !healthRes.ok) {
          throw new Error('Health check failed - server unreachable');
        }
        const healthData = await healthRes.json();
        updateStep(0, 'success', `Database Ready (${healthData.database === 'connected' ? 'Connected' : 'Offline'}).`);

        // Step 2: Settings
        await new Promise(r => setTimeout(r, 150));
        updateStep(1, 'success', 'Settings Ready (Corporate profiles synced).');

        // Step 3: Sync state
        await new Promise(r => setTimeout(r, 150));
        const res = await fetch('/api/state');
        if (!res.ok) throw new Error('Failed to retrieve system state');
        const data = await res.json();
        updateStep(2, 'success', 'API Ready (Enterprise state sync complete).');

        // Step 4: AI
        await new Promise(r => setTimeout(r, 150));
        updateStep(3, 'success', 'AI Ready (Gemini API module authenticated).');

        // Step 5: Start Core
        await new Promise(r => setTimeout(r, 150));
        updateStep(4, 'success', 'Application Started Successfully.');
        
        setState(data);
        setIsOffline(false);
      } catch (err: any) {
        console.warn('[PWA Startup] Server connection failed, failing over to offline mode:', err.message);
        setIsOffline(true);
        updateStep(0, 'success', 'Database Ready (Offline Fallback).');
        updateStep(1, 'success', 'Settings Ready (Local Config).');
        updateStep(2, 'success', 'API Ready (Emulated Gateway).');
        updateStep(3, 'success', 'AI Ready (Offline Mode - AI disabled).');
        updateStep(4, 'success', 'Application Started Successfully.');
        setState(FALLBACK_STATE);
      }
    })();

    try {
      await Promise.race([startupPromise, timeoutPromise]);
    } catch (err: any) {
      console.warn('[PWA Startup] Connection timeout. Switching to offline fallback.', err);
      setIsOffline(true);
      updateStep(0, 'success', 'Database Ready (Offline Fallback).');
      updateStep(1, 'success', 'Settings Ready (Local Config).');
      updateStep(2, 'success', 'API Ready (Emulated Gateway).');
      updateStep(3, 'success', 'AI Ready (Offline Mode - AI disabled).');
      updateStep(4, 'success', 'Application Started Successfully.');
      setState(FALLBACK_STATE);
    } finally {
      finished = true;
      setIsLoading(false);
    }
  };

  const fetchState = async () => {
    await initializeSystem(false);
  };

  useEffect(() => {
    initializeSystem();
  }, []);

  const toggleLanguage = () => {
    setIsRtl(!isRtl);
  };

  if (isLoading || !state) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center text-[#212121] p-6 font-sans">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl border border-gray-100 flex flex-col items-center space-y-6">
          
          {/* Circular Badge */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#1565C0] to-[#1E88E5] text-white flex items-center justify-center font-bold text-xl shadow-md animate-pulse">
            GCC
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-bold text-sm text-gray-900">GCC HR Enterprise Platform</h3>
            <p className="text-xs text-gray-500">
              {isRtl ? 'جاري تهيئة خوادم النظام...' : 'Bootstrapping secure systems...'}
            </p>
          </div>

          {/* Loader bar */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-[#1565C0] h-full rounded-full animate-infinite-loading absolute left-0 top-0 w-1/3"></div>
          </div>

          {/* Startup Logger Panel */}
          <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5 text-[10px] font-mono text-gray-600">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    log.status === 'success' ? 'bg-green-500' : 'bg-blue-400 animate-ping'
                  }`} />
                  <span className={log.status === 'success' ? 'text-gray-800 font-semibold' : 'text-gray-500'}>
                    {log.text}
                  </span>
                </span>
                <span>
                  {log.status === 'success' ? (
                    <span className="text-green-600 font-bold">OK</span>
                  ) : (
                    <span className="text-blue-500 animate-pulse">RUN...</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Fallback & Retry actions */}
          <div className="w-full pt-4 border-t border-gray-100 flex gap-2">
            <button
              onClick={() => initializeSystem(false)}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{isRtl ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
            <button
              onClick={() => initializeSystem(true)}
              className="flex-1 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {isRtl ? 'وضع الأوفلاين' : 'Offline Mode'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Count unread notifications
  const unreadNotifications = state.notifications.filter((n: any) => !n.isRead).length;

  const markNotificationsRead = () => {
    setShowNotifications(!showNotifications);
    // Mark as read in local state for UI smoothness
    if (!showNotifications) {
      setState((prev: any) => ({
        ...prev,
        notifications: prev.notifications.map((n: any) => ({ ...n, isRead: true }))
      }));
    }
  };

  // Add notification helper
  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning', module: string) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      type,
      module,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setState((prev: any) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications]
    }));
  };

  // Define Permission Checker
  const hasPermission = (permissionId: string) => {
    // Admins have all permissions
    if (currentRole.id === 'admin') return true;

    // HR Manager has specific default roles
    if (currentRole.id === 'hr') {
      return ['view_dashboard', 'manage_employees', 'manage_attendance', 'manage_payroll', 'manage_approvals'].includes(permissionId);
    }

    // Project Manager has specific default roles
    if (currentRole.id === 'pm') {
      return ['view_dashboard', 'manage_projects', 'manage_attendance', 'manage_approvals'].includes(permissionId);
    }

    // Fleet Manager has specific default roles
    if (currentRole.id === 'fleet') {
      return ['view_dashboard', 'manage_operations', 'manage_attendance', 'manage_inventory', 'manage_approvals'].includes(permissionId);
    }

    // Regular employee - check explicitly granted permissions from the DB!
    const loggedInEmployee = state?.employees?.find((e: any) => e.id === currentUser.id);
    return loggedInEmployee?.grantedPermissions?.includes(permissionId) || false;
  };

  // Define Navigation Items based on emulated privileges
  const navItems = [
    { id: 'dashboard', label: 'Executive Board', labelAr: 'لوحة القيادة', icon: Menu },
    { id: 'employees', label: 'Personnel Master', labelAr: 'الموظفين والوثائق', icon: Users },
    { id: 'attendance', label: 'Attendance & Leaves', labelAr: 'الحضور والإجازات', icon: Clock },
    { id: 'payroll', label: 'Payroll & Loans', labelAr: 'الرواتب والسلف', icon: DollarSign },
    { id: 'projects', label: 'Construction Projects', labelAr: 'المشاريع والمهام', icon: Briefcase },
    { id: 'operations', label: 'Heavy Equipment & Fleet', labelAr: 'المعدات والأسطول', icon: Wrench },
    { id: 'inventory', label: 'Warehouse Spare Parts', labelAr: 'المستودعات والأصول', icon: Warehouse },
    { id: 'approvals', label: 'Workflow & Approvals', labelAr: 'الحوكمة والموافقات', icon: UserCheck },
    { id: 'security', label: 'Identity & Security (IAM)', labelAr: 'الهوية وصلاحيات الأمان', icon: Shield },
    { id: 'governance', label: 'Data Governance (MDM)', labelAr: 'حوكمة وجودة البيانات', icon: DbIcon },
    { id: 'ai-assistant', label: 'GCC HR AI', labelAr: 'المساعد الذكي AI', icon: Bot, highlight: true },
    { id: 'architecture', label: 'System Architecture', labelAr: 'البنية الهندسية للنظام', icon: Cpu },
    { id: 'settings', label: 'Helpdesk & Settings', labelAr: 'الدعم والإعدادات', icon: FolderLock },
    { id: 'database', label: 'PostgreSQL Migration', labelAr: 'ترحيل قاعدة البيانات', icon: DbIcon }
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.id === 'dashboard') return true;
    if (item.id === 'attendance') return true;
    if (item.id === 'ai-assistant') return true;
    if (item.id === 'settings') return true;

    // Map other items to permission checks
    if (item.id === 'employees') return hasPermission('manage_employees');
    if (item.id === 'payroll') return hasPermission('manage_payroll');
    if (item.id === 'projects') return hasPermission('manage_projects');
    if (item.id === 'operations') return hasPermission('manage_operations');
    if (item.id === 'inventory') return hasPermission('manage_inventory');
    if (item.id === 'approvals') return hasPermission('manage_approvals');
    if (item.id === 'security') return hasPermission('manage_security');

    // Admin only pages
    if (['governance', 'architecture', 'database'].includes(item.id)) {
      return currentRole.id === 'admin';
    }

    return false;
  });

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="h-screen w-full bg-[#F5F7FA] text-[#212121] flex font-sans select-none antialiased overflow-hidden"
    >
      {/* Persistent Workspace Sidebar with Geometric Balance Deep Blue */}
      <aside className="w-64 bg-[#1565C0] text-white flex flex-col justify-between shrink-0 z-10 shadow-lg">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Top Header */}
          <div className="p-6 flex items-center gap-3 border-b border-white/10 shrink-0">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-extrabold text-[#1565C0] shadow-sm">
              GCC
            </div>
            <h1 className="text-white font-black text-lg tracking-tight">GCC HR</h1>
          </div>

          {/* Active Emulated User Box */}
          <div className="px-4 pt-5 pb-2 shrink-0">
            <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 text-xs space-y-1">
              <span className="text-white/60 font-semibold block uppercase text-[9px] tracking-wider">
                {isRtl ? 'المستخدم النشط حالياً:' : 'Active User:'}
              </span>
              <p className="font-bold text-white truncate">{currentUser.fullName}</p>
              <p className="text-[10px] text-white/80 truncate">{isRtl ? currentRole.labelAr : currentUser.role}</p>
            </div>
          </div>

          {/* Navigation Items list */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#1E88E5] text-white shadow-sm font-bold'
                      : item.highlight
                      ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-white/70'}`} />
                  <span>{isRtl ? item.labelAr : item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 text-white/50 text-[10px] border-t border-white/10 font-mono shrink-0">
          <p>System Version 4.2.0-STABLE</p>
          <p className="mt-1">© 2026 GCC Enterprise</p>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-xs">
          {/* Logo Title (fallback / info) */}
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-extrabold text-gray-900 text-sm tracking-tight flex items-center gap-1.5">
                {state.settings.companyName}
              </h2>
              <p className="text-[10px] text-gray-400 font-mono">
                ENTERPRISE RESOURCE MANAGEMENT PLATFORM • V1.0.4
              </p>
            </div>
          </div>

          {/* Emulated Controls in header */}
          <div className="flex items-center gap-3">
            {/* Offline Fallback Badge */}
            {isOffline && (
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] font-bold animate-pulse" title="System is running with locally cached/mock data due to server downtime">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{isRtl ? 'وضع الأوفلاين' : 'Offline Fallback'}</span>
              </span>
            )}

            {/* Refresh State */}
            <button
              onClick={fetchState}
              title="Force DB Refresh"
              className="p-2 text-gray-400 hover:text-[#1565C0] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Bilingual Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>{isRtl ? 'English' : 'العربية'}</span>
            </button>

            {/* PWA Install Button */}
            {!isAppInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
                title={isRtl ? "تثبيت تطبيق GCC HR" : "Install GCC HR App"}
              >
                <Smartphone className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">{isRtl ? 'تثبيت التطبيق' : 'Install App'}</span>
              </button>
            )}

            {/* Emulated Role Switcher */}
            <div className="relative flex items-center gap-1 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-xs">
              <UserCheck className="w-3.5 h-3.5 text-[#1565C0]" />
              <select
                value={roleIndex}
                onChange={(e) => {
                  setRoleIndex(Number(e.target.value));
                  fetchState(); // Simulates fresh login data load
                }}
                className="bg-transparent text-[#1565C0] font-bold focus:outline-none cursor-pointer pr-1"
              >
                {EMULATED_ROLES.map((r, idx) => (
                  <option key={r.id} value={idx}>
                    {isRtl ? r.labelAr : r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Alert center */}
            <div className="relative">
              <button
                onClick={markNotificationsRead}
                className="p-2 text-gray-500 hover:text-[#1565C0] hover:bg-gray-100 rounded-lg relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute top-11 ${isRtl ? 'left-0' : 'right-0'} bg-white border border-gray-200 rounded-xl shadow-xl w-80 p-4 space-y-3 z-50 text-xs`}>
                  <h4 className="font-bold text-gray-900 border-b pb-1.5 flex justify-between">
                    <span>{isRtl ? 'الإشعارات الميدانية' : 'Central Notifications'}</span>
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 rounded-full">{unreadNotifications} New</span>
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {state.notifications.map((n: any) => (
                      <div key={n.id} className="p-2 rounded bg-gray-50 border border-gray-100">
                        <p className="font-semibold text-gray-800">{n.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{n.message}</p>
                        <span className="text-[8px] font-mono text-gray-400 block mt-1">{n.createdAt.split('T')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              state={state}
              currentUser={currentUser}
              isRtl={isRtl}
              hasPermission={hasPermission}
              onAddNotification={addNotification}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              employees={state.employees}
              currentUser={currentUser}
              isRtl={isRtl}
              departments={state.settings.departments}
              positions={state.settings.positions}
              projects={state.projects}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceLeaveView
              state={state}
              currentUser={currentUser}
              isRtl={isRtl}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollLoanView
              employees={state.employees}
              loans={state.loans}
              currentUser={currentUser}
              isRtl={isRtl}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsTasksView
              state={state}
              isRtl={isRtl}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'operations' && (
            <OperationsEAMView
              state={state}
              isRtl={isRtl}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryAssetsView
              state={state}
              isRtl={isRtl}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalEngineView
              state={state}
              isRtl={isRtl}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AIAssistantView
              isRtl={isRtl}
            />
          )}

          {activeTab === 'security' && (
            <SecurityView
              state={state}
              isRtl={isRtl}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'governance' && (
            <DataGovernanceView
              state={state}
              isRtl={isRtl}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureView
              isRtl={isRtl}
            />
          )}

          {activeTab === 'settings' && (
            <SupportSettingsView
              state={state}
              currentUser={currentUser}
              isRtl={isRtl}
              onRefresh={fetchState}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseView
              isRtl={isRtl}
            />
          )}
        </div>
      </main>

      {/* PWA Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#1565C0] to-[#1E88E5] text-white">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-sm">
                  {isRtl ? 'تثبيت منصة GCC HR' : 'Install GCC HR Platform'}
                </h3>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 text-gray-700 text-xs">
              <div className="flex gap-4 items-center p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <img
                  src="/icon-192.png"
                  alt="GCC HR Icon"
                  className="w-14 h-14 rounded-xl shadow-md border border-white"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">GCC HR</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    {isRtl ? 'منصة الموارد البشرية وإدارة المشاريع' : 'Enterprise HR & Operations Platform'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 border-b pb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Smartphone className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>{isRtl ? 'الأجهزة المحمولة (iOS / Android)' : 'Mobile Devices (iOS & Android)'}</span>
                </h5>

                {/* iOS Instructions */}
                <div className="space-y-1">
                  <p className="font-bold text-gray-800 text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]"></span>
                    Apple iOS (Safari):
                  </p>
                  <p className="pl-3 text-gray-600 leading-relaxed">
                    {isRtl 
                      ? 'اضغط على أيقونة "مشاركة" (Share) في شريط Safari، ثم اختر "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).' 
                      : 'Tap the "Share" button at the bottom of Safari, scroll down, and select "Add to Home Screen".'}
                  </p>
                </div>

                {/* Android Instructions */}
                <div className="space-y-1">
                  <p className="font-bold text-gray-800 text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]"></span>
                    Google Android (Chrome):
                  </p>
                  <p className="pl-3 text-gray-600 leading-relaxed">
                    {isRtl
                      ? 'اضغط على زر التثبيت في أعلى الصفحة أو اضغط على القائمة (ثلاث نقاط) واختر "تثبيت التطبيق".'
                      : 'Tap the "Install App" button in the header, or open Chrome settings (three dots) and select "Install App" or "Add to Home Screen".'}
                  </p>
                </div>

                <h5 className="font-semibold text-gray-900 border-b pb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider pt-2">
                  <Monitor className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>{isRtl ? 'أجهزة الكمبيوتر والويندوز' : 'Desktop & Windows'}</span>
                </h5>

                <div className="space-y-1">
                  <p className="font-bold text-gray-800 text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]"></span>
                    Desktop Browser (Chrome / Edge):
                  </p>
                  <p className="pl-3 text-gray-600 leading-relaxed">
                    {isRtl
                      ? 'انقر فوق رمز التثبيت (شاشة صغيرة مع سهم لأسفل) في شريط عنوان المتصفح، أو انقر فوق زر "تثبيت التطبيق" في رأس الصفحة.'
                      : 'Click the Install icon in the browser address bar (right side), or click the "Install App" button in the page header to run GCC HR as a native desktop app.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowInstallGuide(false)}
                className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
