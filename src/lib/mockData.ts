// Mock data matching the schema for demo purposes

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Project {
  id: string;
  project_code: string;
  name: string;
  description?: string;
  project_manager_id: string;
  project_manager_name?: string;
  team_member_ids: string[];
  status: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  budget_amount: number;
  budget_spent: number;
  currency: string;
  progress: number;
  customer_id?: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assignee_ids: string[];
  state: 'new' | 'in_progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  estimated_hours?: number;
  tags?: string[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_size: number; // in bytes
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
}

export interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  hours: number;
  description: string;
  logged_date: string;
  created_at: string;
}

export interface Timesheet {
  id: string;
  user_id: string;
  user_name?: string;
  project_id: string;
  project_name?: string;
  task_id?: string;
  task_title?: string;
  work_date: string;
  hours: number;
  description?: string;
  billable: boolean;
  hourly_rate?: number;
  currency?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'billed';
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at?: string;
}

export interface SalesOrder {
  id: string;
  so_number: string;
  project_id: string;
  project_name?: string;
  customer_id: string;
  customer_name?: string;
  order_date: string;
  delivery_date?: string;
  status: 'draft' | 'confirmed' | 'done' | 'cancelled';
  total_amount: number;
  currency: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  project_id: string;
  project_name?: string;
  vendor_name: string;
  vendor_email?: string;
  order_date: string;
  expected_delivery?: string;
  status: 'draft' | 'confirmed' | 'received' | 'cancelled';
  total_amount: number;
  currency: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  project_id: string;
  project_name?: string;
  customer_id: string;
  customer_name?: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total_amount: number;
  paid_amount: number;
  currency: string;
  payment_terms?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface Bill {
  id: string;
  bill_number: string;
  project_id: string;
  project_name?: string;
  vendor_name: string;
  vendor_email?: string;
  bill_date: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  total_amount: number;
  paid_amount: number;
  currency: string;
  payment_terms?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  project_id: string;
  project_name?: string;
  user_id: string;
  user_name?: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  billable: boolean;
  receipt_url?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at?: string;
}

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Priya Manager',
    email: 'pm@acme.com',
    role: 'Project Manager',
  },
  {
    id: '2',
    name: 'Arun Dev',
    email: 'dev@acme.com',
    role: 'Developer',
  },
  {
    id: '3',
    name: 'Sameer Finance',
    email: 'finance@acme.com',
    role: 'Finance Manager',
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@acme.com',
    role: 'Administrator',
  },
  {
    id: '5',
    name: 'Ravi Kumar',
    email: 'ravi@acme.com',
    role: 'Designer',
  },
  {
    id: '6',
    name: 'Anita Sharma',
    email: 'anita@acme.com',
    role: 'QA Engineer',
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'TechCorp India',
    email: 'contact@techcorp.in',
    phone: '+91-9876543210',
  },
  {
    id: 'cust-2',
    name: 'StartupHub',
    email: 'hello@startuphub.com',
    phone: '+91-9876543211',
  },
  {
    id: 'cust-3',
    name: 'Enterprise Solutions Ltd',
    email: 'info@enterprise.com',
    phone: '+91-9876543212',
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    project_code: 'PRJ-0001',
    name: 'Brand Website Redesign',
    description: 'Complete redesign of corporate website with modern UI/UX',
    project_manager_id: '1',
    project_manager_name: 'Priya Manager',
    team_member_ids: ['2', '5', '6'],
    status: 'in_progress',
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    budget_amount: 150000,
    budget_spent: 67500,
    currency: 'INR',
    progress: 45,
    customer_id: 'cust-1',
  },
  {
    id: 'proj-2',
    project_code: 'PRJ-0002',
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    project_manager_id: '1',
    project_manager_name: 'Priya Manager',
    team_member_ids: ['2', '6'],
    status: 'planned',
    start_date: '2025-02-01',
    end_date: '2025-06-30',
    budget_amount: 300000,
    budget_spent: 0,
    currency: 'INR',
    progress: 0,
    customer_id: 'cust-2',
  },
  {
    id: 'proj-3',
    project_code: 'PRJ-0003',
    name: 'Marketing Campaign Q1',
    description: 'Q1 digital marketing campaign across multiple channels',
    project_manager_id: '1',
    project_manager_name: 'Priya Manager',
    team_member_ids: ['5'],
    status: 'on_hold',
    start_date: '2025-01-15',
    end_date: '2025-04-15',
    budget_amount: 80000,
    budget_spent: 16000,
    currency: 'INR',
    progress: 20,
    customer_id: 'cust-1',
  },
  {
    id: 'proj-4',
    project_code: 'PRJ-0004',
    name: 'ERP System Integration',
    description: 'Integration of enterprise resource planning system',
    project_manager_id: '1',
    project_manager_name: 'Priya Manager',
    team_member_ids: ['2', '6'],
    status: 'completed',
    start_date: '2024-10-01',
    end_date: '2024-12-31',
    budget_amount: 500000,
    budget_spent: 485000,
    currency: 'INR',
    progress: 100,
    customer_id: 'cust-3',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    project_id: 'proj-1',
    title: 'Design Homepage Mockups',
    description: 'Create high-fidelity mockups for the new homepage design',
    assignee_ids: ['5'],
    state: 'in_progress',
    priority: 'high',
    due_date: '2025-01-20',
    created_by: '1',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-10T14:30:00Z',
    estimated_hours: 16,
    tags: ['design', 'ui/ux'],
  },
  {
    id: 'task-2',
    project_id: 'proj-1',
    title: 'Build Responsive Layout',
    description: 'Implement responsive layout using React and Tailwind CSS. Ensure compatibility with mobile, tablet, and desktop viewports.',
    assignee_ids: ['2'],
    state: 'new',
    priority: 'medium',
    due_date: '2025-01-25',
    created_by: '1',
    created_at: '2025-01-05T10:00:00Z',
    estimated_hours: 24,
    tags: ['frontend', 'development'],
  },
  {
    id: 'task-3',
    project_id: 'proj-1',
    title: 'Content Migration',
    description: 'Migrate existing content to new CMS',
    assignee_ids: ['2'],
    state: 'done',
    priority: 'low',
    due_date: '2025-01-15',
    created_by: '1',
    created_at: '2025-01-03T10:00:00Z',
    updated_at: '2025-01-15T16:00:00Z',
    estimated_hours: 8,
    tags: ['content', 'migration'],
  },
  {
    id: 'task-4',
    project_id: 'proj-1',
    title: 'Setup CI/CD Pipeline',
    description: 'Configure automated build and deployment pipeline',
    assignee_ids: ['2', '6'],
    state: 'blocked',
    priority: 'urgent',
    due_date: '2025-01-18',
    created_by: '1',
    created_at: '2025-01-04T10:00:00Z',
    updated_at: '2025-01-12T09:00:00Z',
    estimated_hours: 12,
    tags: ['devops', 'infrastructure'],
  },
  {
    id: 'task-5',
    project_id: 'proj-2',
    title: 'Design App Navigation',
    description: 'Create navigation flow and wireframes for mobile app',
    assignee_ids: ['5'],
    state: 'new',
    priority: 'high',
    due_date: '2025-02-05',
    created_by: '1',
    created_at: '2025-01-20T10:00:00Z',
    estimated_hours: 20,
    tags: ['design', 'mobile'],
  },
  {
    id: 'task-6',
    project_id: 'proj-2',
    title: 'Implement User Authentication',
    description: 'Build secure authentication system with JWT tokens',
    assignee_ids: ['2'],
    state: 'new',
    priority: 'urgent',
    due_date: '2025-02-10',
    created_by: '1',
    created_at: '2025-01-20T10:00:00Z',
    estimated_hours: 32,
    tags: ['backend', 'security'],
  },
  {
    id: 'task-7',
    project_id: 'proj-3',
    title: 'Create Social Media Assets',
    description: 'Design graphics for social media campaign',
    assignee_ids: ['5'],
    state: 'in_progress',
    priority: 'medium',
    due_date: '2025-01-30',
    created_by: '1',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-16T11:00:00Z',
    estimated_hours: 16,
    tags: ['design', 'marketing'],
  },
  {
    id: 'task-8',
    project_id: 'proj-4',
    title: 'Final Testing & QA',
    description: 'Comprehensive testing of ERP integration',
    assignee_ids: ['6'],
    state: 'done',
    priority: 'high',
    due_date: '2024-12-28',
    created_by: '1',
    created_at: '2024-12-20T10:00:00Z',
    updated_at: '2024-12-28T18:00:00Z',
    estimated_hours: 40,
    tags: ['qa', 'testing'],
  },
];

export const MOCK_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-1',
    so_number: 'SO-1001',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    customer_id: 'cust-1',
    customer_name: 'TechCorp India',
    order_date: '2025-01-01',
    delivery_date: '2025-03-31',
    status: 'confirmed',
    total_amount: 150000,
    currency: 'INR',
    notes: 'Phase 1: Design and Development',
    created_by: '1',
    created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'so-2',
    so_number: 'SO-1002',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    customer_id: 'cust-2',
    customer_name: 'StartupHub',
    order_date: '2025-01-15',
    delivery_date: '2025-06-30',
    status: 'confirmed',
    total_amount: 300000,
    currency: 'INR',
    notes: 'iOS and Android native apps',
    created_by: '1',
    created_at: '2025-01-15T09:00:00Z',
  },
  {
    id: 'so-3',
    so_number: 'SO-1003',
    project_id: 'proj-4',
    project_name: 'ERP System Integration',
    customer_id: 'cust-3',
    customer_name: 'Enterprise Solutions Ltd',
    order_date: '2024-10-01',
    delivery_date: '2024-12-31',
    status: 'done',
    total_amount: 500000,
    currency: 'INR',
    notes: 'Complete ERP integration',
    created_by: '1',
    created_at: '2024-10-01T10:00:00Z',
  },
  {
    id: 'so-4',
    so_number: 'SO-1004',
    project_id: 'proj-3',
    project_name: 'Marketing Campaign Q1',
    customer_id: 'cust-1',
    customer_name: 'TechCorp India',
    order_date: '2025-01-15',
    delivery_date: '2025-04-15',
    status: 'draft',
    total_amount: 80000,
    currency: 'INR',
    notes: 'Awaiting customer approval',
    created_by: '1',
    created_at: '2025-01-15T14:00:00Z',
  },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    po_number: 'PO-2001',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    vendor_name: 'Cloud Hosting Services',
    vendor_email: 'sales@cloudhost.com',
    order_date: '2025-01-10',
    expected_delivery: '2025-01-15',
    status: 'received',
    total_amount: 25000,
    currency: 'INR',
    notes: 'Annual cloud hosting subscription',
    created_by: '1',
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'po-2',
    po_number: 'PO-2002',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    vendor_name: 'Design Assets Ltd',
    vendor_email: 'contact@designassets.com',
    order_date: '2025-01-20',
    expected_delivery: '2025-01-25',
    status: 'confirmed',
    total_amount: 15000,
    currency: 'INR',
    notes: 'Icon pack and UI kit',
    created_by: '1',
    created_at: '2025-01-20T11:00:00Z',
  },
  {
    id: 'po-3',
    po_number: 'PO-2003',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    vendor_name: 'Mobile Testing Lab',
    vendor_email: 'info@mobiletestlab.com',
    order_date: '2025-01-25',
    expected_delivery: '2025-02-01',
    status: 'draft',
    total_amount: 50000,
    currency: 'INR',
    notes: 'Testing services for 3 months',
    created_by: '1',
    created_at: '2025-01-25T15:00:00Z',
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'INV-3001',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    customer_id: 'cust-1',
    customer_name: 'TechCorp India',
    invoice_date: '2025-01-15',
    due_date: '2025-02-14',
    status: 'paid',
    total_amount: 75000,
    paid_amount: 75000,
    currency: 'INR',
    payment_terms: 'Net 30',
    notes: 'Payment received via wire transfer',
    created_by: '1',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-3002',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    customer_id: 'cust-1',
    customer_name: 'TechCorp India',
    invoice_date: '2025-02-01',
    due_date: '2025-03-03',
    status: 'sent',
    total_amount: 75000,
    paid_amount: 0,
    currency: 'INR',
    payment_terms: 'Net 30',
    notes: 'Second milestone payment',
    created_by: '1',
    created_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-3003',
    project_id: 'proj-4',
    project_name: 'ERP System Integration',
    customer_id: 'cust-3',
    customer_name: 'Enterprise Solutions Ltd',
    invoice_date: '2024-12-31',
    due_date: '2025-01-30',
    status: 'paid',
    total_amount: 500000,
    paid_amount: 500000,
    currency: 'INR',
    payment_terms: 'Net 30',
    notes: 'Final project payment',
    created_by: '1',
    created_at: '2024-12-31T10:00:00Z',
  },
  {
    id: 'inv-4',
    invoice_number: 'INV-3004',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    customer_id: 'cust-2',
    customer_name: 'StartupHub',
    invoice_date: '2025-01-28',
    due_date: '2025-01-15',
    status: 'overdue',
    total_amount: 100000,
    paid_amount: 0,
    currency: 'INR',
    payment_terms: 'Net 15',
    notes: 'First milestone - overdue',
    created_by: '1',
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'inv-5',
    invoice_number: 'INV-3005',
    project_id: 'proj-3',
    project_name: 'Marketing Campaign Q1',
    customer_id: 'cust-1',
    customer_name: 'TechCorp India',
    invoice_date: '2025-01-20',
    due_date: '2025-02-19',
    status: 'draft',
    total_amount: 40000,
    paid_amount: 0,
    currency: 'INR',
    payment_terms: 'Net 30',
    notes: 'Draft - awaiting approval',
    created_by: '1',
    created_at: '2025-01-20T15:00:00Z',
  },
];

export const MOCK_BILLS: Bill[] = [
  {
    id: 'bill-1',
    bill_number: 'BILL-4001',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    vendor_name: 'Cloud Hosting Services',
    vendor_email: 'billing@cloudhost.com',
    bill_date: '2025-01-15',
    due_date: '2025-02-14',
    status: 'paid',
    total_amount: 25000,
    paid_amount: 25000,
    currency: 'INR',
    payment_terms: 'Net 30',
    notes: 'Paid via company card',
    created_by: '1',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'bill-2',
    bill_number: 'BILL-4002',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    vendor_name: 'Design Assets Ltd',
    vendor_email: 'accounts@designassets.com',
    bill_date: '2025-01-22',
    due_date: '2025-02-21',
    status: 'pending',
    total_amount: 15000,
    paid_amount: 0,
    currency: 'INR',
    payment_terms: 'Net 30',
    notes: 'Payment scheduled',
    created_by: '1',
    created_at: '2025-01-22T10:00:00Z',
  },
  {
    id: 'bill-3',
    bill_number: 'BILL-4003',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    vendor_name: 'SSL Certificate Provider',
    vendor_email: 'billing@sslpro.com',
    bill_date: '2025-01-10',
    due_date: '2025-01-25',
    status: 'overdue',
    total_amount: 5000,
    paid_amount: 0,
    currency: 'INR',
    payment_terms: 'Net 15',
    notes: 'Payment overdue - follow up required',
    created_by: '1',
    created_at: '2025-01-10T10:00:00Z',
  },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    user_id: '2',
    user_name: 'Arun Dev',
    expense_date: '2025-01-12',
    category: 'Travel',
    description: 'Client meeting in Mumbai - airfare and hotel',
    amount: 5000,
    currency: 'INR',
    status: 'approved',
    billable: true,
    approved_by: '1',
    approved_at: '2025-01-13T10:00:00Z',
    created_at: '2025-01-12T18:00:00Z',
  },
  {
    id: 'exp-2',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    user_id: '5',
    user_name: 'Ravi Kumar',
    expense_date: '2025-01-18',
    category: 'Software',
    description: 'Design tools subscription - Figma Pro',
    amount: 3500,
    currency: 'INR',
    status: 'approved',
    billable: false,
    approved_by: '1',
    approved_at: '2025-01-19T09:00:00Z',
    created_at: '2025-01-18T16:00:00Z',
  },
  {
    id: 'exp-3',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    user_id: '2',
    user_name: 'Arun Dev',
    expense_date: '2025-01-25',
    category: 'Equipment',
    description: 'Testing devices - iPhone 15 and Samsung Galaxy',
    amount: 150000,
    currency: 'INR',
    status: 'submitted',
    billable: true,
    created_at: '2025-01-25T14:00:00Z',
  },
  {
    id: 'exp-4',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    user_id: '6',
    user_name: 'Anita Sharma',
    expense_date: '2025-01-20',
    category: 'Training',
    description: 'QA certification course',
    amount: 8000,
    currency: 'INR',
    status: 'paid',
    billable: false,
    approved_by: '1',
    approved_at: '2025-01-21T10:00:00Z',
    created_at: '2025-01-20T15:00:00Z',
  },
  {
    id: 'exp-5',
    project_id: 'proj-3',
    project_name: 'Marketing Campaign Q1',
    user_id: '5',
    user_name: 'Ravi Kumar',
    expense_date: '2025-01-22',
    category: 'Marketing',
    description: 'Stock photos and graphics',
    amount: 12000,
    currency: 'INR',
    status: 'rejected',
    billable: true,
    notes: 'Please use company library instead',
    created_at: '2025-01-22T11:00:00Z',
  },
  {
    id: 'exp-6',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    user_id: '2',
    user_name: 'Arun Dev',
    expense_date: '2025-01-28',
    category: 'Software',
    description: 'Cloud server costs - AWS',
    amount: 25000,
    currency: 'INR',
    status: 'draft',
    billable: true,
    created_at: '2025-01-28T17:00:00Z',
  },
];

export const MOCK_TASK_COMMENTS: TaskComment[] = [
  {
    id: 'comment-1',
    task_id: 'task-1',
    user_id: '1',
    user_name: 'Priya Manager',
    comment: 'Great progress! Please make sure to follow the brand guidelines.',
    created_at: '2025-01-10T10:30:00Z',
  },
  {
    id: 'comment-2',
    task_id: 'task-1',
    user_id: '5',
    user_name: 'Ravi Kumar',
    comment: 'Updated the mockups based on feedback. Ready for review.',
    created_at: '2025-01-10T14:30:00Z',
  },
  {
    id: 'comment-3',
    task_id: 'task-4',
    user_id: '2',
    user_name: 'Arun Dev',
    comment: 'Blocked: Waiting for server credentials from IT team.',
    created_at: '2025-01-12T09:00:00Z',
  },
  {
    id: 'comment-4',
    task_id: 'task-4',
    user_id: '1',
    user_name: 'Priya Manager',
    comment: 'I will escalate this to get the credentials ASAP.',
    created_at: '2025-01-12T11:00:00Z',
  },
  {
    id: 'comment-5',
    task_id: 'task-7',
    user_id: '5',
    user_name: 'Ravi Kumar',
    comment: 'Completed Instagram and Facebook assets. Working on Twitter now.',
    created_at: '2025-01-16T11:00:00Z',
  },
];

export const MOCK_TASK_ATTACHMENTS: TaskAttachment[] = [
  {
    id: 'attach-1',
    task_id: 'task-1',
    file_name: 'homepage-mockup-v2.fig',
    file_url: '/attachments/homepage-mockup-v2.fig',
    file_size: 2458624, // ~2.4 MB
    uploaded_by: '5',
    uploaded_by_name: 'Ravi Kumar',
    uploaded_at: '2025-01-10T14:30:00Z',
  },
  {
    id: 'attach-2',
    task_id: 'task-1',
    file_name: 'brand-guidelines.pdf',
    file_url: '/attachments/brand-guidelines.pdf',
    file_size: 1048576, // 1 MB
    uploaded_by: '1',
    uploaded_by_name: 'Priya Manager',
    uploaded_at: '2025-01-05T10:00:00Z',
  },
  {
    id: 'attach-3',
    task_id: 'task-2',
    file_name: 'responsive-specs.pdf',
    file_url: '/attachments/responsive-specs.pdf',
    file_size: 524288, // 512 KB
    uploaded_by: '2',
    uploaded_by_name: 'Arun Dev',
    uploaded_at: '2025-01-06T09:00:00Z',
  },
  {
    id: 'attach-4',
    task_id: 'task-7',
    file_name: 'social-media-assets.zip',
    file_url: '/attachments/social-media-assets.zip',
    file_size: 8388608, // 8 MB
    uploaded_by: '5',
    uploaded_by_name: 'Ravi Kumar',
    uploaded_at: '2025-01-16T11:00:00Z',
  },
  {
    id: 'attach-5',
    task_id: 'task-8',
    file_name: 'qa-test-results.xlsx',
    file_url: '/attachments/qa-test-results.xlsx',
    file_size: 2097152, // 2 MB
    uploaded_by: '6',
    uploaded_by_name: 'Anita Sharma',
    uploaded_at: '2024-12-28T18:00:00Z',
  },
];

export const MOCK_TIME_LOGS: TimeLog[] = [
  {
    id: 'log-1',
    task_id: 'task-1',
    user_id: '5',
    user_name: 'Ravi Kumar',
    hours: 4,
    description: 'Initial mockup design',
    logged_date: '2025-01-08',
    created_at: '2025-01-08T18:00:00Z',
  },
  {
    id: 'log-2',
    task_id: 'task-1',
    user_id: '5',
    user_name: 'Ravi Kumar',
    hours: 6,
    description: 'Refined designs based on feedback',
    logged_date: '2025-01-10',
    created_at: '2025-01-10T17:00:00Z',
  },
  {
    id: 'log-3',
    task_id: 'task-1',
    user_id: '5',
    user_name: 'Ravi Kumar',
    hours: 3,
    description: 'Final adjustments and export',
    logged_date: '2025-01-11',
    created_at: '2025-01-11T16:00:00Z',
  },
  {
    id: 'log-4',
    task_id: 'task-3',
    user_id: '2',
    user_name: 'Arun Dev',
    hours: 8,
    description: 'Content migration completed',
    logged_date: '2025-01-15',
    created_at: '2025-01-15T16:00:00Z',
  },
  {
    id: 'log-5',
    task_id: 'task-7',
    user_id: '5',
    user_name: 'Ravi Kumar',
    hours: 5,
    description: 'Created social media graphics',
    logged_date: '2025-01-16',
    created_at: '2025-01-16T15:00:00Z',
  },
  {
    id: 'log-6',
    task_id: 'task-8',
    user_id: '6',
    user_name: 'Anita Sharma',
    hours: 40,
    description: 'Complete QA testing and documentation',
    logged_date: '2024-12-28',
    created_at: '2024-12-28T18:00:00Z',
  },
];

// Settings & Master Data Interfaces

export interface Vendor {
  id: string;
  vendor_code: string;
  name: string;
  email: string;
  phone?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  gstin?: string;
  pan?: string;
  payment_terms?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  product_code: string;
  name: string;
  description?: string;
  category: string;
  unit_price: number;
  currency: string;
  unit_of_measure: string;
  stock_quantity?: number;
  min_stock_level?: number;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at?: string;
}

export interface ExpenseCategory {
  id: string;
  category_code: string;
  name: string;
  description?: string;
  budget_limit?: number;
  requires_approval: boolean;
  is_billable_default: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
  user_count: number;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address?: string;
  user_agent?: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'security' | 'notifications' | 'integrations';
  description?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface Backup {
  id: string;
  backup_date: string;
  file_name: string;
  file_size: number;
  status: 'completed' | 'in_progress' | 'failed';
  backup_type: 'manual' | 'scheduled';
  created_by: string;
  notes?: string;
}

// Mock Master Data

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'ven-1',
    vendor_code: 'VEN-001',
    name: 'Cloud Hosting Services',
    email: 'billing@cloudhost.com',
    phone: '+91-80-4567-8901',
    contact_person: 'Rajesh Kumar',
    address: '123 Tech Park, Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    payment_terms: 'Net 30',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-06-20T14:30:00Z',
  },
  {
    id: 'ven-2',
    vendor_code: 'VEN-002',
    name: 'Design Assets Ltd',
    email: 'accounts@designassets.com',
    phone: '+91-22-2345-6789',
    contact_person: 'Priya Shah',
    address: '45 Creative Hub, Bandra',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    gstin: '27FGHIJ5678K1Z9',
    pan: 'FGHIJ5678K',
    payment_terms: 'Net 15',
    status: 'active',
    created_at: '2024-02-10T10:00:00Z',
  },
  {
    id: 'ven-3',
    vendor_code: 'VEN-003',
    name: 'SSL Certificate Provider',
    email: 'billing@sslpro.com',
    phone: '+1-555-123-4567',
    contact_person: 'John Smith',
    address: '100 Security Blvd',
    city: 'San Francisco',
    state: 'California',
    country: 'USA',
    payment_terms: 'Immediate',
    status: 'active',
    created_at: '2024-03-05T10:00:00Z',
  },
  {
    id: 'ven-4',
    vendor_code: 'VEN-004',
    name: 'Quality Assurance Labs',
    email: 'contact@qalabs.in',
    phone: '+91-40-8765-4321',
    contact_person: 'Anita Reddy',
    address: '78 IT Corridor, Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    gstin: '36KLMNO9012P1Z3',
    pan: 'KLMNO9012P',
    payment_terms: 'Net 45',
    status: 'active',
    created_at: '2024-04-20T10:00:00Z',
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    product_code: 'PROD-001',
    name: 'Web Development - Basic',
    description: 'Basic website development package',
    category: 'Services',
    unit_price: 50000,
    currency: 'INR',
    unit_of_measure: 'Project',
    status: 'active',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'prod-2',
    product_code: 'PROD-002',
    name: 'Web Development - Premium',
    description: 'Premium website with advanced features',
    category: 'Services',
    unit_price: 150000,
    currency: 'INR',
    unit_of_measure: 'Project',
    status: 'active',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'prod-3',
    product_code: 'PROD-003',
    name: 'Mobile App Development',
    description: 'iOS and Android app development',
    category: 'Services',
    unit_price: 300000,
    currency: 'INR',
    unit_of_measure: 'Project',
    status: 'active',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'prod-4',
    product_code: 'PROD-004',
    name: 'Cloud Hosting',
    description: 'Managed cloud hosting service',
    category: 'Hosting',
    unit_price: 5000,
    currency: 'INR',
    unit_of_measure: 'Month',
    status: 'active',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'prod-5',
    product_code: 'PROD-005',
    name: 'UI/UX Design',
    description: 'User interface and experience design',
    category: 'Design',
    unit_price: 25000,
    currency: 'INR',
    unit_of_measure: 'Hour',
    status: 'active',
    created_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'prod-6',
    product_code: 'PROD-006',
    name: 'QA Testing',
    description: 'Quality assurance and testing services',
    category: 'Testing',
    unit_price: 15000,
    currency: 'INR',
    unit_of_measure: 'Day',
    status: 'active',
    created_at: '2024-01-10T10:00:00Z',
  },
];

export const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'cat-1',
    category_code: 'CAT-001',
    name: 'Travel',
    description: 'Business travel expenses',
    budget_limit: 50000,
    requires_approval: true,
    is_billable_default: true,
    status: 'active',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cat-2',
    category_code: 'CAT-002',
    name: 'Software',
    description: 'Software licenses and subscriptions',
    budget_limit: 100000,
    requires_approval: true,
    is_billable_default: false,
    status: 'active',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cat-3',
    category_code: 'CAT-003',
    name: 'Marketing',
    description: 'Marketing and advertising expenses',
    budget_limit: 75000,
    requires_approval: true,
    is_billable_default: false,
    status: 'active',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cat-4',
    category_code: 'CAT-004',
    name: 'Office Supplies',
    description: 'General office supplies and equipment',
    requires_approval: false,
    is_billable_default: false,
    status: 'active',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cat-5',
    category_code: 'CAT-005',
    name: 'Client Entertainment',
    description: 'Client meetings and entertainment',
    budget_limit: 30000,
    requires_approval: true,
    is_billable_default: true,
    status: 'active',
    created_at: '2024-01-01T10:00:00Z',
  },
];

export const MOCK_ROLES: Role[] = [
  {
    id: 'role-1',
    name: 'admin',
    display_name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: ['all'],
    user_count: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-2',
    name: 'project_manager',
    display_name: 'Project Manager',
    description: 'Manage projects, tasks, and team members',
    permissions: ['projects.create', 'projects.edit', 'projects.view', 'tasks.all', 'team.view', 'timesheets.approve'],
    user_count: 3,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-3',
    name: 'team_member',
    display_name: 'Team Member',
    description: 'Work on assigned tasks and log time',
    permissions: ['tasks.view', 'tasks.update', 'timesheets.create', 'timesheets.view'],
    user_count: 8,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-4',
    name: 'sales_finance',
    display_name: 'Sales & Finance',
    description: 'Manage financial operations and sales',
    permissions: ['sales.all', 'invoices.all', 'expenses.approve', 'reports.financial'],
    user_count: 2,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2025-01-28T14:30:00Z',
    user_id: '1',
    user_name: 'Admin User',
    action: 'CREATE',
    entity_type: 'Project',
    entity_id: 'proj-1',
    details: 'Created project: Brand Website Redesign',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0',
  },
  {
    id: 'audit-2',
    timestamp: '2025-01-28T15:45:00Z',
    user_id: '1',
    user_name: 'Admin User',
    action: 'UPDATE',
    entity_type: 'Project',
    entity_id: 'proj-1',
    details: 'Updated project status to: in_progress',
    ip_address: '192.168.1.100',
  },
  {
    id: 'audit-3',
    timestamp: '2025-01-28T16:20:00Z',
    user_id: '3',
    user_name: 'Sameer Finance',
    action: 'CREATE',
    entity_type: 'Invoice',
    entity_id: 'inv-1',
    details: 'Created invoice: INV-3001 for ₹75,000',
    ip_address: '192.168.1.150',
  },
  {
    id: 'audit-4',
    timestamp: '2025-01-28T17:00:00Z',
    user_id: '1',
    user_name: 'Admin User',
    action: 'APPROVE',
    entity_type: 'Expense',
    entity_id: 'exp-1',
    details: 'Approved expense: Travel to client site - ₹12,500',
    ip_address: '192.168.1.100',
  },
  {
    id: 'audit-5',
    timestamp: '2025-01-28T18:30:00Z',
    user_id: '2',
    user_name: 'Arun Dev',
    action: 'UPDATE',
    entity_type: 'Task',
    entity_id: 'task-1',
    details: 'Updated task status to: done',
    ip_address: '192.168.1.120',
  },
];

export const MOCK_SYSTEM_SETTINGS: SystemSetting[] = [
  {
    id: 'set-1',
    key: 'company_name',
    value: 'Acme Corporation',
    category: 'general',
    description: 'Company name displayed across the system',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'set-2',
    key: 'default_currency',
    value: 'INR',
    category: 'general',
    description: 'Default currency for financial transactions',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'set-3',
    key: 'fiscal_year_start',
    value: 'April',
    category: 'general',
    description: 'Fiscal year start month',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'set-4',
    key: 'password_expiry_days',
    value: '90',
    category: 'security',
    description: 'Number of days before password expires',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'set-5',
    key: 'session_timeout_minutes',
    value: '30',
    category: 'security',
    description: 'User session timeout in minutes',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'set-6',
    key: 'enable_2fa',
    value: 'true',
    category: 'security',
    description: 'Enable two-factor authentication',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'set-7',
    key: 'email_notifications',
    value: 'true',
    category: 'notifications',
    description: 'Enable email notifications',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'set-8',
    key: 'backup_frequency',
    value: 'daily',
    category: 'general',
    description: 'Automated backup frequency',
    updated_at: '2024-01-01T10:00:00Z',
  },
];

export const MOCK_BACKUPS: Backup[] = [
  {
    id: 'bak-1',
    backup_date: '2025-01-28T02:00:00Z',
    file_name: 'oneflow_backup_20250128.sql.gz',
    file_size: 45678901,
    status: 'completed',
    backup_type: 'scheduled',
    created_by: 'system',
    notes: 'Automated daily backup',
  },
  {
    id: 'bak-2',
    backup_date: '2025-01-27T02:00:00Z',
    file_name: 'oneflow_backup_20250127.sql.gz',
    file_size: 44523789,
    status: 'completed',
    backup_type: 'scheduled',
    created_by: 'system',
    notes: 'Automated daily backup',
  },
  {
    id: 'bak-3',
    backup_date: '2025-01-26T15:30:00Z',
    file_name: 'oneflow_backup_manual_20250126.sql.gz',
    file_size: 44201567,
    status: 'completed',
    backup_type: 'manual',
    created_by: '1',
    notes: 'Manual backup before major update',
  },
];

// Employee Rate & Billing Policy Interfaces

export interface EmployeeRate {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  hourly_rate: number;
  currency: string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProjectBillingPolicy {
  id: string;
  project_id: string;
  project_name?: string;
  billable_by_default: boolean;
  overtime_multiplier: number;
  requires_approval: boolean;
  approval_threshold_hours: number;
  notes?: string;
  created_at: string;
}

// Analytics & Reporting Interfaces

export interface AnalyticsMetrics {
  period: string;
  total_revenue: number;
  total_cost: number;
  profit: number;
  profit_margin: number;
  billable_hours: number;
  non_billable_hours: number;
  utilization_rate: number;
  projects_completed: number;
  projects_active: number;
  avg_project_duration: number;
  customer_satisfaction?: number;
}

export interface ResourceUtilization {
  user_id: string;
  user_name: string;
  role: string;
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  utilization_rate: number;
  revenue_generated: number;
  projects_count: number;
  efficiency_score: number;
}

export interface ProjectProfitability {
  project_id: string;
  project_name: string;
  budget: number;
  spent: number;
  revenue: number;
  profit: number;
  profit_margin: number;
  hours_logged: number;
  team_size: number;
  status: string;
}

// Mock Timesheets
export const MOCK_TIMESHEETS: Timesheet[] = [
  {
    id: 'ts-1',
    user_id: '2',
    user_name: 'Arun Dev',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    task_id: 'task-1',
    task_title: 'Homepage Design Mockup',
    work_date: '2025-11-07',
    hours: 8,
    description: 'Designed and implemented homepage mockup with client feedback',
    billable: true,
    hourly_rate: 1200,
    currency: 'INR',
    status: 'submitted',
    submitted_at: '2025-11-07T18:30:00Z',
    created_at: '2025-11-07T10:00:00Z',
  },
  {
    id: 'ts-2',
    user_id: '5',
    user_name: 'Ravi Kumar',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    task_id: 'task-1',
    task_title: 'Homepage Design Mockup',
    work_date: '2025-11-07',
    hours: 6,
    description: 'Created responsive design with accessibility features',
    billable: true,
    hourly_rate: 1000,
    currency: 'INR',
    status: 'approved',
    submitted_at: '2025-11-07T17:00:00Z',
    reviewed_by: '1',
    reviewed_at: '2025-11-08T09:00:00Z',
    created_at: '2025-11-07T09:00:00Z',
  },
  {
    id: 'ts-3',
    user_id: '2',
    user_name: 'Arun Dev',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    work_date: '2025-11-06',
    hours: 5,
    description: 'Team meeting and sprint planning',
    billable: false,
    hourly_rate: 1200,
    currency: 'INR',
    status: 'approved',
    submitted_at: '2025-11-06T18:00:00Z',
    reviewed_by: '1',
    reviewed_at: '2025-11-07T10:00:00Z',
    created_at: '2025-11-06T09:00:00Z',
  },
  {
    id: 'ts-4',
    user_id: '6',
    user_name: 'Anita Sharma',
    project_id: 'proj-3',
    project_name: 'Marketing Campaign Q1',
    task_id: 'task-7',
    task_title: 'Social Media Graphics',
    work_date: '2025-11-08',
    hours: 10,
    description: 'Comprehensive QA testing and bug documentation',
    billable: true,
    hourly_rate: 1100,
    currency: 'INR',
    status: 'submitted',
    submitted_at: '2025-11-08T19:00:00Z',
    created_at: '2025-11-08T09:00:00Z',
  },
  {
    id: 'ts-5',
    user_id: '3',
    user_name: 'Sameer Finance',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    work_date: '2025-11-05',
    hours: 3.5,
    description: 'Invoice processing and financial reporting',
    billable: false,
    hourly_rate: 900,
    currency: 'INR',
    status: 'rejected',
    submitted_at: '2025-11-05T17:00:00Z',
    reviewed_by: '1',
    reviewed_at: '2025-11-06T09:00:00Z',
    rejection_reason: 'Insufficient detail. Please provide specific invoice numbers.',
    created_at: '2025-11-05T09:00:00Z',
  },
  {
    id: 'ts-6',
    user_id: '2',
    user_name: 'Arun Dev',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    task_id: 'task-4',
    task_title: 'Backend API Development',
    work_date: '2025-11-08',
    hours: 7.5,
    description: 'Implemented REST API endpoints for user authentication',
    billable: true,
    hourly_rate: 1200,
    currency: 'INR',
    status: 'draft',
    created_at: '2025-11-08T14:00:00Z',
  },
  {
    id: 'ts-7',
    user_id: '5',
    user_name: 'Ravi Kumar',
    project_id: 'proj-3',
    project_name: 'Marketing Campaign Q1',
    work_date: '2025-11-04',
    hours: 9,
    description: 'Designed campaign visuals and brand assets',
    billable: true,
    hourly_rate: 1000,
    currency: 'INR',
    status: 'approved',
    submitted_at: '2025-11-04T18:00:00Z',
    reviewed_by: '1',
    reviewed_at: '2025-11-05T09:30:00Z',
    created_at: '2025-11-04T09:00:00Z',
  },
];

// Employee Rates
export const MOCK_EMPLOYEE_RATES: EmployeeRate[] = [
  {
    id: 'rate-1',
    user_id: '1',
    user_name: 'Admin User',
    role: 'Administrator',
    hourly_rate: 2000,
    currency: 'INR',
    effective_from: '2025-01-01',
    is_active: true,
    created_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'rate-2',
    user_id: '2',
    user_name: 'Arun Dev',
    role: 'Team Member',
    hourly_rate: 1200,
    currency: 'INR',
    effective_from: '2025-01-01',
    is_active: true,
    created_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'rate-3',
    user_id: '3',
    user_name: 'Sameer Finance',
    role: 'Sales & Finance',
    hourly_rate: 900,
    currency: 'INR',
    effective_from: '2025-01-01',
    is_active: true,
    created_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'rate-4',
    user_id: '5',
    user_name: 'Ravi Kumar',
    role: 'Team Member',
    hourly_rate: 1000,
    currency: 'INR',
    effective_from: '2025-01-01',
    is_active: true,
    created_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'rate-5',
    user_id: '6',
    user_name: 'Anita Sharma',
    role: 'Team Member',
    hourly_rate: 1100,
    currency: 'INR',
    effective_from: '2025-01-01',
    is_active: true,
    created_at: '2024-12-15T10:00:00Z',
  },
];

// Project Billing Policies
export const MOCK_BILLING_POLICIES: ProjectBillingPolicy[] = [
  {
    id: 'bp-1',
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    billable_by_default: true,
    overtime_multiplier: 1.5,
    requires_approval: true,
    approval_threshold_hours: 8,
    notes: 'Client billed monthly. Overtime requires pre-approval.',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'bp-2',
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    billable_by_default: true,
    overtime_multiplier: 1.5,
    requires_approval: true,
    approval_threshold_hours: 10,
    notes: 'Fixed-price contract with scope adjustments.',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'bp-3',
    project_id: 'proj-3',
    project_name: 'Marketing Campaign Q1',
    billable_by_default: false,
    overtime_multiplier: 1.0,
    requires_approval: true,
    approval_threshold_hours: 8,
    notes: 'Internal project. Most work is non-billable unless specified.',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'bp-4',
    project_id: 'proj-4',
    project_name: 'ERP System Integration',
    billable_by_default: true,
    overtime_multiplier: 2.0,
    requires_approval: false,
    approval_threshold_hours: 12,
    notes: 'Time & Materials contract. Overtime at 2x rate.',
    created_at: '2024-12-01T10:00:00Z',
  },
];

// Analytics Metrics (Last 6 Months)
export const MOCK_ANALYTICS_METRICS: AnalyticsMetrics[] = [
  {
    period: '2025-06',
    total_revenue: 2500000,
    total_cost: 1800000,
    profit: 700000,
    profit_margin: 28,
    billable_hours: 1200,
    non_billable_hours: 300,
    utilization_rate: 80,
    projects_completed: 3,
    projects_active: 5,
    avg_project_duration: 45,
    customer_satisfaction: 4.5,
  },
  {
    period: '2025-07',
    total_revenue: 2800000,
    total_cost: 1900000,
    profit: 900000,
    profit_margin: 32,
    billable_hours: 1350,
    non_billable_hours: 280,
    utilization_rate: 83,
    projects_completed: 4,
    projects_active: 6,
    avg_project_duration: 42,
    customer_satisfaction: 4.6,
  },
  {
    period: '2025-08',
    total_revenue: 3200000,
    total_cost: 2100000,
    profit: 1100000,
    profit_margin: 34,
    billable_hours: 1450,
    non_billable_hours: 320,
    utilization_rate: 82,
    projects_completed: 5,
    projects_active: 7,
    avg_project_duration: 40,
    customer_satisfaction: 4.7,
  },
  {
    period: '2025-09',
    total_revenue: 2900000,
    total_cost: 2000000,
    profit: 900000,
    profit_margin: 31,
    billable_hours: 1380,
    non_billable_hours: 340,
    utilization_rate: 80,
    projects_completed: 4,
    projects_active: 6,
    avg_project_duration: 43,
    customer_satisfaction: 4.5,
  },
  {
    period: '2025-10',
    total_revenue: 3500000,
    total_cost: 2200000,
    profit: 1300000,
    profit_margin: 37,
    billable_hours: 1500,
    non_billable_hours: 290,
    utilization_rate: 84,
    projects_completed: 6,
    projects_active: 8,
    avg_project_duration: 38,
    customer_satisfaction: 4.8,
  },
  {
    period: '2025-11',
    total_revenue: 3800000,
    total_cost: 2400000,
    profit: 1400000,
    profit_margin: 37,
    billable_hours: 1600,
    non_billable_hours: 310,
    utilization_rate: 84,
    projects_completed: 5,
    projects_active: 9,
    avg_project_duration: 41,
    customer_satisfaction: 4.9,
  },
];

// Resource Utilization
export const MOCK_RESOURCE_UTILIZATION: ResourceUtilization[] = [
  {
    user_id: '2',
    user_name: 'Arun Dev',
    role: 'Team Member',
    total_hours: 180,
    billable_hours: 150,
    non_billable_hours: 30,
    utilization_rate: 83,
    revenue_generated: 180000,
    projects_count: 3,
    efficiency_score: 92,
  },
  {
    user_id: '5',
    user_name: 'Ravi Kumar',
    role: 'Team Member',
    total_hours: 170,
    billable_hours: 155,
    non_billable_hours: 15,
    utilization_rate: 91,
    revenue_generated: 155000,
    projects_count: 2,
    efficiency_score: 95,
  },
  {
    user_id: '6',
    user_name: 'Anita Sharma',
    role: 'Team Member',
    total_hours: 165,
    billable_hours: 140,
    non_billable_hours: 25,
    utilization_rate: 85,
    revenue_generated: 154000,
    projects_count: 2,
    efficiency_score: 88,
  },
  {
    user_id: '3',
    user_name: 'Sameer Finance',
    role: 'Sales & Finance',
    total_hours: 160,
    billable_hours: 90,
    non_billable_hours: 70,
    utilization_rate: 56,
    revenue_generated: 81000,
    projects_count: 4,
    efficiency_score: 78,
  },
];

// Project Profitability
export const MOCK_PROJECT_PROFITABILITY: ProjectProfitability[] = [
  {
    project_id: 'proj-1',
    project_name: 'Brand Website Redesign',
    budget: 150000,
    spent: 112500,
    revenue: 150000,
    profit: 37500,
    profit_margin: 25,
    hours_logged: 95,
    team_size: 3,
    status: 'in_progress',
  },
  {
    project_id: 'proj-2',
    project_name: 'Mobile App Development',
    budget: 300000,
    spent: 225000,
    revenue: 300000,
    profit: 75000,
    profit_margin: 25,
    hours_logged: 200,
    team_size: 4,
    status: 'in_progress',
  },
  {
    project_id: 'proj-3',
    project_name: 'Marketing Campaign Q1',
    budget: 50000,
    spent: 35000,
    revenue: 40000,
    profit: 5000,
    profit_margin: 12.5,
    hours_logged: 40,
    team_size: 2,
    status: 'in_progress',
  },
  {
    project_id: 'proj-4',
    project_name: 'ERP System Integration',
    budget: 500000,
    spent: 500000,
    revenue: 500000,
    profit: 0,
    profit_margin: 0,
    hours_logged: 420,
    team_size: 5,
    status: 'completed',
  },
];
