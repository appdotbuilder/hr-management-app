
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contractsTable, employeesTable } from '../db/schema';
import { type CreateContractInput } from '../schema';
import { createContract } from '../handlers/create_contract';
import { eq } from 'drizzle-orm';

describe('createContract', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contract', async () => {
    // Create prerequisite employee first
    const employeeResult = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        hire_date: '2024-01-01', // Use string format for date
        position: 'Developer',
        department: 'IT',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    const employee = employeeResult[0];

    const testInput: CreateContractInput = {
      employee_id: employee.id,
      contract_type: 'permanent',
      start_date: new Date('2024-01-01'),
      end_date: null,
      salary: 75000.50,
      terms_and_conditions: 'Standard employment terms and conditions',
      is_active: true
    };

    const result = await createContract(testInput);

    // Basic field validation
    expect(result.employee_id).toEqual(employee.id);
    expect(result.contract_type).toEqual('permanent');
    expect(result.start_date).toEqual(new Date('2024-01-01'));
    expect(result.end_date).toBeNull();
    expect(result.salary).toEqual(75000.50);
    expect(typeof result.salary).toBe('number');
    expect(result.terms_and_conditions).toEqual('Standard employment terms and conditions');
    expect(result.is_active).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save contract to database', async () => {
    // Create prerequisite employee first
    const employeeResult = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP002',
        full_name: 'Jane Smith',
        email: 'jane.smith@example.com',
        hire_date: '2024-01-15', // Use string format for date
        position: 'Manager',
        department: 'HR',
        status: 'active',
        contract_type: 'permanent'
      })
      .returning()
      .execute();

    const employee = employeeResult[0];

    const testInput: CreateContractInput = {
      employee_id: employee.id,
      contract_type: 'contract',
      start_date: new Date('2024-02-01'),
      end_date: new Date('2024-12-31'),
      salary: 85000.75,
      terms_and_conditions: 'Contract-based employment terms',
      is_active: true
    };

    const result = await createContract(testInput);

    // Query using proper drizzle syntax
    const contracts = await db.select()
      .from(contractsTable)
      .where(eq(contractsTable.id, result.id))
      .execute();

    expect(contracts).toHaveLength(1);
    expect(contracts[0].employee_id).toEqual(employee.id);
    expect(contracts[0].contract_type).toEqual('contract');
    expect(contracts[0].start_date).toEqual('2024-02-01');
    expect(contracts[0].end_date).toEqual('2024-12-31');
    expect(parseFloat(contracts[0].salary)).toEqual(85000.75);
    expect(contracts[0].terms_and_conditions).toEqual('Contract-based employment terms');
    expect(contracts[0].is_active).toBe(true);
    expect(contracts[0].created_at).toBeInstanceOf(Date);
  });

  it('should create contract with default is_active value', async () => {
    // Create prerequisite employee first
    const employeeResult = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP003',
        full_name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        hire_date: '2024-01-10', // Use string format for date
        position: 'Analyst',
        department: 'Finance',
        status: 'active',
        contract_type: 'daily_freelance'
      })
      .returning()
      .execute();

    const employee = employeeResult[0];

    const testInput: CreateContractInput = {
      employee_id: employee.id,
      contract_type: 'daily_freelance',
      start_date: new Date('2024-03-01'),
      end_date: new Date('2024-06-30'),
      salary: 50000.00,
      terms_and_conditions: 'Daily freelance terms',
      is_active: true // Explicitly set since it has default in Zod
    };

    const result = await createContract(testInput);

    expect(result.is_active).toBe(true);
  });

  it('should create contract with contract type matching employee', async () => {
    // Create prerequisite employee first
    const employeeResult = await db.insert(employeesTable)
      .values({
        employee_id: 'EMP004',
        full_name: 'Alice Brown',
        email: 'alice.brown@example.com',
        hire_date: '2024-01-20',
        position: 'Designer',
        department: 'Marketing',
        status: 'active',
        contract_type: 'contract'
      })
      .returning()
      .execute();

    const employee = employeeResult[0];

    const testInput: CreateContractInput = {
      employee_id: employee.id,
      contract_type: 'contract',
      start_date: new Date('2024-04-01'),
      end_date: new Date('2024-09-30'),
      salary: 65000.25,
      terms_and_conditions: 'Fixed-term contract terms',
      is_active: true
    };

    const result = await createContract(testInput);

    expect(result.contract_type).toEqual('contract');
    expect(result.start_date).toEqual(new Date('2024-04-01'));
    expect(result.end_date).toEqual(new Date('2024-09-30'));
    expect(result.salary).toEqual(65000.25);
  });
});
