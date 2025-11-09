import { useState, useEffect } from 'react';
import { getCurrentUser, getUserRole } from '@/lib/apiAuth';
import { getUserTasks, getUserProjects, ApiTask, UserTasksResponse, ApiProject } from '@/lib/api';
import CreateTaskDialog from '@/components/CreateTaskDialog';
import {
  MOCK_TASKS,
  MOCK_PROJECTS,
  MOCK_TEAM_MEMBERS,
  Task,
} from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  Clock,
  Tag,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TaskDetailsDialog from '@/components/TaskDetailsDialog';

export default function Tasks() {
  const user = getCurrentUser();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [taskView, setTaskView] = useState<'my' | 'all'>('my'); // Team member task view toggle
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewTaskDialogOpen, setViewTaskDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assignee_ids: [] as string[],
    state: 'new' as Task['state'],
    priority: 'medium' as Task['priority'],
    due_date: '',
    estimated_hours: '',
    tags: '',
  });

  const isAdmin = user?.role === 'admin';
  const isTeamMember = user?.role === 'team_member';

  // For team members, filter tasks based on view selection
  let displayTasks = tasks;
  if (isTeamMember) {
    if (taskView === 'my') {
      // Show only tasks assigned to the team member
      displayTasks = tasks.filter(task => task.assignee_ids.includes(user.id));
    } else {
      // Show all tasks in projects they're assigned to
      const userProjectIds = MOCK_PROJECTS
        .filter(p => p.team_member_ids.includes(user.id))
        .map(p => p.id);
      displayTasks = tasks.filter(task => userProjectIds.includes(task.project_id));
    }
  }

  const filteredTasks = displayTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = stateFilter === 'all' || task.state === stateFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;
    return matchesSearch && matchesState && matchesPriority && matchesProject;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_id: '',
      assignee_ids: [],
      state: 'new',
      priority: 'medium',
      due_date: '',
      estimated_hours: '',
      tags: '',
    });
  };

  const handleCreateTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...formData,
      created_by: user?.id || '1',
      created_at: new Date().toISOString(),
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : undefined,
    };

    setTasks([...tasks, newTask]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast({
      title: 'Task Created',
      description: `${newTask.title} has been created successfully.`,
    });
  };

  const handleEditTask = () => {
    if (!selectedTask) return;

    const updatedTasks = tasks.map((t) =>
      t.id === selectedTask.id
        ? {
            ...t,
            ...formData,
            updated_at: new Date().toISOString(),
            estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
            tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : undefined,
          }
        : t
    );

    setTasks(updatedTasks);
    setIsEditDialogOpen(false);
    setSelectedTask(null);
    resetForm();
    toast({
      title: 'Task Updated',
      description: 'Task has been updated successfully.',
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    toast({
      title: 'Task Deleted',
      description: 'Task has been deleted successfully.',
      variant: 'destructive',
    });
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      project_id: task.project_id,
      assignee_ids: task.assignee_ids,
      state: task.state,
      priority: task.priority,
      due_date: task.due_date,
      estimated_hours: task.estimated_hours?.toString(),
      tags: task.tags?.join(', ') || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (task: Task) => {
    setSelectedTask(task);
    setViewTaskDialogOpen(true);
  };

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      new: 'bg-accent-2/20 text-accent-2 border-accent-2/30',
      in_progress: 'bg-accent-1/20 text-accent-1 border-accent-1/30',
      blocked: 'bg-danger/20 text-danger border-danger/30',
      done: 'bg-success/20 text-success border-success/30',
    };
    return colors[state] || '';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-muted text-muted-foreground border-border',
      medium: 'bg-accent-2/20 text-accent-2 border-accent-2/30',
      high: 'bg-warning/20 text-warning border-warning/30',
      urgent: 'bg-danger/20 text-danger border-danger/30',
    };
    return colors[priority] || '';
  };

  const isOverdue = (dueDate: string, state: string) => {
    return new Date(dueDate) < new Date() && state !== 'done';
  };

  const getProjectName = (projectId: string) => {
    return MOCK_PROJECTS.find((p) => p.id === projectId)?.name || 'Unknown';
  };

  const getAssigneeNames = (assigneeIds: string[]) => {
    return assigneeIds
      .map((id) => MOCK_TEAM_MEMBERS.find((m) => m.id === id)?.name || 'Unknown')
      .join(', ');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const TaskForm = ({ isEditing }: { isEditing: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          defaultValue={formData.title}
          onBlur={(e) => setFormData((prev) => ({ ...prev, title: String(e.target.value) }))}
          placeholder="Enter task title"
          className="transition-all duration-300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          defaultValue={formData.description}
          onBlur={(e) => setFormData((prev) => ({ ...prev, description: String(e.target.value) }))}
          placeholder="Detailed task description and requirements"
          rows={3}
          className="transition-all duration-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project">Project *</Label>
          <Select
            defaultValue={formData.project_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, project_id: String(value) }))}
          >
            <SelectTrigger className="transition-all duration-300">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_PROJECTS.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date *</Label>
          <Input
            id="due_date"
            type="date"
            defaultValue={formData.due_date}
            onBlur={(e) => setFormData((prev) => ({ ...prev, due_date: String(e.target.value) }))}
            className="transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">Status *</Label>
          <Select
            defaultValue={formData.state}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, state: value as Task['state'] }))}
          >
            <SelectTrigger className="transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select
            defaultValue={formData.priority}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, priority: value as Task['priority'] }))
            }
          >
            <SelectTrigger className="transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_hours">Est. Hours</Label>
          <Input
            id="estimated_hours"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={formData.estimated_hours}
            onBlur={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData((prev) => ({ ...prev, estimated_hours: String(value) }));
            }}
            placeholder="16"
            className="transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          defaultValue={formData.tags}
          onBlur={(e) => setFormData((prev) => ({ ...prev, tags: String(e.target.value) }))}
          placeholder="frontend, design, urgent"
          className="transition-all duration-300"
        />
      </div>

      <div className="space-y-2">
        <Label>Assignees</Label>
        <div className="border border-glass-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
          {MOCK_TEAM_MEMBERS.map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`assignee-${member.id}`}
                checked={formData.assignee_ids.includes(member.id)}
                onChange={(e) => {
                  const { checked } = e.target;
                  setFormData((prev) => ({
                    ...prev,
                    assignee_ids: checked
                      ? [...prev.assignee_ids, member.id]
                      : prev.assignee_ids.filter((id) => id !== member.id),
                  }));
                }}
                className="rounded border-gray-300"
              />
              <label
                htmlFor={`assignee-${member.id}`}
                className="text-sm cursor-pointer text-foreground"
              >
                {member.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Calculate stats based on displayed tasks (filtered by role)
  const stats = {
    total: displayTasks.length,
    new: displayTasks.filter((t) => t.state === 'new').length,
    inProgress: displayTasks.filter((t) => t.state === 'in_progress').length,
    blocked: displayTasks.filter((t) => t.state === 'blocked').length,
    done: displayTasks.filter((t) => t.state === 'done').length,
    overdue: displayTasks.filter((t) => isOverdue(t.due_date, t.state)).length,
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Task Management</h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Full access to all tasks across all projects' 
              : isTeamMember 
                ? 'View and manage your assigned tasks'
                : 'View and manage your assigned tasks'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Team Member Task View Toggle */}
          {isTeamMember && (
            <div className="flex gap-2 bg-glass/50 p-1 rounded-lg border border-glass-border">
              <Button
                variant={taskView === 'my' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTaskView('my')}
                className={taskView === 'my' ? 'bg-accent-1/20 text-accent-1' : ''}
              >
                My Tasks
              </Button>
              <Button
                variant={taskView === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTaskView('all')}
                className={taskView === 'all' ? 'bg-accent-1/20 text-accent-1' : ''}
              >
                All Tasks
              </Button>
            </div>
          )}

                    {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) resetForm();
            setIsCreateDialogOpen(isOpen);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-glass-border max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Create New Task</DialogTitle>
                <DialogDescription>Add a new task with all necessary details</DialogDescription>
              </DialogHeader>
              <div>
                <TaskForm key="create-task" isEditing={false} />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTask}
                  className="transition-all duration-300 hover:scale-105 bg-gradient-to-r from-accent-1 to-accent-2"
                >
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="glass-card border-glass-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-glass-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-accent-2">{stats.new}</div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-glass-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-accent-1">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-glass-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-danger">{stats.blocked}</div>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-glass-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{stats.done}</div>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-glass-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-glass-border">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
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

              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            className="glass-card border-glass-border hover:translate-y-[-2px] transition-all duration-smooth"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground">{task.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {getProjectName(task.project_id)}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStateColor(task.state)} variant="outline">
                    {task.state.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)} variant="outline">
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{getAssigneeNames(task.assignee_ids)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span
                    className={
                      isOverdue(task.due_date, task.state) ? 'text-danger font-medium' : 'text-foreground'
                    }
                  >
                    {formatDate(task.due_date)}
                    {isOverdue(task.due_date, task.state) && (
                      <AlertCircle className="w-3 h-3 inline ml-1" />
                    )}
                  </span>
                </div>

                {task.estimated_hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{task.estimated_hours}h estimated</span>
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {task.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openViewDialog(task)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                {isAdmin && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(task)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-glass-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Task</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{task.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="glass-card border-glass-border">
          <CardContent className="py-12 text-center">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {searchQuery || stateFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first task'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        setIsEditDialogOpen(isOpen);
      }}>
        <DialogContent className="glass-card border-glass-border max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">
          <DialogHeader className="animate-in fade-in-0 slide-in-from-top-2 duration-500">
            <DialogTitle className="text-xl">Edit Task</DialogTitle>
            <DialogDescription>Update task details and assignments</DialogDescription>
          </DialogHeader>
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-100">
            <TaskForm key={selectedTask ? selectedTask.id : 'edit-task'} isEditing={true} />
          </div>
          <DialogFooter className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-150">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="transition-all duration-300 hover:scale-105"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditTask}
              className="transition-all duration-300 hover:scale-105 bg-gradient-to-r from-accent-1 to-accent-2"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        open={viewTaskDialogOpen}
        onOpenChange={setViewTaskDialogOpen}
      />
    </div>
  );
}
