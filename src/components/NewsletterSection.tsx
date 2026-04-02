'use client';

import { useState, useCallback } from 'react';
import { Mail, Send, Check, Gift, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      toast.error('Veuillez entrer votre adresse email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error("Format d'email invalide.");
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        toast.success(data.message);
        setEmail('');
      } else {
        setStatus('error');
        toast.error(data.message);
      }
    } catch {
      setStatus('error');
      toast.error('Une erreur est survenue. Veuillez reessayer.');
    }
  }, [email]);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#FF8F00] p-6 md:p-10">
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col items-center text-center md:flex-row md:text-left md:gap-8">
        {/* Left content */}
        <div className="flex-1 mb-6 md:mb-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
            <Gift className="h-3.5 w-3.5" />
            Offre exclusive
          </div>
          <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">
            Restez informe des meilleures offres
          </h3>
          <p className="text-sm text-white/90 md:text-base">
            Inscrivez-vous a notre newsletter et recevez -10% sur votre premiere commande
          </p>
        </div>

        {/* Right form */}
        {status === 'success' ? (
          <div className="flex items-center gap-3 rounded-xl bg-white/20 px-6 py-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1B5E20]">
              <Check className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Inscription reussie !</p>
              <p className="text-xs text-white/80">Merci, vous recevrez nos offres bientot.</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 sm:flex-row md:w-auto"
          >
            <div className="relative flex-1 md:w-72">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                disabled={status === 'loading'}
                className="h-11 border-none bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button
              type="submit"
              disabled={status === 'loading'}
              className="h-11 bg-[#FF8F00] px-6 font-medium text-white hover:bg-[#F57C00] disabled:opacity-70"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  S&apos;inscrire
                </span>
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
