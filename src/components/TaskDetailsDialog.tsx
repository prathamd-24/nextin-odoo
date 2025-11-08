import { useState } from 'react';
import {
  Task,
  MOCK_PROJECTS,
  MOCK_TEAM_MEMBERS,
  MOCK_TASK_COMMENTS,
  MOCK_TASK_ATTACHMENTS,
  MOCK_TIME_LOGS,
  TaskComment,
  TaskAttachment,
  TimeLog,
} from '@/lib/mockData';
import { getCurrentUser } from '@/lib/mockAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Calendar,
  Clock,
  Tag,
  MessageSquare,
  Paperclip,
  Timer,
  Edit,
  Send,
  Upload,
  Download,
  File,
  UserCog,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
  const user = getCurrentUser();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [newComment, setNewComment] = useState('');
  const [newTimeLog, setNewTimeLog] = useState({ hours: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Task>>({});

  if (!task) return null;

  const project = MOCK_PROJECTS.find((p) => p.id === task.project_id);
  const assignees = MOCK_TEAM_MEMBERS.filter((m) => task.assignee_ids.includes(m.id));
  const createdBy = MOCK_TEAM_MEMBERS.find((m) => m.id === task.created_by);

  // Filter related data
  const comments = MOCK_TASK_COMMENTS.filter((c) => c.task_id === task.id);
  const attachments = MOCK_TASK_ATTACHMENTS.filter((a) => a.task_id === task.id);
  const timeLogs = MOCK_TIME_LOGS.filter((l) => l.task_id === task.id);

  const totalLoggedHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    toast({
      title: 'Comment Added',
      description: 'Your comment has been added successfully.',
    });
    setNewComment('');
  };

  const handleAddTimeLog = () => {
    if (!newTimeLog.hours || !newTimeLog.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all time log fields.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Time Logged',
      description: `${newTimeLog.hours} hours logged successfully.`,
    });
    setNewTimeLog({ hours: '', description: '' });
  };

  const handleEditTask = () => {
    if (isEditing) {
      toast({
        title: 'Task Updated',
        description: 'Task has been updated successfully.',
      });
      setIsEditing(false);
    } else {
      setEditFormData({
        state: task.state,
        priority: task.priority,
        due_date: task.due_date,
        assignee_ids: task.assignee_ids,
      });
      setIsEditing(true);
    }
  };

  const isOverdue = new Date(task.due_date) < new Date() && task.state !== 'done';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-glass-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{task.title}</DialogTitle>
              <DialogDescription className="mt-2">
                <span className="text-accent-1">{project?.name}</span>
                {project && <span className="mx-2">•</span>}
                <span>{project?.project_code}</span>
              </DialogDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={getStateColor(task.state)} variant="outline">
                {task.state.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(task.priority)} variant="outline">
                {task.priority}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="attachments">
              Attachments ({attachments.length})
            </TabsTrigger>
            <TabsTrigger value="time">
              Time Logs ({timeLogs.length})
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-foreground">{task.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </h3>
                {isEditing && isAdmin ? (
                  <Input
                    type="date"
                    value={editFormData.due_date || task.due_date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, due_date: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        isOverdue
                          ? 'text-danger font-medium'
                          : 'text-foreground'
                      }
                    >
                      {formatDate(task.due_date)}
                    </span>
                    {isOverdue && (
                      <Badge variant="outline" className="text-danger border-danger">
                        Overdue
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Tracking
                </h3>
                <div className="text-foreground">
                  <div className="text-sm">
                    Logged: <span className="font-medium">{totalLoggedHours}h</span>
                  </div>
                  {task.estimated_hours && (
                    <div className="text-sm text-muted-foreground">
                      Estimated: {task.estimated_hours}h
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <UserCog className="w-4 h-4" />
                  Status & Priority
                </h3>
                {isEditing && isAdmin ? (
                  <div className="space-y-2">
                    <Select
                      value={editFormData.state || task.state}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, state: value as Task['state'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={editFormData.priority || task.priority}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, priority: value as Task['priority'] })
                      }
                    >
                      <SelectTrigger>
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
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStateColor(task.state)} variant="outline">
                        {task.state.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Created By</h3>
                {createdBy && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent-2/20 text-accent-2 text-xs">
                        {getInitials(createdBy.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{createdBy.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(task.created_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned To ({assignees.length})
              </h3>
              <div className="space-y-2">
                {assignees.map((assignee) => (
                  <Card key={assignee.id} className="glass-card border-glass-border">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-accent-1/20 text-accent-1">
                            {getInitials(assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{assignee.name}</p>
                          <p className="text-xs text-muted-foreground">{assignee.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="flex gap-2 pt-4 border-t border-glass-border">
                <Button onClick={handleEditTask} className="gap-2">
                  {isEditing ? (
                    <>
                      <Send className="w-4 h-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Edit Task
                    </>
                  )}
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="glass-card border-glass-border">
                  <CardContent className="pt-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent-2/20 text-accent-2 text-xs">
                          {getInitials(comment.user_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground">{comment.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(comment.created_at)}
                          </p>
                        </div>
                        <p className="text-sm text-foreground">{comment.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new-comment">Add Comment</Label>
              <Textarea
                id="new-comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                rows={3}
              />
              <Button onClick={handleAddComment} className="gap-2">
                <Send className="w-4 h-4" />
                Post Comment
              </Button>
            </div>
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-4">
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <Card key={attachment.id} className="glass-card border-glass-border">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent-1/20 flex items-center justify-center">
                          <File className="w-5 h-5 text-accent-1" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {attachment.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.file_size)} • Uploaded by{' '}
                            {attachment.uploaded_by_name} •{' '}
                            {formatDateTime(attachment.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {attachments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No attachments yet</p>
              </div>
            )}

            <Separator />

            <Button variant="outline" className="w-full gap-2">
              <Upload className="w-4 h-4" />
              Upload Attachment
            </Button>
          </TabsContent>

          {/* Time Logs Tab */}
          <TabsContent value="time" className="space-y-4">
            <div className="p-4 glass-card rounded-lg border border-glass-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-accent-1">{totalLoggedHours}h</p>
                  <p className="text-xs text-muted-foreground">Total Logged</p>
                </div>
                {task.estimated_hours && (
                  <div>
                    <p className="text-2xl font-bold text-foreground">{task.estimated_hours}h</p>
                    <p className="text-xs text-muted-foreground">Estimated</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {timeLogs.map((log) => (
                <Card key={log.id} className="glass-card border-glass-border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-accent-1/20 text-accent-1 text-xs">
                            {getInitials(log.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{log.user_name}</p>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(log.logged_date)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Timer className="w-3 h-3" />
                        {log.hours}h
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {timeLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Timer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No time logs yet</p>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <Label>Log Time</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Hours"
                    value={newTimeLog.hours}
                    onChange={(e) =>
                      setNewTimeLog({ ...newTimeLog, hours: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Textarea
                    placeholder="Description of work done..."
                    value={newTimeLog.description}
                    onChange={(e) =>
                      setNewTimeLog({ ...newTimeLog, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </div>
              <Button onClick={handleAddTimeLog} className="gap-2">
                <Timer className="w-4 h-4" />
                Log Time
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
