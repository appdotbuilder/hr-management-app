
import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  integer, 
  boolean, 
  date,
  pgEnum 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums
export const employeeStatusEnum = pgEnum('employee_status', ['active', 'inactive', 'terminated', 'resigned']);
export const contractTypeEnum = pgEnum('contract_type', ['permanent', 'contract', 'daily_freelance']);
export const applicationStatusEnum = pgEnum('application_status', ['applied', 'screening', 'interview', 'selected', 'rejected', 'hired']);
export const interviewStatusEnum = pgEnum('interview_status', ['scheduled', 'completed', 'cancelled']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late', 'half_day', 'sick_leave', 'annual_leave']);
export const overtimeStatusEnum = pgEnum('overtime_status', ['pending', 'approved', 'rejected', 'completed']);
export const trainingStatusEnum = pgEnum('training_status', ['proposed', 'approved', 'scheduled', 'ongoing', 'completed', 'cancelled']);
export const leaveTypeEnum = pgEnum('leave_type', ['annual', 'sick', 'maternity', 'emergency', 'unpaid']);
export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'rejected']);
export const performanceRatingEnum = pgEnum('performance_rating', ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory']);

// Employees table
export const employeesTable = pgTable('employees', {
  id: serial('id').primaryKey(),
  employee_id: text('employee_id').notNull().unique(),
  full_name: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  birth_date: date('birth_date'),
  hire_date: date('hire_date').notNull(),
  position: text('position').notNull(),
  department: text('department').notNull(),
  salary: numeric('salary', { precision: 12, scale: 2 }),
  status: employeeStatusEnum('status').notNull(),
  contract_type: contractTypeEnum('contract_type').notNull(),
  manager_id: integer('manager_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Job requests table
export const jobRequestsTable = pgTable('job_requests', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  position: text('position').notNull(),
  required_count: integer('required_count').notNull(),
  job_description: text('job_description').notNull(),
  requirements: text('requirements').notNull(),
  requested_by: integer('requested_by').notNull(),
  requested_date: timestamp('requested_date').defaultNow().notNull(),
  deadline: date('deadline'),
  status: text('status').notNull().default('open'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Job applications table
export const jobApplicationsTable = pgTable('job_applications', {
  id: serial('id').primaryKey(),
  job_request_id: integer('job_request_id').notNull(),
  applicant_name: text('applicant_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  resume_url: text('resume_url'),
  cover_letter: text('cover_letter'),
  application_date: timestamp('application_date').defaultNow().notNull(),
  status: applicationStatusEnum('status').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Interviews table
export const interviewsTable = pgTable('interviews', {
  id: serial('id').primaryKey(),
  application_id: integer('application_id').notNull(),
  interview_date: timestamp('interview_date').notNull(),
  interviewer_id: integer('interviewer_id').notNull(),
  interview_type: text('interview_type').notNull(),
  location: text('location'),
  notes: text('notes'),
  result: text('result'),
  score: numeric('score', { precision: 5, scale: 2 }),
  status: interviewStatusEnum('status').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Performance evaluations table
export const performanceEvaluationsTable = pgTable('performance_evaluations', {
  id: serial('id').primaryKey(),
  employee_id: integer('employee_id').notNull(),
  evaluator_id: integer('evaluator_id').notNull(),
  evaluation_period_start: date('evaluation_period_start').notNull(),
  evaluation_period_end: date('evaluation_period_end').notNull(),
  overall_rating: performanceRatingEnum('overall_rating').notNull(),
  goals_achievement: integer('goals_achievement').notNull(),
  competency_score: integer('competency_score').notNull(),
  strengths: text('strengths'),
  areas_for_improvement: text('areas_for_improvement'),
  development_plan: text('development_plan'),
  comments: text('comments'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Contracts table
export const contractsTable = pgTable('contracts', {
  id: serial('id').primaryKey(),
  employee_id: integer('employee_id').notNull(),
  contract_type: contractTypeEnum('contract_type').notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date'),
  salary: numeric('salary', { precision: 12, scale: 2 }).notNull(),
  terms_and_conditions: text('terms_and_conditions').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Training programs table
export const trainingProgramsTable = pgTable('training_programs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  trainer: text('trainer').notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  location: text('location'),
  max_participants: integer('max_participants').notNull(),
  cost_per_participant: numeric('cost_per_participant', { precision: 10, scale: 2 }),
  status: trainingStatusEnum('status').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Training enrollments table
export const trainingEnrollmentsTable = pgTable('training_enrollments', {
  id: serial('id').primaryKey(),
  training_id: integer('training_id').notNull(),
  employee_id: integer('employee_id').notNull(),
  enrollment_date: timestamp('enrollment_date').defaultNow().notNull(),
  attendance_status: text('attendance_status').notNull().default('registered'),
  completion_score: numeric('completion_score', { precision: 5, scale: 2 }),
  feedback: text('feedback'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Attendance table
export const attendanceTable = pgTable('attendance', {
  id: serial('id').primaryKey(),
  employee_id: integer('employee_id').notNull(),
  date: date('date').notNull(),
  check_in: text('check_in'),
  check_out: text('check_out'),
  break_start: text('break_start'),
  break_end: text('break_end'),
  total_hours: numeric('total_hours', { precision: 4, scale: 2 }),
  status: attendanceStatusEnum('status').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Overtime requests table
export const overtimeRequestsTable = pgTable('overtime_requests', {
  id: serial('id').primaryKey(),
  employee_id: integer('employee_id').notNull(),
  date: date('date').notNull(),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  total_hours: numeric('total_hours', { precision: 4, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  approved_by: integer('approved_by'),
  approved_at: timestamp('approved_at'),
  status: overtimeStatusEnum('status').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Leave requests table
export const leaveRequestsTable = pgTable('leave_requests', {
  id: serial('id').primaryKey(),
  employee_id: integer('employee_id').notNull(),
  leave_type: leaveTypeEnum('leave_type').notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  total_days: integer('total_days').notNull(),
  reason: text('reason').notNull(),
  approved_by: integer('approved_by'),
  approved_at: timestamp('approved_at'),
  status: leaveStatusEnum('status').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Define relations
export const employeesRelations = relations(employeesTable, ({ one, many }) => ({
  manager: one(employeesTable, {
    fields: [employeesTable.manager_id],
    references: [employeesTable.id]
  }),
  subordinates: many(employeesTable),
  jobRequests: many(jobRequestsTable),
  interviews: many(interviewsTable),
  performanceEvaluations: many(performanceEvaluationsTable),
  evaluatorEvaluations: many(performanceEvaluationsTable),
  contracts: many(contractsTable),
  trainingEnrollments: many(trainingEnrollmentsTable),
  attendance: many(attendanceTable),
  overtimeRequests: many(overtimeRequestsTable),
  leaveRequests: many(leaveRequestsTable)
}));

export const jobRequestsRelations = relations(jobRequestsTable, ({ one, many }) => ({
  requestedBy: one(employeesTable, {
    fields: [jobRequestsTable.requested_by],
    references: [employeesTable.id]
  }),
  applications: many(jobApplicationsTable)
}));

export const jobApplicationsRelations = relations(jobApplicationsTable, ({ one, many }) => ({
  jobRequest: one(jobRequestsTable, {
    fields: [jobApplicationsTable.job_request_id],
    references: [jobRequestsTable.id]
  }),
  interviews: many(interviewsTable)
}));

export const interviewsRelations = relations(interviewsTable, ({ one }) => ({
  application: one(jobApplicationsTable, {
    fields: [interviewsTable.application_id],
    references: [jobApplicationsTable.id]
  }),
  interviewer: one(employeesTable, {
    fields: [interviewsTable.interviewer_id],
    references: [employeesTable.id]
  })
}));

export const performanceEvaluationsRelations = relations(performanceEvaluationsTable, ({ one }) => ({
  employee: one(employeesTable, {
    fields: [performanceEvaluationsTable.employee_id],
    references: [employeesTable.id]
  }),
  evaluator: one(employeesTable, {
    fields: [performanceEvaluationsTable.evaluator_id],
    references: [employeesTable.id]
  })
}));

export const contractsRelations = relations(contractsTable, ({ one }) => ({
  employee: one(employeesTable, {
    fields: [contractsTable.employee_id],
    references: [employeesTable.id]
  })
}));

export const trainingProgramsRelations = relations(trainingProgramsTable, ({ many }) => ({
  enrollments: many(trainingEnrollmentsTable)
}));

export const trainingEnrollmentsRelations = relations(trainingEnrollmentsTable, ({ one }) => ({
  training: one(trainingProgramsTable, {
    fields: [trainingEnrollmentsTable.training_id],
    references: [trainingProgramsTable.id]
  }),
  employee: one(employeesTable, {
    fields: [trainingEnrollmentsTable.employee_id],
    references: [employeesTable.id]
  })
}));

export const attendanceRelations = relations(attendanceTable, ({ one }) => ({
  employee: one(employeesTable, {
    fields: [attendanceTable.employee_id],
    references: [employeesTable.id]
  })
}));

export const overtimeRequestsRelations = relations(overtimeRequestsTable, ({ one }) => ({
  employee: one(employeesTable, {
    fields: [overtimeRequestsTable.employee_id],
    references: [employeesTable.id]
  }),
  approver: one(employeesTable, {
    fields: [overtimeRequestsTable.approved_by],
    references: [employeesTable.id]
  })
}));

export const leaveRequestsRelations = relations(leaveRequestsTable, ({ one }) => ({
  employee: one(employeesTable, {
    fields: [leaveRequestsTable.employee_id],
    references: [employeesTable.id]
  }),
  approver: one(employeesTable, {
    fields: [leaveRequestsTable.approved_by],
    references: [employeesTable.id]
  })
}));

// Export all tables for drizzle relations
export const tables = {
  employees: employeesTable,
  jobRequests: jobRequestsTable,
  jobApplications: jobApplicationsTable,
  interviews: interviewsTable,
  performanceEvaluations: performanceEvaluationsTable,
  contracts: contractsTable,
  trainingPrograms: trainingProgramsTable,
  trainingEnrollments: trainingEnrollmentsTable,
  attendance: attendanceTable,
  overtimeRequests: overtimeRequestsTable,
  leaveRequests: leaveRequestsTable
};
