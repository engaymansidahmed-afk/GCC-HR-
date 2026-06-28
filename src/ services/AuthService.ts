import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "@prisma/client";

import { UserRepository } from "../repositories/UserRepository";
import { LoginInput, RegisterInput } from "../validators/auth.validator";

export class AuthService {

    private repository = new UserRepository();

    async register(data: RegisterInput): Promise<User> {

        const exists = await this.repository.findByEmail(data.email);

        if (exists) {
            throw new Error("Email already exists.");
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        return this.repository.create({

            employeeId: data.employeeId,

            roleId: data.roleId,

            email: data.email,

            password: hashedPassword

        });

    }

    async login(data: LoginInput) {

        const user = await this.repository.findByEmail(data.email);

        if (!user) {
            throw new Error("Invalid email or password.");
        }

        const valid = await bcrypt.compare(

            data.password,

            user.password

        );

        if (!valid) {
            throw new Error("Invalid email or password.");
        }

        const token = jwt.sign(

            {
                id: user.id,
                roleId: user.roleId,
                employeeId: user.employeeId
            },

            process.env.JWT_SECRET!,

            {
                expiresIn: "8h"
            }

        );

        return {

            user,

            token

        };

    }

}
