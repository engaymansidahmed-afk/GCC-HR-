```ts
import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    module: "esttings",
    message: "API is ready."
  });
});

export default router;
```

