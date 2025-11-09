import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, getUserDisplayName, getUserRole } from '@/lib/apiAuth';
import { getRoleLabel } from '@/lib/mockAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  BarChart3,
  Clock,
  ShoppingCart,
  Settings,
  LogOut,
  Plus,
  Layers,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const user = getCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Role-based navigation items
  const getNavItems = () => {
    const userRole = user ? getUserRole(user) : null;
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: userRole === 'admin' ? '/admin/dashboard' : '/dashboard', roles: ['admin', 'project_manager', 'team_member', 'sales_finance'] },
      { icon: Folder, label: 'Projects', path: '/projects', roles: ['admin', 'project_manager', 'team_member'] },
      { icon: CheckSquare, label: 'Tasks', path: '/tasks', roles: ['admin', 'project_manager', 'team_member'] },
      { icon: BarChart3, label: 'Analytics', path: '/analytics', roles: ['admin', 'sales_finance'] },
      { icon: Clock, label: 'Timesheets', path: '/timesheets', roles: ['admin', 'project_manager'] }, // Removed team_member
      { icon: ShoppingCart, label: 'Sales & Purchases', path: '/sales', roles: ['admin', 'sales_finance'] },
      { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin'] }, // Only admin has Settings access
    ];

    // Filter items based on user role
    if (userRole === 'admin') {
      return baseItems; // Admins see everything
    }

    return baseItems.filter(item => item.roles.includes(userRole || ''));
  };

  const navItems = getNavItems();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass-card border-r border-glass-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-glass-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="glass-card p-2">
              <Layers className="w-6 h-6 text-accent-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">OneFlow</h1>
              <p className="text-xs text-muted-foreground">Plan · Execute · Bill</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-glass-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full glass-card p-3 hover:bg-accent/10 transition-all duration-smooth flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-accent-1/20 text-accent-1">
                    {user && getInitials(getUserDisplayName(user))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{user && getUserDisplayName(user)}</p>
                  <p className="text-xs text-muted-foreground">
                    {user && getRoleLabel(getUserRole(user))}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-glass-border w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user && getUserDisplayName(user)}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-glass-border" />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              {user && getUserRole(user) === 'admin' && (
                <>
                  <DropdownMenuSeparator className="bg-glass-border" />
                  <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-glass-border" />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-smooth ${
                  isActive(item.path)
                    ? 'bg-accent-1/20 text-accent-1'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </Link>
          ))}
        </nav>

        {/* Quick Create Button */}
        <div className="p-4 border-t border-glass-border">
          <Button className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Quick Create
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
