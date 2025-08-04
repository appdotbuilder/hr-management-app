
import { db } from '../db';
import { performanceEvaluationsTable } from '../db/schema';
import { type PerformanceEvaluation } from '../schema';

export const getPerformanceEvaluations = async (): Promise<PerformanceEvaluation[]> => {
  try {
    const results = await db.select()
      .from(performanceEvaluationsTable)
      .execute();

    // Convert date strings back to Date objects and handle integer fields
    return results.map(evaluation => ({
      ...evaluation,
      evaluation_period_start: new Date(evaluation.evaluation_period_start),
      evaluation_period_end: new Date(evaluation.evaluation_period_end),
      goals_achievement: evaluation.goals_achievement,
      competency_score: evaluation.competency_score
    }));
  } catch (error) {
    console.error('Failed to fetch performance evaluations:', error);
    throw error;
  }
};
