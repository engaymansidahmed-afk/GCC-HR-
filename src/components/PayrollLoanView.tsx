import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  Printer,
  X,
  CreditCard,
  Plus,
  Shield,
  Filter,
  Download,
  Edit3,
  AlertCircle,
  RotateCcw,
  Trash2,
  Users,
  Building2,
  Calendar,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Employee, Loan, PayrollRun, PayrollEmployeeItem } from '../types';

interface PayrollLoanViewProps {
  employees: Employee[];
  loans: Loan[];
  payrollRuns: PayrollRun[];
  currentUser: { id: string; fullName: string; role: string };
  isRtl: boolean;
  onRefresh: () => void;
}

const handleResponse = async (res: Response, fallbackMessage: string) => {
  const contentType = res.headers.get('content-type');
  if (!res.ok) {
    if (contentType && contentType.includes('application/json')) {
      try {
        const errData = await res.json();
        throw new Error(errData.error || errData.message || fallbackMessage);
      } catch (e: any) {
        throw new Error(e.message || fallbackMessage);
      }
    } else {
      const errorText = await res.text().catch(() => '');
      throw new Error(`${fallbackMessage} (Status ${res.status}): ${errorText.substring(0, 100) || 'Unknown Server Error'}`);
    }
  }

  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  
  throw new Error(`Expected JSON response, but received non-JSON (Status ${res.status})`);
};

export default function PayrollLoanView({
  employees,
  loans,
  payrollRuns,
  currentUser,
  isRtl,
  onRefresh
}: PayrollLoanViewProps) {
  const [activeTab, setActiveTab] = useState<'payroll' | 'loans'>('payroll');
  
  // Payroll-specific states
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genMonth, setGenMonth] = useState('06');
  const [genYear, setGenYear] = useState('2026');
  
  // Filtering states
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [filterProject, setFilterProject] = useState('All');
  const [filterEmpType, setFilterEmpType] = useState('All');
  const [searchEmployee, setSearchEmployee] = useState('');
  
  // Editing states
  const [editItem, setEditItem] = useState<PayrollEmployeeItem | null>(null);
  const [editOvertime, setEditOvertime] = useState('0');
  const [editBonus, setEditBonus] = useState('0');
  const [editIncentive, setEditIncentive] = useState('0');
  const [editCommission, setEditCommission] = useState('0');
  const [editOtherAllow, setEditOtherAllow] = useState('0');
  const [editOtherDed, setEditOtherDed] = useState('0');
  const [editAdvanceDed, setEditAdvanceDed] = useState('0');
  
  // View states
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollEmployeeItem | null>(null);
  const [showWorkflowCommentModal, setShowWorkflowCommentModal] = useState(false);
  const [workflowComment, setWorkflowComment] = useState('');
  const [pendingWorkflowStep, setPendingWorkflowStep] = useState<'officer' | 'finance' | 'hr' | 'gm' | null>(null);

  // Loan Request Form States
  const [loanAmount, setLoanAmount] = useState('');
  const [repaymentMonths, setRepaymentMonths] = useState('12');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default selected run on load
  useEffect(() => {
    if (payrollRuns && payrollRuns.length > 0 && !selectedRunId) {
      setSelectedRunId(payrollRuns[0].id);
    }
  }, [payrollRuns, selectedRunId]);

  // Find active loan helper
  const getEmployeeActiveLoan = (empId: string) => {
    return loans.find((l) => l.employeeId === empId && l.status === 'Active');
  };

  // Create loan request
  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanAmount || !repaymentMonths) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          employeeName: currentUser.fullName,
          amount: Number(loanAmount),
          repaymentMonths: Number(repaymentMonths)
        })
      });

      await handleResponse(res, 'Loan request submission failed');
      onRefresh();
      setLoanAmount('');
      alert(isRtl ? 'تم تقديم طلب السلفة بنجاح!' : 'Loan request submitted successfully!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve / Reject Loan action
  const handleLoanAction = async (id: string, action: 'approve' | 'reject' | 'close' | 'suspend' | 'resume') => {
    try {
      const res = await fetch(`/api/loans/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          approverId: currentUser.id,
          approverName: currentUser.fullName,
          role: currentUser.role
        })
      });

      await handleResponse(res, 'Action execution failed');
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Generate new payroll run
  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: genMonth,
          year: genYear,
          generatedBy: currentUser.id,
          generatedByName: currentUser.fullName,
          role: currentUser.role
        })
      });

      const responseData = await handleResponse(res, 'Failed to generate payroll register');
      const newRun = (responseData && typeof responseData === 'object' && 'success' in responseData && responseData.success)
        ? responseData.data
        : responseData;

      setShowGenerateModal(false);
      setSelectedRunId(newRun.id);
      onRefresh();
      alert(isRtl ? 'تم إنشاء مسير رواتب مبدئي بنجاح' : 'Draft payroll register generated successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Edit single employee details
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !selectedRunId) return;

    try {
      const res = await fetch(`/api/payroll/${selectedRunId}/update-row`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: editItem.employeeId,
          overtime: Number(editOvertime),
          bonuses: Number(editBonus),
          incentives: Number(editIncentive),
          commissions: Number(editCommission),
          otherAllowances: Number(editOtherAllow),
          otherDeductions: Number(editOtherDed),
          salaryAdvanceDeductions: Number(editAdvanceDed),
          modifiedBy: currentUser.id,
          modifiedByName: currentUser.fullName,
          role: currentUser.role
        })
      });

      await handleResponse(res, 'Failed to update employee payroll row');
      setEditItem(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Trigger sequential workflow approval step
  const handleApproveWorkflowStep = async () => {
    if (!selectedRunId || !pendingWorkflowStep) return;

    try {
      const res = await fetch(`/api/payroll/${selectedRunId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: pendingWorkflowStep,
          approverId: currentUser.id,
          approverName: currentUser.fullName,
          role: currentUser.role,
          comment: workflowComment
        })
      });

      await handleResponse(res, 'Workflow approval execution failed');
      setShowWorkflowCommentModal(false);
      setWorkflowComment('');
      setPendingWorkflowStep(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Reopen a locked or approved register
  const handleReopenRegister = async () => {
    if (!selectedRunId) return;
    if (!confirm(isRtl ? 'هل أنت متأكد من إعادة فتح مسير الرواتب؟ سيتم إلغاء جميع الاعتمادات السابقة.' : 'Are you sure you want to reopen this register? All existing approval tiers will be reset.')) return;

    try {
      const res = await fetch(`/api/payroll/${selectedRunId}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.fullName,
          role: currentUser.role
        })
      });

      await handleResponse(res, 'Reopen operation failed');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Cancel and delete a draft register
  const handleCancelRegister = async () => {
    if (!selectedRunId) return;
    if (!confirm(isRtl ? 'هل أنت متأكد من إلغاء وحذف مسير الرواتب هذا بالكامل؟' : 'Are you sure you want to cancel and delete this payroll register? This action is irreversible.')) return;

    try {
      const res = await fetch(`/api/payroll/${selectedRunId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.fullName,
          role: currentUser.role
        })
      });

      await handleResponse(res, 'Cancel operation failed');
      setSelectedRunId('');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Audit Log triggers for Exports and Prints
  const logAuditAction = async (actionType: string, format: string, count: number, month: string, year: number) => {
    try {
      await fetch('/api/payroll/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.fullName,
          role: currentUser.role,
          actionType,
          payrollMonth: month,
          payrollYear: year,
          employeesIncluded: count,
          fileFormat: format
        })
      });
    } catch (e) {
      console.error('Audit logger failed:', e);
    }
  };

  // Select currently displayed payroll run
  const activeRun = payrollRuns.find(r => r.id === selectedRunId);

  // Dynamic filter lists
  const branches = ['All', 'Riyadh (HQ)', 'NEOM Site Office'];
  const departments = ['All', 'Executive Management', 'Human Resources', 'Finance & Payroll', 'Engineering & Operations'];
  const projects = ['All', 'HQ', 'PRJ-NEO-03', 'PRJ-RYD-01'];
  const employmentTypes = ['All', 'Full-Time', 'Contract', 'Part-Time', 'Temporary'];

  // Apply filters
  const filteredEmployees = activeRun
    ? activeRun.employees.filter((emp) => {
        const matchesBranch = filterBranch === 'All' || emp.branch === filterBranch;
        const matchesDept = filterDept === 'All' || emp.department === filterDept;
        const matchesProj = filterProject === 'All' || emp.project === filterProject;
        const matchesType = filterEmpType === 'All' || emp.employmentType === filterEmpType;
        const matchesSearch = emp.employeeName.toLowerCase().includes(searchEmployee.toLowerCase()) || emp.employeeId.toLowerCase().includes(searchEmployee.toLowerCase());
        return matchesBranch && matchesDept && matchesProj && matchesType && matchesSearch;
      })
    : [];

  // Compute Grand Totals dynamically
  const totals = filteredEmployees.reduce(
    (acc, cur) => {
      acc.employeesCount += 1;
      acc.basic += cur.basicSalary;
      acc.allowances += cur.housingAllowance + cur.transportationAllowance + cur.communicationAllowance + cur.foodAllowance + cur.otherAllowances;
      acc.overtime += cur.overtime;
      acc.bonuses += cur.bonuses + cur.incentives + cur.commissions;
      acc.loanDeductions += cur.loanDeductions;
      acc.salaryAdvances += cur.salaryAdvanceDeductions;
      acc.gosi += cur.gosi;
      acc.otherDeductions += cur.otherDeductions;
      acc.gross += cur.grossSalary;
      acc.net += cur.netSalary;
      if (cur.paymentStatus === 'Paid') acc.paidCount += 1;
      else acc.pendingCount += 1;
      return acc;
    },
    {
      employeesCount: 0,
      basic: 0,
      allowances: 0,
      overtime: 0,
      bonuses: 0,
      loanDeductions: 0,
      salaryAdvances: 0,
      gosi: 0,
      otherDeductions: 0,
      gross: 0,
      net: 0,
      paidCount: 0,
      pendingCount: 0
    }
  );

  // Compute stats for Dashboard
  const highestSalary = filteredEmployees.length > 0 ? Math.max(...filteredEmployees.map(e => e.netSalary)) : 0;
  const lowestSalary = filteredEmployees.length > 0 ? Math.min(...filteredEmployees.map(e => e.netSalary)) : 0;
  const avgSalary = filteredEmployees.length > 0 ? Math.round(totals.net / filteredEmployees.length) : 0;
  // GOSI Employer Portion (12% of Basic + Housing for Saudi Citizens)
  const totalEmployerGosi = filteredEmployees.reduce((acc, cur) => {
    const isSaudi = cur.gosi > 0; // Seeding/Calculation is citizen-specific
    return acc + (isSaudi ? Math.round((cur.basicSalary + cur.housingAllowance) * 0.12) : 0);
  }, 0);

  // Set edit modal state
  const handleOpenEdit = (emp: PayrollEmployeeItem) => {
    setEditItem(emp);
    setEditOvertime(String(emp.overtime));
    setEditBonus(String(emp.bonuses));
    setEditIncentive(String(emp.incentives));
    setEditCommission(String(emp.commissions));
    setEditOtherAllow(String(emp.otherAllowances));
    setEditOtherDed(String(emp.otherDeductions));
    setEditAdvanceDed(String(emp.salaryAdvanceDeductions));
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!activeRun) return;
    
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += `AL-MANSOORI CORPORATE PAYROLL REGISTER - Period: ${activeRun.year}-${activeRun.month}\n`;
    csvContent += 'Employee ID,Employee Name,Department,Position,Branch,Project,Employment Type,Basic Salary,Housing Allowance,Transportation Allowance,Communication Allowance,Food Allowance,Other Allowances,Overtime,Bonuses,Incentives,Commissions,Loan Deductions,Salary Advances,GOSI Deduction,Other Deductions,Gross Payroll,Net Payroll,Status\n';
    
    filteredEmployees.forEach(emp => {
      csvContent += `${emp.employeeId},"${emp.employeeName}","${emp.department}","${emp.position}","${emp.branch}","${emp.project}","${emp.employmentType}",${emp.basicSalary},${emp.housingAllowance},${emp.transportationAllowance},${emp.communicationAllowance},${emp.foodAllowance},${emp.otherAllowances},${emp.overtime},${emp.bonuses},${emp.incentives},${emp.commissions},${emp.loanDeductions},${emp.salaryAdvanceDeductions},${emp.gosi},${emp.otherDeductions},${emp.grossSalary},${emp.netSalary},${emp.paymentStatus}\n`;
    });

    // Add totals row
    csvContent += `GRAND TOTALS,${totals.employeesCount} Employees,,,,,,${totals.basic},,,,,,${totals.overtime},${totals.bonuses},,,${totals.loanDeductions},${totals.salaryAdvances},${totals.gosi},${totals.otherDeductions},${totals.gross},${totals.net},\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payroll_register_${activeRun.year}_${activeRun.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAuditAction('Payroll Exported', 'CSV', filteredEmployees.length, activeRun.month, activeRun.year);
  };

  // Export to Excel XML/HTML Formatted Spreadsheet
  const handleExportExcel = () => {
    if (!activeRun) return;

    const headers = [
      'Emp ID', 'Name', 'Department', 'Position', 'Branch', 'Type', 'Basic', 
      'Housing', 'Transport', 'Comm', 'Food', 'Other Allow', 'Overtime', 
      'Bonus/Comm', 'Loan Ded', 'GOSI', 'Other Ded', 'Gross Pay', 'Net Salary', 'Status'
    ];

    const rows = filteredEmployees.map(emp => [
      emp.employeeId, emp.employeeName, emp.department, emp.position, emp.branch, emp.employmentType,
      emp.basicSalary, emp.housingAllowance, emp.transportationAllowance, emp.communicationAllowance,
      emp.foodAllowance, emp.otherAllowances, emp.overtime, (emp.bonuses + emp.commissions),
      emp.loanDeductions, emp.gosi, emp.otherDeductions, emp.grossSalary, emp.netSalary, emp.paymentStatus
    ]);

    // Append totals row
    rows.push([
      'TOTALS', `${totals.employeesCount} Employees`, '', '', '', '', totals.basic,
      '', '', '', '', totals.allowances, totals.overtime, totals.bonuses,
      totals.loanDeductions, totals.gosi, totals.otherDeductions, totals.gross, totals.net, ''
    ]);

    const title = `Al-Mansoori HR - Payroll Register ${activeRun.year}-${activeRun.month}`;
    
    let xmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    xmlContent += `<head><meta charset="utf-8" /><style>table { border-collapse: collapse; font-family: 'Segoe UI', Tahoma, sans-serif; } th { background-color: #0d47a1; color: white; border: 1px solid #ddd; padding: 10px; font-size: 11px; text-transform: uppercase; } td { border: 1px solid #eee; padding: 8px; font-size: 11px; } .totals { background-color: #f5f5f5; font-weight: bold; }</style></head><body>`;
    xmlContent += `<h2>${title}</h2>`;
    xmlContent += `<p>Generated By: ${currentUser.fullName} (${currentUser.role}) on ${new Date().toLocaleDateString()}</p>`;
    xmlContent += `<table><thead><tr>`;
    headers.forEach(h => { xmlContent += `<th>${h}</th>`; });
    xmlContent += `</tr></thead><tbody>`;
    
    rows.forEach((row, idx) => {
      const isTotals = idx === rows.length - 1;
      xmlContent += `<tr class="${isTotals ? 'totals' : ''}">`;
      row.forEach(cell => {
        xmlContent += `<td>${cell !== undefined && cell !== null ? cell : ''}</td>`;
      });
      xmlContent += `</tr>`;
    });
    
    xmlContent += `</tbody></table></body></html>`;

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_register_${activeRun.year}_${activeRun.month}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logAuditAction('Payroll Exported', 'Excel', filteredEmployees.length, activeRun.month, activeRun.year);
  };

  // Bulk Print / Export to PDF Handler
  const handleBulkPrint = () => {
    if (!activeRun) return;
    logAuditAction('Payroll Printed', 'PDF', filteredEmployees.length, activeRun.month, activeRun.year);
    window.print();
  };

  // Sign off workflow validation checks
  const getWorkflowBtnStyle = (stepName: 'officer' | 'finance' | 'hr' | 'gm') => {
    if (!activeRun) return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    
    const status = activeRun.status;
    const isStepAvailable = 
      (stepName === 'officer' && status === 'Draft') ||
      (stepName === 'finance' && status === 'Approved_Officer') ||
      (stepName === 'hr' && status === 'Approved_Finance') ||
      (stepName === 'gm' && status === 'Approved_HR');

    if (isStepAvailable) {
      return 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer';
    }
    return 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed';
  };

  const isApproved = (stepName: 'officer' | 'finance' | 'hr' | 'gm') => {
    if (!activeRun) return false;
    const wf = activeRun.approvalWorkflow;
    if (stepName === 'officer') return !!wf.officer;
    if (stepName === 'finance') return !!wf.finance;
    if (stepName === 'hr') return !!wf.hr;
    if (stepName === 'gm') return !!wf.gm;
    return false;
  };

  const getWorkflowStepLabel = (stepName: 'officer' | 'finance' | 'hr' | 'gm') => {
    if (!activeRun) return isRtl ? 'بانتظار الإجراء' : 'Awaiting';
    const wf = activeRun.approvalWorkflow;
    if (stepName === 'officer' && wf.officer) return `${wf.officer.by} (${wf.officer.date})`;
    if (stepName === 'finance' && wf.finance) return `${wf.finance.by} (${wf.finance.date})`;
    if (stepName === 'hr' && wf.hr) return `${wf.hr.by} (${wf.hr.date})`;
    if (stepName === 'gm' && wf.gm) return `${wf.gm.by} (${wf.gm.date})`;
    
    return isRtl ? 'قيد الانتظار' : 'Pending Sign-off';
  };

  return (
    <div id="payroll_loan_view" className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-sm">
        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'payroll' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'حساب مسيرات الرواتب' : 'Monthly Payroll Register'}
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'loans' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'السلف والقروض الشخصية' : 'Loans & Salary Advances'}
        </button>
      </div>

      {activeTab === 'payroll' && (
        <div className="space-y-6">
          
          {/* Controls & Active Register Info Panel */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-gray-900">
                {isRtl ? 'مسير الرواتب والاعتمادات الدوري' : 'Enterprise Payroll Ledger & Processing'}
              </h2>
              <p className="text-xs text-gray-500">
                {isRtl ? 'إدارة الرواتب والبدلات والتأمينات الاجتماعية GOSI وسداد قروض الموظفين' : 'Manage core salaries, allowances, GOSI, loan offsets, and corporate stamps'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">{isRtl ? 'المسير النشط:' : 'Select Run:'}</span>
                <select
                  value={selectedRunId}
                  onChange={(e) => setSelectedRunId(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-lg px-2.5 py-1.5 font-mono font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- No Run Selected --</option>
                  {payrollRuns.map(run => (
                    <option key={run.id} value={run.id}>{run.id} ({run.month}/{run.year})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إنشاء مسير جديد' : 'Process New Register'}</span>
              </button>
            </div>
          </div>

          {activeRun ? (
            <>
              {/* Executive Dashboard KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">{isRtl ? 'إجمالي الرواتب الصافية' : 'Total Net Payroll'}</span>
                    <span className="text-sm lg:text-base font-black text-gray-800 font-mono">{totals.net.toLocaleString()} SAR</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="bg-green-50 p-2.5 rounded-lg text-green-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">{isRtl ? 'إجمالي عدد الموظفين' : 'Active Headcount'}</span>
                    <span className="text-sm lg:text-base font-black text-gray-800 font-mono">{totals.employeesCount} {isRtl ? 'موظف' : 'FTEs'}</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="bg-purple-50 p-2.5 rounded-lg text-purple-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">{isRtl ? 'تأمينات الشركة (GOSI)' : 'Employer GOSI'}</span>
                    <span className="text-sm lg:text-base font-black text-gray-800 font-mono">{totalEmployerGosi.toLocaleString()} SAR</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">{isRtl ? 'متوسط صافي الرواتب' : 'Average Net Pay'}</span>
                    <span className="text-sm lg:text-base font-black text-gray-800 font-mono">{avgSalary.toLocaleString()} SAR</span>
                  </div>
                </div>
              </div>

              {/* Extra Dashboard Metrics in small details */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 block">{isRtl ? 'أعلى راتب صافي:' : 'Highest Salary:'}</span>
                  <span className="font-bold text-gray-700">{highestSalary.toLocaleString()} SAR</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">{isRtl ? 'أدنى راتب صافي:' : 'Lowest Salary:'}</span>
                  <span className="font-bold text-gray-700">{lowestSalary.toLocaleString()} SAR</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">{isRtl ? 'إجمالي السلف المستقطعة:' : 'Loans Deducted:'}</span>
                  <span className="font-bold text-red-600">-{totals.loanDeductions.toLocaleString()} SAR</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">{isRtl ? 'إجمالي العمل الإضافي:' : 'Overtime Cost:'}</span>
                  <span className="font-bold text-green-600">+{totals.overtime.toLocaleString()} SAR</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">{isRtl ? 'حالة السداد العامة:' : 'Payment Status:'}</span>
                  <span className="font-bold text-blue-700">{totals.paidCount} Paid / {totals.pendingCount} Pending</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">{isRtl ? 'إجمالي تكلفة الموارد:' : 'Total Cost Basis:'}</span>
                  <span className="font-bold text-gray-800">{(totals.gross + totalEmployerGosi).toLocaleString()} SAR</span>
                </div>
              </div>

              {/* Sequential Multi-Tier Approval Workflow Section */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-600" />
                      {isRtl ? 'اعتمادات مسير الرواتب' : 'Payroll Compliance Sign-off Workflow'}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {isRtl ? 'توقيعات المسير بالتسلسل المعتمد لفك القفل والتمكن من الصرف والطباعة' : 'Sequential payroll audits required to lock values and release bank file transfers'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    activeRun.status === 'Locked' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  }`}>
                    {isRtl ? 'الحالة الحالية: ' : 'Workflow State: '} {activeRun.status}
                  </span>
                </div>

                {/* Progress Workflow Sequence Map */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  {[
                    { id: 'officer', label: isRtl ? 'معد الرواتب' : '1. Payroll Officer', roleNeeded: 'HR Manager' },
                    { id: 'finance', label: isRtl ? 'المدير المالي' : '2. Finance Manager', roleNeeded: 'Finance Manager' },
                    { id: 'hr', label: isRtl ? 'مدير الموارد البشرية' : '3. HR Manager', roleNeeded: 'HR Manager' },
                    { id: 'gm', label: isRtl ? 'المدير العام' : '4. General Manager', roleNeeded: 'Super Administrator' }
                  ].map((step, idx) => {
                    const stepDone = isApproved(step.id as any);
                    return (
                      <div 
                        key={step.id} 
                        className={`p-3 rounded-lg border transition-all ${
                          stepDone 
                            ? 'bg-green-50/50 border-green-200' 
                            : 'bg-gray-50/50 border-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-800">{step.label}</span>
                          {stepDone ? (
                            <CheckCircle className="w-4 h-4 text-green-600 fill-green-50" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1.5 font-mono truncate">
                          {getWorkflowStepLabel(step.id as any)}
                        </p>

                        {/* Interactive Sign-off action button */}
                        {!stepDone && (
                          <button
                            onClick={() => {
                              setPendingWorkflowStep(step.id as any);
                              setShowWorkflowCommentModal(true);
                            }}
                            disabled={
                              (step.id === 'officer' && activeRun.status !== 'Draft') ||
                              (step.id === 'finance' && activeRun.status !== 'Approved_Officer') ||
                              (step.id === 'hr' && activeRun.status !== 'Approved_Finance') ||
                              (step.id === 'gm' && activeRun.status !== 'Approved_HR')
                            }
                            className={`w-full text-center py-1 mt-2 rounded text-[10px] font-bold transition-all ${getWorkflowBtnStyle(step.id as any)}`}
                          >
                            {isRtl ? 'توقيع واعتماد' : 'Review & Sign'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reset / Reopen action drawer */}
                <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-gray-100 text-xs">
                  {activeRun.status === 'Draft' && (
                    <button
                      onClick={handleCancelRegister}
                      className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'إلغاء وحذف المسير' : 'Cancel draft register'}</span>
                    </button>
                  )}
                  {activeRun.status !== 'Draft' && (
                    <button
                      onClick={handleReopenRegister}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'إعادة الفتح للتعديل' : 'Unlock & Reopen Register'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Dynamic Filtering Panel */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>{isRtl ? 'تصفية وبحث مسير الرواتب:' : 'Interactive Directory Filters & WPS Outputs'}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'الفرع:' : 'Branch'}</label>
                    <select
                      value={filterBranch}
                      onChange={(e) => setFilterBranch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none"
                    >
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'القسم الوظيفي:' : 'Department'}</label>
                    <select
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none"
                    >
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'المشروع:' : 'Project'}</label>
                    <select
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none"
                    >
                      {projects.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'نوع التعاقد:' : 'Contract Type'}</label>
                    <select
                      value={filterEmpType}
                      onChange={(e) => setFilterEmpType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none"
                    >
                      {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{isRtl ? 'بحث باسم الموظف:' : 'Employee Search'}</label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq"
                      value={searchEmployee}
                      onChange={(e) => setSearchEmployee(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Document Exports action tray */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50 justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold font-mono uppercase">
                    {filteredEmployees.length} {isRtl ? 'موظف مطابق للفلاتر' : 'records matched filters'}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'تصدير Excel' : 'Export Excel (XLSX)'}</span>
                    </button>
                    <button
                      onClick={handleBulkPrint}
                      disabled={activeRun.status !== 'Locked'}
                      title={activeRun.status !== 'Locked' ? 'Unlock is required via sequential GM approval.' : ''}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        activeRun.status === 'Locked'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'طباعة الكشف الكامل' : 'Bulk Print Register (PDF)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grand Payroll Register Table Panel */}
              <div id="print-area" className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-4">
                
                {/* Print Branding Header */}
                <div className="hidden print:flex justify-between items-start border-b pb-4">
                  <div className="space-y-1">
                    <h1 className="font-bold text-gray-900 text-lg">AL-MANSOORI OPERATIONS & CONTRACTING CO.</h1>
                    <p className="text-xs text-gray-500">Corporate Finance & Payroll Audit Records Office</p>
                    <p className="text-[10px] text-gray-400 font-mono">WPS Bank Transfer License: 10103445XX</p>
                  </div>
                  <div className="text-right">
                    <h2 className="font-black text-blue-700 text-base">PAYROLL REGISTER LEDGER</h2>
                    <p className="text-xs font-mono font-bold text-gray-700">Period: {activeRun.year}-{activeRun.month}</p>
                    <p className="text-[10px] text-gray-400">Printed: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700 border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500">
                        <th className="p-2">{isRtl ? 'الموظف' : 'Employee details'}</th>
                        <th className="p-2 text-right">{isRtl ? 'الأساسي' : 'Basic'}</th>
                        <th className="p-2 text-right">{isRtl ? 'سكن' : 'Housing'}</th>
                        <th className="p-2 text-right">{isRtl ? 'نقل' : 'Transport'}</th>
                        <th className="p-2 text-right">{isRtl ? 'بدلات أخرى' : 'Other Allow'}</th>
                        <th className="p-2 text-right text-green-700">{isRtl ? 'إضافي' : 'Overtime'}</th>
                        <th className="p-2 text-right text-green-700">{isRtl ? 'حوافز' : 'Incentives'}</th>
                        <th className="p-2 text-right text-red-600">{isRtl ? 'السلف' : 'Loans'}</th>
                        <th className="p-2 text-right text-red-600">{isRtl ? 'التأمينات' : 'GOSI'}</th>
                        <th className="p-2 text-right text-red-600">{isRtl ? 'خصومات أخرى' : 'Other Ded'}</th>
                        <th className="p-2 text-right font-bold text-gray-900">{isRtl ? 'الصافي' : 'Net Salary'}</th>
                        <th className="p-2 text-center print:hidden">{isRtl ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredEmployees.map((emp) => {
                        const totalAllowancesValue = emp.housingAllowance + emp.transportationAllowance + emp.communicationAllowance + emp.foodAllowance + emp.otherAllowances;
                        return (
                          <tr key={emp.employeeId} className="hover:bg-gray-50/30">
                            <td className="p-2 py-3">
                              <p className="font-bold text-gray-900 leading-tight">{emp.employeeName}</p>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {emp.employeeId} • {emp.position} ({emp.project})
                              </span>
                            </td>
                            <td className="p-2 text-right font-mono text-gray-600">{emp.basicSalary.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono text-gray-500">{emp.housingAllowance.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono text-gray-500">{emp.transportationAllowance.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono text-gray-500">{(emp.communicationAllowance + emp.foodAllowance + emp.otherAllowances).toLocaleString()}</td>
                            <td className={`p-2 text-right font-mono ${emp.overtime > 0 ? 'text-green-700 font-bold' : 'text-gray-400'}`}>
                              {emp.overtime > 0 ? `+${emp.overtime.toLocaleString()}` : '0'}
                            </td>
                            <td className={`p-2 text-right font-mono ${emp.bonuses + emp.incentives + emp.commissions > 0 ? 'text-green-700 font-bold' : 'text-gray-400'}`}>
                              {emp.bonuses + emp.incentives + emp.commissions > 0 ? `+${(emp.bonuses + emp.incentives + emp.commissions).toLocaleString()}` : '0'}
                            </td>
                            <td className={`p-2 text-right font-mono ${emp.loanDeductions + emp.salaryAdvanceDeductions > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                              {emp.loanDeductions + emp.salaryAdvanceDeductions > 0 ? `-${(emp.loanDeductions + emp.salaryAdvanceDeductions).toLocaleString()}` : '0'}
                            </td>
                            <td className={`p-2 text-right font-mono ${emp.gosi > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              {emp.gosi > 0 ? `-${emp.gosi.toLocaleString()}` : '0'}
                            </td>
                            <td className={`p-2 text-right font-mono ${emp.otherDeductions > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                              {emp.otherDeductions > 0 ? `-${emp.otherDeductions.toLocaleString()}` : '0'}
                            </td>
                            <td className="p-2 text-right font-mono font-extrabold text-blue-700 text-xs">
                              {emp.netSalary.toLocaleString()} SAR
                            </td>
                            <td className="p-2 text-center space-x-1.5 print:hidden">
                              <button
                                onClick={() => setSelectedPayslip(emp)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors inline-block"
                              >
                                {isRtl ? 'كشف راتب' : 'Slip'}
                              </button>
                              
                              {activeRun.status === 'Draft' && (
                                <button
                                  onClick={() => handleOpenEdit(emp)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors inline-block"
                                >
                                  <Edit3 className="w-3 h-3 inline" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Dynamic Grand Totals Row */}
                      <tr className="bg-blue-50/60 font-black border-t-2 border-blue-200">
                        <td className="p-2 font-bold text-blue-900">
                          {isRtl ? 'إجمالي المبالغ والبدلات' : 'GRAND TOTALS'} ({totals.employeesCount} FTE)
                        </td>
                        <td className="p-2 text-right font-mono text-blue-900">{totals.basic.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-blue-900">-</td>
                        <td className="p-2 text-right font-mono text-blue-900">-</td>
                        <td className="p-2 text-right font-mono text-blue-900">{totals.allowances.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-green-800">+{totals.overtime.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-green-800">+{totals.bonuses.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-red-700">-{totals.loanDeductions.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-red-700">-{totals.gosi.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-red-700">-{totals.otherDeductions.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-blue-900 text-xs font-black">{totals.net.toLocaleString()} SAR</td>
                        <td className="p-2 print:hidden"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Print Footer Areas */}
                <div className="hidden print:grid grid-cols-4 gap-4 pt-12 text-center text-[10px] font-mono">
                  <div className="border-t pt-2 space-y-1">
                    <p className="font-bold text-gray-700">Prepared By</p>
                    <p className="text-gray-400">Payroll Audit Clerk</p>
                    <div className="h-6"></div>
                    <div className="border-b border-dashed w-3/4 mx-auto"></div>
                  </div>
                  <div className="border-t pt-2 space-y-1">
                    <p className="font-bold text-gray-700">Reviewed By</p>
                    <p className="text-gray-400">Finance Manager Sign</p>
                    <div className="h-6"></div>
                    <div className="border-b border-dashed w-3/4 mx-auto"></div>
                  </div>
                  <div className="border-t pt-2 space-y-1">
                    <p className="font-bold text-gray-700">Approved By</p>
                    <p className="text-gray-400">HR Director Approval</p>
                    <div className="h-6"></div>
                    <div className="border-b border-dashed w-3/4 mx-auto"></div>
                  </div>
                  <div className="border-t pt-2 space-y-1">
                    <p className="font-bold text-gray-700">Corporate Stamp Seal</p>
                    <div className="w-16 h-16 border-2 border-dashed border-blue-500 rounded-full mx-auto flex items-center justify-center text-[8px] text-blue-500 font-bold rotate-12">
                      AL-MANSOORI CO
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 text-center border rounded-xl space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{isRtl ? 'لم يتم العثور على أي مسير رواتب مفعل' : 'No Corporate Payroll Records Found'}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {isRtl ? 'الرجاء النقر على زر إنشاء مسير جديد لبدء معالجة رواتب الموظفين.' : 'Please process a new monthly register to initialize WPS-compliant payroll runs.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Loans features (untouched logic, highly polished design) */}
      {activeTab === 'loans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              {isRtl ? 'طلب قرض مالي / سلفة معجلة' : 'Request Personal Advance / Loan'}
            </h3>

            <form onSubmit={handleLoanSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 block">{isRtl ? 'قيمة القرض المطلوبة (ريال سعودي)' : 'Loan Amount (SAR)'}</label>
                <input
                  type="number"
                  required
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="e.g., 10000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600 block">{isRtl ? 'فترة السداد بالأشهر' : 'Repayment Period'}</label>
                <select
                  value={repaymentMonths}
                  onChange={(e) => setRepaymentMonths(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-700"
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months (2 Years)</option>
                </select>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-[10px] text-blue-800 space-y-1 font-mono">
                <span className="font-semibold block font-sans">{isRtl ? 'تفاصيل السداد الشهرية التقريبية:' : 'Est. Monthly Repayment Offsets:'}</span>
                <p>• {isRtl ? 'خصم شهري:' : 'Monthly Offset:'} {loanAmount ? Math.round(Number(loanAmount) / Number(repaymentMonths)) : 0} SAR</p>
                <p>• Interest Rate: 0% Interest-Free Corporate benefit</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
              >
                {isSubmitting ? (isRtl ? 'جاري الإرسال...' : 'Submitting...') : (isRtl ? 'إرسال طلب السلفة' : 'Request Loan')}
              </button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {isRtl ? 'إدارة ومتابعة السلف والقروض النشطة' : 'Active Personnel Loans & Installment Schedules'}
            </h3>

            {loans.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                {isRtl ? 'لا توجد قروض مسجلة حالياً.' : 'No loan accounts currently active.'}
              </p>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {loan.id}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-1">{loan.employeeName}</h4>
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5 font-mono">
                          <p>{isRtl ? 'إجمالي السلفة:' : 'Total Principal:'} <span className="font-bold text-gray-800">{loan.amount.toLocaleString()} SAR</span></p>
                          <p>{isRtl ? 'الرصيد المتبقي:' : 'Outstanding Balance:'} <span className="font-bold text-blue-700">{loan.outstandingBalance.toLocaleString()} SAR</span></p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                            loan.status === 'Active'
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : loan.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {loan.status}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-mono">
                          {loan.repaymentMonths} M repays ({loan.monthlyInstallment} SAR/M)
                        </p>
                      </div>
                    </div>

                    {loan.status === 'Active' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>{isRtl ? 'نسبة استرداد القرض' : 'Repayment Progress'}</span>
                          <span>{Math.round(((loan.amount - loan.outstandingBalance) / loan.amount) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-green-600 h-full rounded-full"
                            style={{ width: `${((loan.amount - loan.outstandingBalance) / loan.amount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {currentUser.role !== 'Employee' && (
                      <div className="flex gap-2 justify-end pt-2 border-t border-dashed">
                        {loan.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleLoanAction(loan.id, 'reject')}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleLoanAction(loan.id, 'approve')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                          </>
                        )}
                        {loan.status === 'Active' && (
                          <button
                            onClick={() => handleLoanAction(loan.id, 'suspend')}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer"
                          >
                            {isRtl ? 'تعليق الخصم' : 'Suspend Deductions'}
                          </button>
                        )}
                        {loan.status === 'Suspended' && (
                          <button
                            onClick={() => handleLoanAction(loan.id, 'resume')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-100 px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer"
                          >
                            {isRtl ? 'استئناف الخصم' : 'Resume Deductions'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP MODAL: Process New Month Register */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative space-y-4">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-gray-900 text-sm">
              {isRtl ? 'إنشاء مسير رواتب دوري جديد' : 'Process New Period Payroll'}
            </h3>
            <form onSubmit={handleGeneratePayroll} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-500">{isRtl ? 'شهر الاستحقاق:' : 'Target Month'}</label>
                <select
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:outline-none font-bold"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500">{isRtl ? 'سنة الاستحقاق:' : 'Target Year'}</label>
                <select
                  value={genYear}
                  onChange={(e) => setGenYear(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:outline-none font-bold"
                >
                  {['2026', '2027', '2028', '2029', '2030'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <p className="text-[10px] text-gray-400 italic">
                {isRtl 
                  ? 'سيتم تجميع كافة بيانات الموظفين النشطين تلقائياً مع ترحيل خصومات القروض والـ GOSI' 
                  : 'Active staff directory profiles will be cloned automatically to start this period.'}
              </p>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-xs cursor-pointer transition-all"
              >
                {isRtl ? 'بدء معالجة الدفعة' : 'Initialize Register'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Interactive Sign-off and Comments */}
      {showWorkflowCommentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative space-y-4">
            <button
              onClick={() => {
                setShowWorkflowCommentModal(false);
                setPendingWorkflowStep(null);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              {isRtl ? 'اعتماد التوقيع المعتمد' : 'Corporate Sign-off Verification'}
            </h3>
            
            <p className="text-xs text-gray-500">
              {isRtl 
                ? `أنت بصدد التوقيع كـ: ${currentUser.fullName} (${currentUser.role})` 
                : `Signing off step: ${pendingWorkflowStep} as ${currentUser.fullName} (${currentUser.role})`}
            </p>

            <div className="space-y-1 text-xs">
              <label className="text-gray-500 font-semibold">{isRtl ? 'ملاحظات وتوجيهات الاعتماد (اختياري):' : 'Audit comments / notes (optional):'}</label>
              <textarea
                value={workflowComment}
                onChange={(e) => setWorkflowComment(e.target.value)}
                placeholder="e.g. Audit matched, values checked."
                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-2 text-xs h-16 focus:outline-none"
              />
            </div>

            <button
              onClick={handleApproveWorkflowStep}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-xs cursor-pointer transition-all"
            >
              {isRtl ? 'تسجيل الاعتماد والتوقيع' : 'Commit digital stamp'}
            </button>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Draft Row Value Modifications */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative space-y-4">
            <button
              onClick={() => setEditItem(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-gray-900 text-sm">
              {isRtl ? 'تعديل مستحقات الموظف المباشرة' : 'Adjust Dynamic Earnings / Deductions'}
            </h3>
            <p className="text-xs text-gray-400 font-mono -mt-1">
              Employee: {editItem.employeeName} ({editItem.employeeId})
            </p>

            <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-gray-500 block">{isRtl ? 'العمل الإضافي (ريال):' : 'Overtime (SAR)'}</label>
                <input
                  type="number"
                  value={editOvertime}
                  onChange={(e) => setEditOvertime(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 block">{isRtl ? 'المكافآت (ريال):' : 'Bonuses (SAR)'}</label>
                <input
                  type="number"
                  value={editBonus}
                  onChange={(e) => setEditBonus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 block">{isRtl ? 'الحوافز (ريال):' : 'Incentives (SAR)'}</label>
                <input
                  type="number"
                  value={editIncentive}
                  onChange={(e) => setEditIncentive(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 block">{isRtl ? 'العمولات (ريال):' : 'Commissions (SAR)'}</label>
                <input
                  type="number"
                  value={editCommission}
                  onChange={(e) => setEditCommission(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 block">{isRtl ? 'بدلات أخرى (ريال):' : 'Other Allowances (SAR)'}</label>
                <input
                  type="number"
                  value={editOtherAllow}
                  onChange={(e) => setEditOtherAllow(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 block">{isRtl ? 'خصم السلفة (ريال):' : 'Salary Advances (SAR)'}</label>
                <input
                  type="number"
                  value={editAdvanceDed}
                  onChange={(e) => setEditAdvanceDed(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 focus:outline-none"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-gray-500 block">{isRtl ? 'استقطاعات أخرى (ريال):' : 'Other Deductions (SAR)'}</label>
                <input
                  type="number"
                  value={editOtherDed}
                  onChange={(e) => setEditOtherDed(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-xs cursor-pointer transition-all mt-2"
              >
                {isRtl ? 'حفظ التحديثات وإعادة الاحتساب' : 'Commit adjustments'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: High-Fidelity Portrait Payslip */}
      {selectedPayslip && activeRun && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-100 p-6 space-y-6 relative">
            <button
              onClick={() => setSelectedPayslip(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 print:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Payslip Print Container */}
            <div id="payslip-print-view" className="space-y-6 p-2">
              {/* Header Branding */}
              <div className="flex justify-between items-start border-b pb-4">
                <div className="space-y-1">
                  <h2 className="font-bold text-gray-900 text-base">AL-MANSOORI OPERATIONS & CO.</h2>
                  <p className="text-[10px] text-gray-400 font-mono">HQ: King Fahd Rd, Riyadh, Saudi Arabia</p>
                  <p className="text-[10px] text-gray-400 font-mono">WPS License Code: 10103445XX</p>
                </div>
                <div className="text-right space-y-1">
                  <h2 className="font-bold text-blue-700 text-sm uppercase">{isRtl ? 'كشف راتب رسمي' : 'OFFICIAL PAYSLIP'}</h2>
                  <p className="text-[10px] text-gray-700 font-mono font-bold">Payroll Month: {activeRun.month}/{activeRun.year}</p>
                  <p className="text-[10px] text-gray-400 font-mono">Status: {selectedPayslip.paymentStatus}</p>
                </div>
              </div>

              {/* Employee metadata details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-lg">
                <div className="space-y-1">
                  <p><span className="text-gray-400">{isRtl ? 'الموظف:' : 'Employee Name:'}</span> <span className="font-bold text-gray-800">{selectedPayslip.employeeName}</span></p>
                  <p><span className="text-gray-400">{isRtl ? 'الرقم الوظيفي:' : 'Employee ID:'}</span> <span className="font-mono text-gray-800 font-bold">{selectedPayslip.employeeId}</span></p>
                  <p><span className="text-gray-400">{isRtl ? 'المسمى الوظيفي:' : 'Position:'}</span> <span className="font-medium text-gray-700">{selectedPayslip.position}</span></p>
                  <p><span className="text-gray-400">{isRtl ? 'القسم:' : 'Department:'}</span> <span className="font-medium text-gray-700">{selectedPayslip.department}</span></p>
                </div>
                <div className="space-y-1">
                  <p><span className="text-gray-400">{isRtl ? 'الفرع:' : 'Branch:'}</span> <span className="font-medium">{selectedPayslip.branch}</span></p>
                  <p><span className="text-gray-400">{isRtl ? 'المشروع المعين:' : 'Project:'}</span> <span className="font-semibold text-blue-700">{selectedPayslip.project}</span></p>
                  <p><span className="text-gray-400">{isRtl ? 'نوع العقد:' : 'Contract:'}</span> <span className="font-medium">{selectedPayslip.employmentType}</span></p>
                  <p><span className="text-gray-400">{isRtl ? 'البنك / الآيبان:' : 'IBAN:'}</span> <span className="font-mono">SA8040001010XXXXXXXX</span></p>
                </div>
              </div>

              {/* Financial breakdowns */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                
                {/* Earnings */}
                <div className="space-y-2 border-r pr-6">
                  <h4 className="font-bold text-blue-700 border-b pb-1 uppercase text-[10px] tracking-wider">
                    {isRtl ? 'البدلات والمستحقات (Earnings)' : 'Allowances & Earnings'}
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-gray-700">
                      <span>{isRtl ? 'الراتب الأساسي' : 'Basic Salary'}</span>
                      <span>{selectedPayslip.basicSalary.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between font-mono text-gray-600">
                      <span>{isRtl ? 'بدل سكن' : 'Housing Allowance'}</span>
                      <span>{selectedPayslip.housingAllowance.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between font-mono text-gray-600">
                      <span>{isRtl ? 'بدل مواصلات' : 'Transport Allowance'}</span>
                      <span>{selectedPayslip.transportationAllowance.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between font-mono text-gray-600">
                      <span>{isRtl ? 'بدل اتصال/طعام' : 'Communication & Food'}</span>
                      <span>{(selectedPayslip.communicationAllowance + selectedPayslip.foodAllowance).toLocaleString()} SAR</span>
                    </div>
                    {selectedPayslip.otherAllowances > 0 && (
                      <div className="flex justify-between font-mono text-gray-600">
                        <span>{isRtl ? 'بدلات أخرى' : 'Other Allowance'}</span>
                        <span>{selectedPayslip.otherAllowances.toLocaleString()} SAR</span>
                      </div>
                    )}
                    {selectedPayslip.overtime > 0 && (
                      <div className="flex justify-between font-mono text-green-700">
                        <span>{isRtl ? 'العمل الإضافي' : 'Overtime Earnings'}</span>
                        <span>+{selectedPayslip.overtime.toLocaleString()} SAR</span>
                      </div>
                    )}
                    {(selectedPayslip.bonuses + selectedPayslip.incentives + selectedPayslip.commissions) > 0 && (
                      <div className="flex justify-between font-mono text-green-700">
                        <span>{isRtl ? 'المكافآت والحوافز' : 'Bonuses & Incentives'}</span>
                        <span>+{(selectedPayslip.bonuses + selectedPayslip.incentives + selectedPayslip.commissions).toLocaleString()} SAR</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black border-t pt-2 text-gray-800">
                      <span>{isRtl ? 'إجمالي المستحقات' : 'Gross Salary'}</span>
                      <span>{selectedPayslip.grossSalary.toLocaleString()} SAR</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <h4 className="font-bold text-red-600 border-b pb-1 uppercase text-[10px] tracking-wider">
                    {isRtl ? 'الاستقطاعات والخصومات (Deductions)' : 'Deductions & Offsets'}
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-gray-600">
                      <span>{isRtl ? 'استقطاع أقساط القروض' : 'Loan Repayments'}</span>
                      <span>{selectedPayslip.loanDeductions.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between font-mono text-gray-600">
                      <span>{isRtl ? 'سلف الراتب المعجلة' : 'Salary Advances'}</span>
                      <span>{selectedPayslip.salaryAdvanceDeductions.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between font-mono text-gray-600">
                      <span>{isRtl ? 'التأمينات الاجتماعية GOSI' : 'Social Insurance (GOSI)'}</span>
                      <span>{selectedPayslip.gosi.toLocaleString()} SAR</span>
                    </div>
                    {selectedPayslip.otherDeductions > 0 && (
                      <div className="flex justify-between font-mono text-gray-600">
                        <span>{isRtl ? 'خصومات غيابات أخرى' : 'Other Deductions'}</span>
                        <span>{selectedPayslip.otherDeductions.toLocaleString()} SAR</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black border-t pt-2 text-gray-800">
                      <span>{isRtl ? 'إجمالي الاستقطاعات' : 'Total Deductions'}</span>
                      <span>{(selectedPayslip.loanDeductions + selectedPayslip.salaryAdvanceDeductions + selectedPayslip.gosi + selectedPayslip.otherDeductions).toLocaleString()} SAR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net salary row badge */}
              <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center border border-blue-100">
                <div>
                  <span className="text-xs text-blue-800 font-bold block">{isRtl ? 'صافي المبلغ المحول للبنك:' : 'NET TRANSFER AMOUNT (SAR):'}</span>
                  <span className="text-[9px] text-blue-600 font-sans font-semibold">
                    {isRtl ? 'ملف حماية الأجور المعتمد بنظام سداد الموحد' : 'Registered with Saudi Central Bank WPS Network'}
                  </span>
                </div>
                <span className="text-lg lg:text-xl font-black text-blue-900 font-mono">
                  {selectedPayslip.netSalary.toLocaleString()} SAR
                </span>
              </div>

              {/* QR and Stamp area */}
              <div className="flex justify-between items-end pt-2 border-t text-[9px] text-gray-400 font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <span>WPS Digital Certificate Match Verified</span>
                  </div>
                  <p>Certificate: WPS-MANSOORI-{selectedPayslip.employeeId}-{activeRun.month}</p>
                  <p>Payment Date: {selectedPayslip.paymentDate || 'Pending final register lock'}</p>
                </div>

                {/* Inline high fidelity simulated vector QR */}
                <svg viewBox="0 0 100 100" className="w-16 h-16 border p-1 rounded bg-white">
                  <rect x="0" y="0" width="25" height="25" fill="black" />
                  <rect x="5" y="5" width="15" height="15" fill="white" />
                  <rect x="9" y="9" width="7" height="7" fill="black" />
                  <rect x="75" y="0" width="25" height="25" fill="black" />
                  <rect x="75" y="5" width="15" height="15" fill="white" />
                  <rect x="79" y="9" width="7" height="7" fill="black" />
                  <rect x="0" y="75" width="25" height="25" fill="black" />
                  <rect x="5" y="75" width="15" height="15" fill="white" />
                  <rect x="9" y="79" width="7" height="7" fill="black" />
                  <rect x="35" y="10" width="5" height="10" fill="black" />
                  <rect x="50" y="5" width="10" height="5" fill="black" />
                  <rect x="60" y="15" width="5" height="5" fill="black" />
                  <rect x="30" y="30" width="15" height="5" fill="black" />
                  <rect x="40" y="45" width="5" height="15" fill="black" />
                  <rect x="10" y="40" width="10" height="5" fill="black" />
                  <rect x="15" y="55" width="5" height="10" fill="black" />
                  <rect x="55" y="35" width="15" height="5" fill="black" />
                  <rect x="70" y="45" width="5" height="10" fill="black" />
                  <rect x="30" y="60" width="10" height="5" fill="black" />
                  <rect x="50" y="60" width="5" height="15" fill="black" />
                  <rect x="65" y="55" width="10" height="5" fill="black" />
                  <rect x="35" y="75" width="5" height="15" fill="black" />
                  <rect x="45" y="85" width="15" height="5" fill="black" />
                  <rect x="65" y="75" width="5" height="5" fill="black" />
                  <rect x="80" y="40" width="10" height="10" fill="black" />
                  <rect x="90" y="60" width="5" height="15" fill="black" />
                  <rect x="80" y="80" width="15" height="5" fill="black" />
                </svg>

                {/* Dashed Authorized Seal */}
                <div className="w-24 h-16 border-2 border-dashed border-blue-400 rounded flex flex-col items-center justify-center text-[7px] text-blue-500 font-bold rotate-6 bg-blue-50/20">
                  <span className="uppercase tracking-wider">Approved Seal</span>
                  <span>AL-MANSOORI CO</span>
                  <span className="text-[5px]">WPS Riyadh Finance</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-3 border-t print:hidden">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-1.5 rounded text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  logAuditAction('Payroll Printed', 'PDF Payslip', 1, activeRun.month, activeRun.year);
                  window.print();
                }}
                disabled={activeRun.status !== 'Locked'}
                title={activeRun.status !== 'Locked' ? 'Sign off workflow GM tier signature is required' : ''}
                className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                  activeRun.status === 'Locked'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                <Printer className="w-3.5 h-3.5" /> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
