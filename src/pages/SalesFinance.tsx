import { useState, useEffect } from "react";
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
import { getCurrentUser, getUserRole } from "@/lib/apiAuth";
import {
  getSalesOrders,
  getPurchaseOrders,
  getCustomerInvoices,
  getVendorBills,
  getPartners,
  getProducts,
  getUserProjects,
  ApiSalesOrder,
  ApiPurchaseOrder,
  ApiCustomerInvoice,
  ApiVendorBill,
  ApiPartner,
  ApiProduct,
  ApiProject,
} from "@/lib/api";
import {
  MOCK_EXPENSES,
  MOCK_CUSTOMERS,
  MOCK_VENDORS,
  type Expense,
  type Customer,
  type Vendor,
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const SalesFinance = () => {
  const user = getCurrentUser();
  const userRole = user ? getUserRole(user) : null;
  const [activeTab, setActiveTab] = useState("sales-orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Create dialogs state
  const [isCreateSalesOrderOpen, setIsCreateSalesOrderOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isCreatePurchaseOrderOpen, setIsCreatePurchaseOrderOpen] = useState(false);
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);

  // Form data states
  const [salesOrderForm, setSalesOrderForm] = useState({
    so_number: '',
    customer_id: '',
    project_id: '',
    order_date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    currency: 'INR',
    status: 'draft'
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: '',
    customer_id: '',
    project_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    total_amount: 0,
    currency: 'INR',
    status: 'draft'
  });

  const [purchaseOrderForm, setPurchaseOrderForm] = useState({
    po_number: '',
    vendor_id: '',
    project_id: '',
    order_date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    currency: 'INR',
    status: 'draft'
  });

  const [billForm, setBillForm] = useState({
    bill_number: '',
    vendor_id: '',
    project_id: '',
    bill_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_amount: 0,
    currency: 'INR',
    status: 'draft'
  });

  const [expenseForm, setExpenseForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    project_id: '',
    category: '',
    description: '',
    amount: 0,
    currency: 'INR',
    billable: false,
    status: 'submitted'
  });

  // API Data State
  const [salesOrders, setSalesOrders] = useState<ApiSalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<ApiPurchaseOrder[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<ApiCustomerInvoice[]>([]);
  const [vendorBills, setVendorBills] = useState<ApiVendorBill[]>([]);
  const [partners, setPartners] = useState<ApiPartner[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has finance access
  const hasFinanceAccess = user && ['admin', 'sales_finance'].includes(userRole || '');

  // Local storage helpers
  const getLocalSalesOrders = (): ApiSalesOrder[] => {
    try {
      const stored = localStorage.getItem('localSalesOrders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalSalesOrders = (orders: ApiSalesOrder[]) => {
    localStorage.setItem('localSalesOrders', JSON.stringify(orders));
  };

  const getLocalPurchaseOrders = (): ApiPurchaseOrder[] => {
    try {
      const stored = localStorage.getItem('localPurchaseOrders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalPurchaseOrders = (orders: ApiPurchaseOrder[]) => {
    localStorage.setItem('localPurchaseOrders', JSON.stringify(orders));
  };

  const getLocalInvoices = (): ApiCustomerInvoice[] => {
    try {
      const stored = localStorage.getItem('localInvoices');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalInvoices = (invoices: ApiCustomerInvoice[]) => {
    localStorage.setItem('localInvoices', JSON.stringify(invoices));
  };

  const getLocalBills = (): ApiVendorBill[] => {
    try {
      const stored = localStorage.getItem('localBills');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalBills = (bills: ApiVendorBill[]) => {
    localStorage.setItem('localBills', JSON.stringify(bills));
  };

  const getLocalExpenses = () => {
    try {
      const stored = localStorage.getItem('localExpenses');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalExpenses = (expenses: any[]) => {
    localStorage.setItem('localExpenses', JSON.stringify(expenses));
  };

  // Fetch data from APIs
  useEffect(() => {
    if (hasFinanceAccess && user?.id) {
      setIsLoading(true);
      
      Promise.all([
        getSalesOrders(),
        getPurchaseOrders(),
        getCustomerInvoices(),
        getVendorBills(),
        getPartners(),
        getProducts(),
        getUserProjects(user.id)
      ])
        .then(([
          salesOrdersData,
          purchaseOrdersData,
          invoicesData,
          billsData,
          partnersData,
          productsData,
          projectsData
        ]) => {
          // Combine API data with local data
          setSalesOrders([...salesOrdersData.sales_orders, ...getLocalSalesOrders()]);
          setPurchaseOrders([...purchaseOrdersData.purchase_orders, ...getLocalPurchaseOrders()]);
          setCustomerInvoices([...invoicesData.invoices, ...getLocalInvoices()]);
          setVendorBills([...billsData.bills, ...getLocalBills()]);
          setPartners(partnersData.partners);
          setProducts(productsData.products);
          // Combine managed and member projects
          const allProjects = [...projectsData.managed_projects, ...projectsData.member_projects];
          setProjects(allProjects);
        })
        .catch((error) => {
          console.error('Failed to fetch sales/finance data:', error);
          // Load only local data as fallback
          setSalesOrders(getLocalSalesOrders());
          setPurchaseOrders(getLocalPurchaseOrders());
          setCustomerInvoices(getLocalInvoices());
          setVendorBills(getLocalBills());
        })
        .finally(() => setIsLoading(false));
    }
  }, [hasFinanceAccess, user?.id]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="glass-card max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <h3 className="mt-4 text-lg font-semibold">Loading Sales & Finance Data</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Fetching sales orders, invoices, and bills...
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
      const matchesProject = filterProject === "all" || doc.project_id?.toString() === filterProject;
      const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
      
      return matchesSearch && matchesProject && matchesStatus;
    });
  };

  // Combine mock expenses with local expenses
  const allExpenses = [...MOCK_EXPENSES, ...getLocalExpenses()];

  const filteredSalesOrders = filterDocuments(salesOrders);
  const filteredPurchaseOrders = filterDocuments(purchaseOrders);
  const filteredInvoices = filterDocuments(customerInvoices);
  const filteredBills = filterDocuments(vendorBills);
  const filteredExpenses = filterDocuments(allExpenses);

  // Calculate summary stats
  const totalRevenue = customerInvoices.reduce((sum, inv) => 
    inv.status === 'paid' ? sum + inv.total_amount : sum, 0
  );
  const pendingInvoices = customerInvoices.filter(inv => 
    inv.status === 'posted'
  ).reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalCosts = vendorBills.reduce((sum, bill) => 
    bill.status === 'paid' ? sum + bill.total_amount : sum, 0
  ) + allExpenses.reduce((sum, exp) => 
    exp.status === 'approved' || exp.status === 'paid' ? sum + exp.amount : sum, 0
  );
  const netProfit = totalRevenue - totalCosts;
  const totalExpenses = allExpenses.reduce((sum, exp) => 
    exp.status === 'approved' || exp.status === 'paid' ? sum + exp.amount : sum, 0
  );
  const billableExpenses = allExpenses.filter(exp => 
    (exp.status === 'approved' || exp.status === 'paid') && exp.billable
  ).reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenseApprovals = allExpenses.filter(exp => 
    exp.status === 'submitted'
  ).length;
  const activeSalesOrders = salesOrders.filter(so => 
    so.status === 'confirmed'
  ).length;
  const pendingPOs = purchaseOrders.filter(po => 
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

  // Create handlers
  const handleCreateSalesOrder = () => {
    if (!salesOrderForm.so_number || !salesOrderForm.customer_id || salesOrderForm.customer_id === 'custom') {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedProject = projects.find(p => p.id.toString() === salesOrderForm.project_id);
    const selectedCustomer = MOCK_CUSTOMERS.find(c => c.name === salesOrderForm.customer_id);

    const newSalesOrder: ApiSalesOrder = {
      id: Date.now(),
      so_number: salesOrderForm.so_number,
      customer_id: selectedCustomer?.id ? parseInt(selectedCustomer.id.replace('cust-', '')) : Date.now(),
      customer_name: salesOrderForm.customer_id, // Contains the selected customer name
      project_id: salesOrderForm.project_id ? parseInt(salesOrderForm.project_id) : null,
      project_name: selectedProject?.name || null,
      order_date: salesOrderForm.order_date,
      total_amount: salesOrderForm.total_amount,
      currency: salesOrderForm.currency,
      status: salesOrderForm.status as 'draft' | 'confirmed' | 'sent' | 'cancelled'
    };

    const updatedOrders = [...salesOrders, newSalesOrder];
    setSalesOrders(updatedOrders);
    saveLocalSalesOrders([...getLocalSalesOrders(), newSalesOrder]);

    toast({
      title: "Sales Order Created",
      description: `Sales Order ${salesOrderForm.so_number} has been created successfully.`,
    });

    // Reset form
    setSalesOrderForm({
      so_number: '',
      customer_id: '',
      project_id: '',
      order_date: new Date().toISOString().split('T')[0],
      total_amount: 0,
      currency: 'INR',
      status: 'draft'
    });
    setIsCreateSalesOrderOpen(false);
  };

  const handleCreateInvoice = () => {
    if (!invoiceForm.invoice_number || !invoiceForm.customer_id || invoiceForm.customer_id === 'custom') {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedProject = projects.find(p => p.id.toString() === invoiceForm.project_id);
    const selectedCustomer = MOCK_CUSTOMERS.find(c => c.name === invoiceForm.customer_id);

    const newInvoice: ApiCustomerInvoice = {
      id: Date.now(),
      invoice_number: invoiceForm.invoice_number,
      customer_id: selectedCustomer?.id ? parseInt(selectedCustomer.id.replace('cust-', '')) : Date.now(),
      customer_name: invoiceForm.customer_id, // Contains the selected customer name
      project_id: invoiceForm.project_id ? parseInt(invoiceForm.project_id) : null,
      project_name: selectedProject?.name || null,
      invoice_date: invoiceForm.invoice_date,
      due_date: invoiceForm.due_date,
      total_amount: invoiceForm.total_amount,
      currency: invoiceForm.currency,
      status: invoiceForm.status as 'draft' | 'posted' | 'paid' | 'cancelled'
    };

    const updatedInvoices = [...customerInvoices, newInvoice];
    setCustomerInvoices(updatedInvoices);
    saveLocalInvoices([...getLocalInvoices(), newInvoice]);

    toast({
      title: "Invoice Created",
      description: `Invoice ${invoiceForm.invoice_number} has been created successfully.`,
    });

    // Reset form
    setInvoiceForm({
      invoice_number: '',
      customer_id: '',
      project_id: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_amount: 0,
      currency: 'INR',
      status: 'draft'
    });
    setIsCreateInvoiceOpen(false);
  };

  const handleCreatePurchaseOrder = () => {
    if (!purchaseOrderForm.po_number || !purchaseOrderForm.vendor_id || purchaseOrderForm.vendor_id === 'custom') {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedProject = projects.find(p => p.id.toString() === purchaseOrderForm.project_id);
    const selectedVendor = MOCK_VENDORS.find(v => v.name === purchaseOrderForm.vendor_id);

    const newPurchaseOrder: ApiPurchaseOrder = {
      id: Date.now(),
      po_number: purchaseOrderForm.po_number,
      vendor_id: selectedVendor?.id ? parseInt(selectedVendor.id.replace('ven-', '')) : Date.now(),
      vendor_name: purchaseOrderForm.vendor_id, // Contains the selected vendor name
      project_id: purchaseOrderForm.project_id ? parseInt(purchaseOrderForm.project_id) : null,
      project_name: selectedProject?.name || null,
      order_date: purchaseOrderForm.order_date,
      total_amount: purchaseOrderForm.total_amount,
      currency: purchaseOrderForm.currency,
      status: purchaseOrderForm.status as 'draft' | 'confirmed' | 'received' | 'cancelled'
    };

    const updatedOrders = [...purchaseOrders, newPurchaseOrder];
    setPurchaseOrders(updatedOrders);
    saveLocalPurchaseOrders([...getLocalPurchaseOrders(), newPurchaseOrder]);

    toast({
      title: "Purchase Order Created",
      description: `Purchase Order ${purchaseOrderForm.po_number} has been created successfully.`,
    });

    // Reset form
    setPurchaseOrderForm({
      po_number: '',
      vendor_id: '',
      project_id: '',
      order_date: new Date().toISOString().split('T')[0],
      total_amount: 0,
      currency: 'INR',
      status: 'draft'
    });
    setIsCreatePurchaseOrderOpen(false);
  };

  const handleCreateBill = () => {
    if (!billForm.bill_number || !billForm.vendor_id || billForm.vendor_id === 'custom') {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedProject = projects.find(p => p.id.toString() === billForm.project_id);
    const selectedVendor = MOCK_VENDORS.find(v => v.name === billForm.vendor_id);

    const newBill: ApiVendorBill = {
      id: Date.now(),
      bill_number: billForm.bill_number,
      vendor_id: selectedVendor?.id ? parseInt(selectedVendor.id.replace('ven-', '')) : Date.now(),
      vendor_name: billForm.vendor_id, // Contains the selected vendor name
      project_id: billForm.project_id ? parseInt(billForm.project_id) : null,
      project_name: selectedProject?.name || null,
      bill_date: billForm.bill_date,
      due_date: billForm.due_date,
      total_amount: billForm.total_amount,
      currency: billForm.currency,
      status: billForm.status as 'draft' | 'posted' | 'paid' | 'cancelled'
    };

    const updatedBills = [...vendorBills, newBill];
    setVendorBills(updatedBills);
    saveLocalBills([...getLocalBills(), newBill]);

    toast({
      title: "Bill Created",
      description: `Bill ${billForm.bill_number} has been created successfully.`,
    });

    // Reset form
    setBillForm({
      bill_number: '',
      vendor_id: '',
      project_id: '',
      bill_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_amount: 0,
      currency: 'INR',
      status: 'draft'
    });
    setIsCreateBillOpen(false);
  };

  const handleCreateExpense = () => {
    if (!expenseForm.description || !expenseForm.category || !expenseForm.project_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedProject = projects.find(p => p.id.toString() === expenseForm.project_id);

    const newExpense = {
      id: `exp-${Date.now()}`,
      expense_date: expenseForm.expense_date,
      project_id: expenseForm.project_id,
      project_name: selectedProject?.name || '',
      user_id: user?.id || '',
      user_name: user?.name || 'Current User',
      category: expenseForm.category,
      description: expenseForm.description,
      amount: expenseForm.amount,
      currency: expenseForm.currency,
      billable: expenseForm.billable,
      status: expenseForm.status,
      receipt_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedExpenses = [...getLocalExpenses(), newExpense];
    saveLocalExpenses(updatedExpenses);

    toast({
      title: "Expense Created",
      description: `Expense for ${expenseForm.category} has been submitted for approval.`,
    });

    // Reset form
    setExpenseForm({
      expense_date: new Date().toISOString().split('T')[0],
      project_id: '',
      category: '',
      description: '',
      amount: 0,
      currency: 'INR',
      billable: false,
      status: 'submitted'
    });
    setIsCreateExpenseOpen(false);
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
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
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
            {userRole === 'admin' && (
              <Button onClick={() => setIsCreateSalesOrderOpen(true)}>
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
                      <TableCell className="font-medium">{so.so_number}</TableCell>
                      <TableCell>{so.project_name || '-'}</TableCell>
                      <TableCell>{so.customer_name || '-'}</TableCell>
                      <TableCell>{new Date(so.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>-</TableCell>
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
                          {userRole === 'admin' && (
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
            {userRole === 'admin' && (
              <Button onClick={() => setIsCreatePurchaseOrderOpen(true)}>
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
                      <TableCell>{po.project_name || '-'}</TableCell>
                      <TableCell>
                        <div>
                          <div>{po.vendor_name || '-'}</div>
                          <div className="text-xs text-muted-foreground">-</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>-</TableCell>
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
                          {userRole === 'admin' && (
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
            {userRole === 'admin' && (
              <Button onClick={() => setIsCreateInvoiceOpen(true)}>
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
                      <TableCell>{inv.project_name || '-'}</TableCell>
                      <TableCell>{inv.customer_name || '-'}</TableCell>
                      <TableCell>{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(inv.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(inv.total_amount, inv.currency)}</TableCell>
                      <TableCell>{inv.status === 'paid' ? formatCurrency(inv.total_amount, inv.currency) : formatCurrency(0, inv.currency)}</TableCell>
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
                          {userRole === 'admin' && (
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
            {userRole === 'admin' && (
              <Button onClick={() => setIsCreateBillOpen(true)}>
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
                      <TableCell>{bill.project_name || '-'}</TableCell>
                      <TableCell>
                        <div>
                          <div>{bill.vendor_name || '-'}</div>
                          <div className="text-xs text-muted-foreground">-</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(bill.total_amount, bill.currency)}</TableCell>
                      <TableCell>{bill.status === 'paid' ? formatCurrency(bill.total_amount, bill.currency) : formatCurrency(0, bill.currency)}</TableCell>
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
                          {userRole === 'admin' && (
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
            <Button onClick={() => setIsCreateExpenseOpen(true)}>
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
                          {userRole === 'admin' && exp.status === 'submitted' && (
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
                          {(userRole === 'admin' || exp.user_id === user?.id) && (
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
            {userRole === 'admin' && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Sales Order Dialog */}
      <Dialog open={isCreateSalesOrderOpen} onOpenChange={setIsCreateSalesOrderOpen}>
        <DialogContent className="max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle>Create Sales Order</DialogTitle>
            <DialogDescription>
              Create a new sales order for a customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sales Order Number</Label>
              <Input 
                placeholder="SO-2024-001" 
                className="glass-input"
                value={salesOrderForm.so_number}
                onChange={(e) => setSalesOrderForm(prev => ({ ...prev, so_number: e.target.value }))}
              />
            </div>
            <div>
              <Label>Customer Name</Label>
              <Select value={salesOrderForm.customer_id} onValueChange={(value) => setSalesOrderForm(prev => ({ ...prev, customer_id: value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select or type customer name" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CUSTOMERS.map((customer) => (
                    <SelectItem key={customer.id} value={customer.name}>
                      {customer.name} - {customer.email}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add Custom Customer</SelectItem>
                </SelectContent>
              </Select>
              {salesOrderForm.customer_id === 'custom' && (
                <Input 
                  placeholder="Enter custom customer name" 
                  className="glass-input mt-2"
                  onChange={(e) => setSalesOrderForm(prev => ({ ...prev, customer_id: e.target.value }))}
                />
              )}
            </div>
            <div>
              <Label>Project (Optional)</Label>
              <Select value={salesOrderForm.project_id} onValueChange={(value) => setSalesOrderForm(prev => ({ ...prev, project_id: value === 'none' ? '' : value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Date</Label>
                <Input 
                  type="date" 
                  className="glass-input"
                  value={salesOrderForm.order_date}
                  onChange={(e) => setSalesOrderForm(prev => ({ ...prev, order_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="glass-input"
                  value={salesOrderForm.total_amount}
                  onChange={(e) => setSalesOrderForm(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSalesOrderOpen(false)}>
              Cancel
            </Button>
            <Button className="glass-button" onClick={handleCreateSalesOrder}>
              Create Sales Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent className="max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle>Create Customer Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Invoice Number</Label>
              <Input 
                placeholder="INV-2024-001" 
                className="glass-input"
                value={invoiceForm.invoice_number}
                onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoice_number: e.target.value }))}
              />
            </div>
            <div>
              <Label>Customer Name</Label>
              <Select value={invoiceForm.customer_id} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, customer_id: value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select or type customer name" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CUSTOMERS.map((customer) => (
                    <SelectItem key={customer.id} value={customer.name}>
                      {customer.name} - {customer.email}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add Custom Customer</SelectItem>
                </SelectContent>
              </Select>
              {invoiceForm.customer_id === 'custom' && (
                <Input 
                  placeholder="Enter custom customer name" 
                  className="glass-input mt-2"
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, customer_id: e.target.value }))}
                />
              )}
            </div>
            <div>
              <Label>Project (Optional)</Label>
              <Select value={invoiceForm.project_id} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, project_id: value === 'none' ? '' : value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Invoice Date</Label>
                <Input 
                  type="date" 
                  className="glass-input"
                  value={invoiceForm.invoice_date}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoice_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input 
                  type="date" 
                  className="glass-input"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Amount</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className="glass-input"
                value={invoiceForm.total_amount}
                onChange={(e) => setInvoiceForm(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button className="glass-button" onClick={handleCreateInvoice}>
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Purchase Order Dialog */}
      <Dialog open={isCreatePurchaseOrderOpen} onOpenChange={setIsCreatePurchaseOrderOpen}>
        <DialogContent className="max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order for a vendor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Purchase Order Number</Label>
              <Input 
                placeholder="PO-2024-001" 
                className="glass-input"
                value={purchaseOrderForm.po_number}
                onChange={(e) => setPurchaseOrderForm(prev => ({ ...prev, po_number: e.target.value }))}
              />
            </div>
            <div>
              <Label>Vendor Name</Label>
              <Select value={purchaseOrderForm.vendor_id} onValueChange={(value) => setPurchaseOrderForm(prev => ({ ...prev, vendor_id: value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select or type vendor name" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_VENDORS.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.name}>
                      {vendor.name} - {vendor.email}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add Custom Vendor</SelectItem>
                </SelectContent>
              </Select>
              {purchaseOrderForm.vendor_id === 'custom' && (
                <Input 
                  placeholder="Enter custom vendor name" 
                  className="glass-input mt-2"
                  onChange={(e) => setPurchaseOrderForm(prev => ({ ...prev, vendor_id: e.target.value }))}
                />
              )}
            </div>
            <div>
              <Label>Project (Optional)</Label>
              <Select value={purchaseOrderForm.project_id} onValueChange={(value) => setPurchaseOrderForm(prev => ({ ...prev, project_id: value === 'none' ? '' : value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Date</Label>
                <Input 
                  type="date" 
                  className="glass-input"
                  value={purchaseOrderForm.order_date}
                  onChange={(e) => setPurchaseOrderForm(prev => ({ ...prev, order_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="glass-input"
                  value={purchaseOrderForm.total_amount}
                  onChange={(e) => setPurchaseOrderForm(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePurchaseOrderOpen(false)}>
              Cancel
            </Button>
            <Button className="glass-button" onClick={handleCreatePurchaseOrder}>
              Create Purchase Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Bill Dialog */}
      <Dialog open={isCreateBillOpen} onOpenChange={setIsCreateBillOpen}>
        <DialogContent className="max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle>Create Vendor Bill</DialogTitle>
            <DialogDescription>
              Create a new vendor bill
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Bill Number</Label>
              <Input 
                placeholder="BILL-2024-001" 
                className="glass-input"
                value={billForm.bill_number}
                onChange={(e) => setBillForm(prev => ({ ...prev, bill_number: e.target.value }))}
              />
            </div>
            <div>
              <Label>Vendor Name</Label>
              <Select value={billForm.vendor_id} onValueChange={(value) => setBillForm(prev => ({ ...prev, vendor_id: value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select or type vendor name" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_VENDORS.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.name}>
                      {vendor.name} - {vendor.email}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add Custom Vendor</SelectItem>
                </SelectContent>
              </Select>
              {billForm.vendor_id === 'custom' && (
                <Input 
                  placeholder="Enter custom vendor name" 
                  className="glass-input mt-2"
                  onChange={(e) => setBillForm(prev => ({ ...prev, vendor_id: e.target.value }))}
                />
              )}
            </div>
            <div>
              <Label>Project (Optional)</Label>
              <Select value={billForm.project_id} onValueChange={(value) => setBillForm(prev => ({ ...prev, project_id: value === 'none' ? '' : value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bill Date</Label>
                <Input 
                  type="date" 
                  className="glass-input"
                  value={billForm.bill_date}
                  onChange={(e) => setBillForm(prev => ({ ...prev, bill_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input 
                  type="date" 
                  className="glass-input"
                  value={billForm.due_date}
                  onChange={(e) => setBillForm(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Amount</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className="glass-input"
                value={billForm.total_amount}
                onChange={(e) => setBillForm(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateBillOpen(false)}>
              Cancel
            </Button>
            <Button className="glass-button" onClick={handleCreateBill}>
              Create Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Expense Dialog */}
      <Dialog open={isCreateExpenseOpen} onOpenChange={setIsCreateExpenseOpen}>
        <DialogContent className="max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle>Create Expense</DialogTitle>
            <DialogDescription>
              Submit a new expense for approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project</Label>
              <Select value={expenseForm.project_id} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, project_id: value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="meals">Meals</SelectItem>
                  <SelectItem value="office_supplies">Office Supplies</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input 
                placeholder="Describe the expense..." 
                className="glass-input"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" 
                  className="glass-input"
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, expense_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="glass-input"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="billable"
                checked={expenseForm.billable}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, billable: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="billable">Billable to client</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateExpenseOpen(false)}>
              Cancel
            </Button>
            <Button className="glass-button" onClick={handleCreateExpense}>
              Submit Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesFinance;
