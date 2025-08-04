
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createEmployeeInputSchema,
  updateEmployeeInputSchema,
  createJobRequestInputSchema,
  createJobApplicationInputSchema,
  updateJobApplicationInputSchema,
  createInterviewInputSchema,
  createPerformanceEvaluationInputSchema,
  createContractInputSchema,
  createTrainingProgramInputSchema,
  createTrainingEnrollmentInputSchema,
  createAttendanceInputSchema,
  createOvertimeRequestInputSchema,
  updateOvertimeRequestInputSchema,
  createLeaveRequestInputSchema,
  updateLeaveRequestInputSchema
} from './schema';

// Import handlers
import { createEmployee } from './handlers/create_employee';
import { getEmployees } from './handlers/get_employees';
import { updateEmployee } from './handlers/update_employee';
import { createJobRequest } from './handlers/create_job_request';
import { getJobRequests } from './handlers/get_job_requests';
import { createJobApplication } from './handlers/create_job_application';
import { getJobApplications } from './handlers/get_job_applications';
import { updateJobApplication } from './handlers/update_job_application';
import { createInterview } from './handlers/create_interview';
import { getInterviews } from './handlers/get_interviews';
import { createPerformanceEvaluation } from './handlers/create_performance_evaluation';
import { getPerformanceEvaluations } from './handlers/get_performance_evaluations';
import { createContract } from './handlers/create_contract';
import { getContracts } from './handlers/get_contracts';
import { createTrainingProgram } from './handlers/create_training_program';
import { getTrainingPrograms } from './handlers/get_training_programs';
import { createTrainingEnrollment } from './handlers/create_training_enrollment';
import { getTrainingEnrollments } from './handlers/get_training_enrollments';
import { createAttendance } from './handlers/create_attendance';
import { getAttendance } from './handlers/get_attendance';
import { createOvertimeRequest } from './handlers/create_overtime_request';
import { getOvertimeRequests } from './handlers/get_overtime_requests';
import { updateOvertimeRequest } from './handlers/update_overtime_request';
import { createLeaveRequest } from './handlers/create_leave_request';
import { getLeaveRequests } from './handlers/get_leave_requests';
import { updateLeaveRequest } from './handlers/update_leave_request';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Employee management
  createEmployee: publicProcedure
    .input(createEmployeeInputSchema)
    .mutation(({ input }) => createEmployee(input)),
  getEmployees: publicProcedure
    .query(() => getEmployees()),
  updateEmployee: publicProcedure
    .input(updateEmployeeInputSchema)
    .mutation(({ input }) => updateEmployee(input)),

  // Recruitment management
  createJobRequest: publicProcedure
    .input(createJobRequestInputSchema)
    .mutation(({ input }) => createJobRequest(input)),
  getJobRequests: publicProcedure
    .query(() => getJobRequests()),
  createJobApplication: publicProcedure
    .input(createJobApplicationInputSchema)
    .mutation(({ input }) => createJobApplication(input)),
  getJobApplications: publicProcedure
    .query(() => getJobApplications()),
  updateJobApplication: publicProcedure
    .input(updateJobApplicationInputSchema)
    .mutation(({ input }) => updateJobApplication(input)),
  createInterview: publicProcedure
    .input(createInterviewInputSchema)
    .mutation(({ input }) => createInterview(input)),
  getInterviews: publicProcedure
    .query(() => getInterviews()),

  // Performance management
  createPerformanceEvaluation: publicProcedure
    .input(createPerformanceEvaluationInputSchema)
    .mutation(({ input }) => createPerformanceEvaluation(input)),
  getPerformanceEvaluations: publicProcedure
    .query(() => getPerformanceEvaluations()),

  // Contract management
  createContract: publicProcedure
    .input(createContractInputSchema)
    .mutation(({ input }) => createContract(input)),
  getContracts: publicProcedure
    .query(() => getContracts()),

  // Training management
  createTrainingProgram: publicProcedure
    .input(createTrainingProgramInputSchema)
    .mutation(({ input }) => createTrainingProgram(input)),
  getTrainingPrograms: publicProcedure
    .query(() => getTrainingPrograms()),
  createTrainingEnrollment: publicProcedure
    .input(createTrainingEnrollmentInputSchema)
    .mutation(({ input }) => createTrainingEnrollment(input)),
  getTrainingEnrollments: publicProcedure
    .query(() => getTrainingEnrollments()),

  // Attendance management
  createAttendance: publicProcedure
    .input(createAttendanceInputSchema)
    .mutation(({ input }) => createAttendance(input)),
  getAttendance: publicProcedure
    .query(() => getAttendance()),

  // Overtime management
  createOvertimeRequest: publicProcedure
    .input(createOvertimeRequestInputSchema)
    .mutation(({ input }) => createOvertimeRequest(input)),
  getOvertimeRequests: publicProcedure
    .query(() => getOvertimeRequests()),
  updateOvertimeRequest: publicProcedure
    .input(updateOvertimeRequestInputSchema)
    .mutation(({ input }) => updateOvertimeRequest(input)),

  // Leave management
  createLeaveRequest: publicProcedure
    .input(createLeaveRequestInputSchema)
    .mutation(({ input }) => createLeaveRequest(input)),
  getLeaveRequests: publicProcedure
    .query(() => getLeaveRequests()),
  updateLeaveRequest: publicProcedure
    .input(updateLeaveRequestInputSchema)
    .mutation(({ input }) => updateLeaveRequest(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC HRD Management server listening at port: ${port}`);
}

start();
