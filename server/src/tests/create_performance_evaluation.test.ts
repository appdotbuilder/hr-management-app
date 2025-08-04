
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { performanceEvaluationsTable, employeesTable } from '../db/schema';
import { type CreatePerformanceEvaluationInput } from '../schema';
import { createPerformanceEvaluation } from '../handlers/create_performance_evaluation';
import { eq } from 'drizzle-orm';

// Test employee data
const testEmployee = {
  employee_id: 'EMP001',
  full_name: 'John Doe',
  email: 'john.doe@company.com',
  hire_date: '2023-01-01', // Use date string for insertion
  position: 'Software Engineer',
  department: 'Engineering',
  status: 'active' as const,
  contract_type: 'permanent' as const
};

const testEvaluator = {
  employee_id: 'EMP002',
  full_name: 'Jane Manager',
  email: 'jane.manager@company.com',
  hire_date: '2022-01-01', // Use date string for insertion
  position: 'Engineering Manager',
  department: 'Engineering',
  status: 'active' as const,
  contract_type: 'permanent' as const
};

const testInput: CreatePerformanceEvaluationInput = {
  employee_id: 1,
  evaluator_id: 2,
  evaluation_period_start: new Date('2024-01-01'),
  evaluation_period_end: new Date('2024-06-30'),
  overall_rating: 'good',
  goals_achievement: 85,
  competency_score: 90,
  strengths: 'Strong technical skills and collaboration',
  areas_for_improvement: 'Time management could be better',
  development_plan: 'Attend project management training',
  comments: 'Overall excellent performance this period'
};

describe('createPerformanceEvaluation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a performance evaluation', async () => {
    // Create prerequisite employees
    await db.insert(employeesTable).values(testEmployee).execute();
    await db.insert(employeesTable).values(testEvaluator).execute();

    const result = await createPerformanceEvaluation(testInput);

    // Basic field validation
    expect(result.employee_id).toEqual(1);
    expect(result.evaluator_id).toEqual(2);
    expect(result.evaluation_period_start).toEqual(new Date('2024-01-01'));
    expect(result.evaluation_period_end).toEqual(new Date('2024-06-30'));
    expect(result.overall_rating).toEqual('good');
    expect(result.goals_achievement).toEqual(85);
    expect(result.competency_score).toEqual(90);
    expect(result.strengths).toEqual('Strong technical skills and collaboration');
    expect(result.areas_for_improvement).toEqual('Time management could be better');
    expect(result.development_plan).toEqual('Attend project management training');
    expect(result.comments).toEqual('Overall excellent performance this period');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save performance evaluation to database', async () => {
    // Create prerequisite employees
    await db.insert(employeesTable).values(testEmployee).execute();
    await db.insert(employeesTable).values(testEvaluator).execute();

    const result = await createPerformanceEvaluation(testInput);

    // Query using proper drizzle syntax
    const evaluations = await db.select()
      .from(performanceEvaluationsTable)
      .where(eq(performanceEvaluationsTable.id, result.id))
      .execute();

    expect(evaluations).toHaveLength(1);
    expect(evaluations[0].employee_id).toEqual(1);
    expect(evaluations[0].evaluator_id).toEqual(2);
    expect(evaluations[0].overall_rating).toEqual('good');
    expect(evaluations[0].goals_achievement).toEqual(85);
    expect(evaluations[0].competency_score).toEqual(90);
    expect(evaluations[0].created_at).toBeInstanceOf(Date);
    // Date fields are returned as strings from database
    expect(evaluations[0].evaluation_period_start).toEqual('2024-01-01');
    expect(evaluations[0].evaluation_period_end).toEqual('2024-06-30');
  });

  it('should create evaluation with null optional fields', async () => {
    // Create prerequisite employees
    await db.insert(employeesTable).values(testEmployee).execute();
    await db.insert(employeesTable).values(testEvaluator).execute();

    const minimalInput: CreatePerformanceEvaluationInput = {
      employee_id: 1,
      evaluator_id: 2,
      evaluation_period_start: new Date('2024-01-01'),
      evaluation_period_end: new Date('2024-06-30'),
      overall_rating: 'satisfactory',
      goals_achievement: 75,
      competency_score: 80,
      strengths: null,
      areas_for_improvement: null,
      development_plan: null,
      comments: null
    };

    const result = await createPerformanceEvaluation(minimalInput);

    expect(result.strengths).toBeNull();
    expect(result.areas_for_improvement).toBeNull();
    expect(result.development_plan).toBeNull();
    expect(result.comments).toBeNull();
    expect(result.overall_rating).toEqual('satisfactory');
    expect(result.goals_achievement).toEqual(75);
    expect(result.competency_score).toEqual(80);
  });

  it('should throw error when employee does not exist', async () => {
    // Create only evaluator (it will get ID 1), use specific input where employee_id doesn't exist
    await db.insert(employeesTable).values(testEvaluator).execute();

    const inputWithMissingEmployee: CreatePerformanceEvaluationInput = {
      employee_id: 999, // Non-existent employee ID
      evaluator_id: 1,  // Evaluator exists with ID 1
      evaluation_period_start: new Date('2024-01-01'),
      evaluation_period_end: new Date('2024-06-30'),
      overall_rating: 'good',
      goals_achievement: 85,
      competency_score: 90,
      strengths: null,
      areas_for_improvement: null,
      development_plan: null,
      comments: null
    };

    await expect(createPerformanceEvaluation(inputWithMissingEmployee))
      .rejects.toThrow(/Employee with id 999 does not exist/i);
  });

  it('should throw error when evaluator does not exist', async () => {
    // Create only employee (it will get ID 1), use specific input where evaluator_id doesn't exist
    await db.insert(employeesTable).values(testEmployee).execute();

    const inputWithMissingEvaluator: CreatePerformanceEvaluationInput = {
      employee_id: 1,   // Employee exists with ID 1
      evaluator_id: 999, // Non-existent evaluator ID
      evaluation_period_start: new Date('2024-01-01'),
      evaluation_period_end: new Date('2024-06-30'),
      overall_rating: 'good',
      goals_achievement: 85,
      competency_score: 90,
      strengths: null,
      areas_for_improvement: null,
      development_plan: null,
      comments: null
    };

    await expect(createPerformanceEvaluation(inputWithMissingEvaluator))
      .rejects.toThrow(/Evaluator with id 999 does not exist/i);
  });

  it('should handle boundary score values correctly', async () => {
    // Create prerequisite employees
    await db.insert(employeesTable).values(testEmployee).execute();
    await db.insert(employeesTable).values(testEvaluator).execute();

    const boundaryInput: CreatePerformanceEvaluationInput = {
      employee_id: 1,
      evaluator_id: 2,
      evaluation_period_start: new Date('2024-01-01'),
      evaluation_period_end: new Date('2024-12-31'),
      overall_rating: 'excellent',
      goals_achievement: 100, // Maximum score
      competency_score: 0,    // Minimum score
      strengths: null,
      areas_for_improvement: null,
      development_plan: null,
      comments: null
    };

    const result = await createPerformanceEvaluation(boundaryInput);

    expect(result.goals_achievement).toEqual(100);
    expect(result.competency_score).toEqual(0);
    expect(result.overall_rating).toEqual('excellent');
  });

  it('should return dates as Date objects', async () => {
    // Create prerequisite employees
    await db.insert(employeesTable).values(testEmployee).execute();
    await db.insert(employeesTable).values(testEvaluator).execute();

    const result = await createPerformanceEvaluation(testInput);

    // Verify date conversion
    expect(result.evaluation_period_start).toBeInstanceOf(Date);
    expect(result.evaluation_period_end).toBeInstanceOf(Date);
    expect(result.evaluation_period_start.getFullYear()).toEqual(2024);
    expect(result.evaluation_period_start.getMonth()).toEqual(0); // January is 0
    expect(result.evaluation_period_end.getMonth()).toEqual(5); // June is 5
  });
});
