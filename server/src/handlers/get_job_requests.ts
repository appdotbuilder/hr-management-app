
import { db } from '../db';
import { jobRequestsTable } from '../db/schema';
import { type JobRequest } from '../schema';

export const getJobRequests = async (): Promise<JobRequest[]> => {
  try {
    const results = await db.select()
      .from(jobRequestsTable)
      .execute();

    return results.map(jobRequest => ({
      ...jobRequest,
      status: jobRequest.status as 'open' | 'closed' | 'cancelled', // Type assertion for status
      deadline: jobRequest.deadline ? new Date(jobRequest.deadline) : null // Convert date string to Date object
    }));
  } catch (error) {
    console.error('Failed to fetch job requests:', error);
    throw error;
  }
};
