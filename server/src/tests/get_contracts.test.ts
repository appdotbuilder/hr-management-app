
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable, contractsTable } from '../db/schema';
import { getContracts } from '../handlers/get_contracts';

describe('getContracts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no contracts exist', async () => {
    const result = await getContracts();
    expect(result).toEqual([]);
  });

  it('should fetch all contracts', async () => {
    // Create employee first (foreign key requirement)
    await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        address: '123 Main St',
        birth_date: '1990-01-01',
        hire_date: '2023-01-01',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: '75000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .execute();

    // Create contract
    await db.insert(contractsTable)
      .values({
        employee_id: 1,
        contract_type: 'permanent',
        start_date: '2023-01-01',
        end_date: null,
        salary: '75000.50',
        terms_and_conditions: 'Standard employment terms',
        is_active: true
      })
      .execute();

    const result = await getContracts();

    expect(result).toHaveLength(1);
    expect(result[0].employee_id).toEqual(1);
    expect(result[0].contract_type).toEqual('permanent');
    expect(result[0].start_date).toBeInstanceOf(Date);
    expect(result[0].start_date.getFullYear()).toEqual(2023);
    expect(result[0].end_date).toBeNull();
    expect(result[0].salary).toEqual(75000.50);
    expect(typeof result[0].salary).toBe('number');
    expect(result[0].terms_and_conditions).toEqual('Standard employment terms');
    expect(result[0].is_active).toBe(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should fetch multiple contracts', async () => {
    // Create employees
    await db.insert(employeesTable)
      .values([
        {
          employee_id: 'EMP001',
          full_name: 'John Doe',
          email: 'john.doe@company.com',
          phone: '+1234567890',
          address: '123 Main St',
          birth_date: '1990-01-01',
          hire_date: '2023-01-01',
          position: 'Software Engineer',
          department: 'Engineering',
          salary: '75000.00',
          status: 'active',
          contract_type: 'permanent',
          manager_id: null
        },
        {
          employee_id: 'EMP002',
          full_name: 'Jane Doe',
          email: 'jane.doe@company.com',
          phone: '+1234567891',
          address: '456 Oak St',
          birth_date: '1992-05-15',
          hire_date: '2023-02-01',
          position: 'Designer',
          department: 'Design',
          salary: '65000.00',
          status: 'active',
          contract_type: 'contract',
          manager_id: null
        }
      ])
      .execute();

    // Create multiple contracts
    await db.insert(contractsTable)
      .values([
        {
          employee_id: 1,
          contract_type: 'permanent',
          start_date: '2023-01-01',
          end_date: null,
          salary: '75000.50',
          terms_and_conditions: 'Permanent employment terms',
          is_active: true
        },
        {
          employee_id: 2,
          contract_type: 'contract',
          start_date: '2023-02-01',
          end_date: '2023-12-31',
          salary: '50000.00',
          terms_and_conditions: 'Contract terms',
          is_active: false
        }
      ])
      .execute();

    const result = await getContracts();

    expect(result).toHaveLength(2);
    
    // First contract
    expect(result[0].employee_id).toEqual(1);
    expect(result[0].salary).toEqual(75000.50);
    expect(typeof result[0].salary).toBe('number');
    expect(result[0].start_date).toBeInstanceOf(Date);
    expect(result[0].end_date).toBeNull();
    
    // Second contract
    expect(result[1].employee_id).toEqual(2);
    expect(result[1].contract_type).toEqual('contract');
    expect(result[1].salary).toEqual(50000);
    expect(typeof result[1].salary).toBe('number');
    expect(result[1].is_active).toBe(false);
    expect(result[1].start_date).toBeInstanceOf(Date);
    expect(result[1].end_date).toBeInstanceOf(Date);
  });

  it('should handle contracts with different numeric values', async () => {
    // Create employee
    await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        address: '123 Main St',
        birth_date: '1990-01-01',
        hire_date: '2023-01-01',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: '75000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .execute();

    // Create contract with different salary precision
    await db.insert(contractsTable)
      .values({
        employee_id: 1,
        contract_type: 'permanent',
        start_date: '2023-01-01',
        end_date: null,
        salary: '123456.78',
        terms_and_conditions: 'High salary contract',
        is_active: true
      })
      .execute();

    const result = await getContracts();

    expect(result).toHaveLength(1);
    expect(result[0].salary).toEqual(123456.78);
    expect(typeof result[0].salary).toBe('number');
  });

  it('should handle date conversions correctly', async () => {
    // Create employee
    await db.insert(employeesTable)
      .values({
        employee_id: 'EMP001',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        address: '123 Main St',
        birth_date: '1990-01-01',
        hire_date: '2023-01-01',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: '75000.00',
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      })
      .execute();

    // Create contract with specific dates
    await db.insert(contractsTable)
      .values({
        employee_id: 1,
        contract_type: 'contract',
        start_date: '2023-03-15',
        end_date: '2024-03-14',
        salary: '60000.00',
        terms_and_conditions: 'One year contract',
        is_active: true
      })
      .execute();

    const result = await getContracts();

    expect(result).toHaveLength(1);
    expect(result[0].start_date).toBeInstanceOf(Date);
    expect(result[0].start_date.getFullYear()).toEqual(2023);
    expect(result[0].start_date.getMonth()).toEqual(2); // March is month 2 (0-indexed)
    expect(result[0].start_date.getDate()).toEqual(15);
    
    expect(result[0].end_date).toBeInstanceOf(Date);
    expect(result[0].end_date?.getFullYear()).toEqual(2024);
    expect(result[0].end_date?.getMonth()).toEqual(2); // March is month 2 (0-indexed)
    expect(result[0].end_date?.getDate()).toEqual(14);
  });
});
