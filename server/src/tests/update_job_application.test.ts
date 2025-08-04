
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobApplicationsTable, jobRequestsTable, employeesTable } from '../db/schema';
import { type UpdateJobApplicationInput } from '../schema';
import { updateJobApplication } from '../handlers/update_job_application';
import { eq } from 'drizzle-orm';

describe('updateJobApplication', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update job application status', async () => {
    // Create required employee first
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'Manager User',
        email: 'manager@test.com',
        hire_date: '2020-01-01',
        position: 'Manager',
        department: 'HR',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create job request
    const jobRequest = await db.insert(jobRequestsTable)
      .values({
        title: 'Software Developer',
        department: 'IT',
        position: 'Developer',
        required_count: 1,
        job_description: 'Develop software',
        requirements: 'Programming skills',
        requested_by: employee[0].id,
        status: 'open'
      })
      .returning()
      .execute();

    // Create job application
    const application = await db.insert(jobApplicationsTable)
      .values({
        job_request_id: jobRequest[0].id,
        applicant_name: 'John Doe',
        email: 'john@test.com',
        phone: '1234567890',
        status: 'applied'
      })
      .returning()
      .execute();

    const updateInput: UpdateJobApplicationInput = {
      id: application[0].id,
      status: 'interview'
    };

    const result = await updateJobApplication(updateInput);

    expect(result.id).toEqual(application[0].id);
    expect(result.status).toEqual('interview');
    expect(result.applicant_name).toEqual('John Doe');
    expect(result.email).toEqual('john@test.com');
  });

  it('should update job application notes', async () => {
    // Create required employee first
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'Manager User',
        email: 'manager@test.com',
        hire_date: '2020-01-01',
        position: 'Manager',
        department: 'HR',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create job request
    const jobRequest = await db.insert(jobRequestsTable)
      .values({
        title: 'Software Developer',
        department: 'IT',
        position: 'Developer',
        required_count: 1,
        job_description: 'Develop software',
        requirements: 'Programming skills',
        requested_by: employee[0].id,
        status: 'open'
      })
      .returning()
      .execute();

    // Create job application
    const application = await db.insert(jobApplicationsTable)
      .values({
        job_request_id: jobRequest[0].id,
        applicant_name: 'Jane Smith',
        email: 'jane@test.com',
        phone: '0987654321',
        status: 'applied'
      })
      .returning()
      .execute();

    const updateInput: UpdateJobApplicationInput = {
      id: application[0].id,
      notes: 'Excellent candidate, proceed to interview'
    };

    const result = await updateJobApplication(updateInput);

    expect(result.id).toEqual(application[0].id);
    expect(result.notes).toEqual('Excellent candidate, proceed to interview');
    expect(result.status).toEqual('applied'); // Should remain unchanged
  });

  it('should update both status and notes', async () => {
    // Create required employee first
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'Manager User',
        email: 'manager@test.com',
        hire_date: '2020-01-01',
        position: 'Manager',
        department: 'HR',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create job request
    const jobRequest = await db.insert(jobRequestsTable)
      .values({
        title: 'Software Developer',
        department: 'IT',
        position: 'Developer',
        required_count: 1,
        job_description: 'Develop software',
        requirements: 'Programming skills',
        requested_by: employee[0].id,
        status: 'open'
      })
      .returning()
      .execute();

    // Create job application
    const application = await db.insert(jobApplicationsTable)
      .values({
        job_request_id: jobRequest[0].id,
        applicant_name: 'Bob Wilson',
        email: 'bob@test.com',
        phone: '5555555555',
        status: 'screening'
      })
      .returning()
      .execute();

    const updateInput: UpdateJobApplicationInput = {
      id: application[0].id,
      status: 'selected',
      notes: 'Top candidate, recommend for hiring'
    };

    const result = await updateJobApplication(updateInput);

    expect(result.id).toEqual(application[0].id);
    expect(result.status).toEqual('selected');
    expect(result.notes).toEqual('Top candidate, recommend for hiring');
  });

  it('should save updates to database', async () => {
    // Create required employee first
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'Manager User',
        email: 'manager@test.com',
        hire_date: '2020-01-01',
        position: 'Manager',
        department: 'HR',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create job request
    const jobRequest = await db.insert(jobRequestsTable)
      .values({
        title: 'Software Developer',
        department: 'IT',
        position: 'Developer',
        required_count: 1,
        job_description: 'Develop software',
        requirements: 'Programming skills',
        requested_by: employee[0].id,
        status: 'open'
      })
      .returning()
      .execute();

    // Create job application
    const application = await db.insert(jobApplicationsTable)
      .values({
        job_request_id: jobRequest[0].id,
        applicant_name: 'Alice Brown',
        email: 'alice@test.com',
        phone: '1111111111',
        status: 'applied'
      })
      .returning()
      .execute();

    const updateInput: UpdateJobApplicationInput = {
      id: application[0].id,
      status: 'rejected',
      notes: 'Does not meet minimum requirements'
    };

    await updateJobApplication(updateInput);

    // Verify changes were saved to database
    const savedApplication = await db.select()
      .from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.id, application[0].id))
      .execute();

    expect(savedApplication).toHaveLength(1);
    expect(savedApplication[0].status).toEqual('rejected');
    expect(savedApplication[0].notes).toEqual('Does not meet minimum requirements');
  });

  it('should throw error for non-existent job application', async () => {
    const updateInput: UpdateJobApplicationInput = {
      id: 999999,
      status: 'interview'
    };

    expect(updateJobApplication(updateInput)).rejects.toThrow(/not found/i);
  });
});
