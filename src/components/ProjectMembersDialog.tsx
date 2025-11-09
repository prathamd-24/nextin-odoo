import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { addProjectMember, removeProjectMember, ProjectMemberRequest } from '@/lib/api';
import { Users, Plus, Trash2, Mail, UserCheck } from 'lucide-react';

interface ProjectMember {
  id: number;
  user_id: number;
  user_email: string;
  role_in_project: string;
  added_at: string;
}

interface ProjectMembersDialogProps {
  projectId: number;
  projectName: string;
  members: ProjectMember[];
  onMembersUpdated?: () => void;
}

export default function ProjectMembersDialog({ 
  projectId, 
  projectName, 
  members, 
  onMembersUpdated 
}: ProjectMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [localMembers, setLocalMembers] = useState<ProjectMember[]>(members);
  const [newMemberData, setNewMemberData] = useState<ProjectMemberRequest & { email: string }>({
    user_id: 0,
    role_in_project: 'Developer',
    email: '',
  });
  const { toast } = useToast();

  // Load demo members from localStorage on mount
  useEffect(() => {
    const loadDemoMembers = () => {
      try {
        const stored = localStorage.getItem(`demoProjectMembers_${projectId}`);
        const demoMembers = stored ? JSON.parse(stored) : [];
        setLocalMembers([...members, ...demoMembers]);
      } catch {
        setLocalMembers(members);
      }
    };
    
    loadDemoMembers();
  }, [projectId, members]);

  // Save demo members to localStorage
  const saveDemoMembers = (demoMembers: ProjectMember[]) => {
    try {
      localStorage.setItem(`demoProjectMembers_${projectId}`, JSON.stringify(demoMembers));
    } catch (error) {
      console.error('Failed to save demo members:', error);
    }
  };

  // Get current demo members
  const getCurrentDemoMembers = (): ProjectMember[] => {
    try {
      const stored = localStorage.getItem(`demoProjectMembers_${projectId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const handleAddMember = async () => {
    if (!newMemberData.email || !newMemberData.role_in_project) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Check if member already exists
    const emailExists = localMembers.some(member => member.user_email.toLowerCase() === newMemberData.email.toLowerCase());
    if (emailExists) {
      toast({
        title: 'Member already exists',
        description: `${newMemberData.email} is already a member of this project`,
        variant: 'destructive',
      });
      return;
    }

    setIsAddingMember(true);

    try {
      // Try API first
      const mockUserId = Math.floor(Math.random() * 1000);
      
      await addProjectMember(projectId, {
        user_id: mockUserId,
        role_in_project: newMemberData.role_in_project,
      });

      toast({
        title: 'Member added successfully',
        description: `${newMemberData.email} has been added to ${projectName}`,
      });

      setNewMemberData({
        user_id: 0,
        role_in_project: 'Developer',
        email: '',
      });

      onMembersUpdated?.();
    } catch (error) {
      // Fallback to demo mode
      const newDemoMember: ProjectMember = {
        id: Date.now(),
        user_id: Math.floor(Math.random() * 1000),
        user_email: newMemberData.email,
        role_in_project: newMemberData.role_in_project,
        added_at: new Date().toISOString(),
      };

      const currentDemoMembers = getCurrentDemoMembers();
      const updatedDemoMembers = [...currentDemoMembers, newDemoMember];
      saveDemoMembers(updatedDemoMembers);
      
      // Update local state
      setLocalMembers(prev => [...prev, newDemoMember]);

      toast({
        title: 'Member Added (Demo Mode)',
        description: `${newMemberData.email} has been added locally until session ends`,
        variant: 'default',
      });

      setNewMemberData({
        user_id: 0,
        role_in_project: 'Developer',
        email: '',
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: number, memberEmail: string) => {
    try {
      // Try API first
      await removeProjectMember(projectId, memberId);
      
      toast({
        title: 'Member removed successfully',
        description: `${memberEmail} has been removed from ${projectName}`,
      });

      onMembersUpdated?.();
    } catch (error) {
      // Fallback to demo mode - check if it's a demo member
      const currentDemoMembers = getCurrentDemoMembers();
      const isDemoMember = currentDemoMembers.some(m => m.id === memberId);
      
      if (isDemoMember) {
        // Remove from demo members
        const updatedDemoMembers = currentDemoMembers.filter(m => m.id !== memberId);
        saveDemoMembers(updatedDemoMembers);
        
        // Update local state
        setLocalMembers(prev => prev.filter(m => m.id !== memberId));
        
        toast({
          title: 'Member Removed (Demo Mode)',
          description: `${memberEmail} has been removed from the project`,
        });
      } else {
        toast({
          title: 'Cannot Remove Member',
          description: 'This member cannot be removed in demo mode (API member)',
          variant: 'destructive',
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'project manager':
        return 'bg-accent-1/20 text-accent-1 border-accent-1/30';
      case 'developer':
        return 'bg-accent-2/20 text-accent-2 border-accent-2/30';
      case 'designer':
        return 'bg-success/20 text-success border-success/30';
      case 'tester':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="glass-button-outline">
          <Users className="w-4 h-4 mr-2" />
          Manage Members ({members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-glass-border sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-accent-1" />
            Project Members
          </DialogTitle>
          <DialogDescription>
            Manage members for "{projectName}"
          </DialogDescription>
        </DialogHeader>

        {/* Add Member Section */}
        <div className="border border-glass-border rounded-lg p-4 space-y-4">
          <h4 className="font-medium flex items-center gap-2 text-foreground">
            <Plus className="w-4 h-4" />
            Add New Member
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="user@example.com"
                value={newMemberData.email}
                onChange={(e) => setNewMemberData(prev => ({ ...prev, email: e.target.value }))}
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-role">Role in Project</Label>
              <Select 
                value={newMemberData.role_in_project} 
                onValueChange={(value) => setNewMemberData(prev => ({ ...prev, role_in_project: value }))}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border">
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Tester">Tester</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAddMember} 
                disabled={isAddingMember}
                className="w-full glass-button"
              >
                {isAddingMember ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </div>
        </div>

        {/* Current Members List */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Current Members ({localMembers.length})</h4>
          
          {localMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No members assigned to this project yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {localMembers.map((member) => {
                const isDemoMember = getCurrentDemoMembers().some(m => m.id === member.id);
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 glass-card border-glass-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{member.user_email}</span>
                        {isDemoMember && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Demo
                          </Badge>
                        )}
                      </div>
                      <Badge className={getRoleColor(member.role_in_project)}>
                        {member.role_in_project}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Added {formatDate(member.added_at)}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-danger hover:bg-danger/10">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-glass-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{member.user_email}" from this project?
                              {isDemoMember ? ' This is a demo member and will be removed from local storage.' : ' This action cannot be undone.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveMember(member.id, member.user_email)}
                              className="bg-danger hover:bg-danger/90"
                            >
                              Remove Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="glass-button-outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}