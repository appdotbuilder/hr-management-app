
import { db } from '../db';
import { leaveRequestsTable } from '../db/schema';
import { type LeaveRequest } from '../schema';

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const results = await db.select()
      .from(leaveRequestsTable)
      .execute();

    // Convert date fields from strings to Date objects
    return results.map(leaveRequest => ({
      ...leaveRequest,
      start_date: new Date(leaveRequest.start_date),
      end_date: new Date(leaveRequest.end_date)
    }));
  } catch (error) {
    console.error('Failed to fetch leave requests:', error);
    throw error;
  }
};
