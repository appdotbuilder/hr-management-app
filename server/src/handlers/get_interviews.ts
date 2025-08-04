
import { db } from '../db';
import { interviewsTable } from '../db/schema';
import { type Interview } from '../schema';

export const getInterviews = async (): Promise<Interview[]> => {
  try {
    const results = await db.select()
      .from(interviewsTable)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(interview => ({
      ...interview,
      score: interview.score ? parseFloat(interview.score) : null
    }));
  } catch (error) {
    console.error('Failed to fetch interviews:', error);
    throw error;
  }
};
