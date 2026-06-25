import React, { useState } from 'react';
import {
  Warehouse,
  FileText,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Plus,
  Compass,
  ArrowRight,
  User,
  Activity,
  Archive
} from 'lucide-react';
import { SparePart, Asset, Employee } from '../types';

interface InventoryAssetsViewProps {
  state: {
    spareParts: SparePart[];
    assets: Asset[];
    employees: Employee[];
  };
  isRtl: boolean;
  onRefresh: () => void;
}

export default function InventoryAssetsView({ state, isRtl, onRefresh }: InventoryAssetsViewProps) {
  const { spareParts, assets, employees } = state;
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'assets'>('inventory');

  // Dynamic Straight line depreciation calculator
  const calculateDepreciation = (asset: Asset) => {
    const cost = asset.purchaseCost;
    const rate = asset.depreciationRate; // e.g. 20 for 20%
    const annualDep = cost * (rate / 100);
    const accumulatedDep = Math.max(0, cost - asset.currentValue);
    const bookValue = asset.currentValue;

    return {
      annualDep,
      accumulatedDep,
      bookValue
    };
  };

  return (
    <div id="inventory_assets_view" className="space-y-6">
      {/* Tab bar */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-sm">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'inventory' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'مستودعات قطع الغيار' : 'Spare Parts Warehouse'}
        </button>
        <button
          onClick={() => setActiveSubTab('assets')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            activeSubTab === 'assets' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isRtl ? 'الأصول الثابتة والإهلاك' : 'Fixed Assets & Depr.'}
        </button>
      </div>

      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm">
              {isRtl ? 'جرد المستودعات المركزية وقطع الغيار' : 'Central Warehouse Materials & Spare Parts'}
            </h3>
            <span className="text-xs text-gray-500">{spareParts.length} distinct items</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {spareParts.map((sp) => {
              const isLowStock = sp.quantityInStock <= sp.reorderLevel;

              return (
                <div key={sp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border">
                        {sp.partNumber}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm mt-1.5">{sp.name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{sp.id}</p>
                    </div>

                    {isLowStock && (
                      <span className="bg-red-50 text-red-700 border border-red-100 font-bold px-2 py-0.5 rounded-full text-[9px] flex items-center gap-0.5 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        LOW STOCK
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 bg-gray-50/50 p-3 rounded-lg border border-gray-100 font-mono">
                    <p><span className="text-gray-400 font-sans">{isRtl ? 'الكمية المتوفرة:' : 'In Stock:'}</span> <span className="font-bold text-gray-900">{sp.quantityInStock} pcs</span></p>
                    <p><span className="text-gray-400 font-sans">{isRtl ? 'مستوى الطلب الحرج:' : 'Reorder Level:'}</span> <span className="text-gray-500">{sp.reorderLevel} pcs</span></p>
                    <p><span className="text-gray-400 font-sans">{isRtl ? 'موقع التخزين بالمستودع:' : 'Bin Location / Barcode:'}</span> <span className="font-bold text-blue-700">{sp.warehouseName} - {sp.barcode}</span></p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-t pt-2 font-mono">
                    <span>{isRtl ? 'التصنيف:' : 'Category:'} {sp.category}</span>
                    <span className="font-bold text-gray-700">{sp.unitCost} SAR</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm">
              {isRtl ? 'سجل الأصول الرأسمالية الثابتة وإهلاك السنوي' : 'Fixed Capital Asset Directory & SL Depreciation'}
            </h3>
            <span className="text-xs text-gray-500">{assets.length} capital assets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assets.map((asset) => {
              const depr = calculateDepreciation(asset);

              return (
                <div key={asset.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        S/N: {asset.serialNumber}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm mt-1">{asset.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{asset.type}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        asset.status === 'Assigned'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {asset.status}
                    </span>
                  </div>

                  {/* Depreciation breakdown */}
                  <div className="space-y-2 border-t pt-3 font-mono text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>{isRtl ? 'تكلفة الشراء الأصلية:' : 'Purchase Cost:'}</span>
                      <span className="font-bold">{asset.purchaseCost.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{isRtl ? 'معدل الإهلاك السنوي:' : 'Annual Depr. Rate:'}</span>
                      <span>{asset.depreciationRate}%</span>
                    </div>

                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-1 text-blue-900 text-[11px] pt-2">
                      <div className="flex justify-between">
                        <span className="font-sans font-semibold">{isRtl ? 'الإهلاك السنوي (SL):' : 'Annual Depr. (SL):'}</span>
                        <span className="font-bold">{Math.round(depr.annualDep).toLocaleString()} SAR/Yr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans text-gray-500">{isRtl ? 'المجمع المتراكم:' : 'Acc. Depreciation:'}</span>
                        <span>{Math.round(depr.accumulatedDep).toLocaleString()} SAR</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-blue-100 pt-1 text-blue-950">
                        <span className="font-sans">{isRtl ? 'القيمة الدفترية الحالية:' : 'Current Book Value:'}</span>
                        <span>{Math.round(depr.bookValue).toLocaleString()} SAR</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-t pt-2">
                    <span>Custodian: {asset.assignedEmployeeName || 'Available'}</span>
                    <span>Date: {asset.purchaseDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
