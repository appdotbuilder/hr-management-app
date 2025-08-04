
import { db } from '../db';
import { attendanceTable } from '../db/schema';
import { type Attendance } from '../schema';

export const getAttendance = async (): Promise<Attendance[]> => {
  try {
    const results = await db.select()
      .from(attendanceTable)
      .execute();

    // Convert database types back to schema types
    return results.map(record => ({
      ...record,
      date: new Date(record.date), // Convert string to Date
      total_hours: record.total_hours ? parseFloat(record.total_hours) : null
    }));
  } catch (error) {
    console.error('Failed to fetch attendance records:', error);
    throw error;
  }
};
