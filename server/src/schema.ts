
import { z } from 'zod';

// Enums
export const employeeStatusEnum = z.enum(['active', 'inactive', 'terminated', 'resigned']);
export const contractTypeEnum = z.enum(['permanent', 'contract', 'daily_freelance']);
export const applicationStatusEnum = z.enum(['applied', 'screening', 'interview', 'selected', 'rejected', 'hired']);
export const interviewStatusEnum = z.enum(['scheduled', 'completed', 'cancelled']);
export const attendanceStatusEnum = z.enum(['present', 'absent', 'late', 'half_day', 'sick_leave', 'annual_leave']);
export const overtimeStatusEnum = z.enum(['pending', 'approved', 'rejected', 'completed']);
export const trainingStatusEnum = z.enum(['proposed', 'approved', 'scheduled', 'ongoing', 'completed', 'cancelled']);
export const leaveTypeEnum = z.enum(['annual', 'sick', 'maternity', 'emergency', 'unpaid']);
export const leaveStatusEnum = z.enum(['pending', 'approved', 'rejected']);
export const performanceRatingEnum = z.enum(['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory']);

// Employee schemas
export const employeeSchema = z.object({
  id: z.number(),
  employee_id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  birth_date: z.coerce.date().nullable(),
  hire_date: z.coerce.date(),
  position: z.string(),
  department: z.string(),
  salary: z.number().nullable(),
  status: employeeStatusEnum,
  contract_type: contractTypeEnum,
  manager_id: z.number().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Employee = z.infer<typeof employeeSchema>;

export const createEmployeeInputSchema = z.object({
  employee_id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  birth_date: z.coerce.date().nullable(),
  hire_date: z.coerce.date(),
  position: z.string(),
  department: z.string(),
  salary: z.number().positive().nullable(),
  status: employeeStatusEnum,
  contract_type: contractTypeEnum,
  manager_id: z.number().nullable()
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeInputSchema>;

// Job Request schemas
export const jobRequestSchema = z.object({
  id: z.number(),
  title: z.string(),
  department: z.string(),
  position: z.string(),
  required_count: z.number().int(),
  job_description: z.string(),
  requirements: z.string(),
  requested_by: z.number(),
  requested_date: z.coerce.date(),
  deadline: z.coerce.date().nullable(),
  status: z.enum(['open', 'closed', 'cancelled']),
  created_at: z.coerce.date()
});

export type JobRequest = z.infer<typeof jobRequestSchema>;

export const createJobRequestInputSchema = z.object({
  title: z.string(),
  department: z.string(),
  position: z.string(),
  required_count: z.number().int().positive(),
  job_description: z.string(),
  requirements: z.string(),
  requested_by: z.number(),
  deadline: z.coerce.date().nullable(),
  status: z.enum(['open', 'closed', 'cancelled']).default('open')
});

export type CreateJobRequestInput = z.infer<typeof createJobRequestInputSchema>;

// Job Application schemas
export const jobApplicationSchema = z.object({
  id: z.number(),
  job_request_id: z.number(),
  applicant_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  resume_url: z.string().nullable(),
  cover_letter: z.string().nullable(),
  application_date: z.coerce.date(),
  status: applicationStatusEnum,
  notes: z.string().nullable(),
  created_at: z.coerce.date()
});

export type JobApplication = z.infer<typeof jobApplicationSchema>;

export const createJobApplicationInputSchema = z.object({
  job_request_id: z.number(),
  applicant_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  resume_url: z.string().nullable(),
  cover_letter: z.string().nullable(),
  status: applicationStatusEnum.default('applied'),
  notes: z.string().nullable()
});

export type CreateJobApplicationInput = z.infer<typeof createJobApplicationInputSchema>;

// Interview schemas
export const interviewSchema = z.object({
  id: z.number(),
  application_id: z.number(),
  interview_date: z.coerce.date(),
  interviewer_id: z.number(),
  interview_type: z.string(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  result: z.string().nullable(),
  score: z.number().nullable(),
  status: interviewStatusEnum,
  created_at: z.coerce.date()
});

export type Interview = z.infer<typeof interviewSchema>;

export const createInterviewInputSchema = z.object({
  application_id: z.number(),
  interview_date: z.coerce.date(),
  interviewer_id: z.number(),
  interview_type: z.string(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  result: z.string().nullable(),
  score: z.number().min(0).max(100).nullable(),
  status: interviewStatusEnum.default('scheduled')
});

export type CreateInterviewInput = z.infer<typeof createInterviewInputSchema>;

// Performance Evaluation schemas
export const performanceEvaluationSchema = z.object({
  id: z.number(),
  employee_id: z.number(),
  evaluator_id: z.number(),
  evaluation_period_start: z.coerce.date(),
  evaluation_period_end: z.coerce.date(),
  overall_rating: performanceRatingEnum,
  goals_achievement: z.number().min(0).max(100),
  competency_score: z.number().min(0).max(100),
  strengths: z.string().nullable(),
  areas_for_improvement: z.string().nullable(),
  development_plan: z.string().nullable(),
  comments: z.string().nullable(),
  created_at: z.coerce.date()
});

export type PerformanceEvaluation = z.infer<typeof performanceEvaluationSchema>;

export const createPerformanceEvaluationInputSchema = z.object({
  employee_id: z.number(),
  evaluator_id: z.number(),
  evaluation_period_start: z.coerce.date(),
  evaluation_period_end: z.coerce.date(),
  overall_rating: performanceRatingEnum,
  goals_achievement: z.number().min(0).max(100),
  competency_score: z.number().min(0).max(100),
  strengths: z.string().nullable(),
  areas_for_improvement: z.string().nullable(),
  development_plan: z.string().nullable(),
  comments: z.string().nullable()
});

export type CreatePerformanceEvaluationInput = z.infer<typeof createPerformanceEvaluationInputSchema>;

// Contract schemas
export const contractSchema = z.object({
  id: z.number(),
  employee_id: z.number(),
  contract_type: contractTypeEnum,
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  salary: z.number(),
  terms_and_conditions: z.string(),
  is_active: z.boolean(),
  created_at: z.coerce.date()
});

export type Contract = z.infer<typeof contractSchema>;

export const createContractInputSchema = z.object({
  employee_id: z.number(),
  contract_type: contractTypeEnum,
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  salary: z.number().positive(),
  terms_and_conditions: z.string(),
  is_active: z.boolean().default(true)
});

export type CreateContractInput = z.infer<typeof createContractInputSchema>;

// Training schemas
export const trainingProgramSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  trainer: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  location: z.string().nullable(),
  max_participants: z.number().int(),
  cost_per_participant: z.number().nullable(),
  status: trainingStatusEnum,
  created_at: z.coerce.date()
});

export type TrainingProgram = z.infer<typeof trainingProgramSchema>;

export const createTrainingProgramInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  trainer: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  location: z.string().nullable(),
  max_participants: z.number().int().positive(),
  cost_per_participant: z.number().positive().nullable(),
  status: trainingStatusEnum.default('proposed')
});

export type CreateTrainingProgramInput = z.infer<typeof createTrainingProgramInputSchema>;

// Training Enrollment schemas
export const trainingEnrollmentSchema = z.object({
  id: z.number(),
  training_id: z.number(),
  employee_id: z.number(),
  enrollment_date: z.coerce.date(),
  attendance_status: z.enum(['registered', 'attended', 'absent', 'completed']),
  completion_score: z.number().nullable(),
  feedback: z.string().nullable(),
  created_at: z.coerce.date()
});

export type TrainingEnrollment = z.infer<typeof trainingEnrollmentSchema>;

export const createTrainingEnrollmentInputSchema = z.object({
  training_id: z.number(),
  employee_id: z.number(),
  attendance_status: z.enum(['registered', 'attended', 'absent', 'completed']).default('registered'),
  completion_score: z.number().min(0).max(100).nullable(),
  feedback: z.string().nullable()
});

export type CreateTrainingEnrollmentInput = z.infer<typeof createTrainingEnrollmentInputSchema>;

// Attendance schemas
export const attendanceSchema = z.object({
  id: z.number(),
  employee_id: z.number(),
  date: z.coerce.date(),
  check_in: z.string().nullable(), // Time stored as string "HH:MM"
  check_out: z.string().nullable(),
  break_start: z.string().nullable(),
  break_end: z.string().nullable(),
  total_hours: z.number().nullable(),
  status: attendanceStatusEnum,
  notes: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Attendance = z.infer<typeof attendanceSchema>;

export const createAttendanceInputSchema = z.object({
  employee_id: z.number(),
  date: z.coerce.date(),
  check_in: z.string().nullable(),
  check_out: z.string().nullable(),
  break_start: z.string().nullable(),
  break_end: z.string().nullable(),
  total_hours: z.number().min(0).nullable(),
  status: attendanceStatusEnum,
  notes: z.string().nullable()
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceInputSchema>;

// Overtime schemas
export const overtimeRequestSchema = z.object({
  id: z.number(),
  employee_id: z.number(),
  date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string(),
  total_hours: z.number(),
  reason: z.string(),
  approved_by: z.number().nullable(),
  approved_at: z.coerce.date().nullable(),
  status: overtimeStatusEnum,
  notes: z.string().nullable(),
  created_at: z.coerce.date()
});

export type OvertimeRequest = z.infer<typeof overtimeRequestSchema>;

export const createOvertimeRequestInputSchema = z.object({
  employee_id: z.number(),
  date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string(),
  total_hours: z.number().positive(),
  reason: z.string(),
  status: overtimeStatusEnum.default('pending'),
  notes: z.string().nullable()
});

export type CreateOvertimeRequestInput = z.infer<typeof createOvertimeRequestInputSchema>;

// Leave Request schemas
export const leaveRequestSchema = z.object({
  id: z.number(),
  employee_id: z.number(),
  leave_type: leaveTypeEnum,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  total_days: z.number().int(),
  reason: z.string(),
  approved_by: z.number().nullable(),
  approved_at: z.coerce.date().nullable(),
  status: leaveStatusEnum,
  notes: z.string().nullable(),
  created_at: z.coerce.date()
});

export type LeaveRequest = z.infer<typeof leaveRequestSchema>;

export const createLeaveRequestInputSchema = z.object({
  employee_id: z.number(),
  leave_type: leaveTypeEnum,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  total_days: z.number().int().positive(),
  reason: z.string(),
  status: leaveStatusEnum.default('pending'),
  notes: z.string().nullable()
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestInputSchema>;

// Update schemas
export const updateEmployeeInputSchema = z.object({
  id: z.number(),
  employee_id: z.string().optional(),
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  birth_date: z.coerce.date().nullable().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().positive().nullable().optional(),
  status: employeeStatusEnum.optional(),
  contract_type: contractTypeEnum.optional(),
  manager_id: z.number().nullable().optional()
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeInputSchema>;

export const updateJobApplicationInputSchema = z.object({
  id: z.number(),
  status: applicationStatusEnum.optional(),
  notes: z.string().nullable().optional()
});

export type UpdateJobApplicationInput = z.infer<typeof updateJobApplicationInputSchema>;

export const updateOvertimeRequestInputSchema = z.object({
  id: z.number(),
  approved_by: z.number().optional(),
  status: overtimeStatusEnum.optional(),
  notes: z.string().nullable().optional()
});

export type UpdateOvertimeRequestInput = z.infer<typeof updateOvertimeRequestInputSchema>;

export const updateLeaveRequestInputSchema = z.object({
  id: z.number(),
  approved_by: z.number().optional(),
  status: leaveStatusEnum.optional(),
  notes: z.string().nullable().optional()
});

export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestInputSchema>;
