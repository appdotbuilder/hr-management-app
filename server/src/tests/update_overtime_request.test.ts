
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable, overtimeRequestsTable } from '../db/schema';
import { type UpdateOvertimeRequestInput } from '../schema';
import { updateOvertimeRequest } from '../handlers/update_overtime_request';
import { eq } from 'drizzle-orm';

// Test employee data - convert Date fields to strings for database insertion
const testEmployee = {
  employee_id: 'EMP001',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  birth_date: '1990-01-01', // String format for database
  hire_date: '2023-01-01', // String format for database
  position: 'Software Engineer',
  department: 'IT',
  salary: '75000.00', // String format for numeric column
  status: 'active' as const,
  contract_type: 'permanent' as const,
  manager_id: null
};

const testApprover = {
  employee_id: 'MGR001',
  full_name: 'Jane Manager',
  email: 'jane.manager@example.com',
  phone: '+1234567891',
  address: '456 Admin Ave',
  birth_date: '1985-01-01', // String format for database
  hire_date: '2020-01-01', // String format for database
  position: 'Engineering Manager',
  department: 'IT',
  salary: '95000.00', // String format for numeric column
  status: 'active' as const,
  contract_type: 'permanent' as const,
  manager_id: null
};

// Test overtime request data - convert Date and numeric fields for database insertion
const testOvertimeRequest = {
  employee_id: 0, // Will be set after employee creation
  date: '2024-01-15', // String format for date column
  start_time: '18:00',
  end_time: '22:00',
  total_hours: '4.00', // String format for numeric column
  reason: 'Project deadline',
  status: 'pending' as const,
  notes: 'Initial request'
};

describe('updateOvertimeRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update overtime request status', async () => {
    // Create test employee
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    const employee = employeeResult[0];

    // Create overtime request
    const overtimeResult = await db.insert(overtimeRequestsTable)
      .values({
        ...testOvertimeRequest,
        employee_id: employee.id
      })
      .returning()
      .execute();
    const overtimeRequest = overtimeResult[0];

    // Update status
    const updateInput: UpdateOvertimeRequestInput = {
      id: overtimeRequest.id,
      status: 'approved'
    };

    const result = await updateOvertimeRequest(updateInput);

    expect(result.id).toEqual(overtimeRequest.id);
    expect(result.status).toEqual('approved');
    expect(result.employee_id).toEqual(employee.id);
    expect(result.total_hours).toEqual(4.0);
    expect(typeof result.total_hours).toBe('number');
    expect(result.date).toBeInstanceOf(Date);
  });

  it('should update overtime request with approver', async () => {
    // Create test employee and approver
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    const employee = employeeResult[0];

    const approverResult = await db.insert(employeesTable)
      .values(testApprover)
      .returning()
      .execute();
    const approver = approverResult[0];

    // Create overtime request
    const overtimeResult = await db.insert(overtimeRequestsTable)
      .values({
        ...testOvertimeRequest,
        employee_id: employee.id
      })
      .returning()
      .execute();
    const overtimeRequest = overtimeResult[0];

    // Update with approver
    const updateInput: UpdateOvertimeRequestInput = {
      id: overtimeRequest.id,
      approved_by: approver.id,
      status: 'approved'
    };

    const result = await updateOvertimeRequest(updateInput);

    expect(result.id).toEqual(overtimeRequest.id);
    expect(result.approved_by).toEqual(approver.id);
    expect(result.approved_at).toBeInstanceOf(Date);
    expect(result.status).toEqual('approved');
    expect(result.total_hours).toEqual(4.0);
    expect(result.date).toBeInstanceOf(Date);
  });

  it('should update overtime request notes', async () => {
    // Create test employee
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    const employee = employeeResult[0];

    // Create overtime request
    const overtimeResult = await db.insert(overtimeRequestsTable)
      .values({
        ...testOvertimeRequest,
        employee_id: employee.id
      })
      .returning()
      .execute();
    const overtimeRequest = overtimeResult[0];

    // Update notes
    const updateInput: UpdateOvertimeRequestInput = {
      id: overtimeRequest.id,
      notes: 'Updated notes for overtime request'
    };

    const result = await updateOvertimeRequest(updateInput);

    expect(result.id).toEqual(overtimeRequest.id);
    expect(result.notes).toEqual('Updated notes for overtime request');
    expect(result.status).toEqual('pending'); // Should remain unchanged
    expect(result.total_hours).toEqual(4.0);
    expect(result.date).toBeInstanceOf(Date);
  });

  it('should save updates to database', async () => {
    // Create test employee and approver
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    const employee = employeeResult[0];

    const approverResult = await db.insert(employeesTable)
      .values(testApprover)
      .returning()
      .execute();
    const approver = approverResult[0];

    // Create overtime request
    const overtimeResult = await db.insert(overtimeRequestsTable)
      .values({
        ...testOvertimeRequest,
        employee_id: employee.id
      })
      .returning()
      .execute();
    const overtimeRequest = overtimeResult[0];

    // Update overtime request
    const updateInput: UpdateOvertimeRequestInput = {
      id: overtimeRequest.id,
      approved_by: approver.id,
      status: 'approved',
      notes: 'Approved for urgent project'
    };

    await updateOvertimeRequest(updateInput);

    // Verify database was updated
    const updatedRequests = await db.select()
      .from(overtimeRequestsTable)
      .where(eq(overtimeRequestsTable.id, overtimeRequest.id))
      .execute();

    expect(updatedRequests).toHaveLength(1);
    const updated = updatedRequests[0];
    expect(updated.approved_by).toEqual(approver.id);
    expect(updated.approved_at).toBeInstanceOf(Date);
    expect(updated.status).toEqual('approved');
    expect(updated.notes).toEqual('Approved for urgent project');
    expect(parseFloat(updated.total_hours)).toEqual(4.0);
    expect(new Date(updated.date)).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent overtime request', async () => {
    const updateInput: UpdateOvertimeRequestInput = {
      id: 999,
      status: 'approved'
    };

    expect(updateOvertimeRequest(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update multiple fields at once', async () => {
    // Create test employee and approver
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    const employee = employeeResult[0];

    const approverResult = await db.insert(employeesTable)
      .values(testApprover)
      .returning()
      .execute();
    const approver = approverResult[0];

    // Create overtime request
    const overtimeResult = await db.insert(overtimeRequestsTable)
      .values({
        ...testOvertimeRequest,
        employee_id: employee.id
      })
      .returning()
      .execute();
    const overtimeRequest = overtimeResult[0];

    // Update multiple fields
    const updateInput: UpdateOvertimeRequestInput = {
      id: overtimeRequest.id,
      approved_by: approver.id,
      status: 'rejected',
      notes: 'Not enough justification provided'
    };

    const result = await updateOvertimeRequest(updateInput);

    expect(result.id).toEqual(overtimeRequest.id);
    expect(result.approved_by).toEqual(approver.id);
    expect(result.approved_at).toBeInstanceOf(Date);
    expect(result.status).toEqual('rejected');
    expect(result.notes).toEqual('Not enough justification provided');
    expect(result.total_hours).toEqual(4.0);
    expect(result.date).toBeInstanceOf(Date);
  });
});
