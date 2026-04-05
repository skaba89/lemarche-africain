'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useStockNotificationStore } from '@/store/stock-notification-store';

interface StockNotifyButtonProps {
  productId: string;
  productSlug: string;
  productName: string;
}

export default function StockNotifyButton({ productId, productSlug, productName }: StockNotifyButtonProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification, hasNotification } = useStockNotificationStore();

  const alreadySubscribed = hasNotification(productId);

  // Pre-fill email if user is logged in (from localStorage profile)
  useEffect(() => {
    if (email) return;
    try {
      const profile = JSON.parse(localStorage.getItem('le-marche-profile') || '{}');
      if (profile.email) setEmail(profile.email);
    } catch { /* ignore */ }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de l\'inscription');
        return;
      }

      addNotification({
        productId,
        productSlug,
        productName,
        email: email.trim(),
      });

      if (data.message && data.message.includes('Déjà')) {
        toast.success(data.message);
      } else {
        toast.success('Vous serez notifi\u00e9 lorsque ce produit sera disponible');
      }
    } catch {
      toast.error('Erreur de connexion. Veuillez r\u00e9essayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alreadySubscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#2E7D32] font-medium bg-[#E8F5E9] rounded-lg px-4 py-3">
        <Check className="h-4 w-4" />
        Vous serez notifi\u00e9
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email"
          className="flex-1 h-10 text-sm"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          disabled={isSubmitting || !email}
          className="bg-[#1B5E20] hover:bg-[#145218] text-white h-10 px-4 text-sm font-semibold rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bell className="h-4 w-4 mr-1.5" />
          )}
          {isSubmitting ? '...' : 'Me pr\u00e9venir'}
        </Button>
      </div>
      <p className="text-[10px] text-gray-500">
        Nous vous enverrons un email d&egrave;s que le produit sera de nouveau disponible
      </p>
    </form>
  );
}
