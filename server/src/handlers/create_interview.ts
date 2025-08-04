
import { db } from '../db';
import { interviewsTable, employeesTable, jobApplicationsTable } from '../db/schema';
import { type CreateInterviewInput, type Interview } from '../schema';
import { eq } from 'drizzle-orm';

export const createInterview = async (input: CreateInterviewInput): Promise<Interview> => {
  try {
    // Verify the job application exists
    const application = await db.select()
      .from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.id, input.application_id))
      .execute();

    if (application.length === 0) {
      throw new Error('Job application not found');
    }

    // Verify the interviewer exists
    const interviewer = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, input.interviewer_id))
      .execute();

    if (interviewer.length === 0) {
      throw new Error('Interviewer not found');
    }

    // Insert interview record
    const result = await db.insert(interviewsTable)
      .values({
        application_id: input.application_id,
        interview_date: input.interview_date,
        interviewer_id: input.interviewer_id,
        interview_type: input.interview_type,
        location: input.location,
        notes: input.notes,
        result: input.result,
        score: input.score ? input.score.toString() : null, // Convert number to string for numeric column
        status: input.status
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const interview = result[0];
    return {
      ...interview,
      score: interview.score ? parseFloat(interview.score) : null // Convert string back to number
    };
  } catch (error) {
    console.error('Interview creation failed:', error);
    throw error;
  }
};
