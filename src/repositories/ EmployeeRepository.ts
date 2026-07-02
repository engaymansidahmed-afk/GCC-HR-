import { Employee } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export class EmployeeRepository extends BaseRepository {

    async findAll(): Promise<Employee[]> {

        return this.prisma.employee.findMany({

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

    async findById(id: string) {

        return this.prisma.employee.findUnique({

            where: {
                id
            },

            include: {
                company: true,
                branch: true,
                department: true,
                position: true
            }

        });

    }

    async create(data: any) {

        return this.prisma.employee.create({

            data

        });

    }

    async update(id: string, data: any) {

        return this.prisma.employee.update({

            where: {
                id
            },

            data

        });

    }

    async delete(id: string) {

        return this.prisma.employee.delete({

            where: {
                id
            }

        });

    }

}
