// Payment methods used across cart and checkout
export const PAYMENT_METHODS = [
  { id: 'orange_money', label: 'Orange Money', iconColor: 'bg-[#FF6600]', borderColor: 'border-[#FF6600]', bgColor: 'bg-[#FFF3E0]', desc: 'Paiement mobile instantané' },
  { id: 'mtn_momo', label: 'MTN MoMo', iconColor: 'bg-[#FFC107]', borderColor: 'border-[#FFC107]', bgColor: 'bg-[#FFF8E1]', desc: 'Paiement mobile MTN' },
  { id: 'wave', label: 'Wave', iconColor: 'bg-[#1DA1F2]', borderColor: 'border-[#1DA1F2]', bgColor: 'bg-[#E3F2FD]', desc: 'Paiement mobile Wave' },
  { id: 'cash', label: 'Cash à la livraison', iconColor: 'bg-[#4CAF50]', borderColor: 'border-[#4CAF50]', bgColor: 'bg-[#E8F5E9]', desc: 'Payez en espèces à la réception' },
] as const;

export type PaymentMethodId = typeof PAYMENT_METHODS[number]['id'];

// Centralized delivery fee logic
export function getDeliveryFee(subtotalGNF: number, deliveryType: 'domicile' | 'pickup'): number {
  if (subtotalGNF === 0) return 0;
  if (deliveryType === 'pickup') return 0;
  if (subtotalGNF >= 5000000) return 0;
  return 15000;
}

// Business info
export const BUSINESS = {
  name: 'Le Marché Africain',
  phone: '+224 628 00 00 00',
  phoneDisplay: '+224 628 00 00 00',
  email: 'support@lemarcheafricain.gn',
  whatsapp: '224628000000',
  country: 'Guinée',
  capital: 'Conakry',
} as const;
