'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Users, Package, Globe2 } from 'lucide-react';

// ============================================================
// Stats data
// ============================================================

const STATS = [
  {
    label: 'Produits Authenticques',
    value: '100%',
    Icon: ShieldCheck,
    color: '#1B5E20',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400',
  },
  {
    label: 'Clients Satisfaits',
    value: '15K+',
    Icon: Users,
    color: '#FF8F00',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    textClass: 'text-orange-700 dark:text-orange-400',
  },
  {
    label: 'Commandes Livrées',
    value: '50K+',
    Icon: Package,
    color: '#1565C0',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
  },
  {
    label: 'Pays d\'Afrique',
    value: '28',
    Icon: Globe2,
    color: '#7B1FA2',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-400',
  },
] as const;

// ============================================================
// TrustIndicators Component
// ============================================================

export default function TrustIndicators() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in with a short delay on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const { Icon } = stat;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 transition-all duration-500"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              {/* Icon circle */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgClass} mb-3`}>
                <Icon className={`h-6 w-6 ${stat.textClass}`} />
              </div>

              {/* Value */}
              <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </span>

              {/* Label */}
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
