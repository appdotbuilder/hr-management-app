
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable, leaveRequestsTable } from '../db/schema';
import { type UpdateLeaveRequestInput } from '../schema';
import { updateLeaveRequest } from '../handlers/update_leave_request';
import { eq } from 'drizzle-orm';

describe('updateLeaveRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update leave request status', async () => {
    // Create test employee
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john@example.com',
        hire_date: '2023-01-01',
        position: 'Developer',
        department: 'IT',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create test leave request
    const leaveRequest = await db.insert(leaveRequestsTable)
      .values({
        employee_id: employee[0].id,
        leave_type: 'annual',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
        total_days: 5,
        reason: 'Vacation',
        status: 'pending'
      })
      .returning()
      .execute();

    const updateInput: UpdateLeaveRequestInput = {
      id: leaveRequest[0].id,
      status: 'approved'
    };

    const result = await updateLeaveRequest(updateInput);

    expect(result.id).toEqual(leaveRequest[0].id);
    expect(result.status).toEqual('approved');
    expect(result.employee_id).toEqual(employee[0].id);
    expect(result.leave_type).toEqual('annual');
    expect(result.total_days).toEqual(5);
  });

  it('should update leave request with approver', async () => {
    // Create test employees
    const employees = await db.insert(employeesTable)
      .values([
        {
          employee_id: 'EMP001',
          full_name: 'John Doe',
          email: 'john@example.com',
          hire_date: '2023-01-01',
          position: 'Developer',
          department: 'IT',
          status: 'active',
          contract_type: 'permanent'
        },
        {
          employee_id: 'EMP002',
          full_name: 'Jane Smith',
          email: 'jane@example.com',
          hire_date: '2022-01-01',
          position: 'Manager',
          department: 'IT',
          status: 'active',
          contract_type: 'permanent'
        }
      ])
      .returning()
      .execute();

    // Create test leave request
    const leaveRequest = await db.insert(leaveRequestsTable)
      .values({
        employee_id: employees[0].id,
        leave_type: 'sick',
        start_date: '2024-02-01',
        end_date: '2024-02-02',
        total_days: 2,
        reason: 'Medical appointment',
        status: 'pending'
      })
      .returning()
      .execute();

    const updateInput: UpdateLeaveRequestInput = {
      id: leaveRequest[0].id,
      approved_by: employees[1].id,
      status: 'approved',
      notes: 'Approved by manager'
    };

    const result = await updateLeaveRequest(updateInput);

    expect(result.id).toEqual(leaveRequest[0].id);
    expect(result.status).toEqual('approved');
    expect(result.approved_by).toEqual(employees[1].id);
    expect(result.approved_at).toBeInstanceOf(Date);
    expect(result.notes).toEqual('Approved by manager');
  });

  it('should save updates to database', async () => {
    // Create test employee
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john@example.com',
        hire_date: '2023-01-01',
        position: 'Developer',
        department: 'IT',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create test leave request
    const leaveRequest = await db.insert(leaveRequestsTable)
      .values({
        employee_id: employee[0].id,
        leave_type: 'emergency',
        start_date: '2024-03-01',
        end_date: '2024-03-01',
        total_days: 1,
        reason: 'Emergency',
        status: 'pending'
      })
      .returning()
      .execute();

    const updateInput: UpdateLeaveRequestInput = {
      id: leaveRequest[0].id,
      status: 'rejected',
      notes: 'Insufficient documentation'
    };

    await updateLeaveRequest(updateInput);

    // Verify database was updated
    const updatedRequests = await db.select()
      .from(leaveRequestsTable)
      .where(eq(leaveRequestsTable.id, leaveRequest[0].id))
      .execute();

    expect(updatedRequests).toHaveLength(1);
    expect(updatedRequests[0].status).toEqual('rejected');
    expect(updatedRequests[0].notes).toEqual('Insufficient documentation');
    expect(updatedRequests[0].approved_by).toBeNull();
    expect(updatedRequests[0].approved_at).toBeNull();
  });

  it('should throw error for non-existent leave request', async () => {
    const updateInput: UpdateLeaveRequestInput = {
      id: 999,
      status: 'approved'
    };

    await expect(updateLeaveRequest(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should only update provided fields', async () => {
    // Create test employee
    const employee = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john@example.com',
        hire_date: '2023-01-01',
        position: 'Developer',
        department: 'IT',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    // Create test leave request
    const originalRequest = await db.insert(leaveRequestsTable)
      .values({
        employee_id: employee[0].id,
        leave_type: 'annual',
        start_date: '2024-04-01',
        end_date: '2024-04-03',
        total_days: 3,
        reason: 'Vacation',
        status: 'pending',
        notes: 'Original notes'
      })
      .returning()
      .execute();

    // Update only status
    const updateInput: UpdateLeaveRequestInput = {
      id: originalRequest[0].id,
      status: 'approved'
    };

    const result = await updateLeaveRequest(updateInput);

    // Status should be updated, notes should remain unchanged
    expect(result.status).toEqual('approved');
    expect(result.notes).toEqual('Original notes');
    expect(result.reason).toEqual('Vacation');
    expect(result.total_days).toEqual(3);
  });
});
