
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type UpdateEmployeeInput, type Employee } from '../schema';
import { eq } from 'drizzle-orm';

export const updateEmployee = async (input: UpdateEmployeeInput): Promise<Employee> => {
  try {
    // Build update object, excluding the id field
    const { id, ...updateData } = input;
    
    // Convert fields to database format
    const updateValues: any = {
      updated_at: new Date()
    };

    // Only include fields that are explicitly provided in the input
    Object.keys(updateData).forEach(key => {
      const value = (updateData as any)[key];
      
      if (key === 'salary') {
        // Handle salary conversion (numeric field)
        updateValues.salary = value === null ? null : value?.toString();
      } else if (key === 'birth_date') {
        // Handle birth_date conversion (date field)
        updateValues.birth_date = value === null ? null : value?.toISOString().split('T')[0];
      } else {
        // Handle all other fields directly
        updateValues[key] = value;
      }
    });

    // Update employee record
    const result = await db.update(employeesTable)
      .set(updateValues)
      .where(eq(employeesTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Employee with id ${id} not found`);
    }

    // Convert fields back to expected types
    const employee = result[0];
    return {
      ...employee,
      salary: employee.salary ? parseFloat(employee.salary) : null,
      birth_date: employee.birth_date ? new Date(employee.birth_date) : null,
      hire_date: new Date(employee.hire_date)
    };
  } catch (error) {
    console.error('Employee update failed:', error);
    throw error;
  }
};
