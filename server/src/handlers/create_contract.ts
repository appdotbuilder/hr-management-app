
import { db } from '../db';
import { contractsTable } from '../db/schema';
import { type CreateContractInput, type Contract } from '../schema';

export const createContract = async (input: CreateContractInput): Promise<Contract> => {
  try {
    // Insert contract record
    const result = await db.insert(contractsTable)
      .values({
        employee_id: input.employee_id,
        contract_type: input.contract_type,
        start_date: input.start_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        end_date: input.end_date ? input.end_date.toISOString().split('T')[0] : null,
        salary: input.salary.toString(), // Convert number to string for numeric column
        terms_and_conditions: input.terms_and_conditions,
        is_active: input.is_active
      })
      .returning()
      .execute();

    // Convert fields back to expected types before returning
    const contract = result[0];
    return {
      ...contract,
      start_date: new Date(contract.start_date), // Convert string back to Date
      end_date: contract.end_date ? new Date(contract.end_date) : null,
      salary: parseFloat(contract.salary) // Convert string back to number
    };
  } catch (error) {
    console.error('Contract creation failed:', error);
    throw error;
  }
};
