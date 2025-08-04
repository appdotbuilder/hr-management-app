
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable, jobRequestsTable } from '../db/schema';
import { type CreateJobRequestInput } from '../schema';
import { getJobRequests } from '../handlers/get_job_requests';

describe('getJobRequests', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no job requests exist', async () => {
    const result = await getJobRequests();
    expect(result).toEqual([]);
  });

  it('should return all job requests', async () => {
    // Create prerequisite employee first
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        hire_date: '2023-01-01', // Use string format for date fields
        position: 'Manager',
        department: 'HR',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create test job requests
    const testJobRequest1: CreateJobRequestInput = {
      title: 'Software Engineer',
      department: 'Engineering',
      position: 'Senior Developer',
      required_count: 2,
      job_description: 'Develop software applications',
      requirements: 'Bachelor degree in CS',
      requested_by: employee[0].id,
      deadline: new Date('2024-12-31'),
      status: 'open'
    };

    const testJobRequest2: CreateJobRequestInput = {
      title: 'Marketing Specialist',
      department: 'Marketing',
      position: 'Marketing Manager',
      required_count: 1,
      job_description: 'Manage marketing campaigns',
      requirements: 'Marketing experience required',
      requested_by: employee[0].id,
      deadline: null,
      status: 'closed'
    };

    await db.insert(jobRequestsTable)
      .values([
        {
          title: testJobRequest1.title,
          department: testJobRequest1.department,
          position: testJobRequest1.position,
          required_count: testJobRequest1.required_count,
          job_description: testJobRequest1.job_description,
          requirements: testJobRequest1.requirements,
          requested_by: testJobRequest1.requested_by,
          deadline: testJobRequest1.deadline ? testJobRequest1.deadline.toISOString().split('T')[0] : null, // Convert Date to string
          status: testJobRequest1.status
        },
        {
          title: testJobRequest2.title,
          department: testJobRequest2.department,
          position: testJobRequest2.position,
          required_count: testJobRequest2.required_count,
          job_description: testJobRequest2.job_description,
          requirements: testJobRequest2.requirements,
          requested_by: testJobRequest2.requested_by,
          deadline: testJobRequest2.deadline ? testJobRequest2.deadline.toISOString().split('T')[0] : null,
          status: testJobRequest2.status
        }
      ])
      .execute();

    const result = await getJobRequests();

    expect(result).toHaveLength(2);
    
    // Verify first job request
    const jobRequest1 = result.find(jr => jr.title === 'Software Engineer');
    expect(jobRequest1).toBeDefined();
    expect(jobRequest1!.department).toEqual('Engineering');
    expect(jobRequest1!.position).toEqual('Senior Developer');
    expect(jobRequest1!.required_count).toEqual(2);
    expect(jobRequest1!.job_description).toEqual('Develop software applications');
    expect(jobRequest1!.requirements).toEqual('Bachelor degree in CS');
    expect(jobRequest1!.requested_by).toEqual(employee[0].id);
    expect(jobRequest1!.status).toEqual('open');
    expect(jobRequest1!.id).toBeDefined();
    expect(jobRequest1!.requested_date).toBeInstanceOf(Date);
    expect(jobRequest1!.created_at).toBeInstanceOf(Date);
    expect(jobRequest1!.deadline).toBeInstanceOf(Date);

    // Verify second job request
    const jobRequest2 = result.find(jr => jr.title === 'Marketing Specialist');
    expect(jobRequest2).toBeDefined();
    expect(jobRequest2!.department).toEqual('Marketing');
    expect(jobRequest2!.position).toEqual('Marketing Manager');
    expect(jobRequest2!.required_count).toEqual(1);
    expect(jobRequest2!.deadline).toBeNull();
    expect(jobRequest2!.status).toEqual('closed');
  });

  it('should return job requests in creation order', async () => {
    // Create prerequisite employee
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'Jane Smith',
        email: 'jane.smith@example.com',
        hire_date: '2023-01-01', // Use string format for date fields
        position: 'Director',
        department: 'Operations',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create multiple job requests with slight delay to ensure different timestamps
    await db.insert(jobRequestsTable)
      .values({
        title: 'First Job',
        department: 'IT',
        position: 'Developer',
        required_count: 1,
        job_description: 'First job description',
        requirements: 'First requirements',
        requested_by: employee[0].id,
        deadline: null,
        status: 'open'
      })
      .execute();

    await db.insert(jobRequestsTable)
      .values({
        title: 'Second Job',
        department: 'Sales',
        position: 'Sales Rep',
        required_count: 3,
        job_description: 'Second job description',
        requirements: 'Second requirements',
        requested_by: employee[0].id,
        deadline: '2024-06-30', // Use string format for date
        status: 'open'
      })
      .execute();

    const result = await getJobRequests();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('First Job');
    expect(result[1].title).toEqual('Second Job');
    
    // Verify deadline conversion
    expect(result[0].deadline).toBeNull();
    expect(result[1].deadline).toBeInstanceOf(Date);
    expect(result[1].deadline!.toISOString().split('T')[0]).toEqual('2024-06-30');
  });
});
