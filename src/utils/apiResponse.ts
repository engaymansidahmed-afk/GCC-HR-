import { Response } from "express";

export interface PaginationMeta {

    page: number;

    limit: number;

    total: number;

    totalPages: number;

}

export class ApiResponse {

    /**
     * Success Response
     */
    static success<T>(
        res: Response,
        data: T,
        message = "Success",
        statusCode = 200
    ): Response {

        return res.status(statusCode).json({

            success: true,

            message,

            data,

            timestamp: new Date().toISOString()

        });

    }

    /**
     * Success Response With Pagination
     */
    static paginated<T>(
        res: Response,
        data: T[],
        pagination: PaginationMeta,
        message = "Success"
    ): Response {

        return res.status(200).json({

            success: true,

            message,

            data,

            pagination,

            timestamp: new Date().toISOString()

        });

    }

    /**
     * Error Response
     */
    static error(
        res: Response,
        message = "Internal Server Error",
        statusCode = 500,
        errors: unknown = null
    ): Response {

        return res.status(statusCode).json({

            success: false,

            message,

            errors,

            timestamp: new Date().toISOString()

        });

    }

    /**
     * Created Response
     */
    static created<T>(
        res: Response,
        data: T,
        message = "Created Successfully"
    ): Response {

        return res.status(201).json({

            success: true,

            message,

            data,

            timestamp: new Date().toISOString()

        });

    }

    /**
     * No Content Response
     */
    static noContent(res: Response): Response {

        return res.status(204).send();

    }

}
