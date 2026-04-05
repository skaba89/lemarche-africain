'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Download,
  X,
  Loader2,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Truck,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProductStore, formatPrice } from '@/store/product-store';

// ============================================================
// Types
// ============================================================

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  discountLabel: string;
  total: number;
  paymentMethod: string;
  deliveryType: string;
  deliveryAddress: string;
  taxInfo: string;
  status: string;
}

// ============================================================
// Format helpers
// ============================================================

function formatGNF(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' GNF';
}

// ============================================================
// Invoice Content Component (the printable area)
// ============================================================

function InvoicePrintContent({ invoice }: { invoice: InvoiceData }) {
  return (
    <div className="print-area bg-white text-black p-8 max-w-[800px] mx-auto" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: '13px', lineHeight: '1.5' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1B5E20] mb-1">{invoice.business.name}</h1>
          <div className="flex items-center gap-1.5 text-gray-600 text-xs">
            <Building2 className="w-3 h-3" />
            <span>{invoice.business.address}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 text-xs">
            <Phone className="w-3 h-3" />
            <span>{invoice.business.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 text-xs">
            <Mail className="w-3 h-3" />
            <span>{invoice.business.email}</span>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900 mb-2">FACTURE</h2>
          <div className="text-xs text-gray-500 space-y-0.5">
            <p><span className="font-medium text-gray-700">N&#176; :</span> {invoice.invoiceNumber}</p>
            <p><span className="font-medium text-gray-700">Date :</span> {invoice.invoiceDate}</p>
            <p><span className="font-medium text-gray-700">Commande :</span> {invoice.orderNumber}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-[#1B5E20] mb-6" />

      {/* Customer info */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Client</h3>
        <div className="grid grid-cols-2 gap-y-1 gap-x-6 text-sm">
          <div>
            <span className="text-gray-500">Nom :</span>{' '}
            <span className="font-medium">{invoice.customer.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Telephone :</span>{' '}
            <span className="font-medium">{invoice.customer.phone}</span>
          </div>
          <div>
            <span className="text-gray-500">Ville :</span>{' '}
            <span className="font-medium">{invoice.customer.city}</span>
          </div>
          <div>
            <span className="text-gray-500">Adresse :</span>{' '}
            <span className="font-medium">{invoice.customer.address || '-'}</span>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1B5E20] text-white text-xs">
              <th className="text-left py-2.5 px-3 rounded-tl-md font-semibold">Designation</th>
              <th className="text-center py-2.5 px-3 font-semibold w-16">Qte</th>
              <th className="text-right py-2.5 px-3 font-semibold w-28">Prix unitaire</th>
              <th className="text-right py-2.5 px-3 rounded-tr-md font-semibold w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="py-2.5 px-3 border-b border-gray-200 text-sm">{item.name}</td>
                <td className="py-2.5 px-3 border-b border-gray-200 text-sm text-center">{item.quantity}</td>
                <td className="py-2.5 px-3 border-b border-gray-200 text-sm text-right">{formatGNF(item.unitPrice)}</td>
                <td className="py-2.5 px-3 border-b border-gray-200 text-sm text-right font-medium">{formatGNF(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-72">
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span className="font-medium">{formatGNF(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Truck className="w-3 h-3" /> Livraison
            </span>
            <span className={invoice.deliveryFee === 0 ? 'font-medium text-[#2E7D32]' : 'font-medium'}>
              {invoice.deliveryFee === 0 ? 'GRATUITE' : formatGNF(invoice.deliveryFee)}
            </span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-600">
                Remise{invoice.discountLabel ? ` (${invoice.discountLabel})` : ''}
              </span>
              <span className="font-medium text-[#B12704]">-{formatGNF(invoice.discount)}</span>
            </div>
          )}
          <div className="border-t-2 border-gray-900 mt-2 pt-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-base font-bold">TOTAL</span>
              <span className="text-lg font-bold text-[#B12704]">{formatGNF(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Delivery info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
            <CreditCard className="w-3.5 h-3.5" />
            Mode de paiement
          </div>
          <p className="text-sm font-medium">{invoice.paymentMethod}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
            <Truck className="w-3.5 h-3.5" />
            Livraison
          </div>
          <p className="text-sm font-medium">{invoice.deliveryType}</p>
          <p className="text-xs text-gray-500 mt-0.5">{invoice.deliveryAddress}</p>
        </div>
      </div>

      {/* Tax info */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-3 mb-4">
        {invoice.taxInfo}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-4 text-center">
        <p className="text-sm font-medium text-[#1B5E20] mb-1">
          Merci pour votre confiance !
        </p>
        <p className="text-xs text-gray-500">
          {invoice.business.name} — {invoice.business.address}
        </p>
        <p className="text-xs text-gray-500">
          {invoice.business.phone} | {invoice.business.email}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Invoice Dialog Component
// ============================================================

interface InvoiceProps {
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Invoice({ orderNumber, open, onOpenChange }: InvoiceProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const selectedCurrency = useProductStore((s) => s.selectedCurrency);

  const fetchInvoice = useCallback(async () => {
    if (!orderNumber) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${orderNumber}/invoice`);
      if (!res.ok) {
        setError('Facture non disponible');
        return;
      }
      const data = await res.json();
      setInvoice(data.invoice);
    } catch {
      setError('Erreur lors du chargement de la facture');
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    if (open) {
      fetchInvoice();
    }
  }, [open, fetchInvoice]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[850px] max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">
          Facture {orderNumber}
        </DialogTitle>

        {/* Header with actions */}
        <div className="no-print sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1B5E20]" />
            <span className="text-sm font-semibold text-gray-900">Facture</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 gap-1.5 bg-[#1B5E20] hover:bg-[#145218] text-white"
            >
              <Download className="w-3.5 h-3.5" />
              Telecharger
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-xs h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="pb-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#1B5E20] animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Chargement de la facture...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <FileText className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          )}

          {invoice && !loading && !error && (
            <InvoicePrintContent invoice={invoice} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { InvoiceData };
