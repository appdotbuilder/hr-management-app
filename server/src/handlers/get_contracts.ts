
import { db } from '../db';
import { contractsTable } from '../db/schema';
import { type Contract } from '../schema';

export const getContracts = async (): Promise<Contract[]> => {
  try {
    const results = await db.select()
      .from(contractsTable)
      .execute();

    // Convert numeric and date fields to proper types
    return results.map(contract => ({
      ...contract,
      salary: parseFloat(contract.salary),
      start_date: new Date(contract.start_date),
      end_date: contract.end_date ? new Date(contract.end_date) : null
    }));
  } catch (error) {
    console.error('Failed to fetch contracts:', error);
    throw error;
  }
};
