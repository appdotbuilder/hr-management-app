
import { db } from '../db';
import { attendanceTable, employeesTable } from '../db/schema';
import { type CreateAttendanceInput, type Attendance } from '../schema';
import { eq } from 'drizzle-orm';

export const createAttendance = async (input: CreateAttendanceInput): Promise<Attendance> => {
  try {
    // Verify employee exists to prevent foreign key constraint violations
    const employee = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, input.employee_id))
      .execute();

    if (employee.length === 0) {
      throw new Error(`Employee with id ${input.employee_id} not found`);
    }

    // Insert attendance record
    const result = await db.insert(attendanceTable)
      .values({
        employee_id: input.employee_id,
        date: input.date.toISOString().split('T')[0], // Convert Date to string format for date column
        check_in: input.check_in,
        check_out: input.check_out,
        break_start: input.break_start,
        break_end: input.break_end,
        total_hours: input.total_hours ? input.total_hours.toString() : null, // Convert number to string for numeric column
        status: input.status,
        notes: input.notes
      })
      .returning()
      .execute();

    // Convert fields back to proper types before returning
    const attendance = result[0];
    return {
      ...attendance,
      date: new Date(attendance.date), // Convert string back to Date
      total_hours: attendance.total_hours ? parseFloat(attendance.total_hours) : null // Convert string back to number
    };
  } catch (error) {
    console.error('Attendance creation failed:', error);
    throw error;
  }
};
