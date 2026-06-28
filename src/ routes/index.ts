import { Application } from "express";
import { Router } from "express";

const router = Router();

/*
|--------------------------------------------------------------------------
| System Health
|--------------------------------------------------------------------------
*/

router.get("/health", (_req, res) => {

    res.status(200).json({

        success: true,

        message: "GCC HR Enterprise API is running.",

        version: "1.0.0",

        timestamp: new Date().toISOString()

    });

});

/*
|--------------------------------------------------------------------------
| Modules
|--------------------------------------------------------------------------
|
| سيتم استيراد جميع وحدات النظام هنا.
|
| مثال:
|
| import authRoutes from "./auth.routes";
| import employeeRoutes from "./employee.routes";
|
| router.use("/auth", authRoutes);
| router.use("/employees", employeeRoutes);
|
*/

/*
|--------------------------------------------------------------------------
| Register Routes
|--------------------------------------------------------------------------
*/

export function registerRoutes(app: Application): void {

    app.use("/api", router);

}

export default router;
