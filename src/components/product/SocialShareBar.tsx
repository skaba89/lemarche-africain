'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, Globe, Share2, Send, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareBarProps {
  productName: string;
  productUrl?: string;
}

export default function SocialShareBar({ productName, productUrl }: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);
  const url = productUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const openShareWindow = useCallback((shareUrl: string) => {
    window.open(shareUrl, 'Partager', 'width=600,height=400,left=200,top=200');
  }, []);

  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`Decouvrez ${productName} sur Le Marche Africain`);
    const shareUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`;
    openShareWindow(shareUrl);
  }, [productName, url, openShareWindow]);

  const handleFacebook = useCallback(() => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    openShareWindow(shareUrl);
  }, [url, openShareWindow]);

  const handleTwitter = useCallback(() => {
    const text = encodeURIComponent(productName);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    openShareWindow(shareUrl);
  }, [productName, url, openShareWindow]);

  const handleTelegram = useCallback(() => {
    const text = encodeURIComponent(productName);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`;
    openShareWindow(shareUrl);
  }, [productName, url, openShareWindow]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Lien copie dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  }, [url]);

  const buttons = [
    { label: 'WhatsApp', icon: MessageCircle, bg: 'bg-[#25D366]', hoverBg: 'hover:bg-[#1DA851]', onClick: handleWhatsApp },
    { label: 'Facebook', icon: Globe, bg: 'bg-[#1877F2]', hoverBg: 'hover:bg-[#166FE5]', onClick: handleFacebook },
    { label: 'Twitter/X', icon: Share2, bg: 'bg-black', hoverBg: 'hover:bg-gray-800', onClick: handleTwitter },
    { label: 'Telegram', icon: Send, bg: 'bg-[#0088cc]', hoverBg: 'hover:bg-[#0077b5]', onClick: handleTelegram },
    { label: 'Copier le lien', icon: copied ? Check : LinkIcon, bg: 'bg-transparent border border-gray-300 text-gray-600', hoverBg: 'hover:bg-gray-100', onClick: handleCopyLink },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Partager</p>
      <div className="flex items-center gap-2">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.label}
              onClick={btn.onClick}
              title={btn.label}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 ${btn.bg} ${btn.hoverBg} text-white`}
              aria-label={btn.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
