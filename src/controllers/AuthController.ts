import { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/AuthService";

import {

    LoginSchema,

    RegisterSchema

} from "../validators/auth.validator";

export class AuthController {

    private static service = new AuthService();

    static async register(

        req: Request,

        res: Response,

        next: NextFunction

    ) {

        try {

            const data = RegisterSchema.parse(req.body);

            const user = await this.service.register(data);

            return res.status(201).json({

                success: true,

                message: "User registered successfully.",

                data: user

            });

        } catch (error) {

            next(error);

        }

    }

    static async login(

        req: Request,

        res: Response,

        next: NextFunction

    ) {

        try {

            const data = LoginSchema.parse(req.body);

            const result = await this.service.login(data);

            return res.status(200).json({

                success: true,

                message: "Login successful.",

                token: result.token,

                user: result.user

            });

        } catch (error) {

            next(error);

        }

    }

}
