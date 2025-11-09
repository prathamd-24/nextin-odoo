import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Package,
  FolderTree,
  Shield,
  Settings as SettingsIcon,
  Database,
  Activity,
  Download,
  RefreshCw,
  Eye,
  Building2,
  TruckIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/mockAuth";
import {
  MOCK_CUSTOMERS,
  MOCK_VENDORS,
  MOCK_PRODUCTS,
  MOCK_EXPENSE_CATEGORIES,
  MOCK_ROLES,
  MOCK_AUDIT_LOGS,
  MOCK_SYSTEM_SETTINGS,
  MOCK_BACKUPS,
  type Customer,
  type Vendor,
  type Product,
  type ExpenseCategory,
  type Role,
  type AuditLog,
  type SystemSetting,
  type Backup,
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState("clients");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form states
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [vendorForm, setVendorForm] = useState({
    vendor_code: '',
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    payment_terms: '',
    status: 'active'
  });

  const [productForm, setProductForm] = useState({
    product_code: '',
    name: '',
    description: '',
    category: '',
    unit_price: 0,
    unit_of_measure: '',
    currency: 'INR',
    status: 'active'
  });

  const [categoryForm, setCategoryForm] = useState({
    category_code: '',
    name: '',
    description: '',
    budget_limit: 0,
    requires_approval: false,
    is_billable_default: false,
    status: 'active'
  });

  // Local storage helpers
  const getLocalClients = () => {
    try {
      const stored = localStorage.getItem('localClients');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalClients = (clients: any[]) => {
    localStorage.setItem('localClients', JSON.stringify(clients));
  };

  const getLocalVendors = () => {
    try {
      const stored = localStorage.getItem('localVendors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalVendors = (vendors: any[]) => {
    localStorage.setItem('localVendors', JSON.stringify(vendors));
  };

  const getLocalProducts = () => {
    try {
      const stored = localStorage.getItem('localProducts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalProducts = (products: any[]) => {
    localStorage.setItem('localProducts', JSON.stringify(products));
  };

  const getLocalCategories = () => {
    try {
      const stored = localStorage.getItem('localCategories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalCategories = (categories: any[]) => {
    localStorage.setItem('localCategories', JSON.stringify(categories));
  };

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="glass-card max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Only administrators can access system settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = (item: any, type: string) => {
    setSelectedItem(item);
    switch (type) {
      case 'client':
        setClientForm({
          name: item.name || '',
          email: item.email || '',
          phone: item.phone || ''
        });
        setIsClientDialogOpen(true);
        break;
      case 'vendor':
        setVendorForm({
          vendor_code: item.vendor_code || '',
          name: item.name || '',
          contact_person: item.contact_person || '',
          email: item.email || '',
          phone: item.phone || '',
          address: item.address || '',
          city: item.city || '',
          state: item.state || '',
          country: item.country || '',
          payment_terms: item.payment_terms || '',
          status: item.status || 'active'
        });
        setIsVendorDialogOpen(true);
        break;
      case 'product':
        setProductForm({
          product_code: item.product_code || '',
          name: item.name || '',
          description: item.description || '',
          category: item.category || '',
          unit_price: item.unit_price || 0,
          unit_of_measure: item.unit_of_measure || '',
          currency: item.currency || 'INR',
          status: item.status || 'active'
        });
        setIsProductDialogOpen(true);
        break;
      case 'category':
        setCategoryForm({
          category_code: item.category_code || '',
          name: item.name || '',
          description: item.description || '',
          budget_limit: item.budget_limit || 0,
          requires_approval: item.requires_approval || false,
          is_billable_default: item.is_billable_default || false,
          status: item.status || 'active'
        });
        setIsCategoryDialogOpen(true);
        break;
    }
  };

  const handleDelete = (id: string, type: string) => {
    toast({
      title: "Item Deleted",
      description: `${type} has been deleted successfully.`,
    });
  };

  const handleCreateClient = () => {
    if (!clientForm.name || !clientForm.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newClient = {
      id: `client-${Date.now()}`,
      ...clientForm
    };

    const localClients = getLocalClients();
    saveLocalClients([...localClients, newClient]);

    toast({
      title: "Client Created",
      description: `Client ${clientForm.name} has been created successfully.`,
    });

    setClientForm({ name: '', email: '', phone: '' });
    setIsClientDialogOpen(false);
  };

  const handleCreateVendor = () => {
    if (!vendorForm.name || !vendorForm.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newVendor = {
      id: `vendor-${Date.now()}`,
      ...vendorForm
    };

    const localVendors = getLocalVendors();
    saveLocalVendors([...localVendors, newVendor]);

    toast({
      title: "Vendor Created",
      description: `Vendor ${vendorForm.name} has been created successfully.`,
    });

    setVendorForm({
      vendor_code: '',
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      payment_terms: '',
      status: 'active'
    });
    setIsVendorDialogOpen(false);
  };

  const handleCreateProduct = () => {
    if (!productForm.name || !productForm.product_code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newProduct = {
      id: `product-${Date.now()}`,
      ...productForm
    };

    const localProducts = getLocalProducts();
    saveLocalProducts([...localProducts, newProduct]);

    toast({
      title: "Product Created",
      description: `Product ${productForm.name} has been created successfully.`,
    });

    setProductForm({
      product_code: '',
      name: '',
      description: '',
      category: '',
      unit_price: 0,
      unit_of_measure: '',
      currency: 'INR',
      status: 'active'
    });
    setIsProductDialogOpen(false);
  };

  const handleCreateCategory = () => {
    if (!categoryForm.name || !categoryForm.category_code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newCategory = {
      id: `category-${Date.now()}`,
      ...categoryForm
    };

    const localCategories = getLocalCategories();
    saveLocalCategories([...localCategories, newCategory]);

    toast({
      title: "Category Created",
      description: `Category ${categoryForm.name} has been created successfully.`,
    });

    setCategoryForm({
      category_code: '',
      name: '',
      description: '',
      budget_limit: 0,
      requires_approval: false,
      is_billable_default: false,
      status: 'active'
    });
    setIsCategoryDialogOpen(false);
  };

  const handleSave = (type: string) => {
    if (selectedItem) {
      // Handle edit
      toast({
        title: "Changes Saved",
        description: `${type} has been updated successfully.`,
      });
    } else {
      // Handle create
      switch (type.toLowerCase()) {
        case 'client':
          handleCreateClient();
          break;
        case 'vendor':
          handleCreateVendor();
          break;
        case 'product':
          handleCreateProduct();
          break;
        case 'category':
          handleCreateCategory();
          break;
      }
      return;
    }

    setIsClientDialogOpen(false);
    setIsVendorDialogOpen(false);
    setIsProductDialogOpen(false);
    setIsCategoryDialogOpen(false);
    setSelectedItem(null);
  };

  const handleBackupNow = () => {
    toast({
      title: "Backup Started",
      description: "Manual backup has been initiated.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: "success",
      inactive: "secondary",
      discontinued: "destructive",
      completed: "success",
      in_progress: "default",
      failed: "destructive",
    };
    
    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  // Combine mock data with local data
  const allClients = [...MOCK_CUSTOMERS, ...getLocalClients()];
  const allVendors = [...MOCK_VENDORS, ...getLocalVendors()];
  const allProducts = [...MOCK_PRODUCTS, ...getLocalProducts()];
  const allCategories = [...MOCK_EXPENSE_CATEGORIES, ...getLocalCategories()];

  const filteredClients = allClients.filter((client) =>
    searchTerm === "" ||
    Object.values(client).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredVendors = allVendors.filter((vendor) =>
    searchTerm === "" ||
    Object.values(vendor).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredProducts = allProducts.filter((product) =>
    searchTerm === "" ||
    Object.values(product).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredCategories = allCategories.filter((category) =>
    searchTerm === "" ||
    Object.values(category).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage master data, access control, and system configuration
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="clients">
            <Building2 className="h-4 w-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <TruckIcon className="h-4 w-4 mr-2" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderTree className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="system">
            <SettingsIcon className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => { 
              setSelectedItem(null); 
              setClientForm({ name: '', email: '', phone: '' });
              setIsClientDialogOpen(true); 
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(client, 'client')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(client.id, 'Client')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => { 
              setSelectedItem(null); 
              setVendorForm({
                vendor_code: '',
                name: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                country: '',
                payment_terms: '',
                status: 'active'
              });
              setIsVendorDialogOpen(true); 
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.vendor_code}</TableCell>
                      <TableCell>{vendor.name}</TableCell>
                      <TableCell>{vendor.contact_person || '-'}</TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>{vendor.phone || '-'}</TableCell>
                      <TableCell>{vendor.payment_terms || '-'}</TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(vendor, 'vendor')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(vendor.id, 'Vendor')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => { 
              setSelectedItem(null); 
              setProductForm({
                product_code: '',
                name: '',
                description: '',
                category: '',
                unit_price: 0,
                unit_of_measure: '',
                currency: 'INR',
                status: 'active'
              });
              setIsProductDialogOpen(true); 
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.product_code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(product.unit_price, product.currency)}</TableCell>
                      <TableCell>{product.unit_of_measure}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product, 'product')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id, 'Product')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => { 
              setSelectedItem(null); 
              setCategoryForm({
                category_code: '',
                name: '',
                description: '',
                budget_limit: 0,
                requires_approval: false,
                is_billable_default: false,
                status: 'active'
              });
              setIsCategoryDialogOpen(true); 
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Budget Limit</TableHead>
                    <TableHead>Requires Approval</TableHead>
                    <TableHead>Billable by Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.category_code}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{category.description || '-'}</TableCell>
                      <TableCell>
                        {category.budget_limit ? formatCurrency(category.budget_limit) : 'No Limit'}
                      </TableCell>
                      <TableCell>
                        {category.requires_approval ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {category.is_billable_default ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(category.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category, 'category')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id, 'Category')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Configure roles and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ROLES.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.display_name}</TableCell>
                        <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{role.user_count} users</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((perm, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4">
            {/* System Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {MOCK_SYSTEM_SETTINGS.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">
                        {setting.key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {setting.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {setting.value === 'true' || setting.value === 'false' ? (
                        <Switch checked={setting.value === 'true'} />
                      ) : (
                        <Input
                          value={setting.value}
                          className="w-32"
                          disabled
                        />
                      )}
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Backups */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Data Backups</CardTitle>
                    <CardDescription>
                      Manage system backups and data recovery
                    </CardDescription>
                  </div>
                  <Button onClick={handleBackupNow}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_BACKUPS.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>{new Date(backup.backup_date).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{backup.file_name}</TableCell>
                        <TableCell>{formatFileSize(backup.file_size)}</TableCell>
                        <TableCell>
                          <Badge variant={backup.backup_type === 'manual' ? 'default' : 'secondary'}>
                            {backup.backup_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(backup.status)}</TableCell>
                        <TableCell>{backup.created_by}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>
                  Track user activities and system changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_AUDIT_LOGS.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.user_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.entity_type}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{log.ip_address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Client Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Update client information' : 'Add a new client to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Name *</Label>
              <Input 
                id="client-name" 
                value={clientForm.name}
                onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email *</Label>
              <Input 
                id="client-email" 
                type="email" 
                value={clientForm.email}
                onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone</Label>
              <Input 
                id="client-phone" 
                value={clientForm.phone}
                onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClientDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSave('Client')}>
              {selectedItem ? 'Update' : 'Create'} Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Dialog */}
      <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Update vendor information' : 'Add a new vendor to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-code">Vendor Code</Label>
                <Input 
                  id="vendor-code" 
                  value={vendorForm.vendor_code}
                  onChange={(e) => setVendorForm(prev => ({ ...prev, vendor_code: e.target.value }))}
                  placeholder="VEN-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Name *</Label>
                <Input 
                  id="vendor-name" 
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter vendor name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-contact">Contact Person</Label>
                <Input 
                  id="vendor-contact" 
                  value={vendorForm.contact_person}
                  onChange={(e) => setVendorForm(prev => ({ ...prev, contact_person: e.target.value }))}
                  placeholder="Contact person name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-email">Email *</Label>
                <Input 
                  id="vendor-email" 
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-phone">Phone</Label>
                <Input 
                  id="vendor-phone" 
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-payment">Payment Terms</Label>
                <Input 
                  id="vendor-payment" 
                  value={vendorForm.payment_terms}
                  onChange={(e) => setVendorForm(prev => ({ ...prev, payment_terms: e.target.value }))}
                  placeholder="e.g. Net 30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-address">Address</Label>
              <Textarea 
                id="vendor-address" 
                value={vendorForm.address}
                onChange={(e) => setVendorForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter vendor address"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-city">City</Label>
                <Input 
                  id="vendor-city" 
                  value={vendorForm.city}
                  onChange={(e) => setVendorForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-state">State</Label>
                <Input 
                  id="vendor-state" 
                  value={vendorForm.state}
                  onChange={(e) => setVendorForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-country">Country</Label>
                <Input 
                  id="vendor-country" 
                  value={vendorForm.country}
                  onChange={(e) => setVendorForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Country"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-status">Status</Label>
              <Select value={vendorForm.status} onValueChange={(value) => setVendorForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVendorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSave('Vendor')}>
              {selectedItem ? 'Update' : 'Create'} Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Update product information' : 'Add a new product to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-code">Product Code *</Label>
                <Input 
                  id="product-code" 
                  value={productForm.product_code}
                  onChange={(e) => setProductForm(prev => ({ ...prev, product_code: e.target.value }))}
                  placeholder="PROD-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-name">Name *</Label>
                <Input 
                  id="product-name" 
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea 
                id="product-description" 
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-category">Category</Label>
                <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-uom">Unit of Measure</Label>
                <Select value={productForm.unit_of_measure} onValueChange={(value) => setProductForm(prev => ({ ...prev, unit_of_measure: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Each">Each</SelectItem>
                    <SelectItem value="Hour">Hour</SelectItem>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="License">License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-price">Unit Price</Label>
                <Input 
                  id="product-price" 
                  type="number"
                  value={productForm.unit_price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-currency">Currency</Label>
                <Select value={productForm.currency} onValueChange={(value) => setProductForm(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-status">Status</Label>
                <Select value={productForm.status} onValueChange={(value) => setProductForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSave('Product')}>
              {selectedItem ? 'Update' : 'Create'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Update expense category information' : 'Add a new expense category to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-code">Category Code *</Label>
                <Input 
                  id="category-code" 
                  value={categoryForm.category_code}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, category_code: e.target.value }))}
                  placeholder="CAT-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-name">Name *</Label>
                <Input 
                  id="category-name" 
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea 
                id="category-description" 
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-budget">Budget Limit</Label>
                <Input 
                  id="category-budget" 
                  type="number"
                  value={categoryForm.budget_limit}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, budget_limit: parseFloat(e.target.value) || 0 }))}
                  placeholder="0 (No limit)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-status">Status</Label>
                <Select value={categoryForm.status} onValueChange={(value) => setCategoryForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="category-approval"
                  checked={categoryForm.requires_approval}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, requires_approval: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="category-approval">Requires Approval</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="category-billable"
                  checked={categoryForm.is_billable_default}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, is_billable_default: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="category-billable">Billable by Default</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSave('Category')}>
              {selectedItem ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
