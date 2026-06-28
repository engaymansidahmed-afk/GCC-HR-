import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";

import { registerRoutes } from "./routes";

dotenv.config();

const app: Application = express();

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
}));

/*
|--------------------------------------------------------------------------
| Performance
|--------------------------------------------------------------------------
*/

app.use(compression());

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(express.json({
    limit: "10mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "10mb"
}));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (_req, res) => {

    return res.status(200).json({

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

    return res.status(404).json({

        success: false,
        message: "Endpoint not found."

    });

});

export default app;
