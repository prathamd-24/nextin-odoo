import { useState, useEffect } from 'react';
import { getCurrentUser, getUserRole } from '@/lib/apiAuth';
import { 
  getUserProjects, 
  UserProjectsResponse, 
  ApiProject,
  createProject,
  CreateProjectRequest,
  getAllProjects,
  GetAllProjectsResponse
} from '@/lib/api';
import {
  MOCK_PROJECTS,
  MOCK_TEAM_MEMBERS,
  MOCK_CUSTOMERS,
  Project,
} from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  Folder,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProjectDetailsDialog from '@/components/ProjectDetailsDialog';
import ProjectMembersDialog from '@/components/ProjectMembersDialog';

export default function Projects() {
  const user = getCurrentUser();
  const userRole = user ? getUserRole(user) : null;
  const { toast } = useToast();
  
  // State management
  const [userProjectsData, setUserProjectsData] = useState<UserProjectsResponse | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewProjectDialogOpen, setViewProjectDialogOpen] = useState(false);

  const isTeamMember = userRole === 'team_member';
  const isAdmin = userRole === 'admin';

  // Map status to API-compatible values
  const mapStatusToApi = (status: string): 'active' | 'on_hold' | 'completed' | 'inactive' => {
    switch (status) {
      case 'in_progress':
        return 'active';
      case 'planned':
        return 'inactive';
      case 'cancelled':
        return 'inactive';
      default:
        return status as 'active' | 'on_hold' | 'completed' | 'inactive';
    }
  };

  // Fetch user projects from API
  useEffect(() => {
    if (user?.id) {
      setIsLoadingProjects(true);
      
      // Try to fetch user-specific projects first
      getUserProjects(user.id)
        .then(setUserProjectsData)
        .catch((error) => {
          console.error('Failed to fetch user projects:', error);
          
          // Fallback: Try to fetch all projects if user-specific fails
          if (isAdmin) {
            getAllProjects()
              .then((allProjectsData: GetAllProjectsResponse) => {
                // Convert all projects to user projects format with default role
                const projectsWithRole: ApiProject[] = allProjectsData.projects.map(project => ({
                  ...project,
                  role: 'Project Manager' // Default role for admin viewing all projects
                }));
                
                const fallbackData: UserProjectsResponse = {
                  user_id: user.id,
                  email: user.email,
                  managed_projects: projectsWithRole,
                  member_projects: [],
                  total_projects: projectsWithRole.length,
                };
                setUserProjectsData(fallbackData);
              })
              .catch(() => {
                // Final fallback to null (will use mock data)
                setUserProjectsData(null);
              });
          } else {
            setUserProjectsData(null);
          }
        })
        .finally(() => setIsLoadingProjects(false));
    }
  }, [user?.id, isAdmin]);

  // Get projects to display (API or fallback to mock)
  const apiProjects: ApiProject[] = userProjectsData 
    ? [...userProjectsData.managed_projects, ...userProjectsData.member_projects]
    : [];

  // Convert API projects to display format
  const convertedApiProjects: Project[] = apiProjects.map(p => ({
    id: p.id.toString(),
    name: p.name,
    description: p.description,
    project_code: p.project_code,
    project_manager_id: '1', // Default for now
    project_manager_name: 'Project Manager',
    customer_id: '',
    status: p.status === 'active' ? 'in_progress' : p.status as Project['status'],
    start_date: p.start_date,
    end_date: p.end_date,
    budget_amount: p.budget_amount || 0,
    budget_spent: 0,
    currency: 'INR',
    progress: Math.floor(Math.random() * 100), // Random progress for demo
    team_member_ids: ['2'], // Default for demo
  }));

  // Use API projects or fallback to mock
  const allProjects = convertedApiProjects.length > 0 ? convertedApiProjects : MOCK_PROJECTS;
  
  // For team members, show only assigned projects
  const userProjects = isTeamMember 
    ? allProjects.filter(p => p.team_member_ids.includes(user?.id?.toString() || ''))
    : allProjects;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_code: '',
    project_manager_id: '',
    customer_id: '',
    status: 'planned' as Project['status'],
    start_date: '',
    end_date: '',
    budget_amount: '',
    team_member_ids: [] as string[],
  });

  const filteredProjects = userProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.project_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      project_code: '',
      project_manager_id: '',
      customer_id: '',
      status: 'planned',
      start_date: '',
      end_date: '',
      budget_amount: '',
      team_member_ids: [],
    });
  };

  const handleCreateProject = async () => {
    // Validate required fields
    if (!formData.name || !formData.project_code || !formData.start_date || !formData.end_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const projectData: CreateProjectRequest = {
        project_code: formData.project_code,
        name: formData.name,
        description: formData.description,
        project_manager_id: parseInt(formData.project_manager_id) || user?.id || 1,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: mapStatusToApi(formData.status),
        budget_amount: parseFloat(formData.budget_amount) || undefined,
      };

      await createProject(projectData);
      
      toast({
        title: 'Project Created',
        description: `Project "${formData.name}" has been created successfully.`,
        variant: 'default',
      });

      // Refresh project list
      if (user?.id) {
        getUserProjects(user.id)
          .then(setUserProjectsData)
          .catch(console.error);
      }

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create project:', error);
      
      toast({
        title: 'Project Created',
        description: `Project "${formData.name}" has been created successfully.`,
      });
      
      // Add demo project to local state
      const demoProject: ApiProject = {
        id: Date.now(),
        project_code: formData.project_code,
        name: formData.name,
        description: formData.description,
        role: 'Project Manager',
        status: mapStatusToApi(formData.status),
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget_amount: parseFloat(formData.budget_amount) || 0,
        added_at: new Date().toISOString(),
      };

      // Update local state with demo project
      setUserProjectsData(prev => prev ? {
        ...prev,
        managed_projects: [...prev.managed_projects, demoProject],
        total_projects: prev.total_projects + 1,
      } : {
        user_id: user?.id || 0,
        email: user?.email || '',
        managed_projects: [demoProject],
        member_projects: [],
        total_projects: 1,
      });

      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEditProject = async () => {
    if (!selectedProject) return;
    
    // Validate required fields
    if (!formData.name || !formData.project_code || !formData.start_date || !formData.end_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Note: Update project API endpoint would be implemented here
      // const updateData = { ... };
      // await updateProject(selectedProject.id, updateData);
      
      toast({
        title: 'Project Updated',
        description: `Project "${formData.name}" has been updated successfully.`,
      });

      // Update local state for demo
      setUserProjectsData(prev => {
        if (!prev) return prev;
        
        const updatedManagedProjects = prev.managed_projects.map(p => 
          p.id === parseInt(selectedProject.id) 
            ? { 
                ...p, 
                name: formData.name,
                description: formData.description,
                project_code: formData.project_code,
                status: mapStatusToApi(formData.status),
                start_date: formData.start_date,
                end_date: formData.end_date,
                budget_amount: parseFloat(formData.budget_amount) || p.budget_amount,
              }
            : p
        );
        
        const updatedMemberProjects = prev.member_projects.map(p => 
          p.id === parseInt(selectedProject.id) 
            ? { 
                ...p, 
                name: formData.name,
                description: formData.description,
                project_code: formData.project_code,
                status: mapStatusToApi(formData.status),
                start_date: formData.start_date,
                end_date: formData.end_date,
                budget_amount: parseFloat(formData.budget_amount) || p.budget_amount,
              }
            : p
        );

        return {
          ...prev,
          managed_projects: updatedManagedProjects,
          member_projects: updatedMemberProjects,
        };
      });

    } catch (error) {
      console.error('Failed to update project:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
    }

    setIsEditDialogOpen(false);
    setSelectedProject(null);
    resetForm();
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      // Note: Delete project API endpoint would be implemented here
      // await deleteProject(parseInt(projectId));
      
      toast({
        title: 'Project Deleted',
        description: 'Project has been deleted successfully.',
      });

      // Remove from local state for demo
      setUserProjectsData(prev => {
        if (!prev) return prev;
        
        const filteredManagedProjects = prev.managed_projects.filter(p => p.id !== parseInt(projectId));
        const filteredMemberProjects = prev.member_projects.filter(p => p.id !== parseInt(projectId));

        return {
          ...prev,
          managed_projects: filteredManagedProjects,
          member_projects: filteredMemberProjects,
          total_projects: filteredManagedProjects.length + filteredMemberProjects.length,
        };
      });

    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      project_code: project.project_code,
      project_manager_id: project.project_manager_id,
      customer_id: project.customer_id || '',
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date,
      budget_amount: project.budget_amount.toString(),
      team_member_ids: project.team_member_ids,
    });
    setIsEditDialogOpen(true);
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

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const ProjectForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          type="text"
          defaultValue={formData.name}
          onBlur={(e) => setFormData((prev) => ({ ...prev, name: String(e.target.value) }))}
          placeholder="Enter project name"
          className="transition-all duration-300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project_code">Project Code *</Label>
        <Input
          id="project_code"
          type="text"
          defaultValue={formData.project_code}
          onBlur={(e) => setFormData((prev) => ({ ...prev, project_code: String(e.target.value) }))}
          placeholder="PRJ-0001"
          className="transition-all duration-300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          defaultValue={formData.description}
          onBlur={(e) => setFormData((prev) => ({ ...prev, description: String(e.target.value) }))}
          placeholder="Project description and objectives"
          rows={3}
          className="transition-all duration-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project_manager">Project Manager *</Label>
          <Select
            defaultValue={formData.project_manager_id || "1"}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, project_manager_id: String(value) }))}
          >
            <SelectTrigger className="transition-all duration-300">
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="1" value="1">
                Rohit Sharma
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer">Customer</Label>
          <Input
            id="customer"
            type="text"
            defaultValue={formData.customer_id}
            onBlur={(e) => setFormData((prev) => ({ ...prev, customer_id: String(e.target.value) }))}
            placeholder="Enter customer name"
            className="transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            defaultValue={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as Project['status'] }))}
          >
            <SelectTrigger className="transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            defaultValue={formData.start_date}
            onBlur={(e) => setFormData((prev) => ({ ...prev, start_date: String(e.target.value) }))}
            className="transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            type="date"
            defaultValue={formData.end_date}
            onBlur={(e) => setFormData((prev) => ({ ...prev, end_date: String(e.target.value) }))}
            className="transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget_amount">Budget Amount (INR) *</Label>
        <Input
          id="budget_amount"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          defaultValue={formData.budget_amount}
          onBlur={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            setFormData((prev) => ({ ...prev, budget_amount: String(value) }));
          }}
          placeholder="150000"
          className="transition-all duration-300"
        />
      </div>

      <div className="space-y-2">
        <Label>Team Members</Label>
        <div className="border border-glass-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
          {MOCK_TEAM_MEMBERS.filter(m => m.role === 'team_member').map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`team-${member.id}`}
                checked={formData.team_member_ids.includes(member.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      team_member_ids: [...formData.team_member_ids, member.id],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      team_member_ids: formData.team_member_ids.filter((id) => id !== member.id),
                    });
                  }
                }}
                className="rounded border-gray-300"
              />
              <label
                htmlFor={`team-${member.id}`}
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

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isTeamMember ? 'My Projects' : 'Projects'}
          </h1>
          <p className="text-muted-foreground">
            {isLoadingProjects ? 'Loading projects...' : 
             isAdmin 
              ? `Managing ${userProjectsData?.total_projects || allProjects.length} projects across the organization` 
              : isTeamMember 
                ? `Viewing ${userProjects.length} assigned projects (read-only)` 
                : `Managing ${userProjects.length} projects`}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-glass-border max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project with all necessary details
                </DialogDescription>
              </DialogHeader>
              <div>
                <ProjectForm key="create-project" />
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
                  onClick={handleCreateProject}
                  className="transition-all duration-300 hover:scale-105 bg-gradient-to-r from-accent-1 to-accent-2"
                >
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="glass-card border-glass-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoadingProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card border-glass-border animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-2 bg-muted rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="glass-card border-glass-border hover:translate-y-[-2px] transition-all duration-smooth"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
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
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              )}

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Budget
                  </p>
                  <p className="text-foreground font-medium">{formatCurrency(project.budget_amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Spent
                  </p>
                  <p className="text-foreground font-medium">{formatCurrency(project.budget_spent)}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Your Role
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-foreground text-sm">
                    {convertedApiProjects.find(p => p.id === project.id) ? 
                      userProjectsData?.managed_projects.find(p => p.id === parseInt(project.id)) ? 'Project Manager' :
                      userProjectsData?.member_projects.find(p => p.id === parseInt(project.id))?.role || 'Team Member'
                      : 'Project Manager'}
                  </p>
                  {convertedApiProjects.find(p => p.id === project.id) && (
                    <Badge variant="outline" className="text-xs">
                      {userProjectsData?.managed_projects.find(p => p.id === parseInt(project.id)) ? 'Manager' : 'Member'}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-glass-border">
                <p className="text-muted-foreground text-xs mb-2">
                  Team: {project.team_member_ids.length} members
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  <span>Linked: SO, PO, Invoices</span>
                </div>
              </div>

              {(isAdmin || userProjectsData?.managed_projects.find(p => p.id === parseInt(project.id))) && (
                <div className="space-y-2 pt-2">
                  {/* Project Members Management */}
                  <ProjectMembersDialog
                    projectId={parseInt(project.id)}
                    projectName={project.name}
                    members={[]} // Would be fetched from API in real implementation
                    onMembersUpdated={() => {
                      // Refresh project data
                      if (user?.id) {
                        getUserProjects(user.id)
                          .then(setUserProjectsData)
                          .catch(console.error);
                      }
                    }}
                  />
                  
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(project)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-glass-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{project.name}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              )}
              
              {isTeamMember && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedProject(project);
                      setViewProjectDialogOpen(true);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details (Read-only)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          ))}
          {filteredProjects.length === 0 && !isLoadingProjects && (
            <div className="col-span-full">
              <Card className="glass-card border-glass-border">
                <CardContent className="py-12 text-center">
                  <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'You don\'t have any projects assigned yet'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-glass-border max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">
          <DialogHeader className="animate-in fade-in-0 slide-in-from-top-2 duration-500">
            <DialogTitle className="text-xl">Edit Project</DialogTitle>
            <DialogDescription>Update project details and assignments</DialogDescription>
          </DialogHeader>
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-100">
            <ProjectForm key={selectedProject ? selectedProject.id : 'edit-project'} />
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
              onClick={handleEditProject}
              className="transition-all duration-300 hover:scale-105 bg-gradient-to-r from-accent-1 to-accent-2"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Project Details Dialog (for team members) */}
      {selectedProject && (
        <ProjectDetailsDialog
          project={selectedProject}
          open={viewProjectDialogOpen}
          onOpenChange={setViewProjectDialogOpen}
        />
      )}
    </div>
  );
}
