import React, { useState, useEffect } from 'react';
import {
  Mail,
  MessageSquare,
  ShieldAlert,
  Sliders,
  History,
  Users,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Edit2,
  Copy,
  Plus,
  ArrowRight,
  Database,
  Lock,
  Unlock,
  Key,
  KeyRound,
  FileText,
  Clock,
  Play,
  Globe,
  Settings,
  UserCheck,
  Power,
  ChevronRight,
  Search,
  Filter,
  Trash2,
  LockKeyhole
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmailConfig, SmsConfig, MfaConfig, EmailTemplate, EmailLog, SmsLog, QueueItem, AccountSecurityPolicy } from '../types';

interface CommunicationPlatformProps {
  state: any;
  currentUser: { id: string; fullName: string; role: string; department: string };
  isRtl: boolean;
  onRefresh: () => void;
}

export default function CommunicationPlatform({ state, currentUser, isRtl, onRefresh }: CommunicationPlatformProps) {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'email' | 'sms' | 'templates' | 'policies' | 'accounts' | 'logs'>('dashboard');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [queueProcessing, setQueueProcessing] = useState(false);

  // Core configs loaded from backend
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [smsConfig, setSmsConfig] = useState<SmsConfig | null>(null);
  const [mfaConfig, setMfaConfig] = useState<MfaConfig | null>(null);
  const [securityPolicy, setSecurityPolicy] = useState<AccountSecurityPolicy | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Search & Filters
  const [accountSearch, setAccountSearch] = useState('');
  const [accountDeptFilter, setAccountDeptFilter] = useState('All');
  const [accountStatusFilter, setAccountStatusFilter] = useState('All');
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('All');
  const [logTypeFilter, setLogTypeFilter] = useState<'email' | 'sms'>('email');

  // Show/Hide password toggles
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [showSmsApiKey, setShowSmsApiKey] = useState(false);
  const [showSmsSecret, setShowSmsSecret] = useState(false);

  // Template editing states
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('welcome_email');
  const [tempEditName, setTempEditName] = useState('');
  const [tempEditSubject, setTempEditSubject] = useState('');
  const [tempEditSubjectAr, setTempEditSubjectAr] = useState('');
  const [tempEditBody, setTempEditBody] = useState('');
  const [tempEditBodyAr, setTempEditBodyAr] = useState('');
  const [templateLang, setTemplateLang] = useState<'en' | 'ar' | 'both'>('both');

  // Interactive Test Dialog States
  const [showEmailTestModal, setShowEmailTestModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('it-security@almansoori.com');
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string; log?: any } | null>(null);

  const [showSmsTestModal, setShowSmsTestModal] = useState(false);
  const [testSmsNumber, setTestSmsNumber] = useState('+966 50 123 4567');
  const [testSmsMessage, setTestSmsMessage] = useState('GCC-HR: Gateway link diagnostic probe test. Authorized.');
  const [smsTestResult, setSmsTestResult] = useState<{ success: boolean; message: string; log?: any } | null>(null);

  // Alerts
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Fetch full configuration & logs from server
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const [configRes, templatesRes, emailLogsRes, smsLogsRes, queueRes, accountsRes] = await Promise.all([
        fetch('/api/communication/config').then(r => r.json()),
        fetch('/api/communication/templates').then(r => r.json()),
        fetch('/api/communication/logs/email').then(r => r.json()),
        fetch('/api/communication/logs/sms').then(r => r.json()),
        fetch('/api/communication/queue').then(r => r.json()),
        fetch('/api/communication/accounts').then(r => r.json())
      ]);

      setEmailConfig(configRes.emailConfig);
      setSmsConfig(configRes.smsConfig);
      setMfaConfig(configRes.mfaConfig);
      setSecurityPolicy(configRes.securityPolicy);
      
      setTemplates(templatesRes.templates);
      setEmailLogs(emailLogsRes.logs);
      setSmsLogs(smsLogsRes.logs);
      setQueue(queueRes.queue);
      setAccounts(accountsRes.accounts);

      // Populate template form with currently selected template
      const currentTemp = templatesRes.templates.find((t: any) => t.id === selectedTemplateId);
      if (currentTemp) {
        setTempEditName(currentTemp.name);
        setTempEditSubject(currentTemp.subject);
        setTempEditSubjectAr(currentTemp.subjectAr);
        setTempEditBody(currentTemp.body);
        setTempEditBodyAr(currentTemp.bodyAr);
        setTemplateLang(currentTemp.language);
      }
    } catch (err) {
      console.error('Failed to load communication state:', err);
      showToast('error', 'Error loading system configuration from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [selectedTemplateId]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Save Config Helpers
  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailConfig) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/communication/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig)
      });
      const data = await res.json();
      setEmailConfig(data.emailConfig);
      showToast('success', isRtl ? 'تم حفظ إعدادات البريد بنجاح' : 'SMTP server configurations saved and locked.');
      onRefresh();
    } catch (err) {
      showToast('error', 'Failed to save email configuration.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSmsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsConfig) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/communication/sms-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smsConfig)
      });
      const data = await res.json();
      setSmsConfig(data.smsConfig);
      showToast('success', isRtl ? 'تم تفعيل بوابة الرسائل النصية' : 'SMS Gateway credentials updated in secured storage.');
      onRefresh();
    } catch (err) {
      showToast('error', 'Failed to save SMS gateway settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveMfaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaConfig) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/communication/mfa-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mfaConfig)
      });
      const data = await res.json();
      setMfaConfig(data.mfaConfig);
      showToast('success', isRtl ? 'تم تفعيل سياسة التحقق الثنائي' : 'Multi-factor authentication criteria updated.');
      onRefresh();
    } catch (err) {
      showToast('error', 'Failed to update MFA settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSecurityPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityPolicy) return;
    setSaveLoading(true);
    try {
      const res = await fetch('/api/communication/security-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securityPolicy)
      });
      const data = await res.json();
      setSecurityPolicy(data.securityPolicy);
      showToast('success', isRtl ? 'تم تحديث سياسة الحماية الرقمية' : 'Account credential security policies updated.');
      onRefresh();
    } catch (err) {
      showToast('error', 'Failed to update security parameters.');
    } finally {
      setSaveLoading(false);
    }
  };

  // SMTP Test Handler
  const handleTestSmtp = async () => {
    if (!testEmailAddress) return;
    setSaveLoading(true);
    setEmailTestResult(null);
    try {
      const res = await fetch('/api/communication/email-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: testEmailAddress })
      });
      const data = await res.json();
      if (res.ok) {
        setEmailTestResult({ success: true, message: data.message, log: data.log });
        showToast('success', 'SMTP Probe Diagnostics Success!');
        fetchConfigs();
      } else {
        setEmailTestResult({ success: false, message: data.error || 'Connection Failed', log: data.log });
        showToast('error', 'SMTP Connection Handshake Failed.');
      }
    } catch (err) {
      setEmailTestResult({ success: false, message: 'Server communication timed out.' });
      showToast('error', 'Test connection failed.');
    } finally {
      setSaveLoading(false);
    }
  };

  // SMS Test Handler
  const handleTestSms = async () => {
    if (!testSmsNumber || !testSmsMessage) return;
    setSaveLoading(true);
    setSmsTestResult(null);
    try {
      const res = await fetch('/api/communication/sms-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testNumber: testSmsNumber, message: testSmsMessage })
      });
      const data = await res.json();
      if (res.ok) {
        setSmsTestResult({ success: true, message: data.message, log: data.log });
        showToast('success', 'SMS Probe Dispatched Successfully!');
        fetchConfigs();
      } else {
        setSmsTestResult({ success: false, message: data.error || 'Dispatch Failed', log: data.log });
        showToast('error', 'SMS Dispatch Handshake Failed.');
      }
    } catch (err) {
      setSmsTestResult({ success: false, message: 'Server communication timed out.' });
      showToast('error', 'Test dispatch failed.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Process Queue Manual Action
  const handleProcessQueue = async () => {
    setQueueProcessing(true);
    try {
      const res = await fetch('/api/communication/queue/process', { method: 'POST' });
      const data = await res.json();
      showToast('success', `Queue processor executed. ${data.processedCount || 0} tasks evaluated.`);
      fetchConfigs();
      onRefresh();
    } catch (err) {
      showToast('error', 'Failed to execute queue processing worker.');
    } finally {
      setQueueProcessing(false);
    }
  };

  // Resend Email from log
  const handleResendEmail = async (logId: string) => {
    try {
      const res = await fetch('/api/communication/logs/email/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      });
      if (res.ok) {
        showToast('success', 'Email queued and re-dispatched instantly.');
        fetchConfigs();
        onRefresh();
      } else {
        showToast('error', 'Failed to resend log email.');
      }
    } catch (err) {
      showToast('error', 'Server error during resend request.');
    }
  };

  // Save modified template
  const handleSaveTemplate = async () => {
    const updated = templates.map(t => {
      if (t.id === selectedTemplateId) {
        return {
          ...t,
          name: tempEditName,
          subject: tempEditSubject,
          subjectAr: tempEditSubjectAr,
          body: tempEditBody,
          bodyAr: tempEditBodyAr,
          language: templateLang
        };
      }
      return t;
    });

    setSaveLoading(true);
    try {
      const res = await fetch('/api/communication/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: updated })
      });
      if (res.ok) {
        showToast('success', isRtl ? 'تم حفظ القالب بنجاح' : 'Communication template structure saved.');
        fetchConfigs();
      } else {
        showToast('error', 'Failed to update templates.');
      }
    } catch (err) {
      showToast('error', 'Network error while saving templates.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Administrative User Account Action Handler
  const handleUserAccountAction = async (employeeId: string, action: string) => {
    try {
      const res = await fetch('/api/communication/accounts/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, action })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message);
        fetchConfigs();
        onRefresh();
      } else {
        showToast('error', data.error || 'Failed to complete security action.');
      }
    } catch (err) {
      showToast('error', 'Server error while executing account command.');
    }
  };

  // Inject placeholder helper in templates
  const injectPlaceholder = (placeholder: string) => {
    const cursorEn = tempEditBody + ` {{${placeholder}}}`;
    setTempEditBody(cursorEn);
    const cursorAr = tempEditBodyAr + ` {{${placeholder}}}`;
    setTempEditBodyAr(cursorAr);
  };

  // Dynamic filter lists
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.fullName.toLowerCase().includes(accountSearch.toLowerCase()) || 
                          acc.employeeId.toLowerCase().includes(accountSearch.toLowerCase()) ||
                          acc.security.username.toLowerCase().includes(accountSearch.toLowerCase());
    const matchesDept = accountDeptFilter === 'All' || acc.department === accountDeptFilter;
    const matchesStatus = accountStatusFilter === 'All' || 
                          (accountStatusFilter === 'Active' && acc.security.status === 'Active' && !acc.security.isLocked) ||
                          (accountStatusFilter === 'Locked' && acc.security.isLocked) ||
                          (accountStatusFilter === 'Inactive' && acc.security.status === 'Inactive') ||
                          (accountStatusFilter === 'Suspended' && acc.security.status === 'Suspended');
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredLogs = (logTypeFilter === 'email' ? emailLogs : smsLogs).filter((log: any) => {
    const recipient = logTypeFilter === 'email' ? log.recipient : log.recipient;
    const details = logTypeFilter === 'email' ? log.subject : log.message;
    const matchesSearch = recipient.toLowerCase().includes(logSearch.toLowerCase()) || 
                          details.toLowerCase().includes(logSearch.toLowerCase());
    const matchesStatus = logStatusFilter === 'All' || 
                          (logStatusFilter === 'Success' && (log.status === 'Sent' || log.status === 'Delivered')) ||
                          (logStatusFilter === 'Failed' && log.status === 'Failed') ||
                          (logStatusFilter === 'Pending' && (log.status === 'Pending' || log.status === 'Retry Pending'));
    return matchesSearch && matchesStatus;
  });

  // Departments for filters
  const departments = ['All', 'Executive Management', 'Human Resources', 'Finance & Payroll', 'Engineering & Operations', 'Equipment & Fleet', 'Warehouse & Supply Chain'];

  // Mock static data for charts
  const emailChartDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const emailChartValues = [340, 520, 890, 712, 940, 1020, 120]; // Sent volume
  const emailChartFailed = [2, 5, 8, 12, 4, 15, 0];

  const smsChartValues = [120, 240, 310, 415, 290, 380, 45];
  const smsChartFailed = [0, 2, 4, 1, 0, 8, 0];

  return (
    <div className="w-full space-y-6" id="comm_platform_root">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white font-medium ${
              toast.type === 'success' ? 'bg-emerald-600 border border-emerald-500' :
              toast.type === 'error' ? 'bg-rose-600 border border-rose-500' : 'bg-blue-600 border border-blue-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
             toast.type === 'error' ? <XCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Module Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl p-6 relative overflow-hidden border border-blue-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl -ml-20 -mb-20"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-500/30">
                {isRtl ? 'بوابة المدير العام للنظام' : 'Super Administrator Control Panel'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isRtl ? 'منصة الاتصالات والتوثيق والتحقق الثنائي' : 'Enterprise Communication & Authentication Platform'}
            </h1>
            <p className="text-xs text-blue-200 max-w-2xl">
              {isRtl 
                ? 'لوحة تحكم موحدة لإعداد خدمات خادم البريد SMTP، بوابات الرسائل النصية القصيرة، قوالب الإشعارات ثنائية اللغة، التحقق الأمني الثنائي (MFA)، وسياسات الأمان لحسابات الموظفين مع متابعة حية لتدفق الاتصالات.'
                : 'Centralized administration gateway for secure SMTP email servers, SMS APIs, bilingual notification templates, Multi-Factor Authentication (MFA), and credential security policies for Al-Mansoori HR Portal.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={fetchConfigs}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 border border-white/15 transition-all cursor-pointer disabled:opacity-55"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {isRtl ? 'مزامنة الإعدادات' : 'Sync Gateway'}
            </button>
            <button
              onClick={handleProcessQueue}
              disabled={queueProcessing || queue.filter(q => q.status === 'Pending').length === 0}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isRtl ? 'تشغيل رتل الإرسال المعلق' : 'Process Pending Queue'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub tabs Navigation Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-1.5 flex flex-wrap gap-1 shadow-sm">
        {[
          { id: 'dashboard', label: isRtl ? 'لوحة المراقبة' : 'Delivery Metrics', icon: Sliders },
          { id: 'email', label: isRtl ? 'إعدادات البريد (SMTP)' : 'Email (SMTP) Gateway', icon: Mail },
          { id: 'sms', label: isRtl ? 'بوابة الرسائل (SMS)' : 'SMS API Gateways', icon: MessageSquare },
          { id: 'templates', label: isRtl ? 'قوالب الإشعارات' : 'Bilingual Templates', icon: FileText },
          { id: 'policies', label: isRtl ? 'التحقق والأمان (MFA)' : 'MFA & Security Policies', icon: ShieldAlert },
          { id: 'accounts', label: isRtl ? 'إدارة حسابات الموظفين' : 'Account Security Console', icon: Users },
          { id: 'logs', label: isRtl ? 'سجلات الإرسال' : 'System Transmission Logs', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Panel Content Area */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500 font-semibold font-mono">Synchronizing state with Al-Mansoori DB...</span>
        </div>
      ) : (
        <div className="w-full">
          {/* ========================================================== */}
          {/* 1. DASHBOARD VIEW */}
          {/* ========================================================== */}
          {activeSubTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick KPIs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{isRtl ? 'نجاح إرسال البريد' : 'Email Success Rate'}</span>
                    <h3 className="text-2xl font-black text-gray-800 font-mono">98.4%</h3>
                    <p className="text-[10px] text-emerald-600 font-bold">● Active SMTP Relay On</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{isRtl ? 'رسائل الجوال المرسلة' : 'SMS Transmitted'}</span>
                    <h3 className="text-2xl font-black text-gray-800 font-mono">2,845</h3>
                    <p className="text-[10px] text-gray-500 font-semibold font-mono">Cost: 426.75 SAR</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{isRtl ? 'رتل البريد المعلق' : 'Pending Queue Size'}</span>
                    <h3 className="text-2xl font-black text-amber-600 font-mono">{queue.filter(q => q.status === 'Pending').length}</h3>
                    <p className="text-[10px] text-gray-500 font-semibold">Async Job Scheduler Live</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{isRtl ? 'تفعيل الأمان الثنائي' : 'MFA Portal Adoption'}</span>
                    <h3 className="text-2xl font-black text-gray-800 font-mono">100%</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold">Super Admins & HR Locked</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Visual Performance Charts & Queue Controller Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Custom SVG Charts Panel (Full-featured visual delivery performance) */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'مؤشر أداء الإرسال اليومي (آخر 7 أيام)' : 'Weekly Communication Log Volume & Status'}</h3>
                      <p className="text-[10px] text-gray-400">SMTP Server & SMS Gateway aggregated delivery stats</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setLogTypeFilter('email')} 
                        className={`text-[10px] font-bold px-2.5 py-1 rounded ${logTypeFilter === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        Email Metrics
                      </button>
                      <button 
                        onClick={() => setLogTypeFilter('sms')} 
                        className={`text-[10px] font-bold px-2.5 py-1 rounded ${logTypeFilter === 'sms' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        SMS Metrics
                      </button>
                    </div>
                  </div>

                  {/* SVG Chart drawing */}
                  <div className="h-44 w-full relative pt-2">
                    <svg className="w-full h-full" viewBox="0 0 500 150">
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="130" x2="480" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />

                      {/* Line Paths & Bars */}
                      {(() => {
                        const values = logTypeFilter === 'email' ? emailChartValues : smsChartValues;
                        const failed = logTypeFilter === 'email' ? emailChartFailed : smsChartFailed;
                        const maxVal = Math.max(...values, 1);
                        
                        // Generate points for polygon
                        const points = values.map((val, idx) => {
                          const x = 50 + (idx * 65);
                          const y = 130 - ((val / maxVal) * 100);
                          return `${x},${y}`;
                        }).join(' ');

                        return (
                          <>
                            {/* Area under the curve */}
                            <polygon
                              points={`50,130 ${points} 440,130`}
                              fill={logTypeFilter === 'email' ? 'url(#blueGrad)' : 'url(#indigoGrad)'}
                              opacity="0.2"
                            />

                            {/* Main volume line */}
                            <polyline
                              fill="none"
                              stroke={logTypeFilter === 'email' ? '#2563eb' : '#4f46e5'}
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />

                            {/* Data points circles & text */}
                            {values.map((val, idx) => {
                              const x = 50 + (idx * 65);
                              const y = 130 - ((val / maxVal) * 100);
                              return (
                                <g key={idx} className="group cursor-pointer">
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="white"
                                    stroke={logTypeFilter === 'email' ? '#2563eb' : '#4f46e5'}
                                    strokeWidth="2.5"
                                  />
                                  <text
                                    x={x}
                                    y={y - 10}
                                    textAnchor="middle"
                                    className="font-mono text-[9px] font-bold text-gray-700"
                                  >
                                    {val}
                                  </text>
                                  {/* X axis label */}
                                  <text
                                    x={x}
                                    y="145"
                                    textAnchor="middle"
                                    className="text-[10px] text-gray-400 font-bold"
                                  >
                                    {emailChartDays[idx]}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}

                      {/* Definitions for Gradients */}
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="flex justify-center gap-6 pt-1 text-[10px] text-gray-500 font-semibold border-t">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-full ${logTypeFilter === 'email' ? 'bg-blue-600' : 'bg-indigo-600'}`}></span>
                      {logTypeFilter === 'email' ? 'Delivered Emails' : 'Delivered SMS'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      Failure / Relay Dropouts
                    </span>
                  </div>
                </div>

                {/* 2. Real-Time Asynchronous Queue Control Monitor */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'مراقب رتل الإرسال الفوري' : 'Async Queue Monitor'}</h3>
                    <p className="text-[10px] text-gray-400">Emails queued for batch dispatching</p>
                  </div>

                  <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-[10px] space-y-2 h-40 overflow-y-auto border border-slate-800 shadow-inner">
                    <div className="text-blue-400 font-bold">// GCC HR-COMM QUEUE WORKER v1.0.4</div>
                    <div className="text-gray-500">[{new Date().toISOString().split('T')[0]} - Async Daemon Active]</div>
                    
                    {queue.length === 0 ? (
                      <div className="text-emerald-400 font-semibold">✔ Queue is empty. Listening for new HR triggers...</div>
                    ) : (
                      queue.map((item, idx) => (
                        <div key={item.id} className="border-b border-slate-800/60 pb-1.5 last:border-0">
                          <div className="flex justify-between font-bold text-gray-300">
                            <span>#{item.id.split('-')[1]} - {item.templateId}</span>
                            <span className={item.status === 'Sent' ? 'text-emerald-400' : item.status === 'Failed' ? 'text-rose-400' : 'text-amber-400'}>
                              [{item.status}]
                            </span>
                          </div>
                          <div className="text-gray-400 truncate">To: {item.recipient}</div>
                          {item.sentAt && <div className="text-gray-500">Sent at: {new Date(item.sentAt).toLocaleTimeString()}</div>}
                          {item.failureReason && <div className="text-rose-400">Error: {item.failureReason}</div>}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleProcessQueue}
                      disabled={queueProcessing || queue.filter(q => q.status === 'Pending').length === 0}
                      className="w-full bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${queueProcessing ? 'animate-spin' : ''}`} />
                      {isRtl ? 'معالجة رتل الرسائل يدوياً' : 'Fire Manual Queue Dispatch'}
                    </button>
                    {queue.filter(q => q.status === 'Pending').length > 0 && (
                      <p className="text-[9px] text-amber-600 font-bold text-center mt-1.5 animate-pulse">
                        ⚠️ {queue.filter(q => q.status === 'Pending').length} pending email notifications are stuck in spooler.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Audit Trail Snapshot */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'سجل عمليات الأمن والاتصالات' : 'Communication Security Audit Trail'}</h3>
                  <button 
                    onClick={() => setActiveSubTab('logs')}
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1 font-semibold"
                  >
                    {isRtl ? 'عرض السجلات الكاملة' : 'View Comprehensive Logs'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {state.auditLogs?.filter((log: any) => log.module === 'Communication' || log.module === 'Security' || log.module === 'Auth').slice(0, 5).map((log: any) => (
                    <div key={log.id} className="py-2.5 flex items-start justify-between text-xs gap-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-gray-800">{log.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                          <span className="font-mono text-gray-500 font-bold">{log.id}</span>
                          <span>●</span>
                          <span className="font-semibold text-gray-600">{log.userName} ({log.userRole})</span>
                          <span>●</span>
                          <span className="font-mono">{log.ipAddress}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400 font-semibold flex-shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. SMTP EMAIL CONFIGURATION VIEW */}
          {/* ========================================================== */}
          {activeSubTab === 'email' && emailConfig && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Form Panel */}
              <form onSubmit={handleSaveEmailConfig} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-5">
                <div className="border-b pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'إعدادات ملقم SMTP والبريد الصادر' : 'SMTP Outgoing Email Server Config'}</h3>
                    <p className="text-[10px] text-gray-400">Configure corporate email gateways for notifications.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-bold">{isRtl ? 'تفعيل الخدمة' : 'Enable SMTP'}</span>
                    <button
                      type="button"
                      onClick={() => setEmailConfig({ ...emailConfig, enabled: !emailConfig.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${emailConfig.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailConfig.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Grid for Email Provider */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'مزود الخدمة' : 'Email Provider *'}</label>
                    <select
                      value={emailConfig.provider}
                      onChange={(e) => {
                        const prov = e.target.value as any;
                        let host = emailConfig.smtpHost;
                        let port = emailConfig.smtpPort;
                        if (prov === 'm365') { host = 'smtp.office365.com'; port = 587; }
                        else if (prov === 'gmail') { host = 'smtp.gmail.com'; port = 465; }
                        else if (prov === 'sendgrid') { host = 'smtp.sendgrid.net'; port = 465; }
                        else if (prov === 'ses') { host = 'email-smtp.us-east-1.amazonaws.com'; port = 465; }
                        else if (prov === 'mailgun') { host = 'smtp.mailgun.org'; port = 587; }
                        else if (prov === 'brevo') { host = 'smtp-relay.brevo.com'; port = 587; }
                        setEmailConfig({ ...emailConfig, provider: prov, smtpHost: host, smtpPort: port });
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="smtp">Standard Custom SMTP Server</option>
                      <option value="m365">Microsoft 365 (Exchange)</option>
                      <option value="gmail">Google Workspace (Gmail)</option>
                      <option value="sendgrid">SendGrid API Relay</option>
                      <option value="ses">Amazon SES Outgoing Relay</option>
                      <option value="mailgun">Mailgun Service</option>
                      <option value="brevo">Brevo (formerly Sendinblue)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'بروتوكول الأمان' : 'Security protocol *'}</label>
                    <select
                      value={emailConfig.secureMode}
                      onChange={(e) => setEmailConfig({ ...emailConfig, secureMode: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="STARTTLS">STARTTLS (Standard Secure v1.2/v1.3)</option>
                      <option value="SSL">SSL / Implicit TLS (Port 465)</option>
                      <option value="TLS">Explicit TLS</option>
                      <option value="None">None (Unencrypted SMTP - Insecure)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'اسم المضيف SMTP' : 'SMTP Server Hostname *'}</label>
                    <input
                      type="text"
                      required
                      value={emailConfig.smtpHost}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'رقم منفذ SMTP' : 'SMTP Port Number *'}</label>
                    <input
                      type="number"
                      required
                      value={emailConfig.smtpPort}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) || 587 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'اسم مستخدم SMTP' : 'SMTP Username/Account *'}</label>
                    <input
                      type="text"
                      required
                      value={emailConfig.smtpUser}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'كلمة مرور SMTP' : 'SMTP Access Password *'}</label>
                    <div className="relative">
                      <input
                        type={showSmtpPass ? 'text' : 'password'}
                        required
                        value={emailConfig.smtpPassEncrypted}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassEncrypted: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'بريد المرسل الرسمي' : 'Sender Email Address *'}</label>
                    <input
                      type="email"
                      required
                      value={emailConfig.senderEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'اسم المرسل الظاهري' : 'Sender Display Name *'}</label>
                    <input
                      type="text"
                      required
                      value={emailConfig.senderName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'بريد الرد الردود' : 'Reply-To Email Address'}</label>
                    <input
                      type="email"
                      value={emailConfig.replyTo}
                      onChange={(e) => setEmailConfig({ ...emailConfig, replyTo: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'مهلة الاتصال (ميلي ثانية)' : 'Connection Timeout (ms)'}</label>
                    <input
                      type="number"
                      value={emailConfig.timeoutMs}
                      onChange={(e) => setEmailConfig({ ...emailConfig, timeoutMs: parseInt(e.target.value) || 5000 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'عدد محاولات الإرسال' : 'Max Retry Attempts'}</label>
                    <input
                      type="number"
                      value={emailConfig.maxRetries}
                      onChange={(e) => setEmailConfig({ ...emailConfig, maxRetries: parseInt(e.target.value) || 3 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'الحد الأقصى للإرسال اليومي' : 'Daily Dispatch Volume Limit'}</label>
                    <input
                      type="number"
                      value={emailConfig.dailyLimit}
                      onChange={(e) => setEmailConfig({ ...emailConfig, dailyLimit: parseInt(e.target.value) || 5000 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailTestResult(null);
                      setShowEmailTestModal(true);
                    }}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-2 border border-blue-200 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {isRtl ? 'إجراء فحص واختبار SMTP' : 'Verify SMTP Connection & Send Test'}
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-lg shadow-blue-800/10"
                  >
                    {saveLoading ? 'Saving...' : (isRtl ? 'حفظ التغييرات وإقفال' : 'Save SMTP Credentials')}
                  </button>
                </div>
              </form>

              {/* Right Side - Info Box */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3.5">
                  <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2 border-b pb-2">
                    <LockKeyhole className="w-4 h-4 text-blue-600" />
                    {isRtl ? 'معايير تشفير وحماية البيانات' : 'Enterprise Credentials Security'}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {isRtl 
                      ? 'جميع كلمات المرور ومفاتيح المذكرة السرية يتم تشفيرها تلقائياً قبل حفظها في قاعدة البيانات المشفرة ولا تظهر نهائياً في سجلات النظام أو شفرة المصدر الخاصة بالواجهة الأمامية لضمان أعلى مستويات الحماية والامتثال الأمني.'
                      : 'All client connection passwords, credentials, and API Keys are encrypted symmetrically before database commit. The parameters are stored securely and never leakage into front-end browser states or system audit logging payloads.'}
                  </p>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-[11px] text-blue-800 space-y-1">
                    <span className="font-bold">✓ Secure Sandbox Vault Enabled</span>
                    <p className="text-blue-600">Administrative adjustments are reflected in real-time across HR workflows.</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-gray-800 border-b pb-1.5">{isRtl ? 'فحص تشخيص خادم البريد' : 'SMTP Diagnostics Log'}</h4>
                  <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                    {emailLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="py-2 flex items-center justify-between text-[11px] gap-2">
                        <div className="truncate">
                          <span className="font-semibold text-gray-700 block truncate">{log.recipient}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{log.time} - {log.durationMs}ms</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${log.status === 'Sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 3. SMS GATEWAY CONFIGURATION VIEW */}
          {/* ========================================================== */}
          {activeSubTab === 'sms' && smsConfig && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form panel */}
              <form onSubmit={handleSaveSmsConfig} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-5">
                <div className="border-b pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'إعدادات بوابة الرسائل القصيرة SMS Gateway' : 'SMS API Outgoing Gateways'}</h3>
                    <p className="text-[10px] text-gray-400">Configure Saudi national and global SMS notification endpoints.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-bold">{isRtl ? 'تفعيل الخدمة' : 'Enable SMS Gateway'}</span>
                    <button
                      type="button"
                      onClick={() => setSmsConfig({ ...smsConfig, enabled: !smsConfig.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${smsConfig.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smsConfig.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'بوابة الرسائل المعتمدة' : 'SMS Gateway Provider *'}</label>
                    <select
                      value={smsConfig.provider}
                      onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="unifonic">Unifonic Gateway (Saudi Arabia)</option>
                      <option value="taqny">Taqny SMS Integration (Saudi - Certified)</option>
                      <option value="twilio">Twilio Global API</option>
                      <option value="sns">Amazon Web Services SNS Protocol</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'معرف المرسل المعتمد' : 'SMS Sender ID (CITC Approved) *'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ALMANSOORI"
                      value={smsConfig.senderId}
                      onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value.toUpperCase() })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'مفتاح واجهة التطبيق API Key' : 'Gateway API Access Token / Key *'}</label>
                    <div className="relative">
                      <input
                        type={showSmsApiKey ? 'text' : 'password'}
                        required
                        value={smsConfig.apiKeyEncrypted}
                        onChange={(e) => setSmsConfig({ ...smsConfig, apiKeyEncrypted: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmsApiKey(!showSmsApiKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showSmsApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'السر المذيل للربط API Secret' : 'Gateway Security Secret / Salt Value'}</label>
                    <div className="relative">
                      <input
                        type={showSmsSecret ? 'text' : 'password'}
                        value={smsConfig.secretEncrypted}
                        onChange={(e) => setSmsConfig({ ...smsConfig, secretEncrypted: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmsSecret(!showSmsSecret)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showSmsSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{isRtl ? 'الحد اليومي لإرسال الرسائل' : 'Daily SMS Sending Limit'}</label>
                    <input
                      type="number"
                      value={smsConfig.dailyLimit}
                      onChange={(e) => setSmsConfig({ ...smsConfig, dailyLimit: parseInt(e.target.value) || 2000 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSmsTestResult(null);
                      setShowSmsTestModal(true);
                    }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-2 border border-indigo-200 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {isRtl ? 'إجراء فحص واختبار بوابة SMS' : 'Test SMS Gateway API Connection'}
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-lg shadow-indigo-800/10"
                  >
                    {saveLoading ? 'Saving...' : (isRtl ? 'حفظ إعدادات بوابة SMS' : 'Save SMS Gateway Credentials')}
                  </button>
                </div>
              </form>

              {/* Right panel */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3.5">
                  <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2 border-b pb-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    {isRtl ? 'الامتثال للوائح هيئة الاتصالات' : 'CITC Regulatory Compliance'}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {isRtl 
                      ? 'بموجب أنظمة هيئة الاتصالات والفضاء والتقنية بالمملكة العربية السعودية، يجب الحصول على تصريح مسبق لمعرف المرسل لتفادي حظر الرسائل. مفتاح الأمان السرية الخاص ببوابات Unifonic و Taqny مشفرة أمنياً بشكل كامل.'
                      : 'Under CITC regulations in Saudi Arabia, sender IDs must be officially registered and pre-approved by cellular operators before broadcasting alerts. Security tokens are mapped directly within standard isolated containers.'}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-gray-800 border-b pb-1.5">{isRtl ? 'فحص تشخيص بوابة الرسائل' : 'SMS Delivery Pipeline Logs'}</h4>
                  <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                    {smsLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="py-2 flex items-center justify-between text-[11px] gap-2">
                        <div className="truncate">
                          <span className="font-semibold text-gray-700 block truncate">{log.recipient}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{log.time} - {log.provider} - {log.costSAR} SAR</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${log.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 4. EMAIL & NOTIFICATION TEMPLATES VIEW */}
          {/* ========================================================== */}
          {activeSubTab === 'templates' && templates.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Template Selection list */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-2">
                <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">{isRtl ? 'قائمة قوالب النظام ثنائية اللغة' : 'Bilingual System Templates'}</h4>
                <div className="space-y-1.5">
                  {templates.map(t => {
                    const isSel = t.id === selectedTemplateId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                          isSel 
                            ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold' 
                            : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="truncate">{t.name}</span>
                          <span className={`w-2 h-2 rounded-full ${t.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                        </div>
                        <span className="text-[10px] text-gray-400 truncate">{t.subject}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Middle Column: Bilingual Editor */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'تحرير محتوى وتصميم القالب' : 'Bilingual Template Composer'}</h3>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setTemplateLang('en')} 
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${templateLang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      EN Only
                    </button>
                    <button 
                      onClick={() => setTemplateLang('ar')} 
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${templateLang === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      AR Only
                    </button>
                    <button 
                      onClick={() => setTemplateLang('both')} 
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${templateLang === 'both' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Bilingual
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">{isRtl ? 'اسم القالب الإداري' : 'Template Administrative Name *'}</label>
                    <input
                      type="text"
                      required
                      value={tempEditName}
                      onChange={(e) => setTempEditName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                    />
                  </div>

                  {/* Variables injector buttons */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'إدراج المتغيرات الديناميكية للموظف' : 'Dynamic Placeholders Pointer (Click to Insert)'}</label>
                    <div className="flex flex-wrap gap-1">
                      {templates.find(t => t.id === selectedTemplateId)?.variables.map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => injectPlaceholder(v)}
                          className="bg-gray-100 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors"
                        >
                          +{v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(templateLang === 'en' || templateLang === 'both') && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-600">English Component</h4>
                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700">Email Subject Line *</label>
                        <input
                          type="text"
                          required
                          value={tempEditSubject}
                          onChange={(e) => setTempEditSubject(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700">Email Body Body *</label>
                        <textarea
                          required
                          rows={6}
                          value={tempEditBody}
                          onChange={(e) => setTempEditBody(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed focus:outline-none"
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {(templateLang === 'ar' || templateLang === 'both') && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">المكون العربي (Arabic Component)</h4>
                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-right block">موضوع الرسالة باللغة العربية *</label>
                        <input
                          type="text"
                          required
                          dir="rtl"
                          value={tempEditSubjectAr}
                          onChange={(e) => setTempEditSubjectAr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none font-medium font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-right block">نص البريد الإلكتروني باللغة العربية *</label>
                        <textarea
                          required
                          rows={6}
                          dir="rtl"
                          value={tempEditBodyAr}
                          onChange={(e) => setTempEditBodyAr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-sans text-[11px] leading-relaxed focus:outline-none"
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={saveLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-blue-800/10"
                  >
                    {saveLoading ? 'Saving...' : (isRtl ? 'حفظ تعديلات القالب' : 'Save Bilingual Template')}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Mockup Preview */}
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b pb-2 flex justify-between items-center">
                  <span className="font-bold text-xs text-gray-500 uppercase">{isRtl ? 'معاينة حية على الهاتف المحمول' : 'Live Mobile Display Mockup'}</span>
                  <Globe className="w-4 h-4 text-gray-400" />
                </div>

                {/* Mobile Device Frame */}
                <div className="bg-white border-8 border-slate-800 rounded-3xl shadow-xl w-full max-w-[280px] mx-auto overflow-hidden relative min-h-[460px] flex flex-col font-sans">
                  {/* Speaker slot & camera notch */}
                  <div className="w-full h-5 bg-slate-800 flex justify-center items-center relative">
                    <div className="w-16 h-3 bg-black rounded-full"></div>
                  </div>

                  {/* Top Bar */}
                  <div className="bg-slate-900 text-white px-4 py-1 flex justify-between items-center text-[8px] font-mono">
                    <span>ALMANSOORI MAIL</span>
                    <span>12:00 PM</span>
                  </div>

                  {/* Mail App header */}
                  <div className="bg-blue-800 text-white px-3 py-2.5 space-y-0.5 shadow-sm">
                    <span className="text-[7px] font-bold text-blue-200 block">From: hr-alerts@almansoori.com</span>
                    <h5 className="text-[9px] font-bold truncate">
                      {isRtl ? tempEditSubjectAr : tempEditSubject}
                    </h5>
                  </div>

                  {/* Mail Body Mockup content */}
                  <div className="p-3 flex-1 flex flex-col justify-between text-[8.5px] leading-relaxed text-gray-700 overflow-y-auto space-y-3 bg-slate-50/50">
                    <div className="space-y-2 whitespace-pre-line font-medium" dir={isRtl ? 'rtl' : 'ltr'}>
                      {isRtl 
                        ? tempEditBodyAr
                            .replace('{{EmployeeName}}', 'سارة خالد الغامدي')
                            .replace('{{Position}}', 'مدير الموارد البشرية')
                            .replace('{{Department}}', 'الموارد البشرية')
                            .replace('{{Username}}', 'sarah.ghamdi')
                            .replace('{{TemporaryPassword}}', 'Sarah@2026_!')
                            .replace('{{EmployeeID}}', 'EMP-2026-002')
                            .replace('{{ResetLink}}', 'https://hr.almansoori.com/activate?token=DEMO_128')
                            .replace('{{CompanyName}}', 'شركة المنصوري')
                        : tempEditBody
                            .replace('{{EmployeeName}}', 'Sarah Khalid Al-Ghamdi')
                            .replace('{{Position}}', 'HR Manager')
                            .replace('{{Department}}', 'Human Resources')
                            .replace('{{Username}}', 'sarah.ghamdi')
                            .replace('{{TemporaryPassword}}', 'Sarah@2026_!')
                            .replace('{{EmployeeID}}', 'EMP-2026-002')
                            .replace('{{ResetLink}}', 'https://hr.almansoori.com/activate?token=DEMO_128')
                            .replace('{{CompanyName}}', 'Al-Mansoori Co.')
                      }
                    </div>

                    <div className="border-t pt-2 text-center text-[7px] text-gray-400 font-semibold font-mono">
                      AL-MANSOORI IT SECURITY DEPT © 2026
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 5. MFA & ACCOUNT SECURITY POLICIES VIEW */}
          {/* ========================================================== */}
          {activeSubTab === 'policies' && mfaConfig && securityPolicy && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: MFA setup */}
              <form onSubmit={handleSaveMfaConfig} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
                <div className="border-b pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'إعدادات التحقق الثنائي المتعدد (MFA)' : 'Multi-Factor Authentication (MFA)'}</h3>
                    <p className="text-[10px] text-gray-400">Configure global access control verification rules.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-bold">{isRtl ? 'تفعيل شامل' : 'Global MFA Enforced'}</span>
                    <button
                      type="button"
                      onClick={() => setMfaConfig({ ...mfaConfig, globalEnabled: !mfaConfig.globalEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${mfaConfig.globalEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mfaConfig.globalEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Supported MFA Methods */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'طرق التحقق المدعومة' : 'Supported MFA Verification Methods *'}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'email_otp', label: 'Email OTP Code Broadcast', desc: 'Secure generated numeric code to corporate inbox.' },
                        { id: 'sms_otp', label: 'SMS OTP Code Broadcast', desc: 'Secure generated numeric code via CITC cellular route.' },
                        { id: 'authenticator', label: 'Time-Based Authenticator Apps', desc: 'Supports Google Authenticator, Microsoft Auth, Duo.' }
                      ].map(m => {
                        const isChecked = mfaConfig.methods.includes(m.id as any);
                        return (
                          <div key={m.id} className="flex items-start gap-2.5 p-2.5 border rounded-lg bg-gray-50 hover:bg-white transition-all">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const newMethods = isChecked 
                                  ? mfaConfig.methods.filter(x => x !== m.id)
                                  : [...mfaConfig.methods, m.id as any];
                                setMfaConfig({ ...mfaConfig, methods: newMethods });
                              }}
                              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <span className="font-semibold text-gray-800 block text-[11px]">{m.label}</span>
                              <p className="text-[9.5px] text-gray-400">{m.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enforce MFA by Role */}
                  <div className="space-y-2 pt-2 border-t">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'أدوار النظام الملزمة بالتحقق الثنائي' : 'Enforce Mandatory MFA for Selected User Roles'}</label>
                    <div className="space-y-1.5 bg-gray-50 p-3 rounded-lg border">
                      {['Super Administrator', 'HR Manager', 'Finance Manager', 'Project Manager', 'Fleet & Maintenance Manager', 'Employee'].map(role => {
                        const isChecked = mfaConfig.enabledRoles.includes(role);
                        return (
                          <label key={role} className="flex items-center justify-between py-1 border-b last:border-0 cursor-pointer">
                            <span className="font-semibold text-gray-700 text-[11px]">{role}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const newRoles = isChecked 
                                  ? mfaConfig.enabledRoles.filter(r => r !== role)
                                  : [...mfaConfig.enabledRoles, role];
                                setMfaConfig({ ...mfaConfig, enabledRoles: newRoles });
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-blue-800/10"
                  >
                    {saveLoading ? 'Saving...' : (isRtl ? 'حفظ سياسة MFA' : 'Update MFA Requirements')}
                  </button>
                </div>
              </form>

              {/* Right Column: General password / Security Policy */}
              <form onSubmit={handleSaveSecurityPolicy} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'سياسات حماية وأمان حسابات الموظفين' : 'Employee Portal Security Policies'}</h3>
                  <p className="text-[10px] text-gray-400">Define password complexity rules and lockout triggers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'الحد الأدنى لطول كلمة المرور' : 'Min Password Length *'}</label>
                    <select
                      value={securityPolicy.passwordLength}
                      onChange={(e) => setSecurityPolicy({ ...securityPolicy, passwordLength: parseInt(e.target.value) || 8 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="6">6 Characters (Weak)</option>
                      <option value="8">8 Characters (Recommended)</option>
                      <option value="12">12 Characters (Strong Security)</option>
                      <option value="16">16 Characters (Military Grade)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'أقصى محاولات لتسجيل الدخول' : 'Max Failed Login Attempts *'}</label>
                    <select
                      value={securityPolicy.maxLoginAttempts}
                      onChange={(e) => setSecurityPolicy({ ...securityPolicy, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="3">3 Attempts (Strict Lockout)</option>
                      <option value="5">5 Attempts (Standard)</option>
                      <option value="10">10 Attempts (Relaxed)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'مدة إقفال الحساب (دقيقة)' : 'Lockout Duration (mins) *'}</label>
                    <input
                      type="number"
                      value={securityPolicy.lockoutDurationMinutes}
                      onChange={(e) => setSecurityPolicy({ ...securityPolicy, lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'مهلة انتهاء الجلسة (دقيقة)' : 'Session Timeout (mins) *'}</label>
                    <input
                      type="number"
                      value={securityPolicy.sessionTimeoutMinutes}
                      onChange={(e) => setSecurityPolicy({ ...securityPolicy, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'صلاحية كلمة المرور (يوم)' : 'Password Expiry Period (days)'}</label>
                    <input
                      type="number"
                      value={securityPolicy.passwordExpirationDays}
                      onChange={(e) => setSecurityPolicy({ ...securityPolicy, passwordExpirationDays: parseInt(e.target.value) || 90 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'أرشفة كلمات المرور السابقة' : 'Prevent Password Reuse Limit'}</label>
                    <select
                      value={securityPolicy.passwordHistoryLimit}
                      onChange={(e) => setSecurityPolicy({ ...securityPolicy, passwordHistoryLimit: parseInt(e.target.value) || 5 })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="3">3 Past Passwords</option>
                      <option value="5">5 Past Passwords</option>
                      <option value="10">10 Past Passwords</option>
                    </select>
                  </div>

                  {/* Complexity Rules checkboxes */}
                  <div className="sm:col-span-2 space-y-2 pt-2 border-t">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'قواعد ومعايير قوة كلمة المرور' : 'Complexity and Format Rules'}</label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securityPolicy.complexityNumbers}
                          onChange={() => setSecurityPolicy({ ...securityPolicy, complexityNumbers: !securityPolicy.complexityNumbers })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-gray-700">Must contain numeric digits (0-9)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securityPolicy.complexitySpecial}
                          onChange={() => setSecurityPolicy({ ...securityPolicy, complexitySpecial: !securityPolicy.complexitySpecial })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-gray-700">Must contain special characters (e.g. @, #, $, !, &)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securityPolicy.complexityUppercase}
                          onChange={() => setSecurityPolicy({ ...securityPolicy, complexityUppercase: !securityPolicy.complexityUppercase })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-gray-700">Must contain uppercase capital letters (A-Z)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securityPolicy.forcedPasswordChangeOnCreate}
                          onChange={() => setSecurityPolicy({ ...securityPolicy, forcedPasswordChangeOnCreate: !securityPolicy.forcedPasswordChangeOnCreate })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-gray-700">Force temporary password change on first login</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-blue-800/10"
                  >
                    {saveLoading ? 'Saving...' : (isRtl ? 'تحديث السياسات' : 'Save Password Policies')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================== */}
          {/* 6. USER SECURITY CONSOLE VIEW (Unlocking, resets, activation) */}
          {/* ========================================================== */}
          {activeSubTab === 'accounts' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3.5">
                <div>
                  <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'لوحة التحكم بملفات الحماية الأمنية للموظفين' : 'Onboarded Accounts Security Management'}</h3>
                  <p className="text-[10px] text-gray-400">Unlock accounts, reset credentials, revoke sessions and check active MFA profiles.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search name, EMP-ID, user..."
                      value={accountSearch}
                      onChange={(e) => setAccountSearch(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none w-44"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>

                  <select
                    value={accountDeptFilter}
                    onChange={(e) => setAccountDeptFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>

                  <select
                    value={accountStatusFilter}
                    onChange={(e) => setAccountStatusFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="All">All Security Statuses</option>
                    <option value="Active">Active & Unlocked</option>
                    <option value="Locked">Locked (Attempts Exceeded)</option>
                    <option value="Inactive">Deactivated Accounts</option>
                    <option value="Suspended">Suspended/Boundary Voilations</option>
                  </select>
                </div>
              </div>

              {/* Accounts Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[9px] bg-gray-50/50">
                      <th className="py-3 px-4">{isRtl ? 'الموظف / البريد' : 'Employee / Username'}</th>
                      <th className="py-3 px-3">{isRtl ? 'القسم / المسمى' : 'Department & Position'}</th>
                      <th className="py-3 px-3">{isRtl ? 'حالة الحماية' : 'Security Status'}</th>
                      <th className="py-3 px-3">MFA Status</th>
                      <th className="py-3 px-3">{isRtl ? 'تاريخ تعيين كلمة المرور' : 'Password Age'}</th>
                      <th className="py-3 px-4 text-right">{isRtl ? 'إجراءات أمنية إدارية' : 'Administrative Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 font-semibold font-mono">
                          Zero matching security accounts found in Al-Mansoori database.
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map(acc => {
                        const sec = acc.security;
                        return (
                          <tr key={acc.employeeId} className="hover:bg-slate-50/30 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-gray-800">{acc.fullName}</div>
                              <div className="text-[10px] text-gray-400 flex items-center gap-1.5 font-mono">
                                <span className="font-bold text-gray-500">{acc.employeeId}</span>
                                <span>●</span>
                                <span>u: {sec.username}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-medium text-gray-600">{acc.department}</div>
                              <div className="text-[10px] text-gray-400">{acc.position}</div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                sec.isLocked 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                  : sec.status === 'Active' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : sec.status === 'Suspended'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                      : 'bg-gray-100 text-gray-600'
                              }`}>
                                {sec.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                {sec.isLocked ? 'Locked' : sec.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`text-[10px] font-bold ${sec.mfaEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {sec.mfaEnabled ? '● Enabled (Email/App)' : '○ Disabled'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-mono text-[10px] text-gray-500">{sec.passwordSetDate}</div>
                              <div className="text-[9px] text-gray-400">{sec.firstLoginResetRequired ? 'Password Reset Required' : 'Verified'}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {/* Inline administrative action triggers */}
                              <div className="flex items-center justify-end gap-1">
                                {sec.isLocked ? (
                                  <button
                                    onClick={() => handleUserAccountAction(acc.employeeId, 'unlock')}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                    title="Unlock Security Profile"
                                  >
                                    <Unlock className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUserAccountAction(acc.employeeId, 'lock')}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                    title="Administrative Lockout"
                                  >
                                    <Lock className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleUserAccountAction(acc.employeeId, 'reset_password')}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Reset Password & Queue Email"
                                >
                                  <Key className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleUserAccountAction(acc.employeeId, 'welcome_again')}
                                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                  title="Resend Onboarding Welcome Again"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleUserAccountAction(acc.employeeId, 'force_reset')}
                                  className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                  title="Force Reset on next login"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleUserAccountAction(acc.employeeId, 'revoke_sessions')}
                                  className="p-1 text-slate-500 hover:bg-slate-100 rounded text-[10px] font-bold"
                                  title="Revoke Active Sessions"
                                >
                                  <Power className="w-4 h-4 text-rose-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 7. DETAILED DELIVERIES AND SMS SYSTEM TRANSMISSION LOGS VIEW */}
          {/* ========================================================== */}
          {activeSubTab === 'logs' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3.5">
                <div>
                  <h3 className="font-bold text-sm text-gray-800">{isRtl ? 'سجل الاتصالات والإشعارات المعتمد' : 'Corporate Transmission & SMTP/SMS logs'}</h3>
                  <p className="text-[10px] text-gray-400">Search and verify delivery statuses, error codes, and trigger quick resends.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setLogTypeFilter('email'); setLogStatusFilter('All'); }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer ${logTypeFilter === 'email' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    Email Logs
                  </button>
                  <button
                    onClick={() => { setLogTypeFilter('sms'); setLogStatusFilter('All'); }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer ${logTypeFilter === 'sms' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    SMS Logs
                  </button>
                </div>
              </div>

              {/* Sub filters */}
              <div className="flex flex-wrap gap-2 items-center justify-between bg-slate-50/50 p-2 rounded-lg border">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search recipient, contents, subject..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none w-52"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                </div>

                <div className="flex gap-2">
                  <select
                    value={logStatusFilter}
                    onChange={(e) => setLogStatusFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="All">All Delivery Statuses</option>
                    <option value="Success">Success (Delivered / Sent)</option>
                    <option value="Failed">Failed Only</option>
                    <option value="Pending">Pending / Retry</option>
                  </select>
                </div>
              </div>

              {/* Log Table Rendering */}
              {logTypeFilter === 'email' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[9px] bg-gray-50/50">
                        <th className="py-2.5 px-3">Date / Time</th>
                        <th className="py-2.5 px-3">Recipient Address</th>
                        <th className="py-2.5 px-3">Subject Line</th>
                        <th className="py-2.5 px-3">Template</th>
                        <th className="py-2.5 px-3">Status / Response</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400 font-semibold font-mono">
                            Zero matching outgoing email transmission logs found.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50/20">
                            <td className="py-3 px-3 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                              {log.date} <span className="text-gray-400">{log.time}</span>
                            </td>
                            <td className="py-3 px-3 font-medium text-gray-700">{log.recipient}</td>
                            <td className="py-3 px-3 font-semibold text-gray-800 truncate max-w-xs">{log.subject}</td>
                            <td className="py-3 px-3 font-mono text-[10px] text-blue-600 font-bold">{log.templateUsed}</td>
                            <td className="py-3 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'Sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {log.status}
                              </span>
                              {log.smtpResponse && <div className="text-[9px] text-gray-400 truncate max-w-[150px] font-mono mt-0.5">{log.smtpResponse}</div>}
                              {log.failureReason && <div className="text-[9px] text-rose-600 truncate max-w-[150px] font-medium mt-0.5">{log.failureReason}</div>}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleResendEmail(log.id)}
                                className="bg-slate-50 hover:bg-blue-50 border hover:text-blue-700 text-gray-600 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                {isRtl ? 'إعادة إرسال' : 'Resend'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[9px] bg-gray-50/50">
                        <th className="py-2.5 px-3">Date / Time</th>
                        <th className="py-2.5 px-3">Mobile Recipient</th>
                        <th className="py-2.5 px-3">SMS Text Message</th>
                        <th className="py-2.5 px-3">SMS Provider</th>
                        <th className="py-2.5 px-3">CITC Tariff</th>
                        <th className="py-2.5 px-3">Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400 font-semibold font-mono">
                            Zero cellular SMS transmission records located.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50/20">
                            <td className="py-3 px-3 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                              {log.date} <span className="text-gray-400">{log.time}</span>
                            </td>
                            <td className="py-3 px-3 font-bold text-gray-800">{log.recipient}</td>
                            <td className="py-3 px-3 text-gray-600 max-w-sm font-medium">{log.message}</td>
                            <td className="py-3 px-3 font-mono text-[10px] text-indigo-600 font-bold uppercase">{log.provider}</td>
                            <td className="py-3 px-3 font-mono text-[10px] text-gray-500 font-bold">{log.costSAR} SAR</td>
                            <td className="py-3 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {log.status}
                              </span>
                              {log.error && <div className="text-[9px] text-rose-600 font-medium mt-0.5">{log.error}</div>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* EMAIL DIAGNOSTICS TEST PROBE DIALOG MODAL */}
      {/* ========================================================== */}
      {showEmailTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-800 text-white">
              <h3 className="font-bold text-sm">SMTP Gateway Diagnostics Handshake</h3>
              <button onClick={() => setShowEmailTestModal(false)} className="text-white hover:text-gray-200 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-gray-500">
                Execute a connection diagnostics probe to test the configured SMTP parameters and verify handshake authentication.
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Recipient Email Address *</label>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              {emailTestResult && (
                <div className={`p-3 rounded-lg border text-[11px] font-mono leading-relaxed space-y-1.5 ${
                  emailTestResult.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  <span className="font-bold flex items-center gap-1.5">
                    {emailTestResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                    {emailTestResult.message}
                  </span>
                  {emailTestResult.log && (
                    <div className="bg-slate-950 text-slate-200 p-2 rounded text-[10px] space-y-0.5 overflow-x-auto shadow-inner">
                      <div>// SMTP Handshake Logs:</div>
                      <div>ID: {emailTestResult.log.id}</div>
                      <div>Sender: {emailTestResult.log.sender}</div>
                      <div>SMTP Code: {emailTestResult.log.smtpResponse}</div>
                      <div>Handshake Time: {emailTestResult.log.durationMs}ms</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowEmailTestModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={saveLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  {saveLoading ? 'Probing Handshake...' : 'Execute SMTP Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SMS DIAGNOSTICS TEST PROBE DIALOG MODAL */}
      {/* ========================================================== */}
      {showSmsTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-indigo-800 text-white">
              <h3 className="font-bold text-sm">SMS Gateway Diagnostic probe</h3>
              <button onClick={() => setShowSmsTestModal(false)} className="text-white hover:text-gray-200 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-gray-500">
                Trigger a manual API payload test to verify SMS gateway routing and verify cellular connectivity.
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Test Recipient Mobile *</label>
                <input
                  type="text"
                  value={testSmsNumber}
                  onChange={(e) => setTestSmsNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">SMS Body Message *</label>
                <textarea
                  rows={2}
                  value={testSmsMessage}
                  onChange={(e) => setTestSmsMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                ></textarea>
              </div>

              {smsTestResult && (
                <div className={`p-3 rounded-lg border text-[11px] font-mono leading-relaxed space-y-1.5 ${
                  smsTestResult.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  <span className="font-bold flex items-center gap-1.5">
                    {smsTestResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                    {smsTestResult.message}
                  </span>
                  {smsTestResult.log && (
                    <div className="bg-slate-950 text-slate-200 p-2 rounded text-[10px] space-y-0.5 overflow-x-auto shadow-inner">
                      <div>// SMS Gateway Response:</div>
                      <div>Log ID: {smsTestResult.log.id}</div>
                      <div>Sender ID: {smsConfig?.senderId}</div>
                      <div>Cost: {smsTestResult.log.costSAR} SAR</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowSmsTestModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleTestSms}
                  disabled={saveLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  {saveLoading ? 'Transmitting API payload...' : 'Execute SMS Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
