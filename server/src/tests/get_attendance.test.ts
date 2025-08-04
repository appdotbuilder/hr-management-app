
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable, attendanceTable } from '../db/schema';
import { type CreateEmployeeInput, type CreateAttendanceInput } from '../schema';
import { getAttendance } from '../handlers/get_attendance';

// Test employee data
const testEmployee: CreateEmployeeInput = {
  employee_id: 'EMP001',
  full_name: 'John Doe',
  email: 'john.doe@company.com',
  phone: '+1234567890',
  address: '123 Main St',
  birth_date: new Date('1990-01-01'),
  hire_date: new Date('2023-01-01'),
  position: 'Software Engineer',
  department: 'IT',
  salary: 75000,
  status: 'active',
  contract_type: 'permanent',
  manager_id: null
};

// Test attendance data
const testAttendance: CreateAttendanceInput = {
  employee_id: 1,
  date: new Date('2024-01-15'),
  check_in: '09:00',
  check_out: '17:30',
  break_start: '12:00',
  break_end: '13:00',
  total_hours: 7.5,
  status: 'present',
  notes: 'Regular workday'
};

describe('getAttendance', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no attendance records exist', async () => {
    const result = await getAttendance();
    
    expect(result).toEqual([]);
  });

  it('should return all attendance records', async () => {
    // Create employee first
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

    // Create attendance records
    await db.insert(attendanceTable)
      .values([
        {
          employee_id: employeeId,
          date: testAttendance.date.toISOString().split('T')[0],
          check_in: testAttendance.check_in,
          check_out: testAttendance.check_out,
          break_start: testAttendance.break_start,
          break_end: testAttendance.break_end,
          total_hours: testAttendance.total_hours?.toString(),
          status: testAttendance.status,
          notes: testAttendance.notes
        },
        {
          employee_id: employeeId,
          date: '2024-01-16',
          check_in: '09:15',
          check_out: '17:15',
          break_start: null,
          break_end: null,
          total_hours: '8.0',
          status: 'late',
          notes: 'Late arrival'
        }
      ])
      .execute();

    const result = await getAttendance();

    expect(result).toHaveLength(2);
    
    // Check first record
    expect(result[0].employee_id).toEqual(employeeId);
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].check_in).toEqual('09:00');
    expect(result[0].check_out).toEqual('17:30');
    expect(result[0].total_hours).toEqual(7.5);
    expect(typeof result[0].total_hours).toBe('number');
    expect(result[0].status).toEqual('present');
    expect(result[0].notes).toEqual('Regular workday');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Check second record
    expect(result[1].employee_id).toEqual(employeeId);
    expect(result[1].check_in).toEqual('09:15');
    expect(result[1].status).toEqual('late');
    expect(result[1].total_hours).toEqual(8.0);
    expect(typeof result[1].total_hours).toBe('number');
  });

  it('should handle null total_hours correctly', async () => {
    // Create employee first
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

    // Create attendance record with null total_hours
    await db.insert(attendanceTable)
      .values({
        employee_id: employeeId,
        date: '2024-01-17',
        check_in: null,
        check_out: null,
        break_start: null,
        break_end: null,
        total_hours: null,
        status: 'absent',
        notes: 'Sick day'
      })
      .execute();

    const result = await getAttendance();

    expect(result).toHaveLength(1);
    expect(result[0].total_hours).toBeNull();
    expect(result[0].status).toEqual('absent');
    expect(result[0].check_in).toBeNull();
    expect(result[0].check_out).toBeNull();
  });

  it('should return records with different attendance statuses', async () => {
    // Create employee first
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

    // Create attendance records with different statuses
    await db.insert(attendanceTable)
      .values([
        {
          employee_id: employeeId,
          date: '2024-01-18',
          check_in: '09:00',
          check_out: '13:00',
          break_start: null,
          break_end: null,
          total_hours: '4.0',
          status: 'half_day',
          notes: null
        },
        {
          employee_id: employeeId,
          date: '2024-01-19',
          check_in: null,
          check_out: null,
          break_start: null,
          break_end: null,
          total_hours: null,
          status: 'sick_leave',
          notes: 'Medical appointment'
        }
      ])
      .execute();

    const result = await getAttendance();

    expect(result).toHaveLength(2);
    
    const halfDayRecord = result.find(r => r.status === 'half_day');
    expect(halfDayRecord).toBeDefined();
    expect(halfDayRecord!.total_hours).toEqual(4.0);
    
    const sickLeaveRecord = result.find(r => r.status === 'sick_leave');
    expect(sickLeaveRecord).toBeDefined();
    expect(sickLeaveRecord!.total_hours).toBeNull();
    expect(sickLeaveRecord!.notes).toEqual('Medical appointment');
  });
});
