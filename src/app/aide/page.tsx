'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Mail,
  Truck,
  RotateCcw,
  CreditCard,
  Shield,
  HelpCircle,
  Package,
  Headphones,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============================================================
// FAQ Data
// ============================================================

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ElementType;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Quels sont les modes de livraison disponibles ?',
    answer:
      'Nous proposons deux modes de livraison en Guinée :\n\n1. Livraison à Domicile — disponible dans toutes les villes principales. Délai : 1-2 jours à Conakry, 3-5 jours dans les autres villes. Frais : 15 000 GNF.\n\n2. Retrait gratuit au Point de Retrait — disponible à Conakry (Almamya Madina, Almamya Kipé), Labé, Kindia et Nzérékoré. Aucun frais de livraison.\n\nLa livraison est gratuite pour toute commande supérieure à 5 000 000 GNF.',
    icon: Truck,
    category: 'Livraison',
  },
  {
    id: 'faq-2',
    question: 'Comment suivre ma commande ?',
    answer:
      'Après la confirmation de votre commande, vous recevrez :\n\n- Un SMS de confirmation avec le numéro de commande\n- Un lien de suivi en temps réel\n- Des notifications à chaque étape (préparation, expédition, livraison)\n\nVous pouvez également suivre votre commande depuis votre espace "Mon Compte" > "Commandes".',
    icon: Package,
    category: 'Commandes',
  },
  {
    id: 'faq-3',
    question: 'Quelle est votre politique de retour et remboursement ?',
    answer:
      'Vous disposez de 14 jours après réception pour demander un retour. Conditions :\n\n- Le produit doit être dans son état d\'original, non utilisé\n- L\'emballage d\'original doit être inclus\n- Les accessoires et documentation doivent être complets\n\nPour initier un retour, contactez notre service client via WhatsApp ou depuis votre espace commande. Le remboursement sera effectué sous 5-7 jours ouvrables sur le même moyen de paiement utilisé.',
    icon: RotateCcw,
    category: 'Retours',
  },
  {
    id: 'faq-4',
    question: 'Quels modes de paiement acceptez-vous ?',
    answer:
      'Nous acceptons les modes de paiement suivants :\n\n- Orange Money — Paiement mobile instantané, paiement en 3x sans frais disponible\n- MTN Mobile Money — Paiement mobile MTN\n- Wave — Paiement mobile Wave\n- Cash à la livraison — Payez en espèces à la réception\n- Carte bancaire — Visa, Mastercard\n\nTous les paiements sont sécurisés et chiffrés.',
    icon: CreditCard,
    category: 'Paiement',
  },
  {
    id: 'faq-5',
    question: 'Le paiement en plusieurs fois est-il possible ?',
    answer:
      'Oui ! Grâce à notre partenariat avec Orange Money, vous pouvez payer en 3x sans frais sur les produits éligibles.\n\nConditions :\n- Être client Orange Money depuis au moins 3 mois\n- Montant minimum de commande : 500 000 GNF\n- 3 mensualités automatiques prélevées chaque mois\n\nLe paiement en 3x est disponible lors du passage en caisse.',
    icon: CreditCard,
    category: 'Paiement',
  },
  {
    id: 'faq-6',
    question: 'Comment contacter le service client ?',
    answer:
      'Notre service client est disponible :\n\n- WhatsApp : +224 628 00 00 00 (réponse sous 30 min)\n- Téléphone : +224 628 00 00 00 (8h - 21h, lun-dim)\n- E-mail : support@lemarcheafricain.com (réponse sous 24h)\n\nNotre équipe basée à Conakry parle français et les langues locales. Nous répondons rapidement et nous nous engageons à résoudre votre problème dès le premier contact.',
    icon: Headphones,
    category: 'Contact',
  },
];

// ============================================================
// FAQ Category Colors
// ============================================================

const CATEGORY_COLORS: Record<string, string> = {
  Livraison: 'bg-blue-100 text-blue-700',
  Commandes: 'bg-purple-100 text-purple-700',
  Retours: 'bg-orange-100 text-orange-700',
  Paiement: 'bg-green-100 text-green-700',
  Contact: 'bg-pink-100 text-pink-700',
};

// ============================================================
// Aide Page
// ============================================================

export default function AidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQ = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_ITEMS;
    const query = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-[40vh]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-xl p-6 mb-6 text-center text-white">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Comment pouvons-nous vous aider ?</h2>
          <p className="text-sm text-white/80 mb-4">
            Trouvez rapidement des réponses à vos questions
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
          <Input
            placeholder="Rechercher dans l'aide... (livraison, retour, paiement...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl border-gray-300 text-sm bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Suivre une commande', icon: Package, color: 'text-blue-600 bg-blue-50' },
            { label: 'Retour & remboursement', icon: RotateCcw, color: 'text-orange-600 bg-orange-50' },
            { label: 'Moyens de paiement', icon: CreditCard, color: 'text-green-600 bg-green-50' },
            { label: 'Livraison & délais', icon: Truck, color: 'text-purple-600 bg-purple-50' },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => setSearchQuery(link.label.split(' ')[0].toLowerCase())}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#1B5E20]/30 hover:shadow-sm transition-all text-left"
              >
                <div className={`w-9 h-9 rounded-lg ${link.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="text-sm font-medium text-gray-900">{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Questions fréquentes
            {searchQuery && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredFAQ.length} résultat{filteredFAQ.length !== 1 ? 's' : ''})
              </span>
            )}
          </h3>

          {filteredFAQ.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Aucun résultat pour &quot;{searchQuery}&quot;</p>
              <p className="text-xs text-gray-400 mt-1">Essayez avec d&apos;autres mots-clés</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFAQ.map((faq) => {
                const isExpanded = expandedId === faq.id;
                const Icon = faq.icon;
                return (
                  <div
                    key={faq.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg border overflow-hidden transition-colors ${
                      isExpanded ? 'border-[#1B5E20]/30 shadow-sm' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full flex items-start gap-3 p-4 text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-[#1B5E20]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              CATEGORY_COLORS[faq.category] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {faq.category}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{faq.question}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pl-15">
                        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line border-t border-gray-100 dark:border-gray-700 pt-3">
                          {faq.answer}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Besoin d&apos;aide ?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Notre équipe est là pour vous assister</p>

          <div className="space-y-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/224628000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">WhatsApp</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">+224 628 00 00 00 - Réponse sous 30 min</p>
              </div>
              <span className="text-xs font-medium text-[#25D366]">Ouvrir</span>
            </a>

            {/* Phone */}
            <a
              href="tel:+224628000000"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#1B5E20]/5 border border-[#1B5E20]/10 hover:bg-[#1B5E20]/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#1B5E20] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Téléphone</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">+224 628 00 00 00 - 8h - 21h (lun-dim)</p>
              </div>
              <span className="text-xs font-medium text-[#1B5E20]">Appeler</span>
            </a>

            {/* Email */}
            <a
              href="mailto:support@lemarcheafricain.com"
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">E-mail</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">support@lemarcheafricain.com - Réponse sous 24h</p>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Envoyer</span>
            </a>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Service client 100% basé en Guinée - Équipe francophone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
