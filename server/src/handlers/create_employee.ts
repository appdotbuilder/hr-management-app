
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type CreateEmployeeInput, type Employee } from '../schema';

export const createEmployee = async (input: CreateEmployeeInput): Promise<Employee> => {
  try {
    // Insert employee record - using explicit type casting to work around type issues
    const result = await db.insert(employeesTable)
      .values({
        employee_id: input.employee_id,
        full_name: input.full_name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        birth_date: input.birth_date,
        hire_date: input.hire_date,
        position: input.position,
        department: input.department,
        salary: input.salary ? input.salary.toString() : null,
        status: input.status,
        contract_type: input.contract_type,
        manager_id: input.manager_id
      } as any)
      .returning();

    // Convert fields back to proper types before returning
    const employee = result[0] as any;
    return {
      id: employee.id,
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      birth_date: employee.birth_date ? new Date(employee.birth_date) : null,
      hire_date: new Date(employee.hire_date),
      position: employee.position,
      department: employee.department,
      salary: employee.salary ? parseFloat(employee.salary) : null,
      status: employee.status,
      contract_type: employee.contract_type,
      manager_id: employee.manager_id,
      created_at: employee.created_at,
      updated_at: employee.updated_at
    };
  } catch (error) {
    console.error('Employee creation failed:', error);
    throw error;
  }
};
