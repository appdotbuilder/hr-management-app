
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type CreateEmployeeInput } from '../schema';
import { createEmployee } from '../handlers/create_employee';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateEmployeeInput = {
  employee_id: 'EMP001',
  full_name: 'John Doe',
  email: 'john.doe@company.com',
  phone: '+1234567890',
  address: '123 Main St, City, Country',
  birth_date: new Date('1990-01-15'),
  hire_date: new Date('2023-01-01'),
  position: 'Software Engineer',  
  department: 'Engineering',
  salary: 75000.50,
  status: 'active',
  contract_type: 'permanent',
  manager_id: null
};

describe('createEmployee', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an employee with all fields', async () => {
    const result = await createEmployee(testInput);

    // Basic field validation
    expect(result.employee_id).toEqual('EMP001');
    expect(result.full_name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@company.com');
    expect(result.phone).toEqual('+1234567890');
    expect(result.address).toEqual('123 Main St, City, Country');
    expect(result.birth_date).toEqual(new Date('1990-01-15'));
    expect(result.hire_date).toEqual(new Date('2023-01-01'));
    expect(result.position).toEqual('Software Engineer');
    expect(result.department).toEqual('Engineering');
    expect(result.salary).toEqual(75000.50);
    expect(typeof result.salary).toBe('number');
    expect(result.status).toEqual('active');
    expect(result.contract_type).toEqual('permanent');
    expect(result.manager_id).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save employee to database', async () => {
    const result = await createEmployee(testInput);

    // Query using proper drizzle syntax
    const employees = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, result.id));

    expect(employees).toHaveLength(1);
    expect(employees[0].employee_id).toEqual('EMP001');
    expect(employees[0].full_name).toEqual('John Doe');
    expect(employees[0].email).toEqual('john.doe@company.com');
    expect(parseFloat(employees[0].salary!)).toEqual(75000.50);
    expect(employees[0].status).toEqual('active');
    expect(employees[0].contract_type).toEqual('permanent');
    expect(employees[0].created_at).toBeInstanceOf(Date);
  });

  it('should create employee with nullable fields as null', async () => {
    const inputWithNulls: CreateEmployeeInput = {
      employee_id: 'EMP002',
      full_name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: null,
      address: null,
      birth_date: null,
      hire_date: new Date('2023-02-01'),
      position: 'Designer',
      department: 'Design',
      salary: null,
      status: 'active',
      contract_type: 'contract',
      manager_id: null
    };

    const result = await createEmployee(inputWithNulls);

    expect(result.phone).toBeNull();
    expect(result.address).toBeNull();
    expect(result.birth_date).toBeNull();
    expect(result.salary).toBeNull();
    expect(result.manager_id).toBeNull();
    expect(result.full_name).toEqual('Jane Smith');
    expect(result.position).toEqual('Designer');
    expect(result.contract_type).toEqual('contract');
  });

  it('should create employee with manager relationship', async () => {
    // First create a manager
    const managerInput: CreateEmployeeInput = {
      employee_id: 'MGR001',
      full_name: 'Manager Smith',
      email: 'manager@company.com',
      phone: '+1111111111',
      address: null,
      birth_date: null,
      hire_date: new Date('2022-01-01'),
      position: 'Engineering Manager',
      department: 'Engineering',
      salary: 100000.00,
      status: 'active',
      contract_type: 'permanent',
      manager_id: null
    };

    const manager = await createEmployee(managerInput);

    // Create employee with manager
    const employeeInput: CreateEmployeeInput = {
      ...testInput,
      employee_id: 'EMP003',
      email: 'employee@company.com',
      manager_id: manager.id
    };

    const result = await createEmployee(employeeInput);

    expect(result.manager_id).toEqual(manager.id);
    expect(typeof result.manager_id).toBe('number');
  });

  it('should handle different contract types and statuses', async () => {
    const contractorInput: CreateEmployeeInput = {
      employee_id: 'CONT001',
      full_name: 'Contractor Bob',
      email: 'contractor@company.com',
      phone: '+9999999999',
      address: 'Remote',
      birth_date: new Date('1985-06-20'),
      hire_date: new Date('2023-03-01'),
      position: 'Consultant',
      department: 'Consulting',
      salary: 85000.75,
      status: 'inactive',
      contract_type: 'daily_freelance',
      manager_id: null
    };

    const result = await createEmployee(contractorInput);

    expect(result.status).toEqual('inactive');
    expect(result.contract_type).toEqual('daily_freelance');
    expect(result.salary).toEqual(85000.75);
    expect(typeof result.salary).toBe('number');
  });
});
