import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus } from 'lucide-react';
import { createProject, CreateProjectRequest } from '@/lib/api';
import { getCurrentUser } from '@/lib/apiAuth';
import { toast } from '@/hooks/use-toast';

interface CreateProjectDialogProps {
  onProjectCreated?: () => void;
  className?: string;
}

export default function CreateProjectDialog({ 
  onProjectCreated, 
  className = '' 
}: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = getCurrentUser();
  
  // Force project manager to Rohit Sharma (ID = 1) per UI requirement
  const [formData, setFormData] = useState<CreateProjectRequest>({
    project_code: '',
    name: '',
    description: '',
    project_manager_id: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'active',
    budget_amount: undefined,
  });

  const handleInputChange = (field: keyof CreateProjectRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      project_code: '',
      name: '',
      description: '',
      project_manager_id: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      status: 'active',
      budget_amount: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.project_code || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createProject(formData);
      
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      
      setOpen(false);
      resetForm();
      onProjectCreated?.();
      
    } catch (error) {
      console.error('Failed to create project:', error);
      
      // Fallback: Create demo project locally
      const demoProject = {
        id: Date.now(), // Use timestamp as temporary ID
        project_code: formData.project_code,
        name: formData.name,
        description: formData.description,
        project_manager_id: formData.project_manager_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        budget_amount: formData.budget_amount,
        created_at: new Date().toISOString(),
        role: 'project_manager', // Assuming creator becomes project manager
        added_at: new Date().toISOString()
      };
      
      // Add to local storage for demo purposes
      const existingProjects = JSON.parse(localStorage.getItem('demoProjects') || '[]');
      existingProjects.push(demoProject);
      localStorage.setItem('demoProjects', JSON.stringify(existingProjects));
      
      toast({
        title: "Demo Mode",
        description: "API unavailable. Project created in demo mode.",
        variant: "default",
      });
      
      setOpen(false);
      resetForm();
      onProjectCreated?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`glass-button ${className}`}>
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project with the details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_code">Project Code *</Label>
              <Input
                id="project_code"
                value={formData.project_code}
                onChange={(e) => handleInputChange('project_code', e.target.value)}
                placeholder="e.g., PROJ001"
                className="glass-input"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Website Redesign"
              className="glass-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the project..."
              className="glass-input"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_manager">Project Manager</Label>
            <Select
              value={String(formData.project_manager_id)}
              onValueChange={(value) => handleInputChange('project_manager_id', parseInt(value))}
            >
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Rohit Sharma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="glass-input"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="glass-input"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_amount">Budget Amount (Optional)</Label>
            <Input
              id="budget_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.budget_amount || ''}
              onChange={(e) => handleInputChange('budget_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g., 50000.00"
              className="glass-input"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="glass-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}