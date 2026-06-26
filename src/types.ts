/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'Super Administrator'
  | 'HR Manager'
  | 'HR Officer'
  | 'Project Director'
  | 'Project Manager'
  | 'Department Manager'
  | 'Maintenance Manager'
  | 'Maintenance Technician'
  | 'Finance Manager'
  | 'Accountant'
  | 'Warehouse Manager'
  | 'Supervisor'
  | 'Employee'
  | 'Auditor'
  | 'Read-Only User';

export interface Employee {
  id: string; // Employee ID (e.g., EMP-2026-001)
  fullName: string;
  email: string;
  mobile: string;
  nationality: string;
  nationalId: string; // Iqama or Saudi ID
  passportNumber: string;
  visaStatus: string;
  residencyExpiry: string; // ISO date string
  passportExpiry: string; // ISO date string
  drivingLicense: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  department: string;
  position: string;
  reportingManager: string;
  projectAssignment: string; // Project Code or "HQ"
  employmentType: 'Full-Time' | 'Contract' | 'Part-Time' | 'Temporary';
  hireDate: string;
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  communicationAllowance: number;
  foodAllowance: number;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Onboarding' | 'Offboarded';
  photoUrl?: string;
  documents: EmployeeDocument[];
  grantedPermissions?: string[];
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: 'National ID' | 'Passport' | 'Visa' | 'Residency Permit' | 'Contract' | 'Certificate';
  fileNumber: string;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Expiring Soon';
  uploadedAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM:SS or null
  checkOut: string; // HH:MM:SS or null
  method: 'QR' | 'GPS' | 'Web' | 'Manual';
  locationName?: string;
  latitude?: number;
  longitude?: number;
  overtimeHours: number;
  lateMinutes: number;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual Leave' | 'Sick Leave' | 'Emergency Leave' | 'Unpaid Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Bereavement Leave' | 'Business Leave';
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  workflowStep: 'Supervisor' | 'Department Manager' | 'HR' | 'Completed';
  approvals: {
    supervisor?: { status: 'Approved' | 'Rejected'; by: string; date: string; comment?: string };
    deptManager?: { status: 'Approved' | 'Rejected'; by: string; date: string; comment?: string };
    hr?: { status: 'Approved' | 'Rejected'; by: string; date: string; comment?: string };
  };
  createdAt: string;
}

export interface Loan {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  monthlyInstallment: number;
  repaymentMonths: number;
  outstandingBalance: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Suspended' | 'Closed';
  installmentHistory: { month: string; amountPaid: number; date: string }[];
  createdAt: string;
}

export interface Project {
  code: string; // e.g., PRJ-RYD-01
  name: string;
  clientName: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  costToDate: number;
  projectManager: string;
  status: 'Planned' | 'Active' | 'On Hold' | 'Completed';
  progressPercent: number;
  workforceCount: number;
  equipmentCount: number;
}

export interface Equipment {
  id: string; // e.g., EQ-CAT-201
  name: string;
  category: 'Excavators' | 'Generators' | 'Loaders' | 'Cranes' | 'Compressors' | 'Other';
  model: string;
  manufacturer: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  currentLocation: string;
  assignedProject: string;
  assignedOperator: string;
  operatingHours: number;
  fuelRate: number; // liters per hour
  status: 'Active' | 'Idle' | 'Under Maintenance' | 'Out of Service' | 'Retired';
  lastServiceDate?: string;
  nextServiceHours?: number;
}

export interface MaintenanceWorkOrder {
  id: string; // WO-2026-001
  equipmentId: string;
  equipmentName: string;
  type: 'Preventive' | 'Corrective' | 'Predictive' | 'Emergency';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Waiting for Parts' | 'Completed' | 'Closed';
  assignedTechnician: string;
  partsConsumed: { partId: string; partName: string; quantity: number; unitCost: number }[];
  cost: number;
  scheduledDate: string;
  completedDate?: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'Laptop' | 'Mobile Phone' | 'Vehicle' | 'Tool' | 'Furniture' | 'Other';
  serialNumber: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  purchaseDate: string;
  purchaseCost: number;
  depreciationRate: number; // annual percentage, e.g. 20
  currentValue: number;
  status: 'Assigned' | 'Available' | 'Under Repair' | 'Disposed';
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  type: 'SUV' | 'Sedan' | 'Pickup Truck' | 'Crew Bus' | 'Flatbed Truck';
  assignedDriver: string;
  assignedProject: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  mileage: number;
  status: 'Active' | 'Available' | 'Assigned' | 'Under Maintenance' | 'Out of Service';
}

export interface FuelLog {
  id: string;
  targetId: string; // Vehicle or Equipment ID
  targetName: string;
  targetType: 'Vehicle' | 'Equipment';
  fuelType: 'Diesel' | 'Petrol';
  quantityLiters: number;
  unitCost: number;
  totalCost: number;
  date: string;
  operatorName: string;
  location: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  manager: string;
}

export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  category: 'Engine' | 'Hydraulics' | 'Filters' | 'Electrical' | 'Belts' | 'Tires' | 'General';
  warehouseId: string;
  warehouseName: string;
  quantityInStock: number;
  reorderLevel: number;
  unitCost: number;
  barcode: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectCode: string;
  assignedToId: string;
  assignedToName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Open' | 'Assigned' | 'In Progress' | 'On Hold' | 'Under Review' | 'Completed' | 'Closed';
  deadline: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  category: 'HR' | 'Payroll' | 'IT' | 'Maintenance' | 'Administrative' | 'Other';
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Waiting for Response' | 'Resolved' | 'Closed';
  assignedToName?: string;
  createdAt: string;
  resolutionText?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: 'Login' | 'Logout' | 'Create' | 'Update' | 'Delete' | 'Approval' | 'Payroll Run' | 'Config Change' | 'Security';
  module: string;
  description: string;
  ipAddress: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  module: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemSettings {
  companyName: string;
  commercialRegistration: string;
  hijriCalendarMode: boolean;
  currency: string;
  basicOvertimeRate: number; // e.g. 1.5
  holidayOvertimeRate: number; // e.g. 2.0
  allowanceTypes: string[];
  leavePolicies: { type: string; daysPerYear: number; paidPercent: number }[];
  departments: string[];
  positions: string[];
  branches: string[];
}

export interface PayrollEmployeeItem {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  branch: string;
  project: string;
  employmentType: string;
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  communicationAllowance: number;
  foodAllowance: number;
  otherAllowances: number;
  overtime: number;
  bonuses: number;
  incentives: number;
  commissions: number;
  loanDeductions: number;
  salaryAdvanceDeductions: number;
  gosi: number;
  taxes: number;
  otherDeductions: number;
  grossSalary: number;
  netSalary: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending';
  paymentDate?: string;
}

export interface PayrollRun {
  id: string; // e.g., PAY-2026-06
  month: string; // e.g., "06"
  year: number; // e.g., 2026
  status: 'Draft' | 'Approved_Officer' | 'Approved_Finance' | 'Approved_HR' | 'Approved_GM' | 'Locked';
  approvalWorkflow: {
    officer?: { status: 'Approved' | 'Rejected'; by: string; date: string; comment?: string };
    finance?: { status: 'Approved' | 'Rejected'; by: string; date: string; comment?: string };
    hr?: { status: 'Approved' | 'Rejected'; by: string; date: string; comment?: string };
    gm?: { status: 'Approved' | 'Rejected'; by: string; date: string; comment?: string };
  };
  employees: PayrollEmployeeItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalHistoryItem {
  level: number;
  levelName: string;
  approverName: string;
  action: 'Approved' | 'Rejected' | 'Returned' | 'Delegated' | 'Escalated' | 'Returned for Correction' | 'Submitted';
  date: string;
  comment: string;
  signature?: string; // Electronic signature representation
}

export interface EnterpriseRequest {
  id: string; // Request Number (e.g., REQ-2026-101)
  employeeId: string;
  employeeName: string;
  department: string;
  branch: string;
  jobTitle: string;
  category: 'HR' | 'Payroll' | 'Administrative' | 'Assets & Equipment' | 'IT' | 'Finance';
  requestType: string;
  requestDate: string;
  status: 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Returned for Correction' | 'Cancelled' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  currentLevel: number; // 1: Employee, 2: Direct Supervisor, 3: Department Manager, 4: HR Manager, 5: Finance Manager, 6: General Manager, 7: Completed
  currentLevelName: string;
  currentApprover: string;
  isFinancial: boolean;
  valueSAR: number;
  details: string;
  slaLimitHours: number;
  pendingDays: number;
  submissionDate: string;
  lastActionDate: string;
  history: ApprovalHistoryItem[];
  formData: Record<string, any>;
}

export type EmailProvider = 'm365' | 'gmail' | 'sendgrid' | 'ses' | 'mailgun' | 'brevo' | 'smtp';
export type SmsProvider = 'unifonic' | 'taqny' | 'twilio' | 'sns';

export interface EmailConfig {
  provider: EmailProvider;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassEncrypted: string; // Masked or encrypted
  secureMode: 'SSL' | 'TLS' | 'STARTTLS' | 'None';
  senderEmail: string;
  senderName: string;
  replyTo: string;
  timeoutMs: number;
  maxRetries: number;
  dailyLimit: number;
  enabled: boolean;
}

export interface SmsConfig {
  provider: SmsProvider;
  apiKeyEncrypted: string;
  secretEncrypted: string;
  senderId: string;
  dailyLimit: number;
  enabled: boolean;
}

export interface MfaConfig {
  globalEnabled: boolean;
  enabledRoles: string[]; // Role names
  methods: ('email_otp' | 'sms_otp' | 'authenticator')[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  subjectAr: string;
  body: string;
  bodyAr: string;
  language: 'en' | 'ar' | 'both';
  variables: string[];
  enabled: boolean;
}

export interface EmailLog {
  id: string;
  date: string;
  time: string;
  recipient: string;
  sender: string;
  subject: string;
  templateUsed: string;
  status: 'Sent' | 'Failed' | 'Retry Pending';
  failureReason?: string;
  retryCount: number;
  smtpResponse?: string;
  durationMs: number;
}

export interface SmsLog {
  id: string;
  recipient: string;
  message: string;
  provider: SmsProvider;
  status: 'Delivered' | 'Failed' | 'Pending';
  error?: string;
  retryCount: number;
  costSAR: number;
  date: string;
  time: string;
}

export interface QueueItem {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  message: string;
  templateId?: string;
  payload: any;
  status: 'Pending' | 'Sending' | 'Sent' | 'Failed';
  retries: number;
  maxRetries: number;
  scheduledFor?: string;
  createdAt: string;
  sentAt?: string;
  failureReason?: string;
}

export interface AccountSecurityPolicy {
  passwordLength: number;
  complexityNumbers: boolean;
  complexitySpecial: boolean;
  complexityUppercase: boolean;
  passwordExpirationDays: number;
  passwordHistoryLimit: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  forcedPasswordChangeOnCreate: boolean;
  inactiveAccountDisableDays: number;
}

export interface UserSecurityState {
  employeeId: string;
  username: string;
  hashedPassword?: string;
  tempPassword?: string;
  firstLoginResetRequired: boolean;
  isLocked: boolean;
  loginAttempts: number;
  lockReason?: string;
  lockTime?: string;
  sessionRevokedAt?: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  status: 'Active' | 'Locked' | 'Suspended' | 'Inactive';
  passwordSetDate: string;
}
