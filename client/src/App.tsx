
import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Briefcase, UserCheck, Award, FileText, Clock, Calendar, TrendingUp } from 'lucide-react';
import { trpc } from '@/utils/trpc';

// Import types
import type { 
  Employee, 
  CreateEmployeeInput,
  JobRequest,
  CreateJobRequestInput,
  JobApplication,
  CreateJobApplicationInput,
  PerformanceEvaluation,
  Contract,
  TrainingProgram,
  Attendance,
  OvertimeRequest,
  CreateOvertimeRequestInput,
  LeaveRequest,
  CreateLeaveRequestInput
} from '../../server/src/schema';

function App() {
  // State for all data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [performanceEvaluations, setPerformanceEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      const [
        employeesData,
        jobRequestsData,
        jobApplicationsData,
        performanceData,
        contractsData,
        trainingProgramsData,
        attendanceData,
        overtimeData,
        leaveData
      ] = await Promise.all([
        trpc.getEmployees.query(),
        trpc.getJobRequests.query(),
        trpc.getJobApplications.query(),
        trpc.getPerformanceEvaluations.query(),
        trpc.getContracts.query(),
        trpc.getTrainingPrograms.query(),
        trpc.getAttendance.query(),
        trpc.getOvertimeRequests.query(),
        trpc.getLeaveRequests.query()
      ]);

      setEmployees(employeesData);
      setJobRequests(jobRequestsData);
      setJobApplications(jobApplicationsData);
      setPerformanceEvaluations(performanceData);
      setContracts(contractsData);
      setTrainingPrograms(trainingProgramsData);
      setAttendance(attendanceData);
      setOvertimeRequests(overtimeData);
      setLeaveRequests(leaveData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Form states
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeInput>({
    employee_id: '',
    full_name: '',
    email: '',
    phone: null,
    address: null,
    birth_date: null,
    hire_date: new Date(),
    position: '',
    department: '',
    salary: null,
    status: 'active',
    contract_type: 'permanent',
    manager_id: null
  });

  const [jobRequestForm, setJobRequestForm] = useState<CreateJobRequestInput>({
    title: '',
    department: '',
    position: '',
    required_count: 1,
    job_description: '',
    requirements: '',
    requested_by: 1,
    deadline: null,
    status: 'open'
  });

  const [jobApplicationForm, setJobApplicationForm] = useState<CreateJobApplicationInput>({
    job_request_id: 0,
    applicant_name: '',
    email: '',
    phone: '',
    resume_url: null,
    cover_letter: null,
    status: 'applied',
    notes: null
  });

  const [overtimeForm, setOvertimeForm] = useState<CreateOvertimeRequestInput>({
    employee_id: 0,
    date: new Date(),
    start_time: '',
    end_time: '',
    total_hours: 0,
    reason: '',
    status: 'pending',
    notes: null
  });

  const [leaveForm, setLeaveForm] = useState<CreateLeaveRequestInput>({
    employee_id: 0,
    leave_type: 'annual',
    start_date: new Date(),
    end_date: new Date(),
    total_days: 1,
    reason: '',
    status: 'pending',
    notes: null
  });

  // Handle form submissions
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createEmployee.mutate(employeeForm);
      setEmployees((prev: Employee[]) => [...prev, response]);
      setEmployeeForm({
        employee_id: '',
        full_name: '',
        email: '',
        phone: null,
        address: null,
        birth_date: null,
        hire_date: new Date(),
        position: '',
        department: '',
        salary: null,
        status: 'active',
        contract_type: 'permanent',
        manager_id: null
      });
    } catch (error) {
      console.error('Failed to create employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJobRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createJobRequest.mutate(jobRequestForm);
      setJobRequests((prev: JobRequest[]) => [...prev, response]);
      setJobRequestForm({
        title: '',
        department: '',
        position: '',
        required_count: 1,
        job_description: '',
        requirements: '',
        requested_by: 1,
        deadline: null,
        status: 'open'
      });
    } catch (error) {
      console.error('Failed to create job request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJobApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createJobApplication.mutate(jobApplicationForm);
      setJobApplications((prev: JobApplication[]) => [...prev, response]);
      setJobApplicationForm({
        job_request_id: 0,
        applicant_name: '',
        email: '',
        phone: '',
        resume_url: null,
        cover_letter: null,
        status: 'applied',
        notes: null
      });
    } catch (error) {
      console.error('Failed to create job application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOvertimeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createOvertimeRequest.mutate(overtimeForm);
      setOvertimeRequests((prev: OvertimeRequest[]) => [...prev, response]);
      setOvertimeForm({
        employee_id: 0,
        date: new Date(),
        start_time: '',
        end_time: '',
        total_hours: 0,
        reason: '',
        status: 'pending',
        notes: null
      });
    } catch (error) {
      console.error('Failed to create overtime request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createLeaveRequest.mutate(leaveForm);
      setLeaveRequests((prev: LeaveRequest[]) => [...prev, response]);
      setLeaveForm({
        employee_id: 0,
        leave_type: 'annual',
        start_date: new Date(),
        end_date: new Date(),
        total_days: 1,
        reason: '',
        status: 'pending',
        notes: null
      });
    } catch (error) {
      console.error('Failed to create leave request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      open: 'bg-blue-100 text-blue-800',
      closed: 'bg-red-100 text-red-800',
      applied: 'bg-yellow-100 text-yellow-800',
      selected: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-purple-100 text-purple-800',
      pending: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get active employees for dropdowns
  const activeEmployees = employees.filter(e => e.status === 'active');
  const openJobRequests = jobRequests.filter(j => j.status === 'open');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Sistem Manajemen HRD</h1>
          <p className="text-lg text-gray-600">Kelola seluruh aspek kepegawaian dan sumber daya manusia</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Karyawan
            </TabsTrigger>
            <TabsTrigger value="recruitment" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Rekrutmen
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Kinerja
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Kontrak
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Pelatihan
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Absensi
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Izin & Lembur
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Aktif: {employees.filter(e => e.status === 'active').length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Permintaan Kerja</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobRequests.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Terbuka: {jobRequests.filter(j => j.status === 'open').length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pelamar</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobApplications.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Menunggu: {jobApplications.filter(a => a.status === 'applied').length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lembur Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overtimeRequests.filter(o => o.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total: {overtimeRequests.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {employees.slice(0, 5).map((employee: Employee) => (
                        <div key={employee.id} className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{employee.full_name}</p>
                            <p className="text-xs text-gray-500">
                              Bergabung: {employee.hire_date.toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(employee.status)}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Rekrutmen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {jobRequests.slice(0, 5).map((job: JobRequest) => (
                        <div key={job.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{job.title}</p>
                            <p className="text-xs text-gray-500">{job.department}</p>
                          </div>
                          {getStatusBadge(job.status)}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>👥 Manajemen Karyawan</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Tambah Karyawan</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Tambah Karyawan Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateEmployee} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="employee_id">ID Karyawan</Label>
                          <Input
                            id="employee_id"
                            value={employeeForm.employee_id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, employee_id: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="full_name">Nama Lengkap</Label>
                          <Input
                            id="full_name"
                            value={employeeForm.full_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, full_name: e.target.value }))
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={employeeForm.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, email: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telepon</Label>
                          <Input
                            id="phone"
                            value={employeeForm.phone || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, phone: e.target.value || null }))
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Alamat</Label>
                        <Textarea
                          id="address"
                          value={employeeForm.address || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, address: e.target.value || null }))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="position">Posisi</Label>
                          <Input
                            id="position"
                            value={employeeForm.position}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, position: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="department">Departemen</Label>
                          <Input
                            id="department"
                            value={employeeForm.department}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, department: e.target.value }))
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="salary">Gaji</Label>
                          <Input
                            id="salary"
                            type="number"
                            value={employeeForm.salary || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, salary: parseFloat(e.target.value) || null }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={employeeForm.status}
                            onValueChange={(value: 'active' | 'inactive' | 'terminated' | 'resigned') =>
                              setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Aktif</SelectItem>
                              <SelectItem value="inactive">Tidak Aktif</SelectItem>
                              <SelectItem value="terminated">Diberhentikan</SelectItem>
                              <SelectItem value="resigned">Mengundurkan Diri</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="contract_type">Tipe Kontrak</Label>
                          <Select
                            value={employeeForm.contract_type}
                            onValueChange={(value: 'permanent' | 'contract' | 'daily_freelance') =>
                              setEmployeeForm((prev: CreateEmployeeInput) => ({ ...prev, contract_type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="permanent">Tetap</SelectItem>
                              <SelectItem value="contract">Kontrak</SelectItem>
                              <SelectItem value="daily_freelance">Harian Lepas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Menyimpan...' : 'Simpan Karyawan'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {employees.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada data karyawan</p>
                    ) : (
                      employees.map((employee: Employee) => (
                        <div key={employee.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{employee.full_name}</h3>
                            {getStatusBadge(employee.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>ID:</strong> {employee.employee_id}</p>
                              <p><strong>Email:</strong> {employee.email}</p>
                              <p><strong>Posisi:</strong> {employee.position}</p>
                            </div>
                            <div>
                              <p><strong>Departemen:</strong> {employee.department}</p>
                              <p><strong>Bergabung:</strong> {employee.hire_date.toLocaleDateString()}</p>
                              <p><strong>Gaji:</strong> {employee.salary ? `Rp ${employee.salary.toLocaleString()}` : 'Tidak ditetapkan'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recruitment Tab */}
          <TabsContent value="recruitment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Requests */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>📋 Permintaan Karyawan</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">Tambah Permintaan</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Permintaan Karyawan Baru</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateJobRequest} className="space-y-4">
                        <div>
                          <Label htmlFor="job_title">Judul Pekerjaan</Label>
                          <Input
                            id="job_title"
                            value={jobRequestForm.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setJobRequestForm((prev: CreateJobRequestInput) => ({ ...prev, title: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="job_department">Departemen</Label>
                            <Input
                              id="job_department"
                              value={jobRequestForm.department}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setJobRequestForm((prev: CreateJobRequestInput) => ({ ...prev, department: e.target.value }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="job_position">Posisi</Label>
                            <Input
                              id="job_position"
                              value={jobRequestForm.position}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                
                                setJobRequestForm((prev: CreateJobRequestInput) => ({ ...prev, position: e.target.value }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="required_count">Jumlah Dibutuhkan</Label>
                          <Input
                            id="required_count"
                            type="number"
                            min="1"
                            value={jobRequestForm.required_count}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setJobRequestForm((prev: CreateJobRequestInput) => ({ ...prev, required_count: parseInt(e.target.value) || 1 }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="job_description">Deskripsi Pekerjaan</Label>
                          <Textarea
                            id="job_description"
                            value={jobRequestForm.job_description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setJobRequestForm((prev: CreateJobRequestInput) => ({ ...prev, job_description: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="requirements">Persyaratan</Label>
                          <Textarea
                            id="requirements"
                            value={jobRequestForm.requirements}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setJobRequestForm((prev: CreateJobRequestInput) => ({ ...prev, requirements: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                          {isLoading ? 'Menyimpan...' : 'Buat Permintaan'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {jobRequests.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Belum ada permintaan karyawan</p>
                      ) : (
                        jobRequests.map((job: JobRequest) => (
                          <div key={job.id} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{job.title}</h4>
                              {getStatusBadge(job.status)}
                            </div>
                            <p className="text-sm text-gray-600">{job.department} - {job.position}</p>
                            <p className="text-sm text-gray-500">Dibutuhkan: {job.required_count} orang</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Job Applications */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>👤 Daftar Pelamar</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">Tambah Pelamar</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pelamar Baru</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateJobApplication} className="space-y-4">
                        <div>
                          <Label htmlFor="job_request_select">Pilih Lowongan</Label>
                          <Select
                            value={jobApplicationForm.job_request_id > 0 ? jobApplicationForm.job_request_id.toString() : ''}
                            onValueChange={(value: string) =>
                              setJobApplicationForm((prev: CreateJobApplicationInput) => ({ ...prev, job_request_id: parseInt(value) }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={openJobRequests.length > 0 ? "Pilih lowongan" : "Tidak ada lowongan tersedia"} />
                            </SelectTrigger>
                            <SelectContent>
                              {openJobRequests.map((job: JobRequest) => (
                                <SelectItem key={job.id} value={job.id.toString()}>
                                  {job.title} - {job.department}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="applicant_name">Nama Pelamar</Label>
                          <Input
                            id="applicant_name"
                            value={jobApplicationForm.applicant_name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setJobApplicationForm((prev: CreateJobApplicationInput) => ({ ...prev, applicant_name: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="applicant_email">Email</Label>
                            <Input
                              id="applicant_email"
                              type="email"
                              value={jobApplicationForm.email}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setJobApplicationForm((prev: CreateJobApplicationInput) => ({ ...prev, email: e.target.value }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="applicant_phone">Telepon</Label>
                            <Input
                              id="applicant_phone"
                              value={jobApplicationForm.phone}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setJobApplicationForm((prev: CreateJobApplicationInput) => ({ ...prev, phone: e.target.value }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="resume_url">URL Resume</Label>
                          <Input
                            id="resume_url"
                            value={jobApplicationForm.resume_url || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setJobApplicationForm((prev: CreateJobApplicationInput) => ({ ...prev, resume_url: e.target.value || null }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="cover_letter">Surat Lamaran</Label>
                          <Textarea
                            id="cover_letter"
                            value={jobApplicationForm.cover_letter || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setJobApplicationForm((prev: CreateJobApplicationInput) => ({ ...prev, cover_letter: e.target.value || null }))
                            }
                          />
                        </div>
                        <Button type="submit" disabled={isLoading || openJobRequests.length === 0} className="w-full">
                          {isLoading ? 'Menyimpan...' : 'Simpan Pelamar'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {jobApplications.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Belum ada pelamar</p>
                      ) : (
                        jobApplications.map((application: JobApplication) => (
                          <div key={application.id} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{application.applicant_name}</h4>
                              {getStatusBadge(application.status)}
                            </div>
                            <p className="text-sm text-gray-600">{application.email}</p>
                            <p className="text-sm text-gray-500">Melamar: {application.application_date.toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🏆 Evaluasi Kinerja Karyawan</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {performanceEvaluations.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada evaluasi kinerja</p>
                    ) : (
                      performanceEvaluations.map((evaluation: PerformanceEvaluation) => (
                        <div key={evaluation.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Evaluasi ID: {evaluation.id}</h3>
                            {getStatusBadge(evaluation.overall_rating)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Periode:</strong> {evaluation.evaluation_period_start.toLocaleDateString()} - {evaluation.evaluation_period_end.toLocaleDateString()}</p>
                              <p><strong>Pencapaian Target:</strong> {evaluation.goals_achievement}%</p>
                            </div>
                            <div>
                              <p><strong>Skor Kompetensi:</strong> {evaluation.competency_score}%</p>
                              <p><strong>Rating Keseluruhan:</strong> {evaluation.overall_rating}</p>
                            </div>
                          </div>
                          {evaluation.strengths && (
                            <div className="mt-2">
                              <p className="text-sm"><strong>Kelebihan:</strong> {evaluation.strengths}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📄 Manajemen Kontrak Kerja</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {contracts.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada kontrak kerja</p>
                    ) : (
                      contracts.map((contract: Contract) => (
                        <div key={contract.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Kontrak #{contract.id}</h3>
                            <Badge className={contract.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {contract.is_active ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Tipe:</strong> {contract.contract_type}</p>
                              <p><strong>Mulai:</strong> {contract.start_date.toLocaleDateString()}</p>
                              <p><strong>Berakhir:</strong> {contract.end_date ? contract.end_date.toLocaleDateString() : 'Tidak ditentukan'}</p>
                            </div>
                            <div>
                              <p><strong>Gaji:</strong> Rp {contract.salary.toLocaleString()}</p>
                              <p><strong>Dibuat:</strong> {contract.created_at.toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🎓 Program Pelatihan & Pengembangan</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {trainingPrograms.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada program pelatihan</p>
                    ) : (
                      trainingPrograms.map((training: TrainingProgram) => (
                        <div key={training.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{training.title}</h3>
                            {getStatusBadge(training.status)}
                          </div>
                          <p className="text-gray-600 mb-2">{training.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Pelatih:</strong> {training.trainer}</p>
                              <p><strong>Lokasi:</strong> {training.location || 'Online'}</p>
                            </div>
                            <div>
                              <p><strong>Mulai:</strong> {training.start_date.toLocaleDateString()}</p>
                              <p><strong>Selesai:</strong> {training.end_date.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2 text-sm">
                            <span>Max Peserta: {training.max_participants}</span>
                            <span>Biaya: {training.cost_per_participant ? `Rp ${training.cost_per_participant.toLocaleString()}` : 'Gratis'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>⏰ Manajemen Absensi & Kehadiran</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {attendance.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada data absensi</p>
                    ) : (
                      attendance.map((record: Attendance) => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Absensi #{record.id}</h3>
                            {getStatusBadge(record.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Tanggal:</strong> {record.date.toLocaleDateString()}</p>
                              <p><strong>Masuk:</strong> {record.check_in || 'Belum absen'}</p>
                              <p><strong>Keluar:</strong> {record.check_out || 'Belum absen'}</p>
                            </div>
                            <div>
                              <p><strong>Istirahat:</strong> {record.break_start && record.break_end ? `${record.break_start} - ${record.break_end}` : 'Tidak ada'}</p>
                              <p><strong>Total Jam:</strong> {record.total_hours || 0} jam</p>
                            </div>
                          </div>
                          {record.notes && (
                            <div className="mt-2">
                              <p className="text-sm"><strong>Catatan:</strong> {record.notes}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave & Overtime Tab */}
          <TabsContent value="leave" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overtime Requests */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>💼 Permintaan Lembur</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">Tambah Lembur</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Permintaan Lembur Baru</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateOvertimeRequest} className="space-y-4">
                        <div>
                          <Label htmlFor="overtime_employee">Karyawan</Label>
                          <Select
                            value={overtimeForm.employee_id > 0 ? overtimeForm.employee_id.toString() : ''}
                            onValueChange={(value: string) =>
                              setOvertimeForm((prev: CreateOvertimeRequestInput) => ({ ...prev, employee_id: parseInt(value) }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={activeEmployees.length > 0 ? "Pilih karyawan" : "Tidak ada karyawan aktif"} />
                            </SelectTrigger>
                            <SelectContent>
                              {activeEmployees.map((employee: Employee) => (
                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                  {employee.full_name} - {employee.position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="overtime_date">Tanggal</Label>
                          <Input
                            id="overtime_date"
                            type="date"
                            value={overtimeForm.date.toISOString().split('T')[0]}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setOvertimeForm((prev: CreateOvertimeRequestInput) => ({ ...prev, date: new Date(e.target.value) }))
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start_time">Jam Mulai</Label>
                            <Input
                              id="start_time"
                              type="time"
                              value={overtimeForm.start_time}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setOvertimeForm((prev: CreateOvertimeRequestInput) => ({ ...prev, start_time: e.target.value }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="end_time">Jam Selesai</Label>
                            <Input
                              id="end_time"
                              type="time"
                              value={overtimeForm.end_time}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setOvertimeForm((prev: CreateOvertimeRequestInput) => ({ ...prev, end_time: e.target.value }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="total_hours">Total Jam</Label>
                          <Input
                            id="total_hours"
                            type="number"
                            step="0.5"
                            min="0"
                            value={overtimeForm.total_hours}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setOvertimeForm((prev: CreateOvertimeRequestInput) => ({ ...prev, total_hours: parseFloat(e.target.value) || 0 }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="overtime_reason">Alasan</Label>
                          <Textarea
                            id="overtime_reason"
                            value={overtimeForm.reason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setOvertimeForm((prev: CreateOvertimeRequestInput) => ({ ...prev, reason: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading || activeEmployees.length === 0} className="w-full">
                          {isLoading ? 'Menyimpan...' : 'Ajukan Lembur'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {overtimeRequests.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Belum ada permintaan lembur</p>
                      ) : (
                        overtimeRequests.map((overtime: OvertimeRequest) => (
                          <div key={overtime.id} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Lembur #{overtime.id}</h4>
                              {getStatusBadge(overtime.status)}
                            </div>
                            <p className="text-sm text-gray-600">Tanggal: {overtime.date.toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">Waktu: {overtime.start_time} - {overtime.end_time}</p>
                            <p className="text-sm text-gray-500">Total: {overtime.total_hours} jam</p>
                            <p className="text-sm text-gray-500">Alasan: {overtime.reason}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Leave Requests */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>🏖️ Permintaan Izin/Cuti</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">Tambah Izin</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Permintaan Izin/Cuti Baru</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateLeaveRequest} className="space-y-4">
                        <div>
                          <Label htmlFor="leave_employee">Karyawan</Label>
                          <Select
                            value={leaveForm.employee_id > 0 ? leaveForm.employee_id.toString() : ''}
                            onValueChange={(value: string) =>
                              setLeaveForm((prev: CreateLeaveRequestInput) => ({ ...prev, employee_id: parseInt(value) }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={activeEmployees.length > 0 ? "Pilih karyawan" : "Tidak ada karyawan aktif"} />
                            </SelectTrigger>
                            <SelectContent>
                              {activeEmployees.map((employee: Employee) => (
                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                  {employee.full_name} - {employee.position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="leave_type">Tipe Izin</Label>
                          <Select
                            value={leaveForm.leave_type}
                            onValueChange={(value: 'annual' | 'sick' | 'maternity' | 'emergency' | 'unpaid') =>
                              setLeaveForm((prev: CreateLeaveRequestInput) => ({ ...prev, leave_type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="annual">Cuti Tahunan</SelectItem>
                              <SelectItem value="sick">Sakit</SelectItem>
                              <SelectItem value="maternity">Melahirkan</SelectItem>
                              <SelectItem value="emergency">Darurat</SelectItem>
                              <SelectItem value="unpaid">Tanpa Gaji</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start_date">Tanggal Mulai</Label>
                            <Input
                              id="start_date"
                              type="date"
                              value={leaveForm.start_date.toISOString().split('T')[0]}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setLeaveForm((prev: CreateLeaveRequestInput) => ({ ...prev, start_date: new Date(e.target.value) }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="end_date">Tanggal Selesai</Label>
                            <Input
                              id="end_date"
                              type="date"
                              value={leaveForm.end_date.toISOString().split('T')[0]}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setLeaveForm((prev: CreateLeaveRequestInput) => ({ ...prev, end_date: new Date(e.target.value) }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="total_days">Total Hari</Label>
                          <Input
                            id="total_days"
                            type="number"
                            min="1"
                            value={leaveForm.total_days}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setLeaveForm((prev: CreateLeaveRequestInput) => ({ ...prev, total_days: parseInt(e.target.value) || 1 }))
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="leave_reason">Alasan</Label>
                          <Textarea
                            id="leave_reason"
                            value={leaveForm.reason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              setLeaveForm((prev: CreateLeaveRequestInput) => ({ ...prev, reason: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading || activeEmployees.length === 0} className="w-full">
                          {isLoading ? 'Menyimpan...' : 'Ajukan Izin'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {leaveRequests.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Belum ada permintaan izin</p>
                      ) : (
                        leaveRequests.map((leave: LeaveRequest) => (
                          <div key={leave.id} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Izin #{leave.id}</h4>
                              {getStatusBadge(leave.status)}
                            </div>
                            <p className="text-sm text-gray-600">Tipe: {leave.leave_type}</p>
                            <p className="text-sm text-gray-600">
                              {leave.start_date.toLocaleDateString()} - {leave.end_date.toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">Durasi: {leave.total_days} hari</p>
                            <p className="text-sm text-gray-500">Alasan: {leave.reason}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
