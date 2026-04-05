'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  Edit,
  Eye,
  Search,
  Filter,
  Plus,
  Check,
  X,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Tag,
  AlertTriangle,
  Clock,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ============================================================
// Types
// ============================================================

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

interface RecentOrder {
  id: string;
  fullName: string;
  phone: string;
  date: string;
  status: string;
  statusColor: string;
  statusRaw: string;
  total: string;
  itemCount: number;
}

interface TopProduct {
  id: string;
  name: string;
  brand: string;
  priceGNF: number;
  stock: number;
  salesCount: number;
  image: string | null;
  slug: string;
  isActive: boolean;
}

interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  priceGNF: number;
  originalPriceGNF: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isOfficial: boolean;
  rating: number;
  ratingCount: number;
  salesCount: number;
  categoryId: string;
  categoryName: string;
  image: string | null;
  createdAt: string;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  city: string;
  address: string | null;
  date: string;
  status: string;
  statusColor: string;
  statusRaw: string;
  paymentMethod: string;
  deliveryType: string;
  subtotalGNF: number;
  deliveryFeeGNF: number;
  totalGNF: number;
  total: string;
  items: { name: string; quantity: number; price: number }[];
  itemCount: number;
  couponCode: string | null;
  couponDiscount: number | null;
  notes: string | null;
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  productCount: number;
  createdAt: string;
}

type TabId = 'overview' | 'products' | 'orders' | 'categories';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'shipping', label: 'En livraison' },
  { value: 'delivered', label: 'Livré' },
  { value: 'cancelled', label: 'Annulé' },
];

// ============================================================
// AdminDashboard Component
// ============================================================

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Products state
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsSearch, setProductsSearch] = useState('');
  const [productsCategoryFilter, setProductsCategoryFilter] = useState('');
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotalPages, setProductsTotalPages] = useState(1);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editProductData, setEditProductData] = useState<Record<string, unknown>>({});

  // Orders state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  // Order status change dialog
  const [statusDialogOrder, setStatusDialogOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [catCreating, setCatCreating] = useState(false);

  // Product editing
  const [productSaving, setProductSaving] = useState(false);

  // ============================================================
  // Fetch functions
  // ============================================================

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async (page = 1) => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (productsSearch) params.set('search', productsSearch);
      if (productsCategoryFilter) params.set('categoryId', productsCategoryFilter);
      const res = await fetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setProducts(data.products);
      setProductsTotalPages(data.pagination.totalPages);
      setProductsPage(page);
    } catch {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setProductsLoading(false);
    }
  }, [productsSearch, productsCategoryFilter]);

  const fetchOrders = useCallback(async (page = 1) => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (ordersSearch) params.set('search', ordersSearch);
      if (ordersStatusFilter) params.set('status', ordersStatusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setOrders(data.orders);
      setOrdersTotalPages(data.pagination.totalPages);
      setOrdersPage(page);
    } catch {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setOrdersLoading(false);
    }
  }, [ordersSearch, ordersStatusFilter]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setCategories(data.categories);
    } catch {
      toast.error('Erreur lors du chargement des categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
    else if (activeTab === 'products') fetchProducts(1);
    else if (activeTab === 'orders') fetchOrders(1);
    else if (activeTab === 'categories') fetchCategories();
  }, [activeTab, fetchStats, fetchProducts, fetchOrders, fetchCategories]);

  // ============================================================
  // Handlers
  // ============================================================

  const handleProductEditStart = useCallback((product: AdminProduct) => {
    setEditingProduct(product.id);
    setEditProductData({
      name: product.name,
      brand: product.brand,
      priceGNF: product.priceGNF,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
  }, []);

  const handleProductEditCancel = useCallback(() => {
    setEditingProduct(null);
    setEditProductData({});
  }, []);

  const handleProductEditSave = useCallback(async (productId: string) => {
    setProductSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProductData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      toast.success('Produit mis a jour');
      setEditingProduct(null);
      setEditProductData({});
      fetchProducts(productsPage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise a jour');
    } finally {
      setProductSaving(false);
    }
  }, [editProductData, fetchProducts, productsPage]);

  const handleToggleActive = useCallback(async (productId: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentValue }),
      });
      if (!res.ok) throw new Error();
      toast.success(currentValue ? 'Produit desactive' : 'Produit active');
      fetchProducts(productsPage);
    } catch {
      toast.error('Erreur lors de la modification');
    }
  }, [fetchProducts, productsPage]);

  const handleToggleFeatured = useCallback(async (productId: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentValue }),
      });
      if (!res.ok) throw new Error();
      toast.success(currentValue ? 'Produit retire des vedettes' : 'Produit mis en vedette');
      fetchProducts(productsPage);
    } catch {
      toast.error('Erreur lors de la modification');
    }
  }, [fetchProducts, productsPage]);

  const handleStatusChangeConfirm = useCallback(async () => {
    if (!statusDialogOrder || !newStatus) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${statusDialogOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      toast.success('Statut de la commande mis a jour');
      setStatusDialogOrder(null);
      setNewStatus('');
      fetchOrders(ordersPage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise a jour');
    } finally {
      setStatusUpdating(false);
    }
  }, [statusDialogOrder, newStatus, fetchOrders, ordersPage]);

  const handleCreateCategory = useCallback(async () => {
    if (!newCatName.trim()) {
      toast.error('Nom de categorie requis');
      return;
    }
    setCatCreating(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, description: newCatDescription }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      toast.success('Categorie creee');
      setNewCatName('');
      setNewCatDescription('');
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la creation');
    } finally {
      setCatCreating(false);
    }
  }, [newCatName, newCatDescription, fetchCategories]);

  // ============================================================
  // Tab definitions
  // ============================================================

  const tabs: { id: TabId; label: string; icon: typeof Package }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'categories', label: 'Categories', icon: Tag },
  ];

  // ============================================================
  // Render helpers
  // ============================================================

  const formatPrice = (value: number) => value.toLocaleString('fr-FR') + ' GNF';

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1B5E20]" />
            Panneau d&apos;administration
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Gerez votre boutique en ligne</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (activeTab === 'overview') fetchStats();
            else if (activeTab === 'products') fetchProducts(productsPage);
            else if (activeTab === 'orders') fetchOrders(ordersPage);
            else if (activeTab === 'categories') fetchCategories();
          }}
          className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9] text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1.5" />
          Actualiser
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#1B5E20] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================= OVERVIEW TAB ========================= */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {statsLoading && !stats ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin" />
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-[#1B5E20]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Produits</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {stats.activeProducts}
                          <span className="text-xs font-normal text-gray-400 ml-1">
                            / {stats.totalProducts}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-5 h-5 text-[#1565C0]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Commandes</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {stats.totalOrders}
                          {stats.pendingOrders > 0 && (
                            <span className="text-xs font-normal text-amber-600 ml-1">
                              ({stats.pendingOrders} en attente)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-[#E65100]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Revenus</p>
                        <p className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                          {formatPrice(stats.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F3E5F5] flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-[#7B1FA2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Utilisateurs</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {stats.totalUsers}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Two column: Recent orders + Top products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Orders */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#1B5E20]" />
                      Dernieres commandes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {stats.recentOrders.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">Aucune commande</p>
                    ) : (
                      <div className="space-y-2.5 max-h-80 overflow-y-auto">
                        {stats.recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {order.fullName}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate">
                                {order.id} -- {order.date}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <Badge className={`${order.statusColor} border-0 text-[10px]`}>
                                {order.status}
                              </Badge>
                              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                                {order.total}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#FF8F00]" />
                      Produits les plus vendus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {stats.topProducts.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">Aucune vente</p>
                    ) : (
                      <div className="space-y-2.5 max-h-80 overflow-y-auto">
                        {stats.topProducts.map((product, idx) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#1B5E20]/10 flex items-center justify-center text-xs font-bold text-[#1B5E20] shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-gray-500">{product.brand}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                {product.salesCount} ventes
                              </p>
                              <p className="text-[11px] text-gray-500">{formatPrice(product.priceGNF)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ========================= PRODUCTS TAB ========================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, marque..."
                value={productsSearch}
                onChange={(e) => setProductsSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts(1)}
                className="pl-9 h-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => fetchProducts(1)}
              className="h-10 border-[#1B5E20] text-[#1B5E20]"
            >
              <Search className="w-4 h-4 mr-1.5" />
              Rechercher
            </Button>
          </div>

          {/* Category filter (only when categories are available) */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <Select
                value={productsCategoryFilter}
                onValueChange={(v) => {
                  setProductsCategoryFilter(v === 'all' ? '' : v);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-64">
                  <SelectValue placeholder="Toutes les categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({cat.productCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Products Table */}
          {productsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Aucun produit trouve</p>
            </div>
          ) : (
            <>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="text-xs font-semibold">Produit</TableHead>
                        <TableHead className="text-xs font-semibold hidden md:table-cell">Categorie</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Prix</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Stock</TableHead>
                        <TableHead className="text-xs font-semibold text-center hidden sm:table-cell">Actif</TableHead>
                        <TableHead className="text-xs font-semibold text-center hidden sm:table-cell">Vedette</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                                {product.image ? (
                                  <img src={product.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                {editingProduct === product.id ? (
                                  <Input
                                    value={String(editProductData.name || '')}
                                    onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}
                                    className="h-7 text-xs w-full"
                                  />
                                ) : (
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                                    {product.name}
                                  </p>
                                )}
                                {editingProduct !== product.id && (
                                  <p className="text-[11px] text-gray-500">{product.brand}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary" className="text-[10px]">
                              {product.categoryName}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            {editingProduct === product.id ? (
                              <Input
                                type="number"
                                value={String(editProductData.priceGNF || '')}
                                onChange={(e) => setEditProductData({ ...editProductData, priceGNF: Number(e.target.value) })}
                                className="h-7 text-xs w-28 text-right ml-auto"
                              />
                            ) : (
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {formatPrice(product.priceGNF)}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            {editingProduct === product.id ? (
                              <Input
                                type="number"
                                value={String(editProductData.stock || '')}
                                onChange={(e) => setEditProductData({ ...editProductData, stock: Number(e.target.value) })}
                                className="h-7 text-xs w-20 text-right ml-auto"
                              />
                            ) : (
                              <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                {product.stock}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-center hidden sm:table-cell">
                            <Switch
                              checked={editingProduct === product.id ? Boolean(editProductData.isActive) : product.isActive}
                              onCheckedChange={(checked) => {
                                if (editingProduct === product.id) {
                                  setEditProductData({ ...editProductData, isActive: checked });
                                } else {
                                  handleToggleActive(product.id, product.isActive);
                                }
                              }}
                              className="data-[state=checked]:bg-[#1B5E20]"
                            />
                          </TableCell>

                          <TableCell className="text-center hidden sm:table-cell">
                            <Switch
                              checked={editingProduct === product.id ? Boolean(editProductData.isFeatured) : product.isFeatured}
                              onCheckedChange={(checked) => {
                                if (editingProduct === product.id) {
                                  setEditProductData({ ...editProductData, isFeatured: checked });
                                } else {
                                  handleToggleFeatured(product.id, product.isFeatured);
                                }
                              }}
                              className="data-[state=checked]:bg-[#FF8F00]"
                            />
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {editingProduct === product.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleProductEditCancel}
                                    className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleProductEditSave(product.id)}
                                    disabled={productSaving}
                                    className="h-7 px-2 bg-[#1B5E20] hover:bg-[#145218] text-white text-xs"
                                  >
                                    {productSaving ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" />
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleProductEditStart(product)}
                                  className="h-7 w-7 p-0 text-gray-500 hover:text-[#1B5E20]"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {productsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchProducts(productsPage - 1)}
                    disabled={productsPage <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {productsPage} / {productsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchProducts(productsPage + 1)}
                    disabled={productsPage >= productsTotalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================= ORDERS TAB ========================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par telephone, nom, numero..."
                value={ordersSearch}
                onChange={(e) => setOrdersSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders(1)}
                className="pl-9 h-10"
              />
            </div>
            <Select value={ordersStatusFilter} onValueChange={(v) => setOrdersStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="h-10 w-full sm:w-48">
                <Filter className="w-4 h-4 mr-1 text-gray-400" />
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => fetchOrders(1)}
              className="h-10 border-[#1B5E20] text-[#1B5E20]"
            >
              <Search className="w-4 h-4 mr-1.5" />
              Rechercher
            </Button>
          </div>

          {/* Orders List */}
          {ordersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Aucune commande trouvee</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {orders.map((order) => (
                  <Card key={order.id} className="border border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        {/* Left: order info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {order.orderNumber}
                            </p>
                            <Badge className={`${order.statusColor} border-0 text-[10px]`}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <p>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Client :</span>{' '}
                              {order.fullName}
                            </p>
                            <p>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Telephone :</span>{' '}
                              {order.phone}
                            </p>
                            <p>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Ville :</span>{' '}
                              {order.city}
                            </p>
                            <p>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Date :</span>{' '}
                              {order.date}
                            </p>
                            <p>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Livraison :</span>{' '}
                              {order.deliveryType === 'pickup' ? 'Retrait' : 'Domicile'}
                            </p>
                            <p>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Paiement :</span>{' '}
                              {order.paymentMethod.replace(/_/g, ' ')}
                            </p>
                          </div>
                          {order.items.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2 truncate">
                              {order.items.map((i) => `${i.name} x${i.quantity}`).join(' | ')}
                            </p>
                          )}
                          {order.couponCode && (
                            <Badge variant="secondary" className="text-[10px] mt-1.5">
                              Code promo: {order.couponCode}
                              {order.couponDiscount ? ` (-${order.couponDiscount.toLocaleString('fr-FR')} GNF)` : ''}
                            </Badge>
                          )}
                          {order.notes && (
                            <p className="text-[11px] text-gray-400 mt-1 italic">{order.notes}</p>
                          )}
                        </div>

                        {/* Right: total + actions */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 shrink-0">
                          <p className="text-base font-bold text-[#B12704]">{order.total}</p>
                          <p className="text-[11px] text-gray-500">
                            {order.itemCount} article{order.itemCount > 1 ? 's' : ''}
                          </p>
                          <Select
                            value={order.statusRaw}
                            onValueChange={(value) => {
                              setNewStatus(value);
                              setStatusDialogOrder(order);
                            }}
                          >
                            <SelectTrigger className="h-8 w-full sm:w-40 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {ordersTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchOrders(ordersPage - 1)}
                    disabled={ordersPage <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {ordersPage} / {ordersTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchOrders(ordersPage + 1)}
                    disabled={ordersPage >= ordersTotalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================= CATEGORIES TAB ========================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* Add new category */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#1B5E20]" />
                Nouvelle categorie
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Nom de la categorie"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="Description (optionnelle)"
                    value={newCatDescription}
                    onChange={(e) => setNewCatDescription(e.target.value)}
                    className="h-9 min-h-9 resize-none"
                  />
                </div>
                <Button
                  onClick={handleCreateCategory}
                  disabled={catCreating || !newCatName.trim()}
                  className="h-9 bg-[#1B5E20] hover:bg-[#145218] text-white shrink-0"
                >
                  {catCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1.5" />
                  )}
                  Creer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories list */}
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Aucune categorie</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <Card key={cat.id} className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {cat.name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">/{cat.slug}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9] text-[10px] shrink-0"
                      >
                        <Package className="w-3 h-3 mr-0.5" />
                        {cat.productCount}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================= ORDER STATUS CONFIRMATION DIALOG ========================= */}
      <AlertDialog open={!!statusDialogOrder} onOpenChange={(open) => !open && setStatusDialogOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirmer le changement de statut
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous etes sur le point de changer le statut de la commande{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {statusDialogOrder?.orderNumber}
              </span>{' '}
              de &quot;{statusDialogOrder?.status}&quot; a &quot;
              {STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}&quot;.
              {newStatus === 'cancelled' && (
                <span className="block mt-2 text-red-600 font-medium">
                  Attention : annuler une commande est irreversible.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusUpdating}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChangeConfirm}
              disabled={statusUpdating}
              className="bg-[#1B5E20] hover:bg-[#145218] text-white"
            >
              {statusUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Mise a jour...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Confirmer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
