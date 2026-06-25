import React, { useState } from 'react';
import {
  DollarSign,
  FileText,
  Percent,
  CheckCircle,
  Clock,
  Printer,
  X,
  CreditCard,
  Plus,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Employee, Loan } from '../types';

interface PayrollLoanViewProps {
  employees: Employee[];
  loans: Loan[];
  currentUser: { id: string; fullName: string; role: string };
  isRtl: boolean;
  onRefresh: () => void;
}

export default function PayrollLoanView({ employees, loans, currentUser, isRtl, onRefresh }: PayrollLoanViewProps) {
  const [activeTab, setActiveTab] = useState<'payroll' | 'loans'>('payroll');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [payslipEmployee, setPayslipEmployee] = useState<Employee | null>(null);

  // Loan Request Form States
  const [loanAmount, setLoanAmount] = useState('');
  const [repaymentMonths, setRepaymentMonths] = useState('12');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeEmployees = employees.filter((e) => e.status === 'Active' || e.status === 'On Leave');

  // Find loans for employee
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

      if (!res.ok) throw new Error('Loan request submission failed');
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

      if (!res.ok) throw new Error('Action execution failed');
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Open Payslip helper
  const handleOpenPayslip = (emp: Employee) => {
    setPayslipEmployee(emp);
    setShowPayslipModal(true);
  };

  // Calculate payslip data
  const calculatePayslipData = (emp: Employee) => {
    const activeLoan = getEmployeeActiveLoan(emp.id);
    const loanDeduction = activeLoan ? activeLoan.monthlyInstallment : 0;
    const basic = emp.basicSalary;
    const housing = emp.housingAllowance;
    const transport = emp.transportationAllowance;
    const comm = emp.communicationAllowance;
    const food = emp.foodAllowance;

    // GOSI deduction (simulated 9.75% for Saudi citizens on Basic + Housing)
    const isSaudi = emp.nationality === 'Saudi Arabia';
    const gosiBasis = basic + housing;
    const gosiDeduction = isSaudi ? Math.round(gosiBasis * 0.0975) : 0;

    const totalEarnings = basic + housing + transport + comm + food;
    const totalDeductions = loanDeduction + gosiDeduction;
    const netSalary = totalEarnings - totalDeductions;

    return {
      basic,
      housing,
      transport,
      comm,
      food,
      totalEarnings,
      loanDeduction,
      gosiDeduction,
      totalDeductions,
      netSalary
    };
  };

  return (
    <div id="payroll_loan_view" className="space-y-6">
      {/* Sub tabs */}
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
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {isRtl ? 'مسير رواتب الموظفين الدوري' : 'Employee Corporate Payroll Sheet'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isRtl
                  ? 'يتم احتساب البدلات واستقطاعات القروض تلقائياً طبقاً لنظام حماية الأجور (WPS)'
                  : 'Automated gross earnings computation & loan offsets in compliance with GCC Wage Protection System'}
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-full border border-blue-100">
              {isRtl ? 'حالة المسير: معتمد ونشط' : 'Active WPS Register'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-semibold">
                  <th className="p-3 text-gray-500">{isRtl ? 'الموظف' : 'Employee'}</th>
                  <th className="p-3 text-gray-500">{isRtl ? 'الراتب الأساسي' : 'Basic'}</th>
                  <th className="p-3 text-gray-500">{isRtl ? 'بدل سكن' : 'Housing'}</th>
                  <th className="p-3 text-gray-500">{isRtl ? 'بدل نقل' : 'Transport'}</th>
                  <th className="p-3 text-gray-500">{isRtl ? 'أخرى/اتصال' : 'Other'}</th>
                  <th className="p-3 text-gray-500">{isRtl ? 'استقطاع السلفة' : 'Loan Ded.'}</th>
                  <th className="p-3 text-gray-500">{isRtl ? 'إجمالي Earnings' : 'Gross Pay'}</th>
                  <th className="p-3 text-gray-500">{isRtl ? 'صافي الراتب' : 'Net Salary'}</th>
                  <th className="p-3 text-center text-gray-500">{isRtl ? 'مسير الدفع' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeEmployees.map((emp) => {
                  const pay = calculatePayslipData(emp);

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/50">
                      <td className="p-3">
                        <p className="font-semibold text-gray-900">{emp.fullName}</p>
                        <span className="text-[10px] font-mono text-gray-400">{emp.id} • {emp.position}</span>
                      </td>
                      <td className="p-3 font-mono">{pay.basic.toLocaleString()}</td>
                      <td className="p-3 font-mono text-gray-500">{pay.housing.toLocaleString()}</td>
                      <td className="p-3 font-mono text-gray-500">{pay.transport.toLocaleString()}</td>
                      <td className="p-3 font-mono text-gray-500">{(pay.comm + pay.food).toLocaleString()}</td>
                      <td className={`p-3 font-mono ${pay.loanDeduction > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                        {pay.loanDeduction > 0 ? `-${pay.loanDeduction.toLocaleString()}` : '0'}
                      </td>
                      <td className="p-3 font-mono font-semibold text-gray-800">{pay.totalEarnings.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-blue-700">{pay.netSalary.toLocaleString()} SAR</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleOpenPayslip(emp)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          {isRtl ? 'عرض المسير / كشف' : 'Generate Payslip'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit Loan Request Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              {isRtl ? 'طلب قرض مالي / سلفة معجلة' : 'Request Personal Advance / Loan'}
            </h3>

            <form onSubmit={handleLoanSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 block">{isRtl ? 'قيمة السلفة المطلوبة (ريال سعودي)' : 'Loan Amount (SAR)'}</label>
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

          {/* Active Loans list */}
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

                    {/* Progress tracking bar */}
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

                    {/* Approver Action Panel */}
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

      {/* Payslip Generator High-Fidelity Modal */}
      {showPayslipModal && payslipEmployee && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-100 p-6 space-y-6 relative">
            <button
              onClick={() => setShowPayslipModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Print Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div className="space-y-1">
                <h2 className="font-bold text-gray-900 text-base">AL-MANSOORI OPERATIONS CO.</h2>
                <p className="text-[10px] text-gray-500 font-mono">HQ: King Fahd Rd, Riyadh, Saudi Arabia</p>
                <p className="text-[10px] text-gray-500 font-mono">WPS License: 10103445XX</p>
              </div>
              <div className="text-right space-y-1">
                <h2 className="font-bold text-blue-700 text-base">{isRtl ? 'كشف راتب رسمي' : 'OFFICIAL PAYSLIP'}</h2>
                <p className="text-[10px] text-gray-400 font-mono">{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Employee info grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-lg">
              <div className="space-y-1.5">
                <p><span className="text-gray-400">{isRtl ? 'اسم الموظف:' : 'Employee Name:'}</span> <span className="font-bold text-gray-800">{payslipEmployee.fullName}</span></p>
                <p><span className="text-gray-400">{isRtl ? 'الرقم الوظيفي:' : 'Employee ID:'}</span> <span className="font-bold font-mono text-gray-800">{payslipEmployee.id}</span></p>
                <p><span className="text-gray-400">{isRtl ? 'المسمى الوظيفي:' : 'Designation:'}</span> <span className="font-semibold">{payslipEmployee.position}</span></p>
              </div>
              <div className="space-y-1.5">
                <p><span className="text-gray-400">{isRtl ? 'البنك / الآيبان:' : 'Bank/IBAN:'}</span> <span className="font-bold font-mono">SA8040001010XXXXXXXX</span></p>
                <p><span className="text-gray-400">{isRtl ? 'الهوية / الإقامة:' : 'Iqama/National ID:'}</span> <span className="font-bold font-mono">{payslipEmployee.nationalId}</span></p>
                <p><span className="text-gray-400">{isRtl ? 'المشروع المعين:' : 'Assigned Project:'}</span> <span className="font-semibold text-blue-700">{payslipEmployee.projectAssignment}</span></p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              {/* Earnings */}
              <div className="space-y-2 border-r pr-6">
                <h4 className="font-bold text-gray-800 border-b pb-1 uppercase text-[10px] tracking-wider text-blue-700">
                  {isRtl ? 'البدلات والمستحقات (Earnings)' : 'Earnings & Allowances'}
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono">
                    <span>{isRtl ? 'الراتب الأساسي' : 'Basic Salary'}</span>
                    <span>{calculatePayslipData(payslipEmployee).basic.toLocaleString()} SAR</span>
                  </div>
                  <div className="flex justify-between font-mono text-gray-600">
                    <span>{isRtl ? 'بدل سكن' : 'Housing Allowance'}</span>
                    <span>{calculatePayslipData(payslipEmployee).housing.toLocaleString()} SAR</span>
                  </div>
                  <div className="flex justify-between font-mono text-gray-600">
                    <span>{isRtl ? 'بدل مواصلات' : 'Transport Allowance'}</span>
                    <span>{calculatePayslipData(payslipEmployee).transport.toLocaleString()} SAR</span>
                  </div>
                  <div className="flex justify-between font-mono text-gray-600">
                    <span>{isRtl ? 'بدل اتصال وتواصل' : 'Communication Allow.'}</span>
                    <span>{calculatePayslipData(payslipEmployee).comm.toLocaleString()} SAR</span>
                  </div>
                  <div className="flex justify-between font-mono text-gray-600">
                    <span>{isRtl ? 'بدل إعاشة وطعام' : 'Food Allowance'}</span>
                    <span>{calculatePayslipData(payslipEmployee).food.toLocaleString()} SAR</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2.5 text-gray-800">
                    <span>{isRtl ? 'إجمالي المستحقات' : 'Total Earnings'}</span>
                    <span>{calculatePayslipData(payslipEmployee).totalEarnings.toLocaleString()} SAR</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-800 border-b pb-1 uppercase text-[10px] tracking-wider text-red-600">
                  {isRtl ? 'الاستقطاعات والخصومات (Deductions)' : 'Deductions & Offsets'}
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-gray-600">
                    <span>{isRtl ? 'خصم أقساط القروض' : 'Loan Repay Offset'}</span>
                    <span>{calculatePayslipData(payslipEmployee).loanDeduction.toLocaleString()} SAR</span>
                  </div>
                  <div className="flex justify-between font-mono text-gray-600">
                    <span>{isRtl ? 'المؤسسة العامة للتأمينات (GOSI)' : 'Social Insurance (GOSI)'}</span>
                    <span>{calculatePayslipData(payslipEmployee).gosiDeduction.toLocaleString()} SAR</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2.5 text-gray-800">
                    <span>{isRtl ? 'إجمالي الاستقطاعات' : 'Total Deductions'}</span>
                    <span>{calculatePayslipData(payslipEmployee).totalDeductions.toLocaleString()} SAR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Row */}
            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center border border-blue-100">
              <div>
                <span className="text-xs text-blue-800 font-bold block">{isRtl ? 'صافي المبلغ المحول للبنك:' : 'NET TRANSFER AMOUNT (SAR):'}</span>
                <span className="text-[10px] text-blue-600 font-sans">{isRtl ? 'طبقاً لملف حماية الأجور المعتمد بنظام سداد الموحد' : 'Registered with Saudi Central Bank WPS Network'}</span>
              </div>
              <span className="text-xl font-black text-blue-900 font-mono">
                {calculatePayslipData(payslipEmployee).netSalary.toLocaleString()} SAR
              </span>
            </div>

            {/* WPS Certificate Footnote */}
            <div className="flex justify-between items-center pt-2 text-[9px] text-gray-400 font-mono">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span>WPS Digital Certificate Match Verified</span>
              </div>
              <span>Print Date: {new Date().toLocaleDateString()}</span>
            </div>

            {/* Action Tray */}
            <div className="flex gap-2 justify-end pt-2 border-t">
              <button
                onClick={() => setShowPayslipModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
