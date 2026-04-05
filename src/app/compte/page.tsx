'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  Settings,
  Pencil,
  Check,
  Phone,
  Mail,
  Building2,
  Truck,
  Loader2,
  Star,
  Globe,
  Heart,
  Search,
  Trash2,
  ShoppingBag,
  ShoppingCart,
  Plus,
  LogOut,
  Shield,
  ShieldCheck,
  Award,
  FileText,
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore, type AuthUser } from '@/store/auth-store';
import LoyaltyCard, { PointsHistory, RedeemDialog } from '@/components/loyalty/LoyaltyCard';
import dynamic from 'next/dynamic';
import Invoice from '@/components/order/Invoice';

const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard').then(m => ({ default: m.default })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 text-[#1B5E20] animate-spin" />
      <span className="ml-2 text-sm text-gray-500">Chargement du panneau...</span>
    </div>
  ),
});

// ============================================================
// Types
// ============================================================

interface FetchedOrder {
  id: string;
  date: string;
  status: string;
  statusColor: string;
  total: string;
  items: number;
  product: string;
}

interface FetchedProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceGNF: number;
  originalPriceGNF: number | null;
  rating: number;
  ratingCount: number;
  images: string;
  isOfficial: boolean;
  stock: number;
}

// ============================================================
// Compte Page
// ============================================================

export default function ComptePage() {
  const router = useRouter();
  // Auth state
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // --- Loyalty state ---
  const [loyaltyHistory, setLoyaltyHistory] = useState<{ points: number; source: string; description: string; date: string }[]>([]);
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [loyaltyKey, setLoyaltyKey] = useState(0);

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'settings' | 'wishlist' | 'loyalty' | 'admin'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  });

  const [settings, setSettings] = useState({
    language: 'Français',
    currency: 'GNF',
    notifications: true,
    newsletter: true,
  });

  // --- Invoice state ---
  const [invoiceOrderNumber, setInvoiceOrderNumber] = useState<string | null>(null);

  // --- Orders state ---
  const [phoneSearch, setPhoneSearch] = useState('');
  const [orders, setOrders] = useState<FetchedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearched, setOrdersSearched] = useState(false);

  // --- Wishlist state ---
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<FetchedProduct[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Read URL hash on mount and on hashchange to support mobile nav deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'favoris') {
        setActiveTab('wishlist');
      } else if (hash === 'commandes') {
        setActiveTab('orders');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Sync profile from auth user
  useEffect(() => {
    if (authUser) {
      setProfile({
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        city: authUser.city || '',
        address: authUser.address || '',
      });
    } else {
      // Try loading from localStorage as fallback
      try {
        const saved = localStorage.getItem('le-marche-profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          setProfile({
            name: parsed.name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            city: parsed.city || '',
            address: parsed.address || '',
          });
        }
      } catch {
        /* ignore */
      }
    }
  }, [authUser]);

  const handleAuthSuccess = useCallback((user: AuthUser) => {
    setProfile({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      address: user.address || '',
    });
    setShowAuthModal(false);
  }, []);

  const saveProfile = useCallback(async () => {
    // Always save to localStorage
    try {
      localStorage.setItem('le-marche-profile', JSON.stringify(profile));
    } catch {
      /* ignore */
    }

    // If authenticated, also update via auth store (and optimistically update DB via API)
    if (isAuthenticated) {
      try {
        await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profile.name,
            phone: profile.phone,
            city: profile.city,
            address: profile.address,
          }),
        });
      } catch {
        // API may not support PATCH yet, still save locally
      }
      updateProfile({
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
      });
    }

    setIsEditing(false);
    toast.success('Profil enregistre avec succes');
  }, [profile, isAuthenticated, updateProfile]);

  const handleLogout = useCallback(async () => {
    await logout();
    setProfile({ name: '', email: '', phone: '', city: '', address: '' });
    toast.success('Vous etes deconnecte');
  }, [logout]);

  // --- Fetch orders ---
  const handleSearchOrders = useCallback(async () => {
    const trimmed = phoneSearch.trim();
    if (trimmed.length < 3) {
      toast.error('Veuillez entrer un numero de telephone valide (min. 3 caracteres)');
      return;
    }
    setOrdersLoading(true);
    setOrdersSearched(true);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la recherche');
        setOrders([]);
      } else {
        setOrders(data.orders || []);
      }
    } catch {
      toast.error('Erreur de connexion');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [phoneSearch]);

  // --- Wishlist: load slugs and fetch products ---
  const loadWishlist = useCallback(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('le-marche-wishlist') || '[]');
      setWishlistSlugs(stored);
    } catch {
      setWishlistSlugs([]);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'wishlist') {
      loadWishlist();
    }
  }, [activeTab, loadWishlist]);

  useEffect(() => {
    if (wishlistSlugs.length === 0) {
      setWishlistProducts([]);
      return;
    }
    let cancelled = false;
    const fetchProducts = async () => {
      setWishlistLoading(true);
      const results: FetchedProduct[] = [];
      await Promise.all(
        wishlistSlugs.map(async (slug) => {
          try {
            const res = await fetch(`/api/products/${slug}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.product && !cancelled) {
              results.push(data.product);
            }
          } catch {
            /* skip failed */
          }
        })
      );
      if (!cancelled) {
        setWishlistProducts(results);
      }
      setWishlistLoading(false);
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [wishlistSlugs]);

  const removeWishlistItem = useCallback((slug: string) => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('le-marche-wishlist') || '[]');
      const updated = stored.filter((s) => s !== slug);
      localStorage.setItem('le-marche-wishlist', JSON.stringify(updated));
      setWishlistSlugs(updated);
      toast.success('Retire des favoris');
    } catch {
      toast.error('Erreur lors de la mise a jour des favoris');
    }
  }, []);

  // --- Loyalty data fetch ---
  const fetchLoyaltyData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/loyalty');
      if (res.ok) {
        const data = await res.json();
        setLoyaltyBalance(data.balance || 0);
        setLoyaltyHistory(data.history || []);
      }
    } catch {
      // Silently fail
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'loyalty') {
      fetchLoyaltyData();
    }
  }, [activeTab, fetchLoyaltyData]);

  // --- Promote to admin handler (requires existing admin session) ---
  const [promoting, setPromoting] = useState(false);
  const handlePromoteAdmin = useCallback(async () => {
    if (!authUser?.email) {
      toast.error('Vous devez etre connecte');
      return;
    }
    if (authUser.role !== 'admin') {
      toast.error('Cette fonctionnalite est reservee aux administrateurs existants. Contactez le support.');
      return;
    }
    const targetEmail = window.prompt('Entrez l\'adresse e-mail de l\'utilisateur a promouvoir administrateur :');
    if (!targetEmail || !targetEmail.trim()) return;
    setPromoting(true);
    try {
      const res = await fetch('/api/auth/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      toast.success('Utilisateur promu administrateur !');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la promotion');
    } finally {
      setPromoting(false);
    }
  }, [authUser]);

  // --- Address / delete handlers ---
  const handleAddAddress = useCallback(() => {
    toast.info('Bientot disponible');
  }, []);

  const handleDeleteAccount = useCallback(() => {
    const confirmed = window.confirm(
      'Etes-vous sur de vouloir supprimer votre compte ? Cette action est irreversible.'
    );
    if (confirmed) {
      toast.success('Compte supprime (demo)');
    }
  }, []);

  // --- Reorder (Buy Again) ---
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const handleReorder = useCallback(async (orderNumber: string) => {
    setReorderingId(orderNumber);
    try {
      const res = await fetch(`/api/orders/${orderNumber}`);
      if (!res.ok) {
        toast.error('Impossible de recuperer les details de la commande');
        return;
      }
      const data = await res.json();
      const order = data.order;
      let orderItems: Array<{ productId: string; name: string; slug: string; price: number; quantity: number; color: string | null; image: string | null }> = [];
      try { orderItems = JSON.parse(order.items); } catch { orderItems = []; }

      const addItem = useCartStore.getState().addItem;
      for (const item of orderItems) {
        addItem({
          productId: item.productId,
          productSlug: item.slug,
          productName: item.name,
          image: item.image || '',
          color: '',
          colorLabel: item.color || '',
          size: '',
          sizeLabel: 'Unique',
          priceGNF: item.price,
          originalPriceGNF: item.price,
          quantity: item.quantity,
          stock: 999,
        });
      }
      toast.success(`${orderItems.length} article${orderItems.length > 1 ? 's' : ''} ajoute(s) au panier`);
      router.push('/panier');
    } catch {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setReorderingId(null);
    }
  }, [router]);

  // --- Tabs ---
  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'orders' as const, label: 'Commandes', icon: Package },
    { id: 'addresses' as const, label: 'Adresses', icon: MapPin },
    { id: 'wishlist' as const, label: 'Favoris', icon: Heart },
    { id: 'loyalty' as const, label: 'Fidelite', icon: Award },
    { id: 'settings' as const, label: 'Parametres', icon: Settings },
    ...(authUser?.role === 'admin' ? [{ id: 'admin' as const, label: 'Administration', icon: ShieldCheck }] : []),
  ];

  // --- Profile initials ---
  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[40vh]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-xl p-5 mb-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">
                {isAuthenticated && authUser?.name ? authUser.name : profile.name || 'Mon Compte'}
              </h2>
              {(isAuthenticated && authUser?.email) && (
                <p className="text-sm text-white/80 truncate">{authUser.email}</p>
              )}
              {(!isAuthenticated && profile.email) && (
                <p className="text-sm text-white/80 truncate">{profile.email}</p>
              )}
              {isAuthenticated && (
                <Badge className="mt-1 bg-white/20 text-white border-0 text-[10px]">
                  <Shield className="h-3 w-3 mr-1" /> Compte connecte
                </Badge>
              )}
              {!isAuthenticated && (
                <p className="text-xs text-white/60 mt-1">Connectez-vous pour synchroniser vos donnees</p>
              )}
            </div>
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Deconnexion</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="bg-white text-[#1B5E20] hover:bg-white/90"
              >
                <User className="w-4 h-4 mr-1.5" />
                Se connecter
              </Button>
            )}
          </div>
        </div>

        {/* Not authenticated banner */}
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Creer un compte ou connectez-vous</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Suivez vos commandes, sauvegardez vos favoris et beneficiez d&apos;offres exclusives.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="bg-[#1B5E20] hover:bg-[#145218] text-white text-xs"
                >
                  Se connecter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                  className="border-[#1B5E20] text-[#1B5E20] text-xs"
                >
                  Creer un compte
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 mb-5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1B5E20] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* ========================= PROFILE TAB ========================= */}
          {activeTab === 'profile' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Informations personnelles</h3>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-[#1B5E20] border-[#1B5E20] hover:bg-[#E8F5E9]"
                  >
                    <Pencil className="w-[18px] h-[18px] mr-1.5" />
                    Modifier
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={saveProfile}
                    className="bg-[#1B5E20] hover:bg-[#145218] text-white"
                  >
                    <Check className="w-[18px] h-[18px] mr-1.5" />
                    Enregistrer
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-[18px] h-[18px] text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium">Nom complet</label>
                    {isEditing ? (
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Votre nom complet"
                        className="mt-1 h-9"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-0.5">
                        {profile.name || <span className="text-gray-400">Non renseigne</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-[18px] h-[18px] text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium">Adresse e-mail</label>
                    {isAuthenticated ? (
                      <p className="text-sm text-gray-900 mt-0.5">
                        {authUser?.email || <span className="text-gray-400">Non renseigne</span>}
                      </p>
                    ) : isEditing ? (
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="votre@email.com"
                        className="mt-1 h-9"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-0.5">
                        {profile.email || <span className="text-gray-400">Non renseigne</span>}
                      </p>
                    )}
                    {isAuthenticated && (
                      <p className="text-[10px] text-gray-400 mt-0.5">L&apos;e-mail ne peut pas etre modifie</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-[18px] h-[18px] text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium">Telephone</label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+224 6XX XX XX XX"
                        className="mt-1 h-9"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-0.5">
                        {profile.phone || <span className="text-gray-400">Non renseigne</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* City */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-[18px] h-[18px] text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium">Ville</label>
                    {isEditing ? (
                      <Input
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        placeholder="Conakry"
                        className="mt-1 h-9"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-0.5">
                        {profile.city || <span className="text-gray-400">Non renseigne</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address (only when editing or has value) */}
                {(isEditing || profile.address) && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-[18px] h-[18px] text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 font-medium">Adresse</label>
                      {isEditing ? (
                        <Input
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          placeholder="Quartier, rue..."
                          className="mt-1 h-9"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-0.5">
                          {profile.address || <span className="text-gray-400">Non renseigne</span>}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================= ORDERS TAB ========================= */}
          {activeTab === 'orders' && (
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Historique des commandes</h3>

              {/* If authenticated, auto-search with user phone */}
              {isAuthenticated && !phoneSearch && !ordersSearched && (
                <div className="mb-4">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (authUser?.phone) {
                        setPhoneSearch(authUser.phone);
                      } else {
                        toast.info('Ajoutez votre numero de telephone dans votre profil');
                      }
                    }}
                    className="bg-[#1B5E20] hover:bg-[#145218] text-white text-xs"
                  >
                    <Search className="w-3 h-3 mr-1" />
                    {authUser?.phone ? `Voir mes commandes (${authUser.phone})` : 'Voir mes commandes'}
                  </Button>
                </div>
              )}

              {/* Phone search */}
              <div className="flex gap-2 mb-5">
                <div className="flex-1 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="Rechercher mes commandes par telephone"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchOrders()}
                    className="pl-9 h-10"
                  />
                </div>
                <Button
                  onClick={handleSearchOrders}
                  disabled={ordersLoading}
                  className="bg-[#1B5E20] hover:bg-[#145218] text-white h-10 px-5"
                >
                  {ordersLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Empty state before search */}
              {!ordersSearched && !ordersLoading && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Entrez votre numero pour voir vos commandes</p>
                </div>
              )}

              {/* Loading */}
              {ordersLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#1B5E20] animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Recherche en cours...</span>
                </div>
              )}

              {/* No results */}
              {!ordersLoading && ordersSearched && orders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Aucune commande trouvee pour ce numero</p>
                </div>
              )}

              {/* Orders list */}
              {!ordersLoading && orders.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#1B5E20]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{order.id}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                        <Badge className={`${order.statusColor} border-0 text-xs`}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{order.product}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {order.items} article{order.items > 1 ? 's' : ''}
                        </span>
                        <span className="text-sm font-bold text-[#B12704]">{order.total}</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          asChild
                        >
                          <Link href={`/commande/confirmation?order=${order.id}`}>
                            <Package className="w-3 h-3 mr-1" />
                            Details
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          asChild
                        >
                          <Link href={`/commande/confirmation?order=${order.id}`}>
                            <Truck className="w-3 h-3 mr-1" />
                            Suivre
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8 border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9]"
                          onClick={() => setInvoiceOrderNumber(order.id)}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Facture
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs h-8 bg-[#1B5E20] hover:bg-[#145218] text-white"
                          onClick={() => handleReorder(order.id)}
                          disabled={reorderingId === order.id}
                        >
                          {reorderingId === order.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-3 h-3 mr-1" />
                          )}
                          Commander a nouveau
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================= ADDRESSES TAB ========================= */}
          {activeTab === 'addresses' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Carnet d&apos;adresses</h3>
                <Button
                  size="sm"
                  onClick={handleAddAddress}
                  className="bg-[#1B5E20] hover:bg-[#145218] text-white text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucune adresse enregistree</p>
                <p className="text-xs text-gray-400 mt-1">
                  Ajoutez votre premiere adresse pour la livraison
                </p>
              </div>
            </div>
          )}

          {/* ========================= LOYALTY TAB ========================= */}
          {activeTab === 'loyalty' && (
            <div className="p-5">
              {!isAuthenticated ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">Connectez-vous pour acceder au programme de fidelite</p>
                  <p className="text-xs text-gray-400">Gagnez des points a chaque achat et echangez-les contre des reductions</p>
                </div>
              ) : (
                <>
                  <LoyaltyCard
                    key={loyaltyKey}
                    onRedeemOpen={() => setShowRedeemDialog(true)}
                  />
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Historique des points</h4>
                    <PointsHistory history={loyaltyHistory} />
                  </div>
                  <RedeemDialog
                    open={showRedeemDialog}
                    onOpenChange={setShowRedeemDialog}
                    balance={loyaltyBalance}
                    onSuccess={() => {
                      setLoyaltyKey((k) => k + 1);
                      fetchLoyaltyData();
                    }}
                  />
                </>
              )}
            </div>
          )}

          {/* ========================= WISHLIST TAB ========================= */}
          {activeTab === 'wishlist' && (
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Mes favoris</h3>

              {wishlistLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {!wishlistLoading && wishlistProducts.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Aucun produit dans vos favoris</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ajoutez des produits en cliquant sur le coeur
                  </p>
                </div>
              )}

              {!wishlistLoading && wishlistProducts.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {wishlistProducts.map((product) => {
                    let images: string[] = [];
                    try { images = JSON.parse(product.images); } catch { images = []; }
                    const mainImage = images[0] || '';

                    return (
                      <div
                        key={product.id}
                        className="relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <Link href={`/produit/${product.slug}`} className="block">
                          <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBag className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-[10px] text-[#444] font-medium uppercase tracking-wider mb-0.5">
                              {product.brand}
                            </p>
                            <h4 className="text-xs text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 min-h-[2rem] leading-4 font-medium">
                              {product.name}
                            </h4>
                            <p className="text-sm font-bold text-[#B12704]">
                              {product.priceGNF.toLocaleString('fr-FR')} GNF
                            </p>
                          </div>
                        </Link>
                        {/* Remove button */}
                        <button
                          onClick={() => removeWishlistItem(product.slug)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors z-10"
                          aria-label="Retirer des favoris"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================= SETTINGS TAB ========================= */}
          {activeTab === 'settings' && (
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">Parametres</h3>
              <div className="space-y-5">
                {/* Account info */}
                {isAuthenticated && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Compte</p>
                        <p className="text-xs text-gray-500">Connecte en tant que {authUser?.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {authUser?.role === 'admin' && (
                          <Badge className="bg-[#1B5E20] text-white border-0 text-[10px]">
                            <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                          </Badge>
                        )}
                        <Badge className="bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9] text-xs">
                          <Check className="h-3 w-3 mr-1" /> Actif
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Language */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Langue</p>
                    <p className="text-xs text-gray-500">Choisissez votre langue preferee</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-1.5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Globe className="h-3.5 w-3.5" /> {settings.language}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Currency */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Devise</p>
                    <p className="text-xs text-gray-500">Devise d&apos;affichage des prix</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-1.5">
                    <span className="text-sm font-medium text-gray-700">{settings.currency} — Franc Guineen</span>
                  </div>
                </div>

                <Separator />

                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notifications push</p>
                    <p className="text-xs text-gray-500">Recevez les mises a jour de commande</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      settings.notifications ? 'bg-[#1B5E20]' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle notifications"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        settings.notifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <Separator />

                {/* Newsletter */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Newsletter</p>
                    <p className="text-xs text-gray-500">Offres et promotions par e-mail</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, newsletter: !settings.newsletter })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      settings.newsletter ? 'bg-[#1B5E20]' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle newsletter"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        settings.newsletter ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <Separator />

                {/* Logout */}
                {isAuthenticated && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9] text-sm"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Se deconnecter
                    </Button>
                    <Separator />
                  </>
                )}

                {/* Delete Account */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={handleDeleteAccount}
                    className="w-full border-red-200 text-[#B12704] hover:bg-red-50 hover:text-[#8B1A03] text-sm"
                  >
                    Supprimer mon compte
                  </Button>
                </div>

                {/* Promote to Admin (demo) */}
                {isAuthenticated && authUser?.role !== 'admin' && (
                  <>
                    <Separator />
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        onClick={handlePromoteAdmin}
                        disabled={promoting}
                        className="w-full border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9] text-sm"
                      >
                        {promoting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 mr-2" />
                        )}
                        Devenir administrateur (demo)
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ========================= ADMIN TAB ========================= */}
          {activeTab === 'admin' && <AdminDashboard />}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Invoice Dialog */}
      {invoiceOrderNumber && (
        <Invoice
          orderNumber={invoiceOrderNumber}
          open={!!invoiceOrderNumber}
          onOpenChange={(open) => {
            if (!open) setInvoiceOrderNumber(null);
          }}
        />
      )}
    </div>
  );
}
