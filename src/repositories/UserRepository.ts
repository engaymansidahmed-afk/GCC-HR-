import { User } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class UserRepository {

    async findById(id: string): Promise<User | null> {

        return prisma.user.findUnique({

            where: {

                id

            }

        });

    }

    async findByEmail(email: string): Promise<User | null> {

        return prisma.user.findUnique({

            where: {

                email

            }

            });

    }

    async create(data: {

        employeeId: string;

        roleId: string;

        email: string;

        password: string;

    }): Promise<User> {

        return prisma.user.create({

            data

        });

    }

    async updatePassword(

        id: string,

        password: string

    ): Promise<User> {

        return prisma.user.update({

            where: {

                id

            },

            data: {

                password

            }

        });

    }

    async delete(id: string): Promise<User> {

        return prisma.user.delete({

            where: {

                id

            }

        });

    }

}
