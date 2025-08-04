
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable, performanceEvaluationsTable } from '../db/schema';
import { getPerformanceEvaluations } from '../handlers/get_performance_evaluations';

describe('getPerformanceEvaluations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no evaluations exist', async () => {
    const result = await getPerformanceEvaluations();
    expect(result).toEqual([]);
  });

  it('should return all performance evaluations', async () => {
    // Create prerequisite employees with proper date/salary conversion
    const employeeResult = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        birth_date: '1990-01-01',
        hire_date: '2020-01-01',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: '75000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .returning()
      .execute();
    
    const evaluatorResult = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP002',
        full_name: 'Jane Manager',
        email: 'jane.manager@example.com',
        phone: '+1234567891',
        address: '456 Oak Ave',
        birth_date: '1985-05-15',
        hire_date: '2018-01-01',
        position: 'Engineering Manager',
        department: 'Engineering',
        salary: '95000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .returning()
      .execute();

    const employeeId = employeeResult[0].id;
    const evaluatorId = evaluatorResult[0].id;

    // Create test evaluations with proper date conversion
    await db.insert(performanceEvaluationsTable)
      .values([
        {
          employee_id: employeeId,
          evaluator_id: evaluatorId,
          evaluation_period_start: '2023-01-01',
          evaluation_period_end: '2023-06-30',
          overall_rating: 'excellent',
          goals_achievement: 95,
          competency_score: 88,
          strengths: 'Strong technical skills, excellent problem solving',
          areas_for_improvement: 'Communication could be improved',
          development_plan: 'Attend communication workshops',
          comments: 'Outstanding performance this period'
        },
        {
          employee_id: employeeId,
          evaluator_id: evaluatorId,
          evaluation_period_start: '2023-07-01',
          evaluation_period_end: '2023-12-31',
          overall_rating: 'good',
          goals_achievement: 85,
          competency_score: 80,
          strengths: 'Improved communication skills',
          areas_for_improvement: 'Leadership skills development needed',
          development_plan: 'Take on more leadership responsibilities',
          comments: 'Good progress made'
        }
      ])
      .execute();

    const result = await getPerformanceEvaluations();

    expect(result).toHaveLength(2);
    
    // Verify first evaluation
    const firstEval = result.find(e => e.overall_rating === 'excellent');
    expect(firstEval).toBeDefined();
    expect(firstEval!.employee_id).toEqual(employeeId);
    expect(firstEval!.evaluator_id).toEqual(evaluatorId);
    expect(firstEval!.goals_achievement).toEqual(95);
    expect(firstEval!.competency_score).toEqual(88);
    expect(firstEval!.strengths).toEqual('Strong technical skills, excellent problem solving');
    expect(firstEval!.evaluation_period_start).toBeInstanceOf(Date);
    expect(firstEval!.evaluation_period_end).toBeInstanceOf(Date);
    expect(firstEval!.created_at).toBeInstanceOf(Date);

    // Verify second evaluation
    const secondEval = result.find(e => e.overall_rating === 'good');
    expect(secondEval).toBeDefined();
    expect(secondEval!.employee_id).toEqual(employeeId);
    expect(secondEval!.evaluator_id).toEqual(evaluatorId);
    expect(secondEval!.goals_achievement).toEqual(85);
    expect(secondEval!.competency_score).toEqual(80);
    expect(secondEval!.areas_for_improvement).toEqual('Leadership skills development needed');
  });

  it('should handle multiple employees with evaluations', async () => {
    // Create employees with proper conversions
    const employee1Result = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        birth_date: '1990-01-01',
        hire_date: '2020-01-01',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: '75000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .returning()
      .execute();
    
    const employee2Result = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP003',
        full_name: 'Bob Smith',
        email: 'employee2@example.com',
        phone: '+1234567892',
        address: '789 Pine St',
        birth_date: '1992-03-15',
        hire_date: '2021-06-01',
        position: 'Junior Developer',
        department: 'Engineering',
        salary: '65000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .returning()
      .execute();

    const evaluatorResult = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP002',
        full_name: 'Jane Manager',
        email: 'jane.manager@example.com',
        phone: '+1234567891',
        address: '456 Oak Ave',
        birth_date: '1985-05-15',
        hire_date: '2018-01-01',
        position: 'Engineering Manager',
        department: 'Engineering',
        salary: '95000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .returning()
      .execute();

    const employee1Id = employee1Result[0].id;
    const employee2Id = employee2Result[0].id;
    const evaluatorId = evaluatorResult[0].id;

    // Create evaluations for different employees
    await db.insert(performanceEvaluationsTable)
      .values([
        {
          employee_id: employee1Id,
          evaluator_id: evaluatorId,
          evaluation_period_start: '2023-01-01',
          evaluation_period_end: '2023-06-30',
          overall_rating: 'excellent',
          goals_achievement: 95,
          competency_score: 88,
          strengths: 'Employee 1 strengths',
          areas_for_improvement: null,
          development_plan: null,
          comments: null
        },
        {
          employee_id: employee2Id,
          evaluator_id: evaluatorId,
          evaluation_period_start: '2023-01-01',
          evaluation_period_end: '2023-06-30',
          overall_rating: 'satisfactory',
          goals_achievement: 70,
          competency_score: 75,
          strengths: 'Employee 2 strengths',
          areas_for_improvement: 'Needs improvement in multiple areas',
          development_plan: 'Detailed improvement plan',
          comments: 'Room for growth'
        }
      ])
      .execute();

    const result = await getPerformanceEvaluations();

    expect(result).toHaveLength(2);
    
    // Verify evaluations for different employees exist
    const emp1Eval = result.find(e => e.employee_id === employee1Id);
    const emp2Eval = result.find(e => e.employee_id === employee2Id);
    
    expect(emp1Eval).toBeDefined();
    expect(emp2Eval).toBeDefined();
    expect(emp1Eval!.overall_rating).toEqual('excellent');
    expect(emp2Eval!.overall_rating).toEqual('satisfactory');
    expect(emp1Eval!.evaluation_period_start).toBeInstanceOf(Date);
    expect(emp2Eval!.evaluation_period_end).toBeInstanceOf(Date);
  });
});
