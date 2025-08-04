
import { db } from '../db';
import { trainingEnrollmentsTable, employeesTable, trainingProgramsTable } from '../db/schema';
import { type CreateTrainingEnrollmentInput, type TrainingEnrollment } from '../schema';
import { eq } from 'drizzle-orm';

export const createTrainingEnrollment = async (input: CreateTrainingEnrollmentInput): Promise<TrainingEnrollment> => {
  try {
    // Verify that the training program exists
    const trainingProgram = await db.select()
      .from(trainingProgramsTable)
      .where(eq(trainingProgramsTable.id, input.training_id))
      .execute();

    if (trainingProgram.length === 0) {
      throw new Error(`Training program with ID ${input.training_id} not found`);
    }

    // Verify that the employee exists
    const employee = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, input.employee_id))
      .execute();

    if (employee.length === 0) {
      throw new Error(`Employee with ID ${input.employee_id} not found`);
    }

    // Insert training enrollment record
    const result = await db.insert(trainingEnrollmentsTable)
      .values({
        training_id: input.training_id,
        employee_id: input.employee_id,
        attendance_status: input.attendance_status,
        completion_score: input.completion_score ? input.completion_score.toString() : null,
        feedback: input.feedback
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const enrollment = result[0];
    return {
      ...enrollment,
      attendance_status: enrollment.attendance_status as 'registered' | 'attended' | 'absent' | 'completed',
      completion_score: enrollment.completion_score ? parseFloat(enrollment.completion_score) : null
    };
  } catch (error) {
    console.error('Training enrollment creation failed:', error);
    throw error;
  }
};
