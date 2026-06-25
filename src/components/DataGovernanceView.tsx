import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Database,
  Search,
  Award,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  UserCheck,
  Shuffle,
  BarChart3,
  RefreshCw,
  Sliders,
  Calendar,
  Users,
  Wrench,
  Warehouse,
  Briefcase,
  DollarSign,
  AlertTriangle,
  Cpu,
  Layers,
  Lock,
  History,
  User,
  Check,
  Plus,
  Trash2,
  FileText,
  Fingerprint
} from 'lucide-react';

interface DataGovernanceViewProps {
  state: {
    employees: any[];
    projects: any[];
  };
  isRtl: boolean;
  onRefresh: () => void;
}

// Interfaces for MDM Domain Data
interface MasterRecord {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  category: string;
  completeness: number;
  steward: string;
  owner: string;
  lastUpdated: string;
  status: 'Governed' | 'Pending Verification' | 'Duplicate Warning';
}

interface DuplicateAlert {
  id: string;
  domain: string;
  recordA: string;
  recordB: string;
  matchedField: string;
  confidence: number;
  detectedAt: string;
  status: 'Active' | 'Resolved' | 'Ignored';
}

interface GovernanceWorkflow {
  id: string;
  domain: string;
  fieldName: string;
  previousValue: string;
  proposedValue: string;
  justification: string;
  submittedBy: string;
  steward: string;
  step: 'Validation' | 'Steward Review' | 'Owner Approval' | 'Published';
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
}

interface PointInTimeRecord {
  id: string;
  entity: string;
  date: string;
  field: string;
  oldValue: string;
  newValue: string;
  authorizedBy: string;
  signature: string;
  ip: string;
}

export default function DataGovernanceView({ state, isRtl, onRefresh }: DataGovernanceViewProps) {
  // Navigation tabs for the Data Governance Portal
  const [activeTab, setActiveTab] = useState<'mdm' | 'quality' | 'workflows' | 'temporal' | 'stewardship'>('mdm');

  // Domains for MDM Selection
  const [selectedDomain, setSelectedDomain] = useState<'HR' | 'Equipment' | 'Assets' | 'Vehicles' | 'Finance'>('HR');

  // Interactive search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 1. Core MDM Master Records
  const [masterRecords, setMasterRecords] = useState<Record<string, MasterRecord[]>>({
    HR: [
      { id: '1', code: 'EMP-GRADE-12', name: 'Executive Leadership Standard', nameAr: 'معيار القيادة التنفيذية', category: 'Salary Structure', completeness: 100, steward: 'Sarah Khalid Al-Ghamdi', owner: 'Fahad Al-Mansoori', lastUpdated: '2026-06-20', status: 'Governed' },
      { id: '2', code: 'EMP-GRADE-08', name: 'Senior Engineering Scale', nameAr: 'سلم الهندسة المتقدم', category: 'Salary Structure', completeness: 95, steward: 'Sarah Khalid Al-Ghamdi', owner: 'Fahad Al-Mansoori', lastUpdated: '2026-06-22', status: 'Governed' },
      { id: '3', code: 'LOC-RYD-HQ', name: 'Riyadh Central Headquarters', nameAr: 'المركز الرئيسي بالرياض', category: 'Corporate Branch', completeness: 100, steward: 'Ali Al-Qahtani', owner: 'Fahad Al-Mansoori', lastUpdated: '2026-05-14', status: 'Governed' },
      { id: '4', code: 'DEPT-CIVIL-04', name: 'Heavy Civil Infrastructure Division', nameAr: 'قسم البنية التحتية المدنية', category: 'Organizational Unit', completeness: 90, steward: 'Sarah Khalid Al-Ghamdi', owner: 'Fahad Al-Mansoori', lastUpdated: '2026-06-25', status: 'Pending Verification' },
      { id: '5', code: 'EMP-GRADE-01', name: 'Field Operative Standard Scale', nameAr: 'سلم تشغيل العمال الميداني', category: 'Salary Structure', completeness: 80, steward: 'Sarah Khalid Al-Ghamdi', owner: 'Fahad Al-Mansoori', lastUpdated: '2026-06-18', status: 'Duplicate Warning' }
    ],
    Equipment: [
      { id: '6', code: 'EQ-CAT-EXT', name: 'Heavy Crawler Excavators', nameAr: 'الحفارات المجنزرة الثقيلة', category: 'Machinery Class', completeness: 100, steward: 'Majid Mahmood', owner: 'Tariq Mahmood', lastUpdated: '2026-06-15', status: 'Governed' },
      { id: '7', code: 'EQ-CAT-TWR', name: 'High-Elevation Tower Cranes', nameAr: 'الرافعات البرجية الشاهقة', category: 'Machinery Class', completeness: 100, steward: 'Majid Mahmood', owner: 'Tariq Mahmood', lastUpdated: '2026-06-24', status: 'Governed' },
      { id: '8', code: 'EQ-INS-SEAS', name: 'Seasonal Structural Stress Audits', nameAr: 'فحص إجهاد الهياكل الموسمي', category: 'Inspection Standards', completeness: 85, steward: 'Majid Mahmood', owner: 'Tariq Mahmood', lastUpdated: '2026-06-02', status: 'Governed' },
      { id: '9', code: 'EQ-CAT-DZR', name: 'Heavy Bulldozers & Tractors', nameAr: 'الجرافات والجرارات الثقيلة', category: 'Machinery Class', completeness: 70, steward: 'Majid Mahmood', owner: 'Tariq Mahmood', lastUpdated: '2026-06-25', status: 'Pending Verification' }
    ],
    Assets: [
      { id: '10', code: 'INV-WH-RYD', name: 'Central Riyadh Spare Parts Depot', nameAr: 'مستودع قطع الغيار الرئيسي بالرياض', category: 'Warehouse Location', completeness: 100, steward: 'Hassan Al-Saeed', owner: 'Bandar Al-Ghamdi', lastUpdated: '2026-05-10', status: 'Governed' },
      { id: '11', code: 'PART-HYD-500', name: 'High-Pressure Hydraulic Seal 500BAR', nameAr: 'مانع تسرب هيدروليكي ضغط عالي', category: 'Spare Parts Categorization', completeness: 95, steward: 'Hassan Al-Saeed', owner: 'Bandar Al-Ghamdi', lastUpdated: '2026-06-23', status: 'Governed' },
      { id: '12', code: 'PART-ENG-V12', name: 'V12 Turbocharged Engine Blocks', nameAr: 'كتل محركات توربو V12', category: 'Spare Parts Categorization', completeness: 85, steward: 'Hassan Al-Saeed', owner: 'Bandar Al-Ghamdi', lastUpdated: '2026-06-24', status: 'Duplicate Warning' }
    ],
    Vehicles: [
      { id: '13', code: 'FLT-CAT-HDT', name: 'Heavy Duty Hauling Trucks', nameAr: 'شاحنات النقل الثقيل للردوم', category: 'Fleet Operating Standards', completeness: 100, steward: 'Majid Mahmood', owner: 'Tariq Mahmood', lastUpdated: '2026-04-12', status: 'Governed' },
      { id: '14', code: 'FLT-FUEL-DSL', name: 'Low-Sulfur Industrial Diesel', nameAr: 'ديزل صناعي منخفض الكبريت', category: 'Fuel Categories', completeness: 100, steward: 'Majid Mahmood', owner: 'Tariq Mahmood', lastUpdated: '2026-06-11', status: 'Governed' },
      { id: '15', code: 'FLT-CAT-SUV', name: 'Executive Field Escort SUVs', nameAr: 'سيارات الدفع الرباعي الميدانية', category: 'Fleet Operating Standards', completeness: 90, steward: 'Majid Mahmood', owner: 'Tariq Mahmood', lastUpdated: '2026-06-25', status: 'Pending Verification' }
    ],
    Finance: [
      { id: '16', code: 'CC-RYD-CIVIL', name: 'Riyadh Infrastructure Cost Center', nameAr: 'مركز تكلفة البنية التحتية بالرياض', category: 'Cost Centers', completeness: 100, steward: 'Khalid Al-Qahtani', owner: 'M. Al-Harbi', lastUpdated: '2026-01-01', status: 'Governed' },
      { id: '17', code: 'BDG-EQ-2026', name: 'Heavy Machinery Capital Capex 2026', nameAr: 'ميزانية الرأسمالية للمعدات الثقيلة ٢٠٢٦', category: 'Budget Categories', completeness: 100, steward: 'Khalid Al-Qahtani', owner: 'M. Al-Harbi', lastUpdated: '2026-06-01', status: 'Governed' },
      { id: '18', code: 'EXP-TRAV-ME', name: 'Regional Inspector Travel Reimbursements', nameAr: 'بدل السفر والانتداب للمفتشين', category: 'Expense Categories', completeness: 92, steward: 'Khalid Al-Qahtani', owner: 'M. Al-Harbi', lastUpdated: '2026-06-22', status: 'Governed' }
    ]
  });

  // 2. Active Duplicate Warnings Ledger
  const [duplicateAlerts, setDuplicateAlerts] = useState<DuplicateAlert[]>([
    { id: 'DUP-101', domain: 'Human Resources', recordA: 'Sarah Khalid Al-Ghamdi (Emp-981)', recordB: 'S. K. Al-Ghamdi (Emp-1014)', matchedField: 'Saudi National ID / Iqama Sequence', confidence: 98, detectedAt: '2026-06-25 04:12', status: 'Active' },
    { id: 'DUP-102', domain: 'Heavy Equipment', recordA: 'Cranes Tower EX-3001 (S/N: 884-A)', recordB: 'Tower Crane EX-3001 (S/N: 884-A)', matchedField: 'Manufacturer Chassis Serial', confidence: 100, detectedAt: '2026-06-24 18:50', status: 'Active' },
    { id: 'DUP-103', domain: 'Warehouse Inventory', recordA: 'Hydraulic Valve Seal V500', recordB: 'High Pressure Valve Seal V-500', matchedField: 'Unified Part Number Code', confidence: 89, detectedAt: '2026-06-23 09:30', status: 'Active' }
  ]);

  // 3. Governance Data Change Workflows
  const [workflows, setWorkflows] = useState<GovernanceWorkflow[]>([
    {
      id: 'WF-GOV-201',
      domain: 'Human Resources',
      fieldName: 'Standard Base Pay Grade 12',
      previousValue: '65,000 SAR',
      proposedValue: '72,000 SAR',
      justification: 'Adjustment to maintain alignment with market rates for regional engineering Directors.',
      submittedBy: 'Sarah Khalid Al-Ghamdi',
      steward: 'Sarah Khalid Al-Ghamdi',
      step: 'Steward Review',
      status: 'Pending',
      timestamp: '2026-06-25 05:40'
    },
    {
      id: 'WF-GOV-198',
      domain: 'Finance & Accounts',
      fieldName: 'Cost Center - Riyadh Infrastructure',
      previousValue: 'CC-RYD-CIVIL (In development)',
      proposedValue: 'CC-RYD-CIVIL (Active Ledger Status)',
      justification: 'Migrating Riyadh metro station elements from staging sandbox to main accounting lines.',
      submittedBy: 'Khalid Al-Qahtani',
      steward: 'Khalid Al-Qahtani',
      step: 'Published',
      status: 'Approved',
      timestamp: '2026-06-24 14:22'
    },
    {
      id: 'WF-GOV-199',
      domain: 'Warehouse Assets',
      fieldName: 'Central Spare Parts Depo Warehouse ID',
      previousValue: 'INV-WH-RYD',
      proposedValue: 'INV-WH-RYD-CENTRAL',
      justification: 'Requested change to support automatic database syncing with localized tracking system.',
      submittedBy: 'Hassan Al-Saeed',
      steward: 'Hassan Al-Saeed',
      step: 'Validation',
      status: 'Rejected',
      timestamp: '2026-06-23 11:00'
    }
  ]);

  // Propose New Change Form state
  const [propDomain, setPropDomain] = useState<'Human Resources' | 'Heavy Equipment' | 'Warehouse Assets' | 'Finance & Accounts'>('Human Resources');
  const [propField, setPropField] = useState('');
  const [propPrev, setPropPrev] = useState('');
  const [propNew, setPropNew] = useState('');
  const [propReason, setPropReason] = useState('');
  const [propSteward, setPropSteward] = useState('Sarah Khalid Al-Ghamdi');

  // 4. Point-In-Time Historical Database Snapshots
  const [historicalTimeline, setHistoricalTimeline] = useState<PointInTimeRecord[]>([
    { id: 'H-901', entity: 'Employee Grade-12 Salary Rules', date: '2026-05-15', field: 'Standard Max Increment Cap', oldValue: '12% Base', newValue: '15% Base', authorizedBy: 'Fahad Al-Mansoori (HR VP)', signature: 'SHA256:88fa2b189b', ip: '10.140.2.19' },
    { id: 'H-902', entity: 'Riyadh Central Branch Master', date: '2026-04-10', field: 'Authorized Dispatch Supervisor', oldValue: 'Unassigned', newValue: 'Tariq Mahmood', authorizedBy: 'Sarah Khalid Al-Ghamdi', signature: 'SHA256:ff01bc332c', ip: '10.140.4.52' },
    { id: 'H-903', entity: 'Concrete Procurement Standard', date: '2026-02-18', field: 'Max Purchase Limit Level-1', oldValue: '50,000 SAR', newValue: '100,000 SAR', authorizedBy: 'M. Al-Harbi (Finance Director)', signature: 'SHA256:da4c00e129', ip: '10.140.8.210' }
  ]);

  // Point in Time Reconstruction Date Query
  const [reconstructionDate, setReconstructionDate] = useState('2026-06-25');
  const [reconstructedState, setReconstructedState] = useState<any[]>([]);
  const [isReconstructing, setIsReconstructing] = useState(false);

  // 5. Stewardship & Governance Assignments
  const [stewardships, setStewardships] = useState([
    { domain: 'Human Resources Master Data', owner: 'Fahad Al-Mansoori', steward: 'Sarah Khalid Al-Ghamdi', complianceScore: 97, lastVerified: '2026-06-25' },
    { domain: 'Heavy Equipment & Fleet Data', owner: 'Tariq Mahmood', steward: 'Majid Mahmood', complianceScore: 92, lastVerified: '2026-06-24' },
    { domain: 'Warehouse Assets & Spare Parts', owner: 'Bandar Al-Ghamdi', steward: 'Hassan Al-Saeed', complianceScore: 89, lastVerified: '2026-06-23' },
    { domain: 'Fleet Operating Standards', owner: 'Tariq Mahmood', steward: 'Majid Mahmood', complianceScore: 95, lastVerified: '2026-06-20' },
    { domain: 'Financial Cost Centers & Capex', owner: 'M. Al-Harbi', steward: 'Khalid Al-Qahtani', complianceScore: 99, lastVerified: '2026-06-25' }
  ]);

  // Quality Audit simulation state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [scannedRecordCount, setScannedRecordCount] = useState(0);
  const [systemIntegrityScore, setSystemIntegrityScore] = useState(94.2);

  // Handle audit execution
  const runQualityAudit = () => {
    setIsAuditing(true);
    setAuditProgress(10);
    setAuditLogs(['[INIT] Commencing enterprise data integrity and referential validation scan...']);
    setScannedRecordCount(0);

    setTimeout(() => {
      setAuditProgress(35);
      setScannedRecordCount(45);
      setAuditLogs(prev => [
        ...prev,
        '[COMPLETENESS] Scanning 45 active Personnel & Grade structure fields...',
        '[COMPLETENESS] Found 1 incomplete address field in Riyadh Field Worker Standard records.'
      ]);
    }, 800);

    setTimeout(() => {
      setAuditProgress(60);
      setScannedRecordCount(112);
      setAuditLogs(prev => [
        ...prev,
        '[DUPLICATES] Verifying unique constraints for National ID & Equipment Chassis serial numbers...',
        '[DUPLICATES] ALERT: Match index identified potential duplicate between employee records (Emp-981 vs Emp-1014).'
      ]);
    }, 1600);

    setTimeout(() => {
      setAuditProgress(85);
      setScannedRecordCount(185);
      setAuditLogs(prev => [
        ...prev,
        '[REFERENTIAL] Checking Cost Center codes CC-RYD-CIVIL against active construction tasks...',
        '[REFERENTIAL] 100% referential cross-integrity verified. No orphaned keys found.'
      ]);
    }, 2400);

    setTimeout(() => {
      setAuditProgress(100);
      setIsAuditing(false);
      setScannedRecordCount(224);
      setSystemIntegrityScore(96.8);
      setAuditLogs(prev => [
        ...prev,
        '[COMPLETE] System Quality Scan finished. 224 total master fields evaluated.',
        '[RESULT] Trust Index updated to 96.8%. Data is safe and certified for reporting.'
      ]);
    }, 3200);
  };

  // Handle Propose Change Form Submit
  const handleProposeChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propField || !propNew) return;

    const newWorkflow: GovernanceWorkflow = {
      id: `WF-GOV-${Date.now().toString().substring(10)}`,
      domain: propDomain,
      fieldName: propField,
      previousValue: propPrev || 'Unassigned / Empty',
      proposedValue: propNew,
      justification: propReason,
      submittedBy: 'Active Administrator',
      steward: propSteward,
      step: 'Validation',
      status: 'Pending',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setWorkflows([newWorkflow, ...workflows]);
    
    // Reset fields
    setPropField('');
    setPropPrev('');
    setPropNew('');
    setPropReason('');
  };

  // Perform workflow state progression (Approve/Reject change)
  const handleWorkflowAction = (wfId: string, action: 'Approved' | 'Rejected') => {
    const updated = workflows.map(wf => {
      if (wf.id === wfId) {
        // If approved, progress the step or finalize
        const nextStep = action === 'Approved' ? 'Published' : wf.step;
        return {
          ...wf,
          status: action,
          step: nextStep as any
        };
      }
      return wf;
    });

    setWorkflows(updated);

    // If approved, reflect this change in Point-In-Time Historical Snapshots
    const affectedWf = workflows.find(wf => wf.id === wfId);
    if (affectedWf && action === 'Approved') {
      const newHistory: PointInTimeRecord = {
        id: `H-${Date.now().toString().substring(10)}`,
        entity: `${affectedWf.domain} - ${affectedWf.fieldName}`,
        date: new Date().toISOString().substring(0, 10),
        field: affectedWf.fieldName,
        oldValue: affectedWf.previousValue,
        newValue: affectedWf.proposedValue,
        authorizedBy: 'Active Admin & ' + affectedWf.steward,
        signature: 'SHA256:gov_' + Math.random().toString(16).substring(2, 8),
        ip: '10.140.2.19'
      };
      setHistoricalTimeline([newHistory, ...historicalTimeline]);

      // Update the master records state to reflect the verified value
      const updatedMasterRecords = { ...masterRecords };
      Object.keys(updatedMasterRecords).forEach(domainKey => {
        updatedMasterRecords[domainKey] = updatedMasterRecords[domainKey].map(rec => {
          if (rec.name === affectedWf.fieldName || rec.code === affectedWf.fieldName) {
            return {
              ...rec,
              name: affectedWf.proposedValue,
              lastUpdated: new Date().toISOString().substring(0, 10),
              status: 'Governed'
            };
          }
          return rec;
        });
      });
      setMasterRecords(updatedMasterRecords);
    }
  };

  // Simulate Reconstruction of Past State Query
  const queryReconstruction = () => {
    setIsReconstructing(true);
    setTimeout(() => {
      // Filter the timeline up to the chosen date to compile past view
      const recordsBeforeDate = historicalTimeline.filter(h => h.date <= reconstructionDate);
      setReconstructedState(recordsBeforeDate);
      setIsReconstructing(false);
    }, 1000);
  };

  // Dismiss a duplicate warning alert (resolve)
  const resolveDuplicate = (alertId: string, action: 'Merge' | 'KeepBoth') => {
    setDuplicateAlerts(duplicateAlerts.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status: action === 'Merge' ? 'Resolved' : 'Ignored'
        };
      }
      return alert;
    }));
  };

  // Update designated steward or owner for a domain
  const handleUpdateRole = (domainName: string, roleType: 'steward' | 'owner', value: string) => {
    const updated = stewardships.map(st => {
      if (st.domain === domainName) {
        return {
          ...st,
          [roleType]: value,
          lastVerified: new Date().toISOString().substring(0, 10)
        };
      }
      return st;
    });
    setStewardships(updated);
  };

  // Filter master records
  const domainRecords = masterRecords[selectedDomain] || [];
  const filteredMasterRecords = domainRecords.filter(rec => {
    const matchesSearch = rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.nameAr.includes(searchQuery) ||
                          rec.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Central Visual Header */}
      <div className="bg-[#0D47A1] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none transform skew-x-12"></div>
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/25 rounded-lg border border-white/20">
              <Database className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xs font-mono font-black uppercase tracking-widest text-blue-200">
              {isRtl ? 'إطار حوكمة البيانات الموحد للشركة' : 'Enterprise Data Governance & MDM Framework'}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight font-sans">
            {isRtl ? 'إدارة البيانات المرجعية وموثوقية معلومات الشركة' : 'Master Reference Registry & Digital Trust Hub'}
          </h2>
          <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
            {isRtl 
              ? 'تثبيت "مصدر الحقيقة الموحد" ومنع التكرار في كافة الأنظمة الفرعية للموارد البشرية، المعدات الثقيلة، قطع الغيار، ومراكز التكلفة المحاسبية مع حفظ تاريخي متكامل للعمليات.'
              : 'Enforcing a Single Source of Truth architecture. Centrally auditing data completeness, preventing duplicate entries, managing controlled steward workflows, and preserving point-in-time database snapshots.'}
          </p>
        </div>

        <div className="flex gap-2.5 z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl text-center min-w-[100px]">
            <p className="text-[9px] uppercase tracking-wider text-blue-200 font-mono">Data Trust Score</p>
            <p className="text-sm font-black text-green-300">{systemIntegrityScore}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl text-center min-w-[100px]">
            <p className="text-[9px] uppercase tracking-wider text-blue-200 font-mono">Governed Domains</p>
            <p className="text-sm font-black text-amber-300">5 Enterprise</p>
          </div>
        </div>
      </div>

      {/* Main Internal Navigation Subtabs */}
      <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-xs gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('mdm')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'mdm' ? 'bg-[#0D47A1] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{isRtl ? 'السجلات المرجعية الموحدة MDM' : '1. Master Data Registry'}</span>
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'quality' ? 'bg-[#0D47A1] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isRtl ? 'جودة البيانات والتدقيق التلقائي' : '2. Quality & Duplicate Auditor'}</span>
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'workflows' ? 'bg-[#0D47A1] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>{isRtl ? 'مسارات حوكمة التغيير' : '3. Change Workflows'}</span>
        </button>
        <button
          onClick={() => setActiveTab('temporal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'temporal' ? 'bg-[#0D47A1] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isRtl ? 'الاسترجاع الزمني والأرشفة' : '4. Temporal History & Snapshot'}</span>
        </button>
        <button
          onClick={() => setActiveTab('stewardship')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
            activeTab === 'stewardship' ? 'bg-[#0D47A1] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isRtl ? 'أدوار المسؤولين والمشرفين' : '5. Stewardship Roles'}</span>
        </button>
      </div>

      {/* SUBTAB 1: MASTER DATA REGISTRY (MDM) */}
      {activeTab === 'mdm' && (
        <div className="space-y-6">
          {/* Domain Selection Tabs with Domain Icons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { id: 'HR', label: 'Human Resources', labelAr: 'الموارد البشرية', icon: Users, color: 'border-blue-500 text-blue-700 bg-blue-50' },
              { id: 'Equipment', label: 'Heavy Equipment', labelAr: 'المعدات الثقيلة', icon: Wrench, color: 'border-amber-500 text-amber-700 bg-amber-50' },
              { id: 'Assets', label: 'Warehouse Assets', labelAr: 'أصول المستودعات', icon: Warehouse, color: 'border-green-500 text-green-700 bg-green-50' },
              { id: 'Vehicles', label: 'Fleet & Vehicles', labelAr: 'أسطول السيارات', icon: Briefcase, color: 'border-purple-500 text-purple-700 bg-purple-50' },
              { id: 'Finance', label: 'Financial Matrix', labelAr: 'الهيكل المحاسبي', icon: DollarSign, color: 'border-indigo-500 text-indigo-700 bg-indigo-50' }
            ].map(domain => (
              <button
                key={domain.id}
                onClick={() => {
                  setSelectedDomain(domain.id as any);
                  setSearchQuery('');
                }}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer ${
                  selectedDomain === domain.id
                    ? `${domain.color} shadow-sm border-2`
                    : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-500'
                }`}
              >
                <domain.icon className="w-5 h-5" />
                <div>
                  <p className="text-xs font-bold leading-tight">{isRtl ? domain.labelAr : domain.label}</p>
                  <p className="text-[9px] font-mono opacity-80 mt-0.5">{domain.id} Domain</p>
                </div>
              </button>
            ))}
          </div>

          {/* Search, Filter, and Registry Action Block */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={isRtl ? 'البحث بالرمز، الاسم، أو المسمى المرجعي...' : 'Search master codes, names, reference entities...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto shrink-0">
              <span className="text-xs font-bold text-gray-400 flex items-center mr-2">Filter Trust:</span>
              {['All', 'Governed', 'Pending Verification', 'Duplicate Warning'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    statusFilter === st
                      ? 'bg-[#0D47A1] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Master Record Data Listing */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[10px] font-mono uppercase border-b border-gray-100">
                  <th className="p-4">{isRtl ? 'الرمز المرجعي للبيان' : 'Entity Code'}</th>
                  <th className="p-4">{isRtl ? 'اسم الكيان المعتمد' : 'Authoritative Record Name'}</th>
                  <th className="p-4">{isRtl ? 'فئة البيانات' : 'Data Category'}</th>
                  <th className="p-4 text-center">{isRtl ? 'نسبة اكتمال الحقول' : 'Completeness Score'}</th>
                  <th className="p-4">{isRtl ? 'أمين البيانات (Steward)' : 'Assigned Steward'}</th>
                  <th className="p-4">{isRtl ? 'حالة الحوكمة' : 'Governance Status'}</th>
                  <th className="p-4 text-right">{isRtl ? 'آخر تعديل معتمد' : 'Last Certified'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredMasterRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400 font-bold">
                      No Master Data Records Match Active Query.
                    </td>
                  </tr>
                ) : (
                  filteredMasterRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-blue-700">
                        {rec.code}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{rec.name}</div>
                        <div className="text-[10px] text-gray-400">{rec.nameAr}</div>
                      </td>
                      <td className="p-4 text-gray-500 font-medium">{rec.category}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`font-mono font-bold ${rec.completeness === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                            {rec.completeness}%
                          </span>
                          <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div className={`h-full ${rec.completeness === 100 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${rec.completeness}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 flex items-center gap-1.5 mt-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {rec.steward}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                          rec.status === 'Governed' ? 'bg-green-50 text-green-700 border-green-200' :
                          rec.status === 'Pending Verification' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200 animate-pulse'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-gray-500">{rec.lastUpdated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DATA QUALITY & DUPLICATE AUDITOR */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Realtime Integrity Scanning Area */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Realtime Integrity Auditor
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Trigger automated referential checking, completeness analysis, and duplicate detection algorithms across all databases.
                </p>
              </div>

              {/* Simulation Progress Display */}
              {isAuditing ? (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                  <div className="flex justify-between text-xs font-bold text-blue-900 font-mono">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Auditing Database...
                    </span>
                    <span>{auditProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0D47A1] h-full transition-all duration-300" style={{ width: `${auditProgress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-blue-700 italic">Evaluating {scannedRecordCount} schema entries...</p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border rounded-xl space-y-2 text-center">
                  <p className="text-xs font-bold text-gray-700">Audit State: Certified</p>
                  <p className="text-[10px] text-gray-400">
                    Last audit completed on 2026-06-25 at 07:02 local time.
                  </p>
                  <button
                    onClick={runQualityAudit}
                    className="mt-2 w-full bg-[#0D47A1] hover:bg-[#1565C0] text-white text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition-colors"
                  >
                    Scan Central Reference Database
                  </button>
                </div>
              )}

              {/* Logging console for developer/auditor transparency */}
              <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-[10px] space-y-1.5 h-48 overflow-y-auto">
                <p className="text-gray-500 border-b border-gray-800 pb-1 uppercase tracking-wider text-[9px] font-bold">
                  Immutable Live Logs Console
                </p>
                {auditLogs.length === 0 ? (
                  <p className="text-gray-600 italic">No logs active. Start database validation scan to stream logs...</p>
                ) : (
                  auditLogs.map((log, lIdx) => (
                    <p key={lIdx} className="leading-relaxed">{log}</p>
                  ))
                )}
              </div>
            </div>

            {/* Duplicate Alerts Ledger */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                    Fuzzy Duplicate Detection warnings
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    System monitors active entry points to ensure no duplicated entity or employee registers twice.
                  </p>
                </div>
                <span className="text-xs bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-100">
                  {duplicateAlerts.filter(a => a.status === 'Active').length} Active Alerts
                </span>
              </div>

              <div className="space-y-3">
                {duplicateAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                    alert.status !== 'Active' ? 'opacity-45 bg-gray-50 border-gray-100' : 'bg-white border-red-100 shadow-xs'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="font-bold text-gray-900">{alert.domain}</span>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">Match Confidence: <strong className="text-red-600">{alert.confidence}%</strong></span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[11px] p-2 bg-gray-50 rounded-lg font-mono">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-gray-400">Record Candidate A</p>
                        <p className="text-gray-700 font-semibold truncate mt-0.5">{alert.recordA}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-gray-400">Record Candidate B</p>
                        <p className="text-gray-700 font-semibold truncate mt-0.5">{alert.recordB}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Overlap detected on: <strong className="text-gray-800 font-bold">{alert.matchedField}</strong>
                    </p>

                    {alert.status === 'Active' ? (
                      <div className="flex justify-end gap-2 pt-1 border-t border-dashed border-gray-100">
                        <button
                          onClick={() => resolveDuplicate(alert.id, 'Merge')}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2.5 rounded text-[10px] cursor-pointer transition-colors"
                        >
                          Resolve (Merge Records)
                        </button>
                        <button
                          onClick={() => resolveDuplicate(alert.id, 'KeepBoth')}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-1 px-2.5 rounded text-[10px] cursor-pointer border transition-colors"
                        >
                          Dismiss (Legitimate Exception)
                        </button>
                      </div>
                    ) : (
                      <div className="text-right text-gray-500 font-bold font-mono text-[10px]">
                        ✓ Status: {alert.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CONTROLLED CHANGE MANAGEMENT WORKFLOWS */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Propose Change Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  Propose Master Data Change
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Submit critical amendments to governed reference codes. All changes require Steward vetting.
                </p>
              </div>

              <form onSubmit={handleProposeChange} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Registry Domain</label>
                  <select
                    value={propDomain}
                    onChange={(e) => setPropDomain(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-gray-50"
                  >
                    <option value="Human Resources">Human Resources Master</option>
                    <option value="Heavy Equipment">Heavy Equipment Registry</option>
                    <option value="Warehouse Assets">Warehouse Assets & Spares</option>
                    <option value="Finance & Accounts">Finance Cost Centers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Entity Field or Code to Amend</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-GRADE-12 or CC-RYD-CIVIL"
                    value={propField}
                    onChange={(e) => setPropField(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Current/Old Value</label>
                    <input
                      type="text"
                      placeholder="e.g. 65,000 SAR"
                      value={propPrev}
                      onChange={(e) => setPropPrev(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Proposed New Value</label>
                    <input
                      type="text"
                      placeholder="e.g. 72,000 SAR"
                      value={propNew}
                      onChange={(e) => setPropNew(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Governance Change Rationale / Justification</label>
                  <textarea
                    placeholder="Enter compliance details and justification..."
                    value={propReason}
                    onChange={(e) => setPropReason(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Vetting Data Steward</label>
                  <select
                    value={propSteward}
                    onChange={(e) => setPropSteward(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-gray-50"
                  >
                    <option value="Sarah Khalid Al-Ghamdi">Sarah Khalid Al-Ghamdi (HR Officer)</option>
                    <option value="Majid Mahmood">Majid Mahmood (Operations Inspector)</option>
                    <option value="Hassan Al-Saeed">Hassan Al-Saeed (Inventory Supervisor)</option>
                    <option value="Khalid Al-Qahtani">Khalid Al-Qahtani (Finance Analyst)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Initiate Change Proposal
                </button>
              </form>
            </div>

            {/* Active Workflows Pipeline */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-bold text-gray-900 text-sm">Governance Workflows Pipeline</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Active reference amendments undergoing automated checks and steward authorization.
                </p>
              </div>

              <div className="space-y-4">
                {workflows.map(wf => (
                  <div key={wf.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                          {wf.id} • {wf.domain}
                        </span>
                        <h4 className="font-bold text-gray-900 text-xs mt-1.5">Modify: {wf.fieldName}</h4>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                          wf.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          wf.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {wf.status === 'Pending' ? `Step: ${wf.step}` : wf.status}
                        </span>
                        <p className="text-[9px] text-gray-400 font-mono mt-1">{wf.timestamp}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-white border rounded-lg p-2.5 font-mono">
                      <div>
                        <span className="text-[9px] uppercase text-gray-400">Previous Verified Value</span>
                        <p className="text-gray-600 line-through truncate mt-0.5">{wf.previousValue}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-green-600">Proposed Target Value</span>
                        <p className="text-green-700 font-bold truncate mt-0.5">{wf.proposedValue}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-100 italic">
                      "Rationale: {wf.justification}"
                    </p>

                    <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1.5">
                      <span>Proposer: <strong className="text-gray-700">{wf.submittedBy}</strong></span>
                      <span>Assigned Steward: <strong className="text-gray-700">{wf.steward}</strong></span>
                    </div>

                    {wf.status === 'Pending' && (
                      <div className="flex gap-2 justify-end pt-2 border-t border-dashed border-gray-200">
                        <button
                          onClick={() => handleWorkflowAction(wf.id, 'Approved')}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Approve & Publish to MDM
                        </button>
                        <button
                          onClick={() => handleWorkflowAction(wf.id, 'Rejected')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition-colors border border-red-200"
                        >
                          Reject Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: TEMPORAL HISTORY & RECONSTRUCTION */}
      {activeTab === 'temporal' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Point-In-Time Query Engine */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Point-In-Time Reconstruction
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Reconstruct database reference variables exactly as they were on any past calendar date.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Historic Date</label>
                  <input
                    type="date"
                    value={reconstructionDate}
                    onChange={(e) => setReconstructionDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono"
                    max="2026-06-25"
                  />
                </div>

                <button
                  onClick={queryReconstruction}
                  disabled={isReconstructing}
                  className="w-full bg-[#0D47A1] hover:bg-[#1565C0] text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isReconstructing ? 'Compiling Sandbox...' : 'Reconstruct State on Date'}
                </button>
              </div>

              {/* Compiled sandbox results */}
              {reconstructedState.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl space-y-2">
                  <h4 className="font-bold text-green-900 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Sandbox Compiled Successfully
                  </h4>
                  <p className="text-[10px] text-green-700 leading-relaxed">
                    Identified {reconstructedState.length} active master modifications on or before {reconstructionDate}. Data verified safe for temporal compliance audits.
                  </p>
                </div>
              )}
            </div>

            {/* Cryptographic Ledger timeline of changes */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Fingerprint className="w-5 h-5 text-blue-600" />
                  Point-in-Time Traceability & Version Log
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Immutable database ledger detailing authorized reference alterations with secure IP metadata.
                </p>
              </div>

              <div className="relative border-l-2 border-gray-100 pl-4 space-y-6">
                {historicalTimeline.map(history => (
                  <div key={history.id} className="relative space-y-2">
                    {/* Visual dot on vertical line */}
                    <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white"></div>
                    
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="font-mono text-xs font-black text-gray-900">{history.date}</span>
                      <span className="bg-gray-100 text-gray-500 font-mono text-[9px] px-2 py-0.5 rounded">
                        Ledger ID: {history.id}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2 text-xs">
                      <p className="font-bold text-gray-800">Entity: {history.entity}</p>
                      
                      <div className="grid grid-cols-2 gap-4 font-mono text-[11px] p-2 bg-white border border-gray-100 rounded">
                        <div>
                          <p className="text-[9px] uppercase text-gray-400">Old Value</p>
                          <p className="text-gray-500 line-through truncate mt-0.5">{history.oldValue}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-green-600">New Value</p>
                          <p className="text-green-700 font-bold truncate mt-0.5">{history.newValue}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-2 text-[10px] text-gray-400 pt-1 border-t border-dashed border-gray-100 font-mono">
                        <span>Sign: {history.signature}</span>
                        <span>Authorized: {history.authorizedBy}</span>
                        <span>IP: {history.ip}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: STEWARDSHIP & GOVERNANCE ROLES */}
      {activeTab === 'stewardship' && (
        <div className="space-y-6">
          
          {/* Executive Accountability Table */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Designated Stewards & Accountability Table</h3>
              <p className="text-xs text-gray-400 mt-1">
                Establish direct operational accountability. Ensure every master data field is governed by designated specialists.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-mono uppercase text-[9px] border-b border-gray-100">
                    <th className="p-3">Reference Domain</th>
                    <th className="p-3">Designated Data Owner</th>
                    <th className="p-3">Designated Data Steward</th>
                    <th className="p-3 text-center">Compliance Score</th>
                    <th className="p-3 text-right">Last Verified Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stewardships.map(st => (
                    <tr key={st.domain} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 font-bold text-gray-800">{st.domain}</td>
                      <td className="p-3">
                        <select
                          value={st.owner}
                          onChange={(e) => handleUpdateRole(st.domain, 'owner', e.target.value)}
                          className="border border-gray-200 rounded p-1 text-xs bg-white font-medium focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Fahad Al-Mansoori">Fahad Al-Mansoori (HR VP)</option>
                          <option value="Tariq Mahmood">Tariq Mahmood (Fleet VP)</option>
                          <option value="Bandar Al-Ghamdi">Bandar Al-Ghamdi (Procurement VP)</option>
                          <option value="M. Al-Harbi">M. Al-Harbi (Finance Director)</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={st.steward}
                          onChange={(e) => handleUpdateRole(st.domain, 'steward', e.target.value)}
                          className="border border-gray-200 rounded p-1 text-xs bg-white font-medium focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Sarah Khalid Al-Ghamdi">Sarah Khalid Al-Ghamdi (HR Officer)</option>
                          <option value="Majid Mahmood">Majid Mahmood (Fleet Supervisor)</option>
                          <option value="Hassan Al-Saeed">Hassan Al-Saeed (Inventory Lead)</option>
                          <option value="Khalid Al-Qahtani">Khalid Al-Qahtani (Finance Analyst)</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          st.complianceScore >= 95 ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'
                        }`}>
                          {st.complianceScore}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-gray-400">{st.lastVerified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Duties definition block */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-1">
              <span className="font-bold text-[#0D47A1] block font-mono text-[10px] uppercase">Data Owner</span>
              <p className="text-gray-700 font-semibold text-xs">Strategic Governance</p>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Legally accountable for structural compliance, naming rules, third-party integrations, and master schema structures.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-1">
              <span className="font-bold text-[#0D47A1] block font-mono text-[10px] uppercase">Data Steward</span>
              <p className="text-gray-700 font-semibold text-xs">Quality and Accuracy</p>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Enforces continuous completeness, resolves duplicate warnings, and vets proposed field alterations on the pipeline.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-1">
              <span className="font-bold text-[#0D47A1] block font-mono text-[10px] uppercase">Data Approver</span>
              <p className="text-gray-700 font-semibold text-xs">Vetting Operations</p>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Validates compliance reasons, verifies authorization hash signatures, and authorizes structural publication.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-1">
              <span className="font-bold text-[#0D47A1] block font-mono text-[10px] uppercase">Data Admin</span>
              <p className="text-gray-700 font-semibold text-xs">Technical Stability</p>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Manages physical databases, optimizes index performance, and maintains cryptographic point-in-time snapshots.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
