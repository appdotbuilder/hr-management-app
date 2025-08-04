
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { overtimeRequestsTable, employeesTable } from '../db/schema';
import { type CreateOvertimeRequestInput } from '../schema';
import { createOvertimeRequest } from '../handlers/create_overtime_request';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateOvertimeRequestInput = {
  employee_id: 1,
  date: new Date('2024-01-15'),
  start_time: '18:00',
  end_time: '22:00',
  total_hours: 4.0,
  reason: 'Project deadline requirements',
  status: 'pending',
  notes: 'Critical project milestone'
};

describe('createOvertimeRequest', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create prerequisite employee
    await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '555-0123',
        address: '123 Main St',
        birth_date: '1990-01-01', // Use string format for date
        hire_date: '2023-01-01', // Use string format for date
        position: 'Software Developer',
        department: 'IT',
        salary: '75000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .execute();
  });

  afterEach(resetDB);

  it('should create an overtime request', async () => {
    const result = await createOvertimeRequest(testInput);

    // Basic field validation
    expect(result.employee_id).toEqual(1);
    expect(result.date).toEqual(new Date('2024-01-15'));
    expect(result.start_time).toEqual('18:00');
    expect(result.end_time).toEqual('22:00');
    expect(result.total_hours).toEqual(4.0);
    expect(typeof result.total_hours).toBe('number');
    expect(result.reason).toEqual('Project deadline requirements');
    expect(result.approved_by).toBeNull();
    expect(result.approved_at).toBeNull();
    expect(result.status).toEqual('pending');
    expect(result.notes).toEqual('Critical project milestone');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save overtime request to database', async () => {
    const result = await createOvertimeRequest(testInput);

    // Query using proper drizzle syntax
    const requests = await db.select()
      .from(overtimeRequestsTable)
      .where(eq(overtimeRequestsTable.id, result.id))
      .execute();

    expect(requests).toHaveLength(1);
    expect(requests[0].employee_id).toEqual(1);
    expect(requests[0].date).toEqual('2024-01-15'); // Date stored as string in DB
    expect(requests[0].start_time).toEqual('18:00');
    expect(requests[0].end_time).toEqual('22:00');
    expect(parseFloat(requests[0].total_hours)).toEqual(4.0);
    expect(requests[0].reason).toEqual('Project deadline requirements');
    expect(requests[0].status).toEqual('pending');
    expect(requests[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle overtime request with default status', async () => {
    const inputWithDefaults: CreateOvertimeRequestInput = {
      employee_id: 1,
      date: new Date('2024-01-20'),
      start_time: '17:30',
      end_time: '20:30',
      total_hours: 3.0,
      reason: 'Emergency maintenance',
      status: 'pending', // Zod default applied
      notes: null
    };

    const result = await createOvertimeRequest(inputWithDefaults);

    expect(result.status).toEqual('pending');
    expect(result.notes).toBeNull();
    expect(result.total_hours).toEqual(3.0);
    expect(typeof result.total_hours).toBe('number');
  });

  it('should handle fractional hours correctly', async () => {
    const fractionalInput: CreateOvertimeRequestInput = {
      employee_id: 1,
      date: new Date('2024-01-25'),
      start_time: '19:00',
      end_time: '21:30',
      total_hours: 2.5,
      reason: 'System deployment',
      status: 'pending',
      notes: 'Partial overtime hours'
    };

    const result = await createOvertimeRequest(fractionalInput);

    expect(result.total_hours).toEqual(2.5);
    expect(typeof result.total_hours).toBe('number');

    // Verify in database
    const requests = await db.select()
      .from(overtimeRequestsTable)
      .where(eq(overtimeRequestsTable.id, result.id))
      .execute();

    expect(parseFloat(requests[0].total_hours)).toEqual(2.5);
  });
});
