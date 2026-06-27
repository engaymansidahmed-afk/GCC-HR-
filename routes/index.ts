```ts
import { Express } from "express";

import authRoutes from "./auth";
import employeeRoutes from "./employees";
import attendanceRoutes from "./attendance";
import leaveRoutes from "./leaves";
import payrollRoutes from "./payroll";
import loanRoutes from "./loans";
import requestRoutes from "./requests";
import projectRoutes from "./projects";
import equipmentRoutes from "./equipment";
import maintenanceRoutes from "./maintenance";
import inventoryRoutes from "./inventory";
import fuelRoutes from "./fuel";
import ticketRoutes from "./tickets";
import notificationRoutes from "./notifications";
import settingsRoutes from "./settings";
import reportRoutes from "./reports";
import aiRoutes from "./ai";

export function registerRoutes(app: Express) {
  app.use("/api/auth", authRoutes);

  app.use("/api/employees", employeeRoutes);

  app.use("/api/attendance", attendanceRoutes);

  app.use("/api/leaves", leaveRoutes);

  app.use("/api/payroll", payrollRoutes);

  app.use("/api/loans", loanRoutes);

  app.use("/api/requests", requestRoutes);

  app.use("/api/projects", projectRoutes);

  app.use("/api/equipment", equipmentRoutes);

  app.use("/api/maintenance", maintenanceRoutes);

  app.use("/api/inventory", inventoryRoutes);

  app.use("/api/fuel", fuelRoutes);

  app.use("/api/tickets", ticketRoutes);

  app.use("/api/notifications", notificationRoutes);

  app.use("/api/settings", settingsRoutes);

  app.use("/api/reports", reportRoutes);

  app.use("/api/ai", aiRoutes);
}
```
