import { useState } from 'react';
import {
  Project,
  MOCK_SALES_ORDERS,
  MOCK_PURCHASE_ORDERS,
  MOCK_INVOICES,
  MOCK_BILLS,
  MOCK_EXPENSES,
  MOCK_TEAM_MEMBERS,
  MOCK_CUSTOMERS,
  MOCK_TASKS,
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
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  ShoppingCart,
  Receipt,
  CreditCard,
  Wallet,
  Edit,
  UserCog,
  CheckSquare,
} from 'lucide-react';

interface ProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
}: ProjectDetailsDialogProps) {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';

  if (!project) return null;

  const customer = MOCK_CUSTOMERS.find((c) => c.id === project.customer_id);
  const teamMembers = MOCK_TEAM_MEMBERS.filter((m) =>
    project.team_member_ids.includes(m.id)
  );
  const projectManager = MOCK_TEAM_MEMBERS.find((m) => m.id === project.project_manager_id);

  // Financial documents
  const salesOrders = MOCK_SALES_ORDERS.filter((so) => so.project_id === project.id);
  const purchaseOrders = MOCK_PURCHASE_ORDERS.filter((po) => po.project_id === project.id);
  const invoices = MOCK_INVOICES.filter((inv) => inv.project_id === project.id);
  const bills = MOCK_BILLS.filter((bill) => bill.project_id === project.id);
  const expenses = MOCK_EXPENSES.filter((exp) => exp.project_id === project.id);
  const tasks = MOCK_TASKS.filter((task) => task.project_id === project.id);

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_progress: 'bg-accent-1/20 text-accent-1 border-accent-1/30',
      planned: 'bg-accent-2/20 text-accent-2 border-accent-2/30',
      on_hold: 'bg-muted text-muted-foreground border-border',
      completed: 'bg-success/20 text-success border-success/30',
      cancelled: 'bg-danger/20 text-danger border-danger/30',
      confirmed: 'bg-success/20 text-success border-success/30',
      draft: 'bg-muted text-muted-foreground border-border',
      paid: 'bg-success/20 text-success border-success/30',
      sent: 'bg-accent-1/20 text-accent-1 border-accent-1/30',
      pending: 'bg-warning/20 text-warning border-warning/30',
      approved: 'bg-success/20 text-success border-success/30',
      submitted: 'bg-accent-2/20 text-accent-2 border-accent-2/30',
    };
    return colors[status] || '';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const budgetUtilization = (project.budget_spent / project.budget_amount) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-glass-border max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{project.name}</DialogTitle>
              <DialogDescription className="text-accent-1 font-mono">
                {project.project_code}
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial Docs</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {project.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-foreground">{project.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="text-foreground font-medium">
                      {formatDate(project.start_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="text-foreground font-medium">
                      {formatDate(project.end_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Budget
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Budget:</span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(project.budget_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spent:</span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(project.budget_spent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(project.budget_amount - project.budget_spent)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
                <span className="text-foreground font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Budget Utilization
                </h3>
                <span className="text-foreground font-medium">{budgetUtilization.toFixed(1)}%</span>
              </div>
              <Progress value={budgetUtilization} className="h-3" />
            </div>

            {customer && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Customer</h3>
                <Card className="glass-card border-glass-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-accent-1/20 text-accent-1">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-foreground font-medium">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {isAdmin && (
              <div className="flex gap-2 pt-4 border-t border-glass-border">
                <Button variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Project
                </Button>
                <Button variant="outline" className="gap-2">
                  <UserCog className="w-4 h-4" />
                  Reassign Manager
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Financial Documents Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* Sales Orders */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Sales Orders ({salesOrders.length})
              </h3>
              <div className="space-y-2">
                {salesOrders.map((so) => (
                  <Card key={so.id} className="glass-card border-glass-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{so.so_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(so.order_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {formatCurrency(so.total_amount)}
                          </p>
                          <Badge className={getStatusColor(so.status)} variant="outline">
                            {so.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {salesOrders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sales orders found
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Purchase Orders */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Purchase Orders ({purchaseOrders.length})
              </h3>
              <div className="space-y-2">
                {purchaseOrders.map((po) => (
                  <Card key={po.id} className="glass-card border-glass-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{po.po_number}</p>
                          <p className="text-sm text-muted-foreground">{po.vendor_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(po.order_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {formatCurrency(po.total_amount)}
                          </p>
                          <Badge className={getStatusColor(po.status)} variant="outline">
                            {po.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {purchaseOrders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No purchase orders found
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Invoices */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Invoices ({invoices.length})
              </h3>
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <Card key={inv.id} className="glass-card border-glass-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{inv.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {formatDate(inv.due_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {formatCurrency(inv.total_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Paid: {formatCurrency(inv.paid_amount)}
                          </p>
                          <Badge className={getStatusColor(inv.status)} variant="outline">
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {invoices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No invoices found
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Bills */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Bills ({bills.length})
              </h3>
              <div className="space-y-2">
                {bills.map((bill) => (
                  <Card key={bill.id} className="glass-card border-glass-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{bill.bill_number}</p>
                          <p className="text-sm text-muted-foreground">{bill.vendor_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDate(bill.due_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {formatCurrency(bill.total_amount)}
                          </p>
                          <Badge className={getStatusColor(bill.status)} variant="outline">
                            {bill.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {bills.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No bills found
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Expenses */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Expenses ({expenses.length})
              </h3>
              <div className="space-y-2">
                {expenses.map((exp) => (
                  <Card key={exp.id} className="glass-card border-glass-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{exp.category}</p>
                          <p className="text-sm text-muted-foreground">{exp.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(exp.expense_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            ₹{exp.amount.toLocaleString()}
                          </p>
                          <Badge className={getStatusColor(exp.status)} variant="outline">
                            {exp.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {expenses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No expenses found
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <UserCog className="w-4 h-4" />
                Project Manager
              </h3>
              {projectManager && (
                <Card className="glass-card border-glass-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-accent-1/20 text-accent-1">
                          {getInitials(projectManager.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-foreground font-medium">{projectManager.name}</h4>
                        <p className="text-sm text-muted-foreground">{projectManager.email}</p>
                        <Badge variant="outline" className="mt-1">
                          {projectManager.role}
                        </Badge>
                      </div>
                      {isAdmin && (
                        <Button variant="outline" size="sm">
                          <UserCog className="w-3 h-3 mr-1" />
                          Reassign
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members ({teamMembers.length})
              </h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="glass-card border-glass-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-accent-2/20 text-accent-2">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="text-foreground font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {isAdmin && (
              <Button variant="outline" className="w-full gap-2">
                <Users className="w-4 h-4" />
                Manage Team
              </Button>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Project Tasks ({tasks.length})
              </h3>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.id} className="glass-card border-glass-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-foreground font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.state)} variant="outline">
                              {task.state.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Due: {formatDate(task.due_date)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {tasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks found
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
