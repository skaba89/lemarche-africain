'use client';

import { Gift, Users, Zap, TrendingUp, Smartphone, Truck, Shield, Heart, MessageCircle, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================
// Referral & Trust Section — Boost conversions for Africa
// ============================================================

export function ReferralSection() {
  const referralUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const referralMessage = `Découvrez Le Marché Africain — le meilleur marché en ligne en Afrique ! Inscrivez-vous avec mon lien : ${referralUrl}`;

  const handleWhatsAppInvite = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(referralMessage)}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success('Lien copié dans le presse-papiers');
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  return (
    <section className="w-full space-y-6">
      {/* Referral Program */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-6 md:p-8 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-[#FF8F00]" />
              <h3 className="text-lg font-bold">Parrainez & Gagnez</h3>
            </div>
            <p className="text-sm text-[#B9F6CA] leading-relaxed">
              Invitez vos amis à découvrir Le Marché Africain et gagnez <span className="font-bold text-[#FFD814]">50 000 GNF</span> de bon d&apos;achat pour chaque ami qui effectue sa première commande. Votre ami reçoit aussi un <span className="font-bold text-[#FFD814]">bon de réduction de -15%</span> !
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleWhatsAppInvite} className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white shadow transition hover:bg-[#128C7E]">
                <MessageCircle className="h-4 w-4" /> Inviter via WhatsApp
              </button>
              <button onClick={handleCopyLink} className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20">
                <Clipboard className="h-4 w-4" /> Copier mon lien
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="flex -space-x-2">
              {["MB", "AD", "ST", "FK", "IS"].map((initials, i) => (
                <div key={i} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold ${
                  i === 0 ? "bg-[#FF8F00] text-white" : "bg-white text-[#1B5E20]"
                }`} style={{ zIndex: 5 - i }}>
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#B9F6CA]">+12 847 personnes parrainées</p>
          </div>
        </div>
      </div>

      {/* Trust Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Users, value: "2M+", label: "Clients Satisfaits", color: "text-[#2E7D32]" },
          { icon: TrendingUp, value: "150K+", label: "Commandes/Mois", color: "text-[#FF8F00]" },
          { icon: Smartphone, value: "10", label: "Pays en Afrique", color: "text-[#1565C0]" },
          { icon: Heart, value: "98%", label: "Taux de Satisfaction", color: "text-[#CC0C39]" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-[#DDD] bg-[#F7F8F8] p-4">
            <stat.icon className={`h-8 w-8 shrink-0 ${stat.color}`} />
            <div>
              <p className="text-lg font-bold text-[#0F1111]">{stat.value}</p>
              <p className="text-[11px] text-[#444]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Why Choose Us */}
      <div className="rounded-xl border border-[#DDD] bg-white p-5">
        <h3 className="mb-4 text-base font-medium text-[#0F1111]">Pourquoi des millions d&apos;Africains nous font confiance ?</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Truck, title: "Livraison Rapide & Fiable", desc: "Points de retrait dans chaque ville. Livraison en 24-48h dans les capitales.", highlight: "Top 1" },
            { icon: Shield, title: "Produits 100% Authentiques", desc: "Garantie authenticité sur tous les produits. Contrefaçon ? 10× remboursé.", highlight: null },
            { icon: Smartphone, title: "Paiement Mobile Local", desc: "Orange Money, MTN MoMo, Wave, Cash on Delivery — payez comme vous voulez.", highlight: null },
            { icon: Zap, title: "Prix les Plus Bas", desc: "Nous comparons les prix et garantissons le meilleur prix en Afrique.", highlight: "Populaire" },
            { icon: Heart, title: "Service Client WhatsApp", desc: "Support 24/7 en français. Réponse garantie en moins de 5 minutes.", highlight: "N°1" },
            { icon: Gift, title: "Programme de Fidélité", desc: "Points sur chaque achat, réductions exclusives, offres VIP pour les fidèles.", highlight: "Nouveau" },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#2E7D32]">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-[#0F1111]">{item.title}</h4>
                  {item.highlight && (
                    <span className="rounded bg-[#FF8F00]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#E65100]">{item.highlight}</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#444] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
