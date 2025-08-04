
import { db } from '../db';
import { trainingProgramsTable } from '../db/schema';
import { type CreateTrainingProgramInput, type TrainingProgram } from '../schema';

export const createTrainingProgram = async (input: CreateTrainingProgramInput): Promise<TrainingProgram> => {
  try {
    // Prepare the insert values object with proper date conversion
    const insertValues = {
      title: input.title,
      description: input.description,
      trainer: input.trainer,
      start_date: input.start_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
      end_date: input.end_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
      location: input.location,
      max_participants: input.max_participants,
      cost_per_participant: input.cost_per_participant ? input.cost_per_participant.toString() : null,
      status: input.status
    };

    // Insert training program record
    const result = await db.insert(trainingProgramsTable)
      .values(insertValues)
      .returning();

    // Convert fields back to expected types before returning
    const trainingProgram = result[0];
    return {
      id: trainingProgram.id,
      title: trainingProgram.title,
      description: trainingProgram.description,
      trainer: trainingProgram.trainer,
      start_date: new Date(trainingProgram.start_date),
      end_date: new Date(trainingProgram.end_date),
      location: trainingProgram.location,
      max_participants: trainingProgram.max_participants,
      cost_per_participant: trainingProgram.cost_per_participant ? parseFloat(trainingProgram.cost_per_participant) : null,
      status: trainingProgram.status,
      created_at: trainingProgram.created_at
    };
  } catch (error) {
    console.error('Training program creation failed:', error);
    throw error;
  }
};
