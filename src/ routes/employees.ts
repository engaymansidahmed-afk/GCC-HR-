import { Router } from "express";
import { EmployeeController } from "../controllers/EmployeeController";

const router = Router();

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

router.get("/", (req, res) => {

    return res.json({

        success: true,

        module: "Employees",

        message: "Employees API is running."

    });

});

/*
|--------------------------------------------------------------------------
| Employees
|--------------------------------------------------------------------------
*/

router.get("/list", EmployeeController.getAll);

router.get("/:id", EmployeeController.getById);

router.post("/", EmployeeController.create);

router.put("/:id", EmployeeController.update);

router.delete("/:id", EmployeeController.delete);

export default router;
