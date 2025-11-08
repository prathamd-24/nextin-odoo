import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { login, DEMO_USERS, getRoleLabel } from '@/lib/mockAuth';
import { Layers, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = login(email, password);
      if (user) {
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${user.full_name}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setTimeout(() => {
      const user = login(demoEmail, demoPassword);
      if (user) {
        toast({
          title: 'Demo login successful',
          description: `Logged in as ${user.full_name}`,
        });
        navigate('/dashboard');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Branding */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="glass-card p-3">
              <Layers className="w-8 h-8 text-accent-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">OneFlow</h1>
              <p className="text-muted-foreground">Plan → Execute → Bill</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Project management meets financial control
            </h2>
            <p className="text-muted-foreground text-lg">
              Seamlessly manage projects, track time, and handle billing all in one beautiful interface.
            </p>
          </div>

          <div className="glass-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-success">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium">Demo Mode Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a frontend demo using mock data. No real authentication or database.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass-input"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Demo Credentials
              </CardTitle>
              <CardDescription>Click any user to auto-login</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleDemoLogin(user.email, user.password)}
                  className="w-full glass-card p-3 text-left hover:bg-accent/10 transition-all duration-smooth group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground group-hover:text-accent-1 transition-colors">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full glass border border-glass-border">
                      {getRoleLabel(user.role)}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
