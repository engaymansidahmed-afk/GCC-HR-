```ts
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    module: "projects",
    message: "API is ready."
  });
});

export default router;
```

