
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable, leaveRequestsTable } from '../db/schema';
import { type CreateEmployeeInput, type CreateLeaveRequestInput } from '../schema';
import { getLeaveRequests } from '../handlers/get_leave_requests';

// Test employee data
const testEmployee: CreateEmployeeInput = {
  employee_id: 'EMP001',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  address: '123 Main St',
  birth_date: new Date('1990-01-01'),
  hire_date: new Date('2023-01-01'),
  position: 'Software Engineer',
  department: 'Engineering',
  salary: 75000,
  status: 'active',
  contract_type: 'permanent',
  manager_id: null
};

// Test leave request data
const testLeaveRequest: CreateLeaveRequestInput = {
  employee_id: 1, // Will be set after employee creation
  leave_type: 'annual',
  start_date: new Date('2024-03-01'),
  end_date: new Date('2024-03-03'),
  total_days: 3,
  reason: 'Family vacation',
  status: 'pending',
  notes: 'Planned family trip'
};

describe('getLeaveRequests', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no leave requests exist', async () => {
    const result = await getLeaveRequests();
    expect(result).toEqual([]);
  });

  it('should return all leave requests', async () => {
    // Create prerequisite employee
    const employeeResult = await db.insert(employeesTable)
      .values({
        employee_id: testEmployee.employee_id,
        full_name: testEmployee.full_name,
        email: testEmployee.email,
        phone: testEmployee.phone,
        address: testEmployee.address,
        birth_date: testEmployee.birth_date?.toISOString().split('T')[0],
        hire_date: testEmployee.hire_date.toISOString().split('T')[0],
        position: testEmployee.position,
        department: testEmployee.department,
        salary: testEmployee.salary?.toString(),
        status: testEmployee.status,
        contract_type: testEmployee.contract_type,
        manager_id: testEmployee.manager_id
      })
      .returning()
      .execute();

    const employeeId = employeeResult[0].id;

    // Create test leave request
    await db.insert(leaveRequestsTable)
      .values({
        employee_id: employeeId,
        leave_type: testLeaveRequest.leave_type,
        start_date: testLeaveRequest.start_date.toISOString().split('T')[0],
        end_date: testLeaveRequest.end_date.toISOString().split('T')[0],
        total_days: testLeaveRequest.total_days,
        reason: testLeaveRequest.reason,
        approved_by: null,
        approved_at: null,
        status: testLeaveRequest.status,
        notes: testLeaveRequest.notes
      })
      .execute();

    const result = await getLeaveRequests();

    expect(result).toHaveLength(1);
    expect(result[0].employee_id).toEqual(employeeId);
    expect(result[0].leave_type).toEqual('annual');
    expect(result[0].start_date).toBeInstanceOf(Date);
    expect(result[0].end_date).toBeInstanceOf(Date);
    expect(result[0].total_days).toEqual(3);
    expect(result[0].reason).toEqual('Family vacation');
    expect(result[0].status).toEqual('pending');
    expect(result[0].notes).toEqual('Planned family trip');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return multiple leave requests', async () => {
    // Create prerequisite employee
    const employeeResult = await db.insert(employeesTable)
      .values({
        employee_id: testEmployee.employee_id,
        full_name: testEmployee.full_name,
        email: testEmployee.email,
        phone: testEmployee.phone,
        address: testEmployee.address,
        birth_date: testEmployee.birth_date?.toISOString().split('T')[0],
        hire_date: testEmployee.hire_date.toISOString().split('T')[0],
        position: testEmployee.position,
        department: testEmployee.department,
        salary: testEmployee.salary?.toString(),
        status: testEmployee.status,
        contract_type: testEmployee.contract_type,
        manager_id: testEmployee.manager_id
      })
      .returning()
      .execute();

    const employeeId = employeeResult[0].id;

    // Create multiple leave requests
    await db.insert(leaveRequestsTable)
      .values([
        {
          employee_id: employeeId,
          leave_type: 'annual',
          start_date: '2024-03-01',
          end_date: '2024-03-03',
          total_days: 3,
          reason: 'Family vacation',
          approved_by: null,
          approved_at: null,
          status: 'pending',
          notes: 'Planned family trip'
        },
        {
          employee_id: employeeId,
          leave_type: 'sick',
          start_date: '2024-04-01',
          end_date: '2024-04-01',
          total_days: 1,
          reason: 'Medical appointment',
          approved_by: null,
          approved_at: null,
          status: 'approved',
          notes: null
        }
      ])
      .execute();

    const result = await getLeaveRequests();

    expect(result).toHaveLength(2);
    
    // First leave request
    const annualLeave = result.find(lr => lr.leave_type === 'annual');
    expect(annualLeave).toBeDefined();
    expect(annualLeave!.employee_id).toEqual(employeeId);
    expect(annualLeave!.total_days).toEqual(3);
    expect(annualLeave!.status).toEqual('pending');

    // Second leave request
    const sickLeave = result.find(lr => lr.leave_type === 'sick');
    expect(sickLeave).toBeDefined();
    expect(sickLeave!.employee_id).toEqual(employeeId);
    expect(sickLeave!.total_days).toEqual(1);
    expect(sickLeave!.status).toEqual('approved');
  });

  it('should handle different leave types correctly', async () => {
    // Create prerequisite employee
    const employeeResult = await db.insert(employeesTable)
      .values({
        employee_id: testEmployee.employee_id,
        full_name: testEmployee.full_name,
        email: testEmployee.email,
        phone: testEmployee.phone,
        address: testEmployee.address,
        birth_date: testEmployee.birth_date?.toISOString().split('T')[0],
        hire_date: testEmployee.hire_date.toISOString().split('T')[0],
        position: testEmployee.position,
        department: testEmployee.department,
        salary: testEmployee.salary?.toString(),
        status: testEmployee.status,
        contract_type: testEmployee.contract_type,
        manager_id: testEmployee.manager_id
      })
      .returning()
      .execute();

    const employeeId = employeeResult[0].id;

    // Create leave requests with different types
    await db.insert(leaveRequestsTable)
      .values([
        {
          employee_id: employeeId,
          leave_type: 'emergency',
          start_date: '2024-05-01',
          end_date: '2024-05-01',
          total_days: 1,
          reason: 'Family emergency',
          approved_by: null,
          approved_at: null,
          status: 'approved',
          notes: null
        },
        {
          employee_id: employeeId,
          leave_type: 'maternity',
          start_date: '2024-06-01',
          end_date: '2024-09-01',
          total_days: 90,
          reason: 'Maternity leave',
          approved_by: null,
          approved_at: null,
          status: 'pending',
          notes: 'Expected delivery date'
        }
      ])
      .execute();

    const result = await getLeaveRequests();

    expect(result).toHaveLength(2);
    
    const leaveTypes = result.map(lr => lr.leave_type);
    expect(leaveTypes).toContain('emergency');
    expect(leaveTypes).toContain('maternity');
    
    const maternityLeave = result.find(lr => lr.leave_type === 'maternity');
    expect(maternityLeave!.total_days).toEqual(90);
  });
});
