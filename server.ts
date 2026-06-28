import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { registerRoutes } from "./routes";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (_req, res) => {
    res.json({
        success: true,
        application: "GCC HR Enterprise",
        version: "1.0.0",
        status: "Running"
    });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

registerRoutes(app);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found."
    });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
) => {

    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {

    console.log("======================================");
    console.log(" GCC HR Enterprise Backend Started");
    console.log(` Server : http://localhost:${PORT}`);
    console.log("======================================");

});
