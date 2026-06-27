```ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/employees
 * جميع الموظفين
 */
router.get("/", async (req, res) => {
  try {

    const employees = await prisma.employee.findMany({

      include: {
        company: true,
        branch: true,
        department: true,
        position: true
      },

      orderBy: {
        createdAt: "desc"
      }

    });

    return res.json({
      success: true,
      count: employees.length,
      data: employees
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load employees."
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
        id
      },

      include: {
        company: true,
        branch: true,
        department: true,
        position: true,
        attendances: true,
        leaves: true,
        payrolls: true,
        loans: true
      }

    });

    if (!employee) {

      return res.status(404).json({

        success: false,
        message: "Employee not found."

      });

    }

    return res.json({

      success: true,
      data: employee

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,
      message: "Internal server error."

    });

  }

});

export default router;
```
