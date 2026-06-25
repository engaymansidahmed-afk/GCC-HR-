import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Shuffle,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  Fingerprint,
  Cpu,
  Zap,
  BarChart3,
  FileSpreadsheet,
  Users,
  Briefcase,
  Wrench,
  DollarSign,
  Award,
  RefreshCw,
  Search,
  Lock,
  CornerDownRight
} from 'lucide-react';

interface ApprovalEngineViewProps {
  state: {
    employees: any[];
    settings: any;
    projects: any[];
  };
  isRtl: boolean;
  onRefresh: () => void;
}

// Interfaces for our interactive engine
interface ApprovalRequest {
  id: string;
  module: 'Human Resources' | 'Payroll' | 'Equipment' | 'Maintenance' | 'Finance' | 'Procurement';
  title: string;
  titleAr: string;
  requesterName: string;
  requesterPosition: string;
  valueSAR: number;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Delegated';
  currentStep: number;
  totalSteps: number;
  slaLimitHours: number;
  hoursElapsed: number;
  chain: string[];
  comments: string;
  eSignature?: string;
  ipAddress?: string;
  delegatedTo?: string;
}

interface DelegationRule {
  id: string;
  fromUser: string;
  toUser: string;
  startDate: string;
  endDate: string;
  reason: string;
  scope: string;
  status: 'Active' | 'Scheduled' | 'Expired';
}

interface SmartRule {
  id: string;
  conditionName: string;
  module: string;
  operator: 'less_than' | 'greater_than' | 'equals';
  thresholdValue: number;
  routingChain: string[];
}

export default function ApprovalEngineView({ state, isRtl, onRefresh }: ApprovalEngineViewProps) {
  // Navigation internal tabs
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'inbox' | 'builder' | 'delegation' | 'sla'>('dashboard');

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  // Rejection modal helper state
  const [actioningRequest, setActioningRequest] = useState<ApprovalRequest | null>(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [eSignatureInput, setESignatureInput] = useState('');
  const [validationError, setValidationError] = useState('');

  // 1. Initial Interactive Approval Requests
  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: 'APR-2026-091',
      module: 'Human Resources',
      title: 'Annual Vacation Leave (30 Days)',
      titleAr: 'إجازة سنوية (30 يوم)',
      requesterName: 'Adnan Al-Shehri',
      requesterPosition: 'Lead Civil Engineer',
      valueSAR: 0,
      submittedAt: '2026-06-24 08:30',
      status: 'Pending',
      currentStep: 2,
      totalSteps: 3,
      slaLimitHours: 48,
      hoursElapsed: 22,
      chain: ['Direct Supervisor', 'HR Operations Head', 'Department VP'],
      comments: 'Requesting permission to travel during seasonal project downtime.',
      ipAddress: '10.140.4.15'
    },
    {
      id: 'APR-2026-092',
      module: 'Finance',
      title: 'Personal Loan Request',
      titleAr: 'طلب قرض شخصي',
      requesterName: 'Yousef Al-Otaibi',
      requesterPosition: 'Safety Inspector',
      valueSAR: 45000,
      submittedAt: '2026-06-23 11:15',
      status: 'Pending',
      currentStep: 1,
      totalSteps: 4,
      slaLimitHours: 72,
      hoursElapsed: 44,
      chain: ['Department VP', 'HR Director', 'Chief Financial Officer', 'CEO'],
      comments: 'Urgent medical assistance advance requested with automatic salary deductions.',
      ipAddress: '10.140.2.112'
    },
    {
      id: 'APR-2026-093',
      module: 'Procurement',
      title: 'Grade A Ready-Mix Concrete Purchase',
      titleAr: 'شراء خرسانة جاهزة فئة أ',
      requesterName: 'Bandar Al-Ghamdi',
      requesterPosition: 'Project Manager (Riyadh Site)',
      valueSAR: 185000,
      submittedAt: '2026-06-25 04:10',
      status: 'Pending',
      currentStep: 1,
      totalSteps: 5,
      slaLimitHours: 120,
      hoursElapsed: 2,
      chain: ['Warehouse Inspector', 'Finance Officer', 'Purchasing VP', 'CFO', 'Executive CEO'],
      comments: 'Core material replenishment for Tower C structural basement foundation.',
      ipAddress: '10.144.12.80'
    },
    {
      id: 'APR-2026-094',
      module: 'Equipment',
      title: 'Excavator Allocation & Operator Assignment',
      titleAr: 'تخصيص حفارة وتعيين مشغل',
      requesterName: 'Tariq Mahmood',
      requesterPosition: 'Fleet Supervisor',
      valueSAR: 15000,
      submittedAt: '2026-06-24 14:00',
      status: 'Pending',
      currentStep: 2,
      totalSteps: 3,
      slaLimitHours: 24,
      hoursElapsed: 16,
      chain: ['Logistics Coordinator', 'Plant Fleet Director', 'Finance Manager'],
      comments: 'Deploying Unit EX-300 to Zone B with heavy certified heavy-machinery pilot.',
      ipAddress: '10.140.8.44'
    },
    {
      id: 'APR-2026-085',
      module: 'Payroll',
      title: 'Discretionary Project Bonus',
      titleAr: 'مكافأة مشروع تقديرية',
      requesterName: 'Sarah Khalid Al-Ghamdi',
      requesterPosition: 'HR Generalist',
      valueSAR: 7500,
      submittedAt: '2026-06-22 09:00',
      status: 'Approved',
      currentStep: 3,
      totalSteps: 3,
      slaLimitHours: 48,
      hoursElapsed: 12,
      chain: ['HR Manager', 'Compensation Head', 'CFO'],
      comments: 'Exceptional safety contribution bonus for Riyadh Metro phase completion.',
      eSignature: 'SHA256:8f4c2b9...91e5c20a',
      ipAddress: '10.140.2.19'
    }
  ]);

  // 2. Initial Delegation Rules
  const [delegations, setDelegations] = useState<DelegationRule[]>([
    {
      id: 'DEL-01',
      fromUser: 'Fahad Al-Mansoori (HR VP)',
      toUser: 'Sarah Khalid Al-Ghamdi',
      startDate: '2026-07-01',
      endDate: '2026-07-15',
      reason: 'Out-of-office during annual summer vacation.',
      scope: 'Leaves & Overtime Approvals Only',
      status: 'Scheduled'
    },
    {
      id: 'DEL-02',
      fromUser: 'M. Al-Harbi (Finance Director)',
      toUser: 'Khalid Al-Qahtani',
      startDate: '2026-06-20',
      endDate: '2026-06-28',
      reason: 'Official business travel delegation.',
      scope: 'All Procurement & Expense Approvals < 50,000 SAR',
      status: 'Active'
    }
  ]);

  // Out of Office Form State
  const [newDelegTo, setNewDelegTo] = useState('');
  const [newDelegStart, setNewDelegStart] = useState('');
  const [newDelegEnd, setNewDelegEnd] = useState('');
  const [newDelegReason, setNewDelegReason] = useState('');
  const [newDelegScope, setNewDelegScope] = useState('Leaves & Overtime Approvals Only');

  // 3. Smart Decision Rules
  const [smartRules, setSmartRules] = useState<SmartRule[]>([
    {
      id: 'RUL-01',
      conditionName: 'Low Tier Personal Loans',
      module: 'Finance',
      operator: 'less_than',
      thresholdValue: 5000,
      routingChain: ['Direct Supervisor', 'Department VP']
    },
    {
      id: 'RUL-02',
      conditionName: 'Mid Tier Personal Loans',
      module: 'Finance',
      operator: 'greater_than',
      thresholdValue: 5000,
      routingChain: ['Direct Supervisor', 'HR Manager', 'Chief Financial Officer']
    },
    {
      id: 'RUL-03',
      conditionName: 'High Value Asset Procurement',
      module: 'Procurement',
      operator: 'greater_than',
      thresholdValue: 100000,
      routingChain: ['Warehouse Inspector', 'Purchasing VP', 'Chief Financial Officer', 'Executive CEO']
    }
  ]);

  // New Smart Rule Builder State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleModule, setNewRuleModule] = useState('Finance');
  const [newRuleOperator, setNewRuleOperator] = useState<'less_than' | 'greater_than' | 'equals'>('greater_than');
  const [newRuleThreshold, setNewRuleThreshold] = useState<number>(10000);
  const [newRuleSteps, setNewRuleSteps] = useState<string>('Supervisor, HR VP, CFO');

  // Audit Logs (Central Evidence Ledger)
  const [evidenceLogs, setEvidenceLogs] = useState<any[]>([
    {
      timestamp: '2026-06-25 06:44:11',
      action: 'APPROVE',
      requestId: 'APR-2026-085',
      user: 'Sarah Al-Ghamdi',
      comment: 'Verified timesheet alignment, approved with payroll integration.',
      signature: 'SHA256:8f4c2b989112fc77b91e5c20a',
      ip: '10.140.2.19'
    },
    {
      timestamp: '2026-06-24 14:02:18',
      action: 'DELEGATE_ROUTING',
      requestId: 'APR-2026-091',
      user: 'SYSTEM_ROUTER',
      comment: 'Request auto-routed to Supervisor level based on rule index.',
      signature: 'SYSTEM_TOKEN:f89c02',
      ip: '127.0.0.1'
    },
    {
      timestamp: '2026-06-20 08:00:00',
      action: 'SCHEDULE_DELEGATION',
      requestId: 'N/A',
      user: 'M. Al-Harbi',
      comment: 'Scheduled delegation of authority to Khalid Al-Qahtani during business trip.',
      signature: 'SHA256:cc90321aa78a9',
      ip: '10.140.4.88'
    }
  ]);

  // Metrics calculation
  const totalPending = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;
  
  // Calculate average hours elapsed
  const totalHours = requests.reduce((sum, r) => sum + r.hoursElapsed, 0);
  const avgSlaTime = requests.length ? (totalHours / requests.length).toFixed(1) : '24.0';

  // SLA violation count (elapsed > limit)
  const slaViolations = requests.filter(r => r.status === 'Pending' && r.hoursElapsed > r.slaLimitHours).length;

  // Add new delegation
  const handleAddDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelegTo || !newDelegStart || !newDelegEnd) return;

    const newRule: DelegationRule = {
      id: `DEL-${Date.now().toString().substring(10)}`,
      fromUser: 'Active Super User (Sarah Al-Ghamdi)',
      toUser: newDelegTo,
      startDate: newDelegStart,
      endDate: newDelegEnd,
      reason: newDelegReason,
      scope: newDelegScope,
      status: 'Active'
    };

    setDelegations([newRule, ...delegations]);
    
    // Log in evidence audit
    setEvidenceLogs([
      {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: 'DELEGATE_AUTHORITY',
        requestId: 'N/A',
        user: 'Sarah Al-Ghamdi',
        comment: `Delegated [${newDelegScope}] to acting manager [${newDelegTo}]. Reason: "${newDelegReason}"`,
        signature: `SHA256:del_${Math.random().toString(16).substring(2, 10)}`,
        ip: '10.140.2.19'
      },
      ...evidenceLogs
    ]);

    // reset inputs
    setNewDelegTo('');
    setNewDelegStart('');
    setNewDelegEnd('');
    setNewDelegReason('');
  };

  // Add new dynamic smart routing rule
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRuleSteps) return;

    const parsedChain = newRuleSteps.split(',').map(s => s.trim());
    const newRule: SmartRule = {
      id: `RUL-${Date.now().toString().substring(10)}`,
      conditionName: newRuleName,
      module: newRuleModule,
      operator: newRuleOperator,
      thresholdValue: newRuleThreshold,
      routingChain: parsedChain
    };

    setSmartRules([...smartRules, newRule]);
    
    // reset inputs
    setNewRuleName('');
    setNewRuleSteps('');
  };

  // Handle Approve or Reject execution
  const executeDecision = (status: 'Approved' | 'Rejected') => {
    if (!actioningRequest) return;
    
    if (status === 'Rejected' && !decisionComment.trim()) {
      setValidationError('Mandatory: Rejection comment is strictly required by corporate compliance.');
      return;
    }

    if (!eSignatureInput.trim()) {
      setValidationError('Mandatory: Clear written authorization or digital signature hash is required.');
      return;
    }

    // Update main request array
    const updatedRequests = requests.map(r => {
      if (r.id === actioningRequest.id) {
        return {
          ...r,
          status,
          comments: decisionComment,
          eSignature: `SHA256:${eSignatureInput.substring(0, 8)}...`
        };
      }
      return r;
    });

    setRequests(updatedRequests);

    // Append to immutable audit log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newLog = {
      timestamp,
      action: status === 'Approved' ? 'APPROVE' : 'REJECT',
      requestId: actioningRequest.id,
      user: 'Sarah Al-Ghamdi',
      comment: decisionComment || (status === 'Approved' ? 'Approved through Executive IAM override.' : 'Rejected.'),
      signature: `SHA256:${eSignatureInput}`,
      ip: '10.140.2.19'
    };

    setEvidenceLogs([newLog, ...evidenceLogs]);

    // Reset modals
    setActioningRequest(null);
    setDecisionComment('');
    setESignatureInput('');
    setValidationError('');
  };

  // Filtered requests based on UI selections
  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.titleAr.includes(searchQuery) ||
                          r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = moduleFilter === 'All' || r.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      {/* Visual Header Banner - Centralised Decision-Governance Portal */}
      <div className="bg-[#1565C0] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none transform skew-x-12"></div>
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/80">
              {isRtl ? 'محرك الحوكمة والاعتمادات المركزي' : 'Enterprise Approval Governance Engine'}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight font-sans">
            {isRtl ? 'بوابة القرارات وسلاسل الاعتماد الرقمية' : 'Central Decision Management & Workflow Authorization'}
          </h2>
          <p className="text-xs text-white/80 max-w-2xl">
            {isRtl 
              ? 'نظام معالجة وتفويض الصلاحيات الفوري لكافة أقسام وإجراءات الشركة كالموارد البشرية، والرواتب، وشراء قطع الغيار والطلبات المالية الحساسة بشكل آمن وموثق.'
              : ' কেন্দ্রীয় Approval service enforcing multi-level visual chains, out-of-office delegations, SLA reminders, rule-based values, and immutable digital signatures.'}
          </p>
        </div>

        <div className="flex gap-2.5 z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl text-center min-w-[90px]">
            <p className="text-[9px] uppercase tracking-wider text-white/60 font-mono">Active SLA Rate</p>
            <p className="text-sm font-black text-green-300">92.4%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl text-center min-w-[90px]">
            <p className="text-[9px] uppercase tracking-wider text-white/60 font-mono">Active Rules</p>
            <p className="text-sm font-black text-amber-300">{smartRules.length} POLICIES</p>
          </div>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-xs gap-1">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'dashboard' ? 'bg-[#1565C0] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isRtl ? 'لوحة المراقبة والتنفيذ' : '1. Executive Dashboard'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'inbox' ? 'bg-[#1565C0] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isRtl ? 'صندوق الاعتماد المركزي' : '2. Approval Inbox'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('builder')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'builder' ? 'bg-[#1565C0] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>{isRtl ? 'مصمم سلاسل الاعتماد الذكي' : '3. Dynamic Rule Builder'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('delegation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'delegation' ? 'bg-[#1565C0] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isRtl ? 'تفويض الصلاحيات والإنابة' : '4. Delegations & OOO'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('sla')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'sla' ? 'bg-[#1565C0] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isRtl ? 'مراقبة الـ SLA وموثوقية التوقيع' : '5. SLA & Sign Ledger'}</span>
        </button>
      </div>

      {/* SUBTAB 1: EXECUTIVE DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-500 text-xs font-medium block">
                    {isRtl ? 'الطلبات المعلقة بالاعتماد' : 'Pending Decisions'}
                  </span>
                  <span className="text-3xl font-black text-gray-900 mt-1.5 block">
                    {totalPending}
                  </span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono mt-2 inline-block">
                    Requires Supervisor Action
                  </span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-500 text-xs font-medium block">
                    {isRtl ? 'معدل التزام اتفاقية الخدمة SLA' : 'SLA Compliance Rate'}
                  </span>
                  <span className="text-3xl font-black text-green-600 mt-1.5 block">
                    92.4%
                  </span>
                  <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-mono mt-2 inline-block">
                    Target {'>'} 90.0%
                  </span>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-500 text-xs font-medium block">
                    {isRtl ? 'تجاوزات الـ SLA المسجلة' : 'SLA Escalated Bottlenecks'}
                  </span>
                  <span className="text-3xl font-black text-red-600 mt-1.5 block">
                    {slaViolations}
                  </span>
                  <span className="text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded font-mono mt-2 inline-block">
                    Critical delay warnings
                  </span>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-500 text-xs font-medium block">
                    {isRtl ? 'متوسط سرعة الاعتمادات (ساعة)' : 'Avg Approval Speed'}
                  </span>
                  <span className="text-3xl font-black text-[#1565C0] mt-1.5 block">
                    {avgSlaTime} hrs
                  </span>
                  <span className="text-[10px] text-[#1565C0] bg-blue-50 px-1.5 py-0.5 rounded font-mono mt-2 inline-block">
                    Optimized by Central Engine
                  </span>
                </div>
                <div className="p-3 bg-blue-50 text-[#1565C0] rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual SLA & Modules Bottleneck Heatmap */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Central Bottleneck & SLA Performance Matrix</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Active monitoring of approvals processed per organizational module.
                </p>
              </div>

              {/* Mock Bar Chart representation utilizing native CSS flex & math */}
              <div className="space-y-4 pt-4">
                {[
                  { module: 'Human Resources', count: 18, SLA: 95, color: 'bg-green-500', hours: 4 },
                  { module: 'Payroll', count: 9, SLA: 91, color: 'bg-[#1565C0]', hours: 12 },
                  { module: 'Procurement', count: 24, SLA: 86, color: 'bg-amber-500', hours: 44 },
                  { module: 'Equipment Management', count: 12, SLA: 92, color: 'bg-blue-400', hours: 8 },
                  { module: 'Finance & Loans', count: 6, SLA: 98, color: 'bg-indigo-500', hours: 18 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{item.module}</span>
                      <span className="font-mono text-[11px]">
                        {item.count} Actions • <strong className="text-green-600">{item.SLA}% SLA</strong> • Avg: {item.hours} hrs
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                      <div className={`${item.color} h-full`} style={{ width: `${item.SLA}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Decision Policy Summary */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-green-600 animate-pulse" />
                  Governance Guardrails
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  System policies automatically enforcing Segregation of Duties (SoD) and risk mitigation.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-1 text-xs">
                  <p className="font-bold text-red-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Double-Entry Prevention
                  </p>
                  <p className="text-[10px] text-red-700 leading-relaxed">
                    A user who creates a personal loan or payroll adjustment is automatically restricted from authorizing it at any subsequent level.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1 text-xs">
                  <p className="font-bold text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    High-Value Escrow Locking
                  </p>
                  <p className="text-[10px] text-blue-700 leading-relaxed">
                    Any procurement order exceeding 100k SAR requires simultaneous parallel consent from both the CFO and CEO.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setActiveSubTab('builder')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors mt-2"
              >
                Access Active Policy Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: APPROVAL INBOX (CENTRAL ACTION POINT) */}
      {activeSubTab === 'inbox' && (
        <div className="space-y-6">
          {/* Search Bar & Module Selector */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests by ID, title, requester name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              {['All', 'Human Resources', 'Payroll', 'Equipment', 'Finance', 'Procurement'].map((mod) => (
                <button
                  key={mod}
                  onClick={() => setModuleFilter(mod)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    moduleFilter === mod
                      ? 'bg-[#1565C0] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Active List of Requests */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed text-gray-400 space-y-2">
                <FileText className="w-12 h-12 mx-auto text-gray-300" />
                <p className="font-bold">No Pending Approvals Match Filters</p>
                <p className="text-xs">All organizational workflow channels are completely up-to-date.</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 hover:border-blue-300 transition-colors flex flex-col lg:flex-row justify-between gap-6"
                >
                  {/* Left Column: Request details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 font-bold font-mono text-[10px] px-2 py-0.5 rounded border border-blue-100">
                        {req.id}
                      </span>
                      <span className="bg-gray-100 text-gray-600 font-bold font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                        {req.module}
                      </span>
                      {req.hoursElapsed > req.slaLimitHours && (
                        <span className="bg-red-50 text-red-700 font-bold text-[9px] px-2 py-0.5 rounded animate-pulse border border-red-200 uppercase">
                          SLA EXCEEDED
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {isRtl ? req.titleAr : req.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Requested by: <strong className="text-gray-700">{req.requesterName}</strong> ({req.requesterPosition})
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 italic">
                      "{req.comments || 'No initial rationale provided.'}"
                    </div>

                    {req.valueSAR > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <DollarSign className="w-3.5 h-3.5 text-[#1565C0]" />
                        Value Impact: <strong className="text-gray-900 text-sm">{req.valueSAR.toLocaleString()}</strong> SAR
                      </div>
                    )}
                  </div>

                  {/* Middle Column: Visual Approval Chain Steps */}
                  <div className="lg:w-80 flex flex-col justify-center space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold text-gray-400">
                      <span>Approval Pipeline Route</span>
                      <span>Step {req.currentStep} of {req.totalSteps}</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5">
                      {req.chain.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isCurrent = stepNum === req.currentStep;
                        const isPassed = stepNum < req.currentStep;

                        return (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              isPassed ? 'bg-green-100 text-green-700' :
                              isCurrent ? 'bg-[#1565C0] text-white animate-pulse' :
                              'bg-gray-200 text-gray-500'
                            }`}>
                              {isPassed ? '✓' : stepNum}
                            </div>
                            <span className={`truncate ${
                              isCurrent ? 'font-bold text-gray-900' :
                              isPassed ? 'text-gray-400 line-through' :
                              'text-gray-500'
                            }`}>
                              {step}
                            </span>
                            {isCurrent && <span className="text-[8px] bg-blue-50 text-[#1565C0] px-1.5 rounded font-bold uppercase ml-auto">Active</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Execution Controls */}
                  <div className="lg:w-48 flex flex-col justify-between items-end gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-mono uppercase">Time Elapsed in Step</p>
                      <p className={`text-xs font-bold font-mono mt-0.5 ${req.hoursElapsed > req.slaLimitHours ? 'text-red-600' : 'text-gray-700'}`}>
                        {req.hoursElapsed} hrs elapsed / Limit: {req.slaLimitHours} hrs
                      </p>
                    </div>

                    {req.status === 'Pending' ? (
                      <div className="w-full flex flex-col gap-1.5">
                        <button
                          onClick={() => setActioningRequest(req)}
                          className="w-full bg-[#1565C0] hover:bg-[#1E88E5] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve / Authenticate
                        </button>
                        <button
                          onClick={() => setActioningRequest(req)}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border border-red-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject Request
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {req.status}
                        </span>
                        {req.eSignature && (
                          <p className="text-[9px] text-gray-400 font-mono mt-1">Sign: {req.eSignature}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL / BOTTOM SHEET FOR DECISION ACTIONING */}
      {actioningRequest && (
        <div className="bg-white border-2 border-[#1565C0] rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-start border-b pb-3">
            <div>
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Fingerprint className="w-4.5 h-4.5 text-[#1565C0]" />
                Compliance Authorization Center: {actioningRequest.id}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                You are executing an executive decision. Compliance requires mandatory digital signature and optional rationale.
              </p>
            </div>
            <button
              onClick={() => setActioningRequest(null)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Decision / Rationale Comment <span className="text-red-500 font-bold">*Mandatory if rejecting</span>
              </label>
              <textarea
                placeholder="Enter comments outlining reason for approval or reasons for rejection..."
                value={decisionComment}
                onChange={(e) => {
                  setDecisionComment(e.target.value);
                  setValidationError('');
                }}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#1565C0]"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Corporate Electronic Signature / Password Hash <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Type your employee ID or security pass to sign"
                  value={eSignatureInput}
                  onChange={(e) => {
                    setESignatureInput(e.target.value);
                    setValidationError('');
                  }}
                  className="flex-1 border border-gray-200 rounded-lg p-2.5 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setESignatureInput('SIG_SHA256_' + Math.floor(100000 + Math.random()*900000))}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 rounded-lg border cursor-pointer font-bold"
                >
                  Auto-Gen Signature Hash
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Signing registers your logged credentials, IP address <span className="font-mono">10.140.2.19</span>, and timestamp into the secure local database.
              </p>
            </div>

            {validationError && (
              <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {validationError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => executeDecision('Approved')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Authorize & Approve Request
              </button>
              <button
                onClick={() => executeDecision('Rejected')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Reject Request & Lock File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DYNAMIC APPROVAL CHAIN BUILDER */}
      {activeSubTab === 'builder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Rule builder form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-bold text-gray-900 text-sm">Policy Router Rule Designer</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Design smart criteria directing workflow routes to specific job positions dynamically.
                </p>
              </div>

              <form onSubmit={handleAddRule} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Executive Level Capital Purchases"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Target Module</label>
                    <select
                      value={newRuleModule}
                      onChange={(e) => setNewRuleModule(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-gray-50"
                    >
                      <option value="Human Resources">Human Resources</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Finance">Finance</option>
                      <option value="Procurement">Procurement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Threshold SAR</label>
                    <input
                      type="number"
                      value={newRuleThreshold}
                      onChange={(e) => setNewRuleThreshold(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Approval Sequence Steps (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Supervisor, Department VP, HR Director, CFO"
                    value={newRuleSteps}
                    onChange={(e) => setNewRuleSteps(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono"
                    required
                  />
                  <span className="text-[9px] text-gray-400 mt-1 block">
                    These positions will automatically inherit step credentials sequentially.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1565C0] hover:bg-[#1E88E5] text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Deploy Smart Routing Rule
                </button>
              </form>
            </div>

            {/* Configured routing logic listing */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="border-b pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Active Decision Paths & Value Policies</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Central engine references these rules to inject chains on newly submitted workflows.
                    </p>
                  </div>
                  <span className="text-xs bg-blue-50 text-[#1565C0] font-black px-2.5 py-1 rounded-full border border-blue-100">
                    {smartRules.length} Loaded Guardrails
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {smartRules.map((r) => (
                    <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                            {r.module}
                          </span>
                          <h4 className="font-bold text-gray-800 text-xs mt-1.5">{r.conditionName}</h4>
                        </div>
                        <span className="text-xs font-bold text-gray-900 font-mono">
                          Value {r.operator === 'greater_than' ? '>' : r.operator === 'less_than' ? '<' : '='} {r.thresholdValue.toLocaleString()} SAR
                        </span>
                      </div>

                      <div className="bg-white border rounded-lg p-2.5 flex items-center flex-wrap gap-1.5 text-xs text-gray-600">
                        <Cpu className="w-3.5 h-3.5 text-[#1565C0] shrink-0" />
                        <span className="font-bold text-gray-800 text-[11px] mr-1">Generated Chain:</span>
                        {r.routingChain.map((step, sIdx) => (
                          <React.Fragment key={sIdx}>
                            <span className="bg-blue-50 text-gray-700 text-[10px] px-2 py-0.5 rounded border border-blue-100 font-medium">
                              {step}
                            </span>
                            {sIdx < r.routingChain.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Matrix Override Safeguard</p>
                  <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">
                    If multiple conditions overlap, the central decision engine automatically deploys the most rigorous (longest level) chain template to prevent unauthorized spending limits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: DELEGATIONS & OUT OF OFFICE */}
      {activeSubTab === 'delegation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Delegation trigger form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Delegate Decision Authority</h3>
              <p className="text-xs text-gray-400 mt-1">
                Formally transfer approval credentials to an acting manager when you are out of office or traveling.
              </p>
            </div>

            <form onSubmit={handleAddDelegation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Acting Authorized Manager (Recipient)</label>
                <select
                  value={newDelegTo}
                  onChange={(e) => setNewDelegTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-gray-50"
                  required
                >
                  <option value="">-- Choose Colleague --</option>
                  <option value="Sarah Khalid Al-Ghamdi">Sarah Khalid Al-Ghamdi (HR Officer)</option>
                  <option value="Khalid Al-Qahtani">Khalid Al-Qahtani (Payroll Analyst)</option>
                  <option value="Ali Al-Mansoori">Ali Al-Mansoori (Projects VP)</option>
                  <option value="Majid Mahmood">Majid Mahmood (Fleet Supervisor)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Effective Start</label>
                  <input
                    type="date"
                    value={newDelegStart}
                    onChange={(e) => setNewDelegStart(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Effective End</label>
                  <input
                    type="date"
                    value={newDelegEnd}
                    onChange={(e) => setNewDelegEnd(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Delegated Action Scope</label>
                <select
                  value={newDelegScope}
                  onChange={(e) => setNewDelegScope(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-gray-50"
                >
                  <option value="Leaves & Overtime Approvals Only">Leaves & Overtime Approvals Only</option>
                  <option value="Equipment Deployment Workorders Only">Equipment Deployment Workorders Only</option>
                  <option value="Finance & Expense Claims < 25,000 SAR">Finance & Expense Claims &lt; 25,000 SAR</option>
                  <option value="All Module Authority Oversight">All Module Authority Oversight</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason / Context</label>
                <input
                  type="text"
                  placeholder="e.g., Attending Riyadh Construction Expo"
                  value={newDelegReason}
                  onChange={(e) => setNewDelegReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1565C0] hover:bg-[#1E88E5] text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
              >
                Register Delegation Policy
              </button>
            </form>
          </div>

          {/* Active delegation policies table */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Active Delegation Policies Ledger</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Historical record of acting authority handovers currently in play.
                  </p>
                </div>
                <span className="text-xs bg-green-50 text-green-700 border border-green-100 font-bold px-2 py-0.5 rounded-full">
                  Fully Audited
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {delegations.map((d) => (
                  <div key={d.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded">
                          {d.id}
                        </span>
                        <p className="text-xs font-bold text-gray-800 mt-1.5 flex items-center gap-1">
                          From: <strong className="text-gray-900">{d.fromUser}</strong>
                        </p>
                        <p className="text-xs font-bold text-[#1565C0] flex items-center gap-1">
                          To: <strong className="text-blue-900">{d.toUser}</strong>
                        </p>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        d.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 border rounded-lg text-xs space-y-1 text-gray-600">
                      <p>Scope: <strong className="text-gray-800 font-mono">{d.scope}</strong></p>
                      <p>Reason: <span className="text-gray-500 italic">"{d.reason}"</span></p>
                      <p className="text-[10px] text-gray-400">Duration: {d.startDate} to {d.endDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-[#F5F7FA] border p-4 rounded-xl text-xs text-gray-500 flex items-start gap-2.5">
              <ShieldCheck className="w-4.5 h-4.5 text-green-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Delegated authority naturally expires on the set date. System logs prevent acting managers from making critical modifications once the expiration epoch passes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: SLA & DIGITAL EVIDENCE LEDGER */}
      {activeSubTab === 'sla' && (
        <div className="space-y-6">
          {/* SLA Targets & Escalation Procedures */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">SLA Escalation Directives</h3>
                <p className="text-xs text-gray-400 mt-1">
                  How the system automatically reroutes or sends reminders for delayed requests.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { title: 'Immediate Push Reminder', desc: 'Triggered automatically when a request stays in a supervisor queue for over 24 hours.', action: 'Notification dispatch to mobile app.' },
                  { title: 'Level 2 Escalation (Supervisor)', desc: 'Reroutes approval credentials to the next in-line Department Manager if untouched for 48 hours.', action: 'Automated policy reallocation.' },
                  { title: 'Executive Block Alert', desc: 'Alerts C-Suite if critical procurement or payroll adjustments exceeding 50,000 SAR stall for more than 72 hours.', action: 'Break-glass trigger alert.' }
                ].map((esc, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 border rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-800">{esc.title}</span>
                      <span className="text-[9px] bg-amber-50 text-amber-700 font-mono font-bold px-1.5 py-0.5 rounded">Active Ruleset</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{esc.desc}</p>
                    <p className="text-[10px] text-[#1565C0] font-semibold flex items-center gap-1 font-mono">
                      <CornerDownRight className="w-3.5 h-3.5" /> System Action: {esc.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Evidence ledger */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Legally Defensible Cryptographic Ledger</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Every decision logs the IP, timestamp, and a custom cryptographic signature verification token.
                </p>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[320px] scrollbar-thin text-xs pr-1">
                {evidenceLogs.map((log, idx) => (
                  <div key={idx} className="border-l-2 border-[#1565C0] pl-3 py-1 space-y-1 bg-gray-50/50 p-2 rounded-r-xl">
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>{log.timestamp}</span>
                      <span>IP: {log.ip}</span>
                    </div>
                    <p className="font-bold text-gray-800">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono mr-1.5 ${
                        log.action === 'APPROVE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{log.action}</span>
                      {log.user} (Request: {log.requestId})
                    </p>
                    <p className="text-xs text-gray-500">"{log.comment}"</p>
                    <p className="text-[8px] text-gray-400 font-mono tracking-wider truncate">Hash: {log.signature}</p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 text-blue-900 p-3.5 rounded-xl border border-blue-100 text-xs flex gap-2.5 items-start">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[#1565C0]" />
                <p className="text-[11px] leading-relaxed">
                  These logs are immutable. They cannot be cleared, archived, or manipulated, ensuring complete alignment with GCC HR financial auditor compliance requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
