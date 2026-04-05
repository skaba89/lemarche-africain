'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, Star, Gift, ArrowUpRight, Loader2, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

// ============================================================
// Types
// ============================================================

interface PointsHistoryEntry {
  points: number;
  source: string;
  description: string;
  date: string;
}

interface LoyaltyData {
  balance: number;
  history: PointsHistoryEntry[];
}

// ============================================================
// Tier configuration
// ============================================================

const TIERS = [
  { name: 'Bronze', min: 0, max: 2000, color: '#CD7F32', icon: Award },
  { name: 'Silver', min: 2000, max: 10000, color: '#C0C0C0', icon: Star },
  { name: 'Gold', min: 10000, max: 50000, color: '#FFD700', icon: Gift },
  { name: 'Platinum', min: 50000, max: Infinity, color: '#E5E4E2', icon: Zap },
];

function getTier(points: number) {
  for (const tier of TIERS) {
    if (points < tier.max) return tier;
  }
  return TIERS[TIERS.length - 1];
}

function getNextTier(points: number) {
  const current = getTier(points);
  const currentIndex = TIERS.indexOf(current);
  if (currentIndex < TIERS.length - 1) {
    return TIERS[currentIndex + 1];
  }
  return null;
}

function getSourceLabel(source: string): string {
  switch (source) {
    case 'purchase': return 'Achat';
    case 'review': return 'Avis';
    case 'referral': return 'Parrainage';
    case 'signup': return 'Inscription';
    case 'redemption': return 'Echange';
    default: return source;
  }
}

// ============================================================
// LoyaltyCard Component
// ============================================================

interface LoyaltyCardProps {
  onRedeemOpen?: () => void;
}

export default function LoyaltyCard({ onRedeemOpen }: LoyaltyCardProps) {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLoyalty = useCallback(async () => {
    try {
      const res = await fetch('/api/loyalty');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoyalty();
  }, [fetchLoyalty]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-2xl p-5 text-white animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-4 w-24 bg-white/20 rounded" />
          <div className="h-4 w-16 bg-white/20 rounded" />
        </div>
        <div className="h-12 w-32 bg-white/20 rounded mb-3" />
        <div className="h-3 w-48 bg-white/20 rounded mb-4" />
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-white/30 rounded-full" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const tier = getTier(data.balance);
  const nextTier = getNextTier(data.balance);
  const TierIcon = tier.icon;

  // Progress to next tier
  let progressPct = 100;
  let progressLabel = '';
  if (nextTier) {
    const rangeStart = tier.min;
    const rangeEnd = nextTier.min;
    progressPct = Math.min(100, Math.max(0, ((data.balance - rangeStart) / (rangeEnd - rangeStart)) * 100));
    progressLabel = `${nextTier.name} dans ${(nextTier.min - data.balance).toLocaleString('fr-FR')} pts`;
  }

  return (
    <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-2xl p-5 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          <span className="text-sm font-medium text-white/80">Programme de fidelite</span>
        </div>
        <Badge className="bg-white/20 text-white border-0 text-xs" style={{ color: tier.color }}>
          <TierIcon className="w-3 h-3 mr-1" />
          {tier.name}
        </Badge>
      </div>

      {/* Points Balance */}
      <div className="mb-1">
        <p className="text-3xl font-bold">{data.balance.toLocaleString('fr-FR')}</p>
        <p className="text-sm text-white/70">points de fidelite</p>
      </div>

      {/* Conversion info */}
      <p className="text-xs text-white/60 mb-4 flex items-center gap-1">
        <Gift className="w-3 h-3" />
        1 000 pts = 10 000 GNF de reduction
      </p>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/60">Progression vers {nextTier.name}</span>
            <span className="text-[10px] text-white/80">{progressLabel}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Redeem button */}
      {data.balance >= 1000 && (
        <Button
          onClick={onRedeemOpen}
          className="w-full bg-white text-[#1B5E20] hover:bg-white/90 text-sm font-semibold rounded-lg"
        >
          <Gift className="w-4 h-4 mr-2" />
          Echanger mes points
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Button>
      )}
      {data.balance < 1000 && (
        <div className="text-center py-2">
          <p className="text-xs text-white/60">
            Encore {(1000 - data.balance).toLocaleString('fr-FR')} points pour un echange
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Points History Sub-component
// ============================================================

export function PointsHistory({ history }: { history: PointsHistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="text-center py-6">
        <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Aucun historique de points</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {history.map((entry, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
        >
          <div className="flex-1 min-w-0 mr-3">
            <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{entry.description}</p>
            <p className="text-[10px] text-gray-500">
              {getSourceLabel(entry.source)} — {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <span className={`text-sm font-semibold ${entry.points > 0 ? 'text-[#2E7D32]' : 'text-[#B12704]'}`}>
            {entry.points > 0 ? '+' : ''}{entry.points.toLocaleString('fr-FR')}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Redeem Dialog Sub-component
// ============================================================

interface RedeemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess: () => void;
}

export function RedeemDialog({ open, onOpenChange, balance, onSuccess }: RedeemDialogProps) {
  const [points, setPoints] = useState(1000);
  const [loading, setLoading] = useState(false);

  const maxRedeemable = Math.floor(balance / 1000) * 1000;
  const estimatedDiscount = (points / 1000) * 10000;

  const handleRedeem = async () => {
    if (points < 1000 || points > maxRedeemable) {
      toast.error('Nombre de points invalide');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de l\'echange');
        return;
      }
      toast.success(data.message);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B5E20]">
            <Gift className="w-5 h-5" />
            Echanger mes points
          </DialogTitle>
          <DialogDescription>
            Convertissez vos points de fidelite en bon de reduction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current balance */}
          <div className="bg-[#E8F5E9] rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Solde disponible</p>
            <p className="text-2xl font-bold text-[#1B5E20]">{balance.toLocaleString('fr-FR')} pts</p>
          </div>

          {/* Points input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Points a echanger (multiple de 1 000)
            </label>
            <Input
              type="number"
              value={points}
              onChange={(e) => {
                const val = Math.max(1000, parseInt(e.target.value) || 1000);
                const rounded = Math.min(Math.floor(val / 1000) * 1000, maxRedeemable);
                setPoints(rounded);
              }}
              min={1000}
              max={maxRedeemable}
              step={1000}
              className="h-10"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Maximum : {maxRedeemable.toLocaleString('fr-FR')} points
            </p>
          </div>

          {/* Estimated discount */}
          <div className="bg-[#FFF8E1] rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Reduction estimee</p>
            <p className="text-xl font-bold text-[#FF8F00]">{estimatedDiscount.toLocaleString('fr-FR')} GNF</p>
          </div>

          {/* Conversion info */}
          <p className="text-xs text-gray-500 text-center">
            Taux : 1 000 points = 10 000 GNF
          </p>

          {/* Redeem button */}
          <Button
            onClick={handleRedeem}
            disabled={loading || points < 1000 || points > maxRedeemable}
            className="w-full bg-[#1B5E20] hover:bg-[#145218] text-white font-semibold py-5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Gift className="w-4 h-4 mr-2" />
            )}
            Echanger {points.toLocaleString('fr-FR')} points
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
