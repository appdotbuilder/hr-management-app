
import { db } from '../db';
import { overtimeRequestsTable } from '../db/schema';
import { type UpdateOvertimeRequestInput, type OvertimeRequest } from '../schema';
import { eq } from 'drizzle-orm';

export const updateOvertimeRequest = async (input: UpdateOvertimeRequestInput): Promise<OvertimeRequest> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.approved_by !== undefined) {
      updateData.approved_by = input.approved_by;
      updateData.approved_at = new Date(); // Set approval timestamp when approver is set
    }
    
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    // Update the overtime request
    const result = await db.update(overtimeRequestsTable)
      .set(updateData)
      .where(eq(overtimeRequestsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Overtime request with id ${input.id} not found`);
    }

    // Convert fields back to proper types before returning
    const overtimeRequest = result[0];
    return {
      ...overtimeRequest,
      date: new Date(overtimeRequest.date), // Convert string date to Date object
      total_hours: parseFloat(overtimeRequest.total_hours) // Convert numeric string to number
    };
  } catch (error) {
    console.error('Overtime request update failed:', error);
    throw error;
  }
};
