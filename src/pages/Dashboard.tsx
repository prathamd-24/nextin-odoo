import { useState } from 'react';
import { getCurrentUser } from '@/lib/mockAuth';
import { MOCK_PROJECTS, MOCK_TASKS } from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Clock, Folder, TrendingUp, CheckSquare } from 'lucide-react';

type ProjectStatusFilter = 'all' | 'planned' | 'in_progress' | 'completed' | 'on_hold';

export default function Dashboard() {
  const user = getCurrentUser();
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all');
  
  // For team members, filter only assigned projects
  const userProjects = user?.role === 'team_member' 
    ? MOCK_PROJECTS.filter(p => p.team_member_ids.includes(user.id))
    : MOCK_PROJECTS;
  
  // Apply status filter
  const filteredProjects = statusFilter === 'all' 
    ? userProjects 
    : userProjects.filter(p => p.status === statusFilter);
  
  // For team members, filter only assigned tasks
  const userTasks = user?.role === 'team_member'
    ? MOCK_TASKS.filter(t => t.assignee_ids.includes(user.id))
    : MOCK_TASKS;
  
  const activeProjects = userProjects.filter(p => p.status === 'in_progress').length;
  const myTasks = userTasks.filter(t => t.state !== 'done').length;
  const delayedTasks = userTasks.filter(t => 
    new Date(t.due_date) < new Date() && t.state !== 'done'
  ).length;
  const hoursLogged = 24; // Mock data - would come from timesheets
  const revenueEarned = 85000; // Mock data - only shown for non-team-members

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_progress: 'bg-accent-1/20 text-accent-1 border-accent-1/30',
      planned: 'bg-accent-2/20 text-accent-2 border-accent-2/30',
      on_hold: 'bg-muted text-muted-foreground border-border',
      completed: 'bg-success/20 text-success border-success/30',
    };
    return colors[status] || '';
  };

  const getFilterButtonClass = (filter: ProjectStatusFilter) => {
    return statusFilter === filter
      ? 'bg-accent-1/20 text-accent-1 border-accent-1/30'
      : 'bg-glass/50 text-muted-foreground border-glass-border hover:bg-glass hover:text-foreground';
  };

  return (
    <div className="space-y-8 p-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.full_name}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === 'team_member' 
            ? "Here's your assigned projects and tasks" 
            : "Here's what's happening with your projects today"}
        </p>
      </div>

      {/* KPI Cards - Role-based */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {user?.role === 'team_member' ? 'My Projects' : 'Active Projects'}
            </CardTitle>
            <Folder className="w-4 h-4 text-accent-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.role === 'team_member' ? 'Assigned to you' : '+2 from last month'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {user?.role === 'team_member' ? 'My Tasks' : 'Delayed Tasks'}
            </CardTitle>
            {user?.role === 'team_member' ? (
              <CheckSquare className="w-4 h-4 text-accent-2" />
            ) : (
              <Clock className="w-4 h-4 text-danger" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {user?.role === 'team_member' ? myTasks : delayedTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.role === 'team_member' ? 'Active tasks' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hours Logged (Week)
            </CardTitle>
            <BarChart3 className="w-4 h-4 text-accent-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{hoursLogged}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.role === 'team_member' ? 'Your logged hours' : 'Across all projects'}
            </p>
          </CardContent>
        </Card>

        {user?.role !== 'team_member' && (
          <Card className="glass-card border-glass-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue (YTD)
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ₹{(revenueEarned / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +12% from last quarter
              </p>
            </CardContent>
          </Card>
        )}
        
        {user?.role === 'team_member' && (
          <Card className="glass-card border-glass-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue Tasks
              </CardTitle>
              <Clock className="w-4 h-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{delayedTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Needs attention
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Projects Grid with Filters */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {user?.role === 'team_member' ? 'My Projects' : 'Projects'}
          </h2>
          
          {/* Status Filters */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('all')}
              className={getFilterButtonClass('all')}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('planned')}
              className={getFilterButtonClass('planned')}
            >
              Planned
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('in_progress')}
              className={getFilterButtonClass('in_progress')}
            >
              In Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('completed')}
              className={getFilterButtonClass('completed')}
            >
              Completed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('on_hold')}
              className={getFilterButtonClass('on_hold')}
            >
              On Hold
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="glass-card border-glass-border hover:translate-y-[-2px] transition-all duration-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">
                      {project.name}
                    </CardTitle>
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
                      ₹{(project.budget_amount / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">End Date</p>
                    <p className="text-foreground font-medium">
                      {new Date(project.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-glass-border">
                  <div className="text-xs glass px-2 py-1 rounded-full">
                    {user?.role === 'team_member' ? 'Read-only' : '2 SO'}
                  </div>
                  {user?.role !== 'team_member' && (
                    <>
                      <div className="text-xs glass px-2 py-1 rounded-full">
                        1 Invoice
                      </div>
                      <div className="text-xs glass px-2 py-1 rounded-full">
                        3 Tasks
                      </div>
                    </>
                  )}
                  {user?.role === 'team_member' && (
                    <div className="text-xs text-muted-foreground">
                      View details for context
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
