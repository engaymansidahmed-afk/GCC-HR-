```ts
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    module: "attendance",
    message: "Attendance API Ready"
  });
});

export default router;
```
