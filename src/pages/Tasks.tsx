import { useState, useEffect } from 'react';
import { getCurrentUser, getUserRole } from '@/lib/apiAuth';
import { getUserTasks, getUserProjects, ApiTask, UserTasksResponse, ApiProject } from '@/lib/api';
import { MOCK_TASKS, MOCK_PROJECTS } from '@/lib/mockData';
import CreateTaskDialog from '@/components/CreateTaskDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  CheckSquare, 
  Clock, 
  Flag, 
  Calendar,
  User,
  FolderOpen
} from 'lucide-react';

type TaskStatusFilter = 'all' | 'todo' | 'in_progress' | 'done';
type TaskPriorityFilter = 'all' | 'low' | 'medium' | 'high';

export default function Tasks() {
  const user = getCurrentUser();
  const userRole = user ? getUserRole(user) : null;
  const { toast } = useToast();

  // State management
  const [userTasksData, setUserTasksData] = useState<UserTasksResponse | null>(null);
  const [userProjects, setUserProjects] = useState<ApiProject[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>('all');

  // Check if user can create tasks (Project Manager or Admin)
  const canCreateTasks = userRole === 'project_manager' || userRole === 'admin';

  // Fetch user's tasks
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

  // Fetch user's projects (needed for task creation)
  useEffect(() => {
    if (user?.id && canCreateTasks) {
      setIsLoadingProjects(true);
      getUserProjects(user.id)
        .then((projectsData) => {
          // Combine managed and member projects
          const allProjects = [...projectsData.managed_projects, ...projectsData.member_projects];
          setUserProjects(allProjects);
        })
        .catch((error) => {
          console.error('Failed to fetch user projects:', error);
          // Fallback to mock projects - convert to ApiProject format
          const mockProjects: ApiProject[] = MOCK_PROJECTS.map((p, index) => ({
            id: index + 1, // Use index-based ID for mock projects
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
        })
        .finally(() => setIsLoadingProjects(false));
    }
  }, [user?.id, canCreateTasks]);

  // Get locally stored tasks
  const getLocalTasks = (): ApiTask[] => {
    try {
      const localTasks = JSON.parse(sessionStorage.getItem('localTasks') || '[]');
      return localTasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority as 'low' | 'medium' | 'high',
        state: task.state as 'todo' | 'in_progress' | 'done',
        due_date: task.due_date,
        project_id: task.project_id,
        project_name: task.project_name
      }));
    } catch {
      return [];
    }
  };

  // Get tasks to display (API + local + fallback to mock)
  const apiTasks: ApiTask[] = userTasksData?.assigned_tasks || [];
  const localTasks = getLocalTasks();
  
  // Combine API and local tasks, or fallback to mock data
  const displayTasks = apiTasks.length > 0 || localTasks.length > 0 
    ? [...apiTasks, ...localTasks]
    : MOCK_TASKS
        .filter(task => task.assignee_ids.includes(user?.id?.toString() || ''))
        .map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority as 'low' | 'medium' | 'high',
          state: task.state === 'in_progress' ? 'in_progress' as const : 
                 task.state === 'done' ? 'done' as const : 'todo' as const,
          due_date: task.due_date,
          project_id: task.project_id,
          project_name: MOCK_PROJECTS.find(p => p.id === task.project_id)?.name || 'Unknown Project'
        }));

  // Apply filters
  const filteredTasks = displayTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.state === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-danger text-danger-foreground';
      case 'medium': return 'bg-accent-2 text-accent-2-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'done': return 'bg-success text-success-foreground';
      case 'in_progress': return 'bg-accent-2 text-accent-2-foreground';
      case 'todo': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleTaskCreated = () => {
    // Refresh tasks after creation (both API and local)
    if (user?.id) {
      getUserTasks(user.id)
        .then(setUserTasksData)
        .catch(console.error);
    }
    // Force re-render to pick up any new local tasks
    setSearchQuery(prev => prev); // Trigger re-render
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {isLoadingTasks 
              ? 'Loading your tasks...' 
              : `${filteredTasks.length} tasks found`
            }
          </p>
        </div>
        
        {canCreateTasks && (
          <CreateTaskDialog 
            projects={(() => {
              const projects = userProjects.length > 0 ? userProjects : MOCK_PROJECTS.map((p, index) => ({
                id: index + 1, // Use index-based ID for mock projects
                project_code: p.project_code,
                name: p.name,
                description: p.description || '',
                role: 'Project Manager',
                status: p.status === 'in_progress' ? 'active' : p.status,
                start_date: p.start_date,
                end_date: p.end_date,
                budget_amount: p.budget_amount
              }));
              return projects;
            })()}
            onTaskCreated={handleTaskCreated}
          />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-input"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value: TaskStatusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px] glass-input">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="glass-card border-glass-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value: TaskPriorityFilter) => setPriorityFilter(value)}>
            <SelectTrigger className="w-[140px] glass-input">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="glass-card border-glass-border">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Grid */}
      {isLoadingTasks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card border-glass-border animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="glass-card border-glass-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your filters to see more tasks.'
                : 'You don\'t have any assigned tasks yet.'}
            </p>
            {canCreateTasks && (
              <p className="text-muted-foreground text-center mt-2">
                Create a new task to get started.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="glass-card border-glass-border hover:border-accent-1/50 transition-all duration-smooth">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground pr-2">
                    {task.title}
                  </CardTitle>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                {task.project_name && (
                  <CardDescription className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {task.project_name}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span className="text-muted-foreground">
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                  
                  <Badge className={getStatusColor(task.state)}>
                    {task.state === 'in_progress' ? 'In Progress' : 
                     task.state === 'todo' ? 'To Do' : 'Done'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                  <div className="text-xs text-muted-foreground">
                    Task #{task.id}
                  </div>
                  {'assigned_at' in task && task.assigned_at && (
                    <div className="text-xs text-muted-foreground">
                      Assigned {formatDate(task.assigned_at)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}