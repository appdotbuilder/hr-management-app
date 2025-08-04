
import { db } from '../db';
import { leaveRequestsTable } from '../db/schema';
import { type UpdateLeaveRequestInput, type LeaveRequest } from '../schema';
import { eq } from 'drizzle-orm';

export const updateLeaveRequest = async (input: UpdateLeaveRequestInput): Promise<LeaveRequest> => {
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

    // Update the leave request
    const result = await db.update(leaveRequestsTable)
      .set(updateData)
      .where(eq(leaveRequestsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Leave request not found');
    }

    const leaveRequest = result[0];
    return {
      ...leaveRequest,
      start_date: new Date(leaveRequest.start_date),
      end_date: new Date(leaveRequest.end_date)
    };
  } catch (error) {
    console.error('Leave request update failed:', error);
    throw error;
  }
};
