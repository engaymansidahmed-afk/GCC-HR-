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
  EmailConfig,
  SmsConfig,
  MfaConfig,
  EmailTemplate,
  EmailLog,
  SmsLog,
  QueueItem,
  AccountSecurityPolicy,
  UserSecurityState
} from './types';

export interface DatabaseSchema {
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

export const FALLBACK_SETTINGS: SystemSettings = {
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

export const FALLBACK_EMPLOYEES: Employee[] = [
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
    nationalId: '2283941029',
    passportNumber: 'Z9911023',
    visaStatus: 'Residency Permit (Iqama)',
    residencyExpiry: '2026-08-15',
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
  }
];

export const FALLBACK_PROJECTS: Project[] = [
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
  }
];

export const FALLBACK_EQUIPMENT: Equipment[] = [
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
  }
];

export const FALLBACK_VEHICLES: Vehicle[] = [
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
    registrationExpiry: '2026-07-15',
    insuranceExpiry: '2026-07-20',
    mileage: 82400,
    status: 'Assigned'
  }
];

export const FALLBACK_ATTENDANCE: Attendance[] = [
  {
    id: 'ATT-001',
    employeeId: 'EMP-2026-001',
    employeeName: 'Tariq Abdulaziz Al-Otaibi',
    date: new Date().toISOString().split('T')[0],
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
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:15:30',
    checkOut: '17:30:00',
    method: 'Web',
    overtimeHours: 0,
    lateMinutes: 15,
    status: 'Late'
  }
];

export const FALLBACK_LEAVES: LeaveRequest[] = [
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
  }
];

export const FALLBACK_LOANS: Loan[] = [
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

export const FALLBACK_TASKS: Task[] = [
  { 
    id: 'TSK-001', 
    title: 'Complete concrete pouring for Station 7-B', 
    description: 'Ensure quality safety metrics are signed off and concrete core test cylinders are scheduled.', 
    projectCode: 'PRJ-RYD-01', 
    assignedToId: 'EMP-2026-006', 
    assignedToName: 'Ahmed Faraj Al-Dossary', 
    priority: 'High', 
    status: 'In Progress', 
    deadline: '2026-06-30', 
    createdAt: '2026-06-20' 
  }
];

export const FALLBACK_NOTIFICATIONS: Notification[] = [
  { 
    id: 'NTF-001', 
    title: 'Iqama Expiring (50 Days)', 
    message: 'Iqama Resident Card for Rajesh Subramanian Kumar (EMP-2026-005) expires in 50 days.', 
    type: 'warning', 
    module: 'HR', 
    isRead: false, 
    createdAt: new Date().toISOString() 
  }
];

export const FALLBACK_PAYROLL_RUNS: PayrollRun[] = [
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

export const FALLBACK_STATE: DatabaseSchema = {
  employees: FALLBACK_EMPLOYEES,
  attendance: FALLBACK_ATTENDANCE,
  leaves: FALLBACK_LEAVES,
  loans: FALLBACK_LOANS,
  projects: FALLBACK_PROJECTS,
  equipment: FALLBACK_EQUIPMENT,
  workOrders: [
    {
      id: 'WO-2026-001',
      equipmentId: 'EQ-CAT-320D',
      equipmentName: 'Caterpillar 320D Excavator',
      type: 'Preventive',
      priority: 'Medium',
      description: 'Scheduled preventive service.',
      status: 'In Progress',
      assignedTechnician: 'Faisal Ahmed Al-Harbi',
      partsConsumed: [],
      cost: 450,
      scheduledDate: '2026-06-24',
      createdAt: '2026-06-20'
    }
  ],
  assets: [
    { id: 'AST-LP-02', name: 'Lenovo ThinkPad L14', type: 'Laptop', serialNumber: 'PF10X2B', assignedEmployeeId: 'EMP-2026-002', assignedEmployeeName: 'Sarah Khalid Al-Ghamdi', purchaseDate: '2023-05-18', purchaseCost: 4500, depreciationRate: 20, currentValue: 2700, status: 'Assigned' }
  ],
  vehicles: FALLBACK_VEHICLES,
  fuelLogs: [
    { id: 'FL-001', targetId: 'VEH-TOY-HIL01', targetName: 'Toyota Hilux Pickup 4x4 (4321 DXA)', targetType: 'Vehicle', fuelType: 'Diesel', quantityLiters: 65, unitCost: 1.15, totalCost: 74.75, date: '2026-06-24', operatorName: 'Faisal Ahmed Al-Harbi', location: 'Sulay Petrol Station, Riyadh' }
  ],
  warehouses: [
    { id: 'WH-RYD-MAIN', name: 'Riyadh Central Logistics Base', location: 'Sulay Area, Riyadh', manager: 'Sarah Khalid Al-Ghamdi' }
  ],
  spareParts: [
    { id: 'SP-CAT-FLT01', name: 'Caterpillar Hydraulic Filter Element', partNumber: '1R-0722', category: 'Hydraulics', warehouseId: 'WH-RYD-MAIN', warehouseName: 'Riyadh Central Logistics Base', quantityInStock: 12, reorderLevel: 4, unitCost: 280, barcode: '8829410722' }
  ],
  tasks: FALLBACK_TASKS,
  tickets: [
    { id: 'TCK-001', category: 'HR', title: 'Iqama renewal enquiry', description: 'Enquiring about the renewal of my residency permit.', employeeId: 'EMP-2026-005', employeeName: 'Rajesh Subramanian Kumar', priority: 'Medium', status: 'Assigned', assignedToName: 'Sarah Khalid Al-Ghamdi', createdAt: '2026-06-24' }
  ],
  auditLogs: [
    { id: 'AUD-001', timestamp: new Date().toISOString(), userId: 'EMP-2026-001', userName: 'Tariq Abdulaziz Al-Otaibi', userRole: 'Super Administrator', actionType: 'Login', module: 'Auth', description: 'Super Admin logged in successfully.', ipAddress: '127.0.0.1' }
  ],
  notifications: FALLBACK_NOTIFICATIONS,
  settings: FALLBACK_SETTINGS,
  payrollRuns: FALLBACK_PAYROLL_RUNS,
  requests: [],
  emailConfig: {
    provider: 'm365',
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpUser: 'hr-alerts@almansoori.com',
    smtpPassEncrypted: '******',
    secureMode: 'STARTTLS',
    senderEmail: 'hr-alerts@almansoori.com',
    senderName: 'Al-Mansoori HR Portal',
    replyTo: 'hr-helpdesk@almansoori.com',
    timeoutMs: 5000,
    maxRetries: 3,
    dailyLimit: 10000,
    enabled: true
  },
  smsConfig: {
    provider: 'taqny',
    apiKeyEncrypted: '******',
    secretEncrypted: '******',
    senderId: 'ALMANSOORI',
    dailyLimit: 2000,
    enabled: true
  },
  mfaConfig: {
    globalEnabled: false,
    enabledRoles: ['Super Administrator', 'HR Manager'],
    methods: ['email_otp', 'authenticator']
  },
  emailTemplates: [],
  emailLogs: [],
  smsLogs: [],
  emailQueue: [],
  securityPolicy: {
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
  },
  userSecurityStates: []
};
