
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type UpdateEmployeeInput, type CreateEmployeeInput } from '../schema';
import { updateEmployee } from '../handlers/update_employee';
import { eq } from 'drizzle-orm';

// Counter to ensure unique employee IDs
let employeeCounter = 1;

// Helper function to create a test employee with unique ID
const createTestEmployee = async (overrides: Partial<CreateEmployeeInput> = {}): Promise<number> => {
  const testEmployee: CreateEmployeeInput = {
    employee_id: `EMP${employeeCounter.toString().padStart(3, '0')}`,
    full_name: 'John Doe',
    email: `john.doe${employeeCounter}@company.com`,
    phone: '+1234567890',
    address: '123 Main St',
    birth_date: new Date('1990-01-01'),
    hire_date: new Date('2023-01-01'),
    position: 'Software Engineer',
    department: 'IT',
    salary: 50000,
    status: 'active',
    contract_type: 'permanent',
    manager_id: null,
    ...overrides
  };

  employeeCounter++;

  const result = await db.insert(employeesTable)
    .values({
      ...testEmployee,
      salary: testEmployee.salary?.toString(),
      birth_date: testEmployee.birth_date?.toISOString().split('T')[0],
      hire_date: testEmployee.hire_date.toISOString().split('T')[0]
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateEmployee', () => {
  beforeEach(async () => {
    await createDB();
    employeeCounter = 1; // Reset counter for each test
  });
  afterEach(resetDB);

  it('should update employee basic information', async () => {
    const employeeId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      full_name: 'Jane Smith',
      email: 'jane.smith@company.com',
      position: 'Senior Software Engineer',
      department: 'Engineering'
    };

    const result = await updateEmployee(updateInput);

    expect(result.id).toEqual(employeeId);
    expect(result.full_name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane.smith@company.com');
    expect(result.position).toEqual('Senior Software Engineer');
    expect(result.department).toEqual('Engineering');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update employee salary correctly', async () => {
    const employeeId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      salary: 75000
    };

    const result = await updateEmployee(updateInput);

    expect(result.salary).toEqual(75000);
    expect(typeof result.salary).toBe('number');
  });

  it('should update employee status and contract type', async () => {
    const employeeId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      status: 'inactive',
      contract_type: 'contract'
    };

    const result = await updateEmployee(updateInput);

    expect(result.status).toEqual('inactive');
    expect(result.contract_type).toEqual('contract');
  });

  it('should set nullable fields to null', async () => {
    const employeeId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      phone: null,
      address: null,
      salary: null,
      manager_id: null
    };

    const result = await updateEmployee(updateInput);

    expect(result.phone).toBeNull();
    expect(result.address).toBeNull();
    expect(result.salary).toBeNull();
    expect(result.manager_id).toBeNull();
  });

  it('should persist changes to database', async () => {
    const employeeId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      full_name: 'Updated Name',
      position: 'Updated Position',
      salary: 60000
    };

    await updateEmployee(updateInput);

    // Verify changes were saved to database
    const employees = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, employeeId))
      .execute();

    expect(employees).toHaveLength(1);
    expect(employees[0].full_name).toEqual('Updated Name');
    expect(employees[0].position).toEqual('Updated Position');
    expect(parseFloat(employees[0].salary!)).toEqual(60000);
    expect(employees[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields, leaving others unchanged', async () => {
    const employeeId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      position: 'Lead Developer'
    };

    const result = await updateEmployee(updateInput);

    // Check that only position was updated
    expect(result.position).toEqual('Lead Developer');
    
    // Check that other fields remain unchanged
    expect(result.full_name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe1@company.com');
    expect(result.department).toEqual('IT');
    expect(result.salary).toEqual(50000);
    expect(result.status).toEqual('active');
  });

  it('should update dates correctly', async () => {
    const employeeId = await createTestEmployee();

    const newBirthDate = new Date('1985-05-15');

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      birth_date: newBirthDate
    };

    const result = await updateEmployee(updateInput);

    expect(result.birth_date).toEqual(newBirthDate);
    expect(result.birth_date).toBeInstanceOf(Date);
  });

  it('should set birth_date to null', async () => {
    const employeeId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      birth_date: null
    };

    const result = await updateEmployee(updateInput);

    expect(result.birth_date).toBeNull();
  });

  it('should throw error when employee does not exist', async () => {
    const updateInput: UpdateEmployeeInput = {
      id: 999999,
      full_name: 'Nonexistent Employee'
    };

    await expect(updateEmployee(updateInput)).rejects.toThrow(/Employee with id 999999 not found/i);
  });

  it('should handle manager_id assignment', async () => {
    // Create manager employee
    const managerId = await createTestEmployee();
    
    // Create employee to be updated
    const employeeId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      manager_id: managerId
    };

    const result = await updateEmployee(updateInput);

    expect(result.manager_id).toEqual(managerId);
  });

  it('should update all fields when provided', async () => {
    const employeeId = await createTestEmployee();
    const managerId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      employee_id: 'EMP999',
      full_name: 'Complete Update',
      email: 'complete@update.com',
      phone: '+9876543210',
      address: '999 New Street',
      birth_date: new Date('1995-12-25'),
      position: 'Tech Lead',
      department: 'Research',
      salary: 90000,
      status: 'active',
      contract_type: 'contract',
      manager_id: managerId
    };

    const result = await updateEmployee(updateInput);

    expect(result.employee_id).toEqual('EMP999');
    expect(result.full_name).toEqual('Complete Update');
    expect(result.email).toEqual('complete@update.com');
    expect(result.phone).toEqual('+9876543210');
    expect(result.address).toEqual('999 New Street');
    expect(result.birth_date).toEqual(new Date('1995-12-25'));
    expect(result.position).toEqual('Tech Lead');
    expect(result.department).toEqual('Research');
    expect(result.salary).toEqual(90000);
    expect(result.status).toEqual('active');
    expect(result.contract_type).toEqual('contract');
    expect(result.manager_id).toEqual(managerId);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle hire_date field correctly', async () => {
    const employeeId = await createTestEmployee();

    const result = await updateEmployee({
      id: employeeId,
      position: 'Updated Position'
    });

    // hire_date should remain as Date object from original creation
    expect(result.hire_date).toBeInstanceOf(Date);
    expect(result.hire_date).toEqual(new Date('2023-01-01'));
  });

  it('should preserve original dates when not updating them', async () => {
    const employeeId = await createTestEmployee();

    const updateInput: UpdateEmployeeInput = {
      id: employeeId,
      full_name: 'Name Only Update'
    };

    const result = await updateEmployee(updateInput);

    // Original dates should be preserved
    expect(result.birth_date).toEqual(new Date('1990-01-01'));
    expect(result.hire_date).toEqual(new Date('2023-01-01'));
  });
});
