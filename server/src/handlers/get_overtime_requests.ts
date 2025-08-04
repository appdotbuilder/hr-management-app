
import { db } from '../db';
import { overtimeRequestsTable } from '../db/schema';
import { type OvertimeRequest } from '../schema';

export const getOvertimeRequests = async (): Promise<OvertimeRequest[]> => {
  try {
    const results = await db.select()
      .from(overtimeRequestsTable)
      .execute();

    // Convert numeric fields and date fields back to proper types
    return results.map(request => ({
      ...request,
      date: new Date(request.date), // Convert string to Date
      total_hours: parseFloat(request.total_hours) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch overtime requests:', error);
    throw error;
  }
};
