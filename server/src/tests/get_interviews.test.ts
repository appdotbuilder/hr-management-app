
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable, jobRequestsTable, jobApplicationsTable, interviewsTable } from '../db/schema';
import { getInterviews } from '../handlers/get_interviews';

describe('getInterviews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no interviews exist', async () => {
    const result = await getInterviews();
    expect(result).toEqual([]);
  });

  it('should return all interviews', async () => {
    // Create prerequisite employee
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'John Interviewer',
      email: 'john@test.com',
      phone: '123-456-7890',
      address: '123 Test St',
      birth_date: '1990-01-01',
      hire_date: '2020-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      salary: '75000.00',
      status: 'active',
      contract_type: 'permanent',
      manager_id: null
    }).execute();

    // Create job request
    await db.insert(jobRequestsTable).values({
      title: 'Software Developer',
      department: 'IT',
      position: 'Developer',
      required_count: 2,
      job_description: 'Develop software applications',
      requirements: 'Bachelor degree in CS',
      requested_by: 1,
      deadline: '2024-12-31',
      status: 'open'
    }).execute();

    // Create job application
    await db.insert(jobApplicationsTable).values({
      job_request_id: 1,
      applicant_name: 'Jane Doe',
      email: 'jane@test.com',
      phone: '987-654-3210',
      resume_url: 'https://example.com/resume.pdf',
      cover_letter: 'I am interested in this position',
      status: 'interview',
      notes: 'Good candidate'
    }).execute();

    // Create interview
    await db.insert(interviewsTable).values({
      application_id: 1,
      interview_date: new Date('2024-02-01T10:00:00Z'),
      interviewer_id: 1,
      interview_type: 'Technical',
      location: 'Conference Room A',
      notes: 'First round interview',
      result: 'Passed',
      score: '85.50',
      status: 'completed'
    }).execute();

    const result = await getInterviews();

    expect(result).toHaveLength(1);
    expect(result[0].application_id).toEqual(1);
    expect(result[0].interviewer_id).toEqual(1);
    expect(result[0].interview_type).toEqual('Technical');
    expect(result[0].location).toEqual('Conference Room A');
    expect(result[0].notes).toEqual('First round interview');
    expect(result[0].result).toEqual('Passed');
    expect(result[0].score).toEqual(85.5);
    expect(typeof result[0].score).toBe('number');
    expect(result[0].status).toEqual('completed');
    expect(result[0].id).toBeDefined();
    expect(result[0].interview_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle interviews with null score', async () => {
    // Create prerequisite employee
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'John Interviewer',
      email: 'john@test.com',
      phone: '123-456-7890',
      address: '123 Test St',
      birth_date: '1990-01-01',
      hire_date: '2020-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      salary: '75000.00',
      status: 'active',
      contract_type: 'permanent',
      manager_id: null
    }).execute();

    // Create job request
    await db.insert(jobRequestsTable).values({
      title: 'Software Developer',
      department: 'IT',
      position: 'Developer',
      required_count: 2,
      job_description: 'Develop software applications',
      requirements: 'Bachelor degree in CS',
      requested_by: 1,
      deadline: '2024-12-31',
      status: 'open'
    }).execute();

    // Create job application
    await db.insert(jobApplicationsTable).values({
      job_request_id: 1,
      applicant_name: 'Jane Doe',
      email: 'jane@test.com',
      phone: '987-654-3210',
      resume_url: 'https://example.com/resume.pdf',
      cover_letter: 'I am interested in this position',
      status: 'interview',
      notes: 'Good candidate'
    }).execute();

    // Create interview with null score
    await db.insert(interviewsTable).values({
      application_id: 1,
      interview_date: new Date('2024-02-01T10:00:00Z'),
      interviewer_id: 1,
      interview_type: 'Technical',
      location: 'Conference Room A',
      notes: 'First round interview',
      result: 'Passed',
      score: null,
      status: 'scheduled'
    }).execute();

    const result = await getInterviews();

    expect(result).toHaveLength(1);
    expect(result[0].score).toBeNull();
    expect(result[0].status).toEqual('scheduled');
  });

  it('should return multiple interviews', async () => {
    // Create prerequisite employee
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'John Interviewer',
      email: 'john@test.com',
      phone: '123-456-7890',
      address: '123 Test St',
      birth_date: '1990-01-01',
      hire_date: '2020-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      salary: '75000.00',
      status: 'active',
      contract_type: 'permanent',
      manager_id: null
    }).execute();

    // Create job request
    await db.insert(jobRequestsTable).values({
      title: 'Software Developer',
      department: 'IT',
      position: 'Developer',
      required_count: 2,
      job_description: 'Develop software applications',
      requirements: 'Bachelor degree in CS',
      requested_by: 1,
      deadline: '2024-12-31',
      status: 'open'
    }).execute();

    // Create job application
    await db.insert(jobApplicationsTable).values({
      job_request_id: 1,
      applicant_name: 'Jane Doe',
      email: 'jane@test.com',
      phone: '987-654-3210',
      resume_url: 'https://example.com/resume.pdf',
      cover_letter: 'I am interested in this position',
      status: 'interview',
      notes: 'Good candidate'
    }).execute();

    // Create multiple interviews
    await db.insert(interviewsTable).values([
      {
        application_id: 1,
        interview_date: new Date('2024-02-01T10:00:00Z'),
        interviewer_id: 1,
        interview_type: 'Technical',
        location: 'Conference Room A',
        notes: 'First round',
        result: 'Passed',
        score: '85.50',
        status: 'completed'
      },
      {
        application_id: 1,
        interview_date: new Date('2024-02-05T14:00:00Z'),
        interviewer_id: 1,
        interview_type: 'HR',
        location: 'Conference Room B',
        notes: 'Second round',
        result: null,
        score: null,
        status: 'scheduled'
      }
    ]).execute();

    const result = await getInterviews();

    expect(result).toHaveLength(2);
    
    // First interview
    expect(result[0].interview_type).toEqual('Technical');
    expect(result[0].score).toEqual(85.5);
    expect(result[0].status).toEqual('completed');
    
    // Second interview
    expect(result[1].interview_type).toEqual('HR');
    expect(result[1].score).toBeNull();
    expect(result[1].status).toEqual('scheduled');
  });
});
