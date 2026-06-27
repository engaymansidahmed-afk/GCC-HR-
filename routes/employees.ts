import { Router } from "express";

const router = Router();

/*
|--------------------------------------------------------------------------
| Employee Health Check
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
    return res.status(200).json({
        success: true,
        module: "Employees",
        message: "Employee API is running successfully."
    });
});

/*
|--------------------------------------------------------------------------
| Get Employees
|--------------------------------------------------------------------------
*/

router.get("/list", async (req, res) => {

    try {

        // سيتم لاحقاً استدعاء قاعدة البيانات

        return res.json({
            success: true,
            data: []
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Unable to load employees."
        });

    }

});

/*
|--------------------------------------------------------------------------
| Create Employee
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {

    try {

        const employee = req.body;

        return res.status(201).json({
            success: true,
            message: "Employee created successfully.",
            data: employee
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Employee creation failed."
        });

    }

});

export default router;
