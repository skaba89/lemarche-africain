'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  User,
  Truck,
  Store,
  CreditCard,
  Shield,
  ShoppingCart,
  Check,
  Lock,
  ChevronRight,
  ChevronLeft,
  Tag,
  Loader2,
  AlertTriangle,
  Minus,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartStore, getCartSubtotalGNF, getCartSavingsGNF, getCartItemCount } from '@/store/cart-store';
import { useProductStore, formatPrice } from '@/store/product-store';
import { useAuthStore } from '@/store/auth-store';
import { PAYMENT_METHODS, getDeliveryFee } from '@/lib/constants';

// ============================================================
// Step configuration
// ============================================================

const STEPS = [
  { id: 1, label: 'Panier' },
  { id: 2, label: 'Livraison' },
  { id: 3, label: 'Paiement' },
] as const;

// ============================================================
// Animation variants
// ============================================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ============================================================
// Checkout Page
// ============================================================

export default function CommandePage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const selectedCurrency = useProductStore((s) => s.selectedCurrency);
  const selectedCountry = useProductStore((s) => s.selectedCountry);
  const deliveryType = useProductStore((s) => s.deliveryType);
  const setDeliveryType = useProductStore((s) => s.setDeliveryType);
  const paymentMethod = useProductStore((s) => s.paymentMethod);
  const setPaymentMethod = useProductStore((s) => s.setPaymentMethod);
  const selectedCity = useProductStore((s) => s.selectedCity);
  const setSelectedCity = useProductStore((s) => s.setSelectedCity);

  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: selectedCity,
    address: '',
  });

  // Pre-fill form from authenticated user profile
  useEffect(() => {
    if (isAuthenticated && authUser) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || authUser.name || '',
        phone: prev.phone || authUser.phone || '',
        city: prev.city || authUser.city || selectedCity,
        address: prev.address || authUser.address || '',
      }));
    }
  }, [isAuthenticated, authUser, selectedCity]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLabel, setCouponLabel] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Mobile summary state
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Computed values
  const subtotal = useMemo(() => getCartSubtotalGNF(items), [items]);
  const savings = useMemo(() => getCartSavingsGNF(items), [items]);
  const itemCount = useMemo(() => getCartItemCount(items), [items]);
  const deliveryFee = useMemo(() => getDeliveryFee(subtotal, deliveryType), [subtotal, deliveryType]);
  const total = Math.max(0, subtotal + deliveryFee - couponDiscount);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
    if (field === 'city') setSelectedCity(value);
  };

  // ---- Step navigation ----
  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep === 1) {
      goToStep(2);
    } else if (currentStep === 2) {
      if (validateForm()) {
        goToStep(3);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // ---- Form validation ----
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.fullName.trim()) errors.fullName = 'Champ obligatoire';
    if (!form.phone.trim()) {
      errors.phone = 'Champ obligatoire';
    } else {
      const digits = form.phone.replace(/\D/g, '');
      const startsOk = form.phone.startsWith('+224') || form.phone.startsWith('6') || form.phone.startsWith('224');
      if (!startsOk) errors.phone = 'Le numero doit commencer par +224 ou 6';
      else if (digits.length < 8) errors.phone = 'Numero de telephone invalide (min. 8 chiffres)';
    }
    if (!form.city.trim()) errors.city = 'Champ obligatoire';
    if (deliveryType === 'domicile' && !form.address.trim()) errors.address = "L'adresse est requise pour la livraison a domicile";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!paymentMethod) errors.paymentMethod = 'Veuillez choisir un mode de paiement';
    if (!termsAccepted) {
      setTermsError('Vous devez accepter les conditions generales de vente');
      return false;
    }
    setTermsError('');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---- Coupon ----
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotalGNF: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discount);
        setCouponLabel(data.label || couponCode.trim().toUpperCase());
        setCouponError('');
      } else {
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponError(data.error || 'Code invalide');
      }
    } catch {
      setCouponError('Erreur lors de la validation');
    } finally {
      setCouponLoading(false);
    }
  };

  // ---- Submit order ----
  const handleSubmit = async () => {
    if (!validateForm() || !validateStep3()) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        color: item.colorLabel,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          address: form.address.trim() || undefined,
          deliveryType,
          paymentMethod,
          couponDiscount: couponApplied ? couponDiscount : 0,
          couponLabel: couponApplied ? couponLabel : '',
          couponCode: couponApplied ? couponCode.trim().toUpperCase() : '',
          userId: isAuthenticated && authUser ? authUser.id : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Erreur lors de la creation de la commande');
        setIsSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/commande/confirmation?order=${data.order.orderNumber}`);
    } catch {
      setSubmitError('Erreur de connexion. Veuillez reessayer.');
      setIsSubmitting(false);
    }
  };

  // Empty cart redirect
  if (items.length === 0) {
    return (
      <div className="min-h-[40vh]">
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Votre panier est vide</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-sm">
            Ajoutez des articles a votre panier avant de passer commande.
          </p>
          <Link href="/">
            <Button className="bg-[#1B5E20] hover:bg-[#145218] text-white px-8 py-6 text-base rounded-lg font-semibold">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Continuer vos achats
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // Step Indicator
  // ============================================================
  const StepIndicator = () => (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isCompleted
                        ? 'bg-[#1B5E20] text-white'
                        : isCurrent
                          ? 'bg-[#1B5E20] text-white ring-4 ring-[#1B5E20]/20'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-[11px] font-medium hidden sm:block ${
                      isCompleted || isCurrent
                        ? 'text-[#1B5E20]'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 mb-5 sm:mb-0 transition-colors ${
                      currentStep > step.id ? 'bg-[#1B5E20]' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // Step 1: Cart Summary
  // ============================================================
  const Step1Cart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#1B5E20]" />
          Votre panier ({itemCount} article{itemCount > 1 ? 's' : ''})
        </h2>
        <Link href="/panier" className="text-xs text-[#1B5E20] hover:underline flex items-center gap-1">
          Modifier le panier
          <ChevronRight className="w-3 h-3 rotate-180" />
        </Link>
      </div>

      {/* Free delivery banner */}
      {subtotal > 0 && subtotal < 5000000 && (
        <div className="bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] border border-[#2E7D32]/20 rounded-lg p-3 flex items-center gap-3">
          <Truck className="w-5 h-5 text-[#2E7D32] shrink-0" />
          <p className="text-sm text-[#2E7D32]">
            Plus que <span className="font-bold">{formatPrice(5000000 - subtotal, selectedCurrency)}</span> pour la livraison gratuite !
          </p>
        </div>
      )}

      {/* Cart items */}
      <div className="space-y-3">
        {items.map((item) => {
          const lineTotal = item.priceGNF * item.quantity;
          const lineOriginalTotal = item.originalPriceGNF * item.quantity;
          const lineSavings = lineOriginalTotal - lineTotal;
          return (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-0.5">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {item.colorLabel} / {item.sizeLabel}
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-sm font-bold text-[#B12704]">{formatPrice(lineTotal, selectedCurrency)}</span>
                    {lineSavings > 0 && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(lineOriginalTotal, selectedCurrency)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 h-7 flex items-center justify-center text-xs font-semibold border-x border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-[#B12704] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtotal and savings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(subtotal, selectedCurrency)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#2E7D32]">Economies</span>
              <span className="font-medium text-[#2E7D32]">-{formatPrice(savings, selectedCurrency)}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total des articles</span>
            <span className="text-lg font-bold text-[#B12704]">{formatPrice(subtotal - couponDiscount, selectedCurrency)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // Step 2: Delivery Information
  // ============================================================
  const Step2Delivery = () => (
    <div className="space-y-4">
      {/* Contact info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-[#1B5E20]" />
          Informations de contact
        </h2>
        <div className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom complet <span className="text-[#B12704]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Ex : Mamadou Diallo"
                value={form.fullName}
                onChange={(e) => updateForm('fullName', e.target.value)}
                className={`pl-9 h-10 ${formErrors.fullName ? 'border-[#B12704]' : ''}`}
              />
            </div>
            {formErrors.fullName && <p className="text-xs text-[#B12704] mt-1">{formErrors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Numero de telephone <span className="text-[#B12704]">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Ex : +224 621 00 00 00"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                className={`pl-9 h-10 ${formErrors.phone ? 'border-[#B12704]' : ''}`}
              />
            </div>
            {formErrors.phone && <p className="text-xs text-[#B12704] mt-1">{formErrors.phone}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ville <span className="text-[#B12704]">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={form.city}
                onChange={(e) => updateForm('city', e.target.value)}
                className={`w-full h-10 rounded-md border ${formErrors.city ? 'border-[#B12704]' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] appearance-none text-gray-900 dark:text-gray-100`}
              >
                <option value="">Choisir une ville</option>
                {selectedCountry.cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
            </div>
            {formErrors.city && <p className="text-xs text-[#B12704] mt-1">{formErrors.city}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse complete {deliveryType === 'domicile' && <span className="text-[#B12704]">*</span>}
              {deliveryType === 'pickup' && <span className="text-gray-400 font-normal">(optionnel)</span>}
            </label>
            <Input
              placeholder="Ex : Quartier Madina, pres de la mosquee"
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              className={`h-10 ${formErrors.address ? 'border-[#B12704]' : ''}`}
            />
            {formErrors.address && <p className="text-xs text-[#B12704] mt-1">{formErrors.address}</p>}
          </div>
        </div>
      </div>

      {/* Delivery type cards */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#1B5E20]" />
          Mode de livraison
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pickup card */}
          <button
            onClick={() => setDeliveryType('pickup')}
            className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
              deliveryType === 'pickup'
                ? 'border-[#1B5E20] bg-[#E8F5E9]/60 dark:bg-[#1B5E20]/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${deliveryType === 'pickup' ? 'bg-[#1B5E20]' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <MapPin className={`w-4 h-4 ${deliveryType === 'pickup' ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Retrait gratuit</span>
                <span className="block text-[11px] text-gray-500">Point de retrait</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Retirez votre commande au point de retrait le plus proche</p>
            <Badge className="bg-[#1B5E20] text-white text-[10px] hover:bg-[#145218]">GRATUIT</Badge>
            {deliveryType === 'pickup' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1B5E20] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>

          {/* Home delivery card */}
          <button
            onClick={() => setDeliveryType('domicile')}
            className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
              deliveryType === 'domicile'
                ? 'border-[#1B5E20] bg-[#E8F5E9]/60 dark:bg-[#1B5E20]/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${deliveryType === 'domicile' ? 'bg-[#1B5E20]' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Truck className={`w-4 h-4 ${deliveryType === 'domicile' ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Livraison a domicile</span>
                <span className="block text-[11px] text-gray-500">Jusqu'a votre porte</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">1-3 jours a Conakry, 3-7 jours en provinces</p>
            <Badge className={`text-[10px] ${deliveryFee === 0 ? 'bg-[#1B5E20] text-white hover:bg-[#145218]' : 'bg-[#FF8F00] text-white hover:bg-[#E65100]'}`}>
              {deliveryFee === 0 ? 'GRATUIT' : formatPrice(deliveryFee, selectedCurrency)}
            </Badge>
            {deliveryType === 'domicile' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1B5E20] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>

        {deliveryType === 'pickup' && (
          <p className="mt-3 text-xs text-[#444] dark:text-gray-400 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            Retrait au point le plus proche de {form.city || selectedCity}
          </p>
        )}
        {deliveryType === 'domicile' && form.city && (
          <p className="mt-3 text-xs text-[#444] dark:text-gray-400 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            Estimation : 1-2 jours a {form.city}
          </p>
        )}
      </div>

      {/* Coupon */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#FF8F00]" />
          Code promo
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Code promo"
            value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
            className="text-sm h-9 flex-1"
          />
          {couponApplied ? (
            <Button variant="outline" size="sm" onClick={() => { setCouponApplied(false); setCouponDiscount(0); setCouponCode(''); setCouponLabel(''); }} className="h-9 text-xs">
              <RotateCcw className="w-3 h-3 mr-1" />
              Retirer
            </Button>
          ) : (
            <Button size="sm" onClick={applyCoupon} disabled={couponLoading} className="h-9 bg-[#FF8F00] hover:bg-[#E68100] text-white text-xs">
              {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Appliquer'}
            </Button>
          )}
        </div>
        {couponError && <p className="text-xs text-[#B12704] mt-1.5">{couponError}</p>}
        {couponApplied && (
          <p className="text-xs text-[#2E7D32] font-medium mt-1.5">
            <Check className="w-3 h-3 inline mr-1" /> Code {couponLabel} applique ! -{formatPrice(couponDiscount, selectedCurrency)}
          </p>
        )}
      </div>
    </div>
  );

  // ============================================================
  // Step 3: Payment
  // ============================================================
  const Step3Payment = () => (
    <div className="space-y-4">
      {/* Payment methods */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#1B5E20]" />
          Mode de paiement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => { setPaymentMethod(method.id); setFormErrors((p) => ({ ...p, paymentMethod: '' })); }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                paymentMethod === method.id
                  ? `${method.borderColor} ${method.bgColor}`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${paymentMethod === method.id ? method.bgColor : 'bg-gray-100 dark:bg-gray-700'} flex items-center justify-center shrink-0`}>
                <div className={`h-5 w-5 rounded-full ${method.iconColor} ${paymentMethod === method.id ? '' : 'opacity-50'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{method.label}</p>
                <p className="text-[11px] text-gray-500">{method.desc}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  paymentMethod === method.id ? 'border-[#1B5E20]' : 'border-gray-300'
                }`}
              >
                {paymentMethod === method.id && (
                  <div className="w-2 h-2 rounded-full bg-[#1B5E20]" />
                )}
              </div>
            </button>
          ))}
        </div>
        {formErrors.paymentMethod && <p className="text-xs text-[#B12704] mt-2">{formErrors.paymentMethod}</p>}
      </div>

      {/* Compact order summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#1B5E20]" />
          Recapitulatif de la commande
        </h3>
        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 truncate mr-2">{item.productName} x{item.quantity}</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium shrink-0">{formatPrice(item.priceGNF * item.quantity, selectedCurrency)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-3" />
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
            <span className="text-gray-900 dark:text-gray-100">{formatPrice(subtotal, selectedCurrency)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#2E7D32]">Economies</span>
              <span className="text-[#2E7D32]">-{formatPrice(savings, selectedCurrency)}</span>
            </div>
          )}
          {couponApplied && couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#FF8F00]">Code {couponLabel}</span>
              <span className="text-[#FF8F00]">-{formatPrice(couponDiscount, selectedCurrency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Livraison ({deliveryType === 'pickup' ? 'Retrait' : 'Domicile'})</span>
            <span className={deliveryFee === 0 ? 'text-[#2E7D32] font-medium' : 'text-gray-900 dark:text-gray-100'}>
              {deliveryFee === 0 ? 'GRATUITE' : formatPrice(deliveryFee, selectedCurrency)}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Total a payer</span>
            <span className="text-xl font-bold text-[#B12704]">{formatPrice(total, selectedCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col items-center text-center">
          <Lock className="w-5 h-5 text-[#2E7D32] mb-1" />
          <span className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">Paiement securise</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col items-center text-center">
          <RotateCcw className="w-5 h-5 text-[#2E7D32] mb-1" />
          <span className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">Retour sous 14 jours</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col items-center text-center">
          <Shield className="w-5 h-5 text-[#2E7D32] mb-1" />
          <span className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">Livraison garantie</span>
        </div>
      </div>

      {/* Terms checkbox */}
      <label className="flex items-start gap-3 cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => { setTermsAccepted(e.target.checked); setTermsError(''); }}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          J&apos;accepte les <Link href="/aide" className="text-[#1B5E20] hover:underline">conditions generales de vente</Link> et la politique de confidentialite
        </span>
      </label>
      {termsError && <p className="text-xs text-[#B12704]">{termsError}</p>}
    </div>
  );

  // ============================================================
  // Summary sidebar (desktop only)
  // ============================================================
  const SummarySidebar = () => (
    <div className="hidden lg:block">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm sticky top-[140px]">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Votre commande</h3>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{itemCount} article{itemCount > 1 ? 's' : ''}</span>
            <span className="text-gray-900 dark:text-gray-100">{formatPrice(subtotal, selectedCurrency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Livraison</span>
            <span className={deliveryFee === 0 ? 'text-[#2E7D32] font-medium' : 'text-gray-900 dark:text-gray-100'}>
              {deliveryFee === 0 ? 'GRATUITE' : formatPrice(deliveryFee, selectedCurrency)}
            </span>
          </div>
          {couponApplied && couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#FF8F00]">Remise</span>
              <span className="text-[#FF8F00]">-{formatPrice(couponDiscount, selectedCurrency)}</span>
            </div>
          )}
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total</span>
          <span className="text-lg font-bold text-[#B12704]">{formatPrice(total, selectedCurrency)}</span>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // Mobile collapsible summary
  // ============================================================
  const MobileSummary = () => (
    <div className="lg:hidden">
      <button
        onClick={() => setShowMobileSummary(!showMobileSummary)}
        className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#1B5E20]" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Total : <span className="font-bold text-[#B12704]">{formatPrice(total, selectedCurrency)}</span></span>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showMobileSummary ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {showMobileSummary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm mt-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{itemCount} article{itemCount > 1 ? 's' : ''}</span>
                <span className="text-gray-900 dark:text-gray-100">{formatPrice(subtotal, selectedCurrency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Livraison</span>
                <span className={deliveryFee === 0 ? 'text-[#2E7D32]' : 'text-gray-900 dark:text-gray-100'}>
                  {deliveryFee === 0 ? 'GRATUITE' : formatPrice(deliveryFee, selectedCurrency)}
                </span>
              </div>
              {couponApplied && couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#FF8F00]">Remise</span>
                  <span className="text-[#FF8F00]">-{formatPrice(couponDiscount, selectedCurrency)}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-[40vh] bg-gray-50 dark:bg-gray-950">
      <StepIndicator />

      {/* Error */}
      {submitError && (
        <div className="max-w-3xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-[#B12704]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {submitError}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-4 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main content area */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait" custom={direction}>
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Step1Cart />
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Step2Delivery />
                </motion.div>
              )}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Step3Payment />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop sidebar */}
          <SummarySidebar />
        </div>

        {/* Mobile collapsible summary (shown below steps on mobile) */}
        {currentStep < 3 && (
          <div className="mt-4">
            <MobileSummary />
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 z-50">
        <div className="max-w-3xl mx-auto">
          {currentStep < 3 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                <span className="text-lg font-bold text-[#B12704]">{formatPrice(total, selectedCurrency)}</span>
              </div>
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="px-6 h-12 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Retour
                  </Button>
                )}
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-[#1B5E20] hover:bg-[#145218] text-white h-12 text-base font-semibold rounded-lg transition-all"
                >
                  {currentStep === 1 ? 'Passer a la livraison' : 'Passer au paiement'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total a payer</span>
                <span className="text-lg font-bold text-[#B12704]">{formatPrice(total, selectedCurrency)}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="px-6 h-12 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1B5E20] hover:bg-[#145218] text-white h-12 text-base font-semibold rounded-lg disabled:opacity-60 transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traitement en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirmer et payer
                    </span>
                  )}
                </Button>
              </div>
              <p className="text-center text-[10px] text-gray-500 mt-2 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Paiement 100% securise
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
