
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable, trainingProgramsTable, trainingEnrollmentsTable } from '../db/schema';
import { getTrainingEnrollments } from '../handlers/get_training_enrollments';

describe('getTrainingEnrollments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no enrollments exist', async () => {
    const result = await getTrainingEnrollments();
    expect(result).toEqual([]);
  });

  it('should return all training enrollments', async () => {
    // Create prerequisite employee
    const [employee] = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        address: '123 Main St',
        birth_date: '1990-01-01',
        hire_date: '2023-01-01',
        position: 'Developer',
        department: 'IT',
        salary: '75000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .returning()
      .execute();

    // Create prerequisite training program
    const [trainingProgram] = await db.insert(trainingProgramsTable)
      .values({
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        trainer: 'Jane Smith',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
        location: 'Conference Room A',
        max_participants: 20,
        cost_per_participant: '500.00',
        status: 'scheduled'
      })
      .returning()
      .execute();

    // Create training enrollment
    await db.insert(trainingEnrollmentsTable)
      .values({
        training_id: trainingProgram.id,
        employee_id: employee.id,
        attendance_status: 'registered',
        completion_score: '85.5',
        feedback: 'Great course!'
      })
      .execute();

    const result = await getTrainingEnrollments();

    expect(result).toHaveLength(1);
    expect(result[0].training_id).toEqual(trainingProgram.id);
    expect(result[0].employee_id).toEqual(employee.id);
    expect(result[0].attendance_status).toEqual('registered');
    expect(result[0].completion_score).toEqual(85.5);
    expect(typeof result[0].completion_score).toBe('number');
    expect(result[0].feedback).toEqual('Great course!');
    expect(result[0].id).toBeDefined();
    expect(result[0].enrollment_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple training enrollments', async () => {
    // Create prerequisite employee
    const [employee] = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        address: '123 Main St',
        birth_date: '1990-01-01',
        hire_date: '2023-01-01',
        position: 'Developer',
        department: 'IT',
        salary: '75000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .returning()
      .execute();

    // Create prerequisite training program
    const [trainingProgram] = await db.insert(trainingProgramsTable)
      .values({
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        trainer: 'Jane Smith',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
        location: 'Conference Room A',
        max_participants: 20,
        cost_per_participant: '500.00',
        status: 'scheduled'
      })
      .returning()
      .execute();

    // Create multiple enrollments
    await db.insert(trainingEnrollmentsTable)
      .values([
        {
          training_id: trainingProgram.id,
          employee_id: employee.id,
          attendance_status: 'registered',
          completion_score: '85.5',
          feedback: 'Great course!'
        },
        {
          training_id: trainingProgram.id,
          employee_id: employee.id,
          attendance_status: 'completed',
          completion_score: '92.0',
          feedback: 'Excellent training!'
        }
      ])
      .execute();

    const result = await getTrainingEnrollments();

    expect(result).toHaveLength(2);
    expect(result[0].completion_score).toEqual(85.5);
    expect(result[1].completion_score).toEqual(92.0);
    expect(typeof result[0].completion_score).toBe('number');
    expect(typeof result[1].completion_score).toBe('number');
  });

  it('should handle null completion_score correctly', async () => {
    // Create prerequisite employee
    const [employee] = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        address: '123 Main St',
        birth_date: '1990-01-01',
        hire_date: '2023-01-01',
        position: 'Developer',
        department: 'IT',
        salary: '75000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .returning()
      .execute();

    // Create prerequisite training program
    const [trainingProgram] = await db.insert(trainingProgramsTable)
      .values({
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        trainer: 'Jane Smith',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
        location: 'Conference Room A',
        max_participants: 20,
        cost_per_participant: '500.00',
        status: 'scheduled'
      })
      .returning()
      .execute();

    // Create enrollment with null completion_score
    await db.insert(trainingEnrollmentsTable)
      .values({
        training_id: trainingProgram.id,
        employee_id: employee.id,
        attendance_status: 'registered',
        completion_score: null,
        feedback: null
      })
      .execute();

    const result = await getTrainingEnrollments();

    expect(result).toHaveLength(1);
    expect(result[0].completion_score).toBeNull();
    expect(result[0].feedback).toBeNull();
  });
});
