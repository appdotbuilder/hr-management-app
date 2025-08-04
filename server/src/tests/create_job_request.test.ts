
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobRequestsTable, employeesTable } from '../db/schema';
import { type CreateJobRequestInput } from '../schema';
import { createJobRequest } from '../handlers/create_job_request';
import { eq } from 'drizzle-orm';

describe('createJobRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const testInput: CreateJobRequestInput = {
    title: 'Software Engineer',
    department: 'Engineering',
    position: 'Senior Developer',
    required_count: 2,
    job_description: 'We are looking for a senior software engineer to join our team.',
    requirements: 'Bachelor\'s degree in Computer Science, 5+ years experience',
    requested_by: 1,
    deadline: new Date('2024-06-30'),
    status: 'open'
  };

  it('should create a job request', async () => {
    // Create prerequisite employee first
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'John Doe',
      email: 'john@example.com',
      hire_date: '2023-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      status: 'active',
      contract_type: 'permanent'
    }).execute();

    const result = await createJobRequest(testInput);

    // Basic field validation
    expect(result.title).toEqual('Software Engineer');
    expect(result.department).toEqual('Engineering');
    expect(result.position).toEqual('Senior Developer');
    expect(result.required_count).toEqual(2);
    expect(result.job_description).toEqual('We are looking for a senior software engineer to join our team.');
    expect(result.requirements).toEqual('Bachelor\'s degree in Computer Science, 5+ years experience');
    expect(result.requested_by).toEqual(1);
    expect(result.deadline).toEqual(new Date('2024-06-30'));
    expect(result.status).toEqual('open');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.requested_date).toBeInstanceOf(Date);
  });

  it('should save job request to database', async () => {
    // Create prerequisite employee first
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'John Doe',
      email: 'john@example.com',
      hire_date: '2023-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      status: 'active',
      contract_type: 'permanent'
    }).execute();

    const result = await createJobRequest(testInput);

    // Query using proper drizzle syntax
    const jobRequests = await db.select()
      .from(jobRequestsTable)
      .where(eq(jobRequestsTable.id, result.id))
      .execute();

    expect(jobRequests).toHaveLength(1);
    expect(jobRequests[0].title).toEqual('Software Engineer');
    expect(jobRequests[0].department).toEqual('Engineering');
    expect(jobRequests[0].position).toEqual('Senior Developer');
    expect(jobRequests[0].required_count).toEqual(2);
    expect(jobRequests[0].requested_by).toEqual(1);
    expect(jobRequests[0].status).toEqual('open');
    expect(jobRequests[0].created_at).toBeInstanceOf(Date);
    expect(jobRequests[0].deadline).toEqual('2024-06-30');
  });

  it('should handle job request with null deadline', async () => {
    // Create prerequisite employee first
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'John Doe',
      email: 'john@example.com',
      hire_date: '2023-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      status: 'active',
      contract_type: 'permanent'
    }).execute();

    const inputWithNullDeadline: CreateJobRequestInput = {
      ...testInput,
      deadline: null
    };

    const result = await createJobRequest(inputWithNullDeadline);

    expect(result.deadline).toBeNull();
    expect(result.title).toEqual('Software Engineer');
    expect(result.status).toEqual('open');
  });

  it('should create job request with different status values', async () => {
    // Create prerequisite employee first
    await db.insert(employeesTable).values({
      employee_id: 'EMP001',
      full_name: 'John Doe',
      email: 'john@example.com',
      hire_date: '2023-01-01',
      position: 'HR Manager',
      department: 'Human Resources',
      status: 'active',
      contract_type: 'permanent'
    }).execute();

    const closedInput: CreateJobRequestInput = {
      ...testInput,
      status: 'closed'
    };

    const result = await createJobRequest(closedInput);

    expect(result.status).toEqual('closed');
    expect(result.title).toEqual('Software Engineer');
    expect(result.required_count).toEqual(2);
  });
});
