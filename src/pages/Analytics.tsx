import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Receipt,
  CreditCard,
  ShoppingCart,
  Wallet,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser } from '@/lib/mockAuth';
import {
  MOCK_ANALYTICS_METRICS,
  MOCK_RESOURCE_UTILIZATION,
  MOCK_PROJECT_PROFITABILITY,
  MOCK_INVOICES,
  MOCK_BILLS,
  MOCK_EXPENSES,
  MOCK_SALES_ORDERS,
  MOCK_PURCHASE_ORDERS,
  MOCK_PROJECTS,
  type AnalyticsMetrics,
  type ResourceUtilization,
  type ProjectProfitability,
} from '@/lib/mockData';

export default function Analytics() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Redirect if not authorized (admin or sales_finance)
  if (!currentUser || !['admin', 'sales_finance'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96 glass-panel">
          <CardHeader>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You don't have permission to view analytics.</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [metrics] = useState<AnalyticsMetrics[]>(MOCK_ANALYTICS_METRICS);
  const [utilization] = useState<ResourceUtilization[]>(MOCK_RESOURCE_UTILIZATION);
  const [profitability] = useState<ProjectProfitability[]>(MOCK_PROJECT_PROFITABILITY);

  const [periodFilter, setPeriodFilter] = useState<string>('last-6-months');

  // Calculate current month KPIs (last item in metrics)
  const currentMetrics = metrics[metrics.length - 1];
  const previousMetrics = metrics[metrics.length - 2];

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = calculateChange(currentMetrics.total_revenue, previousMetrics.total_revenue);
  const profitChange = calculateChange(currentMetrics.profit, previousMetrics.profit);
  const utilizationChange = calculateChange(
    currentMetrics.utilization_rate,
    previousMetrics.utilization_rate
  );

  // Financial calculations for Sales & Finance
  const totalRevenue = MOCK_INVOICES.reduce((sum, inv) => 
    inv.status === 'paid' ? sum + inv.paid_amount : sum, 0
  );
  const pendingRevenue = MOCK_INVOICES.filter(inv => 
    inv.status === 'sent' || inv.status === 'overdue'
  ).reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);
  const totalInvoiced = MOCK_INVOICES.reduce((sum, inv) => sum + inv.total_amount, 0);
  
  const totalCosts = MOCK_BILLS.reduce((sum, bill) => 
    bill.status === 'paid' ? sum + bill.paid_amount : sum, 0
  ) + MOCK_EXPENSES.reduce((sum, exp) => 
    (exp.status === 'approved' || exp.status === 'paid') ? sum + exp.amount : sum, 0
  );
  
  const grossProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  const totalSalesOrders = MOCK_SALES_ORDERS.reduce((sum, so) => sum + so.total_amount, 0);
  const confirmedSO = MOCK_SALES_ORDERS.filter(so => so.status === 'confirmed').length;
  const totalPurchaseOrders = MOCK_PURCHASE_ORDERS.reduce((sum, po) => sum + po.total_amount, 0);
  
  const billableExpenses = MOCK_EXPENSES.filter(exp => 
    (exp.status === 'approved' || exp.status === 'paid') && exp.billable
  ).reduce((sum, exp) => sum + exp.amount, 0);
  
  const collectionEfficiency = totalInvoiced > 0 ? (totalRevenue / totalInvoiced) * 100 : 0;
  const cashFlow = totalRevenue - totalCosts;

  const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'in_progress').length;
  const completedProjects = MOCK_PROJECTS.filter(p => p.status === 'completed').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    // In real app, generate and download file
    console.log('Exporting analytics as', format);
    alert(`Analytics exported as ${format.toUpperCase()}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-500/20 text-green-300',
      completed: 'bg-blue-500/20 text-blue-300',
      on_hold: 'bg-yellow-500/20 text-yellow-300',
      cancelled: 'bg-red-500/20 text-red-300',
    };
    return (
      <Badge className={variants[status] || variants.active}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-1 via-accent-2 to-purple-500 bg-clip-text text-transparent">
            {currentUser.role === 'sales_finance' ? 'Financial Analytics & Insights' : 'Analytics & Reporting'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {currentUser.role === 'sales_finance' 
              ? 'Comprehensive financial performance, revenue tracking, and profitability analysis'
              : 'Real-time business intelligence and performance metrics'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('csv')} variant="outline" className="glass-panel border-accent-1/30 hover:border-accent-1">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport('pdf')} className="bg-gradient-to-r from-accent-1 to-accent-2 hover:from-accent-1/80 hover:to-accent-2/80">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue={currentUser.role === 'sales_finance' ? 'financial' : 'overview'} className="space-y-6">
        <TabsList className="glass-panel">
          {currentUser.role === 'sales_finance' && (
            <TabsTrigger value="financial">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial Overview
            </TabsTrigger>
          )}
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            {currentUser.role === 'sales_finance' ? 'Operations' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="profitability">
            <Wallet className="w-4 h-4 mr-2" />
            Project Profitability
          </TabsTrigger>
          <TabsTrigger value="utilization">
            <Users className="w-4 h-4 mr-2" />
            Resource Utilization
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Financial Overview Tab - For Sales & Finance */}
        {currentUser.role === 'sales_finance' && (
          <TabsContent value="financial" className="space-y-6">
            {/* Financial Performance KPIs */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent-1" />
                Financial Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card border-accent-1/20 hover:border-accent-1/40 transition-all hover:translate-y-[-2px]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      {revenueChange >= 0 ? (
                        <><ArrowUpRight className="w-3 h-3 text-green-400" /> <span className="text-green-400">+{revenueChange.toFixed(1)}%</span></>
                      ) : (
                        <><ArrowDownRight className="w-3 h-3 text-red-400" /> <span className="text-red-400">{revenueChange.toFixed(1)}%</span></>
                      )}
                      <span className="ml-1">vs last period</span>
                    </p>
                    <div className="mt-3 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Collection Rate</span>
                        <span className="text-foreground font-medium">{collectionEfficiency.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-blue-500/20 hover:border-blue-500/40 transition-all hover:translate-y-[-2px]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Wallet className="h-5 w-5 text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${grossProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {formatCurrency(grossProfit)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      {profitChange >= 0 ? (
                        <><ArrowUpRight className="w-3 h-3 text-green-400" /> <span className="text-green-400">+{profitChange.toFixed(1)}%</span></>
                      ) : (
                        <><ArrowDownRight className="w-3 h-3 text-red-400" /> <span className="text-red-400">{profitChange.toFixed(1)}%</span></>
                      )}
                      <span className="ml-1">vs last period</span>
                    </p>
                    <div className="mt-3 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Profit Margin</span>
                        <span className={`font-medium ${profitMargin >= 20 ? 'text-green-400' : profitMargin >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-purple-500/20 hover:border-purple-500/40 transition-all hover:translate-y-[-2px]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Costs</CardTitle>
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <CreditCard className="h-5 w-5 text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-400">{formatCurrency(totalCosts)}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Bills + Expenses
                    </p>
                    <div className="mt-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Billable</span>
                        <span className="text-green-400">{formatCurrency(billableExpenses)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-orange-500/20 hover:border-orange-500/40 transition-all hover:translate-y-[-2px]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Cash Flow</CardTitle>
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Activity className="h-5 w-5 text-orange-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${cashFlow >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                      {formatCurrency(cashFlow)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Revenue - Costs
                    </p>
                    <div className="mt-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending AR</span>
                        <span className="text-yellow-400">{formatCurrency(pendingRevenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sales & Operations Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-accent-2" />
                Sales & Operations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card border-glass-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Sales Orders</CardTitle>
                    <Receipt className="h-4 w-4 text-accent-1" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(totalSalesOrders)}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="text-accent-1">{confirmedSO} Confirmed</span> orders
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-glass-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Purchase Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-accent-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(totalPurchaseOrders)}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total PO value
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-glass-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Invoiced</CardTitle>
                    <Receipt className="h-4 w-4 text-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(totalInvoiced)}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total invoiced amount
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-glass-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                    <Target className="h-4 w-4 text-accent-1" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{activeProjects}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {completedProjects} completed
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Financial Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent-1" />
                    Revenue & Profit Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics.slice(-6).map((metric, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{metric.period}</span>
                        <div className="flex gap-4">
                          <span className="text-green-400">{formatCurrency(metric.total_revenue)}</span>
                          <span className="text-blue-400">{formatCurrency(metric.profit)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-glass rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-blue-400" 
                          style={{ width: `${Math.min((metric.profit / metric.total_revenue) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-accent-2" />
                    Project Profitability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profitability.slice(0, 6).map((project) => (
                    <div key={project.project_id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground truncate">{project.project_name}</span>
                        <Badge className={project.profit >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {project.profit >= 0 ? '+' : ''}{formatCurrency(project.profit)}
                        </Badge>
                      </div>
                      <Progress value={Math.min(Math.max(project.profit_margin + 50, 0), 100)} className="h-2" />
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span>Margin: <span className="text-foreground">{project.profit_margin.toFixed(1)}%</span></span>
                        <span>Revenue: <span className="text-foreground">{formatCurrency(project.revenue)}</span></span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{currentMetrics.total_revenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}
                  >
                    {revenueChange >= 0 ? '↑' : '↓'} {Math.abs(revenueChange).toFixed(1)}%
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{currentMetrics.profit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={profitChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {profitChange >= 0 ? '↑' : '↓'} {Math.abs(profitChange).toFixed(1)}%
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMetrics.profit_margin.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Current month margin</p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMetrics.utilization_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={utilizationChange >= 0 ? 'text-green-400' : 'text-red-400'}
                  >
                    {utilizationChange >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(utilizationChange).toFixed(1)}%
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Billable vs Non-Billable Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Billable</span>
                    <span className="font-medium">
                      {currentMetrics.billable_hours} hrs
                    </span>
                  </div>
                  <Progress
                    value={
                      (currentMetrics.billable_hours /
                        (currentMetrics.billable_hours +
                          currentMetrics.non_billable_hours)) *
                      100
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Non-Billable</span>
                    <span className="font-medium">
                      {currentMetrics.non_billable_hours} hrs
                    </span>
                  </div>
                  <Progress
                    value={
                      (currentMetrics.non_billable_hours /
                        (currentMetrics.billable_hours +
                          currentMetrics.non_billable_hours)) *
                      100
                    }
                    className="h-2 bg-gray-600"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Project Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Projects</span>
                  <span className="text-2xl font-bold text-green-400">
                    {currentMetrics.projects_active}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {currentMetrics.projects_completed}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Project Duration</span>
                  <span className="text-xl font-bold">
                    {currentMetrics.avg_project_duration} days
                  </span>
                </div>
                {currentMetrics.customer_satisfaction && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Customer Satisfaction</span>
                    <span className="text-xl font-bold text-yellow-400">
                      {currentMetrics.customer_satisfaction}/5
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Project Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Project Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Team Size</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitability.map((project) => (
                    <TableRow key={project.project_id}>
                      <TableCell className="font-medium">{project.project_name}</TableCell>
                      <TableCell>₹{project.budget.toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <div>₹{project.spent.toLocaleString()}</div>
                          <Progress
                            value={(project.spent / project.budget) * 100}
                            className="h-1 mt-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>₹{project.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={
                            project.profit >= 0 ? 'text-green-400' : 'text-red-400'
                          }
                        >
                          ₹{project.profit.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            project.profit_margin >= 20
                              ? 'text-green-400'
                              : project.profit_margin >= 10
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }
                        >
                          {project.profit_margin.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>{project.hours_logged}</TableCell>
                      <TableCell>{project.team_size}</TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Profitability Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹
                  {profitability
                    .reduce((sum, p) => sum + p.budget, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹
                  {profitability
                    .reduce((sum, p) => sum + p.spent, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  ₹
                  {profitability
                    .reduce((sum, p) => sum + p.revenue, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Total Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  ₹
                  {profitability
                    .reduce((sum, p) => sum + p.profit, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resource Utilization Tab */}
        <TabsContent value="utilization" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Team Resource Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Billable Hours</TableHead>
                    <TableHead>Utilization Rate</TableHead>
                    <TableHead>Revenue Generated</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Efficiency Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {utilization.map((resource) => (
                    <TableRow key={resource.user_id}>
                      <TableCell className="font-medium">{resource.user_name}</TableCell>
                      <TableCell>{resource.role}</TableCell>
                      <TableCell>{resource.total_hours}</TableCell>
                      <TableCell>{resource.billable_hours}</TableCell>
                      <TableCell>
                        <div>
                          <div className="mb-1">
                            {resource.utilization_rate.toFixed(1)}%
                          </div>
                          <Progress
                            value={resource.utilization_rate}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-green-400">
                        ₹{resource.revenue_generated.toLocaleString()}
                      </TableCell>
                      <TableCell>{resource.projects_count}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            resource.efficiency_score >= 90
                              ? 'bg-green-500/20 text-green-300'
                              : resource.efficiency_score >= 75
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-red-500/20 text-red-300'
                          }
                        >
                          {resource.efficiency_score}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Utilization Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Team Average Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    utilization.reduce((sum, r) => sum + r.utilization_rate, 0) /
                    utilization.length
                  ).toFixed(1)}
                  %
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Total Hours Logged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {utilization.reduce((sum, r) => sum + r.total_hours, 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  ₹
                  {utilization
                    .reduce((sum, r) => sum + r.revenue_generated, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-sm">Average Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    utilization.reduce((sum, r) => sum + r.efficiency_score, 0) /
                    utilization.length
                  ).toFixed(1)}
                  %
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>6-Month Trend Analysis</CardTitle>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-48 glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="last-12-months">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Billable Hrs</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Projects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.period}>
                      <TableCell className="font-medium">{metric.period}</TableCell>
                      <TableCell>₹{metric.total_revenue.toLocaleString()}</TableCell>
                      <TableCell>₹{metric.total_cost.toLocaleString()}</TableCell>
                      <TableCell className="text-green-400">
                        ₹{metric.profit.toLocaleString()}
                      </TableCell>
                      <TableCell>{metric.profit_margin.toFixed(1)}%</TableCell>
                      <TableCell>{metric.billable_hours}</TableCell>
                      <TableCell>{metric.utilization_rate.toFixed(1)}%</TableCell>
                      <TableCell>
                        {metric.projects_active} active / {metric.projects_completed}{' '}
                        completed
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
