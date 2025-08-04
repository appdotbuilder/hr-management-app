
import { db } from '../db';
import { jobApplicationsTable } from '../db/schema';
import { type JobApplication } from '../schema';

export const getJobApplications = async (): Promise<JobApplication[]> => {
  try {
    const results = await db.select()
      .from(jobApplicationsTable)
      .execute();

    return results.map(application => ({
      ...application,
      // Convert Date objects to proper Date instances (they're already dates from timestamp columns)
      application_date: new Date(application.application_date),
      created_at: new Date(application.created_at)
    }));
  } catch (error) {
    console.error('Failed to fetch job applications:', error);
    throw error;
  }
};
