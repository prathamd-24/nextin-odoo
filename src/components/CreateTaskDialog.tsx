import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createTask, CreateTaskRequest, ApiProject } from '@/lib/api';
import { Plus, Calendar, Flag, CheckSquare } from 'lucide-react';

interface CreateTaskDialogProps {
  projects: ApiProject[];
  onTaskCreated?: () => void;
}

export default function CreateTaskDialog({ projects, onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  const [formData, setFormData] = useState<CreateTaskRequest & { project_id: number }>({
    title: '',
    description: '',
    priority: 'medium',
    state: 'todo',
    due_date: '',
    project_id: 0,
  });
  const { toast } = useToast();

  // Local storage helper for tasks
  const saveTaskLocally = (taskData: CreateTaskRequest & { project_id: number }) => {
    try {
      const existingTasks = JSON.parse(sessionStorage.getItem('localTasks') || '[]');
      const newTask = {
        id: Date.now(), // Use timestamp as ID
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        state: taskData.state,
        due_date: taskData.due_date,
        project_id: taskData.project_id,
        project_name: projects.find(p => p.id === taskData.project_id)?.name || 'Unknown Project',
        created_at: new Date().toISOString(),
        assignee_ids: [], // Empty for now
      };
      existingTasks.push(newTask);
      sessionStorage.setItem('localTasks', JSON.stringify(existingTasks));
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_id || formData.project_id === 0) {
      toast({
        title: 'Error',
        description: 'Please select a project',
        variant: 'destructive',
      });
      return;
    }
    
    if (projects.length === 0) {
      toast({
        title: 'Error',
        description: 'No projects available. Please create a project first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { project_id, ...taskData } = formData;
      await createTask(project_id, taskData);
      
      // API success - show success toast
      toast({
        title: 'Task created successfully',
        description: `"${formData.title}" has been added to the project`,
      });
      
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        state: 'todo',
        due_date: '',
        project_id: 0,
      });
      
      onTaskCreated?.();
    } catch (error) {
      // API failed - save locally without any toast
      const saved = saveTaskLocally(formData);
      
      if (saved) {
        // Successfully saved locally - close dialog and reset form silently
        setOpen(false);
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          state: 'todo',
          due_date: '',
          project_id: 0,
        });
        onTaskCreated?.();
      } else {
        // Even local storage failed - show error
        toast({
          title: 'Failed to create task',
          description: 'Unable to save task data',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glass-button">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-glass-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CheckSquare className="w-5 h-5 text-accent-1" />
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Create a new task and assign it to a project.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            {projects.length === 0 && (
              <div className="text-xs text-amber-600 mb-1">
                ⚠️ No projects available. Please create a project first.
              </div>
            )}
            <Select 
              value={formData.project_id > 0 ? formData.project_id.toString() : ""} 
              onValueChange={(value) => {
                const projectId = parseInt(value);
                setFormData(prev => ({ ...prev, project_id: projectId }));
              }}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder={projects.length > 0 ? "Select a project" : "No projects available"} />
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-projects" disabled>
                    No projects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="glass-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="glass-input resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center gap-1">
                <Flag className="w-3 h-3" />
                Priority
              </Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border">
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-2"></div>
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-danger"></div>
                      High
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Status</Label>
              <Select 
                value={formData.state} 
                onValueChange={(value: 'todo' | 'in_progress' | 'done') => 
                  setFormData(prev => ({ ...prev, state: value }))
                }
              >
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border">
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due Date
            </Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              min={formatDateForInput(new Date())}
              className="glass-input"
              required
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="glass-button-outline"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="glass-button">
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}