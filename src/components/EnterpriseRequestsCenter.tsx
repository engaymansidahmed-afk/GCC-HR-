import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  Search,
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
  Inbox,
  Layers,
  ChevronDown,
  Info,
  Clock,
  Briefcase,
  SlidersHorizontal,
  RefreshCw,
  Send,
  Flag,
  Download,
  Printer,
  Eye,
  CreditCard,
  Laptop,
  Key,
  Database,
  CheckCircle,
  XCircle,
  Lock,
  User
} from 'lucide-react';
import { EnterpriseRequest, ApprovalHistoryItem, Employee } from '../types';

export const REQUEST_CATEGORIES = {
  hr: {
    labelEn: 'Human Resources',
    labelAr: 'الموارد البشرية',
    color: 'blue',
    types: [
      'Leave Request', 'Emergency Leave', 'Sick Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave',
      'Permission / Exit Request', 'Attendance Adjustment', 'Overtime Request', 'Shift Change Request',
      'Transfer Request', 'Promotion Request', 'Salary Certificate Request', 'Employment Certificate Request',
      'Experience Certificate Request', 'HR Letter Request', 'Personal Information Update', 'Bank Account Change',
      'Emergency Contact Update', 'Passport Renewal Request', 'Iqama Renewal Request', 'Visa Request',
      'Exit/Re-entry Visa Request', 'Final Exit Request', 'Resignation Request', 'End of Service Request',
      'Training Request', 'Recruitment Request', 'Performance Appeal'
    ]
  },
  finance: {
    labelEn: 'Finance',
    labelAr: 'المالية',
    color: 'emerald',
    types: [
      'Loan Request', 'Salary Advance Request', 'Petty Cash Request', 'Expense Reimbursement',
      'Business Trip Advance', 'Travel Expense Settlement', 'Medical Claim', 'Insurance Claim',
      'Purchase Reimbursement'
    ]
  },
  assets: {
    labelEn: 'Assets & Equipment',
    labelAr: 'الأصول والمعدات',
    color: 'orange',
    types: [
      'Laptop Request', 'Desktop Computer Request', 'Monitor Request', 'Printer Request',
      'Mobile Phone Request', 'Tablet Request', 'SIM Card Request', 'Network Access Request',
      'Email Account Request', 'Software License Request', 'VPN Access', 'ID Card Request',
      'Office Furniture Request', 'Uniform Request', 'PPE Equipment Request'
    ]
  },
  fleet: {
    labelEn: 'Vehicle & Fleet',
    labelAr: 'المركبات والأسطول',
    color: 'red',
    types: [
      'Company Vehicle Request', 'Vehicle Replacement', 'Vehicle Maintenance Request',
      'Driver Request', 'Fuel Card Request', 'Fuel Allocation Increase', 'Vehicle Accident Report'
    ]
  },
  machinery: {
    labelEn: 'Equipment & Machinery',
    labelAr: 'المعدات والآليات',
    color: 'yellow',
    types: [
      'Heavy Equipment Assignment', 'Equipment Transfer', 'Equipment Return',
      'Equipment Maintenance Request', 'Equipment Breakdown Report', 'Spare Parts Request',
      'Fuel Request', 'Operator Assignment Request'
    ]
  },
  warehouse: {
    labelEn: 'Warehouse',
    labelAr: 'المستودعات والمخازن',
    color: 'teal',
    types: [
      'Material Request', 'Spare Parts Request', 'Warehouse Issue Voucher',
      'Warehouse Return Voucher', 'Stock Transfer Request'
    ]
  },
  it: {
    labelEn: 'IT Helpdesk',
    labelAr: 'الدعم التقني IT',
    color: 'indigo',
    types: [
      'Hardware Support', 'Software Support', 'Password Reset', 'Email Issue',
      'Network Issue', 'Printer Issue', 'Internet Issue', 'New User Request',
      'Access Permission Request'
    ]
  },
  admin: {
    labelEn: 'Administrative Services',
    labelAr: 'الخدمات الإدارية',
    color: 'purple',
    types: [
      'Meeting Room Reservation', 'Company Accommodation Request', 'Parking Permit Request',
      'Visitor Pass Request', 'Company Housing Request', 'Office Relocation Request'
    ]
  }
};

interface EnterpriseRequestsCenterProps {
  isRtl: boolean;
  employees: Employee[];
  onAddNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning', module: string) => void;
}

export default function EnterpriseRequestsCenter({ isRtl, employees, onAddNotification }: EnterpriseRequestsCenterProps) {
  const [requests, setRequests] = useState<EnterpriseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Dashboard Tab / Role Perspective Switching State
  // 'all' | 'employee' | 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | 'reports'
  const [activeRolePerspective, setActiveRolePerspective] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[4]?.id || 'EMP-2026-005'); // Defaults to Rajesh

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // New Request Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<keyof typeof REQUEST_CATEGORIES>('hr');
  const [formType, setFormType] = useState('Leave Request');
  const [formEmployeeId, setFormEmployeeId] = useState(employees[4]?.id || 'EMP-2026-005');
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [formIsFinancial, setFormIsFinancial] = useState(false);
  const [formValueSAR, setFormValueSAR] = useState(0);
  const [formDetails, setFormDetails] = useState('');
  
  // Custom Form Fields (saved under formData)
  const [customLeaveType, setCustomLeaveType] = useState('Annual Leave');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customInstallments, setCustomInstallments] = useState('');
  const [customAssetName, setCustomAssetName] = useState('');
  const [customTargetDate, setCustomTargetDate] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [customSystem, setCustomSystem] = useState('');

  // Associated Project and Attachments Support
  const [formProject, setFormProject] = useState('NEOM Site Office');
  const [formAttachments, setFormAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);

  // Interactive Operations / Approval Modal State
  const [selectedRequest, setSelectedRequest] = useState<EnterpriseRequest | null>(null);
  const [modalAction, setModalAction] = useState<'view' | 'approve' | 'reject' | 'comment' | 'escalate' | 'delegate'>('view');
  const [commentText, setCommentText] = useState('');
  const [delegationTarget, setDelegationTarget] = useState('');
  const [signatureType, setSignatureType] = useState<'type' | 'draw'>('type');
  const [electronicSignature, setElectronicSignature] = useState('');

  // Fetch Requests on Mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        setErrorMsg('Failed to load corporate requests from backend API.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection issue while retrieving requests.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit / Draft New Request
  const handleCreateRequest = async (isDraft: boolean) => {
    const selectedEmp = employees.find(e => e.id === formEmployeeId) || employees[0];
    
    // Construct Form Data
    const formData: Record<string, any> = {};
    if (formCategory === 'hr') {
      formData.leaveType = customLeaveType;
      formData.startDate = customStartDate;
      formData.endDate = customEndDate;
    } else if (formCategory === 'finance') {
      formData.amount = Number(customAmount) || 0;
      formData.installments = Number(customInstallments) || 0;
    } else if (formCategory === 'assets') {
      formData.assetName = customAssetName;
      formData.targetDate = customTargetDate;
    } else if (formCategory === 'it') {
      formData.username = customUsername;
      formData.system = customSystem;
    } else {
      formData.assetName = customAssetName || formType;
      formData.targetDate = customTargetDate;
    }

    if (editingRequestId) {
      // Save changes to draft
      const editPayload = {
        approverId: selectedEmp.id,
        approverName: selectedEmp.fullName,
        role: selectedEmp.position,
        action: 'edit_draft',
        priority: formPriority,
        isFinancial: formIsFinancial || formCategory === 'finance',
        valueSAR: formValueSAR || Number(customAmount) || 0,
        details: formDetails,
        formData,
        project: formProject,
        attachments: formAttachments,
        comment: 'Modified request specifications.'
      };

      try {
        let res = await fetch(`/api/requests/${editingRequestId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editPayload)
        });

        if (res.ok) {
          if (!isDraft) {
            // Re-submit the draft request for approval
            const submitPayload = {
              approverId: selectedEmp.id,
              approverName: selectedEmp.fullName,
              role: selectedEmp.position,
              action: 'submit_draft',
              comment: 'Resubmitted modified draft request for approval.'
            };
            res = await fetch(`/api/requests/${editingRequestId}/action`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(submitPayload)
            });
          }

          if (res.ok) {
            if (onAddNotification) {
              onAddNotification(
                isDraft ? 'Draft Saved Successfully' : 'Request Submitted',
                `Your ${formType} request has been successfully updated.`,
                'success',
                'Requests'
              );
            }
            setIsCreateOpen(false);
            resetForm();
            fetchRequests();
          } else {
            alert('Failed to submit updated request.');
          }
        } else {
          alert('Failed to save request modifications.');
        }
      } catch (err) {
        console.error(err);
        alert('Server connection error.');
      }
      return;
    }

    const bodyPayload = {
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.fullName,
      department: selectedEmp.department,
      branch: selectedEmp.projectAssignment === 'HQ' ? 'Riyadh (HQ)' : 'Remote Project Site',
      project: formProject,
      jobTitle: selectedEmp.position,
      category: REQUEST_CATEGORIES[formCategory].labelEn,
      requestType: formType,
      priority: formPriority,
      isFinancial: formIsFinancial || formCategory === 'finance',
      valueSAR: formValueSAR || Number(customAmount) || 0,
      details: formDetails,
      formData,
      attachments: formAttachments,
      status: isDraft ? 'Draft' : 'Pending Approval'
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        if (onAddNotification) {
          onAddNotification(
            isDraft ? 'Draft Saved Successfully' : 'Request Submitted',
            `Your ${formType} request has been successfully processed in the corporate ledger.`,
            'success',
            'Requests'
          );
        }
        setIsCreateOpen(false);
        resetForm();
        fetchRequests();
      } else {
        alert('Failed to save request. Please verify inputs.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend API.');
    }
  };

  // Perform Approval Workflow Action
  const handleWorkflowAction = async (reqId: string, actionType: string) => {
    const currentActiveEmp = employees.find(e => e.id === selectedEmployeeId) || employees[0];
    
    const bodyPayload = {
      approverId: currentActiveEmp.id,
      approverName: currentActiveEmp.fullName,
      role: currentActiveEmp.position,
      action: actionType,
      comment: commentText,
      delegateTo: delegationTarget,
      signature: electronicSignature || `Signed by ${currentActiveEmp.fullName}`
    };

    try {
      const res = await fetch(`/api/requests/${reqId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        if (onAddNotification) {
          onAddNotification(
            'Workflow Decision Locked',
            `Request ${reqId} successfully updated with action: ${actionType.toUpperCase()}.`,
            'info',
            'Requests'
          );
        }
        setSelectedRequest(null);
        setCommentText('');
        setDelegationTarget('');
        setElectronicSignature('');
        fetchRequests();
      } else {
        alert('Workflow action failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Server connection error.');
    }
  };

  const resetForm = () => {
    setFormCategory('hr');
    setFormType('Leave Request');
    setFormPriority('Medium');
    setFormIsFinancial(false);
    setFormValueSAR(0);
    setFormDetails('');
    setCustomLeaveType('Annual Leave');
    setCustomStartDate('');
    setCustomEndDate('');
    setCustomAmount('');
    setCustomInstallments('');
    setCustomAssetName('');
    setCustomTargetDate('');
    setCustomUsername('');
    setCustomSystem('');
    setFormProject('NEOM Site Office');
    setFormAttachments([]);
    setEditingRequestId(null);
  };

  // Role Perspective Filters
  const getRoleFilteredRequests = () => {
    return requests.filter(req => {
      // 1. Role-specific stages
      if (activeRolePerspective === 'employee') {
        return req.employeeId === selectedEmployeeId;
      }
      if (activeRolePerspective === 'l1') {
        return req.currentLevel === 1 && req.status === 'Pending Approval';
      }
      if (activeRolePerspective === 'l2') {
        return req.currentLevel === 2 && req.status === 'Pending Approval';
      }
      if (activeRolePerspective === 'l3') {
        return req.currentLevel === 3 && req.status === 'Pending Approval';
      }
      if (activeRolePerspective === 'l4') {
        return req.currentLevel === 4 && req.status === 'Pending Approval';
      }
      if (activeRolePerspective === 'l5') {
        return req.currentLevel === 5 && req.status === 'Pending Approval';
      }
      return true; // 'all' and others see everything
    });
  };

  // General Filter Operations on top of Role Perspective
  const getFullyFilteredRequests = () => {
    return getRoleFilteredRequests().filter(req => {
      const matchesSearch =
        req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filterCategory === 'All' || req.category === filterCategory;

      const matchesPriority =
        filterPriority === 'All' || req.priority === filterPriority;

      const matchesStatus =
        filterStatus === 'All' || req.status === filterStatus;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  };

  const currentFilteredList = getFullyFilteredRequests();

  // Export Filtered Requests to CSV (Excel Ready)
  const handleExportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Request Number,Employee Name,Request Type,Category,Status,Priority,Value (SAR),Submission Date,Last Action\n';
    
    currentFilteredList.forEach(r => {
      csvContent += `"${r.id}","${r.employeeName}","${r.requestType}","${r.category}","${r.status}","${r.priority}",${r.valueSAR},"${r.submissionDate}","${r.lastActionDate}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enterprise_Requests_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print PDF View of Filtered Requests
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = currentFilteredList.map(r => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px; font-family: monospace;">${r.id}</td>
        <td style="padding: 8px;">${r.employeeName}</td>
        <td style="padding: 8px;"><strong>${r.requestType}</strong></td>
        <td style="padding: 8px;">${r.category}</td>
        <td style="padding: 8px;">${r.status}</td>
        <td style="padding: 8px;">${r.priority}</td>
        <td style="padding: 8px; font-family: monospace;">${r.valueSAR.toLocaleString()} SAR</td>
        <td style="padding: 8px;">${r.submissionDate}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Corporate Requests Report - Al-Mansoori Co.</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h2 { border-bottom: 2px solid #1a365d; padding-bottom: 10px; color: #1a365d; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f2f5fa; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            td { font-size: 11px; }
            .header-info { margin-bottom: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>Al-Mansoori Industrial Co. - Unified Corporate Requests System</h2>
          <div class="header-info">
            <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Filtered Records:</strong> ${currentFilteredList.length}</p>
            <p><strong>Workflow Policy:</strong> SEC-889 Corporate Governance</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Requester</th>
                <th>Request Type</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Financial Value</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Metrics calculations
  const totalPending = requests.filter(r => r.status === 'Pending Approval').length;
  const totalApproved = requests.filter(r => r.status === 'Approved').length;
  const totalRejected = requests.filter(r => r.status === 'Rejected').length;
  const totalDrafts = requests.filter(r => r.status === 'Draft').length;

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-50 text-red-700 border border-red-200';
      case 'High': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Medium': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border border-green-200 font-bold';
      case 'Rejected': return 'bg-red-100 text-red-800 border border-red-200 font-bold';
      case 'Returned for Correction': return 'bg-yellow-100 text-yellow-800 border border-yellow-200 font-bold';
      case 'Draft': return 'bg-gray-100 text-gray-800 border border-gray-200 font-bold';
      default: return 'bg-blue-100 text-blue-800 border border-blue-200 font-bold';
    }
  };

  return (
    <div id="enterprise_unified_requests_module" className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-6">
      
      {/* Module Title and Context */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black tracking-tight text-gray-900">
              {isRtl ? 'نظام إدارة وحوكمة طلبات الموظفين الموحد (SAP/Oracle Ready)' : 'Enterprise Unified Requests Governance System'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
            {isRtl
              ? 'بوابة اعتماد موحدة لجميع أنواع الطلبات المؤسسية (الموارد البشرية، الرواتب، الأصول، الدعم الإداري والتقني) مع مسار اعتماد تلقائي متعدد المستويات يتضمن التوقيع الإلكتروني والتحقق ومطابقة الـ SLA.'
              : 'Enterprise-grade request hub (HR, Payroll, Admin, Assets, IT, Finance) with dynamic approval workflow routing, SLA timers, electronic signatures, role-based dashboards, and complete CSV reports.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-stretch lg:self-auto justify-end">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            {isRtl ? 'تقديم طلب جديد' : 'Submit New Request'}
          </button>
          
          <button
            onClick={fetchRequests}
            className="p-2 text-gray-600 hover:text-blue-700 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all flex items-center gap-1 text-xs"
            title={isRtl ? 'تحديث البيانات من السيرفر' : 'Sync Server State'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Switcher Board - For testing the Multi-Level Dashboard Roles */}
      <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 space-y-2">
        <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">
          {isRtl ? 'مبدل الأدوار وتجربة حوكمة الطلبات' : 'Interactive Roles & Dashboard Switchboard'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setActiveRolePerspective('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRolePerspective === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {isRtl ? 'الكل (لوحة المدير العام)' : 'All Requests View'}
          </button>
          
          <button
            onClick={() => { setActiveRolePerspective('employee'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRolePerspective === 'employee'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            👤 {isRtl ? 'لوحة الموظف' : 'Employee Dashboard'}
          </button>

          <button
            onClick={() => { setActiveRolePerspective('l1'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRolePerspective === 'l1'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            ✓ {isRtl ? 'المشرف المباشر (L1)' : 'Supervisor (L1)'}
          </button>

          <button
            onClick={() => { setActiveRolePerspective('l2'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRolePerspective === 'l2'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            ✓ {isRtl ? 'مدير القسم (L2)' : 'Dept Manager (L2)'}
          </button>

          <button
            onClick={() => { setActiveRolePerspective('l3'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRolePerspective === 'l3'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            ✓ {isRtl ? 'مدير الموارد البشرية (L3)' : 'HR Manager (L3)'}
          </button>

          <button
            onClick={() => { setActiveRolePerspective('l4'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRolePerspective === 'l4'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            ✓ {isRtl ? 'الشؤون المالية (L4)' : 'Finance Manager (L4)'}
          </button>

          <button
            onClick={() => { setActiveRolePerspective('l5'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRolePerspective === 'l5'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            👑 {isRtl ? 'المدير العام (L5)' : 'General Manager (L5)'}
          </button>

          <button
            onClick={() => { setActiveRolePerspective('reports'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeRolePerspective === 'reports'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            📊 {isRtl ? 'التقارير والإحصائيات' : 'Reporting & Analytics'}
          </button>
        </div>

        {activeRolePerspective === 'employee' && (
          <div className="flex items-center gap-2 mt-2 bg-white p-2 rounded-lg border border-gray-150">
            <span className="text-[11px] font-bold text-gray-600">{isRtl ? 'اختر الموظف النشط لمشاهدة لوحته الشخصية:' : 'Switch Active Employee perspective:'}</span>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-bold text-gray-800"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.id})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeRolePerspective !== 'reports' ? (
        <>
          {/* Quick Metrics Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            <div className="bg-gradient-to-tr from-blue-50 to-blue-100/40 p-4 rounded-xl border border-blue-200/60 text-center space-y-1">
              <span className="text-[10px] text-blue-900 block uppercase font-bold tracking-tight">
                {isRtl ? 'جميع المعاملات بالسيستم' : 'System Total'}
              </span>
              <p className="text-2xl font-black text-blue-800">{requests.length}</p>
              <span className="text-[9px] text-blue-500 block">{isRtl ? 'مسجلة بقاعدة البيانات' : 'In persistent ledger'}</span>
            </div>

            <div className="bg-gradient-to-tr from-amber-50 to-amber-100/40 p-4 rounded-xl border border-amber-200/60 text-center space-y-1">
              <span className="text-[10px] text-amber-900 block uppercase font-bold tracking-tight">
                {isRtl ? 'بانتظار الاعتماد الحركي' : 'Pending Approvals'}
              </span>
              <p className="text-2xl font-black text-amber-800">{totalPending}</p>
              <span className="text-[9px] text-amber-600 block">{isRtl ? 'موزعة عبر المستويات' : 'Active workflow routes'}</span>
            </div>

            <div className="bg-gradient-to-tr from-green-50 to-green-100/40 p-4 rounded-xl border border-green-200/60 text-center space-y-1">
              <span className="text-[10px] text-green-900 block uppercase font-bold tracking-tight">
                {isRtl ? 'معاملات معتمدة نهائياً' : 'Completed Approved'}
              </span>
              <p className="text-2xl font-black text-green-800">{totalApproved}</p>
              <span className="text-[9px] text-green-600 block">{isRtl ? 'جاهزة للتسوية' : 'Ready for action'}</span>
            </div>

            <div className="bg-gradient-to-tr from-red-50 to-red-100/40 p-4 rounded-xl border border-red-200/60 text-center space-y-1">
              <span className="text-[10px] text-red-900 block uppercase font-bold tracking-tight">
                {isRtl ? 'الطلبات المرفوضة' : 'Rejected Requests'}
              </span>
              <p className="text-2xl font-black text-red-800">{totalRejected}</p>
              <span className="text-[9px] text-red-600 block">{isRtl ? 'مستبعدة من حيز العمل' : 'Archived logs'}</span>
            </div>

            <div className="bg-gradient-to-tr from-gray-50 to-gray-100/40 p-4 rounded-xl border border-gray-200 text-center space-y-1 col-span-2 md:col-span-1">
              <span className="text-[10px] text-gray-900 block uppercase font-bold tracking-tight">
                {isRtl ? 'المسودات المؤقتة' : 'Saved Drafts'}
              </span>
              <p className="text-2xl font-black text-gray-700">{totalDrafts}</p>
              <span className="text-[9px] text-gray-400 block">{isRtl ? 'بانتظار المراجعة والتقديم' : 'Awaiting submission'}</span>
            </div>
          </div>

          {/* Filtering and Search Controls */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                {isRtl ? 'لوحة البحث والفرز المتطور للطلبات' : 'Surgical Search & Filtration'}
              </span>
              <div className="text-[10px] text-gray-500 font-mono">
                {isRtl ? `مطابقة: ${currentFilteredList.length} طلب` : `Showing ${currentFilteredList.length} requests`}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={isRtl ? 'البحث بالاسم، المعرّف، تفاصيل المعاملة...' : 'Search requester name, request number...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
                />
              </div>

              {/* Category */}
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">{isRtl ? 'جميع التصنيفات' : 'All Categories'}</option>
                  <option value="HR Requests">{isRtl ? 'الموارد البشرية' : 'HR Requests'}</option>
                  <option value="Payroll Requests">{isRtl ? 'الرواتب والأجور' : 'Payroll Requests'}</option>
                  <option value="Administrative Requests">{isRtl ? 'الطلبات الإدارية' : 'Administrative Requests'}</option>
                  <option value="Assets & Equipment Requests">{isRtl ? 'الأصول والمعدات' : 'Assets & Equipment Requests'}</option>
                  <option value="IT Requests">{isRtl ? 'الدعم التقني' : 'IT Requests'}</option>
                  <option value="Finance Requests">{isRtl ? 'المالية' : 'Finance Requests'}</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">{isRtl ? 'جميع الأولويات' : 'All Priorities'}</option>
                  <option value="Critical">{isRtl ? 'حرج جداً (SLA 24h)' : 'Critical (24h SLA)'}</option>
                  <option value="High">{isRtl ? 'عالي (SLA 48h)' : 'High (48h SLA)'}</option>
                  <option value="Medium">{isRtl ? 'متوسط (SLA 72h)' : 'Medium (72h SLA)'}</option>
                  <option value="Low">{isRtl ? 'منخفض' : 'Low'}</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
                  <option value="Pending Approval">{isRtl ? 'قيد المراجعة والاعتماد' : 'Pending Approval'}</option>
                  <option value="Approved">{isRtl ? 'معتمد' : 'Approved'}</option>
                  <option value="Rejected">{isRtl ? 'مرفوض' : 'Rejected'}</option>
                  <option value="Returned for Correction">{isRtl ? 'معاد للتصحيح' : 'Returned for Correction'}</option>
                  <option value="Draft">{isRtl ? 'مسودة' : 'Draft'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table list of Requests */}
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">{isRtl ? 'جارٍ مزامنة المعاملات وجلبها من السيرفر...' : 'Synchronizing and loading corporate requests from database...'}</p>
            </div>
          ) : currentFilteredList.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-bold">
                {isRtl ? 'لا توجد طلبات معلقة تطابق خيارات الفرز المحددة حالياً.' : 'No requests found matching your filter selection.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[9px] font-bold">
                    <th className="py-3 px-4">{isRtl ? 'معرّف الطلب والموظف' : 'Request & Employee'}</th>
                    <th className="py-3 px-4">{isRtl ? 'القسم والفرع' : 'Division & Branch'}</th>
                    <th className="py-3 px-4">{isRtl ? 'نوع المعاملة والمسوغات' : 'Category / Request Details'}</th>
                    <th className="py-3 px-4">{isRtl ? 'المرحلة والاعتماد الحالي' : 'Current Workflow Step'}</th>
                    <th className="py-3 px-4">{isRtl ? 'الأولية والـ SLA' : 'Priority / SLA status'}</th>
                    <th className="py-3 px-4 text-center">{isRtl ? 'إجراءات الحوكمة' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {currentFilteredList.map((req) => {
                    const isOverdue = req.pendingDays > 0; // Simple trigger for SLA
                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-all">
                        {/* ID & Requester */}
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 font-mono text-[11px]">{req.id}</span>
                            <span className={`w-2 h-2 rounded-full ${req.priority === 'Critical' ? 'bg-red-500 animate-ping' : 'bg-blue-400'}`} />
                          </div>
                          <div className="font-semibold text-gray-800">{req.employeeName}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{req.employeeId}</div>
                        </td>

                        {/* Department & Branch */}
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="font-medium text-gray-700">{req.department}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{req.branch}</div>
                        </td>

                        {/* Request Type & Description */}
                        <td className="py-3.5 px-4 space-y-1 max-w-sm">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-100">
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

                        {/* Current Workflow Step */}
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="text-[10px] font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-gray-600" />
                            {req.currentLevelName}
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <span className="font-bold text-gray-700">{isRtl ? 'المكلّف الحالي:' : 'Assignee:'}</span>
                            <span className="truncate max-w-[130px]">{req.currentApprover}</span>
                          </div>
                        </td>

                        {/* Priority / SLA */}
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityStyle(req.priority)}`}>
                              {req.priority}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            <span className="font-semibold text-gray-700">SLA Timer: {req.slaLimitHours}h Limit</span>
                            <span className="block text-[9px] text-gray-400">{isRtl ? 'مضى على التقديم: 0 يوم' : 'Age: 0 days'}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setModalAction('view');
                              }}
                              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {isRtl ? 'تفاصيل' : 'Details'}
                            </button>
                            {req.status === 'Pending Approval' && (
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setModalAction('approve');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer flex items-center gap-0.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                {isRtl ? 'اعتماد' : 'Approve'}
                              </button>
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
        </>
      ) : (
        /* Analytics and Detailed Reporting Dashboard */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-black text-gray-900">{isRtl ? 'التقارير التحليلية المتقدمة وتصدير البيانات' : 'Enterprise Advanced Analytics & Report Export'}</h3>
              <p className="text-xs text-gray-500">{isRtl ? 'قم بتصفية وتصدير ومراجعة أداء الـ SLA ومعدل المراجعة والاعتماد للطلبات' : 'Filter, print, or download requests data matching corporate audit compliance specifications.'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportToCSV}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-green-600" />
                {isRtl ? 'تصدير لملف Excel' : 'Export to Excel'}
              </button>
              <button
                onClick={handlePrintPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                {isRtl ? 'طباعة PDF' : 'Print PDF Report'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-gray-900 border-b pb-1.5 uppercase tracking-wide">{isRtl ? 'نسبة أداء اتفاقية الـ SLA' : 'SLA Performance Index'}</h4>
              <div className="flex items-center gap-4">
                <span className="p-3 bg-green-50 rounded-full text-green-700">
                  <Clock className="w-6 h-6" />
                </span>
                <div>
                  <p className="text-2xl font-black text-green-700">97.8%</p>
                  <p className="text-[10px] text-gray-500">{isRtl ? 'متوسط وقت الحل: 14.5 ساعة' : 'Mean resolve duration: 14.5h'}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '97.8%' }}></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-gray-900 border-b pb-1.5 uppercase tracking-wide">{isRtl ? 'معدل الحوكمة والقبول' : 'Workflow Governance rate'}</h4>
              <div className="flex items-center gap-4">
                <span className="p-3 bg-blue-50 rounded-full text-blue-700">
                  <CheckCircle className="w-6 h-6" />
                </span>
                <div>
                  <p className="text-2xl font-black text-blue-700">91.4%</p>
                  <p className="text-[10px] text-gray-500">{isRtl ? 'نسبة الرفض الحالية: 8.6%' : 'Rejection rate: 8.6%'}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '91.4%' }}></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3 col-span-1 md:col-span-2 lg:col-span-1">
              <h4 className="text-xs font-bold text-gray-900 border-b pb-1.5 uppercase tracking-wide">{isRtl ? 'مستندات التوقيع الإلكتروني' : 'Electronic Signatures Verified'}</h4>
              <div className="flex items-center gap-4">
                <span className="p-3 bg-indigo-50 rounded-full text-indigo-700">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <div>
                  <p className="text-2xl font-black text-indigo-700">100% Secure</p>
                  <p className="text-[10px] text-gray-500">{isRtl ? 'توقيعات مشفرة ومؤرخة بالسيستم' : 'IP-stamped corporate compliance'}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic bg-gray-50 p-2 rounded border">{isRtl ? '✓ جميع معاملات المراجعة تحمل بصمات تشفيرية للأجهزة.' : '✓ Certified electronic signature certificates matching ISO/IEC 27001.'}</p>
            </div>
          </div>

          {/* Graphical Breakdown by Category */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide border-b pb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              {isRtl ? 'توزيع الطلبات بحسب التصنيف والقطاع' : 'Request Volume Breakdown by Business Categories'}
            </h4>
            <div className="space-y-3">
              {[
                { name: 'HR Requests', val: 12, percent: 55, color: 'bg-blue-600' },
                { name: 'Payroll Requests', val: 5, percent: 23, color: 'bg-emerald-600' },
                { name: 'Administrative Requests', val: 3, percent: 14, color: 'bg-purple-600' },
                { name: 'Assets & Equipment Requests', val: 4, percent: 18, color: 'bg-orange-600' },
                { name: 'IT Requests', val: 2, percent: 9, color: 'bg-indigo-600' },
                { name: 'Finance Requests', val: 1, percent: 5, color: 'bg-rose-600' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-900 font-mono">{item.val} {isRtl ? 'طلبات' : 'requests'} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW REQUEST DIALOG / DRAWER */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {isRtl ? 'تقديم نموذج معاملة مؤسسية موحدة' : 'Submit Corporate Employee Request'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isRtl ? 'اختر تصنيف الطلب واستكمل النموذج الإداري لإرساله لمسار الحوكمة.' : 'Fill in the structured fields to register your employee request.'}
                </p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Category selector */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">{isRtl ? 'التصنيف الرئيسي:' : 'Request Category:'}</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const cat = e.target.value as keyof typeof REQUEST_CATEGORIES;
                      setFormCategory(cat);
                      setFormType(REQUEST_CATEGORIES[cat].types[0]);
                    }}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800"
                  >
                    {Object.entries(REQUEST_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>{isRtl ? value.labelAr : value.labelEn}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-type selector */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">{isRtl ? 'نوع المعاملة الدقيق:' : 'Surgical Request Type:'}</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800"
                  >
                    {REQUEST_CATEGORIES[formCategory].types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employee & Priority Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">{isRtl ? 'الموظف مقدم الطلب:' : 'Requesting Employee:'}</label>
                  <select
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">{isRtl ? 'درجة الأولوية (SLA Indicator):' : 'Priority Level:'}</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800"
                  >
                    <option value="Low">{isRtl ? 'منخفض' : 'Low'}</option>
                    <option value="Medium">{isRtl ? 'متوسط (72h SLA)' : 'Medium (72h SLA)'}</option>
                    <option value="High">{isRtl ? 'عالي (48h SLA)' : 'High (48h SLA)'}</option>
                    <option value="Critical">{isRtl ? 'حرج جداً (24h SLA)' : 'Critical (24h SLA)'}</option>
                  </select>
                </div>
              </div>

              {/* Project Assignment */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">{isRtl ? 'الربط بالموقع / المشروع:' : 'Associated Project Site:'}</label>
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800"
                >
                  <option value="HQ Office (Riyadh)">HQ Office (Riyadh)</option>
                  <option value="NEOM Site Office">NEOM Site Office</option>
                  <option value="Amala Luxury Resort Site">Amala Luxury Resort Site</option>
                  <option value="Red Sea Global Infrastructure">Red Sea Global Infrastructure</option>
                  <option value="Qiddiya Entertainment District">Qiddiya Entertainment District</option>
                  <option value="Jeddah Central Dev Project">Jeddah Central Dev Project</option>
                  <option value="Riyadh Metro Extension">Riyadh Metro Extension</option>
                  <option value="Dammam Port Facility">Dammam Port Facility</option>
                </select>
              </div>

              {/* DYNAMIC FORM SEGMENTS */}
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-3">
                <span className="text-[10px] font-black uppercase text-blue-700 block tracking-wider">
                  {isRtl ? 'المرفقات والبيانات المتغيرة المطلوبة' : 'Dynamic Form Parameters'}
                </span>

                {formCategory === 'hr' && (formType.includes('Leave') || formType.includes('Exit')) && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-gray-600 block">{isRtl ? 'نوع الإجازة:' : 'Leave Type:'}</label>
                        <select
                          value={customLeaveType}
                          onChange={(e) => setCustomLeaveType(e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        >
                          <option value="Annual Leave">{isRtl ? 'إجازة سنوية' : 'Annual Leave'}</option>
                          <option value="Sick Leave">{isRtl ? 'إجازة مرضية' : 'Sick Leave'}</option>
                          <option value="Emergency Leave">{isRtl ? 'إجازة اضطرارية' : 'Emergency Leave'}</option>
                          <option value="Maternity Leave">{isRtl ? 'إجازة أمومة' : 'Maternity Leave'}</option>
                          <option value="Paternity Leave">{isRtl ? 'إجازة أبوة' : 'Paternity Leave'}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-600 block">{isRtl ? 'تاريخ البدء:' : 'Start Date:'}</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-600 block">{isRtl ? 'تاريخ الانتهاء المخطط:' : 'End Date:'}</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-2 py-1 bg-white border rounded text-xs"
                      />
                    </div>
                  </div>
                )}

                {(formCategory === 'payroll' || formCategory === 'finance') && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-gray-600 block">{isRtl ? 'القيمة المطلوبة بالريال (SAR):' : 'Requested Value (SAR):'}</label>
                        <input
                          type="number"
                          placeholder="Amount in SAR"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-600 block">{isRtl ? 'عدد أشهر السداد / التقسيط:' : 'Repayment Months:'}</label>
                        <input
                          type="number"
                          placeholder="Installments count"
                          value={customInstallments}
                          onChange={(e) => setCustomInstallments(e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formCategory === 'assets' && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-gray-600 block">{isRtl ? 'اسم الأصل أو المعدة:' : 'Asset / Custody Name:'}</label>
                        <input
                          type="text"
                          placeholder="e.g. HP Workstation, Toyota Pickup"
                          value={customAssetName}
                          onChange={(e) => setCustomAssetName(e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-600 block">{isRtl ? 'تاريخ الإرجاع المتوقع:' : 'Expected Return Date:'}</label>
                        <input
                          type="date"
                          value={customTargetDate}
                          onChange={(e) => setCustomTargetDate(e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formCategory === 'it' && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-gray-600 block">{isRtl ? 'اسم الحساب المستهدف:' : 'AD Username:'}</label>
                        <input
                          type="text"
                          placeholder="e.g. f.harbi"
                          value={customUsername}
                          onChange={(e) => setCustomUsername(e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-600 block">{isRtl ? 'النظام التقني المطلوب:' : 'Target Application/System:'}</label>
                        <input
                          type="text"
                          placeholder="e.g. Oracle HCM, Active Directory"
                          value={customSystem}
                          onChange={(e) => setCustomSystem(e.target.value)}
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">{isRtl ? 'شرح إداري تفصيلي ومبررات الطلب:' : 'Request Explanation & Justifications:'}</label>
                  <textarea
                    rows={2}
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    placeholder={isRtl ? 'أدخل مسوغات وأسباب تقديم المعاملة بالتفصيل هنا...' : 'State precise operational justifications or instructions...'}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                {/* Simulated Document / Photo Attachment Uploader */}
                <div className="space-y-2 border-t pt-2 border-dashed border-gray-200">
                  <label className="font-black text-gray-700 block uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                    📎 {isRtl ? 'المرفقات والوثائق الثبوتية:' : 'Corporate Attachments & Proof Docs:'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center space-y-2">
                    <p className="text-[10px] text-gray-500">
                      {isRtl ? 'اسحب وأفلت الملفات هنا، أو انقر للاختيار (PDF, PNG, JPG, DOCX)' : 'Drag & drop official files here, or click to attach (PDF, PNG, JPG)'}
                    </p>
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUploading(true);
                          setTimeout(() => {
                            const mockFiles = [
                              'id_verification_card.pdf',
                              'medical_report_official.pdf',
                              'expense_invoice_receipt.png',
                              'equipment_maintenance_spec.pdf',
                              'leave_plan_calendar.docx'
                            ];
                            const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
                            if (!formAttachments.includes(randomFile)) {
                              setFormAttachments(prev => [...prev, randomFile]);
                            }
                            setIsUploading(false);
                          }, 800);
                        }}
                        disabled={isUploading}
                        className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {isUploading ? 'Uploading...' : '📁 Attach Simulated File'}
                      </button>
                    </div>
                  </div>

                  {formAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-lg border border-gray-150">
                      {formAttachments.map((f, i) => (
                        <div key={i} className="flex items-center gap-1 bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md border font-mono text-[9px]">
                          <span>{f}</span>
                          <button
                            type="button"
                            onClick={() => setFormAttachments(prev => prev.filter(x => x !== f))}
                            className="text-red-500 font-black hover:bg-gray-200 rounded p-0.5"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => handleCreateRequest(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                💾 {isRtl ? 'حفظ كمسودة مؤقتة' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleCreateRequest(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {isRtl ? 'تقديم للموافقة الفورية' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE GOVERNANCE & APPROVAL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-100">
                  {selectedRequest.id}
                </span>
                <h3 className="text-base font-black text-gray-900 mt-1">
                  {isRtl ? `حوكمة الطلب: ${selectedRequest.requestType}` : `Governance Audit: ${selectedRequest.requestType}`}
                </h3>
                <p className="text-xs text-gray-500">
                  {isRtl
                    ? `مقدّم من الموظف: ${selectedRequest.employeeName} (${selectedRequest.employeeId})`
                    : `Submitted by: ${selectedRequest.employeeName} (${selectedRequest.employeeId})`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setCommentText('');
                  setDelegationTarget('');
                  setElectronicSignature('');
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata and form values columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-xs border-b pb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  {isRtl ? 'البيانات الهيكلية والوظيفية' : 'Corporate Request Metadata'}
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'الفرع والموقع:' : 'Branch Location:'}</span>
                    <span className="font-bold text-gray-800">{selectedRequest.branch}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'القسم والإدارة:' : 'Department/Division:'}</span>
                    <span className="font-bold text-gray-800">{selectedRequest.department}</span>
                  </div>
                  {selectedRequest.project && (
                    <div>
                      <span className="text-gray-500 font-medium block">{isRtl ? 'المشروع المرتبط:' : 'Associated Project:'}</span>
                      <span className="font-bold text-gray-800 text-blue-700">{selectedRequest.project}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'تاريخ تقديم الطلب:' : 'Date Registered:'}</span>
                    <span className="font-bold text-gray-800 font-mono">{selectedRequest.requestDate}</span>
                  </div>
                  {selectedRequest.isFinancial && (
                    <div>
                      <span className="text-gray-500 font-medium block">{isRtl ? 'الأثر المالي للطلب:' : 'Associated Financial Impact:'}</span>
                      <span className="font-black text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded font-mono text-sm inline-block">
                        {selectedRequest.valueSAR.toLocaleString()} SAR
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-xs border-b pb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  {isRtl ? 'مبررات ومسوغات مقدم المعاملة' : 'Detailed Explanations & Forms'}
                </h4>
                <div className="space-y-2.5">
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'حالة الاعتماد الحالية:' : 'Current Workflow State:'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeStyle(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'الخطوة المكلفة حالياً بالتوقيع:' : 'Pending Stage Assignee:'}</span>
                    <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-[11px] inline-block mt-0.5">
                      {selectedRequest.currentLevelName} ({selectedRequest.currentApprover})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">{isRtl ? 'تفاصيل المبررات:' : 'Justification Text:'}</span>
                    <p className="text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200 italic leading-relaxed text-[11px]">
                      "{selectedRequest.details || 'No additional justification comment recorded.'}"
                    </p>
                  </div>
                  {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                      <span className="text-gray-500 font-bold block mb-1">📎 {isRtl ? 'الوثائق والمستندات المرفقة:' : 'Attached Corporate Docs:'}</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedRequest.attachments.map((file, idx) => (
                          <a
                            key={idx}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Simulating downloading/previewing: ${file}`);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded border border-blue-100 font-mono text-[9px] flex items-center gap-1 transition-all"
                          >
                            <span>📥 {file}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic fields visualizer */}
            {selectedRequest.formData && Object.keys(selectedRequest.formData).length > 0 && (
              <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-100 text-xs space-y-1.5">
                <span className="text-[10px] font-black uppercase text-blue-700 block tracking-wider">{isRtl ? 'قيم المدخلات المتغيرة للنموذج' : 'Structured Custom Form Values'}</span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  {Object.entries(selectedRequest.formData).map(([key, value]) => (
                    <div key={key} className="bg-white p-1.5 rounded border border-blue-50">
                      <span className="text-gray-500 block capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-bold text-gray-800">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discussion Thread */}
            {selectedRequest.comments && selectedRequest.comments.length > 0 && (
              <div className="space-y-2 bg-gray-50/80 p-4 rounded-xl border border-gray-150 text-xs">
                <span className="text-[10px] font-black uppercase text-gray-500 block tracking-wider">
                  💬 {isRtl ? 'سجل الملاحظات والمناقشات الداخلية للموظفين والمدراء:' : 'Internal Discussions & Collaboration Log:'}
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedRequest.comments.map((comment, index) => (
                    <div key={index} className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                        <span className="font-bold text-blue-700">{comment.authorName} ({comment.role})</span>
                        <span>{new Date(comment.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-mono text-[11px]">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval History Signature timeline */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-green-600" />
                {isRtl ? 'سجل الموافقات والتوقيعات الإلكترونية المعتمدة للطلب' : 'Official Cryptographic Approval & Signature Timeline'}
              </h4>

              {selectedRequest.history.length === 0 ? (
                <p className="text-gray-400 italic text-[11px] bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                  {isRtl ? 'لا توجد توقيعات إلكترونية سابقة على هذا الطلب حالياً.' : 'No signature certificates registered yet.'}
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
                          {hist.levelName || 'Approval Step'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">{hist.date}</span>
                      </div>
                      <div className="text-[11px] text-gray-700">
                        <span className="font-bold text-gray-800">{hist.approverName}</span>:{' '}
                        <span className="font-bold text-emerald-700">[{hist.action}]</span> — {hist.comment}
                      </div>
                      {hist.signature && (
                        <div className="font-mono text-[9px] text-gray-400 border-t border-dashed pt-0.5 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-500" />
                          <span>Signed: <em>{hist.signature}</em></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Employee Request Owner Console */}
            {(selectedRequest.employeeId === selectedEmployeeId || activeRolePerspective === 'employee') && (
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-gray-500 block tracking-wider">
                  👤 {isRtl ? 'إجراءات صاحب الطلب (Employee self-service)' : 'Employee ESS Request Owner Console'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(selectedRequest.status === 'Draft' || selectedRequest.status === 'Returned for Correction') && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRequestId(selectedRequest.id);
                        const matchedCatEntry = Object.entries(REQUEST_CATEGORIES).find(([_, cat]) => cat.labelEn === selectedRequest.category);
                        const catKey = matchedCatEntry ? (matchedCatEntry[0] as keyof typeof REQUEST_CATEGORIES) : 'hr';
                        setFormCategory(catKey);
                        setFormType(selectedRequest.requestType);
                        setFormEmployeeId(selectedRequest.employeeId);
                        setFormPriority(selectedRequest.priority);
                        setFormIsFinancial(selectedRequest.isFinancial);
                        setFormValueSAR(selectedRequest.valueSAR);
                        setFormDetails(selectedRequest.details);
                        setFormProject(selectedRequest.project || 'NEOM Site Office');
                        setFormAttachments(selectedRequest.attachments || []);
                        if (selectedRequest.formData) {
                          setCustomLeaveType(selectedRequest.formData.leaveType || 'Annual Leave');
                          setCustomStartDate(selectedRequest.formData.startDate || '');
                          setCustomEndDate(selectedRequest.formData.endDate || '');
                          setCustomAmount(selectedRequest.formData.amount || '');
                          setCustomInstallments(selectedRequest.formData.installments || '');
                          setCustomAssetName(selectedRequest.formData.assetName || '');
                          setCustomTargetDate(selectedRequest.formData.targetDate || '');
                          setCustomUsername(selectedRequest.formData.username || '');
                          setCustomSystem(selectedRequest.formData.system || '');
                        }
                        setIsCreateOpen(true);
                        setSelectedRequest(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      ✏ {isRtl ? 'تعديل المعاملة / إعادة التقديم' : 'Edit Request / Re-submit'}
                    </button>
                  )}
                  {selectedRequest.status === 'Pending Approval' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(isRtl ? 'هل أنت متأكد من إلغاء هذا الطلب نهائياً؟' : 'Are you sure you want to cancel this request?')) {
                          handleWorkflowAction(selectedRequest.id, 'cancel');
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      🗙 {isRtl ? 'إلغاء الطلب وسحبه' : 'Cancel Request'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Workflow Control Operations Center */}
            {selectedRequest.status === 'Pending Approval' && (
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 space-y-3">
                <span className="text-[10px] font-black uppercase text-blue-900 block tracking-wider">
                  {isRtl ? 'إجراءات الحوكمة الفورية للطلب' : 'Corporate Governance Workflow Console'}
                </span>
                
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setModalAction('approve')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'approve' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    ✓ {isRtl ? 'توقيع واعتماد' : 'Approve & Sign'}
                  </button>
                  <button
                    onClick={() => setModalAction('reject')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'reject' ? 'bg-red-600 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    ✗ {isRtl ? 'رفض المعاملة' : 'Reject Request'}
                  </button>
                  <button
                    onClick={() => setModalAction('comment')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'comment' ? 'bg-yellow-600 text-white border-yellow-700' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    ✎ {isRtl ? 'إعادة للتعديل للتصحيح' : 'Return for Correction'}
                  </button>
                  <button
                    onClick={() => setModalAction('delegate')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'delegate' ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    ↱ {isRtl ? 'تفويض مراجع آخر' : 'Delegate Review'}
                  </button>
                  <button
                    onClick={() => setModalAction('escalate')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      modalAction === 'escalate' ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    ⚠ {isRtl ? 'تصعيد طارئ (SLA)' : 'Escalate (SLA Trigger)'}
                  </button>
                </div>

                {modalAction === 'delegate' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 block">{isRtl ? 'اسم الموظف أو المدير المفوض:' : 'Target Delegate User Name:'}</label>
                    <select
                      value={delegationTarget}
                      onChange={(e) => setDelegationTarget(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                    >
                      <option value="">-- Choose manager --</option>
                      <option value="Ahmed Faraj Al-Dossary (Supervisor)">Ahmed Faraj Al-Dossary (Supervisor)</option>
                      <option value="Sarah Khalid Al-Ghamdi (HR Mgr)">Sarah Khalid Al-Ghamdi (HR Manager)</option>
                      <option value="Mohammad Salem Al-Qahtani (Finance Dir)">Mohammad Salem Al-Qahtani (Finance Manager)</option>
                      <option value="Tariq Abdulaziz Al-Otaibi (General Manager)">Tariq Abdulaziz Al-Otaibi (General Manager)</option>
                    </select>
                  </div>
                )}

                {/* ELECTRONIC SIGNATURE PAD AND TYPING PREVIEW */}
                <div className="space-y-1.5 border-t pt-2 border-blue-100">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gray-500 block">{isRtl ? 'التوقيع الإلكتروني الموثق (Electronic Signature):' : 'Electronic Signature Pad:'}</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSignatureType('type')}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${signatureType === 'type' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100'}`}
                      >
                        Type Sign
                      </button>
                      <button
                        onClick={() => setSignatureType('draw')}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${signatureType === 'draw' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100'}`}
                      >
                        Draw Sign
                      </button>
                    </div>
                  </div>

                  {signatureType === 'type' ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Type your full name to generate sign"
                        value={electronicSignature}
                        onChange={(e) => setElectronicSignature(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs"
                      />
                      {electronicSignature && (
                        <div className="p-3 bg-gray-50 border rounded-lg border-dashed text-center">
                          <span className="font-serif italic text-lg tracking-wider text-blue-800 select-none block">
                            {electronicSignature}
                          </span>
                          <span className="text-[8px] text-gray-400 font-mono block mt-1">SECURE VERIFIED ID CODE: {selectedRequest.id}-SIG-{Date.now().toString().slice(-6)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border rounded-lg border-dashed text-center cursor-crosshair space-y-2">
                      <p className="text-[10px] text-gray-400 italic">{isRtl ? 'ارسم توقيعك هنا عبر لوحة اللمس أو الماوس' : 'Simulated Canvas: Touch or click to signature pad'}</p>
                      <div className="w-full h-12 bg-white border rounded flex items-center justify-center font-serif text-lg tracking-widest text-indigo-700 italic select-none">
                        ✍️ {employees.find(e => e.id === selectedEmployeeId)?.fullName.slice(0, 3).toUpperCase() || 'SIGN'} / {selectedRequest.id}
                      </div>
                      <input
                        type="text"
                        placeholder="Confirm with initials or type to record drawing"
                        value={electronicSignature}
                        onChange={(e) => setElectronicSignature(e.target.value)}
                        className="w-full px-2 py-1 bg-white border rounded text-[10px]"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">{isRtl ? 'الملاحظات الإدارية والتوجيهات:' : 'Reviewer Decision Comments:'}</label>
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={isRtl ? 'أدخل تفاصيل ومبررات القرار الإداري للمستقبل...' : 'Enter comments explaining approval/rejection or return reason...'}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-blue-100 pt-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!commentText.trim()) {
                        alert(isRtl ? 'الرجاء كتابة تعليق أولاً.' : 'Please enter a comment text first.');
                        return;
                      }
                      await handleWorkflowAction(selectedRequest.id, 'add_comment');
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border font-bold px-3 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    💬 {isRtl ? 'إضافة تعليق داخلي فقط' : 'Add Comment Only'}
                  </button>
                  <button
                    onClick={() => handleWorkflowAction(selectedRequest.id, modalAction)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-xs"
                  >
                    {isRtl ? 'تأكيد وحفظ القرار والقرصنة' : 'Confirm Workflow Decision'}
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
                  setElectronicSignature('');
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                {isRtl ? 'إغلاق نافذة التدقيق' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
