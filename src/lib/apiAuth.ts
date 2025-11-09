// Real API authentication service
import { getRoleLabel as getMockRoleLabel } from './mockAuth';
import { API_CONFIG, apiCall } from './api';

export type UserRole = 'project_manager' | 'team_member' | 'sales_finance' | 'admin';

export interface ApiUser {
  id: number;
  email: string;
  is_active: boolean;
}

export interface LoginResponse {
  message: string;
  user: ApiUser;
}

export interface LoginError {
  error: string;
}

export const apiLogin = async (email: string, password: string): Promise<ApiUser | null> => {
  try {
    const data: LoginResponse = await apiCall(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    // Store user data in localStorage
    localStorage.setItem('oneflow_user', JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    // Try to logout from API first
    if (API_CONFIG.ENDPOINTS.LOGOUT) {
      await apiCall(API_CONFIG.ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    }
  } catch (error) {
    console.warn('API logout failed, continuing with local logout:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('oneflow_user');
  }
};

export const getCurrentUser = (): ApiUser | any | null => {
  const userStr = localStorage.getItem('oneflow_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    // Handle both API user format and demo user format
    if (user.id !== undefined && user.email !== undefined && user.is_active !== undefined) {
      // API user format (simple structure)
      return user;
    } else if (user.id !== undefined && user.full_name !== undefined) {
      // Demo user format - keep as is for compatibility
      return user;
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Convert API roles to internal role format
export const mapApiRoleToUserRole = (roles: string[]): UserRole => {
  if (roles.includes('Admin') || roles.includes('Administrator')) return 'admin';
  if (roles.includes('Project Manager')) return 'project_manager';
  if (roles.includes('Sales') || roles.includes('Finance')) return 'sales_finance';
  return 'team_member';
};

export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const userRole = getUserRole(user);
  return userRole === role;
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

// Get user's display name
export const getUserDisplayName = (user: ApiUser | any): string => {
  if (user.first_name && user.last_name) {
    // Old API format or demo user converted format
    return `${user.first_name} ${user.last_name}`.trim();
  } else if (user.full_name) {
    // Demo user format
    return user.full_name;
  } else if (user.email) {
    // New simple API format - use email as display name
    return user.email.split('@')[0]; // Use the part before @ as display name
  }
  return 'User';
};

// Helper function to get user role (works with both API and demo users)
export const getUserRole = (user: ApiUser | any): UserRole => {
  if (user.role) {
    // Demo user format
    return user.role;
  } else if (user.id !== undefined && user.email !== undefined) {
    // New API user format - default to team_member since roles aren't provided
    // In a real app, you'd need another API call to get user roles
    return 'team_member';
  }
  return 'team_member'; // default
};