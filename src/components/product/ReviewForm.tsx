'use client';

import { useState, useCallback } from 'react';
import { Star, Send, User, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!author.trim()) {
      toast.error('Veuillez entrer votre nom');
      return;
    }
    if (rating === 0) {
      toast.error('Veuillez s\u00e9lectionner une note');
      return;
    }
    if (!title.trim()) {
      toast.error('Veuillez entrer un titre');
      return;
    }
    if (!body.trim()) {
      toast.error('Veuillez entrer votre commentaire');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          author: author.trim(),
          rating,
          title: title.trim(),
          body: body.trim(),
          location: location.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la soumission');
        return;
      }

      toast.success('Merci pour votre avis !');
      // Reset form
      setAuthor('');
      setRating(0);
      setTitle('');
      setBody('');
      setLocation('');
      onReviewSubmitted();
    } catch {
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  }, [author, rating, title, body, location, productId, onReviewSubmitted]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Send className="h-4 w-4 text-[#1B5E20]" />
        R&eacute;diger un avis
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Name */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
            Votre nom <span className="text-[#CC0C39]" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Entrez votre nom"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="pl-9 h-9 text-sm border-gray-300 focus:border-[#1B5E20] focus:ring-[#1B5E20]/20"
              required
              aria-required="true"
            />
          </div>
        </div>

        {/* Star Rating */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
            Note <span className="text-[#CC0C39]" aria-hidden="true">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
                aria-label={`Note ${star} sur 5`}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-[#FF8F00] fill-[#FF8F00]'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <Badge
                variant="outline"
                className="ml-2 text-[10px] border-[#FF8F00] text-[#FF8F00]"
              >
                {rating}/5
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
            Titre <span className="text-[#CC0C39]" aria-hidden="true">*</span>
          </label>
          <Input
            type="text"
            placeholder="R&eacute;sumez votre exp\u00e9rience en une phrase"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 text-sm border-gray-300 focus:border-[#1B5E20] focus:ring-[#1B5E20]/20"
            required
            aria-required="true"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
            Commentaire <span className="text-[#CC0C39]" aria-hidden="true">*</span>
          </label>
          <Textarea
            placeholder="Partagez votre exp\u00e9rience avec ce produit..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="text-sm border-gray-300 focus:border-[#1B5E20] focus:ring-[#1B5E20]/20 resize-none"
            required
            aria-required="true"
          />
        </div>

        {/* Location (optional) */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1.5 block">
            Localisation <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Ex: Conakry, Guin\u00e9e"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 h-9 text-sm border-gray-300 focus:border-[#1B5E20] focus:ring-[#1B5E20]/20"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#1B5E20] hover:bg-[#145218] text-white text-sm font-semibold h-10 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Publier l&apos;avis
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
