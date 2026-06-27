```ts
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    module: "attendance",
    message: "API is ready."
  });
});

export default router;
```

