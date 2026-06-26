import fs from 'fs';
import path from 'path';
import { seedRequests } from './seedRequests';
import {
  Employee,
  Attendance,
  LeaveRequest,
  Loan,
  Project,
  Equipment,
  MaintenanceWorkOrder,
  Asset,
  Vehicle,
  FuelLog,
  SparePart,
  Task,
  SupportTicket,
  AuditLog,
  Notification,
  SystemSettings,
  Warehouse,
  PayrollRun,
  EnterpriseRequest,
  ApprovalHistoryItem,
  EmailConfig,
  SmsConfig,
  MfaConfig,
  EmailTemplate,
  EmailLog,
  SmsLog,
  QueueItem,
  AccountSecurityPolicy,
  UserSecurityState
} from '../src/types';

interface DatabaseSchema {
  employees: Employee[];
  attendance: Attendance[];
  leaves: LeaveRequest[];
  loans: Loan[];
  projects: Project[];
  equipment: Equipment[];
  workOrders: MaintenanceWorkOrder[];
  assets: Asset[];
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  warehouses: Warehouse[];
  spareParts: SparePart[];
  tasks: Task[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  settings: SystemSettings;
  payrollRuns: PayrollRun[];
  requests: EnterpriseRequest[];
  emailConfig: EmailConfig;
  smsConfig: SmsConfig;
  mfaConfig: MfaConfig;
  emailTemplates: EmailTemplate[];
  emailLogs: EmailLog[];
  smsLogs: SmsLog[];
  emailQueue: QueueItem[];
  securityPolicy: AccountSecurityPolicy;
  userSecurityStates: UserSecurityState[];
}

const DB_FILE = path.join(process.cwd(), 'db.json');

const defaultSettings: SystemSettings = {
  companyName: 'Al-Mansoori Industrial & Engineering Contracting Co.',
  commercialRegistration: '1010328492',
  hijriCalendarMode: false,
  currency: 'SAR',
  basicOvertimeRate: 1.5,
  holidayOvertimeRate: 2.0,
  allowanceTypes: ['Housing', 'Transportation', 'Communication', 'Food', 'Site/Hardship'],
  leavePolicies: [
    { type: 'Annual Leave', daysPerYear: 30, paidPercent: 100 },
    { type: 'Sick Leave', daysPerYear: 15, paidPercent: 100 },
    { type: 'Emergency Leave', daysPerYear: 5, paidPercent: 100 },
    { type: 'Unpaid Leave', daysPerYear: 60, paidPercent: 0 },
    { type: 'Maternity Leave', daysPerYear: 70, paidPercent: 100 },
    { type: 'Business Leave', daysPerYear: 14, paidPercent: 100 }
  ],
  departments: ['Executive Management', 'Human Resources', 'Finance & Payroll', 'Engineering & Operations', 'Equipment & Fleet', 'Maintenance & Service', 'Warehouse & Supply Chain'],
  positions: ['Director', 'Manager', 'Supervisor', 'Lead Engineer', 'Operations Engineer', 'Safety Officer', 'HR Specialist', 'Accountant', 'Fleet Coordinator', 'Senior Mechanic', 'Welder', 'Warehouse Keeper', 'Operator', 'Laborer'],
  branches: ['Riyadh (HQ)', 'Jeddah', 'NEOM Site Office', 'Dammam']
};

const seedEmployees: Employee[] = [
  {
    id: 'EMP-2026-001',
    fullName: 'Tariq Abdulaziz Al-Otaibi',
    email: 'tariq.otaibi@almansoori.com',
    mobile: '+966 50 123 4567',
    nationality: 'Saudi Arabia',
    nationalId: '1029384756',
    passportNumber: 'N1234567',
    visaStatus: 'Citizen',
    residencyExpiry: '2035-12-31',
    passportExpiry: '2031-05-15',
    drivingLicense: 'Heavy Duty',
    dob: '1981-08-12',
    gender: 'Male',
    maritalStatus: 'Married',
    emergencyContactName: 'Fahad Al-Otaibi (Brother)',
    emergencyContactPhone: '+966 50 987 6543',
    department: 'Executive Management',
    position: 'Director',
    reportingManager: 'Board of Directors',
    projectAssignment: 'HQ',
    employmentType: 'Full-Time',
    hireDate: '2015-03-01',
    basicSalary: 35000,
    housingAllowance: 8750,
    transportationAllowance: 3500,
    communicationAllowance: 800,
    foodAllowance: 500,
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    documents: [
      { id: 'DOC-1', name: 'National ID Card', type: 'National ID', fileNumber: '1029384756', expiryDate: '2035-12-31', status: 'Active', uploadedAt: '2026-01-10' },
      { id: 'DOC-2', name: 'Passport Core Pages', type: 'Passport', fileNumber: 'N1234567', expiryDate: '2031-05-15', status: 'Active', uploadedAt: '2026-01-10' }
    ]
  },
  {
    id: 'EMP-2026-002',
    fullName: 'Sarah Khalid Al-Ghamdi',
    email: 'sarah.ghamdi@almansoori.com',
    mobile: '+966 54 888 2314',
    nationality: 'Saudi Arabia',
    nationalId: '1098234712',
    passportNumber: 'N4312890',
    visaStatus: 'Citizen',
    residencyExpiry: '2040-06-20',
    passportExpiry: '2032-09-12',
    drivingLicense: 'Private',
    dob: '1989-11-04',
    gender: 'Female',
    maritalStatus: 'Married',
    emergencyContactName: 'Khalid Al-Ghamdi (Father)',
    emergencyContactPhone: '+966 54 111 2222',
    department: 'Human Resources',
    position: 'Manager',
    reportingManager: 'Tariq Abdulaziz Al-Otaibi',
    projectAssignment: 'HQ',
    employmentType: 'Full-Time',
    hireDate: '2019-07-15',
    basicSalary: 18000,
    housingAllowance: 4500,
    transportationAllowance: 1800,
    communicationAllowance: 500,
    foodAllowance: 500,
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    documents: [
      { id: 'DOC-3', name: 'National ID', type: 'National ID', fileNumber: '1098234712', expiryDate: '2040-06-20', status: 'Active', uploadedAt: '2026-02-01' }
    ]
  },
  {
    id: 'EMP-2026-003',
    fullName: 'Mohammad Salem Al-Qahtani',
    email: 'mohammad.qahtani@almansoori.com',
    mobile: '+966 56 321 0987',
    nationality: 'Saudi Arabia',
    nationalId: '1074523910',
    passportNumber: 'N8822991',
    visaStatus: 'Citizen',
    residencyExpiry: '2038-11-10',
    passportExpiry: '2030-01-22',
    drivingLicense: 'Private',
    dob: '1985-04-20',
    gender: 'Male',
    maritalStatus: 'Married',
    emergencyContactName: 'Asma Al-Qahtani (Wife)',
    emergencyContactPhone: '+966 56 555 6666',
    department: 'Finance & Payroll',
    position: 'Manager',
    reportingManager: 'Tariq Abdulaziz Al-Otaibi',
    projectAssignment: 'HQ',
    employmentType: 'Full-Time',
    hireDate: '2017-10-01',
    basicSalary: 22000,
    housingAllowance: 5500,
    transportationAllowance: 2200,
    communicationAllowance: 500,
    foodAllowance: 500,
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    documents: []
  },
  {
    id: 'EMP-2026-004',
    fullName: 'Faisal Ahmed Al-Harbi',
    email: 'faisal.harbi@almansoori.com',
    mobile: '+966 55 456 7890',
    nationality: 'Saudi Arabia',
    nationalId: '1047281938',
    passportNumber: 'N7731294',
    visaStatus: 'Citizen',
    residencyExpiry: '2036-04-18',
    passportExpiry: '2032-12-05',
    drivingLicense: 'Heavy Duty',
    dob: '1992-05-30',
    gender: 'Male',
    maritalStatus: 'Single',
    emergencyContactName: 'Ahmed Al-Harbi (Father)',
    emergencyContactPhone: '+966 55 112 2334',
    department: 'Maintenance & Service',
    position: 'Senior Mechanic',
    reportingManager: 'Tariq Abdulaziz Al-Otaibi',
    projectAssignment: 'PRJ-RYD-01',
    employmentType: 'Full-Time',
    hireDate: '2021-01-10',
    basicSalary: 11000,
    housingAllowance: 2750,
    transportationAllowance: 1100,
    communicationAllowance: 300,
    foodAllowance: 500,
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    documents: []
  },
  {
    id: 'EMP-2026-005',
    fullName: 'Rajesh Subramanian Kumar',
    email: 'rajesh.kumar@almansoori.com',
    mobile: '+966 53 762 1109',
    nationality: 'India',
    nationalId: '2283941029', // Iqama Number
    passportNumber: 'Z9911023',
    visaStatus: 'Residency Permit (Iqama)',
    residencyExpiry: '2026-08-15', // Expires in ~50 days (Requires 60-day warning!)
    passportExpiry: '2028-04-10',
    drivingLicense: 'Light Heavy',
    dob: '1988-02-14',
    gender: 'Male',
    maritalStatus: 'Married',
    emergencyContactName: 'Priya Rajesh (Wife)',
    emergencyContactPhone: '+91 98401 23456',
    department: 'Engineering & Operations',
    position: 'Operator',
    reportingManager: 'Ahmed Al-Dossary',
    projectAssignment: 'PRJ-NEO-03',
    employmentType: 'Contract',
    hireDate: '2020-05-18',
    basicSalary: 6500,
    housingAllowance: 1625,
    transportationAllowance: 1000,
    communicationAllowance: 200,
    foodAllowance: 500,
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    documents: [
      { id: 'DOC-4', name: 'Indian Passport', type: 'Passport', fileNumber: 'Z9911023', expiryDate: '2028-04-10', status: 'Active', uploadedAt: '2020-05-20' },
      { id: 'DOC-5', name: 'Saudi Iqama Resident Card', type: 'Residency Permit', fileNumber: '2283941029', expiryDate: '2026-08-15', status: 'Active', uploadedAt: '2025-08-14' }
    ]
  },
  {
    id: 'EMP-2026-006',
    fullName: 'Ahmed Faraj Al-Dossary',
    email: 'ahmed.dossary@almansoori.com',
    mobile: '+966 50 882 1144',
    nationality: 'Saudi Arabia',
    nationalId: '1011223344',
    passportNumber: 'N4488220',
    visaStatus: 'Citizen',
    residencyExpiry: '2037-12-12',
    passportExpiry: '2031-10-10',
    drivingLicense: 'Private',
    dob: '1984-06-15',
    gender: 'Male',
    maritalStatus: 'Married',
    emergencyContactName: 'Bandar Al-Dossary (Brother)',
    emergencyContactPhone: '+966 50 111 4455',
    department: 'Engineering & Operations',
    position: 'Supervisor',
    reportingManager: 'Tariq Abdulaziz Al-Otaibi',
    projectAssignment: 'PRJ-RYD-01',
    employmentType: 'Full-Time',
    hireDate: '2016-01-01',
    basicSalary: 14000,
    housingAllowance: 3500,
    transportationAllowance: 1400,
    communicationAllowance: 400,
    foodAllowance: 500,
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150',
    documents: []
  },
  {
    id: 'EMP-2026-007',
    fullName: 'John Michael Doe',
    email: 'john.doe@almansoori.com',
    mobile: '+966 55 990 8811',
    nationality: 'United Kingdom',
    nationalId: '2398451029',
    passportNumber: 'UK991283',
    visaStatus: 'Employment Visa',
    residencyExpiry: '2026-07-02', // Expires in 7 days! (Requires Urgent 7-day warning!)
    passportExpiry: '2030-05-18',
    drivingLicense: 'Private',
    dob: '1976-03-22',
    gender: 'Male',
    maritalStatus: 'Married',
    emergencyContactName: 'Emily Doe (Wife)',
    emergencyContactPhone: '+44 7911 123456',
    department: 'Engineering & Operations',
    position: 'Lead Engineer',
    reportingManager: 'Tariq Abdulaziz Al-Otaibi',
    projectAssignment: 'PRJ-NEO-03',
    employmentType: 'Full-Time',
    hireDate: '2023-09-01',
    basicSalary: 28000,
    housingAllowance: 7000,
    transportationAllowance: 2500,
    communicationAllowance: 500,
    foodAllowance: 500,
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    documents: [
      { id: 'DOC-6', name: 'Work Iqama', type: 'Residency Permit', fileNumber: '2398451029', expiryDate: '2026-07-02', status: 'Expiring Soon', uploadedAt: '2025-07-03' }
    ]
  }
];

const seedProjects: Project[] = [
  {
    code: 'PRJ-RYD-01',
    name: 'Riyadh Metro Line 7 Linkway',
    clientName: 'Royal Commission for Riyadh City (RCRC)',
    location: 'Riyadh, Saudi Arabia',
    startDate: '2025-01-01',
    endDate: '2027-06-30',
    budget: 45000000,
    costToDate: 12500000,
    projectManager: 'Tariq Abdulaziz Al-Otaibi',
    status: 'Active',
    progressPercent: 38,
    workforceCount: 42,
    equipmentCount: 12
  },
  {
    code: 'PRJ-JED-02',
    name: 'Jeddah Port Cargo Terminal Upgrade',
    clientName: 'Mawani Port Authority',
    location: 'Jeddah Port, Saudi Arabia',
    startDate: '2025-06-15',
    endDate: '2026-12-31',
    budget: 18500000,
    costToDate: 9200000,
    projectManager: 'Ahmed Faraj Al-Dossary',
    status: 'Active',
    progressPercent: 62,
    workforceCount: 28,
    equipmentCount: 6
  },
  {
    code: 'PRJ-NEO-03',
    name: 'NEOM Line Foundation Works',
    clientName: 'NEOM Company',
    location: 'Tabuk Region, Saudi Arabia',
    startDate: '2025-10-01',
    endDate: '2028-12-31',
    budget: 120000000,
    costToDate: 18400000,
    projectManager: 'John Michael Doe',
    status: 'Active',
    progressPercent: 12,
    workforceCount: 85,
    equipmentCount: 24
  },
  {
    code: 'PRJ-DAM-04',
    name: 'Dammam Petrochemical Plant Expansion',
    clientName: 'SABIC / Aramco Joint Venture',
    location: 'Jubail Industrial City, Saudi Arabia',
    startDate: '2026-08-01',
    endDate: '2029-02-28',
    budget: 85000000,
    costToDate: 0,
    projectManager: 'Sarah Khalid Al-Ghamdi',
    status: 'Planned',
    progressPercent: 0,
    workforceCount: 0,
    equipmentCount: 0
  }
];

const seedEquipment: Equipment[] = [
  {
    id: 'EQ-CAT-320D',
    name: 'Caterpillar 320D Excavator',
    category: 'Excavators',
    model: '320D L',
    manufacturer: 'Caterpillar',
    serialNumber: 'CAT320DLX882941',
    purchaseDate: '2022-04-12',
    purchaseCost: 450000,
    currentLocation: 'Sector 4, NEOM Construction Site',
    assignedProject: 'PRJ-NEO-03',
    assignedOperator: 'Rajesh Subramanian Kumar',
    operatingHours: 4210,
    fuelRate: 24.5,
    status: 'Active',
    lastServiceDate: '2026-05-10',
    nextServiceHours: 4500
  },
  {
    id: 'EQ-GEN-CUM150',
    name: 'Cummins 150kVA Generator',
    category: 'Generators',
    model: 'C150D5',
    manufacturer: 'Cummins',
    serialNumber: 'CUM150G8231',
    purchaseDate: '2023-01-18',
    purchaseCost: 110000,
    currentLocation: 'Station 12, Riyadh Metro Site',
    assignedProject: 'PRJ-RYD-01',
    assignedOperator: 'Ahmed Faraj Al-Dossary',
    operatingHours: 8900,
    fuelRate: 14.2,
    status: 'Active',
    lastServiceDate: '2026-06-01',
    nextServiceHours: 9000
  },
  {
    id: 'EQ-CRN-LIE500',
    name: 'Liebherr LTM 1050 Crane',
    category: 'Cranes',
    model: 'LTM 1050-3.1',
    manufacturer: 'Liebherr',
    serialNumber: 'LTM500CR99281',
    purchaseDate: '2021-08-05',
    purchaseCost: 980000,
    currentLocation: 'Jeddah Port Cargo Yard',
    assignedProject: 'PRJ-JED-02',
    assignedOperator: 'Faisal Ahmed Al-Harbi',
    operatingHours: 2450,
    fuelRate: 35.0,
    status: 'Under Maintenance',
    lastServiceDate: '2026-06-15',
    nextServiceHours: 2500
  },
  {
    id: 'EQ-CMP-ATL250',
    name: 'Atlas Copco XAS 185 Compressor',
    category: 'Compressors',
    model: 'XAS 185 JD7',
    manufacturer: 'Atlas Copco',
    serialNumber: 'ATL185C9234',
    purchaseDate: '2024-02-20',
    purchaseCost: 65000,
    currentLocation: 'Riyadh Central Workshop',
    assignedProject: 'PRJ-RYD-01',
    assignedOperator: 'Unassigned',
    operatingHours: 1120,
    fuelRate: 9.5,
    status: 'Idle',
    lastServiceDate: '2026-04-04',
    nextServiceHours: 1500
  }
];

const seedVehicles: Vehicle[] = [
  {
    id: 'VEH-TOY-HIL01',
    plateNumber: '4321 DXA',
    brand: 'Toyota',
    model: 'Hilux Double Cabin 4x4',
    year: 2023,
    type: 'Pickup Truck',
    assignedDriver: 'Faisal Ahmed Al-Harbi',
    assignedProject: 'PRJ-RYD-01',
    registrationExpiry: '2026-11-20',
    insuranceExpiry: '2026-10-15',
    mileage: 48200,
    status: 'Active'
  },
  {
    id: 'VEH-HYU-COU02',
    plateNumber: '7890 KSA',
    brand: 'Hyundai',
    model: 'County Crew Bus 26-Seater',
    year: 2022,
    type: 'Crew Bus',
    assignedDriver: 'Rajesh Subramanian Kumar',
    assignedProject: 'PRJ-NEO-03',
    registrationExpiry: '2026-07-15', // Expires in 20 days!
    insuranceExpiry: '2026-07-20',
    mileage: 82400,
    status: 'Assigned'
  },
  {
    id: 'VEH-TOY-LAN03',
    plateNumber: '1010 RYD',
    brand: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2024,
    type: 'SUV',
    assignedDriver: 'Tariq Abdulaziz Al-Otaibi',
    assignedProject: 'HQ',
    registrationExpiry: '2029-01-10',
    insuranceExpiry: '2027-01-15',
    mileage: 18500,
    status: 'Active'
  }
];

const seedWarehouses: Warehouse[] = [
  { id: 'WH-RYD-MAIN', name: 'Riyadh Central Logistics Base', location: 'Sulay Area, Riyadh', manager: 'Sarah Khalid Al-Ghamdi' },
  { id: 'WH-NEO-CAMP', name: 'NEOM Site Support Depot', location: 'Sharma, Tabuk', manager: 'John Michael Doe' }
];

const seedSpareParts: SparePart[] = [
  {
    id: 'SP-CAT-FLT01',
    name: 'Caterpillar Hydraulic Filter Element',
    partNumber: '1R-0722',
    category: 'Hydraulics',
    warehouseId: 'WH-NEO-CAMP',
    warehouseName: 'NEOM Site Support Depot',
    quantityInStock: 12,
    reorderLevel: 4,
    unitCost: 280,
    barcode: '8829410722'
  },
  {
    id: 'SP-CUM-BELT02',
    name: 'Cummins Alternator Ribbed Fan Belt',
    partNumber: '3289056',
    category: 'Belts',
    warehouseId: 'WH-RYD-MAIN',
    warehouseName: 'Riyadh Central Logistics Base',
    quantityInStock: 2, // Low stock, reorder level is 5!
    reorderLevel: 5,
    unitCost: 110,
    barcode: '3289056123'
  },
  {
    id: 'SP-GEN-FILT03',
    name: 'Standard Diesel Fuel Water Separator Filter',
    partNumber: 'FS-1212',
    category: 'Filters',
    warehouseId: 'WH-RYD-MAIN',
    warehouseName: 'Riyadh Central Logistics Base',
    quantityInStock: 24,
    reorderLevel: 10,
    unitCost: 85,
    barcode: '09797201212'
  }
];

const seedWorkOrders: MaintenanceWorkOrder[] = [
  {
    id: 'WO-2026-001',
    equipmentId: 'EQ-CAT-320D',
    equipmentName: 'Caterpillar 320D Excavator',
    type: 'Preventive',
    priority: 'Medium',
    description: '4500-Hour interval scheduled service. Replace engine oil, water separator filter, air cleaner element, and hydraulic fluid test.',
    status: 'In Progress',
    assignedTechnician: 'Faisal Ahmed Al-Harbi',
    partsConsumed: [
      { partId: 'SP-GEN-FILT03', partName: 'Standard Diesel Fuel Water Separator Filter', quantity: 2, unitCost: 85 }
    ],
    cost: 850,
    scheduledDate: '2026-06-24',
    createdAt: '2026-06-20'
  },
  {
    id: 'WO-2026-002',
    equipmentId: 'EQ-CRN-LIE500',
    equipmentName: 'Liebherr LTM 1050 Crane',
    type: 'Corrective',
    priority: 'Critical',
    description: 'Main boom telescoping hydraulic cylinder seal leaking pressure. Crane unable to lift design load.',
    status: 'Waiting for Parts',
    assignedTechnician: 'Faisal Ahmed Al-Harbi',
    partsConsumed: [],
    cost: 3200,
    scheduledDate: '2026-06-22',
    createdAt: '2026-06-21'
  }
];

const seedAttendance: Attendance[] = [
  {
    id: 'ATT-001',
    employeeId: 'EMP-2026-001',
    employeeName: 'Tariq Abdulaziz Al-Otaibi',
    date: '2026-06-24',
    checkIn: '07:45:12',
    checkOut: '17:15:44',
    method: 'Web',
    overtimeHours: 0.5,
    lateMinutes: 0,
    status: 'Present'
  },
  {
    id: 'ATT-002',
    employeeId: 'EMP-2026-002',
    employeeName: 'Sarah Khalid Al-Ghamdi',
    date: '2026-06-24',
    checkIn: '08:15:30', // Late by 15 mins
    checkOut: '17:30:00',
    method: 'Web',
    overtimeHours: 0,
    lateMinutes: 15,
    status: 'Late'
  },
  {
    id: 'ATT-003',
    employeeId: 'EMP-2026-005',
    employeeName: 'Rajesh Subramanian Kumar',
    date: '2026-06-24',
    checkIn: '06:55:00', // Site Shift
    checkOut: '18:00:00', // Overtime
    method: 'GPS',
    locationName: 'NEOM Construction Sector 4',
    latitude: 28.1123,
    longitude: 35.1234,
    overtimeHours: 3.0,
    lateMinutes: 0,
    status: 'Present'
  },
  {
    id: 'ATT-004',
    employeeId: 'EMP-2026-004',
    employeeName: 'Faisal Ahmed Al-Harbi',
    date: '2026-06-24',
    checkIn: null,
    checkOut: null,
    method: 'Manual',
    overtimeHours: 0,
    lateMinutes: 0,
    status: 'Absent'
  }
];

const seedLeaves: LeaveRequest[] = [
  {
    id: 'LR-2026-001',
    employeeId: 'EMP-2026-005',
    employeeName: 'Rajesh Subramanian Kumar',
    leaveType: 'Annual Leave',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    durationDays: 30,
    reason: 'Annual vacation to travel home to India for family wedding.',
    status: 'Pending',
    workflowStep: 'HR',
    approvals: {
      supervisor: { status: 'Approved', by: 'Ahmed Faraj Al-Dossary', date: '2026-06-20', comment: 'Recommended. Project schedule allows.' },
      deptManager: { status: 'Approved', by: 'Tariq Abdulaziz Al-Otaibi', date: '2026-06-21', comment: 'Approved on project level.' }
    },
    createdAt: '2026-06-19'
  },
  {
    id: 'LR-2026-002',
    employeeId: 'EMP-2026-004',
    employeeName: 'Faisal Ahmed Al-Harbi',
    leaveType: 'Sick Leave',
    startDate: '2026-06-25',
    endDate: '2026-06-27',
    durationDays: 3,
    reason: 'High fever, diagnosed with severe flu. Medical report attached.',
    status: 'Approved',
    workflowStep: 'Completed',
    approvals: {
      supervisor: { status: 'Approved', by: 'Tariq Abdulaziz Al-Otaibi', date: '2026-06-25', comment: 'Rest well.' },
      deptManager: { status: 'Approved', by: 'Tariq Abdulaziz Al-Otaibi', date: '2026-06-25' },
      hr: { status: 'Approved', by: 'Sarah Khalid Al-Ghamdi', date: '2026-06-25', comment: 'Approved with medical certificate.' }
    },
    createdAt: '2026-06-25'
  }
];

const seedLoans: Loan[] = [
  {
    id: 'LN-2026-001',
    employeeId: 'EMP-2026-005',
    employeeName: 'Rajesh Subramanian Kumar',
    amount: 15000,
    monthlyInstallment: 1250,
    repaymentMonths: 12,
    outstandingBalance: 12500,
    status: 'Active',
    installmentHistory: [
      { month: '2026-04', amountPaid: 1250, date: '2026-04-28' },
      { month: '2026-05', amountPaid: 1250, date: '2026-05-28' }
    ],
    createdAt: '2026-03-10'
  }
];

const seedAssets: Asset[] = [
  { id: 'AST-LP-01', name: 'HP ZBook Studio G10 Workstation', type: 'Laptop', serialNumber: '5CD3092SDF', assignedEmployeeId: 'EMP-2026-007', assignedEmployeeName: 'John Michael Doe', purchaseDate: '2024-01-10', purchaseCost: 7800, depreciationRate: 25, currentValue: 4875, status: 'Assigned' },
  { id: 'AST-LP-02', name: 'Lenovo ThinkPad L14', type: 'Laptop', serialNumber: 'PF10X2B', assignedEmployeeId: 'EMP-2026-002', assignedEmployeeName: 'Sarah Khalid Al-Ghamdi', purchaseDate: '2023-05-18', purchaseCost: 4500, depreciationRate: 20, currentValue: 2700, status: 'Assigned' },
  { id: 'AST-PH-01', name: 'Samsung Galaxy A54 Enterprise', type: 'Mobile Phone', serialNumber: 'RF8W51421', assignedEmployeeId: 'EMP-2026-006', assignedEmployeeName: 'Ahmed Faraj Al-Dossary', purchaseDate: '2023-11-01', purchaseCost: 1600, depreciationRate: 33, currentValue: 1066, status: 'Assigned' }
];

const seedFuelLogs: FuelLog[] = [
  { id: 'FL-001', targetId: 'VEH-TOY-HIL01', targetName: 'Toyota Hilux Pickup 4x4 (4321 DXA)', targetType: 'Vehicle', fuelType: 'Diesel', quantityLiters: 65, unitCost: 1.15, totalCost: 74.75, date: '2026-06-24', operatorName: 'Faisal Ahmed Al-Harbi', location: 'Sulay Petrol Station, Riyadh' },
  { id: 'FL-002', targetId: 'EQ-CAT-320D', targetName: 'Caterpillar 320D Excavator', targetType: 'Equipment', fuelType: 'Diesel', quantityLiters: 240, unitCost: 1.15, totalCost: 276.00, date: '2026-06-23', operatorName: 'Rajesh Subramanian Kumar', location: 'NEOM Sector 4 Fuel Storage' }
];

const seedTasks: Task[] = [
  { id: 'TSK-001', title: 'Complete concrete pouring for Station 7-B', description: 'Ensure quality safety metrics are signed off and concrete core test cylinders are scheduled.', projectCode: 'PRJ-RYD-01', assignedToId: 'EMP-2026-006', assignedToName: 'Ahmed Faraj Al-Dossary', priority: 'High', status: 'In Progress', deadline: '2026-06-30', createdAt: '2026-06-20' },
  { id: 'TSK-002', title: 'Compile JED cargo terminal inspection reports', description: 'Submit official compliance document to Mawani Port Authority for review.', projectCode: 'PRJ-JED-02', assignedToId: 'EMP-2026-004', assignedToName: 'Faisal Ahmed Al-Harbi', priority: 'Medium', status: 'Open', deadline: '2026-07-05', createdAt: '2026-06-22' },
  { id: 'TSK-003', title: 'Review NEOM tunnel ventilation layout', description: 'Aviation and mechanical engineering coordination required.', projectCode: 'PRJ-NEO-03', assignedToId: 'EMP-2026-007', assignedToName: 'John Michael Doe', priority: 'Critical', status: 'In Progress', deadline: '2026-06-28', createdAt: '2026-06-18' }
];

const seedTickets: SupportTicket[] = [
  { id: 'TCK-001', category: 'HR', title: 'Residency card renewal process enquiry', description: 'My Iqama is expiring in 50 days (August 15). Kindly let me know if the renewal fee has been processed.', employeeId: 'EMP-2026-005', employeeName: 'Rajesh Subramanian Kumar', priority: 'Medium', status: 'Assigned', assignedToName: 'Sarah Khalid Al-Ghamdi', createdAt: '2026-06-24' },
  { id: 'TCK-002', category: 'Payroll', title: 'Payslip transportation allowance discrepancy', description: 'The site assignment transportation component was missing on the May payslip.', employeeId: 'EMP-2026-004', employeeName: 'Faisal Ahmed Al-Harbi', priority: 'Low', status: 'Open', createdAt: '2026-06-25' }
];

const seedAuditLogs: AuditLog[] = [
  { id: 'AUD-001', timestamp: '2026-06-25T08:00:00Z', userId: 'EMP-2026-001', userName: 'Tariq Abdulaziz Al-Otaibi', userRole: 'Super Administrator', actionType: 'Login', module: 'Auth', description: 'Super Admin logged in successfully.', ipAddress: '192.168.1.100' },
  { id: 'AUD-002', timestamp: '2026-06-25T08:15:32Z', userId: 'EMP-2026-002', userName: 'Sarah Khalid Al-Ghamdi', userRole: 'HR Manager', actionType: 'Create', module: 'Leave', description: 'Created sick leave approval for Faisal Ahmed Al-Harbi (EMP-2026-004).', ipAddress: '192.168.1.104' }
];

const seedNotifications: Notification[] = [
  { id: 'NTF-001', title: 'Iqama Expiring Soon (7 Days)', message: 'Work Iqama for John Michael Doe (EMP-2026-007) expires on 2026-07-02. Urgent renewal action required.', type: 'danger', module: 'HR', isRead: false, createdAt: '2026-06-25T06:00:00Z' },
  { id: 'NTF-002', title: 'Iqama Expiring (50 Days)', message: 'Iqama Resident Card for Rajesh Subramanian Kumar (EMP-2026-005) expires in 50 days.', type: 'warning', module: 'HR', isRead: false, createdAt: '2026-06-24T12:00:00Z' },
  { id: 'NTF-003', title: 'Spare Part Reorder Level Met', message: 'Cummins Alternator Ribbed Fan Belt (SP-CUM-BELT02) has fallen below reorder level (Stock: 2/5).', type: 'warning', module: 'Inventory', isRead: false, createdAt: '2026-06-25T04:30:00Z' }
];

const defaultEmailConfig: EmailConfig = {
  provider: 'm365',
  smtpHost: 'smtp.office365.com',
  smtpPort: 587,
  smtpUser: 'hr-alerts@almansoori.com',
  smtpPassEncrypted: 'Microsoft365EnterpriseSecureKeyPass101!',
  secureMode: 'STARTTLS',
  senderEmail: 'hr-alerts@almansoori.com',
  senderName: 'Al-Mansoori HR Portal',
  replyTo: 'hr-helpdesk@almansoori.com',
  timeoutMs: 5000,
  maxRetries: 3,
  dailyLimit: 10000,
  enabled: true
};

const defaultSmsConfig: SmsConfig = {
  provider: 'taqny',
  apiKeyEncrypted: 'TaqnyAPISecurityToken99238128371',
  secretEncrypted: 'TaqnySecretValue882319238',
  senderId: 'ALMANSOORI',
  dailyLimit: 2000,
  enabled: true
};

const defaultMfaConfig: MfaConfig = {
  globalEnabled: false,
  enabledRoles: ['Super Administrator', 'HR Manager', 'Finance Manager'],
  methods: ['email_otp', 'authenticator']
};

const defaultSecurityPolicy: AccountSecurityPolicy = {
  passwordLength: 8,
  complexityNumbers: true,
  complexitySpecial: true,
  complexityUppercase: true,
  passwordExpirationDays: 90,
  passwordHistoryLimit: 5,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  sessionTimeoutMinutes: 30,
  forcedPasswordChangeOnCreate: true,
  inactiveAccountDisableDays: 180
};

const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: 'welcome_email',
    name: 'New Employee Onboarding Welcome',
    subject: 'Welcome to Al-Mansoori - Set Up Your HR Portal Account',
    subjectAr: 'مرحباً بك في شركة المنصوري - تفعيل حسابك في بوابة الموارد البشرية',
    body: 'Dear {{EmployeeName}},\n\nWelcome to Al-Mansoori! We are thrilled to have you join our team as {{Position}} in the {{Department}} department.\n\nYour HR Portal employee account has been created. Here are your temporary credentials:\n- Username: {{Username}}\n- Temporary Password: {{TemporaryPassword}}\n- Employee ID: {{EmployeeID}}\n\nPlease activate your account by clicking the link below and setting up your permanent secure password:\n{{ResetLink}}\n\nNote: You will be required to change this temporary password upon your first login.\n\nBest regards,\n{{CompanyName}} HR Department',
    bodyAr: 'عزيزي الموظف {{EmployeeName}}،\n\nمرحباً بك في شركة المنصوري! يسعدنا جداً انضمامك إلى فريقنا كـ {{Position}} في إدارة {{Department}}.\n\nتم إنشاء حسابك في بوابة الموارد البشرية. إليك بيانات تسجيل الدخول المؤقتة:\n- اسم المستخدم: {{Username}}\n- كلمة المرور المؤقتة: {{TemporaryPassword}}\n- الرقم الوظيفي: {{EmployeeID}}\n\nيرجى تفعيل حسابك بالضغط على الرابط أدناه وتعيين كلمة المرور الدائمة الخاصة بك:\n{{ResetLink}}\n\nملاحظة: سيُطلب منك إلزامياً تغيير كلمة المرور المؤقتة عند تسجيل الدخول الأول.\n\nمع أطيب التحيات،\nإدارة الموارد البشرية - {{CompanyName}}',
    language: 'both',
    variables: ['EmployeeName', 'Position', 'Department', 'Username', 'TemporaryPassword', 'EmployeeID', 'ResetLink', 'CompanyName'],
    enabled: true
  },
  {
    id: 'password_reset',
    name: 'Password Recovery Link',
    subject: 'Reset your Al-Mansoori HR Portal Password',
    subjectAr: 'إعادة تعيين كلمة المرور - بوابة الموارد البشرية لشركة المنصوري',
    body: 'Dear {{EmployeeName}},\n\nWe received a request to reset the password for your HR Portal account. Use the link below to set a new password:\n{{ResetLink}}\n\nThis recovery link is temporary and will expire in 30 minutes. If you did not request a password reset, please ignore this email or contact the HR IT Security team immediately.\n\nBest regards,\n{{CompanyName}} Security Team',
    bodyAr: 'عزيزي {{EmployeeName}}،\n\nتلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في بوابة الموارد البشرية. يرجى استخدام الرابط أدناه لتعيين كلمة مرور جديدة:\n{{ResetLink}}\n\nرابط الاستعادة هذا مؤقت وصالح لمدة 30 دقيقة فقط. إذا لم تكن قد طلبت إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد أو الاتصال بفريق أمن المعلومات فوراً.\n\nمع التحية،\nفريق الأمان - {{CompanyName}}',
    language: 'both',
    variables: ['EmployeeName', 'ResetLink', 'CompanyName'],
    enabled: true
  },
  {
    id: 'otp_notification',
    name: 'Multi-Factor OTP Verification',
    subject: 'Verification Code (MFA) - GCC HR Portal',
    subjectAr: 'رمز التحقق الثنائي (MFA) - بوابة الموارد البشرية',
    body: 'Dear {{EmployeeName}},\n\nYour temporary Multi-Factor Authentication (MFA) security code is:\n\n{{OTPCode}}\n\nThis code is confidential and is valid for 5 minutes. Never share this code with anyone, including HR support staff.\n\nBest regards,\n{{CompanyName}} Identity Protection',
    bodyAr: 'عزيزي {{EmployeeName}}،\n\nرمز التحقق الثنائي المؤقت الخاص بك هو:\n\n{{OTPCode}}\n\nهذا الرمز سري وصالح لمدة 5 دقائق فقط. لا تقم بمشاركة هذا الرمز مع أي شخص، بما في ذلك موظفي الدعم الفني.\n\nمع التحية،\nحماية الهوية - {{CompanyName}}',
    language: 'both',
    variables: ['EmployeeName', 'OTPCode', 'CompanyName'],
    enabled: true
  },
  {
    id: 'leave_approval',
    name: 'Leave Request Status Update',
    subject: 'Leave Request Approved - {{LeaveType}}',
    subjectAr: 'الموافقة على طلب الإجازة - {{LeaveType}}',
    body: 'Dear {{EmployeeName}},\n\nYour leave request for {{LeaveType}} starting on {{StartDate}} and ending on {{EndDate}} has been officially approved. All downstream workflow logs have been locked.\n\nThank you,\n{{CompanyName}} HR',
    bodyAr: 'عزيزي {{EmployeeName}}،\n\nتمت الموافقة رسمياً على طلب الإجازة الخاص بك ({{LeaveType}}) للفترة من {{StartDate}} إلى {{EndDate}}. تم حفظ واعتماد سجلات الموافقة.\n\nشكراً لك،\nإدارة الموارد البشرية - {{CompanyName}}',
    language: 'both',
    variables: ['EmployeeName', 'LeaveType', 'StartDate', 'EndDate', 'CompanyName'],
    enabled: true
  }
];

const defaultEmailLogs: EmailLog[] = [
  {
    id: 'ELG-001',
    date: '2026-06-26',
    time: '10:15:30',
    recipient: 'tariq.otaibi@almansoori.com',
    sender: 'hr-alerts@almansoori.com',
    subject: 'Welcome to Al-Mansoori - Set Up Your HR Portal Account',
    templateUsed: 'welcome_email',
    status: 'Sent',
    retryCount: 0,
    smtpResponse: '250 2.0.0 OK 1719401730 q18-v839420857as',
    durationMs: 420
  },
  {
    id: 'ELG-002',
    date: '2026-06-26',
    time: '11:30:12',
    recipient: 'sarah.ghamdi@almansoori.com',
    sender: 'hr-alerts@almansoori.com',
    subject: 'Reset your Al-Mansoori HR Portal Password',
    templateUsed: 'password_reset',
    status: 'Sent',
    retryCount: 1,
    smtpResponse: '250 2.0.0 OK Delivery Complete',
    durationMs: 980
  },
  {
    id: 'ELG-003',
    date: '2026-06-26',
    time: '12:05:44',
    recipient: 'mohammad.qahtani@almansoori.com',
    sender: 'hr-alerts@almansoori.com',
    subject: 'Verification Code (MFA) - GCC HR Portal',
    templateUsed: 'otp_notification',
    status: 'Failed',
    failureReason: 'Connection timed out after 5000ms',
    retryCount: 3,
    smtpResponse: '421 4.4.2 Connection lost or SMTP host busy',
    durationMs: 5040
  }
];

const defaultSmsLogs: SmsLog[] = [
  {
    id: 'SLG-001',
    recipient: '+966 50 123 4567',
    message: 'GCC-HR: Your OTP security verification code is 482931. Valid for 5 mins.',
    provider: 'taqny',
    status: 'Delivered',
    retryCount: 0,
    costSAR: 0.15,
    date: '2026-06-26',
    time: '10:16:05'
  },
  {
    id: 'SLG-002',
    recipient: '+966 54 888 2314',
    message: 'Al-Mansoori: Welcome! Your temporary secure password is: PM@98342_H. First login reset required.',
    provider: 'taqny',
    status: 'Delivered',
    retryCount: 0,
    costSAR: 0.15,
    date: '2026-06-26',
    time: '11:02:11'
  }
];

const generateUserSecurityStates = (employees: Employee[]): UserSecurityState[] => {
  return employees.map((emp) => {
    const username = emp.email ? emp.email.split('@')[0] : emp.id.toLowerCase();
    return {
      employeeId: emp.id,
      username: username,
      hashedPassword: `pbkdf2_sha256$260000$${username}_salt$hashedpasswordemulated101`, // Standard simulation hash prefix
      tempPassword: `${username.toUpperCase()}@2026_!`,
      firstLoginResetRequired: emp.id !== 'EMP-2026-001' && emp.id !== 'EMP-2026-002', // Admin & HR already configured
      isLocked: false,
      loginAttempts: 0,
      mfaEnabled: emp.id === 'EMP-2026-001' || emp.id === 'EMP-2026-002',
      status: 'Active',
      passwordSetDate: new Date().toISOString().split('T')[0]
    };
  });
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        
        let needsSave = false;
        
        if (!parsed.payrollRuns) {
          parsed.payrollRuns = [];
          needsSave = true;
        }
        if (!parsed.requests) {
          parsed.requests = seedRequests;
          needsSave = true;
        }
        
        // Dynamic additions for Communication Module
        if (!parsed.emailConfig) {
          parsed.emailConfig = defaultEmailConfig;
          needsSave = true;
        }
        if (!parsed.smsConfig) {
          parsed.smsConfig = defaultSmsConfig;
          needsSave = true;
        }
        if (!parsed.mfaConfig) {
          parsed.mfaConfig = defaultMfaConfig;
          needsSave = true;
        }
        if (!parsed.emailTemplates) {
          parsed.emailTemplates = defaultEmailTemplates;
          needsSave = true;
        }
        if (!parsed.emailLogs) {
          parsed.emailLogs = defaultEmailLogs;
          needsSave = true;
        }
        if (!parsed.smsLogs) {
          parsed.smsLogs = defaultSmsLogs;
          needsSave = true;
        }
        if (!parsed.emailQueue) {
          parsed.emailQueue = [];
          needsSave = true;
        }
        if (!parsed.securityPolicy) {
          parsed.securityPolicy = defaultSecurityPolicy;
          needsSave = true;
        }
        if (!parsed.userSecurityStates) {
          parsed.userSecurityStates = generateUserSecurityStates(parsed.employees || seedEmployees);
          needsSave = true;
        }
        
        if (needsSave) {
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        }
        
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load database, falling back to seed.', e);
    }

    const seedPayrollRuns: PayrollRun[] = [
      {
        id: 'PAY-2026-06',
        month: '06',
        year: 2026,
        status: 'Locked',
        approvalWorkflow: {
          officer: { status: 'Approved', by: 'Sarah Khalid Al-Ghamdi', date: '2026-06-25', comment: 'Prepared monthly registers.' },
          finance: { status: 'Approved', by: 'Mohammad Salem Al-Qahtani', date: '2026-06-25', comment: 'Audit matched with ledger.' },
          hr: { status: 'Approved', by: 'Sarah Khalid Al-Ghamdi', date: '2026-06-25', comment: 'All leave deductions synced.' },
          gm: { status: 'Approved', by: 'Tariq Abdulaziz Al-Otaibi', date: '2026-06-26', comment: 'Released for payment.' }
        },
        employees: [
          {
            employeeId: 'EMP-2026-001',
            employeeName: 'Tariq Abdulaziz Al-Otaibi',
            department: 'Executive Management',
            position: 'Director',
            branch: 'Riyadh (HQ)',
            project: 'HQ',
            employmentType: 'Full-Time',
            basicSalary: 35000,
            housingAllowance: 8750,
            transportationAllowance: 3500,
            communicationAllowance: 800,
            foodAllowance: 500,
            otherAllowances: 0,
            overtime: 1500,
            bonuses: 2000,
            incentives: 0,
            commissions: 0,
            loanDeductions: 0,
            salaryAdvanceDeductions: 0,
            gosi: 4266,
            taxes: 0,
            otherDeductions: 0,
            grossSalary: 52050,
            netSalary: 47784,
            paymentMethod: 'Bank Transfer (WPS)',
            paymentStatus: 'Paid',
            paymentDate: '2026-06-26'
          },
          {
            employeeId: 'EMP-2026-002',
            employeeName: 'Sarah Khalid Al-Ghamdi',
            department: 'Human Resources',
            position: 'Manager',
            branch: 'Riyadh (HQ)',
            project: 'HQ',
            employmentType: 'Full-Time',
            basicSalary: 18000,
            housingAllowance: 4500,
            transportationAllowance: 1800,
            communicationAllowance: 500,
            foodAllowance: 500,
            otherAllowances: 0,
            overtime: 0,
            bonuses: 0,
            incentives: 0,
            commissions: 0,
            loanDeductions: 0,
            salaryAdvanceDeductions: 0,
            gosi: 2194,
            taxes: 0,
            otherDeductions: 0,
            grossSalary: 25300,
            netSalary: 23106,
            paymentMethod: 'Bank Transfer (WPS)',
            paymentStatus: 'Paid',
            paymentDate: '2026-06-26'
          },
          {
            employeeId: 'EMP-2026-003',
            employeeName: 'Mohammad Salem Al-Qahtani',
            department: 'Finance & Payroll',
            position: 'Manager',
            branch: 'Riyadh (HQ)',
            project: 'HQ',
            employmentType: 'Full-Time',
            basicSalary: 22000,
            housingAllowance: 5500,
            transportationAllowance: 2200,
            communicationAllowance: 500,
            foodAllowance: 500,
            otherAllowances: 1000,
            overtime: 0,
            bonuses: 1000,
            incentives: 500,
            commissions: 0,
            loanDeductions: 0,
            salaryAdvanceDeductions: 0,
            gosi: 2681,
            taxes: 0,
            otherDeductions: 0,
            grossSalary: 32700,
            netSalary: 30019,
            paymentMethod: 'Bank Transfer (WPS)',
            paymentStatus: 'Paid',
            paymentDate: '2026-06-26'
          },
          {
            employeeId: 'EMP-2026-005',
            employeeName: 'Rajesh Subramanian Kumar',
            department: 'Engineering & Operations',
            position: 'Operator',
            branch: 'NEOM Site Office',
            project: 'PRJ-NEO-03',
            employmentType: 'Contract',
            basicSalary: 6500,
            housingAllowance: 1625,
            transportationAllowance: 1000,
            communicationAllowance: 200,
            foodAllowance: 500,
            otherAllowances: 300,
            overtime: 850,
            bonuses: 0,
            incentives: 0,
            commissions: 0,
            loanDeductions: 1250,
            salaryAdvanceDeductions: 0,
            gosi: 0,
            taxes: 0,
            otherDeductions: 0,
            grossSalary: 10975,
            netSalary: 9725,
            paymentMethod: 'Bank Transfer (WPS)',
            paymentStatus: 'Paid',
            paymentDate: '2026-06-26'
          }
        ],
        createdAt: '2026-06-20T08:00:00Z',
        updatedAt: '2026-06-26T08:00:00Z'
      }
    ];

    // Seed database
    const seedData: DatabaseSchema = {
      employees: seedEmployees,
      attendance: seedAttendance,
      leaves: seedLeaves,
      loans: seedLoans,
      projects: seedProjects,
      equipment: seedEquipment,
      workOrders: seedWorkOrders,
      assets: seedAssets,
      vehicles: seedVehicles,
      fuelLogs: seedFuelLogs,
      warehouses: seedWarehouses,
      spareParts: seedSpareParts,
      tasks: seedTasks,
      tickets: seedTickets,
      auditLogs: seedAuditLogs,
      notifications: seedNotifications,
      settings: defaultSettings,
      payrollRuns: seedPayrollRuns,
      requests: seedRequests,
      emailConfig: defaultEmailConfig,
      smsConfig: defaultSmsConfig,
      mfaConfig: defaultMfaConfig,
      emailTemplates: defaultEmailTemplates,
      emailLogs: defaultEmailLogs,
      smsLogs: defaultSmsLogs,
      emailQueue: [],
      securityPolicy: defaultSecurityPolicy,
      userSecurityStates: generateUserSecurityStates(seedEmployees)
    };

    this.saveData(seedData);
    return seedData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save database file.', e);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public update(updater: (data: DatabaseSchema) => void) {
    updater(this.data);
    this.saveData(this.data);
  }

  public logActivity(userId: string, userName: string, role: string, actionType: AuditLog['actionType'], module: string, description: string, ip: string = '127.0.0.1') {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole: role as any,
      actionType,
      module,
      description,
      ipAddress: ip
    };
    this.data.auditLogs.unshift(newLog);
    this.saveData(this.data);
  }

  public addNotification(title: string, message: string, type: Notification['type'], module: string) {
    const newNtf: Notification = {
      id: `NTF-${Date.now()}`,
      title,
      message,
      type,
      module,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(newNtf);
    this.saveData(this.data);
  }
}

export const db = new Database();
