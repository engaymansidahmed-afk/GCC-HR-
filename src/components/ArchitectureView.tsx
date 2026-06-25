import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Activity,
  Code,
  Compass,
  FileJson,
  Terminal,
  Zap,
  Play,
  CheckCircle,
  Database,
  ArrowRight,
  RefreshCw,
  Sliders,
  Sparkles,
  Link2,
  Lock,
  Globe,
  Settings,
  HelpCircle
} from 'lucide-react';

interface ArchitectureViewProps {
  isRtl: boolean;
}

export default function ArchitectureView({ isRtl }: ArchitectureViewProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'ddd' | 'clean' | 'events' | 'metadata' | 'api'>('ddd');

  // Event Broker simulation states
  const [eventLogs, setEventLogs] = useState<{ id: string; time: string; type: string; details: string; status: string }[]>([
    { id: '1', time: '14:20:01', type: 'EMPLOYEE_CREATED', details: 'HR System initiated new employee registration: Fahad Al-Qahtani (ID: EMP-881)', status: 'Success' },
    { id: '2', time: '14:20:02', type: 'PAYROLL_INITIALIZED', details: 'Payroll Engine created master ledger record for EMP-881', status: 'Success' },
    { id: '3', time: '14:20:02', type: 'IAM_ACCESS_PROVISIONED', details: 'Security directory configured default single-sign on tokens for EMP-881', status: 'Success' }
  ]);
  const [selectedEventType, setSelectedEventType] = useState('EMPLOYEE_CREATED');

  // Metadata Form Configuration state
  const [fieldConfig, setFieldConfig] = useState([
    { key: 'basicSalary', label: 'Basic Salary', labelAr: 'الراتب الأساسي', type: 'number', required: true, visible: true },
    { key: 'housingAllowance', label: 'Housing Allowance', labelAr: 'بدل السكن', type: 'number', required: true, visible: true },
    { key: 'transportAllowance', label: 'Transportation Allowance', labelAr: 'بدل النقل', type: 'number', required: false, visible: true },
    { key: 'remoteSiteAllowance', label: 'Remote Site Allowance', labelAr: 'بدل موقع نائي', type: 'number', required: false, visible: false },
    { key: 'riskAllowance', label: 'Risk & Hazard Allowance', labelAr: 'بدل مخاطر', type: 'number', required: false, visible: true }
  ]);

  // Payroll Formula state (Configuration-as-Data)
  const [activeFormula, setActiveFormula] = useState('BasicSalary + HousingAllowance + TransportationAllowance - LoanDeduction');
  const [formulaInputs, setFormulaInputs] = useState({
    BasicSalary: 12000,
    HousingAllowance: 3000,
    TransportationAllowance: 1200,
    LoanDeduction: 500
  });
  const [formulaResult, setFormulaResult] = useState<number | null>(15700);
  const [formulaError, setFormulaError] = useState<string | null>(null);

  // Selected DDD Domain details
  const [selectedDomain, setSelectedDomain] = useState('HR');

  // API Tester Simulation State
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET_EMPLOYEES');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Trigger simulated Event dispatch
  const handleDispatchEvent = () => {
    const timeNow = new Date().toTimeString().split(' ')[0];
    const randId = Math.floor(Math.random() * 1000).toString();
    
    let logsToAdd: any[] = [];
    
    if (selectedEventType === 'EMPLOYEE_CREATED') {
      logsToAdd = [
        { id: `E-${randId}-1`, time: timeNow, type: 'EMPLOYEE_CREATED', details: 'HR Master dispatched system-wide event for newly registered worker', status: 'Dispatched' },
        { id: `E-${randId}-2`, time: timeNow, type: 'PAYROLL_ALLOCATED', details: 'Payroll module listening: Created basic grade scale & cost mapping rules', status: 'Subscribed' },
        { id: `E-${randId}-3`, time: timeNow, type: 'FLEET_ELIGIBILITY_VERIFIED', details: 'Heavy Vehicles Registry listening: Checked worker driving eligibility parameters', status: 'Subscribed' }
      ];
    } else if (selectedEventType === 'PAYROLL_PERIOD_CLOSED') {
      logsToAdd = [
        { id: `E-${randId}-1`, time: timeNow, type: 'PAYROLL_PERIOD_CLOSED', details: 'Finance system triggered lock for Fiscal June-2026 ledger lines', status: 'Dispatched' },
        { id: `E-${randId}-2`, time: timeNow, type: 'DEDUCTION_SETTLED', details: 'Outstanding staff advance lines audited and processed against master balance sheets', status: 'Subscribed' },
        { id: `E-${randId}-3`, time: timeNow, type: 'LEDGER_POSTED', details: 'Drizzle/PostgreSQL ledger table committed as immutable snapshot record', status: 'Subscribed' }
      ];
    } else if (selectedEventType === 'EQUIPMENT_MAINTENANCE_DUE') {
      logsToAdd = [
        { id: `E-${randId}-1`, time: timeNow, type: 'EQUIPMENT_MAINTENANCE_DUE', details: 'Sensor threshold exceeded on Tower Crane (S/N: 902-X)', status: 'Dispatched' },
        { id: `E-${randId}-2`, time: timeNow, type: 'WORK_ORDER_AUTOMATED', details: 'Operations/EAM dispatched corrective request: Lubrication & stress-load evaluation', status: 'Subscribed' },
        { id: `E-${randId}-3`, time: timeNow, type: 'SPARE_PARTS_RESERVED', details: 'Warehouse Inventory system allocated: Hydraulic Seal V500', status: 'Subscribed' }
      ];
    } else {
      logsToAdd = [
        { id: `E-${randId}-1`, time: timeNow, type: 'PURCHASE_REQUEST_APPROVED', details: 'Cost Center RYD-CIVIL authorized procurement limits for heavy concrete matrix', status: 'Dispatched' },
        { id: `E-${randId}-2`, time: timeNow, type: 'BUDGET_RESERVATION_LOCKED', details: 'Finance domain validated capital cap: 100,000 SAR reserved', status: 'Subscribed' }
      ];
    }

    setEventLogs(prev => [...logsToAdd, ...prev]);
  };

  // Evaluate rule formula simulation
  const evaluateFormula = () => {
    try {
      setFormulaError(null);
      // Clean formula and replace variables with input values
      let expression = activeFormula;
      Object.keys(formulaInputs).forEach((key) => {
        const val = formulaInputs[key as keyof typeof formulaInputs];
        expression = expression.replace(new RegExp(key, 'g'), val.toString());
      });

      // Simple safe evaluation using Function (safe since inputs are strict numbers and characters are restricted)
      if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        throw new Error('Invalid characters in formula. Only variables, numbers, and basic operators are allowed.');
      }
      
      const res = new Function(`return (${expression})`)();
      if (isNaN(res)) {
        throw new Error('Formula resulted in an invalid calculation');
      }
      setFormulaResult(res);
    } catch (err: any) {
      setFormulaError(err.message || 'Calculation error');
      setFormulaResult(null);
    }
  };

  // Simulate API try out
  const handleTestApi = () => {
    setIsApiLoading(true);
    setTimeout(() => {
      setIsApiLoading(false);
      if (selectedEndpoint === 'GET_EMPLOYEES') {
        setApiResponse({
          status: 200,
          ok: true,
          timestamp: new Date().toISOString(),
          pagination: { limit: 10, offset: 0, total: 22 },
          data: [
            { id: "EMP-001", fullName: "Fahad Al-Mansoori", role: "Super Administrator", department: "Executive Office", salaryGrade: "GRADE-12" },
            { id: "EMP-002", fullName: "Sarah Khalid Al-Ghamdi", role: "HR Manager", department: "Human Resources", salaryGrade: "GRADE-08" },
            { id: "EMP-003", fullName: "Tariq Mahmood", role: "Project Manager", department: "Engineering", salaryGrade: "GRADE-08" }
          ]
        });
      } else if (selectedEndpoint === 'CALCULATE_PAYROLL') {
        setApiResponse({
          status: 200,
          ok: true,
          computationEngine: "GCC_v26_Production",
          parameters: { formula: activeFormula, variables: formulaInputs },
          data: {
            grossEarnings: formulaInputs.BasicSalary + formulaInputs.HousingAllowance + formulaInputs.TransportationAllowance,
            totalDeductions: formulaInputs.LoanDeduction,
            netPayout: formulaResult || 0,
            currency: "SAR",
            auditableSignature: "SHA256:88faee3321bf"
          }
        });
      } else {
        setApiResponse({
          status: 200,
          ok: true,
          telemetry: "EAM_Active_Monitor",
          data: [
            { equipmentId: "EQ-3001", model: "High-Elevation Tower Crane", status: "Active", maintenanceProgress: "92%", currentAssignment: "Riyadh Metro Line 3" },
            { equipmentId: "EQ-3002", model: "Heavy Crawler Excavator", status: "In Maintenance", maintenanceProgress: "14%", currentAssignment: "Al-Qassim Pipeline Expansion" }
          ]
        });
      }
    }, 600);
  };

  // Domain information database
  const domainsInfo: Record<string, { title: string; titleAr: string; boundary: string; responsibility: string[]; events: string[] }> = {
    HR: {
      title: 'Human Capital & Personnel Context',
      titleAr: 'سياق الكفاءات والموارد البشرية',
      boundary: 'com.gcc.hr.personnel',
      responsibility: [
        'Complete Employee Profile lifecycle (onboarding, progression, offboarding)',
        'Organizational hierarchies (Holding Company, Divisions, Cost Units, Teams)',
        'Workforce resource planning, vacancies, and leadership succession',
        'Document compliance tracking (Iqama, Passport, certifications)'
      ],
      events: ['EMPLOYEE_ONBOARDED', 'EMPLOYEE_PROMOTED', 'DOCUMENT_EXPIRING_ALERT', 'EMPLOYEE_TERMINATED']
    },
    Payroll: {
      title: 'Financial Compensation & Benefits Context',
      titleAr: 'سياق التعويضات والأجور والرواتب',
      boundary: 'com.gcc.hr.payroll',
      responsibility: [
        'Automated multi-component salary structure & steps calculation',
        'Advanced loans, advance deductions, and penalty processors',
        'No hard-coded payroll rule compiler & conditional logic parser',
        'End-of-Service Benefit (EOSB) settlement according to labor laws'
      ],
      events: ['PAYROLL_PERIOD_LOCKED', 'LOAN_APPROVED', 'EOSB_SETTLED', 'PAYOUT_DISBURSED']
    },
    Equipment: {
      title: 'Enterprise Asset & Heavy Machinery Context',
      titleAr: 'سياق المعدات الثقيلة والآلات',
      boundary: 'com.gcc.operations.equipment',
      responsibility: [
        'Heavy equipment master registry, GPS tracking, and specifications',
        'Dynamic operator allocations and project-based assignments',
        'Safety, telemetry compliance, and structural stress inspection logs',
        'Integration with preventive maintenance planning schedules'
      ],
      events: ['EQUIPMENT_REGISTERED', 'OPERATOR_ASSIGNED', 'INSPECTION_FAILED', 'TELEMETRY_ALERT']
    },
    Projects: {
      title: 'Operational Construction & Engineering Context',
      titleAr: 'سياق مشاريع البناء والتشييد',
      boundary: 'com.gcc.projects.construction',
      responsibility: [
        'Construction project scope definition, milestones, and timelines',
        'Workforce planning, task assignments, and daily logs matching',
        'Real-time physical asset utilization track against project budgets',
        'Contract lifecycle management & external sub-contractor alignment'
      ],
      events: ['PROJECT_CREATED', 'MILESTONE_DELAYED', 'TASK_COMPLETED', 'CONTRACT_RENEWED']
    }
  };

  const domain = domainsInfo[selectedDomain] || domainsInfo.HR;

  return (
    <div className="space-y-6">
      {/* Visual Hub Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none transform skew-x-12"></div>
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/25 rounded-lg border border-blue-400/20">
              <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-black uppercase tracking-widest text-blue-400">
              {isRtl ? 'الهندسة والبنية البرمجية المستدامة للمنصة' : 'Enterprise Engineering & Architectural Sustainability'}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight font-sans">
            {isRtl ? 'هندسة النظام المستدام والميزات المتقدمة' : 'System Architecture & Structural Sustainability'}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {isRtl 
              ? 'تطبيق معايير البناء الهندسي المتفوقة: التصميم القائم على النطاق (DDD)، البنية النظيفة ذات الطبقات المستقلة، المعالجة اللامركزية المعتمدة على الأحداث، وتهيئة المنصة عبر البيانات الوصفية لخدمة المؤسسة لعقود دون إعادة برمجة.'
              : 'Enforcing Domain-Driven Design (DDD), decoupled multi-layer Clean Architecture, reactive Event-Driven orchestration, and configuration-as-data compilers for a minimum 15-year operational lifecycle.'}
          </p>
        </div>

        <div className="flex gap-2.5 z-10 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-center min-w-[110px]">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Beds of Truth</p>
            <p className="text-sm font-black text-blue-400">Loose Coupling</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-center min-w-[110px]">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Design Standard</p>
            <p className="text-sm font-black text-emerald-400">Clean DDD</p>
          </div>
        </div>
      </div>

      {/* Internal View Tabs */}
      <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-xs gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ddd')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'ddd' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{isRtl ? 'نطاقات العمل المنفصلة (DDD)' : '1. Domain-Driven Design'}</span>
        </button>
        <button
          onClick={() => setActiveTab('clean')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'clean' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isRtl ? 'البنية النظيفة ومستويات الاعتمادية' : '2. Clean Layers'}</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'events' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{isRtl ? 'ناقل الأحداث اللامركزي (EDA)' : '3. Event Broker'}</span>
        </button>
        <button
          onClick={() => setActiveTab('metadata')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'metadata' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isRtl ? 'التوجيه بالبيانات وقواعد المعادلات' : '4. Config-as-Data Compiler'}</span>
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'api' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{isRtl ? 'بوابة المطور والربط البرمجي (OpenAPI)' : '5. Open API Gateway'}</span>
        </button>
      </div>

      {/* TAB 1: DOMAIN-DRIVEN DESIGN INTERACTIVE MAP */}
      {activeTab === 'ddd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm mb-1">{isRtl ? 'خريطة النطاقات المترابطة' : 'DDD Bounded Contexts'}</h3>
              <p className="text-xs text-gray-400 mb-4">{isRtl ? 'اختر نطاقاً لاستكشاف حدوده الوظيفية وقواعده الخاصة' : 'Select a domain to inspect its Bounded Context mapping and generated triggers.'}</p>
              
              <div className="space-y-2.5">
                {[
                  { id: 'HR', label: 'Human Resources & Personnel', labelAr: 'الموارد البشرية والكفاءات', color: 'hover:border-blue-300' },
                  { id: 'Payroll', label: 'Payroll & Compensation', labelAr: 'الأجور والرواتب والمستحقات', color: 'hover:border-emerald-300' },
                  { id: 'Equipment', label: 'Heavy Equipment & Operations', labelAr: 'المعدات الثقيلة والتشغيل', color: 'hover:border-amber-300' },
                  { id: 'Projects', label: 'Construction Projects & Planning', labelAr: 'المشاريع الهندسية والتخطيط', color: 'hover:border-purple-300' }
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDomain(d.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                      selectedDomain === d.id
                        ? 'border-slate-900 bg-slate-950 text-white font-bold'
                        : `bg-white border-gray-100 text-gray-700 ${d.color}`
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">{isRtl ? d.labelAr : d.label}</p>
                      <p className="text-[9px] font-mono opacity-60">Domain ID: {d.id}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl text-white space-y-3">
              <h4 className="text-xs font-bold font-mono text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                No Coupling Invariant
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                By enforcing explicit domain boundaries, changes in HR logic (e.g. grading shifts) cannot break Payroll computation. Real-time changes bridge securely via our **Reactive Event Broker**.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            <div className="border-b pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  {domain.boundary}
                </span>
                <h3 className="text-base font-black text-gray-950 mt-1.5">{isRtl ? domain.titleAr : domain.title}</h3>
              </div>
              <Compass className="w-8 h-8 text-slate-300" />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 font-mono">Bounded Context Responsibilities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {domain.responsibility.map((resp, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 flex gap-2.5 items-start">
                      <CheckCircle className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 font-mono">Generated Domain Events</h4>
                <div className="flex flex-wrap gap-2">
                  {domain.events.map((ev, idx) => (
                    <span key={idx} className="bg-slate-900 text-slate-100 text-[10px] font-mono font-bold py-1 px-2.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {ev}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Strict Compliance Guideline:</strong> Developers are strictly forbidden from writing direct relational cross-domain queries. Domain modules must access secondary variables strictly via service gateways, guaranteeing upgrade paths are safe and backward-compatible.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLEAN LAYERS VISUALIZER */}
      {activeTab === 'clean' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Enterprise Multi-Layer Stack</h3>
                <p className="text-xs text-gray-400 mt-0.5">Click any layer in the architecture stack to trace its component role, dependency directives, and physical files.</p>
              </div>

              {/* Layer stack interactive cards */}
              <div className="space-y-2.5">
                {[
                  { title: 'Presentation Layer', desc: 'Svelte/React views, JSON REST APIs, UI controllers', color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50', text: 'text-blue-900' },
                  { title: 'Application Layer', desc: 'Use Cases, Workflow orchestrators, Transaction controls', color: 'border-violet-200 bg-violet-50/50 hover:bg-violet-50', text: 'text-violet-900' },
                  { title: 'Domain Layer (Core)', desc: 'Enterprise business entities, Validation rules, Formulas', color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50', text: 'text-amber-900' },
                  { title: 'Infrastructure Layer', desc: 'Drizzle ORM schema, PostgreSQL interfaces, Caching, SMS Gateway', color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50', text: 'text-emerald-900' }
                ].map((lyr, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border transition-all ${lyr.color} cursor-pointer`}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center font-mono">0{4 - idx}</span>
                      <h4 className={`text-xs font-black ${lyr.text}`}>{lyr.title}</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium pl-7">{lyr.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Code className="w-5 h-5 text-slate-800" />
              Dependency Rule Validation
            </h3>
            <p className="text-xs text-gray-400">
              Clean architecture guarantees that core business logic remains independent of third-party drivers, database engines, or UI frameworks. High-level policies cannot depend on low-level implementation details.
            </p>

            <div className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-[10.5px] leading-relaxed space-y-2.5 overflow-x-auto">
              <p className="text-slate-500 border-b border-slate-800 pb-1.5">// Domain Layer: Independent Entity validation (src/domain/rules/compensation.ts)</p>
              <div>
                <span className="text-purple-400">export class</span> <span className="text-blue-300">GradeSalaryBound</span> {'{'}
                <p className="pl-4">private readonly minPay: number;</p>
                <p className="pl-4">private readonly maxPay: number;</p>
                <br />
                <p className="pl-4"><span className="text-purple-400">constructor</span>(minPay: number, maxPay: number) {'{'}</p>
                <p className="pl-8">if (minPay &lt; 0) throw new Error("Base salary cannot be negative");</p>
                <p className="pl-8">if (minPay &gt; maxPay) throw new Error("Minimum scale cannot exceed maximum band limits");</p>
                <p className="pl-8">this.minPay = minPay;</p>
                <p className="pl-8">this.maxPay = maxPay;</p>
                <p className="pl-4">{'}'}</p>
                <br />
                <p className="pl-4">public <span className="text-blue-300">validateProposedPay</span>(amount: number): boolean {'{'}</p>
                <p className="pl-8">return amount &gt;= this.minPay && amount &lt;= this.maxPay;</p>
                <p className="pl-4">{'}'}</p>
                {'}'}
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed flex gap-2">
              <span className="font-bold text-blue-700 uppercase font-mono mt-0.5">Note:</span>
              <p>Since this validation resides strictly within the core domain layer, the business logic remains fully secure and testable in isolated environments without needing to spin up PostgreSQL containers, Node servers, or Svelte/React runtimes.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EVENT-DRIVEN BROKER SIMULATOR */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Dispatched Domain Events</h3>
              <p className="text-xs text-gray-400 mt-0.5">Manually simulate triggering core events and observe real-time reactive subscriber execution across domain modules.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Event Prototype</label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-gray-50 font-mono"
                >
                  <option value="EMPLOYEE_CREATED">EMPLOYEE_CREATED (com.gcc.hr.personnel)</option>
                  <option value="PAYROLL_PERIOD_CLOSED">PAYROLL_PERIOD_CLOSED (com.gcc.hr.payroll)</option>
                  <option value="EQUIPMENT_MAINTENANCE_DUE">EQUIPMENT_MAINTENANCE_DUE (com.gcc.operations.equipment)</option>
                  <option value="PURCHASE_REQUEST_APPROVED">PURCHASE_REQUEST_APPROVED (com.gcc.procurement.requests)</option>
                </select>
              </div>

              <button
                onClick={handleDispatchEvent}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-amber-400" />
                Dispatch Domain Event
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Loose Coupling Benefit:</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                When an employee is hired, the HR module doesn't call the Finance SQL database. It publishes an event, and the Finance domain updates its budget ledger asynchronously. If Finance is offline, the event retries until success, preserving database stability.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-950 text-green-400 p-5 rounded-2xl font-mono text-xs space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 text-slate-400">
              <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                Immutable Event-Router Broker Logs
              </span>
              <button
                onClick={() => setEventLogs([])}
                className="text-[9px] underline hover:text-slate-200 cursor-pointer"
              >
                Clear Log History
              </button>
            </div>

            <div className="h-[280px] overflow-y-auto space-y-2 pr-1 text-[11px]">
              {eventLogs.length === 0 ? (
                <p className="text-slate-600 italic text-center pt-24">Broker idle. Dispatched events will stream here...</p>
              ) : (
                eventLogs.map(log => (
                  <div key={log.id} className="p-2 border border-slate-900 rounded bg-slate-900/50 space-y-0.5">
                    <div className="flex justify-between">
                      <span className={`font-black ${
                        log.status === 'Dispatched' ? 'text-amber-300' : 'text-blue-300'
                      }`}>
                        [{log.status}] {log.type}
                      </span>
                      <span className="text-slate-500">{log.time}</span>
                    </div>
                    <p className="text-slate-300 font-sans mt-0.5">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METADATA & COMPILED PAYROLL FORMULAS */}
      {activeTab === 'metadata' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Metadata UI Form Controller */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Metadata-Driven UI Schema</h3>
              <p className="text-xs text-gray-400 mt-0.5">Customize forms dynamically. Toggle fields or requirements to observe runtime form updates without hardcoding.</p>
            </div>

            <div className="space-y-3">
              {fieldConfig.map((field, idx) => (
                <div key={field.key} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{field.label}</span>
                    <p className="text-[10px] text-gray-400">{field.labelAr} • Type: {field.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const updated = [...fieldConfig];
                        updated[idx].required = !updated[idx].required;
                        setFieldConfig(updated);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all border ${
                        field.required ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {field.required ? 'Required' : 'Optional'}
                    </button>
                    <button
                      onClick={() => {
                        const updated = [...fieldConfig];
                        updated[idx].visible = !updated[idx].visible;
                        setFieldConfig(updated);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all border ${
                        field.visible ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-500 border-red-200'
                      }`}
                    >
                      {field.visible ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configurable Payroll Formulas */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Configurable Payroll Rule Compiler</h3>
              <p className="text-xs text-gray-400 mt-0.5">The payroll engine is 100% metadata-driven. Modify formulas and adjust parameters with live sandbox parsing validation.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Active Payroll Deduction/Compensation Formula</label>
                <input
                  type="text"
                  value={activeFormula}
                  onChange={(e) => setActiveFormula(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono bg-gray-50"
                  placeholder="BasicSalary + Allowances - Deductions"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {Object.keys(formulaInputs).map((key) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">{key} (SAR)</label>
                    <input
                      type="number"
                      value={formulaInputs[key as keyof typeof formulaInputs]}
                      onChange={(e) => {
                        setFormulaInputs({
                          ...formulaInputs,
                          [key]: parseFloat(e.target.value) || 0
                        });
                      }}
                      className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono bg-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={evaluateFormula}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Compile & Evaluate Formula
                </button>
              </div>

              <div className="p-4 rounded-xl border border-dashed flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-gray-700">Calculated Payout Result:</h4>
                  {formulaError ? (
                    <p className="text-xs text-red-600 font-mono mt-1 font-semibold">{formulaError}</p>
                  ) : (
                    <p className="text-sm font-black text-slate-900 font-mono mt-1">
                      {formulaResult?.toLocaleString()} SAR
                    </p>
                  )}
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-[10px] font-mono font-bold">
                  ✓ Syntax Certified
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OPEN API GATEWAY & EXPLORER */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Endpoint selection */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">OpenAPI Documentation</h3>
              <p className="text-xs text-gray-400 mt-0.5">Explore secure, version-controlled developer API routes powering internal and external system gateways.</p>
            </div>

            <div className="space-y-2">
              {[
                { key: 'GET_EMPLOYEES', path: 'GET /api/v1/employees', desc: 'Fetch paginated personnel profiles with document tracking logs' },
                { key: 'CALCULATE_PAYROLL', path: 'POST /api/v1/payroll/calculate', desc: 'Compute dry-run payout schemas against metadata rules' },
                { key: 'GET_EQUIPMENT', path: 'GET /api/v1/operations/equipment', desc: 'Retrieve telematics metrics and active crane assignments' }
              ].map(ep => (
                <button
                  key={ep.key}
                  onClick={() => {
                    setSelectedEndpoint(ep.key);
                    setApiResponse(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedEndpoint === ep.key
                      ? 'border-blue-400 bg-blue-50/50'
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] bg-slate-900 text-slate-100 font-bold px-1.5 py-0.5 rounded font-mono">
                    {ep.path}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">{ep.desc}</p>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleTestApi}
                className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Globe className="w-4 h-4" />
                {isApiLoading ? 'Processing Request...' : 'Try It Out (Send Request)'}
              </button>
            </div>
          </div>

          {/* API Response display */}
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl text-slate-300 space-y-4 font-mono text-xs shadow-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                API Response Payload (JSON)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[9px] font-black">
                Bearer Token Active
              </span>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 h-[300px] overflow-auto text-[11px] leading-relaxed">
              {isApiLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2.5 text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Invoking endpoint and compiling schemas...</span>
                </div>
              ) : apiResponse ? (
                <pre className="text-emerald-400">{JSON.stringify(apiResponse, null, 2)}</pre>
              ) : (
                <p className="text-slate-500 text-center pt-28 italic">Select an API route and click "Try It Out" to inspect raw JSON payloads.</p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
