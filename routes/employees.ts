```ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/employees
 * جميع الموظفين
 */
router.get("/", async (_req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        company: true,
        branch: true,
        department: true,
        position: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load employees.",
    });
  }
});

/**
 * GET /api/employees/:id
 * جلب موظف واحد
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: {
        id,
      },
      include: {
        company: true,
        branch: true,
        department: true,
        position: true,
        attendances: true,
        leaves: true,
        payrolls: true,
        loans: true,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

/**
 * POST /api/employees
 * إنشاء موظف جديد
 */
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const employee = await prisma.employee.create({
      data: {
        employeeNumber: data.employeeNumber,

        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,

        fullName: data.fullName,
        fullNameAr: data.fullNameAr || null,

        gender: data.gender,

        maritalStatus: data.maritalStatus || null,

        nationality: data.nationality || null,

        nationalId: data.nationalId || null,
        passportNumber: data.passportNumber || null,

        email: data.email || null,
        mobile: data.mobile || null,

        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : null,

        hireDate: new Date(data.hireDate),

        employmentType: data.employmentType,

        status: data.status || "ACTIVE",

        companyId: data.companyId,
        branchId: data.branchId,
        departmentId: data.departmentId,
        positionId: data.positionId,

        basicSalary: data.basicSalary ?? null,
        housingAllowance: data.housingAllowance ?? null,
        transportAllowance: data.transportAllowance ?? null,
        foodAllowance: data.foodAllowance ?? null,
        communicationAllowance: data.communicationAllowance ?? null,

        bankName: data.bankName || null,
        iban: data.iban || null,

        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,

        address: data.address || null,
        city: data.city || null,
        country: data.country || null,

        profileImage: data.profileImage || null,

        notes: data.notes || null,
      },

      include: {
        company: true,
        branch: true,
        department: true,
        position: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      data: employee,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create employee.",
    });
  }
});

export default router;
```
