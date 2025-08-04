
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trainingProgramsTable } from '../db/schema';
import { type CreateTrainingProgramInput } from '../schema';
import { createTrainingProgram } from '../handlers/create_training_program';
import { eq } from 'drizzle-orm';

// Test input with all fields including defaults
const testInput: CreateTrainingProgramInput = {
  title: 'Advanced Leadership Training',
  description: 'Comprehensive leadership development program',
  trainer: 'John Smith',
  start_date: new Date('2024-03-01'),
  end_date: new Date('2024-03-15'),
  location: 'Conference Room A',
  max_participants: 20,
  cost_per_participant: 500.00,
  status: 'proposed' // Zod default
};

const testInputWithoutOptionalFields: CreateTrainingProgramInput = {
  title: 'Basic Safety Training',
  description: 'Essential workplace safety procedures',
  trainer: 'Safety Officer',
  start_date: new Date('2024-04-01'),
  end_date: new Date('2024-04-02'),
  location: null,
  max_participants: 50,
  cost_per_participant: null,
  status: 'approved'
};

describe('createTrainingProgram', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a training program with all fields', async () => {
    const result = await createTrainingProgram(testInput);

    // Basic field validation
    expect(result.title).toEqual('Advanced Leadership Training');
    expect(result.description).toEqual('Comprehensive leadership development program');
    expect(result.trainer).toEqual('John Smith');
    expect(result.start_date).toEqual(new Date('2024-03-01'));
    expect(result.end_date).toEqual(new Date('2024-03-15'));
    expect(result.location).toEqual('Conference Room A');
    expect(result.max_participants).toEqual(20);
    expect(result.cost_per_participant).toEqual(500.00);
    expect(typeof result.cost_per_participant).toBe('number'); // Verify numeric conversion
    expect(result.status).toEqual('proposed');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a training program with null optional fields', async () => {
    const result = await createTrainingProgram(testInputWithoutOptionalFields);

    // Verify required fields
    expect(result.title).toEqual('Basic Safety Training');
    expect(result.description).toEqual('Essential workplace safety procedures');
    expect(result.trainer).toEqual('Safety Officer');
    expect(result.max_participants).toEqual(50);
    expect(result.status).toEqual('approved');
    
    // Verify null optional fields
    expect(result.location).toBeNull();
    expect(result.cost_per_participant).toBeNull();
    
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save training program to database', async () => {
    const result = await createTrainingProgram(testInput);

    // Query using proper drizzle syntax
    const trainingPrograms = await db.select()
      .from(trainingProgramsTable)
      .where(eq(trainingProgramsTable.id, result.id));

    expect(trainingPrograms).toHaveLength(1);
    expect(trainingPrograms[0].title).toEqual('Advanced Leadership Training');
    expect(trainingPrograms[0].description).toEqual('Comprehensive leadership development program');
    expect(trainingPrograms[0].trainer).toEqual('John Smith');
    expect(trainingPrograms[0].location).toEqual('Conference Room A');
    expect(trainingPrograms[0].max_participants).toEqual(20);
    expect(parseFloat(trainingPrograms[0].cost_per_participant!)).toEqual(500.00); // DB stores as string, convert for comparison
    expect(trainingPrograms[0].status).toEqual('proposed');
    expect(trainingPrograms[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different training statuses', async () => {
    const scheduledInput: CreateTrainingProgramInput = {
      ...testInput,
      title: 'Scheduled Training',
      status: 'scheduled'
    };

    const result = await createTrainingProgram(scheduledInput);

    expect(result.title).toEqual('Scheduled Training');
    expect(result.status).toEqual('scheduled');
    expect(result.id).toBeDefined();
  });

  it('should handle decimal cost values correctly', async () => {
    const costInput: CreateTrainingProgramInput = {
      ...testInput,
      cost_per_participant: 299.99
    };

    const result = await createTrainingProgram(costInput);

    expect(result.cost_per_participant).toEqual(299.99);
    expect(typeof result.cost_per_participant).toBe('number');

    // Verify database storage and retrieval
    const dbRecord = await db.select()
      .from(trainingProgramsTable)
      .where(eq(trainingProgramsTable.id, result.id));

    expect(parseFloat(dbRecord[0].cost_per_participant!)).toEqual(299.99);
  });
});
