import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { GoogleGenAI } from '@google/genai';
import { Employee } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// API endpoints: General state retrieval
app.get('/api/state', (req, res) => {
  res.json(db.get());
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


// Serve static files in production / Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`GCC HR Fullstack Server listening on http://localhost:${PORT}`);
  });
}

startServer();
