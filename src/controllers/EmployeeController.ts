import { Request, Response, NextFunction } from "express";
import { EmployeeService } from "../services/EmployeeService";

export class EmployeeController {

    static async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const employees = await EmployeeService.getAll();

            return res.status(200).json({

                success: true,

                count: employees.length,

                data: employees

            });

        } catch (error) {

            next(error);

        }

    }

    static async getById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const employee = await EmployeeService.getById(req.params.id);

            return res.status(200).json({

                success: true,

                data: employee

            });

        } catch (error) {

            next(error);

        }

    }

    static async create(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const employee = await EmployeeService.create(req.body);

            return res.status(201).json({

                success: true,

                message: "Employee created successfully.",

                data: employee

            });

        } catch (error) {

            next(error);

        }

    }

    static async update(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const employee = await EmployeeService.update(
                req.params.id,
                req.body
            );

            return res.status(200).json({

                success: true,

                message: "Employee updated successfully.",

                data: employee

            });

        } catch (error) {

            next(error);

        }

    }

    static async delete(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            await EmployeeService.delete(req.params.id);

            return res.status(200).json({

                success: true,

                message: "Employee deleted successfully."

            });

        } catch (error) {

            next(error);

        }

    }

}
