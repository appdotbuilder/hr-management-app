
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { leaveRequestsTable, employeesTable } from '../db/schema';
import { type CreateLeaveRequestInput } from '../schema';
import { createLeaveRequest } from '../handlers/create_leave_request';
import { eq } from 'drizzle-orm';

describe('createLeaveRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testEmployeeId: number;

  beforeEach(async () => {
    // Create test employee
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        hire_date: '2023-01-01', // Use string format for date fields
        position: 'Developer',
        department: 'IT',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();
    
    testEmployeeId = employee[0].id;
  });

  const testInput: CreateLeaveRequestInput = {
    employee_id: 0, // Will be set in test
    leave_type: 'annual',
    start_date: new Date('2024-02-01'),
    end_date: new Date('2024-02-05'),
    total_days: 5,
    reason: 'Vacation with family',
    status: 'pending',
    notes: 'Will be available by phone for emergencies'
  };

  it('should create a leave request', async () => {
    const input = { ...testInput, employee_id: testEmployeeId };
    const result = await createLeaveRequest(input);

    // Basic field validation
    expect(result.employee_id).toEqual(testEmployeeId);
    expect(result.leave_type).toEqual('annual');
    expect(result.start_date).toEqual(new Date('2024-02-01'));
    expect(result.end_date).toEqual(new Date('2024-02-05'));
    expect(result.total_days).toEqual(5);
    expect(result.reason).toEqual('Vacation with family');
    expect(result.status).toEqual('pending');
    expect(result.notes).toEqual('Will be available by phone for emergencies');
    expect(result.approved_by).toBeNull();
    expect(result.approved_at).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save leave request to database', async () => {
    const input = { ...testInput, employee_id: testEmployeeId };
    const result = await createLeaveRequest(input);

    const leaveRequests = await db.select()
      .from(leaveRequestsTable)
      .where(eq(leaveRequestsTable.id, result.id))
      .execute();

    expect(leaveRequests).toHaveLength(1);
    expect(leaveRequests[0].employee_id).toEqual(testEmployeeId);
    expect(leaveRequests[0].leave_type).toEqual('annual');
    expect(new Date(leaveRequests[0].start_date)).toEqual(new Date('2024-02-01'));
    expect(new Date(leaveRequests[0].end_date)).toEqual(new Date('2024-02-05'));
    expect(leaveRequests[0].total_days).toEqual(5);
    expect(leaveRequests[0].reason).toEqual('Vacation with family');
    expect(leaveRequests[0].status).toEqual('pending');
    expect(leaveRequests[0].notes).toEqual('Will be available by phone for emergencies');
    expect(leaveRequests[0].created_at).toBeInstanceOf(Date);
  });

  it('should create leave request with different leave types', async () => {
    const sickLeaveInput = {
      ...testInput,
      employee_id: testEmployeeId,
      leave_type: 'sick' as const,
      total_days: 3,
      reason: 'Medical treatment',
      notes: null
    };

    const result = await createLeaveRequest(sickLeaveInput);

    expect(result.leave_type).toEqual('sick');
    expect(result.total_days).toEqual(3);
    expect(result.reason).toEqual('Medical treatment');
    expect(result.notes).toBeNull();
  });

  it('should create leave request with null notes', async () => {
    const input = {
      ...testInput,
      employee_id: testEmployeeId,
      notes: null
    };

    const result = await createLeaveRequest(input);

    expect(result.notes).toBeNull();
  });

  it('should reject leave request for non-existent employee', async () => {
    const input = { ...testInput, employee_id: 99999 };

    await expect(createLeaveRequest(input)).rejects.toThrow(/Employee with id 99999 not found/i);
  });
});
