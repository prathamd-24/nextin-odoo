import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  FileText, 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  DollarSign,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Check,
  X
} from "lucide-react";
import { getCurrentUser } from "@/lib/mockAuth";
import {
  MOCK_SALES_ORDERS,
  MOCK_PURCHASE_ORDERS,
  MOCK_INVOICES,
  MOCK_BILLS,
  MOCK_EXPENSES,
  MOCK_PROJECTS,
  MOCK_CUSTOMERS,
  type SalesOrder,
  type PurchaseOrder,
  type Invoice,
  type Bill,
  type Expense,
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const SalesFinance = () => {
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState("sales-orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Check if user has finance access
  const hasFinanceAccess = user?.role === 'admin' || user?.role === 'sales_finance';

  if (!hasFinanceAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="glass-card max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You don't have permission to access financial operations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtering functions
  const filterDocuments = (docs: any[]) => {
    return docs.filter((doc) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(doc).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesProject = filterProject === "all" || doc.project_id === filterProject;
      const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
      
      return matchesSearch && matchesProject && matchesStatus;
    });
  };

  const filteredSalesOrders = filterDocuments(MOCK_SALES_ORDERS);
  const filteredPurchaseOrders = filterDocuments(MOCK_PURCHASE_ORDERS);
  const filteredInvoices = filterDocuments(MOCK_INVOICES);
  const filteredBills = filterDocuments(MOCK_BILLS);
  const filteredExpenses = filterDocuments(MOCK_EXPENSES);

  // Calculate summary stats
  const totalRevenue = MOCK_INVOICES.reduce((sum, inv) => 
    inv.status === 'paid' ? sum + inv.paid_amount : sum, 0
  );
  const pendingInvoices = MOCK_INVOICES.filter(inv => 
    inv.status === 'sent' || inv.status === 'overdue'
  ).reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);
  const totalCosts = MOCK_BILLS.reduce((sum, bill) => 
    bill.status === 'paid' ? sum + bill.paid_amount : sum, 0
  ) + MOCK_EXPENSES.reduce((sum, exp) => 
    exp.status === 'approved' || exp.status === 'paid' ? sum + exp.amount : sum, 0
  );
  const netProfit = totalRevenue - totalCosts;
  const totalExpenses = MOCK_EXPENSES.reduce((sum, exp) => 
    exp.status === 'approved' || exp.status === 'paid' ? sum + exp.amount : sum, 0
  );
  const billableExpenses = MOCK_EXPENSES.filter(exp => 
    (exp.status === 'approved' || exp.status === 'paid') && exp.billable
  ).reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenseApprovals = MOCK_EXPENSES.filter(exp => 
    exp.status === 'submitted'
  ).length;
  const activeSalesOrders = MOCK_SALES_ORDERS.filter(so => 
    so.status === 'confirmed'
  ).length;
  const pendingPOs = MOCK_PURCHASE_ORDERS.filter(po => 
    po.status === 'draft'
  ).length;

  const handleView = (doc: any) => {
    setSelectedDoc(doc);
    setIsViewDialogOpen(true);
  };

  const handleApproveExpense = (expenseId: string) => {
    toast({
      title: "Expense Approved",
      description: `Expense ${expenseId} has been approved.`,
    });
  };

  const handleRejectExpense = (expenseId: string) => {
    toast({
      title: "Expense Rejected",
      description: `Expense ${expenseId} has been rejected.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: "secondary",
      pending: "default",
      confirmed: "default",
      sent: "default",
      paid: "success",
      received: "success",
      approved: "success",
      overdue: "destructive",
      cancelled: "destructive",
      rejected: "destructive",
      submitted: "warning",
    };
    
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales & Finance</h1>
          <p className="text-muted-foreground mt-1">
            Manage sales orders, purchase orders, invoices, bills, and expenses with end-to-end financial traceability
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/analytics'}>
            <Filter className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCosts)}</div>
            <p className="text-xs text-muted-foreground">Bills + Expenses</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netProfit >= 0 ? 'Profit' : 'Loss'} • {((netProfit / totalRevenue) * 100).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingInvoices)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sales Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSalesOrders}</div>
            <p className="text-xs text-muted-foreground">Confirmed orders</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPOs}</div>
            <p className="text-xs text-muted-foreground">Awaiting vendor</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billableExpenses)}</div>
            <p className="text-xs text-muted-foreground">Can be invoiced</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingExpenseApprovals}</div>
            <p className="text-xs text-muted-foreground">Expense approvals</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">
                <Search className="inline h-4 w-4 mr-2" />
                Search
              </Label>
              <Input
                id="search"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-filter">
                <Filter className="inline h-4 w-4 mr-2" />
                Project
              </Label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger id="project-filter">
                  <SelectValue placeholder="All Projects" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setFilterProject("all");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales-orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Sales Orders ({filteredSalesOrders.length})
          </TabsTrigger>
          <TabsTrigger value="purchase-orders">
            <FileText className="h-4 w-4 mr-2" />
            Purchase Orders ({filteredPurchaseOrders.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <Receipt className="h-4 w-4 mr-2" />
            Invoices ({filteredInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="bills">
            <CreditCard className="h-4 w-4 mr-2" />
            Bills ({filteredBills.length})
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <DollarSign className="h-4 w-4 mr-2" />
            Expenses ({filteredExpenses.length})
          </TabsTrigger>
        </TabsList>

        {/* Sales Orders Tab */}
        <TabsContent value="sales-orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sales Orders</h3>
            {user?.role === 'admin' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Sales Order
              </Button>
            )}
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalesOrders.map((so) => (
                    <TableRow key={so.id}>
                      <TableCell className="font-medium">{so.order_number}</TableCell>
                      <TableCell>{so.project_name}</TableCell>
                      <TableCell>{so.customer_name}</TableCell>
                      <TableCell>{new Date(so.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>{so.delivery_date ? new Date(so.delivery_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{formatCurrency(so.total_amount, so.currency)}</TableCell>
                      <TableCell>{getStatusBadge(so.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(so)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user?.role === 'admin' && (
                            <>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="purchase-orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Purchase Orders</h3>
            {user?.role === 'admin' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Purchase Order
              </Button>
            )}
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.po_number}</TableCell>
                      <TableCell>{po.project_name}</TableCell>
                      <TableCell>
                        <div>
                          <div>{po.vendor_name}</div>
                          <div className="text-xs text-muted-foreground">{po.vendor_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>{po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{formatCurrency(po.total_amount, po.currency)}</TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(po)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user?.role === 'admin' && (
                            <>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Invoices</h3>
            {user?.role === 'admin' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            )}
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{inv.project_name}</TableCell>
                      <TableCell>{inv.customer_name}</TableCell>
                      <TableCell>{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(inv.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(inv.total_amount, inv.currency)}</TableCell>
                      <TableCell>{formatCurrency(inv.paid_amount, inv.currency)}</TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(inv)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user?.role === 'admin' && (
                            <>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bills</h3>
            {user?.role === 'admin' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Bill
              </Button>
            )}
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Bill Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.bill_number}</TableCell>
                      <TableCell>{bill.project_name}</TableCell>
                      <TableCell>
                        <div>
                          <div>{bill.vendor_name}</div>
                          <div className="text-xs text-muted-foreground">{bill.vendor_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(bill.total_amount, bill.currency)}</TableCell>
                      <TableCell>{formatCurrency(bill.paid_amount, bill.currency)}</TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(bill)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user?.role === 'admin' && (
                            <>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expenses</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Expense
            </Button>
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>{new Date(exp.expense_date).toLocaleDateString()}</TableCell>
                      <TableCell>{exp.project_name}</TableCell>
                      <TableCell>{exp.user_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{exp.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{exp.description}</TableCell>
                      <TableCell>{formatCurrency(exp.amount, exp.currency)}</TableCell>
                      <TableCell>
                        {exp.billable ? (
                          <Badge variant="default">Billable</Badge>
                        ) : (
                          <Badge variant="secondary">Non-billable</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(exp.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(exp)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user?.role === 'admin' && exp.status === 'submitted' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApproveExpense(exp.id)}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRejectExpense(exp.id)}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {(user?.role === 'admin' || exp.user_id === user?.id) && (
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              View detailed information about this document
            </DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedDoc).map(([key, value]) => {
                  if (key === 'id') return null;
                  return (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </Label>
                      <div className="text-sm">
                        {typeof value === 'number' && key.includes('amount') 
                          ? formatCurrency(value)
                          : String(value || '-')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {user?.role === 'admin' && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesFinance;
