
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobApplicationsTable, jobRequestsTable, employeesTable } from '../db/schema';
import { type CreateJobApplicationInput } from '../schema';
import { createJobApplication } from '../handlers/create_job_application';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateJobApplicationInput = {
  job_request_id: 1,
  applicant_name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  resume_url: 'https://example.com/resume.pdf',
  cover_letter: 'I am very interested in this position...',
  status: 'applied',
  notes: 'Submitted via online portal'
};

describe('createJobApplication', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a job application', async () => {
    // Create prerequisite employee
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'Manager User',
      email: 'manager@example.com',
      hire_date: '2023-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      status: 'active',
      contract_type: 'permanent'
    }).execute();

    // Create prerequisite job request
    await db.insert(jobRequestsTable).values({
      title: 'Software Developer',
      department: 'Engineering',
      position: 'Senior Developer',
      required_count: 2,
      job_description: 'Looking for experienced developer',
      requirements: 'Bachelor degree, 3+ years experience',
      requested_by: 1,
      status: 'open'
    }).execute();

    const result = await createJobApplication(testInput);

    // Basic field validation
    expect(result.applicant_name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.phone).toEqual('+1234567890');
    expect(result.resume_url).toEqual('https://example.com/resume.pdf');
    expect(result.cover_letter).toEqual('I am very interested in this position...');
    expect(result.status).toEqual('applied');
    expect(result.notes).toEqual('Submitted via online portal');
    expect(result.job_request_id).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.application_date).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save job application to database', async () => {
    // Create prerequisite employee
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'Manager User',
      email: 'manager@example.com',
      hire_date: '2023-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      status: 'active',
      contract_type: 'permanent'
    }).execute();

    // Create prerequisite job request
    await db.insert(jobRequestsTable).values({
      title: 'Software Developer',
      department: 'Engineering',
      position: 'Senior Developer',
      required_count: 2,
      job_description: 'Looking for experienced developer',
      requirements: 'Bachelor degree, 3+ years experience',
      requested_by: 1,
      status: 'open'
    }).execute();

    const result = await createJobApplication(testInput);

    // Query database to verify record was saved
    const applications = await db.select()
      .from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.id, result.id))
      .execute();

    expect(applications).toHaveLength(1);
    expect(applications[0].applicant_name).toEqual('John Doe');
    expect(applications[0].email).toEqual('john.doe@example.com');
    expect(applications[0].phone).toEqual('+1234567890');
    expect(applications[0].job_request_id).toEqual(1);
    expect(applications[0].status).toEqual('applied');
    expect(applications[0].application_date).toBeInstanceOf(Date);
    expect(applications[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    // Create prerequisite employee
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'Manager User',
      email: 'manager@example.com',
      hire_date: '2023-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      status: 'active',
      contract_type: 'permanent'
    }).execute();

    // Create prerequisite job request
    await db.insert(jobRequestsTable).values({
      title: 'Software Developer',
      department: 'Engineering',
      position: 'Senior Developer',
      required_count: 2,
      job_description: 'Looking for experienced developer',
      requirements: 'Bachelor degree, 3+ years experience',
      requested_by: 1,
      status: 'open'
    }).execute();

    const minimalInput: CreateJobApplicationInput = {
      job_request_id: 1,
      applicant_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      resume_url: null,
      cover_letter: null,
      status: 'applied',
      notes: null
    };

    const result = await createJobApplication(minimalInput);

    expect(result.applicant_name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane.smith@example.com');
    expect(result.phone).toEqual('+0987654321');
    expect(result.resume_url).toBeNull();
    expect(result.cover_letter).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.status).toEqual('applied');
    expect(result.job_request_id).toEqual(1);
  });

  it('should throw error when job request does not exist', async () => {
    const invalidInput: CreateJobApplicationInput = {
      job_request_id: 999, // Non-existent job request
      applicant_name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      resume_url: null,
      cover_letter: null,
      status: 'applied',
      notes: null
    };

    await expect(createJobApplication(invalidInput)).rejects.toThrow(/job request.*not found/i);
  });
});
