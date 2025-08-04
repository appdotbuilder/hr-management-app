
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type Employee } from '../schema';

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const results = await db.select()
      .from(employeesTable)
      .execute();

    // Convert fields back to expected types
    return results.map(employee => ({
      ...employee,
      salary: employee.salary ? parseFloat(employee.salary) : null,
      birth_date: employee.birth_date ? new Date(employee.birth_date) : null,
      hire_date: new Date(employee.hire_date)
    }));
  } catch (error) {
    console.error('Get employees failed:', error);
    throw error;
  }
};
