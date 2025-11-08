// Mock authentication system for demo purposes only
// NOT SECURE - DO NOT USE IN PRODUCTION

export type UserRole = 'project_manager' | 'team_member' | 'sales_finance' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string; // In demo only - never store passwords like this in production!
  full_name: string;
  role: UserRole;
  avatar?: string;
}

export const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'pm@acme.com',
    password: 'demo123',
    full_name: 'Priya Manager',
    role: 'project_manager',
  },
  {
    id: '2',
    email: 'dev@acme.com',
    password: 'demo123',
    full_name: 'Arun Dev',
    role: 'team_member',
  },
  {
    id: '3',
    email: 'finance@acme.com',
    password: 'demo123',
    full_name: 'Sameer Finance',
    role: 'sales_finance',
  },
  {
    id: '4',
    email: 'admin@acme.com',
    password: 'demo123',
    full_name: 'Admin User',
    role: 'admin',
  },
];

export const login = (email: string, password: string): User | null => {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('oneflow_user', JSON.stringify(userWithoutPassword));
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem('oneflow_user');
};

export const getCurrentUser = (): Omit<User, 'password'> | null => {
  const userStr = localStorage.getItem('oneflow_user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    project_manager: 'Project Manager',
    team_member: 'Team Member',
    sales_finance: 'Sales & Finance',
    admin: 'Administrator',
  };
  return labels[role];
};
