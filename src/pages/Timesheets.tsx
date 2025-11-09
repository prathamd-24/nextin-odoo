import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Trash2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { getCurrentUser, getUserRole } from '@/lib/apiAuth';
import { getUserProjects, getUserTasks, getUserTimesheets, createTimesheet, ApiProject, ApiTask, CreateTimesheetRequest } from '@/lib/api';
import {
  MOCK_TIMESHEETS,
  MOCK_EMPLOYEE_RATES,
  MOCK_BILLING_POLICIES,
  MOCK_TEAM_MEMBERS,
  MOCK_PROJECTS,
  type Timesheet,
  type EmployeeRate,
  type ProjectBillingPolicy,
} from '@/lib/mockData';

export default function Timesheets() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userRole = currentUser ? getUserRole(currentUser) : null;

  // Redirect if not authorized
  if (!currentUser || !['admin', 'project_manager'].includes(userRole || '')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96 glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="text-danger">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">You don't have permission to view this page.</p>
            <Button onClick={() => navigate('/dashboard')} className="glass-button">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State for API data
  const [userProjects, setUserProjects] = useState<ApiProject[]>([]);
  const [userTasks, setUserTasks] = useState<ApiTask[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Local storage helpers
  const getLocalTimesheets = (): Timesheet[] => {
    try {
      const stored = sessionStorage.getItem('localTimesheets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

    const saveLocalTimesheets = (timesheetList: Timesheet[]) => {
    try {
      sessionStorage.setItem('localTimesheets', JSON.stringify(timesheetList));
    } catch (error) {
      console.error('Failed to save local timesheets:', error);
    }
  };

  const getLocalEmployeeRates = (): EmployeeRate[] => {
    try {
      const stored = sessionStorage.getItem('localEmployeeRates');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalEmployeeRates = (rates: EmployeeRate[]) => {
    try {
      sessionStorage.setItem('localEmployeeRates', JSON.stringify(rates));
    } catch (error) {
      console.error('Failed to save local employee rates:', error);
    }
  };

  const getLocalBillingPolicies = (): ProjectBillingPolicy[] => {
    try {
      const stored = sessionStorage.getItem('localBillingPolicies');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalBillingPolicies = (policies: ProjectBillingPolicy[]) => {
    try {
      sessionStorage.setItem('localBillingPolicies', JSON.stringify(policies));
    } catch (error) {
      console.error('Failed to save local billing policies:', error);
    }
  };

  const updateLocalTimesheet = (id: string, updates: Partial<Timesheet>) => {
    try {
      const existing = getLocalTimesheets();
      const updated = existing.map(ts => 
        ts.id === id ? { ...ts, ...updates } : ts
      );
      sessionStorage.setItem('localTimesheets', JSON.stringify(updated));
      
      // Update the displayed timesheets as well
      setTimesheets(prev => prev.map(ts => 
        ts.id === id ? { ...ts, ...updates } : ts
      ));
    } catch (error) {
      console.error('Failed to update local timesheet:', error);
    }
  };

  // Legacy state for demo functionality
  const [employeeRates, setEmployeeRates] = useState<EmployeeRate[]>(() => {
    const localRates = getLocalEmployeeRates();
    return [...MOCK_EMPLOYEE_RATES, ...localRates];
  });
  const [billingPolicies, setBillingPolicies] = useState<ProjectBillingPolicy[]>(() => {
    const localPolicies = getLocalBillingPolicies();
    return [...MOCK_BILLING_POLICIES, ...localPolicies];
  });

  // Fetch user's projects, tasks, and timesheets
  useEffect(() => {
    if (currentUser?.id) {
      setIsLoadingData(true);
      Promise.all([
        getUserProjects(currentUser.id),
        getUserTasks(currentUser.id),
        getUserTimesheets(currentUser.id)
      ])
        .then(([projectsData, tasksData, timesheetsData]) => {
          // Combine managed and member projects
          const allProjects = [...projectsData.managed_projects, ...projectsData.member_projects];
          setUserProjects(allProjects);
          setUserTasks(tasksData.assigned_tasks);
          
          // Convert API timesheets to mock format for display
          const convertedTimesheets = timesheetsData.timesheets.map(apiTimesheet => ({
            id: apiTimesheet.id.toString(),
            user_id: apiTimesheet.user_id.toString(),
            project_id: apiTimesheet.project_id.toString(),
            task_id: apiTimesheet.task_id?.toString() || null,
            work_date: apiTimesheet.work_date,
            hours: apiTimesheet.hours,
            hourly_rate: apiTimesheet.internal_cost_rate || 0,
            description: apiTimesheet.notes || '',
            billable: apiTimesheet.billable,
            status: apiTimesheet.status,
            created_at: apiTimesheet.created_at,
            submitted_at: null,
            approved_at: null,
            rejected_at: null,
            rejection_reason: null,
            user_name: 'Current User',
            project_name: allProjects.find(p => p.id === apiTimesheet.project_id)?.name || 'Unknown Project'
          }));
          
          // Combine API timesheets with local timesheets and mock data
          const localTimesheets = getLocalTimesheets();
          const combinedTimesheets = [...convertedTimesheets, ...localTimesheets, ...MOCK_TIMESHEETS];
          setTimesheets(combinedTimesheets);
        })
        .catch((error) => {
          console.error('Failed to fetch data:', error);
          // Fallback to mock projects - convert to ApiProject format
          const mockProjects: ApiProject[] = MOCK_PROJECTS.map((p, index) => ({
            id: index + 1,
            project_code: p.project_code,
            name: p.name,
            description: p.description || '',
            role: 'Project Manager',
            status: p.status === 'in_progress' ? 'active' : p.status,
            start_date: p.start_date,
            end_date: p.end_date,
            budget_amount: p.budget_amount
          }));
          setUserProjects(mockProjects);
          setUserTasks([]);
          
          // Use local timesheets + mock data when API fails
          const localTimesheets = getLocalTimesheets();
          const combinedTimesheets = [...localTimesheets, ...MOCK_TIMESHEETS];
          setTimesheets(combinedTimesheets);
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [currentUser?.id]);

  // Timesheets will be fetched from API or fallback to mock data

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Dialogs
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    timesheet: Timesheet | null;
    action: 'approve' | 'reject' | null;
  }>({ open: false, timesheet: null, action: null });
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const [rateDialog, setRateDialog] = useState<{
    open: boolean;
    rate: EmployeeRate | null;
    mode: 'add' | 'edit';
  }>({ open: false, rate: null, mode: 'add' });

  const [policyDialog, setPolicyDialog] = useState<{
    open: boolean;
    policy: ProjectBillingPolicy | null;
    mode: 'add' | 'edit';
  }>({ open: false, policy: null, mode: 'add' });

  const [createTimesheetDialog, setCreateTimesheetDialog] = useState(false);
  const [newTimesheet, setNewTimesheet] = useState({
    project_id: 0,
    task_id: 0,
    work_date: new Date().toISOString().split('T')[0],
    hours: 0,
    billable: true,
    notes: '',
  });

  const [newRate, setNewRate] = useState({
    user_id: '',
    user_name: '',
    role: '',
    hourly_rate: 0,
    currency: 'INR',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    is_active: true,
  });

  const [newPolicy, setNewPolicy] = useState({
    project_id: '',
    project_name: '',
    billable_by_default: true,
    overtime_multiplier: 1.5,
    requires_approval: false,
    approval_threshold_hours: 8,
  });

  // Calculate statistics
  const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
  const pendingApproval = timesheets.filter((ts) => ts.status === 'submitted').length;
  const totalRevenue = timesheets
    .filter((ts) => ts.billable && ts.status === 'approved')
    .reduce((sum, ts) => sum + ts.hours * (ts.hourly_rate || 0), 0);

  // Filter timesheets
  const filteredTimesheets = timesheets.filter((ts) => {
    if (statusFilter !== 'all' && ts.status !== statusFilter) return false;
    if (employeeFilter !== 'all' && ts.user_id !== employeeFilter) return false;
    if (projectFilter !== 'all' && ts.project_id !== projectFilter) return false;
    if (searchTerm && !ts.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  const handleApproval = (timesheet: Timesheet, action: 'approve' | 'reject') => {
    setApprovalDialog({ open: true, timesheet, action });
    setRejectionReason('');
  };

  const confirmApproval = () => {
    if (!approvalDialog.timesheet) return;

    const updates: Partial<Timesheet> = {
      status: approvalDialog.action === 'approve' ? 'approved' : 'rejected',
      reviewed_by: currentUser?.name || 'Current User',
      reviewed_at: new Date().toISOString()
    };

    if (approvalDialog.action === 'reject') {
      updates.rejection_reason = rejectionReason;
    }

    // Update the timesheet locally
    updateLocalTimesheet(approvalDialog.timesheet.id, updates);
    
    setApprovalDialog({ open: false, timesheet: null, action: null });
  };

  const handleAddRate = () => {
    setNewRate({
      user_id: '',
      user_name: '',
      role: '',
      hourly_rate: 0,
      currency: 'INR',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      is_active: true,
    });
    setRateDialog({ open: true, rate: null, mode: 'add' });
  };

  const handleEditRate = (rate: EmployeeRate) => {
    setNewRate({
      user_id: rate.user_id,
      user_name: rate.user_name,
      role: rate.role,
      hourly_rate: rate.hourly_rate,
      currency: rate.currency,
      effective_from: rate.effective_from,
      effective_to: rate.effective_to || '',
      is_active: rate.is_active,
    });
    setRateDialog({ open: true, rate, mode: 'edit' });
  };

  const handleSaveRate = () => {
    if (!newRate.user_name || !newRate.role || newRate.hourly_rate <= 0) {
      return;
    }

    const rateData: EmployeeRate = {
      id: rateDialog.mode === 'edit' && rateDialog.rate ? rateDialog.rate.id : `rate-${Date.now()}`,
      user_id: newRate.user_id || `user-${Date.now()}`,
      user_name: newRate.user_name,
      role: newRate.role,
      hourly_rate: newRate.hourly_rate,
      currency: newRate.currency,
      effective_from: newRate.effective_from,
      effective_to: newRate.effective_to || undefined,
      is_active: newRate.is_active,
      created_at: rateDialog.mode === 'edit' && rateDialog.rate ? rateDialog.rate.created_at : new Date().toISOString(),
    };

    if (rateDialog.mode === 'edit' && rateDialog.rate) {
      // Edit existing rate
      setEmployeeRates(prev => 
        prev.map(rate => rate.id === rateDialog.rate!.id ? rateData : rate)
      );
    } else {
      // Add new rate
      setEmployeeRates(prev => [...prev, rateData]);
      // Save to local storage
      const localRates = getLocalEmployeeRates();
      saveLocalEmployeeRates([...localRates, rateData]);
    }

    setRateDialog({ open: false, rate: null, mode: 'add' });
  };

  const handleDeleteRate = (rateId: string) => {
    setEmployeeRates((prev) => prev.filter((r) => r.id !== rateId));
    // Also remove from local storage if it exists there
    const localRates = getLocalEmployeeRates();
    const updatedLocalRates = localRates.filter(r => r.id !== rateId);
    saveLocalEmployeeRates(updatedLocalRates);
  };

  const handleAddPolicy = () => {
    setNewPolicy({
      project_id: '',
      project_name: '',
      billable_by_default: true,
      overtime_multiplier: 1.5,
      requires_approval: false,
      approval_threshold_hours: 8,
    });
    setPolicyDialog({ open: true, policy: null, mode: 'add' });
  };

  const handleEditPolicy = (policy: ProjectBillingPolicy) => {
    setNewPolicy({
      project_id: policy.project_id,
      project_name: policy.project_name || '',
      billable_by_default: policy.billable_by_default,
      overtime_multiplier: policy.overtime_multiplier,
      requires_approval: policy.requires_approval,
      approval_threshold_hours: policy.approval_threshold_hours,
    });
    setPolicyDialog({ open: true, policy, mode: 'edit' });
  };

  const handleSavePolicy = () => {
    if (!newPolicy.project_name || newPolicy.overtime_multiplier <= 0) {
      return;
    }

    const policyData: ProjectBillingPolicy = {
      id: policyDialog.mode === 'edit' && policyDialog.policy ? policyDialog.policy.id : `policy-${Date.now()}`,
      project_id: newPolicy.project_id || `project-${Date.now()}`,
      project_name: newPolicy.project_name,
      billable_by_default: newPolicy.billable_by_default,
      overtime_multiplier: newPolicy.overtime_multiplier,
      requires_approval: newPolicy.requires_approval,
      approval_threshold_hours: newPolicy.approval_threshold_hours,
      created_at: policyDialog.mode === 'edit' && policyDialog.policy ? policyDialog.policy.created_at : new Date().toISOString(),
    };

    if (policyDialog.mode === 'edit' && policyDialog.policy) {
      // Edit existing policy
      setBillingPolicies(prev => 
        prev.map(policy => policy.id === policyDialog.policy!.id ? policyData : policy)
      );
    } else {
      // Add new policy
      setBillingPolicies(prev => [...prev, policyData]);
      // Save to local storage
      const localPolicies = getLocalBillingPolicies();
      saveLocalBillingPolicies([...localPolicies, policyData]);
    }

    setPolicyDialog({ open: false, policy: null, mode: 'add' });
  };

  const handleDeletePolicy = (policyId: string) => {
    setBillingPolicies((prev) => prev.filter((p) => p.id !== policyId));
    // Also remove from local storage if it exists there
    const localPolicies = getLocalBillingPolicies();
    const updatedLocalPolicies = localPolicies.filter(p => p.id !== policyId);
    saveLocalBillingPolicies(updatedLocalPolicies);
  };

  const handleCreateTimesheet = async () => {
    if (newTimesheet.project_id && newTimesheet.work_date && newTimesheet.hours > 0) {
      try {
        // Try to create via API first
        const createData: CreateTimesheetRequest = {
          project_id: newTimesheet.project_id,
          task_id: newTimesheet.task_id || 0,
          work_date: newTimesheet.work_date,
          hours: newTimesheet.hours,
          billable: newTimesheet.billable,
          notes: newTimesheet.notes,
        };
        
        await createTimesheet(createData);
        
        // Refresh from API if successful
        if (currentUser?.id) {
          const timesheetsData = await getUserTimesheets(currentUser.id);
          const convertedTimesheets = timesheetsData.timesheets.map(apiTimesheet => ({
            id: apiTimesheet.id.toString(),
            user_id: apiTimesheet.user_id.toString(),
            project_id: apiTimesheet.project_id.toString(),
            task_id: apiTimesheet.task_id?.toString() || null,
            work_date: apiTimesheet.work_date,
            hours: apiTimesheet.hours,
            hourly_rate: apiTimesheet.internal_cost_rate || 0,
            description: apiTimesheet.notes || '',
            billable: apiTimesheet.billable,
            status: apiTimesheet.status,
            created_at: apiTimesheet.created_at,
            submitted_at: null,
            approved_at: null,
            rejected_at: null,
            rejection_reason: null,
            user_name: 'Current User',
            project_name: userProjects.find(p => p.id === apiTimesheet.project_id)?.name || 'Unknown Project'
          }));
          
          const localTimesheets = getLocalTimesheets();
          const combinedTimesheets = [...convertedTimesheets, ...localTimesheets, ...MOCK_TIMESHEETS];
          setTimesheets(combinedTimesheets);
        }
      } catch (error) {
        // If API fails, save locally
        const selectedProject = userProjects.find(p => p.id === newTimesheet.project_id) || 
                               MOCK_PROJECTS.find(p => parseInt(p.id) === newTimesheet.project_id);
        const selectedTask = userTasks.find(t => t.id === newTimesheet.task_id);
        
        const localTimesheet: Timesheet = {
          id: `local-${Date.now()}`,
          user_id: currentUser?.id?.toString() || '1',
          project_id: newTimesheet.project_id.toString(),
          task_id: newTimesheet.task_id ? newTimesheet.task_id.toString() : null,
          work_date: newTimesheet.work_date,
          hours: newTimesheet.hours,
          hourly_rate: 1200, // Default rate - you can modify this
          description: newTimesheet.notes,
          billable: newTimesheet.billable,
          status: 'draft',
          created_at: new Date().toISOString(),
          submitted_at: undefined,
          reviewed_by: undefined,
          reviewed_at: undefined,
          rejection_reason: undefined,
          user_name: currentUser?.name || 'Current User',
          project_name: selectedProject?.name || 'Unknown Project'
        };
        
        // Save to local storage
        saveLocalTimesheets([...getLocalTimesheets(), localTimesheet]);
        
        // Update display
        setTimesheets(prev => [localTimesheet, ...prev]);
      }
      
      // Reset form and close dialog
      setCreateTimesheetDialog(false);
      setNewTimesheet({
        project_id: 0,
        task_id: 0,
        work_date: new Date().toISOString().split('T')[0],
        hours: 0,
        billable: true,
        notes: '',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-300',
      submitted: 'bg-yellow-500/20 text-yellow-300',
      approved: 'bg-green-500/20 text-green-300',
      rejected: 'bg-red-500/20 text-red-300',
    };
    return (
      <Badge className={variants[status] || variants.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Timesheet Management</h1>
        <p className="text-gray-400">
          Manage timesheets, employee rates, and billing policies
        </p>
      </div>

      <Tabs defaultValue="timesheets" className="space-y-6">
        <TabsList className="glass-panel">
          <TabsTrigger value="timesheets">
            <Clock className="w-4 h-4 mr-2" />
            Timesheets
          </TabsTrigger>
          <TabsTrigger value="rates">
            <DollarSign className="w-4 h-4 mr-2" />
            Employee Rates
          </TabsTrigger>
          <TabsTrigger value="policies">
            <FileText className="w-4 h-4 mr-2" />
            Billing Policies
          </TabsTrigger>
        </TabsList>

        {/* Timesheets Tab */}
        <TabsContent value="timesheets" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Across all timesheets</p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApproval}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From billable hours</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="glass-panel">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-gray-400 mb-2 block">Search</Label>
                  <Input
                    placeholder="Search description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-400 mb-2 block">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-400 mb-2 block">Employee</Label>
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {MOCK_TEAM_MEMBERS.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-400 mb-2 block">Project</Label>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {MOCK_PROJECTS.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timesheets Table */}
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Timesheets ({filteredTimesheets.length})</CardTitle>
              <Button 
                onClick={() => setCreateTimesheetDialog(true)}
                className="glass-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Timesheet
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTimesheets.map((timesheet) => (
                    <TableRow key={timesheet.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(timesheet.work_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{timesheet.user_name || 'Unknown'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {timesheet.project_name || 'N/A'}
                      </TableCell>
                      <TableCell>{timesheet.hours}</TableCell>
                      <TableCell>
                        {timesheet.hourly_rate
                          ? `₹${timesheet.hourly_rate}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {timesheet.hourly_rate
                          ? `₹${(timesheet.hours * timesheet.hourly_rate).toLocaleString()}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {timesheet.billable ? (
                          <Badge className="bg-green-500/20 text-green-300">Yes</Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-300">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {timesheet.status === 'submitted' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2"
                                onClick={() => handleApproval(timesheet, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2"
                                onClick={() => handleApproval(timesheet, 'reject')}
                              >
                                <XCircle className="w-4 h-4 text-red-400" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Employee Hourly Rates</CardTitle>
              <Button onClick={handleAddRate} className="gradient-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Rate
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Effective To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.user_name}</TableCell>
                      <TableCell>{rate.role}</TableCell>
                      <TableCell>
                        {rate.currency} {rate.hourly_rate}
                      </TableCell>
                      <TableCell>
                        {new Date(rate.effective_from).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {rate.effective_to
                          ? new Date(rate.effective_to).toLocaleDateString()
                          : 'Present'}
                      </TableCell>
                      <TableCell>
                        {rate.is_active ? (
                          <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-300">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => handleEditRate(rate)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => handleDeleteRate(rate.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Billing Policies</CardTitle>
              <Button onClick={handleAddPolicy} className="gradient-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Policy
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Billable by Default</TableHead>
                    <TableHead>Overtime Multiplier</TableHead>
                    <TableHead>Requires Approval</TableHead>
                    <TableHead>Approval Threshold</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>{policy.project_name || 'Unknown Project'}</TableCell>
                      <TableCell>
                        {policy.billable_by_default ? (
                          <Badge className="bg-green-500/20 text-green-300">Yes</Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-300">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{policy.overtime_multiplier}x</TableCell>
                      <TableCell>
                        {policy.requires_approval ? (
                          <Badge className="bg-yellow-500/20 text-yellow-300">Yes</Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-300">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{policy.approval_threshold_hours} hours</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => handleEditPolicy(policy)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => handleDeletePolicy(policy.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog.open} onOpenChange={(open) => !open && setApprovalDialog({ open: false, timesheet: null, action: null })}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>
              {approvalDialog.action === 'approve' ? 'Approve' : 'Reject'} Timesheet
            </DialogTitle>
            <DialogDescription>
              {approvalDialog.action === 'approve'
                ? 'Approve this timesheet entry?'
                : 'Please provide a reason for rejection:'}
            </DialogDescription>
          </DialogHeader>

          {approvalDialog.action === 'reject' && (
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="glass-input"
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setApprovalDialog({ open: false, timesheet: null, action: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApproval}
              className={
                approvalDialog.action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {approvalDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Timesheet Dialog */}
      <Dialog open={createTimesheetDialog} onOpenChange={setCreateTimesheetDialog}>
        <DialogContent className="glass-panel max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Timesheet</DialogTitle>
            <DialogDescription>
              Add a new timesheet entry for your work
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Project</Label>
              <Select 
                value={newTimesheet.project_id.toString()} 
                onValueChange={(value) => setNewTimesheet({...newTimesheet, project_id: parseInt(value)})}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Task (Optional)</Label>
              <Select 
                value={newTimesheet.task_id.toString()} 
                onValueChange={(value) => setNewTimesheet({...newTimesheet, task_id: parseInt(value)})}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No specific task</SelectItem>
                  {userTasks
                    .filter(task => !newTimesheet.project_id || task.project_id === newTimesheet.project_id)
                    .map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Work Date</Label>
              <Input
                type="date"
                value={newTimesheet.work_date}
                onChange={(e) => setNewTimesheet({...newTimesheet, work_date: e.target.value})}
                className="glass-input"
              />
            </div>

            <div>
              <Label>Hours Worked</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={newTimesheet.hours || ''}
                onChange={(e) => setNewTimesheet({...newTimesheet, hours: parseFloat(e.target.value) || 0})}
                placeholder="Enter hours worked"
                className="glass-input"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newTimesheet.notes}
                onChange={(e) => setNewTimesheet({...newTimesheet, notes: e.target.value})}
                placeholder="Describe the work done..."
                className="glass-input"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="billable"
                checked={newTimesheet.billable}
                onCheckedChange={(checked) => setNewTimesheet({...newTimesheet, billable: !!checked})}
              />
              <Label htmlFor="billable" className="text-sm">Billable time</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateTimesheetDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTimesheet}
              className="glass-button"
              disabled={!newTimesheet.project_id || !newTimesheet.work_date || newTimesheet.hours <= 0}
            >
              Create Timesheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Rate Dialog */}
      <Dialog open={rateDialog.open} onOpenChange={(open) => setRateDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="glass-panel max-w-md">
          <DialogHeader>
            <DialogTitle>
              {rateDialog.mode === 'add' ? 'Add Employee Rate' : 'Edit Employee Rate'}
            </DialogTitle>
            <DialogDescription>
              Set hourly rates for employees
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Employee Name</Label>
              <Input
                value={newRate.user_name}
                onChange={(e) => setNewRate({ ...newRate, user_name: e.target.value })}
                placeholder="Enter employee name"
                className="glass-input"
              />
            </div>

            <div>
              <Label>Role</Label>
              <Select 
                value={newRate.role} 
                onValueChange={(value) => setNewRate({ ...newRate, role: value })}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="QA Tester">QA Tester</SelectItem>
                  <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                  <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Hourly Rate</Label>
              <div className="flex gap-2">
                <Select 
                  value={newRate.currency} 
                  onValueChange={(value) => setNewRate({ ...newRate, currency: value })}
                >
                  <SelectTrigger className="glass-input w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹</SelectItem>
                    <SelectItem value="USD">$</SelectItem>
                    <SelectItem value="EUR">€</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="50"
                  value={newRate.hourly_rate || ''}
                  onChange={(e) => setNewRate({ ...newRate, hourly_rate: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter rate"
                  className="glass-input flex-1"
                />
              </div>
            </div>

            <div>
              <Label>Effective From</Label>
              <Input
                type="date"
                value={newRate.effective_from}
                onChange={(e) => setNewRate({ ...newRate, effective_from: e.target.value })}
                className="glass-input"
              />
            </div>

            <div>
              <Label>Effective To (Optional)</Label>
              <Input
                type="date"
                value={newRate.effective_to}
                onChange={(e) => setNewRate({ ...newRate, effective_to: e.target.value })}
                className="glass-input"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={newRate.is_active}
                onCheckedChange={(checked) => setNewRate({ ...newRate, is_active: !!checked })}
              />
              <Label htmlFor="is_active" className="text-sm">Active rate</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRateDialog({ open: false, rate: null, mode: 'add' })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRate}
              className="glass-button"
              disabled={!newRate.user_name || !newRate.role || newRate.hourly_rate <= 0}
            >
              {rateDialog.mode === 'add' ? 'Add Rate' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Policy Dialog */}
      <Dialog open={policyDialog.open} onOpenChange={(open) => setPolicyDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="glass-panel max-w-md">
          <DialogHeader>
            <DialogTitle>
              {policyDialog.mode === 'add' ? 'Add Billing Policy' : 'Edit Billing Policy'}
            </DialogTitle>
            <DialogDescription>
              Configure billing settings for projects
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Project Name</Label>
              <Select 
                value={newPolicy.project_name} 
                onValueChange={(value) => {
                  const selectedProject = [...userProjects, ...MOCK_PROJECTS].find(p => p.name === value);
                  setNewPolicy({ 
                    ...newPolicy, 
                    project_name: value,
                    project_id: selectedProject ? selectedProject.id.toString() : `project-${Date.now()}`
                  });
                }}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                  {MOCK_PROJECTS.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="billable_by_default"
                checked={newPolicy.billable_by_default}
                onCheckedChange={(checked) => setNewPolicy({ ...newPolicy, billable_by_default: !!checked })}
              />
              <Label htmlFor="billable_by_default" className="text-sm">Billable by default</Label>
            </div>

            <div>
              <Label>Overtime Multiplier</Label>
              <Input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={newPolicy.overtime_multiplier || ''}
                onChange={(e) => setNewPolicy({ ...newPolicy, overtime_multiplier: parseFloat(e.target.value) || 1.5 })}
                placeholder="1.5"
                className="glass-input"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requires_approval"
                checked={newPolicy.requires_approval}
                onCheckedChange={(checked) => setNewPolicy({ ...newPolicy, requires_approval: !!checked })}
              />
              <Label htmlFor="requires_approval" className="text-sm">Requires approval</Label>
            </div>

            <div>
              <Label>Approval Threshold (Hours)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={newPolicy.approval_threshold_hours || ''}
                onChange={(e) => setNewPolicy({ ...newPolicy, approval_threshold_hours: parseInt(e.target.value) || 8 })}
                placeholder="8"
                className="glass-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setPolicyDialog({ open: false, policy: null, mode: 'add' })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePolicy}
              className="glass-button"
              disabled={!newPolicy.project_name || newPolicy.overtime_multiplier <= 0}
            >
              {policyDialog.mode === 'add' ? 'Add Policy' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
