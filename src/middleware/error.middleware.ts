import { Request, Response, NextFunction } from "express";

export class AppError extends Error {

    public readonly statusCode: number;

    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode = 500,
        isOperational = true
    ) {

        super(message);

        this.statusCode = statusCode;

        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);

    }

}

export function errorHandler(

    err: Error | AppError,

    req: Request,

    res: Response,

    next: NextFunction

): void {

    const statusCode = err instanceof AppError
        ? err.statusCode
        : 500;

    const message = err.message || "Internal Server Error";

    console.error("========================================");
    console.error("ERROR");
    console.error("Path:", req.originalUrl);
    console.error("Method:", req.method);
    console.error("Message:", message);
    console.error(err.stack);
    console.error("========================================");

    res.status(statusCode).json({

        success: false,

        statusCode,

        message,

        timestamp: new Date().toISOString(),

        path: req.originalUrl

    });

}
