
import { db } from '../db';
import { overtimeRequestsTable } from '../db/schema';
import { type CreateOvertimeRequestInput, type OvertimeRequest } from '../schema';

export const createOvertimeRequest = async (input: CreateOvertimeRequestInput): Promise<OvertimeRequest> => {
  try {
    // Insert overtime request record
    const result = await db.insert(overtimeRequestsTable)
      .values({
        employee_id: input.employee_id,
        date: input.date.toISOString().split('T')[0], // Convert Date to string (YYYY-MM-DD)
        start_time: input.start_time,
        end_time: input.end_time,
        total_hours: input.total_hours.toString(), // Convert number to string for numeric column
        reason: input.reason,
        approved_by: null,
        approved_at: null,
        status: input.status,
        notes: input.notes
      })
      .returning()
      .execute();

    // Convert fields back to expected types before returning
    const overtimeRequest = result[0];
    return {
      ...overtimeRequest,
      date: new Date(overtimeRequest.date), // Convert string back to Date
      total_hours: parseFloat(overtimeRequest.total_hours) // Convert string back to number
    };
  } catch (error) {
    console.error('Overtime request creation failed:', error);
    throw error;
  }
};
