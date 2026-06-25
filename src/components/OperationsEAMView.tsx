import React, { useState } from 'react';
import {
  Wrench,
  Truck,
  Droplet,
  FileText,
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle,
  TrendingDown,
  Activity,
  MapPin,
  X
} from 'lucide-react';
import { Equipment, Vehicle, MaintenanceWorkOrder, FuelLog, SparePart } from '../types';

interface OperationsEAMViewProps {
  state: {
    equipment: Equipment[];
    vehicles: Vehicle[];
    workOrders: MaintenanceWorkOrder[];
    fuelLogs: FuelLog[];
    spareParts: SparePart[];
  };
  isRtl: boolean;
  onRefresh: () => void;
}

export default function OperationsEAMView({ state, isRtl, onRefresh }: OperationsEAMViewProps) {
  const { equipment, vehicles, workOrders, fuelLogs, spareParts } = state;
  const [activeSubTab, setActiveSubTab] = useState<'machinery' | 'fleet' | 'maintenance' | 'fuel'>('machinery');

  // Work Order Form States
  const [showWOModal, setShowWOModal] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState(equipment[0]?.id || '');
  const [woType, setWoType] = useState<'Preventive' | 'Corrective' | 'Overhaul'>('Preventive');
  const [woDesc, setWoDesc] = useState('');
  const [woPriority, setWoPriority] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');
  const [woTech, setWoTech] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fuel Form States
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelTargetType, setFuelTargetType] = useState<'Equipment' | 'Vehicle'>('Equipment');
  const [fuelTargetId, setFuelTargetId] = useState('');
  const [fuelType, setFuelType] = useState<'Diesel' | 'Petrol' | 'Octane 91' | 'Octane 95'>('Diesel');
  const [fuelQty, setFuelQty] = useState('');
  const [fuelCost, setFuelCost] = useState('4.5'); // Default cost per liter
  const [fuelOperator, setFuelOperator] = useState('');
  const [fuelLocation, setFuelLocation] = useState('');

  // Selected work order for detailing/advancing status
  const [activeWOForUpdate, setActiveWOForUpdate] = useState<MaintenanceWorkOrder | null>(null);
  const [nextWOStatus, setNextWOStatus] = useState<string>('');
  const [consumedPartId, setConsumedPartId] = useState('');
  const [consumedPartQty, setConsumedPartQty] = useState('');

  // Submit Work Order
  const handleWOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!woDesc) return;

    setIsSubmitting(true);
    try {
      const selectedEq = equipment.find((eq) => eq.id === selectedEqId);

      const res = await fetch('/api/workorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: selectedEqId,
          equipmentName: selectedEq ? selectedEq.name : 'Unknown Equipment',
          type: woType,
          description: woDesc,
          priority: woPriority,
          assignedTechnician: woTech
        })
      });

      if (!res.ok) throw new Error('Failed to open maintenance work order');
      onRefresh();
      setShowWOModal(false);
      setWoDesc('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Fuel Log
  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelTargetId || !fuelQty) return;

    setIsSubmitting(true);
    try {
      let targetName = 'Unknown Target';
      if (fuelTargetType === 'Equipment') {
        targetName = equipment.find((e) => e.id === fuelTargetId)?.name || 'Unknown Machinery';
      } else {
        const matchingVehicle = vehicles.find((v) => v.id === fuelTargetId);
        targetName = matchingVehicle ? `${matchingVehicle.brand} ${matchingVehicle.model}` : 'Unknown Vehicle';
      }

      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: fuelTargetId,
          targetName,
          targetType: fuelTargetType,
          fuelType,
          quantityLiters: Number(fuelQty),
          unitCost: Number(fuelCost),
          operatorName: fuelOperator || 'Station Dispatcher',
          location: fuelLocation || 'Riyadh Depot'
        })
      });

      if (!res.ok) throw new Error('Fuel logging failed');
      onRefresh();
      setShowFuelModal(false);
      setFuelQty('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Work Order Workflow status (Open -> Assigned -> Completed -> Closed)
  const handleUpdateWOStatus = async (woId: string, status: string) => {
    try {
      const payload: any = { status };
      if (status === 'Completed' || status === 'Closed') {
        payload.cost = 1200; // Estimated random cost
        if (consumedPartId && consumedPartQty) {
          const matchedPart = spareParts.find((sp) => sp.id === consumedPartId);
          payload.partsConsumed = [
            {
              partId: consumedPartId,
              partName: matchedPart ? matchedPart.name : 'Spare Part',
              quantity: Number(consumedPartQty)
            }
          ];
        }
      }

      const res = await fetch(`/api/workorders/${woId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Work order workflow update failed');
      onRefresh();
      setActiveWOForUpdate(null);
      setConsumedPartId('');
      setConsumedPartQty('');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div id="operations_eam_view" className="space-y-6">
      {/* Tab bar */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-lg">
        <button
          onClick={() => setActiveSubTab('machinery')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'machinery' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'المعدات الثقيلة' : 'Heavy Machinery'}
        </button>
        <button
          onClick={() => setActiveSubTab('fleet')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'fleet' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'أسطول السيارات' : 'Fleet Vehicles'}
        </button>
        <button
          onClick={() => setActiveSubTab('maintenance')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'maintenance' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'أوامر الصيانة (Work Orders)' : 'Work Orders'}
        </button>
        <button
          onClick={() => setActiveSubTab('fuel')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'fuel' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'سجل المحروقات (Fuel)' : 'Fuel Logistics'}
        </button>
      </div>

      {activeSubTab === 'machinery' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm">{isRtl ? 'أصول الآليات الثقيلة المسجلة' : 'Heavy Machinery Asset Directory'}</h3>
            <span className="text-xs text-gray-500">Count: {equipment.length} assets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {equipment.map((eq) => (
              <div key={eq.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {eq.id}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{eq.name}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      eq.status === 'Active'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : eq.status === 'Under Maintenance'
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-100 animate-pulse'
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                  >
                    {eq.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1.5 border-t pt-3">
                  <div className="flex justify-between">
                    <span>{isRtl ? 'المشروع الحالي:' : 'Assigned Project:'}</span>
                    <span className="font-semibold text-blue-700">{eq.assignedProject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isRtl ? 'ساعات التشغيل:' : 'Operating Hours:'}</span>
                    <span className="font-mono font-semibold">{eq.operatingHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isRtl ? 'المشغل المكلف:' : 'Assigned Operator:'}</span>
                    <span className="font-medium">{eq.assignedOperator}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono border-t pt-2">
                  <span>S/N: {eq.serialNumber}</span>
                  <span>Serviced: {eq.lastServiceDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm">{isRtl ? 'سجل السيارات والحافلات المسجل' : 'Commercial Fleet Vehicle Registry'}</h3>
            <span className="text-xs text-gray-500">Count: {vehicles.length} fleets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {v.plateNumber}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{v.brand} {v.model}</h4>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{v.type}</span>
                </div>

                <div className="text-xs text-gray-600 space-y-1.5 border-t pt-3 font-mono">
                  <p><span className="text-gray-400 font-sans">{isRtl ? 'السائق المكلف:' : 'Assigned Driver:'}</span> <span className="font-semibold">{v.assignedDriver}</span></p>
                  <p><span className="text-gray-400 font-sans">{isRtl ? 'المسافة المقطوعة:' : 'Current Odometer:'}</span> <span className="font-bold">{v.mileage.toLocaleString()} km</span></p>
                  <p><span className="text-gray-400 font-sans">{isRtl ? 'تاريخ الاستمارة:' : 'Reg. Expiry:'}</span> <span className="text-amber-700">{v.registrationExpiry}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-wrap gap-2">
            <div>
              <h4 className="font-semibold text-gray-800 text-xs">{isRtl ? 'أوامر الصيانة والتحقق المفتوحة' : 'Machinery Repairs & PM Work Orders'}</h4>
              <p className="text-[10px] text-gray-500">Track corrective and scheduled preventive service pipelines</p>
            </div>
            <button
              onClick={() => setShowWOModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isRtl ? 'فتح أمر صيانة عاجل' : 'Create Work Order'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {workOrders.map((wo) => (
              <div key={wo.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {wo.id}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{wo.equipmentName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{wo.type} • {isRtl ? 'الأولوية:' : 'Priority:'} <span className="font-bold text-red-600">{wo.priority}</span></p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      wo.status === 'Completed' || wo.status === 'Closed'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                    }`}
                  >
                    {wo.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-100">
                  {wo.description}
                </p>

                <div className="flex justify-between text-xs text-gray-500 font-mono border-t pt-3">
                  <span>{isRtl ? 'الفني المكلف:' : 'Technician:'} {wo.assignedTechnician}</span>
                  <span>{isRtl ? 'التكلفة:' : 'Service Cost:'} {wo.cost} SAR</span>
                </div>

                {wo.status !== 'Completed' && wo.status !== 'Closed' && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-dashed">
                    <button
                      onClick={() => {
                        setActiveWOForUpdate(wo);
                        setNextWOStatus('Completed');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-1.5 rounded text-[10px] cursor-pointer"
                    >
                      {isRtl ? 'إكمال الإجراء' : 'Complete & Close Service'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'fuel' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-wrap gap-2">
            <div>
              <h4 className="font-semibold text-gray-800 text-xs">{isRtl ? 'تتبع وصرف وقود المعدات والمواقع' : 'Enterprise Fuel Dispatch & Log Tracking'}</h4>
              <p className="text-[10px] text-gray-500">Log heavy vehicle refuel transactions and link costs directly to active projects</p>
            </div>
            <button
              onClick={() => setShowFuelModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Droplet className="w-4 h-4 text-white" />
              {isRtl ? 'صرف وقود فوري' : 'Log Fuel Dispatch'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-semibold">
                    <th className="p-3 text-gray-500">{isRtl ? 'رقم السجل' : 'Log ID'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'المعدة المستفيدة' : 'Target Asset'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'النوع' : 'Type'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'الكمية (لتر)' : 'Quantity (Liters)'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'تكلفة اللتر' : 'Unit Cost'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'الإجمالي (ريال سعودي)' : 'Total Cost'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th className="p-3 text-gray-500">{isRtl ? 'المسؤول' : 'Dispatcher'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono text-[11px]">
                  {fuelLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="p-3 text-gray-400">{log.id}</td>
                      <td className="p-3 font-sans font-bold text-gray-900">{log.targetName}</td>
                      <td className="p-3 font-sans text-gray-500">{log.fuelType}</td>
                      <td className="p-3 font-bold">{log.quantityLiters} L</td>
                      <td className="p-3 text-gray-400">{log.unitCost} SAR</td>
                      <td className="p-3 font-bold text-blue-700">{log.totalCost.toLocaleString()} SAR</td>
                      <td className="p-3 text-gray-500">{log.date}</td>
                      <td className="p-3 font-sans text-gray-600">{log.operatorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Log Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-700 text-white">
              <h3 className="font-bold text-sm">{isRtl ? 'صرف وتسجيل وقود ميداني' : 'Log Fuel Consumption'}</h3>
              <button onClick={() => setShowFuelModal(false)} className="text-white hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFuelSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'تصنيف الأصل المستهلك' : 'Target Type'}</label>
                  <select
                    value={fuelTargetType}
                    onChange={(e: any) => {
                      setFuelTargetType(e.target.value);
                      setFuelTargetId('');
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Equipment">Heavy Equipment</option>
                    <option value="Vehicle">Fleet Vehicle</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'اسم الألية / السيارة' : 'Target Asset'}</label>
                  <select
                    value={fuelTargetId}
                    onChange={(e) => setFuelTargetId(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-gray-700"
                  >
                    <option value="">Select Asset...</option>
                    {fuelTargetType === 'Equipment'
                      ? equipment.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.id} - {e.name}
                          </option>
                        ))
                      : vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.plateNumber} - {v.brand} {v.model}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-gray-700">{isRtl ? 'الكمية بالألتار' : 'Quantity Liters *'}</label>
                  <input
                    type="number"
                    required
                    value={fuelQty}
                    onChange={(e) => setFuelQty(e.target.value)}
                    placeholder="e.g., 200"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'النوع' : 'Fuel Type'}</label>
                  <select
                    value={fuelType}
                    onChange={(e: any) => setFuelType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none text-gray-700"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Octane 91">Octane 91</option>
                    <option value="Octane 95">Octane 95</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'تكلفة اللتر الواحدة' : 'Unit Cost (SAR/L)'}</label>
                  <input
                    type="number"
                    required
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'الموقع' : 'Location'}</label>
                  <input
                    type="text"
                    value={fuelLocation}
                    onChange={(e) => setFuelLocation(e.target.value)}
                    placeholder="e.g., NEOM Site Base"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'اسم المشغل المكلف' : 'Dispatcher Name'}</label>
                <input
                  type="text"
                  value={fuelOperator}
                  onChange={(e) => setFuelOperator(e.target.value)}
                  placeholder="e.g., Faisal Ahmed Al-Harbi"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Order Opening Modal */}
      {showWOModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-700 text-white">
              <h3 className="font-bold text-sm">{isRtl ? 'فتح أمر صيانة وتصليح آليات' : 'Open Repair Work Order'}</h3>
              <button onClick={() => setShowWOModal(false)} className="text-white hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWOSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'المعدة المستفيدة' : 'Target Machine'}</label>
                  <select
                    value={selectedEqId}
                    onChange={(e) => setSelectedEqId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-gray-700"
                  >
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.id} - {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'نوع الصيانة' : 'Service Type'}</label>
                  <select
                    value={woType}
                    onChange={(e: any) => setWoType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-gray-700"
                  >
                    <option value="Preventive">Preventive Maintenance (PM)</option>
                    <option value="Corrective">Corrective Repair</option>
                    <option value="Overhaul">Overhaul Service</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">{isRtl ? 'توصيف الأعطال / الأعمال المطلوبة' : 'Fault Description / Service scope *'}</label>
                <textarea
                  required
                  value={woDesc}
                  onChange={(e) => setWoDesc(e.target.value)}
                  placeholder="Detail symptoms, leaked oils, or physical damages..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'الأولوية التنفيذية' : 'Priority'}</label>
                  <select
                    value={woPriority}
                    onChange={(e: any) => setWoPriority(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-gray-700"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency Downtime</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'الفني المعين' : 'Assigned Technician'}</label>
                  <input
                    type="text"
                    required
                    value={woTech}
                    onChange={(e) => setWoTech(e.target.value)}
                    placeholder="e.g., Faisal Ahmed Al-Harbi"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowWOModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  Open Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete/Close Work Order details modal (consumed spare parts picker) */}
      {activeWOForUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-700 text-white">
              <h3 className="font-bold text-sm">{isRtl ? 'توثيق قطع الغيار وتكاليف الصيانة' : 'Complete Work Order'}</h3>
              <button onClick={() => setActiveWOForUpdate(null)} className="text-white hover:text-gray-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-[11px] text-gray-500">
                Specify materials or spare parts consumed during execution. Stock levels will be deducted automatically.
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">{isRtl ? 'قطعة الغيار المستهلكة' : 'Spare Part Consumed'}</label>
                  <select
                    value={consumedPartId}
                    onChange={(e) => setConsumedPartId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none text-gray-700"
                  >
                    <option value="">None / Labor Only</option>
                    {spareParts.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name} (Stock: {sp.quantityInStock})
                      </option>
                    ))}
                  </select>
                </div>

                {consumedPartId && (
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">{isRtl ? 'الكمية المستهلكة' : 'Quantity Consumed'}</label>
                    <input
                      type="number"
                      required
                      value={consumedPartQty}
                      onChange={(e) => setConsumedPartQty(e.target.value)}
                      placeholder="e.g., 2"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setActiveWOForUpdate(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateWOStatus(activeWOForUpdate.id, 'Completed')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  Finalize & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
