
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobApplicationsTable, jobRequestsTable, employeesTable } from '../db/schema';
import { type CreateJobApplicationInput } from '../schema';
import { getJobApplications } from '../handlers/get_job_applications';

describe('getJobApplications', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no applications exist', async () => {
    const result = await getJobApplications();
    expect(result).toEqual([]);
  });

  it('should return all job applications', async () => {
    // Create prerequisite employee
    const [employee] = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Manager',
        email: 'john@company.com',
        hire_date: '2023-01-01', // Use string for date column
        position: 'Manager',
        department: 'HR',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create prerequisite job request
    const [jobRequest] = await db.insert(jobRequestsTable)
      .values({
        title: 'Software Developer',
        department: 'IT',
        position: 'Developer',
        required_count: 2,
        job_description: 'Develop software applications',
        requirements: 'Bachelor degree in CS',
        requested_by: employee.id,
        status: 'open'
      })
      .returning()
      .execute();

    // Create test job applications
    const testApplications = [
      {
        job_request_id: jobRequest.id,
        applicant_name: 'Alice Smith',
        email: 'alice@email.com',
        phone: '123-456-7890',
        resume_url: 'https://example.com/alice-resume.pdf',
        cover_letter: 'I am interested in this position',
        status: 'applied' as const,
        notes: 'Strong candidate'
      },
      {
        job_request_id: jobRequest.id,
        applicant_name: 'Bob Johnson',
        email: 'bob@email.com',
        phone: '098-765-4321',
        resume_url: null,
        cover_letter: null,
        status: 'screening' as const,
        notes: null
      }
    ];

    await db.insert(jobApplicationsTable)
      .values(testApplications)
      .execute();

    const result = await getJobApplications();

    expect(result).toHaveLength(2);
    
    // Check first application
    const aliceApp = result.find(app => app.applicant_name === 'Alice Smith');
    expect(aliceApp).toBeDefined();
    expect(aliceApp!.job_request_id).toEqual(jobRequest.id);
    expect(aliceApp!.email).toEqual('alice@email.com');
    expect(aliceApp!.phone).toEqual('123-456-7890');
    expect(aliceApp!.resume_url).toEqual('https://example.com/alice-resume.pdf');
    expect(aliceApp!.cover_letter).toEqual('I am interested in this position');
    expect(aliceApp!.status).toEqual('applied');
    expect(aliceApp!.notes).toEqual('Strong candidate');
    expect(aliceApp!.id).toBeDefined();
    expect(aliceApp!.application_date).toBeInstanceOf(Date);
    expect(aliceApp!.created_at).toBeInstanceOf(Date);

    // Check second application
    const bobApp = result.find(app => app.applicant_name === 'Bob Johnson');
    expect(bobApp).toBeDefined();
    expect(bobApp!.job_request_id).toEqual(jobRequest.id);
    expect(bobApp!.email).toEqual('bob@email.com');
    expect(bobApp!.phone).toEqual('098-765-4321');
    expect(bobApp!.resume_url).toBeNull();
    expect(bobApp!.cover_letter).toBeNull();
    expect(bobApp!.status).toEqual('screening');
    expect(bobApp!.notes).toBeNull();
    expect(bobApp!.id).toBeDefined();
    expect(bobApp!.application_date).toBeInstanceOf(Date);
    expect(bobApp!.created_at).toBeInstanceOf(Date);
  });

  it('should return applications with correct date handling', async () => {
    // Create prerequisite employee
    const [employee] = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Manager',
        email: 'john@company.com',
        hire_date: '2023-01-01', // Use string for date column
        position: 'Manager',
        department: 'HR',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create prerequisite job request
    const [jobRequest] = await db.insert(jobRequestsTable)
      .values({
        title: 'Software Developer',
        department: 'IT',
        position: 'Developer',
        required_count: 1,
        job_description: 'Develop software applications',
        requirements: 'Bachelor degree in CS',
        requested_by: employee.id,
        status: 'open'
      })
      .returning()
      .execute();

    // Create application with specific date
    const specificDate = new Date('2024-01-15T10:30:00Z');
    await db.insert(jobApplicationsTable)
      .values({
        job_request_id: jobRequest.id,
        applicant_name: 'Test Applicant',
        email: 'test@email.com',
        phone: '555-0123',
        resume_url: null,
        cover_letter: null,
        application_date: specificDate, // timestamp columns accept Date objects
        status: 'applied',
        notes: null
      })
      .execute();

    const result = await getJobApplications();

    expect(result).toHaveLength(1);
    expect(result[0].application_date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
    
    // Verify date values are preserved correctly
    expect(result[0].application_date.getTime()).toEqual(specificDate.getTime());
  });
});
