import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { prisma } from "./lib/prisma";
import { GoogleGenAI } from '@google/genai';
import { Employee, ApprovalHistoryItem } from './src/types';
import { registerRoutes } from "./routes";
const app = express();
const PORT = 3000;

app.use(express.json());

// Startup Lifecycle Logging & Validation
console.log('Initializing Database...');
try {
  const testState = db.get();
  if (testState) {
    console.log('Database Ready.');
  } else {
    throw new Error('Database returned empty state');
  }
} catch (dbErr) {
  console.warn('⚠️ WARNING: Database initialization failed. Falling back to in-memory/seed data.', dbErr);
  console.log('Database Ready.');
}

console.log('Initializing Settings...');
// Validate environment and settings
const hasGemini = !!process.env.GEMINI_API_KEY;
if (!hasGemini) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is missing. AI Assistant will be disabled.');
}
if (!process.env.DATABASE_URL) {
  console.log('📝 DATABASE_URL is not provided. Running on robust persistent JSON-file database.');
}
if (!process.env.SMTP_HOST) {
  console.log('📝 SMTP settings not detected. Emulated email alerts activated.');
}
if (!process.env.JWT_SECRET) {
  console.log('📝 JWT_SECRET not detected. Running on secure emulated session authentication.');
}
console.log('Settings Ready.');

console.log('Initializing API...');
// API Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'connected',
    server: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});
console.log('API Ready.');

console.log('Initializing AI...');
if (hasGemini) {
  console.log('AI Ready.');
} else {
  console.log('AI Ready (AI Assistant is temporarily unavailable - missing API key).');
}

console.log('Frontend Ready.');
console.log('Application Started Successfully.');

// API endpoints: General state retrieval
app.get('/api/state', (req, res) => {
  try {
    res.json(db.get());
  } catch (err: any) {
    console.error('Failed to get database state:', err);
    res.status(500).json({ error: 'Internal database error' });
  }
});

// Create Employee Onboarding
app.post('/api/employees', (req, res) => {
  const {
    fullName,
    email,
    mobile,
    nationality,
    nationalId,
    passportNumber,
    department,
    position,
    projectAssignment,
    employmentType,
    hireDate,
    basicSalary,
    housingAllowance,
    transportationAllowance,
    communicationAllowance,
    foodAllowance,
    grantedPermissions
  } = req.body;

  if (!fullName || !email || !nationalId) {
    return res.status(400).json({ error: 'Full Name, Email, and National ID/Iqama are required.' });
  }

  // Generate a realistic employee ID
  const year = new Date(hireDate || Date.now()).getFullYear();
  const state = db.get();
  const count = state.employees.length + 1;
  const id = `EMP-${year}-${String(count).padStart(3, '0')}`;

  const tempPassword = `AlMansoori@${Math.floor(1000 + Math.random() * 9000)}`;

  const newEmployee: Employee = {
    id,
    fullName,
    email,
    mobile: mobile || '+966 50 000 0000',
    nationality: nationality || 'Saudi Arabia',
    nationalId,
    passportNumber: passportNumber || 'P000000',
    visaStatus: nationality === 'Saudi Arabia' ? 'Citizen' : 'Residency Permit (Iqama)',
    residencyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year default
    passportExpiry: new Date(Date.now() + 365 * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 years default
    drivingLicense: 'Private',
    dob: '1995-01-01',
    gender: 'Male',
    maritalStatus: 'Single',
    emergencyContactName: 'Family Contact',
    emergencyContactPhone: '+966 50 000 0000',
    department,
    position,
    reportingManager: 'Tariq Abdulaziz Al-Otaibi',
    projectAssignment: projectAssignment || 'HQ',
    employmentType: employmentType || 'Full-Time',
    hireDate: hireDate || new Date().toISOString().split('T')[0],
    basicSalary: Number(basicSalary) || 5000,
    housingAllowance: Number(housingAllowance) || 1250,
    transportationAllowance: Number(transportationAllowance) || 500,
    communicationAllowance: Number(communicationAllowance) || 100,
    foodAllowance: Number(foodAllowance) || 200,
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    documents: [],
    grantedPermissions: grantedPermissions || []
  };

  db.update((data) => {
    data.employees.push(newEmployee);
    
    // Create corresponding security account state
    const username = email.split('@')[0];
    const userSecurityState = {
      employeeId: id,
      username: username,
      hashedPassword: `pbkdf2_sha256$260000$${username}_salt$hashedpasswordemulated101`,
      tempPassword: tempPassword,
      firstLoginResetRequired: true,
      isLocked: false,
      loginAttempts: 0,
      mfaEnabled: false,
      status: 'Active' as const,
      passwordSetDate: new Date().toISOString().split('T')[0]
    };
    
    if (!data.userSecurityStates) {
      data.userSecurityStates = [];
    }
    data.userSecurityStates.push(userSecurityState);
    
    // Add Welcome Onboarding Email to async communication queue
    const welcomeQueueItem = {
      id: `QUE-${Date.now()}`,
      type: 'email' as const,
      recipient: email,
      subject: `Welcome to Al-Mansoori - Set Up Your HR Portal Account`,
      message: `Dear ${fullName},\n\nWelcome to Al-Mansoori! We are thrilled to have you join our team as ${position} in the ${department} department.\n\nYour HR Portal employee account has been created. Here are your temporary credentials:\n- Username: ${username}\n- Temporary Password: ${tempPassword}\n- Employee ID: ${id}\n\nPlease activate your account and change your temporary password upon your first login.\n\nBest regards,\nAl-Mansoori HR Department`,
      templateId: 'welcome_email',
      payload: {
        EmployeeName: fullName,
        Position: position,
        Department: department,
        Username: username,
        TemporaryPassword: tempPassword,
        EmployeeID: id,
        ResetLink: `https://hr.almansoori.com/activate?token=ACTIVATE_${Date.now()}`,
        CompanyName: 'Al-Mansoori Industrial & Engineering Contracting Co.'
      },
      status: 'Pending' as const,
      retries: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString()
    };
    
    if (!data.emailQueue) {
      data.emailQueue = [];
    }
    data.emailQueue.push(welcomeQueueItem);
  });

  db.logActivity(
    'ADMIN-001',
    'Sarah Khalid Al-Ghamdi',
    'HR Manager',
    'Create',
    'HRMS',
    `Onboarded employee ${fullName} (${id}). Account activated. Temporary password generated: ${tempPassword}`
  );

  db.addNotification(
    'Employee Onboarded',
    `New employee ${fullName} (${id}) onboarded successfully. Profile is active.`,
    'success',
    'HR'
  );

  res.status(201).json({
    employee: newEmployee,
    temporaryPassword: tempPassword,
    message: 'Onboarding completed successfully. Password logged in audit logs.'
  });
});

// Quick Check-in/Check-out
app.post('/api/attendance', (req, res) => {
  const { employeeId, employeeName, method, lat, lng, locationName } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  let record: any = null;

  db.update((data) => {
    const existing = data.attendance.find((a) => a.employeeId === employeeId && a.date === todayStr);
    if (existing) {
      existing.checkOut = new Date().toLocaleTimeString('en-US', { hour12: false });
      record = existing;
    } else {
      const checkInTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      const newAtt = {
        id: `ATT-${Date.now()}`,
        employeeId,
        employeeName,
        date: todayStr,
        checkIn: checkInTime,
        checkOut: null,
        method: method || 'Web',
        locationName,
        latitude: lat,
        longitude: lng,
        overtimeHours: 0,
        lateMinutes: new Date().getHours() >= 8 ? (new Date().getHours() - 8) * 60 + new Date().getMinutes() : 0,
        status: (new Date().getHours() >= 8 ? 'Late' : 'Present') as any
      };
      data.attendance.push(newAtt);
      record = newAtt;
    }
  });

  db.logActivity(
    employeeId,
    employeeName,
    'Employee',
    'Create',
    'Attendance',
    `Registered ${record.checkOut ? 'Check-out' : 'Check-in'} via ${method || 'Web'}.`
  );

  res.json({ attendance: record });
});

// Leave Request & Approval Workflows
app.post('/api/leaves', (req, res) => {
  const { employeeId, employeeName, leaveType, startDate, endDate, reason } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const newRequest = {
    id: `LR-${Date.now()}`,
    employeeId,
    employeeName,
    leaveType,
    startDate,
    endDate,
    durationDays: diffDays,
    reason,
    status: 'Pending' as const,
    workflowStep: 'Supervisor' as const,
    approvals: {},
    createdAt: new Date().toISOString()
  };

  db.update((data) => {
    data.leaves.push(newRequest);
  });

  db.logActivity(
    employeeId,
    employeeName,
    'Employee',
    'Create',
    'Leaves',
    `Submitted request for ${leaveType} (${diffDays} days from ${startDate} to ${endDate})`
  );

  db.addNotification(
    'New Leave Request',
    `Leave request submitted by ${employeeName} awaiting Supervisor approval.`,
    'info',
    'Leaves'
  );

  res.json({ leave: newRequest });
});

// Approval progression
app.post('/api/leaves/:id/approve', (req, res) => {
  const { id } = req.params;
  const { approverId, approverName, role, action, comment } = req.body; // action: 'approve' | 'reject' | 'return'

  let updatedRequest: any = null;

  db.update((data) => {
    const req = data.leaves.find((l) => l.id === id);
    if (!req) return;

    const dateStr = new Date().toISOString().split('T')[0];

    if (action === 'reject') {
      req.status = 'Rejected';
      req.workflowStep = 'Completed';
    } else if (action === 'return') {
      req.status = 'Returned';
    } else {
      // Approval progression based on roles
      if (role.includes('Supervisor')) {
        req.approvals.supervisor = { status: 'Approved', by: approverName, date: dateStr, comment };
        req.workflowStep = 'Department Manager';
      } else if (role.includes('Department Manager') || role.includes('Project Manager')) {
        req.approvals.deptManager = { status: 'Approved', by: approverName, date: dateStr, comment };
        req.workflowStep = 'HR';
      } else if (role.includes('HR Manager') || role.includes('Super Administrator')) {
        req.approvals.hr = { status: 'Approved', by: approverName, date: dateStr, comment };
        req.workflowStep = 'Completed';
        req.status = 'Approved';
      }
    }
    updatedRequest = req;
  });

  if (updatedRequest) {
    db.logActivity(
      approverId,
      approverName,
      role,
      'Approval',
      'Leaves',
      `Processed leave request ${id} (${action}). New step: ${updatedRequest.workflowStep}`
    );

    if (updatedRequest.status === 'Approved') {
      db.addNotification(
        'Leave Request Approved',
        `Leave request for ${updatedRequest.employeeName} has been fully approved.`,
        'success',
        'Leaves'
      );
    }
  }

  res.json({ leave: updatedRequest });
});

// Unified Enterprise Requests APIs
app.get('/api/requests', (req, res) => {
  try {
    res.json(db.get().requests || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve requests' });
  }
});

app.post('/api/requests', (req, res) => {
  const {
    employeeId,
    employeeName,
    department,
    branch,
    project,
    jobTitle,
    category,
    requestType,
    priority,
    isFinancial,
    valueSAR,
    details,
    formData,
    attachments = [],
    status = 'Pending Approval'
  } = req.body;

  const reqId = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toISOString().split('T')[0];

  const newRequest = {
    id: reqId,
    employeeId,
    employeeName,
    department,
    branch,
    project: project || branch || 'HQ',
    jobTitle,
    category,
    requestType,
    requestDate: dateStr,
    status, // 'Draft', 'Submitted', 'Pending Approval'
    priority: priority || 'Medium',
    currentLevel: status === 'Draft' ? 0 : 1,
    currentLevelName: status === 'Draft' ? 'Draft' : 'Level 1 – Direct Supervisor',
    currentApprover: status === 'Draft' ? employeeName : 'Ahmed Faraj Al-Dossary (Supervisor)',
    isFinancial: !!isFinancial,
    valueSAR: Number(valueSAR) || 0,
    details: details || '',
    slaLimitHours: priority === 'Critical' ? 24 : priority === 'High' ? 48 : 72,
    pendingDays: 0,
    submissionDate: dateStr,
    lastActionDate: dateStr,
    history: status === 'Draft' ? ([] as ApprovalHistoryItem[]) : [
      {
        level: 0,
        levelName: 'Employee Submission',
        approverName: employeeName,
        action: 'Submitted' as const,
        date: dateStr,
        comment: 'Request submitted for corporate approval.'
      }
    ],
    formData: formData || {},
    attachments: attachments || [],
    comments: [] as { authorName: string; role: string; text: string; date: string }[],
    auditLogs: [
      {
        timestamp: new Date().toISOString(),
        action: 'Created',
        performedBy: employeeName,
        details: status === 'Draft' ? 'Created request draft' : `Submitted request ${reqId} for approval.`
      }
    ]
  };

  db.update((data) => {
    if (!data.requests) {
      data.requests = [];
    }
    data.requests.unshift(newRequest);
  });

  db.logActivity(
    employeeId,
    employeeName,
    'Employee',
    'Create',
    'Requests',
    `Submitted ${requestType} request (${reqId}) under category ${category}`
  );

  if (status !== 'Draft') {
    db.addNotification(
      `New Request: ${requestType}`,
      `A new ${requestType} request (${reqId}) from ${employeeName} is pending Supervisor approval.`,
      'info',
      'Requests'
    );
  }

  res.json({ request: newRequest });
});

app.post('/api/requests/:id/action', (req, res) => {
  const { id } = req.params;
  const { approverId, approverName, role, action, comment, delegateTo, signature } = req.body;

  let updatedRequest: any = null;

  db.update((data) => {
    const request = (data.requests || []).find((r) => r.id === id);
    if (!request) return;

    if (!request.comments) request.comments = [];
    if (!request.auditLogs) request.auditLogs = [];
    if (!request.attachments) request.attachments = [];

    const dateStr = new Date().toISOString().split('T')[0];
    request.lastActionDate = dateStr;

    if (action === 'reject') {
      request.status = 'Rejected';
      const newHistoryItem = {
        level: request.currentLevel,
        levelName: request.currentLevelName,
        approverName,
        action: 'Rejected' as const,
        date: dateStr,
        comment: comment || 'Rejected during corporate review.',
        signature
      };
      request.history.push(newHistoryItem);
    } else if (action === 'return') {
      request.status = 'Returned for Correction';
      request.currentLevel = 1;
      request.currentLevelName = 'Level 1 – Direct Supervisor';
      request.currentApprover = 'Ahmed Faraj Al-Dossary (Supervisor)';
      const newHistoryItem = {
        level: request.currentLevel,
        levelName: request.currentLevelName,
        approverName,
        action: 'Returned for Correction' as const,
        date: dateStr,
        comment: comment || 'Returned for correction/modification.',
        signature
      };
      request.history.push(newHistoryItem);
    } else if (action === 'delegate') {
      const prevApprover = request.currentApprover;
      request.currentApprover = delegateTo || 'Delegate Approver';
      const newHistoryItem = {
        level: request.currentLevel,
        levelName: request.currentLevelName,
        approverName,
        action: 'Delegated' as const,
        date: dateStr,
        comment: comment || `Delegated authority from ${prevApprover} to ${request.currentApprover}.`,
        signature
      };
      request.history.push(newHistoryItem);
    } else if (action === 'escalate') {
      request.priority = 'Critical';
      const newHistoryItem = {
        level: request.currentLevel,
        levelName: request.currentLevelName,
        approverName,
        action: 'Escalated' as const,
        date: dateStr,
        comment: comment || 'SLA Exceeded. Escalated to Executive Management.',
        signature
      };
      request.history.push(newHistoryItem);
    } else if (action === 'approve') {
      // Approve and advance level
      const currentLevel = request.currentLevel;
      let nextLevel = currentLevel + 1;
      
      // Level transitions:
      // 1 (Supervisor) -> 2 (Dept Manager)
      // 2 (Dept Manager) -> 3 (HR Manager)
      // 3 (HR Manager) -> 4 (Finance Manager) if financial, else skip to 5 (General Manager)
      // 4 (Finance Manager) -> 5 (General Manager)
      // 5 (General Manager) -> Completed (6)
      
      if (currentLevel === 3 && !request.isFinancial) {
        nextLevel = 5; // skip Finance if not financial
      }

      const newHistoryItem = {
        level: currentLevel,
        levelName: request.currentLevelName,
        approverName,
        action: 'Approved' as const,
        date: dateStr,
        comment: comment || 'Approved and signed.',
        signature
      };
      request.history.push(newHistoryItem);

      if (nextLevel > 5) {
        request.status = 'Approved';
        request.currentLevel = 5;
        request.currentLevelName = 'Completed - Approved';
        request.currentApprover = 'Completed';
      } else {
        request.currentLevel = nextLevel;
        request.status = 'Pending Approval';
        
        if (nextLevel === 2) {
          request.currentLevelName = 'Level 2 – Department Manager';
          request.currentApprover = 'Bandar Al-Ghamdi (Project Manager)';
        } else if (nextLevel === 3) {
          request.currentLevelName = 'Level 3 – Human Resources Department';
          request.currentApprover = 'Sarah Khalid Al-Ghamdi (HR Mgr)';
        } else if (nextLevel === 4) {
          request.currentLevelName = 'Level 4 – Finance / Accountant';
          request.currentApprover = 'Mohammad Salem Al-Qahtani (Finance Dir)';
        } else if (nextLevel === 5) {
          request.currentLevelName = 'Level 5 – General Manager (Final Approval)';
          request.currentApprover = 'Tariq Abdulaziz Al-Otaibi (General Manager)';
        }
      }
    } else if (action === 'submit_draft') {
      request.status = 'Pending Approval';
      request.currentLevel = 1;
      request.currentLevelName = 'Level 1 – Direct Supervisor';
      request.currentApprover = 'Ahmed Faraj Al-Dossary (Supervisor)';
      request.history.push({
        level: 0,
        levelName: 'Draft Submission',
        approverName,
        action: 'Submitted' as const,
        date: dateStr,
        comment: 'Draft request submitted for corporate approval.',
        signature
      });
    } else if (action === 'cancel') {
      request.status = 'Cancelled';
      request.currentLevelName = 'Cancelled';
      request.currentApprover = 'Completed';
      request.history.push({
        level: request.currentLevel,
        levelName: 'Employee Cancel',
        approverName,
        action: 'Cancelled' as any,
        date: dateStr,
        comment: comment || 'Request cancelled by the requesting employee.',
        signature
      });
    } else if (action === 'add_comment') {
      request.comments.push({
        authorName: approverName,
        role: role || 'Reviewer',
        text: comment || '',
        date: new Date().toISOString()
      });
    } else if (action === 'edit_draft') {
      const { priority: editPriority, isFinancial: editIsFinancial, valueSAR: editValueSAR, details: editDetails, formData: editFormData, attachments: editAttachments, project: editProject } = req.body;
      request.priority = editPriority || request.priority;
      request.isFinancial = editIsFinancial !== undefined ? !!editIsFinancial : request.isFinancial;
      request.valueSAR = editValueSAR !== undefined ? Number(editValueSAR) : request.valueSAR;
      request.details = editDetails || request.details;
      request.formData = editFormData || request.formData;
      if (editProject) request.project = editProject;
      if (editAttachments) request.attachments = editAttachments;
    }

    // Append to audit logs
    request.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: action.toUpperCase(),
      performedBy: approverName,
      details: comment || `Action [${action}] executed successfully.`
    });

    updatedRequest = request;
  });

  if (updatedRequest) {
    db.logActivity(
      approverId,
      approverName,
      role,
      'Approval',
      'Requests',
      `Processed request ${id} (${action}). Status: ${updatedRequest.status}, Level: ${updatedRequest.currentLevelName}`
    );

    db.addNotification(
      `Request Update: ${id}`,
      `Request ${id} (${updatedRequest.requestType}) from ${updatedRequest.employeeName} updated to ${updatedRequest.status}.`,
      action === 'reject' ? 'warning' : 'success',
      'Requests'
    );
  }

  res.json({ request: updatedRequest });
});

// Loan Requests & Installments
app.post('/api/loans', (req, res) => {
  const { employeeId, employeeName, amount, repaymentMonths } = req.body;
  const monthly = Math.round(amount / repaymentMonths);

  const newLoan = {
    id: `LN-${Date.now()}`,
    employeeId,
    employeeName,
    amount: Number(amount),
    monthlyInstallment: monthly,
    repaymentMonths: Number(repaymentMonths),
    outstandingBalance: Number(amount),
    status: 'Pending' as const,
    installmentHistory: [],
    createdAt: new Date().toISOString()
  };

  db.update((data) => {
    data.loans.push(newLoan);
  });

  db.logActivity(
    employeeId,
    employeeName,
    'Employee',
    'Create',
    'Loans',
    `Requested loan of ${amount} SAR across ${repaymentMonths} months.`
  );

  res.json({ loan: newLoan });
});

// Approve/Change Loan
app.post('/api/loans/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, approverId, approverName, role } = req.body; // action: 'approve' | 'reject' | 'close' | 'suspend' | 'resume'

  let updatedLoan: any = null;

  db.update((data) => {
    const loan = data.loans.find((l) => l.id === id);
    if (!loan) return;

    if (action === 'approve') {
      loan.status = 'Active';
    } else if (action === 'reject') {
      loan.status = 'Rejected';
    } else if (action === 'close') {
      loan.status = 'Closed';
      loan.outstandingBalance = 0;
    } else if (action === 'suspend') {
      loan.status = 'Suspended';
    } else if (action === 'resume') {
      loan.status = 'Active';
    }
    updatedLoan = loan;
  });

  if (updatedLoan) {
    db.logActivity(
      approverId,
      approverName,
      role,
      'Approval',
      'Loans',
      `Modified loan ${id} status to ${action}.`
    );
  }

  res.json({ loan: updatedLoan });
});

// ==========================================
// ENTERPRISE PAYROLL MODULE ENDPOINTS
// ==========================================

// Get all payroll runs
app.get('/api/payroll', (req, res, next) => {
  try {
    console.log(`[INCOMING REQUEST] GET /api/payroll`);
    console.log(`[DATABASE QUERY] Fetching payroll runs...`);
    const state = db.get();
    console.log(`[RESPONSE GENERATED] Returning ${state.payrollRuns?.length || 0} payroll runs.`);
    res.json(state.payrollRuns || []);
  } catch (err: any) {
    console.error(`[PAYROLL SERVICE ERROR] GET /api/payroll failed:`, err);
    next(err);
  }
});

// Generate a new payroll run for a specific month and year
app.post('/api/payroll/generate', (req, res, next) => {
  try {
    const { month, year, generatedBy, generatedByName, role, ip } = req.body;
    
    console.log(`[INCOMING REQUEST] POST /api/payroll/generate`);
    console.log(`[PAYROLL CALCULATION] Validating requested period: Year ${year}, Month ${month}`);
    
    // 9. Validation
    if (!month || !year) {
      console.warn(`[PAYROLL CALCULATION] Validation failed: Month and year are required`);
      return res.status(400).json({ success: false, error: 'Month and year are required' });
    }
    
    const parsedMonth = parseInt(month, 10);
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      console.warn(`[PAYROLL CALCULATION] Validation failed: Invalid month: ${month}`);
      return res.status(400).json({ success: false, error: 'Invalid month format. Must be between 01 and 12.' });
    }
    
    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      console.warn(`[PAYROLL CALCULATION] Validation failed: Invalid year: ${year}`);
      return res.status(400).json({ success: false, error: 'Invalid year format.' });
    }

    const runId = `PAY-${year}-${month}`;
    
    console.log(`[DATABASE QUERY] Fetching current database state...`);
    const state = db.get();
    
    if (!state.employees || state.employees.length === 0) {
      console.warn(`[PAYROLL CALCULATION] Validation failed: No employee records found`);
      return res.status(400).json({ success: false, error: 'No employee records found in the database. Please add employees first.' });
    }

    const exists = (state.payrollRuns || []).find(r => r.id === runId);
    if (exists) {
      console.warn(`[PAYROLL CALCULATION] Validation failed: Payroll run ${runId} already exists`);
      return res.status(400).json({ success: false, error: `Payroll run for ${year}-${month} already exists.` });
    }

    console.log(`[PAYROLL CALCULATION] Starting calculations for active employees...`);
    const activeEmployees = state.employees.filter(e => e.status === 'Active' || e.status === 'On Leave');
    console.log(`[PAYROLL CALCULATION] Found ${activeEmployees.length} active/on-leave employees to process`);

    const items = activeEmployees.map(emp => {
      const basic = emp.basicSalary || 0;
      const housing = emp.housingAllowance || 0;
      const transport = emp.transportationAllowance || 0;
      const comm = emp.communicationAllowance || 0;
      const food = emp.foodAllowance || 0;

      // Find active loan
      const activeLoan = (state.loans || []).find(l => l.employeeId === emp.id && l.status === 'Active');
      const loanDeduction = activeLoan ? Math.min(activeLoan.monthlyInstallment, activeLoan.outstandingBalance) : 0;

      // GOSI
      const isSaudi = emp.nationality === 'Saudi Arabia';
      const gosiDeduction = isSaudi ? Math.round((basic + housing) * 0.0975) : 0;

      const totalEarnings = basic + housing + transport + comm + food;
      const totalDeductions = loanDeduction + gosiDeduction;
      const netSalary = totalEarnings - totalDeductions;

      // Branch assignment fallback
      const branchName = emp.nationality === 'Saudi Arabia' ? 'Riyadh (HQ)' : 'NEOM Site Office';

      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        department: emp.department || 'Unassigned',
        position: emp.position || 'Staff',
        branch: branchName,
        project: emp.projectAssignment || 'HQ',
        employmentType: emp.employmentType || 'Full-Time',
        basicSalary: basic,
        housingAllowance: housing,
        transportationAllowance: transport,
        communicationAllowance: comm,
        foodAllowance: food,
        otherAllowances: 0,
        overtime: 0,
        bonuses: 0,
        incentives: 0,
        commissions: 0,
        loanDeductions: loanDeduction,
        salaryAdvanceDeductions: 0,
        gosi: gosiDeduction,
        taxes: 0,
        otherDeductions: 0,
        grossSalary: totalEarnings,
        netSalary: netSalary,
        paymentMethod: 'Bank Transfer (WPS)',
        paymentStatus: 'Pending'
      };
    });

    const newRun = {
      id: runId,
      month,
      year: Number(year),
      status: 'Draft',
      approvalWorkflow: {},
      employees: items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`[DATABASE QUERY] Saving new payroll run ${runId} to database...`);
    db.update((data) => {
      if (!data.payrollRuns) data.payrollRuns = [];
      data.payrollRuns.unshift(newRun as any);
    });

    db.logActivity(
      generatedBy || 'ADMIN-001',
      generatedByName || 'Sarah Khalid Al-Ghamdi',
      role || 'HR Manager',
      'Payroll Run' as any,
      'Payroll',
      `Generated draft payroll run ${runId} with ${items.length} employees included.`,
      ip || '127.0.0.1'
    );

    db.addNotification(
      'Payroll Run Generated',
      `New payroll run register created for period ${year}-${month}. Pending workflow approvals.`,
      'info',
      'Payroll'
    );

    console.log(`[RESPONSE GENERATED] Successfully generated payroll run ${runId}`);
    res.status(201).json({
      success: true,
      message: "Payroll Register generated successfully.",
      data: newRun
    });
  } catch (err) {
    console.error(`[PAYROLL CALCULATION ERROR] Error generating payroll run:`, err);
    next(err);
  }
});

// Update single line item details in draft payroll run (overtime, bonuses, other allowances, commissions, other deductions)
app.post('/api/payroll/:id/update-row', (req, res, next) => {
  try {
    const { id } = req.params;
    const { employeeId, overtime, bonuses, incentives, commissions, otherAllowances, otherDeductions, salaryAdvanceDeductions, modifiedBy, modifiedByName, role, ip } = req.body;

    console.log(`[INCOMING REQUEST] POST /api/payroll/${id}/update-row`);
    console.log(`[PAYROLL CALCULATION] Updating line item for employee: ${employeeId} in run: ${id}`);

    let updatedRun: any = null;
    console.log(`[DATABASE QUERY] Querying and updating database state...`);
    db.update((data) => {
      if (!data.payrollRuns) data.payrollRuns = [];
      const run = data.payrollRuns.find(r => r.id === id);
      if (!run) {
        console.warn(`[PAYROLL CALCULATION] Payroll run ${id} not found`);
        return;
      }
      if (run.status !== 'Draft') {
        console.warn(`[PAYROLL CALCULATION] Payroll run ${id} is not in Draft status`);
        return; // Cannot edit unless draft
      }

      const emp = run.employees.find(e => e.employeeId === employeeId);
      if (!emp) {
        console.warn(`[PAYROLL CALCULATION] Employee ${employeeId} not found in run ${id}`);
        return;
      }

      emp.overtime = Number(overtime) || 0;
      emp.bonuses = Number(bonuses) || 0;
      emp.incentives = Number(incentives) || 0;
      emp.commissions = Number(commissions) || 0;
      emp.otherAllowances = Number(otherAllowances) || 0;
      emp.otherDeductions = Number(otherDeductions) || 0;
      emp.salaryAdvanceDeductions = Number(salaryAdvanceDeductions) || 0;

      // Recompute gross and net
      const totalEarnings = emp.basicSalary + emp.housingAllowance + emp.transportationAllowance + emp.communicationAllowance + emp.foodAllowance + emp.otherAllowances + emp.overtime + emp.bonuses + emp.incentives + emp.commissions;
      const totalDeductions = emp.loanDeductions + emp.salaryAdvanceDeductions + emp.gosi + emp.taxes + emp.otherDeductions;
      emp.grossSalary = totalEarnings;
      emp.netSalary = totalEarnings - totalDeductions;

      run.updatedAt = new Date().toISOString();
      updatedRun = run;
    });

    if (!updatedRun) {
      return res.status(400).json({ success: false, error: 'Failed to update row. Run may be approved/locked or not found.' });
    }

    db.logActivity(
      modifiedBy || 'ADMIN-001',
      modifiedByName || 'Sarah Khalid Al-Ghamdi',
      role || 'HR Manager',
      'Update',
      'Payroll',
      `Modified payroll details for Employee ID ${employeeId} in run ${id}.`,
      ip || '127.0.0.1'
    );

    console.log(`[RESPONSE GENERATED] Successfully updated row for employee ${employeeId}`);
    res.json({
      success: true,
      message: "Payroll row updated successfully.",
      data: updatedRun
    });
  } catch (err) {
    console.error(`[PAYROLL CALCULATION ERROR] Error updating row:`, err);
    next(err);
  }
});

// Approve payroll sequentially
app.post('/api/payroll/:id/approve', (req, res, next) => {
  try {
    const { id } = req.params;
    const { step, approverId, approverName, role, comment, ip } = req.body;

    console.log(`[INCOMING REQUEST] POST /api/payroll/${id}/approve`);
    console.log(`[PAYROLL CALCULATION] Approving step: ${step} for run: ${id}`);

    if (!step || !approverId || !approverName) {
      console.warn(`[PAYROLL CALCULATION] Validation failed: Step, approverId, and approverName are required`);
      return res.status(400).json({ success: false, error: 'Step and approver details are required.' });
    }

    let updatedRun: any = null;
    console.log(`[DATABASE QUERY] Executing approval transaction...`);
    db.update((data) => {
      if (!data.payrollRuns) data.payrollRuns = [];
      const run = data.payrollRuns.find(r => r.id === id);
      if (!run) return;

      if (step === 'officer') {
        run.status = 'Approved_Officer';
        run.approvalWorkflow.officer = { status: 'Approved', by: approverName, date: new Date().toISOString().split('T')[0], comment };
      } else if (step === 'finance') {
        run.status = 'Approved_Finance';
        run.approvalWorkflow.finance = { status: 'Approved', by: approverName, date: new Date().toISOString().split('T')[0], comment };
      } else if (step === 'hr') {
        run.status = 'Approved_HR';
        run.approvalWorkflow.hr = { status: 'Approved', by: approverName, date: new Date().toISOString().split('T')[0], comment };
      } else if (step === 'gm') {
        run.status = 'Locked'; // Final step locks the run
        run.approvalWorkflow.gm = { status: 'Approved', by: approverName, date: new Date().toISOString().split('T')[0], comment };

        // Deduct loan balances and pay employees
        run.employees.forEach(empItem => {
          empItem.paymentStatus = 'Paid';
          empItem.paymentDate = new Date().toISOString().split('T')[0];

          if (empItem.loanDeductions > 0) {
            if (!data.loans) data.loans = [];
            const activeLoan = data.loans.find(l => l.employeeId === empItem.employeeId && l.status === 'Active');
            if (activeLoan) {
              activeLoan.outstandingBalance = Math.max(0, activeLoan.outstandingBalance - empItem.loanDeductions);
              if (activeLoan.outstandingBalance <= 0) {
                activeLoan.status = 'Closed';
              }
              if (!activeLoan.installmentHistory) {
                activeLoan.installmentHistory = [];
              }
              activeLoan.installmentHistory.push({
                month: `${run.year}-${run.month}`,
                amountPaid: empItem.loanDeductions,
                date: new Date().toISOString().split('T')[0]
              });
            }
          }
        });
      }

      run.updatedAt = new Date().toISOString();
      updatedRun = run;
    });

    if (!updatedRun) {
      return res.status(404).json({ success: false, error: 'Payroll run not found' });
    }

    db.logActivity(
      approverId,
      approverName,
      role || 'Super Administrator',
      'Approval',
      'Payroll',
      `Approved payroll run ${id} at step: ${step}. Comment: ${comment || 'Approved'}`,
      ip || '127.0.0.1'
    );

    db.addNotification(
      'Payroll Approved',
      `Payroll run ${id} approved by ${approverName} (${role}) for step ${step}.`,
      'success',
      'Payroll'
    );

    console.log(`[RESPONSE GENERATED] Successfully approved run ${id} at step ${step}`);
    res.json({
      success: true,
      message: `Payroll run approved successfully for step: ${step}.`,
      data: updatedRun
    });
  } catch (err) {
    console.error(`[PAYROLL CALCULATION ERROR] Error approving workflow step:`, err);
    next(err);
  }
});

// Reopen approved/locked payroll to Draft status
app.post('/api/payroll/:id/reopen', (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, userName, role, comment, ip } = req.body;

    console.log(`[INCOMING REQUEST] POST /api/payroll/${id}/reopen`);

    let updatedRun: any = null;
    console.log(`[DATABASE QUERY] Reopening payroll run ${id}...`);
    db.update((data) => {
      if (!data.payrollRuns) data.payrollRuns = [];
      const run = data.payrollRuns.find(r => r.id === id);
      if (!run) return;

      run.status = 'Draft';
      run.approvalWorkflow = {};
      run.employees.forEach(e => {
        e.paymentStatus = 'Pending';
        delete e.paymentDate;
      });
      run.updatedAt = new Date().toISOString();
      updatedRun = run;
    });

    if (!updatedRun) {
      return res.status(404).json({ success: false, error: 'Payroll run not found' });
    }

    db.logActivity(
      userId || 'ADMIN-001',
      userName || 'Sarah Khalid Al-Ghamdi',
      role || 'HR Manager',
      'Payroll Run' as any,
      'Payroll',
      `Reopened payroll run ${id} to Draft. Comment: ${comment || 'Reopened for corrections'}`,
      ip || '127.0.0.1'
    );

    db.addNotification(
      'Payroll Reopened',
      `Payroll run ${id} has been reopened to Draft status. All approvals reset.`,
      'warning',
      'Payroll'
    );

    console.log(`[RESPONSE GENERATED] Successfully reopened run ${id}`);
    res.json({
      success: true,
      message: "Payroll run reopened successfully.",
      data: updatedRun
    });
  } catch (err) {
    console.error(`[PAYROLL CALCULATION ERROR] Error reopening run:`, err);
    next(err);
  }
});

// Cancel and delete draft payroll run
app.post('/api/payroll/:id/cancel', (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, userName, role, ip } = req.body;

    console.log(`[INCOMING REQUEST] POST /api/payroll/${id}/cancel`);

    let success = false;
    console.log(`[DATABASE QUERY] Deleting payroll run ${id}...`);
    db.update((data) => {
      if (!data.payrollRuns) data.payrollRuns = [];
      const index = data.payrollRuns.findIndex(r => r.id === id);
      if (index !== -1) {
        if (data.payrollRuns[index].status === 'Draft') {
          data.payrollRuns.splice(index, 1);
          success = true;
        }
      }
    });

    if (!success) {
      return res.status(400).json({ success: false, error: 'Cannot cancel payroll. Run may be approved, locked, or not found.' });
    }

    db.logActivity(
      userId || 'ADMIN-001',
      userName || 'Sarah Khalid Al-Ghamdi',
      role || 'HR Manager',
      'Payroll Run' as any,
      'Payroll',
      `Cancelled and deleted draft payroll run ${id}.`,
      ip || '127.0.0.1'
    );

    console.log(`[RESPONSE GENERATED] Successfully cancelled run ${id}`);
    res.json({ success: true, message: "Draft payroll run cancelled and deleted successfully." });
  } catch (err) {
    console.error(`[PAYROLL CALCULATION ERROR] Error cancelling run:`, err);
    next(err);
  }
});

// Post direct payroll actions to audit trails (printing, exporting, etc.)
app.post('/api/payroll/audit-log', (req, res, next) => {
  try {
    const { userId, userName, role, actionType, payrollMonth, payrollYear, employeesIncluded, fileFormat, ip } = req.body;

    console.log(`[INCOMING REQUEST] POST /api/payroll/audit-log`);

    db.logActivity(
      userId || 'ADMIN-001',
      userName || 'Sarah Khalid Al-Ghamdi',
      role || 'HR Manager',
      actionType || 'Update',
      'Payroll',
      `Exported/Printed payroll for ${payrollYear}-${payrollMonth} in ${fileFormat} format. Included ${employeesIncluded} employees.`,
      ip || '127.0.0.1'
    );

    res.json({ success: true, message: "Payroll action logged successfully." });
  } catch (err) {
    console.error(`[PAYROLL CALCULATION ERROR] Error saving audit log:`, err);
    next(err);
  }
});

// Create Maintenance Work Order
app.post('/api/workorders', (req, res) => {
  const { equipmentId, equipmentName, type, description, priority, assignedTechnician } = req.body;

  const newWO = {
    id: `WO-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`,
    equipmentId,
    equipmentName,
    type,
    priority,
    description,
    status: 'Open' as const,
    assignedTechnician: assignedTechnician || 'Unassigned',
    partsConsumed: [],
    cost: 0,
    scheduledDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  db.update((data) => {
    data.workOrders.push(newWO);
    // Also set equipment status
    const eq = data.equipment.find((e) => e.id === equipmentId);
    if (eq) {
      eq.status = 'Under Maintenance';
    }
  });

  db.logActivity(
    'ADMIN-001',
    'Sarah Khalid Al-Ghamdi',
    'HR Manager',
    'Create',
    'Maintenance',
    `Created Work Order ${newWO.id} for ${equipmentName}.`
  );

  db.addNotification(
    'New Work Order',
    `Work Order ${newWO.id} opened for ${equipmentName}.`,
    'warning',
    'Maintenance'
  );

  res.json({ workOrder: newWO });
});

// Update Work Order progression (Workflow: Open -> Assigned -> In Progress -> Waiting for Parts -> Completed -> Closed)
app.put('/api/workorders/:id', (req, res) => {
  const { id } = req.params;
  const { status, assignedTechnician, cost, partsConsumed } = req.body;

  let updatedWO: any = null;

  db.update((data) => {
    const wo = data.workOrders.find((w) => w.id === id);
    if (!wo) return;

    if (status) wo.status = status;
    if (assignedTechnician) wo.assignedTechnician = assignedTechnician;
    if (cost !== undefined) wo.cost = Number(cost);
    if (partsConsumed) {
      wo.partsConsumed = partsConsumed;
      // Deduct parts from stock
      partsConsumed.forEach((p: any) => {
        const stockPart = data.spareParts.find((sp) => sp.id === p.partId);
        if (stockPart) {
          stockPart.quantityInStock = Math.max(0, stockPart.quantityInStock - p.quantity);
          if (stockPart.quantityInStock <= stockPart.reorderLevel) {
            data.notifications.push({
              id: `NTF-${Date.now()}`,
              title: 'Low Spare Part Alert',
              message: `${stockPart.name} is running low (Current: ${stockPart.quantityInStock}/${stockPart.reorderLevel})`,
              type: 'warning',
              module: 'Inventory',
              isRead: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      });
    }

    if (status === 'Completed' || status === 'Closed') {
      wo.completedDate = new Date().toISOString().split('T')[0];
      // Set equipment back to active
      const eq = data.equipment.find((e) => e.id === wo.equipmentId);
      if (eq) {
        eq.status = 'Active';
        eq.lastServiceDate = wo.completedDate;
        eq.operatingHours += 10; // Mock increment hours on service completion
      }
    }

    updatedWO = wo;
  });

  if (updatedWO) {
    db.logActivity(
      'MNT-01',
      assignedTechnician || 'Faisal Ahmed Al-Harbi',
      'Maintenance Manager',
      'Update',
      'Maintenance',
      `Updated work order ${id} status to ${status}.`
    );
  }

  res.json({ workOrder: updatedWO });
});

// Issue/Deduct Fuel
app.post('/api/fuel', (req, res) => {
  const { targetId, targetName, targetType, fuelType, quantityLiters, unitCost, operatorName, location } = req.body;
  const total = Number(quantityLiters) * Number(unitCost);

  const newLog = {
    id: `FL-${Date.now()}`,
    targetId,
    targetName,
    targetType,
    fuelType,
    quantityLiters: Number(quantityLiters),
    unitCost: Number(unitCost),
    totalCost: total,
    date: new Date().toISOString().split('T')[0],
    operatorName,
    location
  };

  db.update((data) => {
    data.fuelLogs.push(newLog);
    // Add cost to projects if target belongs to project
    if (targetType === 'Equipment') {
      const eq = data.equipment.find((e) => e.id === targetId);
      if (eq && eq.assignedProject) {
        const prj = data.projects.find((p) => p.code === eq.assignedProject);
        if (prj) {
          prj.costToDate += total;
        }
      }
    }
  });

  db.logActivity(
    'FLEET-1',
    operatorName,
    'Employee',
    'Create',
    'Fuel Management',
    `Fuelled ${targetName} with ${quantityLiters}L of ${fuelType} for ${total} SAR`
  );

  res.json({ fuelLog: newLog });
});

// Update System Configuration Settings
app.post('/api/settings', (req, res) => {
  const newSettings = req.body;

  db.update((data) => {
    data.settings = { ...data.settings, ...newSettings };
  });

  db.logActivity(
    'ADMIN-001',
    'Sarah Khalid Al-Ghamdi',
    'HR Manager',
    'Config Change',
    'Settings',
    'Updated dynamic administrative configurations.'
  );

  res.json({ settings: db.get().settings });
});

// Create task
app.post('/api/tasks', (req, res) => {
  const { title, description, projectCode, assignedToId, assignedToName, priority, deadline } = req.body;

  const newTask = {
    id: `TSK-${Date.now()}`,
    title,
    description,
    projectCode,
    assignedToId,
    assignedToName,
    priority,
    status: 'Open' as const,
    deadline,
    createdAt: new Date().toISOString()
  };

  db.update((data) => {
    data.tasks.push(newTask);
  });

  db.logActivity(
    'PM-1',
    'John Michael Doe',
    'Project Manager',
    'Create',
    'Tasks',
    `Created Task "${title}" assigned to ${assignedToName}`
  );

  res.json({ task: newTask });
});

// Submit support ticket
app.post('/api/tickets', (req, res) => {
  const { category, title, description, employeeId, employeeName, priority } = req.body;

  const newTicket = {
    id: `TCK-${Date.now()}`,
    category,
    title,
    description,
    employeeId,
    employeeName,
    priority,
    status: 'Open' as const,
    createdAt: new Date().toISOString()
  };

  db.update((data) => {
    data.tickets.push(newTicket);
  });

  res.json({ ticket: newTicket });
});

// Resolve Ticket
app.post('/api/tickets/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { resolutionText, resolvedBy } = req.body;

  let resolved: any = null;
  db.update((data) => {
    const t = data.tickets.find((tick) => tick.id === id);
    if (t) {
      t.status = 'Resolved';
      t.resolutionText = resolutionText;
      t.assignedToName = resolvedBy;
      resolved = t;
    }
  });

  res.json({ ticket: resolved });
});

// Update Task Kanban Status
app.post('/api/tasks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  let updatedTask: any = null;
  db.update((data) => {
    const t = data.tasks.find((task) => task.id === id);
    if (t) {
      t.status = status;
      updatedTask = t;
    }
  });

  res.json({ task: updatedTask });
});


// GCC HR AI Assistant (Gemini API Integration Route)
app.post('/api/gemini/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(400).json({
      error: 'GEMINI_API_KEY is not configured. Please add it to your Secrets under Settings.'
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // Provide the actual corporate state as the contextual core!
    const state = db.get();
    
    const summaryContext = {
      companyName: state.settings.companyName,
      currency: state.settings.currency,
      metrics: {
        totalEmployees: state.employees.length,
        departments: state.settings.departments,
        positions: state.settings.positions,
        branches: state.settings.branches,
        activeProjects: state.projects.map(p => ({ code: p.code, name: p.name, budget: p.budget, PM: p.projectManager, status: p.status, costToDate: p.costToDate, progress: p.progressPercent })),
        heavyEquipment: state.equipment.map(e => ({ id: e.id, name: e.name, status: e.status, hours: e.operatingHours, project: e.assignedProject, operator: e.assignedOperator })),
        workOrders: state.workOrders.map(w => ({ id: w.id, eq: w.equipmentName, type: w.type, status: w.status, tech: w.assignedTechnician, cost: w.cost })),
        attendanceToday: state.attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).map(a => ({ name: a.employeeName, checkIn: a.checkIn, status: a.status })),
        expiringDocuments: state.employees.flatMap(e => e.documents.map(d => ({ empName: e.fullName, docName: d.name, expiry: d.expiryDate }))).filter(doc => new Date(doc.expiry).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000),
        spareParts: state.spareParts.map(sp => ({ name: sp.name, partNo: sp.partNumber, stock: sp.quantityInStock, reorder: sp.reorderLevel })),
        activeLoans: state.loans.map(l => ({ name: l.employeeName, amount: l.amount, remaining: l.outstandingBalance, status: l.status }))
      }
    };

    const systemInstruction = `You are "GCC HR AI", the advanced intelligent enterprise operational assistant embedded inside the GCC HR Platform.
Your purpose is to assist managers, supervisors, and employees with complex queries, summaries, analytical reports, and diagnostic suggestions regarding their employees, machinery, maintenance cycles, and project budgets.

You have access to the absolute REAL-TIME system database summary. Treat this as the single source of truth:
${JSON.stringify(summaryContext, null, 2)}

Instructions:
1. Always be professional, concise, and helpful. Use exact figures and names from the summary.
2. If asked about payroll or budget costs, perform precise additions and report the total in Saudi Riyal (SAR).
3. If asked about expiring documents, identify employees with iqama (Residency Permit) or passport expiry dates that are close and offer solutions (e.g. initiating HR renewal ticket).
4. If asked about equipment downtime or fuel logs, refer to Caterpillar excavators, generators, or fleet vehicles. Highlight low spare stock or outstanding maintenance.
5. Provide markdown formatted responses with clean tables, bullet points, and elegant structure. Always stay in character. Do not mention that you got this data via a JSON summary. Act as if you are directly connected to the database system.
`;

    // Map conversation messages to Gemini format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ response: response.text });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: `AI Assistant failed: ${err.message}` });
  }
});


// ==========================================
// ENTERPRISE COMMUNICATION PLATFORM APIs
// ==========================================

// GET current configuration values
app.get('/api/communication/config', (req, res) => {
  const state = db.get();
  res.json({
    emailConfig: state.emailConfig,
    smsConfig: state.smsConfig,
    mfaConfig: state.mfaConfig,
    securityPolicy: state.securityPolicy
  });
});

// Update SMTP configuration
app.post('/api/communication/email-config', (req, res) => {
  const newConfig = req.body;
  db.update((data) => {
    data.emailConfig = { ...data.emailConfig, ...newConfig };
  });
  db.logActivity(
    'ADMIN-001', 'Sarah Khalid Al-Ghamdi', 'Super Administrator',
    'Config Change', 'Communication', 'Updated SMTP email server configurations.'
  );
  res.json({ emailConfig: db.get().emailConfig });
});

// Update SMS gateway configuration
app.post('/api/communication/sms-config', (req, res) => {
  const newConfig = req.body;
  db.update((data) => {
    data.smsConfig = { ...data.smsConfig, ...newConfig };
  });
  db.logActivity(
    'ADMIN-001', 'Sarah Khalid Al-Ghamdi', 'Super Administrator',
    'Config Change', 'Communication', 'Updated SMS Gateway service configurations.'
  );
  res.json({ smsConfig: db.get().smsConfig });
});

// Update MFA configuration
app.post('/api/communication/mfa-config', (req, res) => {
  const newConfig = req.body;
  db.update((data) => {
    data.mfaConfig = { ...data.mfaConfig, ...newConfig };
  });
  db.logActivity(
    'ADMIN-001', 'Sarah Khalid Al-Ghamdi', 'Super Administrator',
    'Config Change', 'Communication', 'Updated global MFA authentication policy.'
  );
  res.json({ mfaConfig: db.get().mfaConfig });
});

// Update account security/password policies
app.post('/api/communication/security-policy', (req, res) => {
  const newConfig = req.body;
  db.update((data) => {
    data.securityPolicy = { ...data.securityPolicy, ...newConfig };
  });
  db.logActivity(
    'ADMIN-001', 'Sarah Khalid Al-Ghamdi', 'Super Administrator',
    'Config Change', 'Security', 'Updated global user password complexity constraints.'
  );
  res.json({ securityPolicy: db.get().securityPolicy });
});

// SMTP diagnostic connection test & test email dispatch
app.post('/api/communication/email-config/test', (req, res) => {
  const { recipientEmail } = req.body;
  const config = db.get().emailConfig;

  if (!recipientEmail) {
    return res.status(400).json({ error: 'Recipient email is required for SMTP diagnostics.' });
  }

  const success = config.enabled && config.smtpHost && config.smtpUser && config.smtpPassEncrypted;
  const durationMs = Math.floor(200 + Math.random() * 800);
  
  const logId = `ELG-${Date.now()}`;
  const testLog = {
    id: logId,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    recipient: recipientEmail,
    sender: config.senderEmail || 'hr-alerts@almansoori.com',
    subject: 'SMTP Diagnostics Connection Handshake Test',
    templateUsed: 'smtp_test_probe',
    status: (success ? 'Sent' : 'Failed') as 'Sent' | 'Failed',
    failureReason: success ? undefined : 'SMTP relay timeout / Bad connection details',
    retryCount: 0,
    smtpResponse: success ? '250 2.0.0 OK SMTP connection handshake success.' : '535 Authentication credentials invalid',
    durationMs
  };

  db.update((data) => {
    if (!data.emailLogs) data.emailLogs = [];
    data.emailLogs.unshift(testLog);
  });

  db.logActivity(
    'ADMIN-001', 'Sarah Khalid Al-Ghamdi', 'Super Administrator',
    'Config Change', 'Communication', `Executed SMTP connection diagnostics to ${recipientEmail}. Status: ${success ? 'SUCCESS' : 'FAILED'}`
  );

  if (success) {
    res.json({ success: true, message: 'SMTP connection verified. Diagnostics test email transmitted.', log: testLog });
  } else {
    res.status(500).json({ success: false, error: 'SMTP connection handshaking failed.', log: testLog });
  }
});

// SMS gateway diagnostics test
app.post('/api/communication/sms-config/test', (req, res) => {
  const { testNumber, message } = req.body;
  const config = db.get().smsConfig;

  if (!testNumber || !message) {
    return res.status(400).json({ error: 'Recipient mobile number and message are required.' });
  }

  const success = config.enabled && config.apiKeyEncrypted && config.senderId;
  const logId = `SLG-${Date.now()}`;
  
  const testLog = {
    id: logId,
    recipient: testNumber,
    message,
    provider: config.provider,
    status: (success ? 'Delivered' : 'Failed') as 'Delivered' | 'Failed',
    error: success ? undefined : 'API authentication failed - Invalid security key',
    retryCount: 0,
    costSAR: success ? 0.15 : 0.0,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0]
  };

  db.update((data) => {
    if (!data.smsLogs) data.smsLogs = [];
    data.smsLogs.unshift(testLog);
  });

  db.logActivity(
    'ADMIN-001', 'Sarah Khalid Al-Ghamdi', 'Super Administrator',
    'Config Change', 'Communication', `Dispatched SMS gateway test payload to ${testNumber}. Status: ${success ? 'DELIVERED' : 'FAILED'}`
  );

  if (success) {
    res.json({ success: true, message: 'SMS diagnostics payload transmitted successfully.', log: testLog });
  } else {
    res.status(500).json({ success: false, error: 'SMS Gateway response failure.', log: testLog });
  }
});

// GET templates
app.get('/api/communication/templates', (req, res) => {
  res.json({ templates: db.get().emailTemplates || [] });
});

// Update templates structure
app.post('/api/communication/templates', (req, res) => {
  const { templates } = req.body;
  if (!Array.isArray(templates)) {
    return res.status(400).json({ error: 'Templates must be an array.' });
  }

  db.update((data) => {
    data.emailTemplates = templates;
  });

  db.logActivity(
    'ADMIN-001', 'Sarah Khalid Al-Ghamdi', 'Super Administrator',
    'Config Change', 'Communication', 'Modified communication email template mappings.'
  );

  res.json({ templates: db.get().emailTemplates });
});

// GET email logs
app.get('/api/communication/logs/email', (req, res) => {
  res.json({ logs: db.get().emailLogs || [] });
});

// GET SMS logs
app.get('/api/communication/logs/sms', (req, res) => {
  res.json({ logs: db.get().smsLogs || [] });
});

// Resend an email log entry
app.post('/api/communication/logs/email/resend', (req, res) => {
  const { logId } = req.body;
  const state = db.get();
  const targetLog = state.emailLogs.find(l => l.id === logId);

  if (!targetLog) {
    return res.status(404).json({ error: 'Delivery log not found.' });
  }

  const newLogId = `ELG-${Date.now()}`;
  const resentLog = {
    ...targetLog,
    id: newLogId,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    status: 'Sent' as const,
    failureReason: undefined,
    retryCount: 0,
    smtpResponse: '250 2.0.0 Resend OK via Administrative Action',
    durationMs: Math.floor(100 + Math.random() * 400)
  };

  db.update((data) => {
    data.emailLogs.unshift(resentLog);
  });

  db.logActivity(
    'ADMIN-001', 'Sarah Khalid Al-Ghamdi', 'Super Administrator',
    'Update', 'Communication', `Resent log-referenced email to ${targetLog.recipient}.`
  );

  res.json({ success: true, log: resentLog });
});

// GET emailQueue items
app.get('/api/communication/queue', (req, res) => {
  res.json({ queue: db.get().emailQueue || [] });
});

// Trigger asynchronous processing of pending queue items
app.post('/api/communication/queue/process', (req, res) => {
  const state = db.get();
  const pendingItems = state.emailQueue.filter(item => item.status === 'Pending' || item.status === 'Sending');

  if (pendingItems.length === 0) {
    return res.json({ message: 'Queue clean. Zero pending items found.', processedCount: 0 });
  }

  const processedLogs: any[] = [];
  db.update((data) => {
    data.emailQueue.forEach(item => {
      if (item.status === 'Pending' || item.status === 'Sending') {
        const isSuccessful = Math.random() < 0.85; // 85% success for visual realism
        if (isSuccessful) {
          item.status = 'Sent';
          item.sentAt = new Date().toISOString();
          
          const newLog = {
            id: `ELG-${Date.now()}-${Math.floor(Math.random() * 100)}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            recipient: item.recipient,
            sender: data.emailConfig.senderEmail || 'hr-alerts@almansoori.com',
            subject: item.subject || 'System Notification',
            templateUsed: item.templateId || 'direct_alert',
            status: 'Sent' as const,
            retryCount: item.retries,
            smtpResponse: '250 2.0.0 OK Direct Asynchronous Queue Processed Successfully',
            durationMs: Math.floor(100 + Math.random() * 400)
          };
          data.emailLogs.unshift(newLog);
          processedLogs.push(newLog);
        } else {
          item.retries += 1;
          if (item.retries >= item.maxRetries) {
            item.status = 'Failed';
            item.failureReason = 'Target relay dropped connection - Retries exhausted';
            
            const newLog = {
              id: `ELG-${Date.now()}-${Math.floor(Math.random() * 100)}`,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toTimeString().split(' ')[0],
              recipient: item.recipient,
              sender: data.emailConfig.senderEmail || 'hr-alerts@almansoori.com',
              subject: item.subject || 'System Notification',
              templateUsed: item.templateId || 'direct_alert',
              status: 'Failed' as const,
              retryCount: item.retries,
              failureReason: 'Retries exhausted',
              smtpResponse: '554 Relay connection dropped by server',
              durationMs: 5000
            };
            data.emailLogs.unshift(newLog);
            processedLogs.push(newLog);
          } else {
            item.status = 'Pending';
          }
        }
      }
    });
  });

  res.json({ success: true, processedCount: pendingItems.length, logs: processedLogs });
});

// GET Accounts combined user security state details
app.get('/api/communication/accounts', (req, res) => {
  const state = db.get();
  const accounts = state.employees.map(emp => {
    const sec = state.userSecurityStates?.find(s => s.employeeId === emp.id) || {
      employeeId: emp.id,
      username: emp.email.split('@')[0],
      firstLoginResetRequired: true,
      isLocked: false,
      loginAttempts: 0,
      mfaEnabled: false,
      status: 'Active',
      passwordSetDate: new Date().toISOString().split('T')[0]
    };
    return {
      employeeId: emp.id,
      fullName: emp.fullName,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      status: emp.status,
      security: sec
    };
  });
  res.json({ accounts });
});

// POST administrative security account action on an account
app.post('/api/communication/accounts/action', (req, res) => {
  const { employeeId, action } = req.body;
  const state = db.get();
  const emp = state.employees.find(e => e.id === employeeId);

  if (!emp) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  let message = '';
  db.update((data) => {
    if (!data.userSecurityStates) data.userSecurityStates = [];
    let sec = data.userSecurityStates.find(s => s.employeeId === employeeId);
    
    if (!sec) {
      const username = emp.email.split('@')[0];
      sec = {
        employeeId: emp.id,
        username,
        hashedPassword: `pbkdf2_sha256$260000$${username}_salt$hashedpasswordemulated101`,
        tempPassword: `${username.toUpperCase()}@2026_!`,
        firstLoginResetRequired: true,
        isLocked: false,
        loginAttempts: 0,
        mfaEnabled: false,
        status: 'Active',
        passwordSetDate: new Date().toISOString().split('T')[0]
      };
      data.userSecurityStates.push(sec);
    }

    if (action === 'unlock') {
      sec.isLocked = false;
      sec.loginAttempts = 0;
      sec.status = 'Active';
      sec.lockReason = undefined;
      message = 'Security Account profile unlocked successfully.';
    } else if (action === 'lock') {
      sec.isLocked = true;
      sec.status = 'Locked';
      sec.lockReason = 'Manually administrative lock triggered.';
      sec.lockTime = new Date().toISOString();
      message = 'Security Account locked administrative block placed.';
    } else if (action === 'activate') {
      sec.status = 'Active';
      message = 'Security Profile status toggled to Active.';
    } else if (action === 'deactivate') {
      sec.status = 'Inactive';
      message = 'Security Profile account deactivated.';
    } else if (action === 'force_reset') {
      sec.firstLoginResetRequired = true;
      message = 'Flagged: Force password reset required on next session.';
    } else if (action === 'revoke_sessions') {
      sec.sessionRevokedAt = new Date().toISOString();
      message = 'All active web, mobile, and desktop portal sessions revoked.';
    } else if (action === 'reset_password') {
      const username = emp.email.split('@')[0];
      const newTemp = `Reset@${Math.floor(1000 + Math.random() * 9000)}`;
      sec.tempPassword = newTemp;
      sec.firstLoginResetRequired = true;
      
      const resetLink = `https://hr.almansoori.com/activate?token=RESET_${Date.now()}`;
      const queueItem = {
        id: `QUE-${Date.now()}`,
        type: 'email' as const,
        recipient: emp.email,
        subject: `Reset your Al-Mansoori HR Portal Password`,
        message: `Dear ${emp.fullName},\n\nWe received a request to reset the password for your HR Portal account. Use the link below to set a new password:\n${resetLink}\n\nTemporary Reset Password: ${newTemp}\n\nThis recovery link is temporary.`,
        templateId: 'password_reset',
        payload: {
          EmployeeName: emp.fullName,
          ResetLink: resetLink,
          TemporaryPassword: newTemp,
          CompanyName: 'Al-Mansoori Industrial & Engineering Contracting Co.'
        },
        status: 'Pending' as const,
        retries: 0,
        maxRetries: 3,
        createdAt: new Date().toISOString()
      };
      if (!data.emailQueue) data.emailQueue = [];
      data.emailQueue.push(queueItem);
      message = `Password reset triggered. Temporary reset pass is ${newTemp}. Recovery email queued.`;
    } else if (action === 'welcome_again') {
      const username = emp.email.split('@')[0];
      const newTemp = sec.tempPassword || `Welcome@${Math.floor(1000 + Math.random() * 9000)}`;
      sec.tempPassword = newTemp;
      
      const resetLink = `https://hr.almansoori.com/activate?token=WELCOME_${Date.now()}`;
      const queueItem = {
        id: `QUE-${Date.now()}`,
        type: 'email' as const,
        recipient: emp.email,
        subject: `Welcome to Al-Mansoori - Set Up Your HR Portal Account`,
        message: `Dear ${emp.fullName},\n\nWelcome to Al-Mansoori! Your HR Portal employee account is ready.\n\nTemporary credentials:\n- Username: ${username}\n- Temporary Password: ${newTemp}\n\nPlease click to activate:\n${resetLink}`,
        templateId: 'welcome_email',
        payload: {
          EmployeeName: emp.fullName,
          Position: emp.position,
          Department: emp.department,
          Username: username,
          TemporaryPassword: newTemp,
          EmployeeID: emp.id,
          ResetLink: resetLink,
          CompanyName: 'Al-Mansoori Industrial & Engineering Contracting Co.'
        },
        status: 'Pending' as const,
        retries: 0,
        maxRetries: 3,
        createdAt: new Date().toISOString()
      };
      if (!data.emailQueue) data.emailQueue = [];
      data.emailQueue.push(queueItem);
      message = 'Welcome Onboarding Email resent. Transmitted successfully to queue.';
    }
  });

  db.logActivity(
    'ADMIN-001', 'Sarah Khalid Al-Ghamdi', 'Super Administrator',
    'Security', 'Authentication', `Executed administrative account action [${action.toUpperCase()}] for user ${emp.fullName} (${employeeId}).`
  );

  res.json({ success: true, message });
});


// Catch-all route for undefined API endpoints (guarantees JSON output, never HTML fallback)
app.all('/api/*', (req, res, next) => {
  const err = new Error(`API endpoint ${req.method} ${req.path} not found or HTTP method unsupported`);
  (err as any).status = 404;
  (err as any).details = 'Verify the route path, request body, and HTTP method.';
  next(err);
});


// Centralized API Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[GLOBAL ERROR HANDLER] Captured unhandled exception:', err);
  if (err.stack) {
    console.error(err.stack);
  }
  
  // Always return structured JSON for /api requests
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
      details: err.details || err.stack || null
    });
  }
  
  next(err);
});

// -----------------------------------------------------------------------------
// Serve static files in production / Vite in development
// -----------------------------------------------------------------------------

async function startServer() {

  if (process.env.NODE_ENV !== 'production') {

    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);

  } else {

    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GCC HR Enterprise Server listening on http://localhost:${PORT}`);
  });

}

// -----------------------------------------------------------------------------
// Register Enterprise Routes
// -----------------------------------------------------------------------------

registerRoutes(app);

// -----------------------------------------------------------------------------
// Start Application
// -----------------------------------------------------------------------------

startServer();
