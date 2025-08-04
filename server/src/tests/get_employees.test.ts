
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type CreateEmployeeInput } from '../schema';
import { getEmployees } from '../handlers/get_employees';

// Test employee data
const testEmployee1: CreateEmployeeInput = {
  employee_id: 'EMP001',
  full_name: 'John Doe',
  email: 'john.doe@company.com',
  phone: '+1234567890',
  address: '123 Main Street',
  birth_date: new Date('1990-01-15'),
  hire_date: new Date('2023-01-01'),
  position: 'Software Engineer',
  department: 'Engineering',
  salary: 75000.50,
  status: 'active',
  contract_type: 'permanent',
  manager_id: null
};

const testEmployee2: CreateEmployeeInput = {
  employee_id: 'EMP002',
  full_name: 'Jane Smith',
  email: 'jane.smith@company.com',
  phone: null,
  address: null,
  birth_date: null,
  hire_date: new Date('2023-02-15'),
  position: 'Product Manager',
  department: 'Product',
  salary: null,
  status: 'active',
  contract_type: 'contract',
  manager_id: null
};

describe('getEmployees', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no employees exist', async () => {
    const result = await getEmployees();

    expect(result).toEqual([]);
  });

  it('should return all employees', async () => {
    // Create test employees - convert dates to strings and numbers to strings for database
    await db.insert(employeesTable)
      .values([
        {
          employee_id: testEmployee1.employee_id,
          full_name: testEmployee1.full_name,
          email: testEmployee1.email,
          phone: testEmployee1.phone,
          address: testEmployee1.address,
          birth_date: testEmployee1.birth_date?.toISOString().split('T')[0] || null,
          hire_date: testEmployee1.hire_date.toISOString().split('T')[0],
          position: testEmployee1.position,
          department: testEmployee1.department,
          salary: testEmployee1.salary?.toString() || null,
          status: testEmployee1.status,
          contract_type: testEmployee1.contract_type,
          manager_id: testEmployee1.manager_id
        },
        {
          employee_id: testEmployee2.employee_id,
          full_name: testEmployee2.full_name,
          email: testEmployee2.email,
          phone: testEmployee2.phone,
          address: testEmployee2.address,
          birth_date: testEmployee2.birth_date?.toISOString().split('T')[0] || null,
          hire_date: testEmployee2.hire_date.toISOString().split('T')[0],
          position: testEmployee2.position,
          department: testEmployee2.department,
          salary: testEmployee2.salary?.toString() || null,
          status: testEmployee2.status,
          contract_type: testEmployee2.contract_type,
          manager_id: testEmployee2.manager_id
        }
      ])
      .execute();

    const result = await getEmployees();

    expect(result).toHaveLength(2);

    // Verify first employee
    const employee1 = result.find(e => e.employee_id === 'EMP001');
    expect(employee1).toBeDefined();
    expect(employee1!.full_name).toEqual('John Doe');
    expect(employee1!.email).toEqual('john.doe@company.com');
    expect(employee1!.salary).toEqual(75000.50);
    expect(typeof employee1!.salary).toBe('number');
    expect(employee1!.status).toEqual('active');
    expect(employee1!.contract_type).toEqual('permanent');
    expect(employee1!.birth_date).toBeInstanceOf(Date);
    expect(employee1!.hire_date).toBeInstanceOf(Date);

    // Verify second employee
    const employee2 = result.find(e => e.employee_id === 'EMP002');
    expect(employee2).toBeDefined();
    expect(employee2!.full_name).toEqual('Jane Smith');
    expect(employee2!.email).toEqual('jane.smith@company.com');
    expect(employee2!.salary).toBeNull();
    expect(employee2!.phone).toBeNull();
    expect(employee2!.address).toBeNull();
    expect(employee2!.birth_date).toBeNull();
    expect(employee2!.status).toEqual('active');
    expect(employee2!.contract_type).toEqual('contract');
    expect(employee2!.hire_date).toBeInstanceOf(Date);
  });

  it('should handle different employee statuses and contract types', async () => {
    // Create employees with different statuses
    await db.insert(employeesTable)
      .values([
        {
          employee_id: 'EMP003',
          full_name: 'Active Employee',
          email: 'active@company.com',
          hire_date: '2023-01-01',
          position: 'Developer',
          department: 'IT',
          salary: '50000.00',
          status: 'active',
          contract_type: 'permanent',
          manager_id: null,
          phone: null,
          address: null,
          birth_date: null
        },
        {
          employee_id: 'EMP004',
          full_name: 'Inactive Employee',
          email: 'inactive@company.com',
          hire_date: '2022-01-01',
          position: 'Analyst',
          department: 'Finance',
          salary: '45000.00',
          status: 'inactive',
          contract_type: 'contract',
          manager_id: null,
          phone: null,
          address: null,
          birth_date: null
        },
        {
          employee_id: 'EMP005',
          full_name: 'Freelance Employee',
          email: 'freelance@company.com',
          hire_date: '2023-06-01',
          position: 'Designer',
          department: 'Design',
          salary: '60000.00',
          status: 'active',
          contract_type: 'daily_freelance',
          manager_id: null,
          phone: null,
          address: null,
          birth_date: null
        }
      ])
      .execute();

    const result = await getEmployees();

    expect(result).toHaveLength(3);

    // Verify all statuses are returned
    const statuses = result.map(e => e.status);
    expect(statuses).toContain('active');
    expect(statuses).toContain('inactive');

    // Verify all contract types are returned
    const contractTypes = result.map(e => e.contract_type);
    expect(contractTypes).toContain('permanent');
    expect(contractTypes).toContain('contract');
    expect(contractTypes).toContain('daily_freelance');

    // Verify numeric and date conversions
    result.forEach(employee => {
      if (employee.salary !== null) {
        expect(typeof employee.salary).toBe('number');
      }
      expect(employee.hire_date).toBeInstanceOf(Date);
    });
  });

  it('should preserve all timestamp fields', async () => {
    await db.insert(employeesTable)
      .values({
        employee_id: 'EMP006',
        full_name: 'Test Employee',
        email: 'test@company.com',
        hire_date: '2023-01-01',
        position: 'Tester',
        department: 'QA',
        salary: '55000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null,
        phone: null,
        address: null,
        birth_date: null
      })
      .execute();

    const result = await getEmployees();

    expect(result).toHaveLength(1);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(result[0].hire_date).toBeInstanceOf(Date);
  });

  it('should handle birth_date conversion correctly', async () => {
    await db.insert(employeesTable)
      .values({
        employee_id: 'EMP007',
        full_name: 'Employee With Birthday',
        email: 'birthday@company.com',
        hire_date: '2023-01-01',
        position: 'Developer',
        department: 'Engineering',
        salary: '70000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null,
        phone: null,
        address: null,
        birth_date: '1985-12-25'
      })
      .execute();

    const result = await getEmployees();

    expect(result).toHaveLength(1);
    expect(result[0].birth_date).toBeInstanceOf(Date);
    expect(result[0].birth_date!.getFullYear()).toEqual(1985);
    expect(result[0].birth_date!.getMonth()).toEqual(11); // December is month 11
    expect(result[0].birth_date!.getDate()).toEqual(25);
  });
});
