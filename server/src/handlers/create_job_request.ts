
import { db } from '../db';
import { jobRequestsTable } from '../db/schema';
import { type CreateJobRequestInput, type JobRequest } from '../schema';

export const createJobRequest = async (input: CreateJobRequestInput): Promise<JobRequest> => {
  try {
    // Insert job request record
    const result = await db.insert(jobRequestsTable)
      .values({
        title: input.title,
        department: input.department,
        position: input.position,
        required_count: input.required_count,
        job_description: input.job_description,
        requirements: input.requirements,
        requested_by: input.requested_by,
        deadline: input.deadline ? input.deadline.toISOString().split('T')[0] : null,
        status: input.status
      })
      .returning()
      .execute();

    const jobRequest = result[0];
    return {
      ...jobRequest,
      status: jobRequest.status as 'open' | 'closed' | 'cancelled',
      deadline: jobRequest.deadline ? new Date(jobRequest.deadline) : null
    };
  } catch (error) {
    console.error('Job request creation failed:', error);
    throw error;
  }
};
