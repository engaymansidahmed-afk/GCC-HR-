import React, { useState } from 'react';
import {
  Check,
  X,
  Search,
  Filter,
  Plus,
  FileText,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  Wrench,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  CornerDownRight,
  MessageSquare,
  Share2,
  Inbox,
  Layers,
  ChevronDown,
  Info,
  Clock,
  Briefcase,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  RefreshCw,
  Send,
  Flag
} from 'lucide-react';

export interface ApprovalHistoryItem {
  level: number;
  levelName: string;
  approverName: string;
  action: 'Approved' | 'Rejected' | 'Returned' | 'Escalated' | 'Delegated';
  date: string;
  comment: string;
}

export interface PendingRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  branch: string;
  jobTitle: string;
  requestType:
    | 'Leave Request'
    | 'Attendance Adjustment'
    | 'Overtime Request'
    | 'Loan Request'
    | 'Salary Advance'
    | 'Business Trip'
    | 'Equipment Request'
    | 'Vehicle Request'
    | 'Fuel Request'
    | 'Maintenance Request'
    | 'Recruitment Request'
    | 'Training Request'
    | 'Document Update'
    | 'Employee Information Change'
    | 'Contract Renewal'
    | 'Resignation Request'
    | 'Transfer Request'
    | 'Promotion Request';
  requestDate: string;
  currentLevel: number; // 1 to 5
  currentLevelName: string;
  currentApprover: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  pendingDays: number;
  slaLimitHours: number;
  isFinancial: boolean;
  valueSAR: number;
  details: string;
  history: ApprovalHistoryItem[];
}

interface EnterpriseRequestsCenterProps {
  isRtl: boolean;
  employees: any[];
  onAddNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning', module: string) => void;
}

export default function EnterpriseRequestsCenter({ isRtl, employees, onAddNotification }: EnterpriseRequestsCenterProps) {
  // Initial list of 18 pending requests matching all requested types!
  const [requests, setRequests] = useState<PendingRequest[]>([
    {
      id: 'REQ-2026-101',
      employeeName: 'Rajesh Subramanian Kumar',
      employeeId: 'EMP-2026-005',
      department: 'Engineering & Operations',
      branch: 'NEOM Site Office',
      jobTitle: 'Heavy Excavator Operator',
      requestType: 'Leave Request',
      requestDate: '2026-06-20',
      currentLevel: 3,
      currentLevelName: 'Level 3 – Human Resources Department',
      currentApprover: 'Sarah Khalid Al-Ghamdi (HR Mgr)',
      status: 'Pending',
      priority: 'High',
      pendingDays: 5,
      slaLimitHours: 48,
      isFinancial: false,
      valueSAR: 0,
      details: 'Requesting 30 days of annual vacation starting Sep 1st to visit family in India.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Ahmed Al-Dossary', action: 'Approved', date: '2026-06-21', comment: 'Operations schedule permits. Recommended.' },
        { level: 2, levelName: 'Level 2 – Department Manager', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-22', comment: 'Approved on operational ground.' }
      ]
    },
    {
      id: 'REQ-2026-102',
      employeeName: 'Faisal Ahmed Al-Harbi',
      employeeId: 'EMP-2026-004',
      department: 'Maintenance & Service',
      branch: 'Riyadh (HQ)',
      jobTitle: 'Senior Mechanic',
      requestType: 'Attendance Adjustment',
      requestDate: '2026-06-24',
      currentLevel: 1,
      currentLevelName: 'Level 1 – Direct Supervisor',
      currentApprover: 'Ahmed Faraj Al-Dossary (Supervisor)',
      status: 'Pending',
      priority: 'Medium',
      pendingDays: 1,
      slaLimitHours: 24,
      isFinancial: false,
      valueSAR: 0,
      details: 'Forgot to clock in on morning shift due to urgent emergency repair call-out at Site B.',
      history: []
    },
    {
      id: 'REQ-2026-103',
      employeeName: 'Sajid Mahmood',
      employeeId: 'EMP-2026-008',
      department: 'Construction Operations',
      branch: 'Jeddah',
      jobTitle: 'Welder',
      requestType: 'Overtime Request',
      requestDate: '2026-06-21',
      currentLevel: 2,
      currentLevelName: 'Level 2 – Department Manager',
      currentApprover: 'Bandar Al-Ghamdi (Project Manager)',
      status: 'Pending',
      priority: 'Low',
      pendingDays: 4,
      slaLimitHours: 48,
      isFinancial: true,
      valueSAR: 1450,
      details: 'Overtime compensation request for 12 hours of night shift concrete joint reinforcement welding.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Ahmed Al-Dossary', action: 'Approved', date: '2026-06-22', comment: 'Welding completed under urgent deadline. Approved.' }
      ]
    },
    {
      id: 'REQ-2026-104',
      employeeName: 'Yousef Al-Otaibi',
      employeeId: 'EMP-2026-010',
      department: 'Fleet Maintenance',
      branch: 'Dammam',
      jobTitle: 'Safety Inspector',
      requestType: 'Loan Request',
      requestDate: '2026-06-18',
      currentLevel: 4,
      currentLevelName: 'Level 4 – Finance / Accountant',
      currentApprover: 'Mohammad Salem Al-Qahtani (Finance Dir)',
      status: 'Pending',
      priority: 'Critical',
      pendingDays: 7,
      slaLimitHours: 48,
      isFinancial: true,
      valueSAR: 45000,
      details: 'Personal medical advance loan request with automatic monthly salary deductions of 3,750 SAR.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Tariq Mahmood', action: 'Approved', date: '2026-06-19', comment: 'Recommended on compassionate medical grounds.' },
        { level: 2, levelName: 'Level 2 – Department Manager', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-20', comment: 'Supports employee stability.' },
        { level: 3, levelName: 'Level 3 – Human Resources Department', approverName: 'Sarah Khalid Al-Ghamdi', action: 'Approved', date: '2026-06-21', comment: 'Balances are clear. Forwarding to Finance.' }
      ]
    },
    {
      id: 'REQ-2026-105',
      employeeName: 'Adnan Al-Shehri',
      employeeId: 'EMP-2026-009',
      department: 'Engineering & Operations',
      branch: 'Riyadh (HQ)',
      jobTitle: 'Lead Civil Engineer',
      requestType: 'Salary Advance',
      requestDate: '2026-06-23',
      currentLevel: 3,
      currentLevelName: 'Level 3 – Human Resources Department',
      currentApprover: 'Sarah Khalid Al-Ghamdi (HR Mgr)',
      status: 'Pending',
      priority: 'Medium',
      pendingDays: 2,
      slaLimitHours: 48,
      isFinancial: true,
      valueSAR: 8000,
      details: 'Advance of 50% of monthly basic salary due to urgent housing lease payment.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-24', comment: 'Approved.' },
        { level: 2, levelName: 'Level 2 – Department Manager', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-24', comment: 'Approved.' }
      ]
    },
    {
      id: 'REQ-2026-106',
      employeeName: 'John Michael Doe',
      employeeId: 'EMP-2026-007',
      department: 'Engineering & Operations',
      branch: 'NEOM Site Office',
      jobTitle: 'Lead Engineer',
      requestType: 'Business Trip',
      requestDate: '2026-06-22',
      currentLevel: 5,
      currentLevelName: 'Level 5 – General Manager (Final Approval)',
      currentApprover: 'Tariq Abdulaziz Al-Otaibi (General Manager)',
      status: 'Pending',
      priority: 'High',
      pendingDays: 3,
      slaLimitHours: 72,
      isFinancial: true,
      valueSAR: 3500,
      details: 'Business trip delegation to Riyadh HQ for NEOM structural board reviews and compliance audit.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Ahmed Faraj Al-Dossary', action: 'Approved', date: '2026-06-22', comment: 'Crucial presentation.' },
        { level: 2, levelName: 'Level 2 – Department Manager', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-23', comment: 'Approved.' },
        { level: 3, levelName: 'Level 3 – Human Resources Department', approverName: 'Sarah Khalid Al-Ghamdi', action: 'Approved', date: '2026-06-24', comment: 'Flights and accommodation budget verified.' }
      ]
    },
    {
      id: 'REQ-2026-107',
      employeeName: 'Tariq Mahmood',
      employeeId: 'EMP-2026-012',
      department: 'Fleet Maintenance',
      branch: 'NEOM Site Office',
      jobTitle: 'Fleet Supervisor',
      requestType: 'Equipment Request',
      requestDate: '2026-06-25',
      currentLevel: 1,
      currentLevelName: 'Level 1 – Direct Supervisor',
      currentApprover: 'Ahmed Faraj Al-Dossary (Supervisor)',
      status: 'Pending',
      priority: 'Medium',
      pendingDays: 0,
      slaLimitHours: 24,
      isFinancial: false,
      valueSAR: 0,
      details: 'Requesting allocation of 1x Leica TS16 High-Precision Robotic Total Station for Site C excavation plotting.',
      history: []
    },
    {
      id: 'REQ-2026-108',
      employeeName: 'Rajesh Subramanian Kumar',
      employeeId: 'EMP-2026-005',
      department: 'Engineering & Operations',
      branch: 'NEOM Site Office',
      jobTitle: 'Heavy Excavator Operator',
      requestType: 'Vehicle Request',
      requestDate: '2026-06-24',
      currentLevel: 2,
      currentLevelName: 'Level 2 – Department Manager',
      currentApprover: 'John Michael Doe (Lead Engineer)',
      status: 'Pending',
      priority: 'High',
      pendingDays: 1,
      slaLimitHours: 48,
      isFinancial: false,
      valueSAR: 0,
      details: 'Requesting 4x4 pickup truck assignment for remote site survey and shift rotation transport.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Ahmed Al-Dossary', action: 'Approved', date: '2026-06-24', comment: 'Operator requires mobility.' }
      ]
    },
    {
      id: 'REQ-2026-109',
      employeeName: 'Bandar Al-Ghamdi',
      employeeId: 'EMP-2026-011',
      department: 'Engineering & Operations',
      branch: 'Riyadh (HQ)',
      jobTitle: 'Project Manager',
      requestType: 'Fuel Request',
      requestDate: '2026-06-25',
      currentLevel: 1,
      currentLevelName: 'Level 1 – Direct Supervisor',
      currentApprover: 'Tariq Abdulaziz Al-Otaibi (Supervisor)',
      status: 'Pending',
      priority: 'High',
      pendingDays: 0,
      slaLimitHours: 24,
      isFinancial: true,
      valueSAR: 12400,
      details: 'Diesel fuel replenishment dispatch (5,000 Liters) for heavy generators operating at Riyadh Metro construction Sector 4.',
      history: []
    },
    {
      id: 'REQ-2026-110',
      employeeName: 'Faisal Ahmed Al-Harbi',
      employeeId: 'EMP-2026-004',
      department: 'Maintenance & Service',
      branch: 'Riyadh (HQ)',
      jobTitle: 'Senior Mechanic',
      requestType: 'Maintenance Request',
      requestDate: '2026-06-23',
      currentLevel: 2,
      currentLevelName: 'Level 2 – Department Manager',
      currentApprover: 'Tariq Abdulaziz Al-Otaibi (Manager)',
      status: 'Pending',
      priority: 'Critical',
      pendingDays: 2,
      slaLimitHours: 24,
      isFinancial: true,
      valueSAR: 8400,
      details: 'Emergency spare part procurement & maintenance of main boom telescoping hydraulic cylinders for Liebherr Crane LTM 1050.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Ahmed Faraj Al-Dossary', action: 'Approved', date: '2026-06-23', comment: 'Crane out-of-service. Priority 1.' }
      ]
    },
    {
      id: 'REQ-2026-111',
      employeeName: 'Sarah Khalid Al-Ghamdi',
      employeeId: 'EMP-2026-002',
      department: 'Human Resources',
      branch: 'Riyadh (HQ)',
      jobTitle: 'Manager',
      requestType: 'Recruitment Request',
      requestDate: '2026-06-21',
      currentLevel: 5,
      currentLevelName: 'Level 5 – General Manager (Final Approval)',
      currentApprover: 'Tariq Abdulaziz Al-Otaibi (General Manager)',
      status: 'Pending',
      priority: 'Medium',
      pendingDays: 4,
      slaLimitHours: 72,
      isFinancial: true,
      valueSAR: 15000,
      details: 'Urgent hiring recruitment post for 3x certified concrete lab technicians and 2x senior safety inspectors for Riyadh Metro project.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-21', comment: 'Workforce shortage critical.' },
        { level: 2, levelName: 'Level 2 – Department Manager', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-22', comment: 'Approved.' },
        { level: 3, levelName: 'Level 3 – Human Resources Department', approverName: 'Sarah Khalid Al-Ghamdi', action: 'Approved', date: '2026-06-23', comment: 'Budgets and headcount vacancy verified.' }
      ]
    },
    {
      id: 'REQ-2026-112',
      employeeName: 'Faisal Ahmed Al-Harbi',
      employeeId: 'EMP-2026-004',
      department: 'Maintenance & Service',
      branch: 'Riyadh (HQ)',
      jobTitle: 'Senior Mechanic',
      requestType: 'Training Request',
      requestDate: '2026-06-24',
      currentLevel: 2,
      currentLevelName: 'Level 2 – Department Manager',
      currentApprover: 'Tariq Abdulaziz Al-Otaibi (Manager)',
      status: 'Pending',
      priority: 'Low',
      pendingDays: 1,
      slaLimitHours: 48,
      isFinancial: true,
      valueSAR: 2200,
      details: 'Enrolment request for high-capacity hydraulic troubleshooting training certification at Liebherr Training Center.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Ahmed Faraj Al-Dossary', action: 'Approved', date: '2026-06-24', comment: 'Will greatly improve repair response.' }
      ]
    },
    {
      id: 'REQ-2026-113',
      employeeName: 'Rajesh Subramanian Kumar',
      employeeId: 'EMP-2026-005',
      department: 'Engineering & Operations',
      branch: 'NEOM Site Office',
      jobTitle: 'Heavy Excavator Operator',
      requestType: 'Document Update',
      requestDate: '2026-06-25',
      currentLevel: 1,
      currentLevelName: 'Level 1 – Direct Supervisor',
      currentApprover: 'Ahmed Al-Dossary (Supervisor)',
      status: 'Pending',
      priority: 'High',
      pendingDays: 0,
      slaLimitHours: 24,
      isFinancial: false,
      valueSAR: 0,
      details: 'Submission and verification of newly renewed Saudi driving license (Heavy Duty, Exp: 2036).',
      history: []
    },
    {
      id: 'REQ-2026-114',
      employeeName: 'Sajid Mahmood',
      employeeId: 'EMP-2026-008',
      department: 'Construction Operations',
      branch: 'Jeddah',
      jobTitle: 'Welder',
      requestType: 'Employee Information Change',
      requestDate: '2026-06-25',
      currentLevel: 1,
      currentLevelName: 'Level 1 – Direct Supervisor',
      currentApprover: 'Ahmed Al-Dossary (Supervisor)',
      status: 'Pending',
      priority: 'Low',
      pendingDays: 0,
      slaLimitHours: 24,
      isFinancial: false,
      valueSAR: 0,
      details: 'Updating mobile number to +966 59 123 9988 and changing primary emergency contact details.',
      history: []
    },
    {
      id: 'REQ-2026-115',
      employeeName: 'Rajesh Subramanian Kumar',
      employeeId: 'EMP-2026-005',
      department: 'Engineering & Operations',
      branch: 'NEOM Site Office',
      jobTitle: 'Heavy Excavator Operator',
      requestType: 'Contract Renewal',
      requestDate: '2026-06-20',
      currentLevel: 3,
      currentLevelName: 'Level 3 – Human Resources Department',
      currentApprover: 'Sarah Khalid Al-Ghamdi (HR Mgr)',
      status: 'Pending',
      priority: 'High',
      pendingDays: 5,
      slaLimitHours: 48,
      isFinancial: true,
      valueSAR: 78000,
      details: 'Request for 1-year employment contract renewal with proposed 5% adjustment for outstanding performance index.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Ahmed Al-Dossary', action: 'Approved', date: '2026-06-21', comment: 'Highly recommended. Top operator at site.' },
        { level: 2, levelName: 'Level 2 – Department Manager', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-22', comment: 'Approved on project budget.' }
      ]
    },
    {
      id: 'REQ-2026-116',
      employeeName: 'John Michael Doe',
      employeeId: 'EMP-2026-007',
      department: 'Engineering & Operations',
      branch: 'NEOM Site Office',
      jobTitle: 'Lead Engineer',
      requestType: 'Resignation Request',
      requestDate: '2026-06-19',
      currentLevel: 3,
      currentLevelName: 'Level 3 – Human Resources Department',
      currentApprover: 'Sarah Khalid Al-Ghamdi (HR Mgr)',
      status: 'Pending',
      priority: 'Critical',
      pendingDays: 6,
      slaLimitHours: 72,
      isFinancial: false,
      valueSAR: 0,
      details: 'Official 30-day notice of resignation due to relocation opportunities in home country (UK).',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Ahmed Al-Dossary', action: 'Approved', date: '2026-06-20', comment: 'Regretfully recommended. Need replacement search immediately.' },
        { level: 2, levelName: 'Level 2 – Department Manager', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-21', comment: 'Initiated exit workflow.' }
      ]
    },
    {
      id: 'REQ-2026-117',
      employeeName: 'Faisal Ahmed Al-Harbi',
      employeeId: 'EMP-2026-004',
      department: 'Maintenance & Service',
      branch: 'Riyadh (HQ)',
      jobTitle: 'Senior Mechanic',
      requestType: 'Transfer Request',
      requestDate: '2026-06-22',
      currentLevel: 3,
      currentLevelName: 'Level 3 – Human Resources Department',
      currentApprover: 'Sarah Khalid Al-Ghamdi (HR Mgr)',
      status: 'Pending',
      priority: 'Medium',
      pendingDays: 3,
      slaLimitHours: 48,
      isFinancial: false,
      valueSAR: 0,
      details: 'Request to transfer permanently from Riyadh HQ Workshop to NEOM Site Support Depot due to site workload demands.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Ahmed Faraj Al-Dossary', action: 'Approved', date: '2026-06-23', comment: 'Highly useful transfer. Approved.' },
        { level: 2, levelName: 'Level 2 – Department Manager', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-23', comment: 'Fills structural vacancy at NEOM depot.' }
      ]
    },
    {
      id: 'REQ-2026-118',
      employeeName: 'Ahmed Faraj Al-Dossary',
      employeeId: 'EMP-2026-006',
      department: 'Engineering & Operations',
      branch: 'Riyadh (HQ)',
      jobTitle: 'Supervisor',
      requestType: 'Promotion Request',
      requestDate: '2026-06-17',
      currentLevel: 5,
      currentLevelName: 'Level 5 – General Manager (Final Approval)',
      currentApprover: 'Tariq Abdulaziz Al-Otaibi (General Manager)',
      status: 'Pending',
      priority: 'High',
      pendingDays: 8,
      slaLimitHours: 72,
      isFinancial: true,
      valueSAR: 4500,
      details: 'Proposed promotion to Operations Assistant Director, citing 10 years of site safety management achievements.',
      history: [
        { level: 1, levelName: 'Level 1 – Direct Supervisor', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-18', comment: 'Outstanding track record.' },
        { level: 2, levelName: 'Level 2 – Department Manager', approverName: 'Tariq Abdulaziz Al-Otaibi', action: 'Approved', date: '2026-06-19', comment: 'Strong recommendation.' },
        { level: 3, levelName: 'Level 3 – Human Resources Department', approverName: 'Sarah Khalid Al-Ghamdi', action: 'Approved', date: '2026-06-21', comment: 'Organization structure allows.' }
      ]
    }
  ]);

  // Approved/Rejected Today state counters (resets on reload, or tracking actions)
  const [approvedToday, setApprovedToday] = useState(3);
  const [rejectedToday, setRejectedToday] = useState(1);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStage, setFilterStage] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Pending'); // Defaults to show Pending
  const [filterPriority, setFilterPriority] = useState('All');

  // Details Modal State
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [modalAction, setModalAction] = useState<'view' | 'approve' | 'reject' | 'comment' | 'escalate' | 'delegate'>('view');
  const [commentText, setCommentText] = useState('');
  const [delegationTarget, setDelegationTarget] = useState('');

  // 1. Calculations & Metrics
  const totalPending = requests.filter((r) => r.status === 'Pending').length;
  
  const awaitingSupervisor = requests.filter((r) => r.status === 'Pending' && r.currentLevel === 1).length;
  const awaitingManager = requests.filter((r) => r.status === 'Pending' && r.currentLevel === 2).length;
  const awaitingHR = requests.filter((r) => r.status === 'Pending' && r.currentLevel === 3).length;
  const awaitingFinance = requests.filter((r) => r.status === 'Pending' && r.currentLevel === 4).length;
  const awaitingExecutive = requests.filter((r) => r.status === 'Pending' && r.currentLevel === 5).length;

  const overdueRequests = requests.filter((r) => r.status === 'Pending' && r.pendingDays * 24 > r.slaLimitHours).length;

  // Department unique options
  const departments = ['All', ...Array.from(new Set(requests.map((r) => r.department)))];
  // Branches
  const branches = ['All', ...Array.from(new Set(requests.map((r) => r.branch)))];
  // Request Types
  const requestTypes = ['All', ...Array.from(new Set(requests.map((r) => r.requestType)))];
  // Stages
  const stages = [
    { value: 'All', label: isRtl ? 'جميع المراحل' : 'All Stages' },
    { value: '1', label: isRtl ? 'المشرف المباشر (مستوى 1)' : 'Direct Supervisor (L1)' },
    { value: '2', label: isRtl ? 'مدير القسم (مستوى 2)' : 'Dept Manager (L2)' },
    { value: '3', label: isRtl ? 'الموارد البشرية (مستوى 3)' : 'HR Department (L3)' },
    { value: '4', label: isRtl ? 'الشؤون المالية (مستوى 4)' : 'Finance/Accountant (L4)' },
    { value: '5', label: isRtl ? 'المدير العام (مستوى 5)' : 'General Manager (L5)' }
  ];

  // Filter logic
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = filterDept === 'All' || r.department === filterDept;
    const matchesBranch = filterBranch === 'All' || r.branch === filterBranch;
    const matchesType = filterType === 'All' || r.requestType === filterType;
    const matchesStage = filterStage === 'All' || r.currentLevel.toString() === filterStage;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || r.priority === filterPriority;

    return (
      matchesSearch &&
      matchesDept &&
      matchesBranch &&
      matchesType &&
      matchesStage &&
      matchesStatus &&
      matchesPriority
    );
  });

  // Action Handlers
  const handleApprove = (reqId: string, comment: string) => {
    let notifyTitle = '';
    let notifyMsg = '';

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;

        const nextLevel = r.currentLevel + 1;
        const isCurrentlyFinancial = r.isFinancial;

        // Routing Rules
        let finalLevel = nextLevel;
        let newLevelName = '';
        let newApprover = '';

        // If nextLevel is 4 but request is NOT financial, skip L4 and go to L5
        if (nextLevel === 4 && !isCurrentlyFinancial) {
          finalLevel = 5;
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const newHistoryItem: ApprovalHistoryItem = {
          level: r.currentLevel,
          levelName: r.currentLevelName,
          approverName: r.currentApprover,
          action: 'Approved',
          date: dateStr,
          comment: comment || (isRtl ? 'تمت الموافقة والتوصية.' : 'Approved and forwarded.')
        };

        const updatedHistory = [...r.history, newHistoryItem];

        if (finalLevel > 5) {
          // Fully approved!
          setApprovedToday((prev) => prev + 1);
          notifyTitle = isRtl ? 'اعتماد نهائي للطلب' : 'Request Fully Approved';
          notifyMsg = isRtl
            ? `تم اعتماد طلب الموظف ${r.employeeName} (${r.requestType}) بشكل نهائي.`
            : `Request (${r.requestType}) for ${r.employeeName} has been fully approved by General Manager.`;

          return {
            ...r,
            status: 'Approved',
            currentLevel: 5,
            currentApprover: isRtl ? 'منتهي - معتمد' : 'Completed - Approved',
            history: updatedHistory
          };
        } else {
          // Move to next stage
          if (finalLevel === 2) {
            newLevelName = 'Level 2 – Department Manager';
            newApprover = isRtl ? 'مدير القسم الإداري' : 'Department Manager';
          } else if (finalLevel === 3) {
            newLevelName = 'Level 3 – Human Resources Department';
            newApprover = 'Sarah Khalid Al-Ghamdi (HR Mgr)';
          } else if (finalLevel === 4) {
            newLevelName = 'Level 4 – Finance / Accountant';
            newApprover = 'Mohammad Salem Al-Qahtani (Finance Dir)';
          } else if (finalLevel === 5) {
            newLevelName = 'Level 5 – General Manager (Final Approval)';
            newApprover = 'Tariq Abdulaziz Al-Otaibi (General Manager)';
          }

          notifyTitle = isRtl ? 'تقدم مسار الاعتماد' : 'Workflow Advanced';
          notifyMsg = isRtl
            ? `تم تمرير طلب الموظف ${r.employeeName} إلى ${newLevelName}.`
            : `Request for ${r.employeeName} moved to ${newLevelName} for review.`;

          return {
            ...r,
            currentLevel: finalLevel,
            currentLevelName: newLevelName,
            currentApprover: newApprover,
            history: updatedHistory,
            pendingDays: 0 // resets pending timer for new SLA stage
          };
        }
      })
    );

    if (onAddNotification) {
      onAddNotification(notifyTitle, notifyMsg, 'success', 'Approvals');
    }
    setCommentText('');
    setSelectedRequest(null);
  };

  const handleReject = (reqId: string, comment: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;

        const dateStr = new Date().toISOString().split('T')[0];
        const newHistoryItem: ApprovalHistoryItem = {
          level: r.currentLevel,
          levelName: r.currentLevelName,
          approverName: r.currentApprover,
          action: 'Rejected',
          date: dateStr,
          comment: comment || (isRtl ? 'مرفوض بسبب عدم التوافق.' : 'Rejected due to non-compliance.')
        };

        setRejectedToday((prev) => prev + 1);

        if (onAddNotification) {
          onAddNotification(
            isRtl ? 'تم رفض الطلب' : 'Request Rejected',
            isRtl
              ? `تم رفض طلب ${r.employeeName} (${r.requestType}) من قِبل ${r.currentApprover}.`
              : `Request (${r.requestType}) for ${r.employeeName} has been rejected by ${r.currentApprover}.`,
            'warning',
            'Approvals'
          );
        }

        return {
          ...r,
          status: 'Rejected',
          history: [...r.history, newHistoryItem]
        };
      })
    );
    setCommentText('');
    setSelectedRequest(null);
  };

  const handleEscalate = (reqId: string, comment: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;

        const dateStr = new Date().toISOString().split('T')[0];
        const newHistoryItem: ApprovalHistoryItem = {
          level: r.currentLevel,
          levelName: r.currentLevelName,
          approverName: r.currentApprover,
          action: 'Escalated',
          date: dateStr,
          comment: comment || (isRtl ? 'تم تصعيد الطلب بشكل عاجل للإدارة العليا.' : 'Request escalated to higher management.')
        };

        if (onAddNotification) {
          onAddNotification(
            isRtl ? 'تصعيد طارئ للطلب' : 'Urgent Request Escalation',
            isRtl
              ? `تم تصعيد طلب ${r.employeeName} بشكل طارئ بسبب انتهاء مهلة الـ SLA.`
              : `Request for ${r.employeeName} has been escalated to executive office due to SLA expiration.`,
            'info',
            'Approvals'
          );
        }

        return {
          ...r,
          priority: 'Critical',
          history: [...r.history, newHistoryItem]
        };
      })
    );
    setCommentText('');
    setSelectedRequest(null);
  };

  const handleDelegate = (reqId: string, targetName: string, comment: string) => {
    if (!targetName) return;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;

        const dateStr = new Date().toISOString().split('T')[0];
        const newHistoryItem: ApprovalHistoryItem = {
          level: r.currentLevel,
          levelName: r.currentLevelName,
          approverName: r.currentApprover,
          action: 'Delegated',
          date: dateStr,
          comment: comment || `${isRtl ? 'تفويض الصلاحية لـ' : 'Delegated review authority to'} ${targetName}.`
        };

        if (onAddNotification) {
          onAddNotification(
            isRtl ? 'تفويض مراجعة الطلب' : 'Request Delegated',
            isRtl
              ? `تم تفويض صلاحية مراجعة طلب ${r.employeeName} إلى ${targetName}.`
              : `Review authority for ${r.employeeName} request was delegated to ${targetName}.`,
            'info',
            'Approvals'
          );
        }

        return {
          ...r,
          currentApprover: targetName,
          history: [...r.history, newHistoryItem]
        };
      })
    );
    setCommentText('');
    setDelegationTarget('');
    setSelectedRequest(null);
  };

  const handleReturn = (reqId: string, comment: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;

        const dateStr = new Date().toISOString().split('T')[0];
        const newHistoryItem: ApprovalHistoryItem = {
          level: r.currentLevel,
          levelName: r.currentLevelName,
          approverName: r.currentApprover,
          action: 'Returned',
          date: dateStr,
          comment: comment || (isRtl ? 'تمت إعادة الطلب للموظف للتعديل واستكمال البيانات.' : 'Returned to requester for modification.')
        };

        if (onAddNotification) {
          onAddNotification(
            isRtl ? 'إعادة الطلب للموظف' : 'Request Returned to Requester',
            isRtl
              ? `تمت إعادة طلب ${r.employeeName} للمراجعة واستكمال المرفقات.`
              : `Request for ${r.employeeName} has been returned to correction status.`,
            'info',
            'Approvals'
          );
        }

        return {
          ...r,
          status: 'Returned',
          currentLevel: 1, // Reset level to supervisor upon modification re-submission
          currentLevelName: 'Level 1 – Direct Supervisor',
          history: [...r.history, newHistoryItem]
        };
      })
    );
    setCommentText('');
    setSelectedRequest(null);
  };

  // Helper styles
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getPriorityBulletColor = (priority: string, isOverdue: boolean) => {
    if (isOverdue || priority === 'Critical') return 'bg-red-500'; // Critical / Overdue
    if (priority === 'High') return 'bg-orange-500'; // Orange = SLA warning
    if (priority === 'Medium') return 'bg-blue-500'; // Under review
    return 'bg-gray-400';
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200 font-bold';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200 font-bold';
      case 'Returned':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 font-bold';
    }
  };

  return (
    <div id="enterprise_pending_requests_center" className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black tracking-tight text-gray-900">
              {isRtl ? 'مركز إدارة واعتماد الطلبات المؤسسي الموحد' : 'Enterprise Unified Pending Requests Center'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 max-w-2xl">
            {isRtl
              ? 'لوحة تحكم إدارية موحدة لمراجعة واعتماد جميع طلبات الموظفين (الإجازات، السلف، تذاكر السفر، العمل الإضافي، الصيانة، المركبات، التعيين) حوكمة سريعة ومطابقة للوائح العمل.'
              : 'Direct corporate command center to review, delegate, escalate, and approve all incoming workforce requests across GCC divisions, adhering to corporate SLA parameters.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1.5 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            {isRtl ? `${overdueRequests} متجاوز للـ SLA` : `${overdueRequests} Overdue (SLA Exceeded)`}
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterDept('All');
              setFilterBranch('All');
              setFilterType('All');
              setFilterStage('All');
              setFilterStatus('Pending');
              setFilterPriority('All');
            }}
            className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all flex items-center gap-1 text-xs"
            title={isRtl ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRtl ? 'تحديث' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 text-center space-y-1">
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-tight">
            {isRtl ? 'إجمالي المعلق' : 'Total Pending'}
          </span>
          <p className="text-xl font-black text-blue-700">{totalPending}</p>
          <span className="text-[9px] text-gray-400 block">{isRtl ? 'بانتظار الإجراء' : 'Awaiting review'}</span>
        </div>

        <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 text-center space-y-1">
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-tight">
            {isRtl ? 'المشرف المباشر' : 'Supervisor L1'}
          </span>
          <p className="text-xl font-black text-gray-800">{awaitingSupervisor}</p>
          <span className="text-[9px] text-gray-400 block">{isRtl ? 'مستوى 1 معلق' : 'L1 pending'}</span>
        </div>

        <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 text-center space-y-1">
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-tight">
            {isRtl ? 'مدير القسم' : 'Dept Mgr L2'}
          </span>
          <p className="text-xl font-black text-gray-800">{awaitingManager}</p>
          <span className="text-[9px] text-gray-400 block">{isRtl ? 'مستوى 2 معلق' : 'L2 pending'}</span>
        </div>

        <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 text-center space-y-1">
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-tight">
            {isRtl ? 'الموارد البشرية' : 'HR Dept L3'}
          </span>
          <p className="text-xl font-black text-[#1565C0]">{awaitingHR}</p>
          <span className="text-[9px] text-gray-400 block">{isRtl ? 'مستوى 3 معلق' : 'L3 pending'}</span>
        </div>

        <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 text-center space-y-1">
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-tight">
            {isRtl ? 'الشؤون المالية' : 'Finance L4'}
          </span>
          <p className="text-xl font-black text-amber-700">{awaitingFinance}</p>
          <span className="text-[9px] text-gray-400 block">{isRtl ? 'مستوى 4 معلق' : 'L4 pending'}</span>
        </div>

        <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 text-center space-y-1">
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-tight">
            {isRtl ? 'المدير العام' : 'Exec L5/GM'}
          </span>
          <p className="text-xl font-black text-purple-700">{awaitingExecutive}</p>
          <span className="text-[9px] text-gray-400 block">{isRtl ? 'اعتماد نهائي L5' : 'L5 final'}</span>
        </div>

        <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200 text-center space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10px] text-blue-900 block uppercase font-black tracking-tight">
            {isRtl ? 'المنجز اليوم' : 'Processed Today'}
          </span>
          <div className="flex justify-center items-center gap-2 mt-1">
            <span className="text-xs font-bold text-green-700">✓ {approvedToday}</span>
            <span className="text-xs font-bold text-red-700">✗ {rejectedToday}</span>
          </div>
          <span className="text-[9px] text-blue-600 block">{isRtl ? 'الاعتمادات الكلية' : 'Total decisions'}</span>
        </div>
      </div>

      {/* Advanced Filtering Board */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            {isRtl ? 'لوحة الفرز والبحث المتقدم للطلبات' : 'Advanced Request Query & Filters'}
          </span>
          <div className="text-[10px] text-gray-500 font-mono">
            {isRtl ? `مطابقة: ${filteredRequests.length} طلب` : `Found: ${filteredRequests.length} requests`}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {/* Search bar */}
          <div className="relative col-span-1 sm:col-span-2 xl:col-span-2">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={isRtl ? 'البحث بالموظف، المعرف، تفاصيل...' : 'Search requester, ID, key term...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
            />
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-500 block">{isRtl ? 'القسم' : 'Department'}</label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">{isRtl ? 'الكل' : 'All Departments'}</option>
              {departments.filter(d => d !== 'All').map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-500 block">{isRtl ? 'الفرع' : 'Branch/Site'}</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">{isRtl ? 'الكل' : 'All Branches'}</option>
              {branches.filter(b => b !== 'All').map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Request Type */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-500 block">{isRtl ? 'نوع المعاملة' : 'Request Type'}</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">{isRtl ? 'الكل' : 'All Types'}</option>
              {requestTypes.filter(t => t !== 'All').map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-500 block">{isRtl ? 'مرحلة المراجعة' : 'Approval Level'}</label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              {stages.map((stg) => (
                <option key={stg.value} value={stg.value}>{stg.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-500 block">{isRtl ? 'الحالة الكلية' : 'Overall Status'}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">{isRtl ? 'الكل' : 'All Statuses'}</option>
              <option value="Pending">{isRtl ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="Approved">{isRtl ? 'معتمد' : 'Approved'}</option>
              <option value="Rejected">{isRtl ? 'مرفوض' : 'Rejected'}</option>
              <option value="Returned">{isRtl ? 'معاد للموظف' : 'Returned'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Request Grid / Table */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-bold">
            {isRtl ? 'لا توجد طلبات معلقة تطابق خيارات الفرز المحددة.' : 'No pending requests match the filtered parameters.'}
          </p>
          <button
            onClick={() => {
              setFilterDept('All');
              setFilterBranch('All');
              setFilterType('All');
              setFilterStage('All');
              setFilterStatus('All');
              setFilterPriority('All');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 font-semibold underline mt-1.5"
          >
            {isRtl ? 'إظهار جميع الطلبات المعلقة' : 'View all requests instead'}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-bold">
                <th className="py-3 px-4">{isRtl ? 'معرّف الموظف والطلب' : 'Request & Requester'}</th>
                <th className="py-3 px-4">{isRtl ? 'القسم والمنصب' : 'Dept & Position'}</th>
                <th className="py-3 px-4">{isRtl ? 'تفاصيل المعاملة' : 'Request Type & Details'}</th>
                <th className="py-3 px-4">{isRtl ? 'مرحلة الاعتماد الحالية' : 'Approval Level'}</th>
                <th className="py-3 px-4">{isRtl ? 'الأولية ومدة التعليق' : 'Priority / Pending'}</th>
                <th className="py-3 px-4 text-center">{isRtl ? 'الإجراءات والعمليات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredRequests.map((req) => {
                const isOverdue = req.pendingDays * 24 > req.slaLimitHours;
                return (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-all">
                    {/* ID & Requester */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 font-mono">{req.id}</span>
                        <span className={`w-2 h-2 rounded-full ${getPriorityBulletColor(req.priority, isOverdue)}`} />
                      </div>
                      <div className="font-semibold text-gray-800">{req.employeeName}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{req.employeeId} • {req.branch}</div>
                    </td>

                    {/* Department & Job */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="font-medium text-gray-700">{req.department}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{req.jobTitle}</div>
                    </td>

                    {/* Request Type & Description */}
                    <td className="py-3.5 px-4 space-y-1 max-w-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-100">
                          {req.requestType}
                        </span>
                        {req.isFinancial && (
                          <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] border border-amber-100 font-mono">
                            {req.valueSAR.toLocaleString()} SAR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2" title={req.details}>
                        {req.details}
                      </p>
                    </td>

                    {/* Stage & Approver */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="text-[10px] font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-gray-600" />
                        {req.currentLevelName.split(' – ')[1] || req.currentLevelName}
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1">
                        <span className="font-bold text-gray-700">{isRtl ? 'المراجع الحالي:' : 'Approver:'}</span>
                        <span>{req.currentApprover}</span>
                      </div>
                    </td>

                    {/* Priority & Pending days */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityStyle(req.priority)}`}>
                          {req.priority}
                        </span>
                        {isOverdue && (
                          <span className="bg-red-100 text-red-800 border border-red-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {isRtl ? 'متجاوز SLA' : 'SLA OVERDUE'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        <span className="font-semibold text-gray-700">{req.pendingDays} {isRtl ? 'أيام معلقة' : 'days pending'}</span>
                        <span className="block text-[9px] text-gray-400">({isRtl ? `المهلة: ${req.slaLimitHours} ساعة` : `Limit: ${req.slaLimitHours}h`})</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setModalAction('view');
                          }}
                          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-2 py-1 rounded text-[11px] transition-all cursor-pointer"
                        >
                          {isRtl ? 'التفاصيل' : 'Details'}
                        </button>
                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setModalAction('approve');
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-0.5 transition-all cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              {isRtl ? 'اعتماد' : 'Approve'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setModalAction('reject');
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2 py-1 rounded text-[11px] flex items-center gap-0.5 transition-all cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              {isRtl ? 'رفض' : 'Reject'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Operations Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                  {selectedRequest.id}
                </span>
                <h3 className="text-base font-black text-gray-900 mt-1">
                  {isRtl ? `طلب حوكمة: ${selectedRequest.requestType}` : `Governance Request: ${selectedRequest.requestType}`}
                </h3>
                <p className="text-xs text-gray-500">
                  {isRtl
                    ? `مقدم من ${selectedRequest.employeeName} (${selectedRequest.employeeId})`
                    : `Submitted by ${selectedRequest.employeeName} (${selectedRequest.employeeId})`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setCommentText('');
                  setDelegationTarget('');
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-xs border-b pb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  {isRtl ? 'بيانات الطلب التفصيلية' : 'Detailed Request Metadata'}
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'الفرع والموقع:' : 'Branch & Site Location:'}</span>
                    <span className="font-bold text-gray-800">{selectedRequest.branch}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'القسم والإدارة:' : 'Division & Department:'}</span>
                    <span className="font-bold text-gray-800">{selectedRequest.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'المسمى الوظيفي:' : 'Official Job Title:'}</span>
                    <span className="font-bold text-gray-800">{selectedRequest.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'تاريخ تقديم الطلب:' : 'Date Submitted:'}</span>
                    <span className="font-bold text-gray-800 font-mono">{selectedRequest.requestDate}</span>
                  </div>
                  {selectedRequest.isFinancial && (
                    <div>
                      <span className="text-gray-500 font-medium block">{isRtl ? 'الأثر المالي المترتب:' : 'Financial Impact Value:'}</span>
                      <span className="font-black text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded font-mono text-sm inline-block">
                        {selectedRequest.valueSAR.toLocaleString()} SAR
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'الحد الأقصى للـ SLA لخطوة المراجعة:' : 'SLA Limit for Stage:'}</span>
                    <span className="font-bold text-gray-800">{selectedRequest.slaLimitHours} {isRtl ? 'ساعة' : 'hours'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-xs border-b pb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  {isRtl ? 'مسار الحوكمة ومستوى الاعتماد' : 'Governance & Approval Levels'}
                </h4>
                <div className="space-y-2.5">
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'مستوى المراجعة الحالي:' : 'Current Step:'}</span>
                    <span className="font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] inline-block">
                      {selectedRequest.currentLevelName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'المراجع المكلف حالياً بالتوقيع:' : 'Assignee for Signature:'}</span>
                    <p className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      {selectedRequest.currentApprover}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'بيان الشرح ومسوغات الطلب:' : 'Justification Explanation:'}</span>
                    <p className="text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200 italic leading-relaxed text-[11px]">
                      "{selectedRequest.details}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval History Timeline */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-green-600" />
                {isRtl ? 'تاريخ التوقيعات وسجل المراجعة السابق' : 'Audit Trail & Historic Approval Signature Timeline'}
              </h4>

              {selectedRequest.history.length === 0 ? (
                <p className="text-gray-400 italic text-[11px] bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                  {isRtl ? 'لا توجد توقيعات سابقة على هذا الطلب حالياً. الموظف في الخطوة الأولى.' : 'No previous signatures registered on this request. Currently awaiting first approval level.'}
                </p>
              ) : (
                <div className="relative pl-6 space-y-3 border-l border-blue-200 ml-2 py-1">
                  {selectedRequest.history.map((hist, index) => (
                    <div key={index} className="relative space-y-1 text-xs">
                      <span className="absolute -left-[30px] top-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 font-mono">
                        <span className="font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                          {hist.levelName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">{hist.date}</span>
                      </div>
                      <div className="text-[11px] text-gray-700">
                        <span className="font-bold text-gray-800">{hist.approverName}</span>:{' '}
                        <span className="font-semibold text-green-700">[{hist.action}]</span> — {hist.comment}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Operations Panel */}
            {selectedRequest.status === 'Pending' && (
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setModalAction('approve')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'approve'
                        ? 'bg-green-600 text-white border-green-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ✓ {isRtl ? 'اعتماد التوقيع للخطوة التالية' : 'Sign & Forward'}
                  </button>
                  <button
                    onClick={() => setModalAction('reject')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'reject'
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ✗ {isRtl ? 'رفض الطلب نهائياً' : 'Reject Request'}
                  </button>
                  <button
                    onClick={() => setModalAction('comment')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'comment'
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ✎ {isRtl ? 'إضافة ملاحظة وتوجيه' : 'Add Comments'}
                  </button>
                  <button
                    onClick={() => setModalAction('escalate')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'escalate'
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ⚠ {isRtl ? 'تصعيد للإدارة التنفيذية' : 'Escalate (SLA)'}
                  </button>
                  <button
                    onClick={() => setModalAction('delegate')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'delegate'
                        ? 'bg-purple-600 text-white border-purple-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ↱ {isRtl ? 'تفويض مراجع بديل' : 'Delegate Review'}
                  </button>
                </div>

                {/* Sub Action Inputs */}
                {modalAction === 'delegate' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-500 block">
                      {isRtl ? 'اختر الموظف/المدير البديل لتفويضه بالصلاحية:' : 'Select Delegate Target User Name:'}
                    </label>
                    <select
                      value={delegationTarget}
                      onChange={(e) => setDelegationTarget(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800"
                    >
                      <option value="">{isRtl ? '— حدد مدير للتفويض —' : '— Select manager/user —'}</option>
                      <option value="Ahmed Al-Dossary">Ahmed Al-Dossary (Supervisor)</option>
                      <option value="Sarah Khalid Al-Ghamdi">Sarah Khalid Al-Ghamdi (HR Manager)</option>
                      <option value="John Michael Doe">John Michael Doe (Lead Engineer)</option>
                      <option value="Mohammad Salem Al-Qahtani">Mohammad Salem Al-Qahtani (Finance Director)</option>
                      <option value="Tariq Abdulaziz Al-Otaibi">Tariq Abdulaziz Al-Otaibi (General Manager)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500 block">
                    {isRtl ? 'نص التعليق الإداري والتوجيه:' : 'Operational Directive / Review Comments:'}
                  </label>
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      modalAction === 'approve'
                        ? isRtl ? 'توجيه بالموافقة (اختياري)...' : 'Approval notes (optional)...'
                        : modalAction === 'reject'
                        ? isRtl ? 'سبب الرفض الإلزامي...' : 'Required rejection reasons...'
                        : isRtl ? 'ملاحظات وتوجيهات لمركز الحوكمة...' : 'Directives or notes...'
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Action trigger button */}
                <div className="flex justify-end gap-2 border-t pt-2 border-blue-200">
                  <button
                    onClick={() => {
                      if (modalAction === 'approve') {
                        handleApprove(selectedRequest.id, commentText);
                      } else if (modalAction === 'reject') {
                        handleReject(selectedRequest.id, commentText);
                      } else if (modalAction === 'escalate') {
                        handleEscalate(selectedRequest.id, commentText);
                      } else if (modalAction === 'delegate') {
                        handleDelegate(selectedRequest.id, delegationTarget, commentText);
                      } else if (modalAction === 'comment') {
                        handleReturn(selectedRequest.id, commentText); // Return / Correct
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-2xs cursor-pointer ${
                      modalAction === 'reject'
                        ? 'bg-red-600 hover:bg-red-700'
                        : modalAction === 'escalate'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : modalAction === 'delegate'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isRtl ? 'حفظ وتثبيت التوقيع' : 'Commit Action & Record Sign'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-gray-100 pt-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setCommentText('');
                  setDelegationTarget('');
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
              >
                {isRtl ? 'إغلاق نافذة التفاصيل' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
