import { EmployeeRepository } from "../repositories/EmployeeRepository";

export class EmployeeService {

    static async getAll() {

        return await EmployeeRepository.findAll();

    }

    static async getById(id: string) {

        const employee = await EmployeeRepository.findById(id);

        if (!employee) {

            throw new Error("Employee not found.");

        }

        return employee;

    }

    static async create(data: any) {

        return await EmployeeRepository.create(data);

    }

    static async update(
        id: string,
        data: any
    ) {

        const employee = await EmployeeRepository.findById(id);

        if (!employee) {

            throw new Error("Employee not found.");

        }

        return await EmployeeRepository.update(id, data);

    }

    static async delete(id: string) {

        const employee = await EmployeeRepository.findById(id);

        if (!employee) {

            throw new Error("Employee not found.");

        }

        return await EmployeeRepository.delete(id);

    }

}
