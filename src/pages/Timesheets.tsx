import { useState } from 'react';
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
import { getCurrentUser } from '@/lib/mockAuth';
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

  // Redirect if not authorized
  if (!currentUser || !['admin', 'project_manager'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96 glass-panel">
          <CardHeader>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You don't have permission to view this page.</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [timesheets] = useState<Timesheet[]>(MOCK_TIMESHEETS);
  const [employeeRates, setEmployeeRates] = useState<EmployeeRate[]>(MOCK_EMPLOYEE_RATES);
  const [billingPolicies, setBillingPolicies] = useState<ProjectBillingPolicy[]>(
    MOCK_BILLING_POLICIES
  );

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
    // In real app, send API request
    console.log('Approval action:', approvalDialog.action, approvalDialog.timesheet?.id);
    if (approvalDialog.action === 'reject') {
      console.log('Rejection reason:', rejectionReason);
    }
    setApprovalDialog({ open: false, timesheet: null, action: null });
  };

  const handleAddRate = () => {
    setRateDialog({ open: true, rate: null, mode: 'add' });
  };

  const handleEditRate = (rate: EmployeeRate) => {
    setRateDialog({ open: true, rate, mode: 'edit' });
  };

  const handleDeleteRate = (rateId: string) => {
    setEmployeeRates((prev) => prev.filter((r) => r.id !== rateId));
  };

  const handleAddPolicy = () => {
    setPolicyDialog({ open: true, policy: null, mode: 'add' });
  };

  const handleEditPolicy = (policy: ProjectBillingPolicy) => {
    setPolicyDialog({ open: true, policy, mode: 'edit' });
  };

  const handleDeletePolicy = (policyId: string) => {
    setBillingPolicies((prev) => prev.filter((p) => p.id !== policyId));
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
            <CardHeader>
              <CardTitle>Timesheets ({filteredTimesheets.length})</CardTitle>
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
    </div>
  );
}
