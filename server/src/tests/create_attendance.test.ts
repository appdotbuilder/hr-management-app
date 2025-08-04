
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { attendanceTable, employeesTable } from '../db/schema';
import { type CreateAttendanceInput } from '../schema';
import { createAttendance } from '../handlers/create_attendance';
import { eq } from 'drizzle-orm';

// Test employee data
const testEmployee = {
  employee_id: 'EMP001',
  full_name: 'John Doe',
  email: 'john.doe@company.com',
  hire_date: '2023-01-01', // Use string format for date column
  position: 'Software Developer',
  department: 'IT',
  status: 'active' as const,
  contract_type: 'permanent' as const
};

// Test attendance input
const testInput: CreateAttendanceInput = {
  employee_id: 1, // Will be set after creating employee
  date: new Date('2024-01-15'),
  check_in: '09:00',
  check_out: '17:30',
  break_start: '12:00',
  break_end: '13:00',
  total_hours: 7.5,
  status: 'present',
  notes: 'Regular working day'
};

describe('createAttendance', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create attendance record', async () => {
    // Create prerequisite employee
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    
    const employee = employeeResult[0];
    testInput.employee_id = employee.id;

    const result = await createAttendance(testInput);

    // Basic field validation
    expect(result.employee_id).toEqual(employee.id);
    expect(result.date).toEqual(new Date('2024-01-15'));
    expect(result.check_in).toEqual('09:00');
    expect(result.check_out).toEqual('17:30');
    expect(result.break_start).toEqual('12:00');
    expect(result.break_end).toEqual('13:00');
    expect(result.total_hours).toEqual(7.5);
    expect(typeof result.total_hours).toBe('number');
    expect(result.status).toEqual('present');
    expect(result.notes).toEqual('Regular working day');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save attendance to database', async () => {
    // Create prerequisite employee
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    
    const employee = employeeResult[0];
    testInput.employee_id = employee.id;

    const result = await createAttendance(testInput);

    // Query database to verify record was saved
    const attendance = await db.select()
      .from(attendanceTable)
      .where(eq(attendanceTable.id, result.id))
      .execute();

    expect(attendance).toHaveLength(1);
    expect(attendance[0].employee_id).toEqual(employee.id);
    expect(attendance[0].date).toEqual('2024-01-15'); // Database stores as string
    expect(attendance[0].check_in).toEqual('09:00');
    expect(attendance[0].check_out).toEqual('17:30');
    expect(attendance[0].status).toEqual('present');
    expect(parseFloat(attendance[0].total_hours!)).toEqual(7.5);
    expect(attendance[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    // Create prerequisite employee
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    
    const employee = employeeResult[0];

    const minimalInput: CreateAttendanceInput = {
      employee_id: employee.id,
      date: new Date('2024-01-16'),
      check_in: null,
      check_out: null,
      break_start: null,
      break_end: null,
      total_hours: null,
      status: 'absent',
      notes: null
    };

    const result = await createAttendance(minimalInput);

    expect(result.check_in).toBeNull();
    expect(result.check_out).toBeNull();
    expect(result.break_start).toBeNull();
    expect(result.break_end).toBeNull();
    expect(result.total_hours).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.status).toEqual('absent');
  });

  it('should throw error for non-existent employee', async () => {
    const invalidInput: CreateAttendanceInput = {
      employee_id: 999, // Non-existent employee
      date: new Date('2024-01-15'),
      check_in: '09:00',
      check_out: '17:30',
      break_start: null,
      break_end: null,
      total_hours: 8.0,
      status: 'present',
      notes: null
    };

    await expect(createAttendance(invalidInput)).rejects.toThrow(/Employee with id 999 not found/i);
  });

  it('should handle different attendance statuses', async () => {
    // Create prerequisite employee
    const employeeResult = await db.insert(employeesTable)
      .values(testEmployee)
      .returning()
      .execute();
    
    const employee = employeeResult[0];

    const sickLeaveInput: CreateAttendanceInput = {
      employee_id: employee.id,
      date: new Date('2024-01-17'),
      check_in: null,
      check_out: null,
      break_start: null,
      break_end: null,
      total_hours: null,
      status: 'sick_leave',
      notes: 'Medical appointment'
    };

    const result = await createAttendance(sickLeaveInput);

    expect(result.status).toEqual('sick_leave');
    expect(result.notes).toEqual('Medical appointment');
    expect(result.total_hours).toBeNull();
  });
});
