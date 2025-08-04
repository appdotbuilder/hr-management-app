
import { db } from '../db';
import { performanceEvaluationsTable, employeesTable } from '../db/schema';
import { type CreatePerformanceEvaluationInput, type PerformanceEvaluation } from '../schema';
import { eq } from 'drizzle-orm';

export const createPerformanceEvaluation = async (input: CreatePerformanceEvaluationInput): Promise<PerformanceEvaluation> => {
  try {
    // Verify employee exists
    const employee = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, input.employee_id))
      .execute();

    if (employee.length === 0) {
      throw new Error(`Employee with id ${input.employee_id} does not exist`);
    }

    // Verify evaluator exists
    const evaluator = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, input.evaluator_id))
      .execute();

    if (evaluator.length === 0) {
      throw new Error(`Evaluator with id ${input.evaluator_id} does not exist`);
    }

    // Insert performance evaluation record
    const result = await db.insert(performanceEvaluationsTable)
      .values({
        employee_id: input.employee_id,
        evaluator_id: input.evaluator_id,
        evaluation_period_start: input.evaluation_period_start.toISOString().split('T')[0], // Convert Date to date string
        evaluation_period_end: input.evaluation_period_end.toISOString().split('T')[0], // Convert Date to date string
        overall_rating: input.overall_rating,
        goals_achievement: input.goals_achievement,
        competency_score: input.competency_score,
        strengths: input.strengths,
        areas_for_improvement: input.areas_for_improvement,
        development_plan: input.development_plan,
        comments: input.comments
      })
      .returning()
      .execute();

    const evaluation = result[0];
    
    // Convert date strings back to Date objects
    return {
      ...evaluation,
      evaluation_period_start: new Date(evaluation.evaluation_period_start),
      evaluation_period_end: new Date(evaluation.evaluation_period_end)
    };
  } catch (error) {
    console.error('Performance evaluation creation failed:', error);
    throw error;
  }
};
