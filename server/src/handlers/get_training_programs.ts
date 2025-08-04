
import { db } from '../db';
import { trainingProgramsTable } from '../db/schema';
import { type TrainingProgram } from '../schema';

export const getTrainingPrograms = async (): Promise<TrainingProgram[]> => {
  try {
    const results = await db.select()
      .from(trainingProgramsTable)
      .execute();

    // Convert database types to schema types
    return results.map(program => ({
      ...program,
      start_date: new Date(program.start_date),
      end_date: new Date(program.end_date),
      cost_per_participant: program.cost_per_participant ? parseFloat(program.cost_per_participant) : null
    }));
  } catch (error) {
    console.error('Training programs retrieval failed:', error);
    throw error;
  }
};
