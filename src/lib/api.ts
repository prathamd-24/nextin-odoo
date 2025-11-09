// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://5000-01k9h4qtcbgt45rbhvp5cjgz48.cloudspaces.litng.ai',
  ENDPOINTS: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    USER_PROJECTS: '/users/{userId}/projects',
    USER_TASKS: '/users/{userId}/tasks',
    CREATE_TASK: '/projects/{projectId}/tasks',
    TASK_ASSIGNMENTS: '/tasks/{taskId}/assignments',
    // Add other endpoints here as needed
  }
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Common fetch options for API calls
export const getApiHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
  };
};

// Helper function for making API requests with proper error handling
export const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    credentials: 'include', // Include cookies for session management
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Project-related types
export interface ApiProject {
  id: number;
  project_code: string;
  name: string;
  description: string;
  role: string;
  status: string;
  start_date: string;
  end_date: string;
  budget_amount?: number;
  added_at?: string;
}

export interface UserProjectsResponse {
  user_id: number;
  email: string;
  managed_projects: ApiProject[];
  member_projects: ApiProject[];
  total_projects: number;
}

// Get user's projects
export const getUserProjects = async (userId: number): Promise<UserProjectsResponse> => {
  const endpoint = API_CONFIG.ENDPOINTS.USER_PROJECTS.replace('{userId}', userId.toString());
  return apiCall(endpoint);
};

// Project creation and management types
export interface CreateProjectRequest {
  project_code: string;
  name: string;
  description: string;
  project_manager_id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive' | 'completed' | 'on_hold';
  budget_amount?: number;
}

export interface CreateProjectResponse {
  message: string;
  project: {
    id: number;
    project_code: string;
    name: string;
    description: string;
    project_manager_id: number;
    start_date: string;
    end_date: string;
    status: string;
    budget_amount?: number;
    created_at: string;
  };
}

export interface GetAllProjectsResponse {
  projects: Array<{
    id: number;
    project_code: string;
    name: string;
    description: string;
    project_manager_id: number;
    start_date: string;
    end_date: string;
    status: string;
    budget_amount?: number;
    created_at: string;
  }>;
}

// Create new project
export const createProject = async (projectData: CreateProjectRequest): Promise<CreateProjectResponse> => {
  return apiCall('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
};

// Get all projects
export const getAllProjects = async (): Promise<GetAllProjectsResponse> => {
  return apiCall('/projects');
};

// Task-related types
export interface ApiTask {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  state: 'todo' | 'in_progress' | 'done';
  due_date: string;
  project_id?: number;
  project_name?: string;
  created_by?: number;
  assigned_at?: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  state: 'todo' | 'in_progress' | 'done';
  due_date: string;
}

export interface CreateTaskResponse {
  message: string;
  task: ApiTask;
}

export interface UserTasksResponse {
  user_id: number;
  email: string;
  assigned_tasks: ApiTask[];
  total_tasks: number;
}

export interface TaskAssignmentRequest {
  user_id: number;
}

export interface TaskAssignmentResponse {
  message: string;
  assignment: {
    id: number;
    task_id: number;
    user_id: number;
    user_email: string;
    assigned_at: string;
  };
}

// Create task in project
export const createTask = async (projectId: number, task: CreateTaskRequest): Promise<CreateTaskResponse> => {
  return apiCall(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
};

// Get user's tasks
export const getUserTasks = async (userId: number): Promise<UserTasksResponse> => {
  return apiCall(`/users/${userId}/tasks`);
};

// Assign task to user
export const assignTask = async (taskId: number, userId: number): Promise<TaskAssignmentResponse> => {
  return apiCall(`/tasks/${taskId}/assignments`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
};

// Unassign task
export const unassignTask = async (taskId: number, assignmentId: number): Promise<{ message: string }> => {
  return apiCall(`/tasks/${taskId}/assignments/${assignmentId}`, {
    method: 'DELETE',
  });
};

// Project member management types and functions
export interface ProjectMemberRequest {
  user_id: number;
  role_in_project: string;
}

export interface ProjectMemberResponse {
  message: string;
  member: {
    id: number;
    project_id: number;
    user_id: number;
    user_email: string;
    role_in_project: string;
    added_at: string;
  };
}

// Add project member
export const addProjectMember = async (projectId: number, memberData: ProjectMemberRequest): Promise<ProjectMemberResponse> => {
  return apiCall(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify(memberData),
  });
};

// Remove project member
export const removeProjectMember = async (projectId: number, memberId: number): Promise<{ message: string }> => {
  return apiCall(`/projects/${projectId}/members/${memberId}`, {
    method: 'DELETE',
  });
};

// Timesheet-related types and functions
export interface ApiTimesheet {
  id: number;
  project_id: number;
  project_name?: string;
  task_id: number;
  task_title?: string;
  user_id: number;
  user_email?: string;
  work_date: string;
  hours: number;
  billable: boolean;
  internal_cost_rate?: number;
  cost_amount?: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  linked_invoice_line_id?: number;
  notes?: string;
  created_at: string;
}

export interface CreateTimesheetRequest {
  project_id: number;
  task_id: number;
  work_date: string;
  hours: number;
  billable: boolean;
  internal_cost_rate?: number;
  notes?: string;
}

export interface TimesheetResponse {
  message: string;
  timesheet: ApiTimesheet;
}

export interface UserTimesheetsResponse {
  user_id: number;
  email: string;
  timesheets: ApiTimesheet[];
  total_timesheets: number;
  total_hours: number;
  billable_hours: number;
}

// Get user's timesheets
export const getUserTimesheets = async (userId: number): Promise<UserTimesheetsResponse> => {
  return apiCall(`/users/${userId}/timesheets`);
};

// Create timesheet
export const createTimesheet = async (timesheetData: CreateTimesheetRequest): Promise<TimesheetResponse> => {
  return apiCall(`/timesheets`, {
    method: 'POST',
    body: JSON.stringify(timesheetData),
  });
};

// Update timesheet status (approve/reject)
export const updateTimesheetStatus = async (
  timesheetId: number, 
  status: 'approved' | 'rejected',
  notes?: string
): Promise<{ message: string; timesheet: ApiTimesheet }> => {
  return apiCall(`/timesheets/${timesheetId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes }),
  });
};

// =============================================
// SALES & FINANCE API FUNCTIONS
// =============================================

// Partner types and interfaces
export interface ApiPartner {
  id: number;
  name: string;
  partner_type: 'customer' | 'vendor' | 'both';
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface CreatePartnerRequest {
  name: string;
  partner_type: 'customer' | 'vendor' | 'both';
  email: string;
  phone?: string;
  address?: string;
}

// Product types and interfaces
export interface ApiProduct {
  id: number;
  name: string;
  product_type: 'product' | 'service' | 'consumable';
  description?: string;
  sale_price: number;
  cost_price: number;
  created_at: string;
}

export interface CreateProductRequest {
  name: string;
  product_type: 'product' | 'service' | 'consumable';
  description?: string;
  sale_price: number;
  cost_price: number;
}

// Sales Order types and interfaces
export interface ApiSalesOrderLine {
  id: number;
  product_id?: number;
  product_name?: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  milestone_flag: boolean;
}

export interface ApiSalesOrder {
  id: number;
  so_number: string;
  customer_id: number;
  customer_name?: string;
  project_id?: number;
  project_name?: string;
  order_date: string;
  status: 'draft' | 'confirmed' | 'done' | 'cancelled';
  currency: string;
  notes?: string;
  created_at: string;
  lines?: ApiSalesOrderLine[];
  lines_count?: number;
  total_amount: number;
}

export interface CreateSalesOrderRequest {
  so_number: string;
  customer_id: number;
  project_id?: number;
  order_date: string;
  status?: 'draft' | 'confirmed' | 'done' | 'cancelled';
  currency?: string;
  notes?: string;
  lines?: Array<{
    product_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    milestone_flag?: boolean;
  }>;
}

// Customer Invoice types and interfaces
export interface ApiCustomerInvoiceLine {
  id: number;
  product_id?: number;
  product_name?: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ApiCustomerInvoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  customer_name?: string;
  project_id?: number;
  project_name?: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  currency: string;
  notes?: string;
  created_at: string;
  lines?: ApiCustomerInvoiceLine[];
  total_amount: number;
}

export interface CreateCustomerInvoiceRequest {
  invoice_number: string;
  customer_id: number;
  project_id?: number;
  invoice_date: string;
  due_date: string;
  status?: 'draft' | 'posted' | 'paid' | 'cancelled';
  currency?: string;
  notes?: string;
  lines?: Array<{
    product_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
  }>;
}

// Purchase Order types and interfaces
export interface ApiPurchaseOrderLine {
  id: number;
  product_id?: number;
  product_name?: string;
  description: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}

export interface ApiPurchaseOrder {
  id: number;
  po_number: string;
  vendor_id: number;
  vendor_name?: string;
  project_id?: number;
  project_name?: string;
  order_date: string;
  status: 'draft' | 'confirmed' | 'done' | 'cancelled';
  currency: string;
  notes?: string;
  created_at: string;
  lines?: ApiPurchaseOrderLine[];
  lines_count?: number;
  total_amount: number;
}

export interface CreatePurchaseOrderRequest {
  po_number: string;
  vendor_id: number;
  project_id?: number;
  order_date: string;
  status?: 'draft' | 'confirmed' | 'done' | 'cancelled';
  currency?: string;
  notes?: string;
  lines?: Array<{
    product_id?: number;
    description: string;
    quantity: number;
    unit_cost: number;
  }>;
}

// Vendor Bill types and interfaces
export interface ApiVendorBillLine {
  id: number;
  product_id?: number;
  product_name?: string;
  description: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}

export interface ApiVendorBill {
  id: number;
  bill_number: string;
  vendor_id: number;
  vendor_name?: string;
  project_id?: number;
  project_name?: string;
  bill_date: string;
  due_date: string;
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  currency: string;
  notes?: string;
  created_at: string;
  lines?: ApiVendorBillLine[];
  total_amount: number;
}

export interface CreateVendorBillRequest {
  bill_number: string;
  vendor_id: number;
  project_id?: number;
  bill_date: string;
  due_date: string;
  status?: 'draft' | 'posted' | 'paid' | 'cancelled';
  currency?: string;
  notes?: string;
  lines?: Array<{
    product_id?: number;
    description: string;
    quantity: number;
    unit_cost: number;
  }>;
}

// =============================================
// PARTNER API FUNCTIONS
// =============================================

// Get all partners
export const getPartners = async (partnerType?: 'customer' | 'vendor'): Promise<{ partners: ApiPartner[] }> => {
  const params = partnerType ? `?partner_type=${partnerType}` : '';
  return apiCall(`/partners${params}`);
};

// Get specific partner
export const getPartner = async (partnerId: number): Promise<{ partner: ApiPartner }> => {
  return apiCall(`/partners/${partnerId}`);
};

// Create partner
export const createPartner = async (partnerData: CreatePartnerRequest): Promise<{ message: string; partner: ApiPartner }> => {
  return apiCall('/partners', {
    method: 'POST',
    body: JSON.stringify(partnerData),
  });
};

// Update partner
export const updatePartner = async (partnerId: number, partnerData: Partial<CreatePartnerRequest>): Promise<{ message: string; partner: ApiPartner }> => {
  return apiCall(`/partners/${partnerId}`, {
    method: 'PUT',
    body: JSON.stringify(partnerData),
  });
};

// =============================================
// PRODUCT API FUNCTIONS
// =============================================

// Get all products
export const getProducts = async (): Promise<{ products: ApiProduct[] }> => {
  return apiCall('/products');
};

// Create product
export const createProduct = async (productData: CreateProductRequest): Promise<{ message: string; product: ApiProduct }> => {
  return apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

// Update product
export const updateProduct = async (productId: number, productData: Partial<CreateProductRequest>): Promise<{ message: string; product: ApiProduct }> => {
  return apiCall(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

// =============================================
// SALES ORDER API FUNCTIONS
// =============================================

// Get all sales orders
export const getSalesOrders = async (): Promise<{ sales_orders: ApiSalesOrder[] }> => {
  return apiCall('/sales-orders');
};

// Get specific sales order
export const getSalesOrder = async (salesOrderId: number): Promise<{ sales_order: ApiSalesOrder }> => {
  return apiCall(`/sales-orders/${salesOrderId}`);
};

// Create sales order
export const createSalesOrder = async (salesOrderData: CreateSalesOrderRequest): Promise<{ message: string; sales_order: ApiSalesOrder }> => {
  return apiCall('/sales-orders', {
    method: 'POST',
    body: JSON.stringify(salesOrderData),
  });
};

// Update sales order
export const updateSalesOrder = async (salesOrderId: number, salesOrderData: Partial<CreateSalesOrderRequest>): Promise<{ message: string; sales_order: ApiSalesOrder }> => {
  return apiCall(`/sales-orders/${salesOrderId}`, {
    method: 'PUT',
    body: JSON.stringify(salesOrderData),
  });
};

// Delete sales order
export const deleteSalesOrder = async (salesOrderId: number): Promise<{ message: string }> => {
  return apiCall(`/sales-orders/${salesOrderId}`, {
    method: 'DELETE',
  });
};

// =============================================
// CUSTOMER INVOICE API FUNCTIONS
// =============================================

// Get all customer invoices
export const getCustomerInvoices = async (): Promise<{ invoices: ApiCustomerInvoice[] }> => {
  return apiCall('/customer-invoices');
};

// Get specific customer invoice
export const getCustomerInvoice = async (invoiceId: number): Promise<{ invoice: ApiCustomerInvoice }> => {
  return apiCall(`/customer-invoices/${invoiceId}`);
};

// Create customer invoice
export const createCustomerInvoice = async (invoiceData: CreateCustomerInvoiceRequest): Promise<{ message: string; invoice: ApiCustomerInvoice }> => {
  return apiCall('/customer-invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });
};

// Update customer invoice
export const updateCustomerInvoice = async (invoiceId: number, invoiceData: Partial<CreateCustomerInvoiceRequest>): Promise<{ message: string; invoice: ApiCustomerInvoice }> => {
  return apiCall(`/customer-invoices/${invoiceId}`, {
    method: 'PUT',
    body: JSON.stringify(invoiceData),
  });
};

// Delete customer invoice
export const deleteCustomerInvoice = async (invoiceId: number): Promise<{ message: string }> => {
  return apiCall(`/customer-invoices/${invoiceId}`, {
    method: 'DELETE',
  });
};

// =============================================
// PURCHASE ORDER API FUNCTIONS
// =============================================

// Get all purchase orders
export const getPurchaseOrders = async (): Promise<{ purchase_orders: ApiPurchaseOrder[] }> => {
  return apiCall('/purchase-orders');
};

// Get specific purchase order
export const getPurchaseOrder = async (purchaseOrderId: number): Promise<{ purchase_order: ApiPurchaseOrder }> => {
  return apiCall(`/purchase-orders/${purchaseOrderId}`);
};

// Create purchase order
export const createPurchaseOrder = async (purchaseOrderData: CreatePurchaseOrderRequest): Promise<{ message: string; purchase_order: ApiPurchaseOrder }> => {
  return apiCall('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(purchaseOrderData),
  });
};

// Update purchase order
export const updatePurchaseOrder = async (purchaseOrderId: number, purchaseOrderData: Partial<CreatePurchaseOrderRequest>): Promise<{ message: string; purchase_order: ApiPurchaseOrder }> => {
  return apiCall(`/purchase-orders/${purchaseOrderId}`, {
    method: 'PUT',
    body: JSON.stringify(purchaseOrderData),
  });
};

// Delete purchase order
export const deletePurchaseOrder = async (purchaseOrderId: number): Promise<{ message: string }> => {
  return apiCall(`/purchase-orders/${purchaseOrderId}`, {
    method: 'DELETE',
  });
};

// =============================================
// VENDOR BILL API FUNCTIONS
// =============================================

// Get all vendor bills
export const getVendorBills = async (): Promise<{ bills: ApiVendorBill[] }> => {
  return apiCall('/vendor-bills');
};

// Get specific vendor bill
export const getVendorBill = async (billId: number): Promise<{ bill: ApiVendorBill }> => {
  return apiCall(`/vendor-bills/${billId}`);
};

// Create vendor bill
export const createVendorBill = async (billData: CreateVendorBillRequest): Promise<{ message: string; bill: ApiVendorBill }> => {
  return apiCall('/vendor-bills', {
    method: 'POST',
    body: JSON.stringify(billData),
  });
};

// Update vendor bill
export const updateVendorBill = async (billId: number, billData: Partial<CreateVendorBillRequest>): Promise<{ message: string; bill: ApiVendorBill }> => {
  return apiCall(`/vendor-bills/${billId}`, {
    method: 'PUT',
    body: JSON.stringify(billData),
  });
};

// Delete vendor bill
export const deleteVendorBill = async (billId: number): Promise<{ message: string }> => {
  return apiCall(`/vendor-bills/${billId}`, {
    method: 'DELETE',
  });
};