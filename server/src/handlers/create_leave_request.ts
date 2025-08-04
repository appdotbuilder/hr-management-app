
import { db } from '../db';
import { leaveRequestsTable, employeesTable } from '../db/schema';
import { type CreateLeaveRequestInput, type LeaveRequest } from '../schema';
import { eq } from 'drizzle-orm';

export const createLeaveRequest = async (input: CreateLeaveRequestInput): Promise<LeaveRequest> => {
  try {
    // Verify employee exists
    const employee = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, input.employee_id))
      .execute();

    if (employee.length === 0) {
      throw new Error(`Employee with id ${input.employee_id} not found`);
    }

    // Insert leave request record
    const result = await db.insert(leaveRequestsTable)
      .values({
        employee_id: input.employee_id,
        leave_type: input.leave_type,
        start_date: input.start_date.toISOString().split('T')[0], // Convert Date to string format
        end_date: input.end_date.toISOString().split('T')[0], // Convert Date to string format
        total_days: input.total_days,
        reason: input.reason,
        status: input.status,
        notes: input.notes
      })
      .returning()
      .execute();

    // Convert string dates back to Date objects
    const leaveRequest = result[0];
    return {
      ...leaveRequest,
      start_date: new Date(leaveRequest.start_date),
      end_date: new Date(leaveRequest.end_date)
    };
  } catch (error) {
    console.error('Leave request creation failed:', error);
    throw error;
  }
};
