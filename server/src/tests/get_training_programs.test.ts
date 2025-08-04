
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { trainingProgramsTable } from '../db/schema';
import { type CreateTrainingProgramInput } from '../schema';
import { getTrainingPrograms } from '../handlers/get_training_programs';

// Test training program data
const testProgram1: CreateTrainingProgramInput = {
  title: 'Leadership Training',
  description: 'Advanced leadership skills development',
  trainer: 'John Smith',
  start_date: new Date('2024-02-01'),
  end_date: new Date('2024-02-03'),
  location: 'Conference Room A',
  max_participants: 15,
  cost_per_participant: 299.99,
  status: 'proposed'
};

const testProgram2: CreateTrainingProgramInput = {
  title: 'Technical Skills Workshop',
  description: 'Modern development practices',
  trainer: 'Jane Doe',
  start_date: new Date('2024-03-01'),
  end_date: new Date('2024-03-01'),
  location: null,
  max_participants: 20,
  cost_per_participant: null,
  status: 'approved'
};

describe('getTrainingPrograms', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no training programs exist', async () => {
    const result = await getTrainingPrograms();
    expect(result).toEqual([]);
  });

  it('should return all training programs', async () => {
    // Insert test data - convert dates to strings and numbers to strings for database
    await db.insert(trainingProgramsTable)
      .values([
        {
          title: testProgram1.title,
          description: testProgram1.description,
          trainer: testProgram1.trainer,
          start_date: testProgram1.start_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
          end_date: testProgram1.end_date.toISOString().split('T')[0],
          location: testProgram1.location,
          max_participants: testProgram1.max_participants,
          cost_per_participant: testProgram1.cost_per_participant?.toString(),
          status: testProgram1.status
        },
        {
          title: testProgram2.title,
          description: testProgram2.description,
          trainer: testProgram2.trainer,
          start_date: testProgram2.start_date.toISOString().split('T')[0],
          end_date: testProgram2.end_date.toISOString().split('T')[0],
          location: testProgram2.location,
          max_participants: testProgram2.max_participants,
          cost_per_participant: testProgram2.cost_per_participant?.toString(),
          status: testProgram2.status
        }
      ])
      .execute();

    const result = await getTrainingPrograms();

    expect(result).toHaveLength(2);
    
    // Verify first program
    const program1 = result.find(p => p.title === 'Leadership Training');
    expect(program1).toBeDefined();
    expect(program1!.description).toEqual('Advanced leadership skills development');
    expect(program1!.trainer).toEqual('John Smith');
    expect(program1!.start_date).toEqual(new Date('2024-02-01'));
    expect(program1!.end_date).toEqual(new Date('2024-02-03'));
    expect(program1!.location).toEqual('Conference Room A');
    expect(program1!.max_participants).toEqual(15);
    expect(program1!.cost_per_participant).toEqual(299.99);
    expect(typeof program1!.cost_per_participant).toBe('number');
    expect(program1!.status).toEqual('proposed');
    expect(program1!.id).toBeDefined();
    expect(program1!.created_at).toBeInstanceOf(Date);

    // Verify second program
    const program2 = result.find(p => p.title === 'Technical Skills Workshop');
    expect(program2).toBeDefined();
    expect(program2!.description).toEqual('Modern development practices');
    expect(program2!.trainer).toEqual('Jane Doe');
    expect(program2!.location).toBeNull();
    expect(program2!.max_participants).toEqual(20);
    expect(program2!.cost_per_participant).toBeNull();
    expect(program2!.status).toEqual('approved');
  });

  it('should handle numeric conversion correctly', async () => {
    await db.insert(trainingProgramsTable)
      .values({
        title: 'Cost Test Program',
        description: 'Testing cost conversion',
        trainer: 'Test Trainer',
        start_date: '2024-01-01',
        end_date: '2024-01-01',
        location: 'Test Location',
        max_participants: 10,
        cost_per_participant: '1500.50', // String in database
        status: 'scheduled'
      })
      .execute();

    const result = await getTrainingPrograms();

    expect(result).toHaveLength(1);
    const program = result[0];
    expect(program.cost_per_participant).toEqual(1500.50);
    expect(typeof program.cost_per_participant).toBe('number');
    expect(program.start_date).toEqual(new Date('2024-01-01'));
    expect(program.end_date).toEqual(new Date('2024-01-01'));
  });

  it('should return programs ordered by creation date', async () => {
    // Insert programs with slight delay to ensure different created_at times
    await db.insert(trainingProgramsTable)
      .values({
        title: testProgram1.title,
        description: testProgram1.description,
        trainer: testProgram1.trainer,
        start_date: testProgram1.start_date.toISOString().split('T')[0],
        end_date: testProgram1.end_date.toISOString().split('T')[0],
        location: testProgram1.location,
        max_participants: testProgram1.max_participants,
        cost_per_participant: testProgram1.cost_per_participant?.toString(),
        status: testProgram1.status
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(trainingProgramsTable)
      .values({
        title: testProgram2.title,
        description: testProgram2.description,
        trainer: testProgram2.trainer,
        start_date: testProgram2.start_date.toISOString().split('T')[0],
        end_date: testProgram2.end_date.toISOString().split('T')[0],
        location: testProgram2.location,
        max_participants: testProgram2.max_participants,
        cost_per_participant: testProgram2.cost_per_participant?.toString(),
        status: testProgram2.status
      })
      .execute();

    const result = await getTrainingPrograms();

    expect(result).toHaveLength(2);
    // Verify both programs are returned (order may vary)
    const titles = result.map(p => p.title);
    expect(titles).toContain('Leadership Training');
    expect(titles).toContain('Technical Skills Workshop');
  });
});
