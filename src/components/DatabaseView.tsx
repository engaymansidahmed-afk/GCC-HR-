import React, { useState } from 'react';
import { Database, FileText, Download, Copy, Check, CheckCircle2 } from 'lucide-react';

interface DatabaseViewProps {
  isRtl: boolean;
}

export default function DatabaseView({ isRtl }: DatabaseViewProps) {
  const [copied, setCopied] = useState(false);

  const postgresDDL = `-- ====================================================================
-- GCC HR & ENTERPRISE RESOURCE MANAGEMENT PLATFORM
-- PRODUCTION POSTGRESQL DDL MIGRATION SCHEMA
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
CREATE TYPE employee_status AS ENUM ('Active', 'On Leave', 'Suspended', 'Offboarded');
CREATE TYPE leave_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Returned');
CREATE TYPE task_status AS ENUM ('Open', 'In Progress', 'Review', 'Closed');
CREATE TYPE equipment_status AS ENUM ('Active', 'Idle', 'Under Maintenance', 'Out of Service', 'Retired');

-- 3. EMPLOYEES TABLE
CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    nationality VARCHAR(100) DEFAULT 'Saudi Arabia',
    national_id VARCHAR(50) UNIQUE NOT NULL,
    passport_number VARCHAR(50) UNIQUE,
    visa_status VARCHAR(100),
    residency_expiry DATE,
    passport_expiry DATE,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    reporting_manager VARCHAR(150),
    project_assignment VARCHAR(50) DEFAULT 'HQ',
    employment_type VARCHAR(50) DEFAULT 'Full-Time',
    hire_date DATE NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL,
    housing_allowance NUMERIC(12, 2) DEFAULT 0.00,
    transportation_allowance NUMERIC(12, 2) DEFAULT 0.00,
    communication_allowance NUMERIC(12, 2) DEFAULT 0.00,
    food_allowance NUMERIC(12, 2) DEFAULT 0.00,
    status employee_status DEFAULT 'Active',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ATTENDANCE LOGS TABLE
CREATE TABLE attendance (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIME NOT NULL,
    check_out TIME,
    method VARCHAR(50) DEFAULT 'Web',
    location_name VARCHAR(150),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    overtime_hours NUMERIC(4, 2) DEFAULT 0.00,
    late_minutes INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Present'
);

-- 5. PROJECTS TABLE
CREATE TABLE projects (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    project_manager VARCHAR(150) NOT NULL,
    budget NUMERIC(15, 2) NOT NULL,
    cost_to_date NUMERIC(15, 2) DEFAULT 0.00,
    location VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    progress_percent INTEGER DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- 6. HEAVY EQUIPMENT TABLE
CREATE TABLE equipment (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status equipment_status DEFAULT 'Active',
    operating_hours NUMERIC(10, 2) DEFAULT 0.00,
    assigned_project VARCHAR(50) REFERENCES projects(code) ON DELETE SET NULL,
    assigned_operator VARCHAR(150),
    last_service_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SPARE PARTS INVENTORY TABLE
CREATE TABLE spare_parts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 5,
    unit_price NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'pcs',
    warehouse VARCHAR(100) NOT NULL,
    bin_location VARCHAR(50) NOT NULL
);

-- 8. MAINTENANCE WORK ORDERS
CREATE TABLE work_orders (
    id VARCHAR(50) PRIMARY KEY,
    equipment_id VARCHAR(50) REFERENCES equipment(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Open',
    assigned_technician VARCHAR(150) NOT NULL,
    cost NUMERIC(10, 2) DEFAULT 0.00,
    scheduled_date DATE,
    completed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. FUEL LOGS TABLE
CREATE TABLE fuel_logs (
    id VARCHAR(50) PRIMARY KEY,
    target_id VARCHAR(50) NOT NULL,
    target_name VARCHAR(150) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    quantity_liters NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    operator_name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL
);

-- 10. SYSTEM CONFIGURATION TABLE
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    currency VARCHAR(10) DEFAULT 'SAR',
    overtime_multiplier_regular NUMERIC(3, 2) DEFAULT 1.50,
    overtime_multiplier_holiday NUMERIC(3, 2) DEFAULT 2.00,
    branches TEXT[],
    departments TEXT[],
    positions TEXT[]
);

-- 11. INDICES FOR HIGH PERFORMANCE SCANNING
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_attendance_emp_date ON attendance(employee_id, date);
CREATE INDEX idx_equipment_project ON equipment(assigned_project);
CREATE INDEX idx_spare_parts_reorder ON spare_parts(quantity_in_stock) WHERE quantity_in_stock <= reorder_level;

-- 12. INITIAL ADMINISTRATIVE SEED SEED
INSERT INTO system_settings (company_name, currency, overtime_multiplier_regular, overtime_multiplier_holiday, branches, departments, positions)
VALUES (
    'Al-Mansoori Contracting Operations Ltd.',
    'SAR',
    1.50,
    2.00,
    ARRAY['Riyadh HQ', 'NEOM Sector 4', 'Jeddah Cargo Terminal', 'Dammam Logistics Port'],
    ARRAY['Executive Office', 'Human Resources Management', 'Project Engineering & Construction', 'Machinery Fleet Maintenance', 'Supply Chain Logistics', 'Financial Control'],
    ARRAY['Super Administrator', 'HR Specialist', 'Chief Operations Officer', 'Civil Engineer', 'Heavy Machinery Operator', 'Senior Fleet Technician', 'Financial Accountant']
);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(postgresDDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="database_view" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">{isRtl ? 'بنية البيانات السحابية PostgreSQL' : 'PostgreSQL Relational DB & ERD Schema'}</h2>
          <p className="text-xs text-gray-500">
            {isRtl
              ? 'تصفح المخطط الهيكلي لقاعدة البيانات وتنزيل سكربتات التهيئة والترحيل المعتمدة لـ PostgreSQL'
              : 'Browse target corporate Entity-Relationship schemas and download enterprise PostgreSQL initialization scripts'}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
          {copied ? (isRtl ? 'تم النسخ!' : 'Copied DDL!') : (isRtl ? 'نسخ مخطط DDL' : 'Copy SQL DDL Schema')}
        </button>
      </div>

      {/* ERD Interactive Visual Diagram */}
      <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-6 overflow-x-auto border border-slate-800">
        <h3 className="font-bold text-sm text-blue-400 flex items-center gap-1.5 font-sans">
          <Database className="w-4 h-4" /> Relational Database Entity Relationship Diagram (ERD)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-[900px] text-xs">
          {/* Table 1 */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-md">
            <div className="bg-slate-700 p-2.5 font-bold font-mono text-blue-300 border-b border-slate-600">
              employees
            </div>
            <div className="p-3 space-y-1.5 font-mono text-[10px] text-slate-300">
              <p className="text-blue-400 font-bold">🔑 id (PK) - VARCHAR</p>
              <p>• full_name - VARCHAR</p>
              <p>• email - VARCHAR (UQ)</p>
              <p>• mobile - VARCHAR</p>
              <p>• national_id - VARCHAR (UQ)</p>
              <p>• passport_number - VARCHAR</p>
              <p>• department - VARCHAR</p>
              <p>• position - VARCHAR</p>
              <p>• basic_salary - NUMERIC</p>
              <p>• status - enum_status</p>
            </div>
          </div>

          {/* Table 2 */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-md">
            <div className="bg-slate-700 p-2.5 font-bold font-mono text-blue-300 border-b border-slate-600">
              attendance
            </div>
            <div className="p-3 space-y-1.5 font-mono text-[10px] text-slate-300">
              <p className="text-blue-400 font-bold">🔑 id (PK) - VARCHAR</p>
              <p className="text-purple-400">🔗 employee_id (FK) - VARCHAR</p>
              <p>• date - DATE</p>
              <p>• check_in - TIME</p>
              <p>• check_out - TIME</p>
              <p>• method - VARCHAR</p>
              <p>• overtime_hours - NUMERIC</p>
              <p>• status - VARCHAR</p>
            </div>
          </div>

          {/* Table 3 */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-md">
            <div className="bg-slate-700 p-2.5 font-bold font-mono text-blue-300 border-b border-slate-600">
              equipment
            </div>
            <div className="p-3 space-y-1.5 font-mono text-[10px] text-slate-300">
              <p className="text-blue-400 font-bold">🔑 id (PK) - VARCHAR</p>
              <p>• name - VARCHAR</p>
              <p>• type - VARCHAR</p>
              <p>• serial_number - VARCHAR (UQ)</p>
              <p className="text-purple-400">🔗 assigned_project (FK) - VARCHAR</p>
              <p>• status - enum_equip_status</p>
              <p>• operating_hours - NUMERIC</p>
            </div>
          </div>

          {/* Table 4 */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-md">
            <div className="bg-slate-700 p-2.5 font-bold font-mono text-blue-300 border-b border-slate-600">
              spare_parts
            </div>
            <div className="p-3 space-y-1.5 font-mono text-[10px] text-slate-300">
              <p className="text-blue-400 font-bold">🔑 id (PK) - VARCHAR</p>
              <p>• name - VARCHAR</p>
              <p>• part_number - VARCHAR (UQ)</p>
              <p>• quantity_in_stock - INTEGER</p>
              <p>• reorder_level - INTEGER</p>
              <p>• unit_price - NUMERIC</p>
              <p>• warehouse - VARCHAR</p>
              <p>• bin_location - VARCHAR</p>
            </div>
          </div>
        </div>
      </div>

      {/* SQL script browser */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden space-y-2">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            PostgreSQL Migrations & DDL Setup Script (production.sql)
          </span>
          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-bold">
            POSTGRESQL 15+ COMPATIBLE
          </span>
        </div>
        <pre className="p-5 overflow-auto text-[11px] font-mono bg-gray-900 text-slate-300 max-h-96 leading-relaxed select-all">
          {postgresDDL}
        </pre>
      </div>
    </div>
  );
}
