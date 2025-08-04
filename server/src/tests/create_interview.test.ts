
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { interviewsTable, employeesTable, jobRequestsTable, jobApplicationsTable } from '../db/schema';
import { type CreateInterviewInput } from '../schema';
import { createInterview } from '../handlers/create_interview';
import { eq } from 'drizzle-orm';

// Test data setup
let testEmployee: any;
let testJobRequest: any;
let testJobApplication: any;

const setupTestData = async () => {
  // Create test employee (interviewer)
  const employeeResult = await db.insert(employeesTable)
    .values({
      employee_id: 'EMP001',
      full_name: 'John Interviewer',
      email: 'john.interviewer@company.com',
      hire_date: '2023-01-01', // Use string format for date column
      position: 'Senior Developer',
      department: 'Engineering',
      status: 'active',
      contract_type: 'permanent'
    })
    .returning()
    .execute();
  testEmployee = employeeResult[0];

  // Create test job request
  const jobRequestResult = await db.insert(jobRequestsTable)
    .values({
      title: 'Software Developer',
      department: 'Engineering',
      position: 'Developer',
      required_count: 2,
      job_description: 'Develop software applications',
      requirements: 'Bachelor degree in CS',
      requested_by: testEmployee.id,
      status: 'open'
    })
    .returning()
    .execute();
  testJobRequest = jobRequestResult[0];

  // Create test job application
  const applicationResult = await db.insert(jobApplicationsTable)
    .values({
      job_request_id: testJobRequest.id,
      applicant_name: 'Jane Candidate',
      email: 'jane.candidate@email.com',
      phone: '123-456-7890',
      status: 'applied'
    })
    .returning()
    .execute();
  testJobApplication = applicationResult[0];
};

const testInput: CreateInterviewInput = {
  application_id: 0, // Will be set in beforeEach
  interview_date: new Date('2024-01-15T10:00:00Z'),
  interviewer_id: 0, // Will be set in beforeEach
  interview_type: 'technical',
  location: 'Conference Room A',
  notes: 'Initial technical screening',
  result: null,
  score: 85.5,
  status: 'scheduled'
};

describe('createInterview', () => {
  beforeEach(async () => {
    await createDB();
    await setupTestData();
    testInput.application_id = testJobApplication.id;
    testInput.interviewer_id = testEmployee.id;
  });

  afterEach(resetDB);

  it('should create an interview', async () => {
    const result = await createInterview(testInput);

    // Basic field validation
    expect(result.application_id).toEqual(testJobApplication.id);
    expect(result.interview_date).toEqual(testInput.interview_date);
    expect(result.interviewer_id).toEqual(testEmployee.id);
    expect(result.interview_type).toEqual('technical');
    expect(result.location).toEqual('Conference Room A');
    expect(result.notes).toEqual('Initial technical screening');
    expect(result.result).toBeNull();
    expect(result.score).toEqual(85.5);
    expect(typeof result.score).toEqual('number');
    expect(result.status).toEqual('scheduled');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save interview to database', async () => {
    const result = await createInterview(testInput);

    // Verify interview was saved to database
    const interviews = await db.select()
      .from(interviewsTable)
      .where(eq(interviewsTable.id, result.id))
      .execute();

    expect(interviews).toHaveLength(1);
    expect(interviews[0].application_id).toEqual(testJobApplication.id);
    expect(interviews[0].interviewer_id).toEqual(testEmployee.id);
    expect(interviews[0].interview_type).toEqual('technical');
    expect(interviews[0].location).toEqual('Conference Room A');
    expect(parseFloat(interviews[0].score!)).toEqual(85.5);
    expect(interviews[0].status).toEqual('scheduled');
    expect(interviews[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle null optional fields', async () => {
    const inputWithNulls: CreateInterviewInput = {
      application_id: testJobApplication.id,
      interview_date: new Date('2024-01-20T14:00:00Z'),
      interviewer_id: testEmployee.id,
      interview_type: 'behavioral',
      location: null,
      notes: null,
      result: null,
      score: null,
      status: 'scheduled'
    };

    const result = await createInterview(inputWithNulls);

    expect(result.location).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.result).toBeNull();
    expect(result.score).toBeNull();
    expect(result.interview_type).toEqual('behavioral');
    expect(result.status).toEqual('scheduled');
  });

  it('should throw error for non-existent job application', async () => {
    const invalidInput: CreateInterviewInput = {
      ...testInput,
      application_id: 99999
    };

    expect(createInterview(invalidInput)).rejects.toThrow(/job application not found/i);
  });

  it('should throw error for non-existent interviewer', async () => {
    const invalidInput: CreateInterviewInput = {
      ...testInput,
      interviewer_id: 99999
    };

    expect(createInterview(invalidInput)).rejects.toThrow(/interviewer not found/i);
  });

  it('should handle numeric score conversion correctly', async () => {
    const inputWithScore: CreateInterviewInput = {
      ...testInput,
      score: 92.75
    };

    const result = await createInterview(inputWithScore);

    expect(result.score).toEqual(92.75);
    expect(typeof result.score).toEqual('number');

    // Verify database storage and conversion
    const dbInterview = await db.select()
      .from(interviewsTable)
      .where(eq(interviewsTable.id, result.id))
      .execute();

    expect(parseFloat(dbInterview[0].score!)).toEqual(92.75);
  });
});
