'use client';

import { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  ArrowRight,
  Home,
  UserCircle,
  Copy,
  Check,
  MapPin,
  Phone,
  Loader2,
  AlertTriangle,
  ClipboardCheck,
  Settings2,
  Share2,
  MessageCircle,
  FileText,
  ShoppingCart,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useProductStore, formatPrice } from '@/store/product-store';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import SocialShareBar from '@/components/product/SocialShareBar';
import Invoice from '@/components/order/Invoice';

// ============================================================
// Types
// ============================================================

interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  color: string | null;
  image: string | null;
}

interface StatusHistoryEntry {
  status: string;
  label: string;
  date: string;
}

interface OrderData {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  deliveryType: string;
  fullName: string;
  phone: string;
  city: string;
  address: string | null;
  items: string; // JSON
  subtotalGNF: number;
  deliveryFeeGNF: number;
  totalGNF: number;
  createdAt: string;
}

// ============================================================
// Timeline step configuration
// ============================================================

const TIMELINE_STEPS = [
  { status: 'pending', label: 'Commande pass\u00e9e', icon: Clock },
  { status: 'confirmed', label: 'Confirm\u00e9e', icon: ClipboardCheck },
  { status: 'preparing', label: 'En pr\u00e9paration', icon: Settings2 },
  { status: 'shipping', label: 'En livraison', icon: Truck },
  { status: 'delivered', label: 'Livr\u00e9e', icon: MapPin },
];

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered'];

// ============================================================
// Format date helper
// ============================================================

function formatTimelineDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatEstimatedDelivery(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ============================================================
// Confirmation Content
// ============================================================

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('order') || '';
  const selectedCurrency = useProductStore((s) => s.selectedCurrency);
  const selectedCountry = useProductStore((s) => s.selectedCountry);

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Fetch order
  useEffect(() => {
    if (!orderNumber) {
      setError('Num\u00e9ro de commande manquant');
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (!res.ok) {
          setError('Commande non trouv\u00e9e');
          return;
        }
        const data = await res.json();
        setOrderData(data.order);
        setStatusHistory(data.statusHistory || []);
        setEstimatedDelivery(data.estimatedDelivery || '');
      } catch {
        setError('Erreur lors du chargement de la commande');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const orderItems = useMemo(() => {
    if (!orderData?.items) return [];
    try { return JSON.parse(orderData.items); } catch { return []; }
  }, [orderData?.items]);

  const paymentLabel =
    orderData?.paymentMethod === 'orange_money' ? 'Orange Money' :
    orderData?.paymentMethod === 'mtn_momo' ? 'MTN MoMo' :
    orderData?.paymentMethod === 'wave' ? 'Wave' :
    'Cash \u00e0 la livraison';

  // Determine current step index and if cancelled
  const currentStatusIndex = orderData ? STATUS_ORDER.indexOf(orderData.status) : -1;
  const isCancelled = orderData?.status === 'cancelled';

  // Reorder handler
  const handleAddAllToCart = useCallback(() => {
    setReordering(true);
    try {
      const addItem = useCartStore.getState().addItem;
      for (const item of orderItems) {
        addItem({
          productId: item.productId,
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
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setReordering(false);
    }
  }, [orderItems, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] dark:bg-gray-950 px-4">
        <AlertTriangle className="w-12 h-12 text-[#FF8F00] mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{error}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Veuillez v\u00e9rifier votre num\u00e9ro de commande.</p>
        <Link href="/">
          <Button className="bg-[#1B5E20] hover:bg-[#145218] text-white">
            Retour &agrave; l&apos;accueil
          </Button>
        </Link>
      </div>
    );
  }

  if (!orderData) return null;

  return (
    <div className="min-h-[40vh] dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-[#2E7D32]" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Merci pour votre commande !
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Votre commande a \u00e9t\u00e9 confirm\u00e9e avec succ\u00e8s. Vous recevrez un SMS de confirmation.
          </p>

          {/* Order Number */}
          <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-200 dark:border-gray-700 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">Commande :</span>
            <span className="text-base font-bold text-[#1B5E20]">{orderNumber}</span>
            <button
              onClick={copyOrderNumber}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Copier le num\u00e9ro"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#2E7D32]" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Order Tracking Timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#1B5E20]" />
            Suivi de votre commande
          </h3>

          {isCancelled ? (
            /* Cancelled order state */
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-6 h-6 text-[#CC0C39] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#CC0C39]">Commande annul\u00e9e</p>
                {statusHistory.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Annul\u00e9e le {formatTimelineDate(statusHistory[statusHistory.length - 1].date)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Normal timeline */
            <div className="relative">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const isFuture = idx > currentStatusIndex;
                const StepIcon = step.icon;

                // Find the matching status history entry for date display
                const historyEntry = statusHistory.find((h) => h.status === step.status);

                return (
                  <div key={step.status} className="flex gap-4 pb-6 last:pb-0 relative">
                    {/* Vertical line */}
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`absolute left-[19px] top-10 w-0.5 h-[calc(100%-24px)] ${
                          isCompleted ? 'bg-[#1B5E20]' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    )}

                    {/* Icon circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                        isCompleted
                          ? 'bg-[#1B5E20]'
                          : isCurrent
                            ? 'bg-[#1B5E20] ring-4 ring-[#1B5E20]/20'
                            : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <StepIcon
                          className={`w-5 h-5 ${
                            isCurrent ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1.5">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted
                            ? 'text-[#1B5E20]'
                            : isCurrent
                              ? 'text-[#1B5E20]'
                              : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <Badge className="mt-1 bg-[#E8F5E9] text-[#1B5E20] border-[#2E7D32]/30 text-[10px]">
                          En cours
                        </Badge>
                      )}
                      {historyEntry && (isCompleted || isCurrent) && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          {formatTimelineDate(historyEntry.date)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Estimated Delivery */}
        {!isCancelled && estimatedDelivery && (
          <div className="bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] dark:from-[#1a2e1a] dark:to-[#1a2e1a] rounded-xl border border-[#2E7D32]/20 dark:border-[#2E7D32]/40 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1B5E20]">
                  Livraison estim&eacute;e
                </p>
                <p className="text-base font-bold text-[#2E7D32] capitalize mt-0.5">
                  {formatEstimatedDelivery(estimatedDelivery)}
                </p>
                <p className="text-xs text-[#444] dark:text-gray-300 mt-1">
                  {orderData.deliveryType === 'pickup'
                    ? 'Vous serez notifi\u00e9 lorsque votre commande sera pr\u00eate pour le retrait.'
                    : `Livraison \u00e0 domicile en ${selectedCountry.name}.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1B5E20]" />
            D&eacute;tails de la commande
          </h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="border-[#FF8F00] text-[#FF8F00] text-xs shrink-0">
                Paiement
              </Badge>
              <span className="text-gray-700 dark:text-gray-300">{paymentLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="border-[#2E7D32] text-[#2E7D32] text-xs shrink-0">
                Livraison
              </Badge>
              <span className="text-gray-700 dark:text-gray-300">
                {orderData.deliveryType === 'pickup' ? 'Point de Retrait \u2014 Gratuit' : 'Livraison \u00e0 Domicile'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-500 dark:text-gray-400">
                Commande pass&eacute;e le {new Date(orderData.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Items */}
          <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
            {orderItems.map((item, idx) => {
              const lineTotal = item.price * item.quantity;
              return (
                <div key={idx} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.color && `${item.color} / `}x {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-[#B12704]">{formatPrice(lineTotal, selectedCurrency)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-3" />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Sous-total</span>
              <span className="text-gray-900 dark:text-gray-100">{formatPrice(orderData.subtotalGNF, selectedCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Livraison</span>
              <span className={orderData.deliveryFeeGNF === 0 ? 'text-[#2E7D32]' : 'text-gray-900 dark:text-gray-100'}>
                {orderData.deliveryFeeGNF === 0 ? 'GRATUITE' : formatPrice(orderData.deliveryFeeGNF, selectedCurrency)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</span>
              <span className="text-lg font-bold text-[#B12704]">{formatPrice(orderData.totalGNF, selectedCurrency)}</span>
            </div>
          </div>
        </div>

        {/* Download Invoice */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm no-print">
          <Button
            variant="outline"
            className="w-full text-sm border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9] gap-2"
            onClick={() => setShowInvoice(true)}
          >
            <FileText className="w-4 h-4" />
            Telecharger la facture
          </Button>
          <Invoice
            orderNumber={orderNumber}
            open={showInvoice}
            onOpenChange={setShowInvoice}
          />
        </div>

        {/* Contact Support */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 text-center">
            Besoin d&apos;aide ? Contactez notre service client
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-sm border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
              onClick={() => window.open(`https://wa.me/224628000000`, '_blank')}
            >
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-sm border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9]"
              onClick={() => window.location.href = 'mailto:support@lemarcheafricain.gn'}
            >
              <Package className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </div>

        {/* Share Order Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#1B5E20]" />
            Partagez votre commande avec vos amis
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Informez vos proches de votre commande
          </p>
          <SocialShareBar
            productName={`Ma commande ${orderNumber} sur Le Marche Africain`}
            productUrl={typeof window !== 'undefined' ? window.location.href : undefined}
          />
          <Button
            className="w-full mt-3 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-semibold rounded-lg"
            onClick={() => {
              const text = encodeURIComponent(`J'ai passe une commande sur Le Marche Africain ! Suivez le lien : ${typeof window !== 'undefined' ? window.location.href : ''}`);
              window.open(`https://wa.me/?text=${text}`, 'Partager', 'width=600,height=400');
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Partager sur WhatsApp
          </Button>
        </div>

        {/* Reorder Section */}
        {orderItems.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#1B5E20]" />
              Recommander ces articles
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {orderItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/produit/${item.slug}`}
                  className="group bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-[#1B5E20]/30 transition-colors"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-900 dark:text-gray-100 line-clamp-2 font-medium leading-tight">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-[#B12704]">{formatPrice(item.price, selectedCurrency)}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAddAllToCart}
                disabled={reordering}
                className="flex-1 bg-[#1B5E20] hover:bg-[#145218] text-white py-5 text-sm font-semibold rounded-lg"
              >
                {reordering ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                Ajouter tout au panier
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full py-5 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Home className="w-4 h-4 mr-2" />
                  Continuer vos achats
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 pb-8">
          <Link href="/compte" className="block">
            <Button className="w-full bg-[#1B5E20] hover:bg-[#145218] text-white py-6 text-base font-semibold rounded-lg">
              <UserCircle className="w-4 h-4 mr-2" />
              Suivre ma commande
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full py-5 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Home className="w-4 h-4 mr-2" />
              Retour &agrave; l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Page with Suspense
// ============================================================

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh] dark:bg-gray-950">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#1B5E20] animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
