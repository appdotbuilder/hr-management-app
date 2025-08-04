
import { db } from '../db';
import { jobApplicationsTable, jobRequestsTable } from '../db/schema';
import { type CreateJobApplicationInput, type JobApplication } from '../schema';
import { eq } from 'drizzle-orm';

export const createJobApplication = async (input: CreateJobApplicationInput): Promise<JobApplication> => {
  try {
    // Verify that the job request exists
    const jobRequest = await db.select()
      .from(jobRequestsTable)
      .where(eq(jobRequestsTable.id, input.job_request_id))
      .execute();

    if (jobRequest.length === 0) {
      throw new Error(`Job request with id ${input.job_request_id} not found`);
    }

    // Insert job application record
    const result = await db.insert(jobApplicationsTable)
      .values({
        job_request_id: input.job_request_id,
        applicant_name: input.applicant_name,
        email: input.email,
        phone: input.phone,
        resume_url: input.resume_url,
        cover_letter: input.cover_letter,
        status: input.status,
        notes: input.notes
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Job application creation failed:', error);
    throw error;
  }
};
