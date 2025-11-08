import { useState } from 'react';
import { getCurrentUser } from '@/lib/mockAuth';
import {
  MOCK_PROJECTS,
  MOCK_TASKS,
  MOCK_INVOICES,
  MOCK_EXPENSES,
  MOCK_TEAM_MEMBERS,
} from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BarChart3,
  Clock,
  Folder,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WidgetVisibility {
  projects: boolean;
  tasks: boolean;
  revenue: boolean;
  expenses: boolean;
  team: boolean;
  budget: boolean;
}

export default function AdminDashboard() {
  const user = getCurrentUser();

  // Widget visibility state
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>({
    projects: true,
    tasks: true,
    revenue: true,
    expenses: true,
    team: true,
    budget: true,
  });

  // Calculate KPIs
  const totalProjects = MOCK_PROJECTS.length;
  const activeProjects = MOCK_PROJECTS.filter((p) => p.status === 'in_progress').length;
  const completedProjects = MOCK_PROJECTS.filter((p) => p.status === 'completed').length;
  const plannedProjects = MOCK_PROJECTS.filter((p) => p.status === 'planned').length;

  const totalTasks = MOCK_TASKS.length;
  const completedTasks = MOCK_TASKS.filter((t) => t.state === 'done').length;
  const delayedTasks = MOCK_TASKS.filter(
    (t) => new Date(t.due_date) < new Date() && t.state !== 'done'
  ).length;
  const inProgressTasks = MOCK_TASKS.filter((t) => t.state === 'in_progress').length;

  const totalRevenue = MOCK_INVOICES.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const pendingRevenue = MOCK_INVOICES.reduce(
    (sum, inv) => sum + (inv.total_amount - inv.paid_amount),
    0
  );

  const totalBudget = MOCK_PROJECTS.reduce((sum, p) => sum + p.budget_amount, 0);
  const budgetSpent = MOCK_PROJECTS.reduce((sum, p) => sum + p.budget_spent, 0);
  const budgetUtilization = (budgetSpent / totalBudget) * 100;

  const totalExpenses = MOCK_EXPENSES.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = MOCK_EXPENSES.filter((e) => e.status === 'submitted').length;

  const totalTeamMembers = MOCK_TEAM_MEMBERS.length;

  const toggleWidget = (widget: keyof WidgetVisibility) => {
    setWidgetVisibility((prev) => ({
      ...prev,
      [widget]: !prev[widget],
    }));
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_progress: 'bg-accent-1/20 text-accent-1 border-accent-1/30',
      planned: 'bg-accent-2/20 text-accent-2 border-accent-2/30',
      on_hold: 'bg-muted text-muted-foreground border-border',
      completed: 'bg-success/20 text-success border-success/30',
      cancelled: 'bg-danger/20 text-danger border-danger/30',
    };
    return colors[status] || '';
  };

  return (
    <div className="space-y-8 p-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name} - Global overview of all operations
          </p>
        </div>

        {/* Widget Management Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Manage Widgets
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-glass-border">
            <DialogHeader>
              <DialogTitle>Dashboard Widget Settings</DialogTitle>
              <DialogDescription>
                Show or hide dashboard widgets and analytics cards
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {Object.entries(widgetVisibility).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                    {value ? (
                      <Eye className="w-4 h-4 text-success" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="capitalize">{key} Widget</span>
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={() => toggleWidget(key as keyof WidgetVisibility)}
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgetVisibility.projects && (
          <Card className="glass-card border-glass-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
              <Folder className="w-4 h-4 text-accent-1" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalProjects}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {activeProjects} Active
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {completedProjects} Done
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-success" />
                +2 from last month
              </p>
            </CardContent>
          </Card>
        )}

        {widgetVisibility.tasks && (
          <Card className="glass-card border-glass-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasks Overview
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalTasks}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {inProgressTasks} In Progress
                </Badge>
                {delayedTasks > 0 && (
                  <Badge variant="outline" className="text-xs text-danger">
                    {delayedTasks} Delayed
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {completedTasks} completed ({((completedTasks / totalTasks) * 100).toFixed(0)}%)
              </p>
            </CardContent>
          </Card>
        )}

        {widgetVisibility.revenue && (
          <Card className="glass-card border-glass-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue (YTD)
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">
                  Pending: {formatCurrency(pendingRevenue)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-success" />
                +12% from last quarter
              </p>
            </CardContent>
          </Card>
        )}

        {widgetVisibility.budget && (
          <Card className="glass-card border-glass-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Budget Utilization
              </CardTitle>
              <DollarSign className="w-4 h-4 text-accent-2" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {budgetUtilization.toFixed(0)}%
              </div>
              <Progress value={budgetUtilization} className="h-2 mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {formatCurrency(budgetSpent)} of {formatCurrency(totalBudget)} spent
              </p>
            </CardContent>
          </Card>
        )}

        {widgetVisibility.expenses && (
          <Card className="glass-card border-glass-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(totalExpenses)}
              </div>
              {pendingExpenses > 0 && (
                <Badge variant="outline" className="text-xs mt-2">
                  {pendingExpenses} Pending Approval
                </Badge>
              )}
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-danger" />
                +5% from last month
              </p>
            </CardContent>
          </Card>
        )}

        {widgetVisibility.team && (
          <Card className="glass-card border-glass-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Members
              </CardTitle>
              <Users className="w-4 h-4 text-accent-1" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalTeamMembers}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all projects
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Projects Status Overview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Project Status Overview</h2>
          <Button variant="outline" size="sm">
            View All Projects
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROJECTS.map((project) => (
            <Card
              key={project.id}
              className="glass-card border-glass-border hover:translate-y-[-2px] transition-all duration-smooth"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">{project.name}</CardTitle>
                    <CardDescription className="text-accent-1 font-mono text-sm">
                      {project.project_code}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Budget</p>
                    <p className="text-foreground font-medium">
                      {formatCurrency(project.budget_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Spent</p>
                    <p className="text-foreground font-medium">
                      {formatCurrency(project.budget_spent)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-xs mb-1">Manager</p>
                  <p className="text-foreground text-sm">{project.project_manager_name}</p>
                </div>

                <div className="pt-2 border-t border-glass-border">
                  <p className="text-muted-foreground text-xs mb-2">Team: {project.team_member_ids.length} members</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="text-xs glass px-2 py-1 rounded-full">
                      SO, PO, Invoices
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Administrative shortcuts and controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Folder className="w-4 h-4" />
              Create New Project
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Users className="w-4 h-4" />
              Manage Team Members
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
