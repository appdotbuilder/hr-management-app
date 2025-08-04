
import { db } from '../db';
import { jobApplicationsTable } from '../db/schema';
import { type UpdateJobApplicationInput, type JobApplication } from '../schema';
import { eq } from 'drizzle-orm';

export const updateJobApplication = async (input: UpdateJobApplicationInput): Promise<JobApplication> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    // Update the job application
    const result = await db.update(jobApplicationsTable)
      .set(updateData)
      .where(eq(jobApplicationsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Job application with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Job application update failed:', error);
    throw error;
  }
};
