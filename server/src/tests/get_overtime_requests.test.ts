
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { overtimeRequestsTable, employeesTable } from '../db/schema';
import { type CreateOvertimeRequestInput } from '../schema';
import { getOvertimeRequests } from '../handlers/get_overtime_requests';

// Test employee data
const testEmployee = {
  employee_id: 'EMP001',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  address: '123 Main St',
  birth_date: '1990-01-01', // Use string for date column
  hire_date: '2020-01-01', // Use string for date column
  position: 'Developer',
  department: 'IT',
  salary: '50000.00', // Use string for numeric column
  status: 'active' as const,
  contract_type: 'permanent' as const,
  manager_id: null
};

// Test overtime request data
const testOvertimeRequest: CreateOvertimeRequestInput = {
  employee_id: 1, // Will be set after creating employee
  date: new Date('2024-01-15'),
  start_time: '17:00',
  end_time: '20:00',
  total_hours: 3.0,
  reason: 'Project deadline',
  status: 'pending',
  notes: 'Working on critical feature'
};

describe('getOvertimeRequests', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no overtime requests exist', async () => {
    const result = await getOvertimeRequests();

    expect(result).toEqual([]);
  });

  it('should return all overtime requests', async () => {
    // Create test employee first
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    
    const employeeId = employeeResult[0].id;

    // Create test overtime requests
    await db.insert(overtimeRequestsTable)
      .values([
        {
          employee_id: employeeId,
          date: '2024-01-15', // Use string for date column
          start_time: '17:00',
          end_time: '20:00',
          total_hours: '3.0', // Use string for numeric column
          reason: 'Project deadline',
          status: 'pending',
          notes: 'Working on critical feature'
        },
        {
          employee_id: employeeId,
          date: '2024-01-16', // Use string for date column
          start_time: '18:00',
          end_time: '21:00',
          total_hours: '3.5', // Use string for numeric column
          reason: 'Emergency fix',
          status: 'approved',
          notes: null
        }
      ])
      .execute();

    const result = await getOvertimeRequests();

    expect(result).toHaveLength(2);
    
    // Verify first request
    expect(result[0].employee_id).toEqual(employeeId);
    expect(result[0].start_time).toEqual('17:00');
    expect(result[0].end_time).toEqual('20:00');
    expect(result[0].total_hours).toEqual(3.0);
    expect(typeof result[0].total_hours).toBe('number');
    expect(result[0].reason).toEqual('Project deadline');
    expect(result[0].status).toEqual('pending');
    expect(result[0].notes).toEqual('Working on critical feature');
    expect(result[0].id).toBeDefined();
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify second request
    expect(result[1].employee_id).toEqual(employeeId);
    expect(result[1].total_hours).toEqual(3.5);
    expect(typeof result[1].total_hours).toBe('number');
    expect(result[1].reason).toEqual('Emergency fix');
    expect(result[1].status).toEqual('approved');
    expect(result[1].date).toBeInstanceOf(Date);
  });

  it('should handle overtime requests with different statuses', async () => {
    // Create test employee
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    
    const employeeId = employeeResult[0].id;

    // Create overtime requests with different statuses
    await db.insert(overtimeRequestsTable)
      .values([
        {
          employee_id: employeeId,
          date: '2024-01-15',
          start_time: '17:00',
          end_time: '20:00',
          total_hours: '3.0',
          reason: 'Project deadline',
          status: 'pending',
          notes: null
        },
        {
          employee_id: employeeId,
          date: '2024-01-17',
          start_time: '17:00',
          end_time: '21:00',
          total_hours: '4.0',
          reason: 'System maintenance',
          status: 'approved',
          notes: null
        },
        {
          employee_id: employeeId,
          date: '2024-01-18',
          start_time: '19:00',
          end_time: '21:30',
          total_hours: '2.5',
          reason: 'Bug fixing',
          status: 'rejected',
          notes: null
        },
        {
          employee_id: employeeId,
          date: '2024-01-19',
          start_time: '16:00',
          end_time: '21:00',
          total_hours: '5.0',
          reason: 'Product launch',
          status: 'completed',
          notes: null
        }
      ])
      .execute();

    const result = await getOvertimeRequests();

    expect(result).toHaveLength(4);
    
    const statuses = result.map(r => r.status);
    expect(statuses).toContain('pending');
    expect(statuses).toContain('approved');
    expect(statuses).toContain('rejected');
    expect(statuses).toContain('completed');
    
    // Verify all dates are properly converted
    result.forEach(request => {
      expect(request.date).toBeInstanceOf(Date);
      expect(typeof request.total_hours).toBe('number');
    });
  });
});
