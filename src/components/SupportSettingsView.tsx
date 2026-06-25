import React, { useState } from 'react';
import {
  Settings,
  HelpCircle,
  Building,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Clock,
  Briefcase,
  Layers,
  X
} from 'lucide-react';
import { SupportTicket, SystemSettings } from '../types';

interface SupportSettingsViewProps {
  state: {
    tickets: SupportTicket[];
    settings: SystemSettings;
  };
  currentUser: { id: string; fullName: string; role: string };
  isRtl: boolean;
  onRefresh: () => void;
}

export default function SupportSettingsView({ state, currentUser, isRtl, onRefresh }: SupportSettingsViewProps) {
  const { tickets, settings } = state;
  const [activeSubTab, setActiveSubTab] = useState<'tickets' | 'settings'>('tickets');

  // New Ticket states
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<'HR' | 'IT Support' | 'Finance' | 'Admin'>('IT Support');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolution states
  const [activeTicketForResolve, setActiveTicketForResolve] = useState<SupportTicket | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Settings states (backed by actual schema defaults!)
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currency, setCurrency] = useState(settings.currency);
  const [otRegular, setOtRegular] = useState(String(settings.basicOvertimeRate));
  const [otHoliday, setOtHoliday] = useState(String(settings.holidayOvertimeRate));
  const [newBranch, setNewBranch] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newPosition, setNewPosition] = useState('');

  // Submit support ticket
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: ticketCategory,
          title: ticketTitle,
          description: ticketDesc,
          employeeId: currentUser.id,
          employeeName: currentUser.fullName,
          priority: ticketPriority
        })
      });

      if (!res.ok) throw new Error('Ticket creation failed');
      onRefresh();
      setShowTicketModal(false);
      setTicketTitle('');
      setTicketDesc('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve Ticket
  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketForResolve || !resolutionText) return;

    try {
      const res = await fetch(`/api/tickets/${activeTicketForResolve.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionText,
          resolvedBy: currentUser.fullName
        })
      });

      if (!res.ok) throw new Error('Failed to resolve support ticket');
      onRefresh();
      setActiveTicketForResolve(null);
      setResolutionText('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit system settings updates
  const handleSettingsSave = async (updatedFields: any) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });

      if (!res.ok) throw new Error('Configuration save failed');
      onRefresh();
      alert('Settings saved dynamically!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addBranch = () => {
    if (!newBranch.trim()) return;
    const branches = [...settings.branches, newBranch.trim()];
    handleSettingsSave({ branches });
    setNewBranch('');
  };

  const removeBranch = (b: string) => {
    const branches = settings.branches.filter((item) => item !== b);
    handleSettingsSave({ branches });
  };

  const addDept = () => {
    if (!newDept.trim()) return;
    const depts = [...settings.departments, newDept.trim()];
    handleSettingsSave({ departments: depts });
    setNewDept('');
  };

  const addPosition = () => {
    if (!newPosition.trim()) return;
    const positions = [...settings.positions, newPosition.trim()];
    handleSettingsSave({ positions });
    setNewPosition('');
  };

  const visibleTickets = currentUser.role === 'Employee'
    ? tickets.filter((t) => t.employeeId === currentUser.id)
    : tickets;

  return (
    <div id="support_settings_view" className="space-y-6">
      {/* Sub tabs */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-sm">
        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'tickets' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'مركز التذاكر والدعم' : 'IT/HR Helpdesk Desk'}
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'settings' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'إعدادات المنصة المتقدمة' : 'Platform Settings'}
        </button>
      </div>

      {activeSubTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-wrap gap-2">
            <div>
              <h4 className="font-semibold text-gray-800 text-xs">{isRtl ? 'بوابة التذاكر والدعم الذاتي للموظفين' : 'Self-Service Employee Operations Helpdesk'}</h4>
              <p className="text-[10px] text-gray-500">Log HR queries, payroll complaints, IT faults, or vehicle issues</p>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs cursor-pointer shadow-sm"
            >
              {isRtl ? 'فتح تذكرة جديدة' : 'Open Ticket'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleTickets.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {t.id}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1.5">{t.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{t.category} • {isRtl ? 'مرسل:' : 'By:'} {t.employeeName}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      t.status === 'Resolved'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-100">
                  {t.description}
                </p>

                {t.resolutionText && (
                  <div className="bg-green-50/50 p-2.5 rounded border border-green-100 text-xs text-green-800 font-sans">
                    <p className="font-semibold">{isRtl ? 'حل التذكرة المعتمد:' : 'Verified SLA Resolution:'}</p>
                    <p className="text-[11px] mt-0.5">"{t.resolutionText}"</p>
                    <p className="text-[9px] text-green-600 mt-1 font-mono">Resolved by: {t.assignedToName}</p>
                  </div>
                )}

                {t.status === 'Open' && currentUser.role !== 'Employee' && (
                  <div className="flex justify-end pt-2 border-t border-dashed">
                    <button
                      onClick={() => setActiveTicketForResolve(t)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded text-[10px] cursor-pointer"
                    >
                      {isRtl ? 'حل وإغلاق التذكرة' : 'Resolve Ticket'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 border-b pb-2">
              <Building className="w-4 h-4 text-blue-600" />
              {isRtl ? 'تسمية وبيانات الشركة' : 'Company Branding & Locales'}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'اسم المنشأة التجاري' : 'Company Brand Name'}</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'العملة المعيارية' : 'Accounting Currency'}</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={() => handleSettingsSave({ companyName, currency })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-xs cursor-pointer"
              >
                Save Meta
              </button>
            </div>
          </div>

          {/* Overtimes / Allowances */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 border-b pb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              {isRtl ? 'معامل ساعات العمل الإضافي والبدلات' : 'Wages & Overtimes'}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'مضاعف الإضافي في الأيام العادية' : 'Regular Overtime Multiplier'}</label>
                <input
                  type="number"
                  step="0.05"
                  value={otRegular}
                  onChange={(e) => setOtRegular(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'مضاعف الإضافي في العطلات الرسمية' : 'Holiday Overtime Multiplier'}</label>
                <input
                  type="number"
                  step="0.05"
                  value={otHoliday}
                  onChange={(e) => setOtHoliday(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={() =>
                  handleSettingsSave({
                    basicOvertimeRate: Number(otRegular),
                    holidayOvertimeRate: Number(otHoliday)
                  })
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-xs cursor-pointer"
              >
                Save Rates
              </button>
            </div>
          </div>

          {/* Low code list extensions */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 border-b pb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              {isRtl ? 'تمديد الهياكل الإدارية (الفروع)' : 'Company Structures'}
            </h3>

            <div className="space-y-4 text-xs">
              {/* Branches */}
              <div className="space-y-2">
                <label className="font-semibold text-gray-700">{isRtl ? 'إدارة الفروع والمكاتب الميدانية:' : 'Corporate Branches:'}</label>
                <div className="flex flex-wrap gap-1.5">
                  {settings.branches.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1 text-[10px] bg-gray-100 hover:bg-red-50 hover:text-red-700 px-2.5 py-1 rounded-full border border-gray-200 cursor-pointer transition-colors"
                      onClick={() => removeBranch(b)}
                    >
                      {b} <Trash2 className="w-2.5 h-2.5 shrink-0" />
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    placeholder="e.g., Jeddah Central"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                  <button
                    onClick={addBranch}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Create Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-700 text-white">
              <h3 className="font-bold text-sm">{isRtl ? 'طلب تذكرة دعم داخلي جديدة' : 'Open Operational Support Ticket'}</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-white hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'نوع الدعم المطلوب' : 'Category'}</label>
                  <select
                    value={ticketCategory}
                    onChange={(e: any) => setTicketCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="IT Support">IT Support (Laptops, email, locks)</option>
                    <option value="HR">HR Query (Iqama renewal, leave adjustment)</option>
                    <option value="Finance">Finance Query (Advance loan query, slips)</option>
                    <option value="Admin">Admin Facilities</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'الأولوية والأهمية' : 'SLA Priority'}</label>
                  <select
                    value={ticketPriority}
                    onChange={(e: any) => setTicketPriority(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency SLA</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'موضوع المشكلة بالتفصيل' : 'Ticket Subject *'}</label>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="e.g., Unable to sync biometric clock in NEOM base"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'الشرح التفصيلي للخلل' : 'Comprehensive Description *'}</label>
                <textarea
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Elaborate symptoms or administrative discrepancies..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  Open Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Resolve Modal */}
      {activeTicketForResolve && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-700 text-white">
              <h3 className="font-bold text-sm">{isRtl ? 'تقديم حل وإغلاق تذكرة الدعم' : 'Resolve Support Ticket'}</h3>
              <button onClick={() => setActiveTicketForResolve(null)} className="text-white hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveTicket} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'وصف تفصيلي للحل المعتمد:' : 'SLA Resolution Steps *'}</label>
                <textarea
                  required
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Detail action steps, e.g., Reset router config or adjusted GOSI bracket..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setActiveTicketForResolve(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  Resolve & Close Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
