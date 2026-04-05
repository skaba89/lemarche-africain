import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeString } from '@/lib/sanitize';

const SYSTEM_PROMPT = `Tu es un agent de service client virtuel pour "Le Marché Africain", la principale marketplace en ligne de Guinée. Tu dois TOUJOURS répondre en français.

Informations sur la boutique :
- Nom : Le Marché Africain
- Localisation : Guinée (Conakry et provinces)
- Horaires d'ouverture : 8h00 - 22h00 GMT
- Contact WhatsApp : +224 628 00 00 00

Modes de paiement acceptés :
- Orange Money
- MTN Mobile Money (MTN MoMo)
- Wave
- Cash (espèces à la livraison)

Informations sur la livraison :
- Conakry : 1 à 3 jours ouvrables
- Provinces : 3 à 7 jours ouvrables
- Livraison à domicile et retrait au point relais disponibles
- Frais de livraison : 15 000 GNF (gratuit pour les commandes de 5M+ GNF ou retrait en point relais)

Politique de retour :
- Retours acceptés sous 7 jours après réception
- Produit doit être non utilisé, dans l'emballage d'origine
- Remboursement sous 3 à 5 jours ouvrables après validation
- Échange possible contre un autre produit ou remboursement

Consignes :
- Sois toujours poli, professionnel et chaleureux
- Réponds de manière concise et claire
- Si le client demande quelque chose en dehors du service (météo, actualités, etc.), redirige poliment vers les questions liées à la boutique
- Si tu ne connais pas la réponse, propose de contacter le support par WhatsApp au +224 628 00 00 00
- Utilise un langage naturel et accessible`;

function getFallbackResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('commande') && (msg.includes('suivi') || msg.includes('statut') || msg.includes('où'))) {
    return 'Pour suivre votre commande, vous pouvez :\n\n1. Aller dans "Mon Compte" > "Commandes" sur notre site\n2. Contacter notre support par WhatsApp au +224 628 00 00 00 avec votre numéro de commande\n\nLes délais de livraison sont de 1 à 3 jours à Conakry et 3 à 7 jours en provinces.';
  }

  if (msg.includes('paiement') || msg.includes('payer') || msg.includes('orange money') || msg.includes('momo') || msg.includes('wave') || msg.includes('cash')) {
    return 'Nous acceptons les modes de paiement suivants :\n\n- Orange Money\n- MTN Mobile Money (MTN MoMo)\n- Wave\n- Cash (espèces à la livraison)\n\nTous les paiements mobile sont sécurisés et instantanés. En cas de problème, contactez notre support.';
  }

  if (msg.includes('livraison') || msg.includes('délai') || msg.includes('expédi') || msg.includes('livrer')) {
    return 'Nos délais de livraison :\n\n- Conakry : 1 à 3 jours ouvrables\n- Provinces : 3 à 7 jours ouvrables\n\nFrais de livraison : 15 000 GNF (gratuit pour les commandes de 5 000 000 GNF ou plus, et pour le retrait en point relais).\n\nNous offrons la livraison à domicile et le retrait en point relais.';
  }

  if (msg.includes('retour') || msg.includes('échange') || msg.includes('remboursement') || msg.includes('rembourser')) {
    return 'Politique de retour :\n\n- Retours acceptés sous 7 jours après réception\n- Le produit doit être non utilisé et dans son emballage d\'origine\n- Remboursement sous 3 à 5 jours ouvrables après validation\n- Échange possible contre un autre produit\n\nPour initier un retour, contactez notre support par WhatsApp.';
  }

  if (msg.includes('horaires') || msg.includes('heure') || msg.includes('ouvert') || msg.includes('fermé')) {
    return 'Nos horaires d\'ouverture sont :\n\n- Tous les jours : 8h00 - 22h00 GMT\n\nNotre support WhatsApp est disponible pendant les mêmes horaires au +224 628 00 00 00.';
  }

  if (msg.includes('contact') || msg.includes('whatsapp') || msg.includes('téléphone') || msg.includes('appeler')) {
    return 'Vous pouvez nous contacter :\n\n- WhatsApp : +224 628 00 00 00\n- Sur notre site via ce chat\n\nNos heures de support : 8h00 - 22h00 GMT, tous les jours.';
  }

  if (msg.includes('prix') || msg.includes('coût') || msg.includes('combien')) {
    return 'Les prix sont affichés sur chaque fiche produit en Franc Guinéen (GNF). Vous pouvez également changer la devise dans le sélecteur de pays en haut de la page (XOF, EUR, USD).\n\nPour toute question sur un prix spécifique, n\'hésitez pas à consulter la fiche du produit concerné.';
  }

  if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('bonsoir') || msg.includes('hello') || msg.includes('hi')) {
    return 'Bonjour et bienvenue sur Le Marché Africain ! Comment puis-je vous aider aujourd\'hui ? Je suis là pour répondre à vos questions sur nos produits, commandes, livraisons et paiements.';
  }

  if (msg.includes('merci') || msg.includes('thanks')) {
    return 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions. Nous sommes là pour vous aider. Bonne journée !';
  }

  return 'Merci pour votre question. Pour une réponse plus précise, je vous invite à :\n\n1. Consulter notre page d\'aide sur le site\n2. Contacter notre support WhatsApp au +224 628 00 00 00\n\nNous sommes disponibles de 8h00 à 22h00 GMT. Comment puis-je vous aider autrement ?';
}

export async function POST(request: NextRequest) {
  // Rate limiting: 20 requests/minute per IP (AI cost protection)
  const { success, remaining } = rateLimit(request, 'chat-ai', 20, 60);
  if (!success) {
    return NextResponse.json(
      { reply: 'Trop de messages. Veuillez patienter quelques instants avant de continuer.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  }

  try {
    const body = await request.json();
    const rawMessage = typeof body.message === 'string' ? body.message : '';
    const message = sanitizeString(rawMessage);
    const context = typeof body.context === 'string' ? sanitizeString(body.context) : undefined;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { reply: 'Veuillez entrer un message valide.' },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { reply: 'Veuillez entrer un message.' },
        { status: 400 }
      );
    }

    try {
      const zai = await ZAI.create();

      const messages: Array<{ role: string; content: string }> = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];

      if (context) {
        messages.push({ role: 'user', content: context });
        messages.push({
          role: 'assistant',
          content: 'Bien compris, je garde ce contexte en tête pour la suite de notre conversation.',
        });
      }

      messages.push({ role: 'user', content: trimmedMessage });

      const completion = await zai.chat.completions.create({
        messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        thinking: { type: 'disabled' },
      });

      const reply = completion.choices?.[0]?.message?.content;
      if (reply) {
        return NextResponse.json({ reply });
      }

      return NextResponse.json({ reply: getFallbackResponse(trimmedMessage) });
    } catch (aiError) {
      console.error('AI SDK error, using fallback:', aiError);
      return NextResponse.json({ reply: getFallbackResponse(trimmedMessage) });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { reply: 'Desolé, une erreur est survenue. Veuillez réessayer ou contacter notre support WhatsApp au +224 628 00 00 00.' },
      { status: 500 }
    );
  }
}
