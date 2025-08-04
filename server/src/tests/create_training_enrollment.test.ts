
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trainingEnrollmentsTable, employeesTable, trainingProgramsTable } from '../db/schema';
import { type CreateTrainingEnrollmentInput } from '../schema';
import { createTrainingEnrollment } from '../handlers/create_training_enrollment';
import { eq } from 'drizzle-orm';

describe('createTrainingEnrollment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let employeeId: number;
  let trainingId: number;

  beforeEach(async () => {
    // Create test employee
    const employeeResult = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        hire_date: '2023-01-01',
        position: 'Developer',
        department: 'Engineering',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();
    
    employeeId = employeeResult[0].id;

    // Create test training program
    const trainingResult = await db.insert(trainingProgramsTable)
      .values({
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        trainer: 'Jane Smith',
        start_date: '2024-02-01',
        end_date: '2024-02-15',
        max_participants: 20,
        status: 'scheduled'
      })
      .returning()
      .execute();
    
    trainingId = trainingResult[0].id;
  });

  const testInput: CreateTrainingEnrollmentInput = {
    training_id: 0, // Will be set in test
    employee_id: 0, // Will be set in test
    attendance_status: 'registered',
    completion_score: 85,
    feedback: 'Looking forward to this training'
  };

  it('should create a training enrollment', async () => {
    const input = {
      ...testInput,
      training_id: trainingId,
      employee_id: employeeId
    };

    const result = await createTrainingEnrollment(input);

    // Basic field validation
    expect(result.training_id).toEqual(trainingId);
    expect(result.employee_id).toEqual(employeeId);
    expect(result.attendance_status).toEqual('registered');
    expect(result.completion_score).toEqual(85);
    expect(typeof result.completion_score).toEqual('number');
    expect(result.feedback).toEqual('Looking forward to this training');
    expect(result.id).toBeDefined();
    expect(result.enrollment_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save training enrollment to database', async () => {
    const input = {
      ...testInput,
      training_id: trainingId,
      employee_id: employeeId
    };

    const result = await createTrainingEnrollment(input);

    const enrollments = await db.select()
      .from(trainingEnrollmentsTable)
      .where(eq(trainingEnrollmentsTable.id, result.id))
      .execute();

    expect(enrollments).toHaveLength(1);
    expect(enrollments[0].training_id).toEqual(trainingId);
    expect(enrollments[0].employee_id).toEqual(employeeId);
    expect(enrollments[0].attendance_status).toEqual('registered');
    expect(parseFloat(enrollments[0].completion_score!)).toEqual(85);
    expect(enrollments[0].feedback).toEqual('Looking forward to this training');
    expect(enrollments[0].enrollment_date).toBeInstanceOf(Date);
    expect(enrollments[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle null completion_score and feedback', async () => {
    const input = {
      training_id: trainingId,
      employee_id: employeeId,
      attendance_status: 'registered' as const,
      completion_score: null,
      feedback: null
    };

    const result = await createTrainingEnrollment(input);

    expect(result.completion_score).toBeNull();
    expect(result.feedback).toBeNull();

    const enrollments = await db.select()
      .from(trainingEnrollmentsTable)
      .where(eq(trainingEnrollmentsTable.id, result.id))
      .execute();

    expect(enrollments[0].completion_score).toBeNull();
    expect(enrollments[0].feedback).toBeNull();
  });

  it('should throw error for non-existent training program', async () => {
    const input = {
      ...testInput,
      training_id: 99999,
      employee_id: employeeId
    };

    await expect(createTrainingEnrollment(input)).rejects.toThrow(/Training program with ID 99999 not found/i);
  });

  it('should throw error for non-existent employee', async () => {
    const input = {
      ...testInput,
      training_id: trainingId,
      employee_id: 99999
    };

    await expect(createTrainingEnrollment(input)).rejects.toThrow(/Employee with ID 99999 not found/i);
  });
});
