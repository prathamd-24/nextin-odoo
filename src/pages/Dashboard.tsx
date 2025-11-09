import { useState, useEffect } from 'react';
import { getCurrentUser, getUserDisplayName, mapApiRoleToUserRole, getUserRole } from '@/lib/apiAuth';
import { getUserProjects, getUserTasks, UserProjectsResponse, UserTasksResponse, ApiProject } from '@/lib/api';
import { MOCK_PROJECTS, MOCK_TASKS } from '@/lib/mockData';
import CreateTaskDialog from '@/components/CreateTaskDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Tabs removed from Dashboard — not used
import { BarChart3, Clock, Folder, TrendingUp, CheckSquare } from 'lucide-react';

type ProjectStatusFilter = 'all' | 'planned' | 'in_progress' | 'completed' | 'on_hold';

export default function Dashboard() {
  const user = getCurrentUser();
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all');
  const [userProjectsData, setUserProjectsData] = useState<UserProjectsResponse | null>(null);
  const [userTasksData, setUserTasksData] = useState<UserTasksResponse | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const userRole = user ? getUserRole(user) : null;

  // Fetch user projects from API
  useEffect(() => {
    if (user?.id) {
      setIsLoadingProjects(true);
      getUserProjects(user.id)
        .then(setUserProjectsData)
        .catch((error) => {
          console.error('Failed to fetch user projects:', error);
          // Fallback to mock data on error
          setUserProjectsData(null);
        })
        .finally(() => setIsLoadingProjects(false));
    }
  }, [user?.id]);

  // Fetch user tasks from API
  useEffect(() => {
    if (user?.id) {
      setIsLoadingTasks(true);
      getUserTasks(user.id)
        .then(setUserTasksData)
        .catch((error) => {
          console.error('Failed to fetch user tasks:', error);
          setUserTasksData(null);
        })
        .finally(() => setIsLoadingTasks(false));
    }
  }, [user?.id]);

  // Re-render when demo projects are added
  useEffect(() => {
    // This effect will trigger when refreshTrigger changes
  }, [refreshTrigger]);

  // Get demo projects from localStorage
  const getDemoProjects = (): ApiProject[] => {
    try {
      const stored = localStorage.getItem('demoProjects');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Combine API and demo projects for display
  const allUserProjects: ApiProject[] = userProjectsData 
    ? [...userProjectsData.managed_projects, ...userProjectsData.member_projects]
    : [];

  // Use refreshTrigger to ensure demo projects are re-read from localStorage
  const demoProjects = getDemoProjects();
  
  // Fall back to mock data if API fails or for demo users, and include demo projects
  const baseProjects = allUserProjects.length > 0 ? allUserProjects : 
    (userRole === 'team_member' 
      ? MOCK_PROJECTS.filter(p => p.team_member_ids.includes(user?.id?.toString() || ''))
      : MOCK_PROJECTS);
  
  const displayProjects = [...baseProjects, ...demoProjects];
  
  // Apply status filter
  const filteredProjects = statusFilter === 'all' 
    ? displayProjects 
    : displayProjects.filter(p => p.status === statusFilter);
  
  // Get tasks from API or fallback to mock data
  const apiTasks = userTasksData?.assigned_tasks || [];
  const mockUserTasks = userRole === 'team_member'
    ? MOCK_TASKS.filter(t => t.assignee_ids.includes(user?.id?.toString() || ''))
    : MOCK_TASKS;
  
  const userTasks = apiTasks.length > 0 ? apiTasks : mockUserTasks;
  
  // Calculate statistics
  const activeProjects = displayProjects.filter(p => p.status === 'active' || p.status === 'in_progress').length;
  const totalProjects = userProjectsData?.total_projects || displayProjects.length;
  const pendingProjects = displayProjects.filter(p => p.status === 'planned' || p.status === 'pending').length;
  
  const myTasks = userTasks.filter(t => t.state !== 'done').length;
  const delayedTasks = userTasks.filter(t => 
    new Date(t.due_date) < new Date() && t.state !== 'done'
  ).length;
  const hoursLogged = 24; // Mock data - would come from timesheets

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

  const canCreateTasks = userRole === 'project_manager' || userRole === 'admin';
  const canCreateProjects = userRole === 'admin'; // Only admins can create projects
  
  const handleTaskCreated = () => {
    // Refresh tasks after creation
    if (user?.id) {
      getUserTasks(user.id)
        .then(setUserTasksData)
        .catch(console.error);
    }
  };

  const handleProjectCreated = () => {
    // Refresh projects after creation
    if (user?.id) {
      getUserProjects(user.id)
        .then(setUserProjectsData)
        .catch(console.error);
    }
    // Trigger re-render to include demo projects
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user && getUserDisplayName(user)}
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'team_member' 
              ? "Here's your assigned projects and tasks" 
              : "Here's what's happening with your projects today"}
          </p>
        </div>
        
        <div className="flex gap-3">
          {canCreateTasks && (
            <CreateTaskDialog 
              projects={allUserProjects} 
              onTaskCreated={handleTaskCreated}
            />
          )}
          {/* Project creation removed from dashboard header per request */}
        </div>
      </div>

      {/* KPI Cards - Role-based */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {userRole === 'team_member' ? 'My Projects' : 'Active Projects'}
            </CardTitle>
            <Folder className="w-4 h-4 text-accent-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userRole === 'team_member' ? 'Assigned to you' : '+2 from last month'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {userRole === 'team_member' ? 'My Tasks' : 'Delayed Tasks'}
            </CardTitle>
            {userRole === 'team_member' ? (
              <CheckSquare className="w-4 h-4 text-accent-2" />
            ) : (
              <Clock className="w-4 h-4 text-danger" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {userRole === 'team_member' ? myTasks : delayedTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {userRole === 'team_member' ? 'Active tasks' : 'Needs attention'}
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
              {userRole === 'team_member' ? 'Your logged hours' : 'Across all projects'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-glass-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
            <Folder className="w-4 h-4 text-accent-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoadingProjects ? '...' : totalProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingProjects} pending projects
            </p>
          </CardContent>
        </Card>
        
        {userRole === 'team_member' && (
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
            {userRole === 'team_member' ? 'My Projects' : 'Projects'}
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
                    <span className="text-foreground font-medium">
                      {('progress' in project) ? project.progress : Math.floor(Math.random() * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={('progress' in project) ? project.progress : Math.floor(Math.random() * 100)} 
                    className="h-2" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Budget</p>
                    <p className="text-foreground font-medium">
                      {project.budget_amount ? `₹${(project.budget_amount / 1000).toFixed(0)}K` : 'N/A'}
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
                    {userRole === 'team_member' ? 'Read-only' : '2 SO'}
                  </div>
                  {userRole === 'team_member' && (
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
