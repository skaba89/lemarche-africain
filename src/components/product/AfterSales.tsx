'use client';

import { useState } from 'react';
import { Shield, RotateCcw, Award, Zap, Truck, HeadphonesIcon, ChevronDown, ChevronRight, MessageCircle, CreditCard, Banknote } from 'lucide-react';

const guarantees = [
  { icon: RotateCcw, title: 'Retour sous 7 jours', description: 'Non satisfait ? Retournez sous 7 jours pour un remboursement complet. Nous prenons en charge les frais de retour.' },
  { icon: Award, title: 'Garantie Authenticité', description: 'Chaque produit est 100% authentique. Nous nous approvisionnons directement auprès des fabricants et distributeurs agréés.' },
  { icon: Shield, title: '10× Compensation si Faux', description: 'Si un produit s\'avère contrefait, nous offrons 10 fois le prix d\'achat en compensation.' },
  { icon: Zap, title: 'Remboursement Express', description: 'Les remboursements sont traités sous 24 heures après réception de votre retour. Pas d\'attente.' },
  { icon: Truck, title: 'Assurance Livraison', description: 'Toutes les livraisons sont couvertes par notre assurance. Produit endommagé ? Nous le remplaçons gratuitement.' },
  { icon: HeadphonesIcon, title: 'Support WhatsApp 24/7', description: 'Notre équipe support est disponible 24h/24 via WhatsApp, email et téléphone pour vous aider.' },
];

const returnSteps = [
  { step: 1, title: 'Demande de Retour', description: 'Allez dans Mes Commandes et sélectionnez "Retourner / Échanger".' },
  { step: 2, title: 'Imprimer l\'Étiquette', description: 'Nous envoyons une étiquette de retour prépayée par email ou WhatsApp.' },
  { step: 3, title: 'Emballer et Expédier', description: 'Emballez le produit et déposez-le au point de retrait le plus proche.' },
  { step: 4, title: 'Recevoir le Remboursement', description: 'Remboursement traité sous 24h après réception du retour sur votre Orange Money.' },
];

export default function AfterSales() {
  const [expandedGuarantee, setExpandedGuarantee] = useState<string | null>(null);
  const [showReturnProcess, setShowReturnProcess] = useState(false);

  return (
    <div className="w-full space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-medium text-[#0F1111]">Service Après-Vente</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {guarantees.map((g) => (
            <button key={g.title} onClick={() => setExpandedGuarantee(expandedGuarantee === g.title ? null : g.title)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all ${
                expandedGuarantee === g.title ? 'border-[#E65100] bg-[#FFF3E0]' : 'border-[#DDD] hover:border-[#999] hover:shadow-sm'
              }`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                expandedGuarantee === g.title ? 'bg-[#E65100]/10 text-[#E65100]' : 'bg-[#F7F8F8] text-[#565959]'
              }`}>
                <g.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs leading-tight ${expandedGuarantee === g.title ? 'font-medium text-[#E65100]' : 'text-[#565959]'}`}>
                {g.title}
              </span>
            </button>
          ))}
        </div>

        {expandedGuarantee && (
          <div className="mt-4 rounded-lg border border-[#E65100]/20 bg-[#FFF3E0] p-4">
            {(() => {
              const g = guarantees.find((gu) => gu.title === expandedGuarantee);
              if (!g) return null;
              return (
                <div className="flex items-start gap-2">
                  <g.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#E65100]" />
                  <div>
                    <p className="text-sm font-medium text-[#0F1111]">{g.title}</p>
                    <p className="mt-1 text-sm text-[#565959]">{g.description}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[#DDD] bg-[#F7F8F8]">
        <button onClick={() => setShowReturnProcess(!showReturnProcess)}
          className="flex w-full items-center justify-between px-5 py-4 text-left">
          <span className="text-sm font-medium text-[#0F1111]">Comment Retourner / Échanger ?</span>
          {showReturnProcess ? <ChevronDown className="h-4 w-4 text-[#565959]" /> : <ChevronRight className="h-4 w-4 text-[#565959]" />}
        </button>
        {showReturnProcess && (
          <div className="border-t border-[#DDD] px-5 py-5">
            <div className="flex flex-col gap-4 md:flex-row">
              {returnSteps.map((step, index) => (
                <div key={step.step} className="flex gap-3 flex-1">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B5E20] text-sm font-bold text-white">{step.step}</div>
                    {index < returnSteps.length - 1 && <div className="hidden w-px flex-1 bg-[#DDD] md:block" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-[#0F1111]">{step.title}</p>
                    <p className="mt-0.5 text-xs text-[#565959]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Support CTA */}
      <div className="rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div className="text-center sm:text-left flex-1">
          <p className="text-sm font-medium text-[#0F1111]">Besoin d&apos;aide ? Parlez-nous sur WhatsApp !</p>
          <p className="mt-0.5 text-xs text-[#565959]">Notre équipe vous répond en moins de 5 minutes, 7j/7.</p>
        </div>
        <button onClick={() => window.open('https://wa.me/224000000000', '_blank')}
          className="rounded-full bg-[#25D366] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#128C7E]">
          Ouvrir WhatsApp
        </button>
      </div>
    </div>
  );
}
