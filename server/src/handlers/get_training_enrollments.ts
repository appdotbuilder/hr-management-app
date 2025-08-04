
import { db } from '../db';
import { trainingEnrollmentsTable } from '../db/schema';
import { type TrainingEnrollment } from '../schema';

export const getTrainingEnrollments = async (): Promise<TrainingEnrollment[]> => {
  try {
    const results = await db.select()
      .from(trainingEnrollmentsTable)
      .execute();

    // Convert numeric fields back to numbers and cast attendance_status
    return results.map(enrollment => ({
      ...enrollment,
      attendance_status: enrollment.attendance_status as 'registered' | 'attended' | 'absent' | 'completed',
      completion_score: enrollment.completion_score ? parseFloat(enrollment.completion_score) : null
    }));
  } catch (error) {
    console.error('Failed to fetch training enrollments:', error);
    throw error;
  }
};
