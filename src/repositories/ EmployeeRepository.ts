import { prisma } from "../lib/prisma";

export class EmployeeRepository {

    static async findAll() {

        return await prisma.employee.findMany({

            include: {

                company: true,

                branch: true,

                department: true,

                position: true

            },

            orderBy: {

                createdAt: "desc"

            }

        });

    }

    static async findById(id: string) {

        return await prisma.employee.findUnique({

            where: {

                id

            },

            include: {

                company: true,

                branch: true,

                department: true,

                position: true,

                attendances: true,

                leaves: true,

                payrolls: true,

                loans: true,

                custodies: true

            }

        });

    }

    static async create(data: any) {

        return await prisma.employee.create({

            data

        });

    }

    static async update(
        id: string,
        data: any
    ) {

        return await prisma.employee.update({

            where: {

                id

            },

            data

        });

    }

    static async delete(id: string) {

        return await prisma.employee.delete({

            where: {

                id

            }

        });

    }

}
