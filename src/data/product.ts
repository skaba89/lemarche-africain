// ============================================================
// Mock Product Data - SoundCore Pro X1 Premium Wireless Headphones
// Plateforme Le Marché Africain — Guinée
// Devise: GNF (Franc Guinéen) • Langue: Français
// ============================================================

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  isVideo?: boolean;
}

export interface SpecOption {
  id: string;
  label: string;
  colorHex?: string;
  disabled?: boolean;
}

export interface SKU {
  color: string;
  size: string;
  priceGNF: number;
  priceEUR: number;
  originalPriceGNF: number;
  originalPriceEUR: number;
  stock: number;
  imageId: string;
  deliveryDate: string;
  deliveryDays: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  avatarBg: string;
  verified: boolean;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
  photos?: string[];
  location?: string;
}

export interface RelatedProduct {
  id: string;
  title: string;
  image: string;
  rating: number;
  ratingCount: number;
  priceGNF: number;
  priceEUR: number;
  originalPriceGNF?: number;
  isOfficial?: boolean;
}

export interface Specification {
  name: string;
  value: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  hours: string;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  brandUrl: string;
  subtitle: string;
  images: ProductImage[];
  rating: number;
  ratingCount: number;
  salesCount: string;
  colors: SpecOption[];
  sizes: SpecOption[];
  skuMatrix: SKU[];
  promoTags: string[];
  couponText: string;
  couponAmountGNF: number;
  installmentText: string;
  specifications: Specification[];
  reviews: Review[];
  relatedProducts: RelatedProduct[];
  seller: string;
  sellerVerified: boolean;
  sellerSince: string;
  sellerRating: number;
  pickupPoints: PickupPoint[];
}

// ---- Helpers ----

export function formatGNF(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' GNF';
}

export function formatEUR(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

// ---- Product Data ----

export const product: Product = {
  id: "SC-PRO-X1-BK-001",
  name: "SoundCore Pro X1 — Casque Bluetooth Sans Fil avec Réduction de Bruit Active, Audio Hi-Res, Autonomie 60h, Connexion Multipoint, Microphone Intégré, Coussinets Cuir Protéine Confortables",
  brand: "SoundCore",
  brandUrl: "#",
  subtitle: "Réduction de bruit n°1 de la catégorie • Codec LDAC & aptX HD • Ultra-confortable pour une utilisation toute la journée",
  images: [
    { id: "img-front", src: "/product-images/headphone-front.png", alt: "SoundCore Pro X1 — Vue de face" },
    { id: "img-side", src: "/product-images/headphone-side.png", alt: "SoundCore Pro X1 — Vue de côté" },
    { id: "img-case", src: "/product-images/headphone-case.png", alt: "SoundCore Pro X1 — Étui de transport" },
    { id: "img-worn", src: "/product-images/headphone-worn.png", alt: "SoundCore Pro X1 — Porté" },
    { id: "img-controls", src: "/product-images/headphone-controls.png", alt: "SoundCore Pro X1 — Commandes tactiles" },
    { id: "img-colors", src: "/product-images/headphone-colors.png", alt: "SoundCore Pro X1 — Déclinaisons de couleurs" },
    { id: "img-lifestyle", src: "/product-images/headphone-lifestyle.png", alt: "SoundCore Pro X1 — Lifestyle" },
  ],
  rating: 4.7,
  ratingCount: 12847,
  salesCount: "10K+",
  colors: [
    { id: "black", label: "Noir Mat", colorHex: "#1a1a1a" },
    { id: "silver", label: "Argent", colorHex: "#C0C0C0" },
    { id: "navy", label: "Bleu Nuit", colorHex: "#191970" },
    { id: "rose", label: "Or Rose", colorHex: "#B76E79" },
  ],
  sizes: [
    { id: "standard", label: "Standard" },
    { id: "xl", label: "XL (Grand)" },
  ],
  skuMatrix: [
    // Noir Standard
    { color: "black", size: "standard", priceGNF: 2400000, priceEUR: 257, originalPriceGNF: 3700000, originalPriceEUR: 395, stock: 15, imageId: "img-front", deliveryDate: "Mercredi 16 Juillet", deliveryDays: "Demain" },
    // Noir XL
    { color: "black", size: "xl", priceGNF: 2580000, priceEUR: 276, originalPriceGNF: 3870000, originalPriceEUR: 413, stock: 3, imageId: "img-front", deliveryDate: "Vendredi 18 Juillet", deliveryDays: "2 jours" },
    // Argent Standard
    { color: "silver", size: "standard", priceGNF: 2400000, priceEUR: 257, originalPriceGNF: 3700000, originalPriceEUR: 395, stock: 22, imageId: "img-side", deliveryDate: "Mercredi 16 Juillet", deliveryDays: "Demain" },
    // Argent XL
    { color: "silver", size: "xl", priceGNF: 2580000, priceEUR: 276, originalPriceGNF: 3870000, originalPriceEUR: 413, stock: 8, imageId: "img-side", deliveryDate: "Jeudi 17 Juillet", deliveryDays: "2 jours" },
    // Bleu Nuit Standard
    { color: "navy", size: "standard", priceGNF: 2400000, priceEUR: 257, originalPriceGNF: 3700000, originalPriceEUR: 395, stock: 0, imageId: "img-worn", deliveryDate: "Lundi 21 Juillet", deliveryDays: "5-7 jours" },
    // Bleu Nuit XL
    { color: "navy", size: "xl", priceGNF: 2580000, priceEUR: 276, originalPriceGNF: 3870000, originalPriceEUR: 413, stock: 0, imageId: "img-worn", deliveryDate: "Lundi 21 Juillet", deliveryDays: "5-7 jours" },
    // Or Rose Standard
    { color: "rose", size: "standard", priceGNF: 2480000, priceEUR: 265, originalPriceGNF: 3780000, originalPriceEUR: 404, stock: 5, imageId: "img-lifestyle", deliveryDate: "Jeudi 17 Juillet", deliveryDays: "2 jours" },
    // Or Rose XL
    { color: "rose", size: "xl", priceGNF: 2660000, priceEUR: 284, originalPriceGNF: 3960000, originalPriceEUR: 423, stock: 2, imageId: "img-lifestyle", deliveryDate: "Vendredi 18 Juillet", deliveryDays: "3 jours" },
  ],
  promoTags: ["Orange Money", "Livraison Offerte", "Vente Flash", "Best Seller"],
  couponText: "Économisez 50 000 GNF avec le code AFRI50",
  couponAmountGNF: 50000,
  installmentText: "Paiement en 3× sans frais via Orange Money",
  specifications: [
    { name: "Marque", value: "SoundCore" },
    { name: "Modèle", value: "Pro X1" },
    { name: "Couleurs", value: "Noir Mat / Argent / Bleu Nuit / Or Rose" },
    { name: "Type", value: "Circum-auriculaire (Over-Ear)" },
    { name: "Connectivité", value: "Bluetooth 5.3, 3.5mm AUX, USB-C" },
    { name: "Réduction de Bruit", value: "ANC Hybride (Adaptatif)" },
    { name: "Taille Haut-parleur", value: "40mm Dynamique Personnalisé" },
    { name: "Réponse en Fréquence", value: "4Hz - 40kHz" },
    { name: "Codec Audio", value: "LDAC, aptX HD, aptX Adaptive, AAC, SBC" },
    { name: "Autonomie Batterie", value: "60h (ANC activé), 80h (ANC désactivé)" },
    { name: "Charge", value: "USB-C, 10 min de charge = 5h de lecture" },
    { name: "Connexion Multipoint", value: "Oui (2 appareils simultanément)" },
    { name: "Microphone", value: "6 microphones avec réduction de bruit IA" },
    { name: "Poids", value: "250g" },
    { name: "Coussinets", value: "Cuir Protéine + Mousse à Mémoire" },
    { name: "Pliable", value: "Oui" },
    { name: "Étui de Transport", value: "Inclus (Coque Rigide)" },
    { name: "Résistance à l'Eau", value: "IPX4" },
    { name: "Garantie", value: "2 ans garantie constructeur" },
    { name: "Contenu de l'emballage", value: "Casque, Câble USB-C, Câble 3.5mm, Étui, Guide de démarrage, Adaptateur avion" },
  ],
  reviews: [
    {
      id: "r1", author: "Mamadou B.", avatar: "MB", avatarBg: "bg-[#1B5E20]",
      verified: true, rating: 5,
      title: "Le meilleur casque à ce prix en Guinée !",
      body: "J'ai acheté ce casque à Conakry et il est arrivé en 2 jours. La qualité sonore est incroyable, la réduction de bruit fonctionne parfaitement dans les taxis et les marches. L'autonomie est impressionnante — je le charge une fois par semaine. Le paiement par Orange Money était super simple. Je recommande vivement !",
      date: "10 Juillet 2025", helpful: 342,
      photos: ["/product-images/headphone-front.png"],
      location: "Conakry, Guinée",
    },
    {
      id: "r2", author: "Aminata D.", avatar: "AD", avatarBg: "bg-[#880E4F]",
      verified: true, rating: 5,
      title: "Qualité studio pour les musiciens — parfait pour le mixage",
      body: "En tant que productrice musicale, j'avais besoin d'un casque avec une réponse en fréquence plate. Celui-ci délivre ! La plage 4Hz-40kHz permet d'entendre les sub-bass que la plupart des casques grand public ignorent. Le cuir des coussinets est de très bonne qualité. Excellent rapport qualité-prix.",
      date: "8 Juillet 2025", helpful: 187,
      location: "Kindia, Guinée",
    },
    {
      id: "r3", author: "Sékou T.", avatar: "ST", avatarBg: "bg-[#0D47A1]",
      verified: true, rating: 4,
      title: "Bon casque, mais un peu cher pour le marché guinéen",
      body: "Le casque est excellent, surtout avec le codec LDAC. L'ANC est au top. Le seul point négatif c'est le prix en GNF — avec les frais de douane c'est un investissement. Mais la qualité justifie le prix. La livraison au point de retrait d'Almamya a fonctionné parfaitement.",
      date: "5 Juillet 2025", helpful: 124,
      photos: ["/product-images/headphone-case.png"],
      location: "Labé, Guinée",
    },
    {
      id: "r4", author: "Fatoumata K.", avatar: "FK", avatarBg: "bg-[#4A148C]",
      verified: false, rating: 5,
      title: "J'ai pu payer en 3× sans frais, c'est génial !",
      body: "Le paiement en 3× via Orange Money m'a permis de me faire plaisir. Le casque est arrivé bien emballé, avec l'étui de transport. Très bon son et confortable. Le seul petit bémol c'est que l'application mobile pourrait être en français. Mais le casque lui-même est parfait.",
      date: "3 Juillet 2025", helpful: 89,
      location: "Nzérékoré, Guinée",
    },
    {
      id: "r5", author: "Ibrahima S.", avatar: "IS", avatarBg: "bg-[#E65100]",
      verified: true, rating: 5,
      title: "Idéal pour le télétravail et les visioconférences",
      body: "Je fais 5-6 appels vidéo par jour et mes collègues sont tous impressionnés par la qualité du micro. La réduction de bruit IA filtre parfaitement le bruit de fond — même mes enfants qui jouent dans la pièce ! La connexion multipoint entre mon PC et mon téléphone fonctionne sans accroc. Parfait pour le travail.",
      date: "28 Juin 2025", helpful: 256,
      location: "Conakry, Guinée",
    },
    {
      id: "r6", author: "Oumar B.", avatar: "OB", avatarBg: "bg-[#006064]",
      verified: true, rating: 4,
      title: "Très bon casque, mais attention à la chaleur",
      body: "La qualité audio et l'ANC sont excellents. Le seul problème c'est qu'il fait très chaud à Conakry et après 2-3 heures les oreilles transpirent. C'est normal pour un casque circum-auriculaire. Je le recommande pour un usage intérieur. La batterie dure vraiment 60h comme indiqué !",
      date: "25 Juin 2025", helpful: 67,
      location: "Conakry, Guinée",
    },
    {
      id: "r7", author: "Hawa C.", avatar: "HC", avatarBg: "bg-[#827717]",
      verified: true, rating: 5,
      title: "Beau design, la couleur Or Rose est magnifique",
      body: "J'ai choisi la couleur Or Rose et elle est magnifique ! La finition mate ne marque pas les empreintes. Le son est cristallin avec une bonne séparation des instruments. L'étui de transport est de très bonne qualité. Livraison rapide au point de retrait de Madina. Je suis ravie !",
      date: "22 Juin 2025", helpful: 145,
      photos: ["/product-images/headphone-lifestyle.png"],
      location: "Conakry, Guinée",
    },
    {
      id: "r8", author: "Abdoulaye M.", avatar: "AM", avatarBg: "bg-[#1A237E]",
      verified: true, rating: 5,
      title: "Les étudiants aussi peuvent se l'offrir grâce au paiement en 3×",
      body: "En tant qu'étudiant, le paiement en 3× sans frais via Orange Money m'a permis d'acheter ce casque. Je l'utilise pour les cours en ligne, la musique et les jeux. L'ANC est indispensable dans les dortoirs bruyants de l'université. La charge rapide m'a sauvé plusieurs fois avant un cours.",
      date: "18 Juin 2025", helpful: 98,
      location: "Kankan, Guinée",
    },
  ],
  relatedProducts: [
    {
      id: "rp1", title: "SoundCore Elite Sport — Écouteurs Bluetooth avec ANC",
      image: "/product-images/headphone-front.png", rating: 4.5, ratingCount: 8421,
      priceGNF: 1280000, priceEUR: 137, originalPriceGNF: 1710000, isOfficial: true,
    },
    {
      id: "rp2", title: "Enceinte Bluetooth Portable SoundCore Boom 3, Étanche",
      image: "/product-images/headphone-side.png", rating: 4.6, ratingCount: 6234,
      priceGNF: 770000, priceEUR: 82,
    },
    {
      id: "rp3", title: "SoundCore Wave — Casque Col de Cygne pour le Sport",
      image: "/product-images/headphone-worn.png", rating: 4.3, ratingCount: 3456,
      priceGNF: 515000, priceEUR: 55, originalPriceGNF: 686000,
    },
    {
      id: "rp4", title: "Support Casque Premium — Aluminium avec Hub USB",
      image: "/product-images/headphone-controls.png", rating: 4.7, ratingCount: 2156,
      priceGNF: 300000, priceEUR: 32,
    },
    {
      id: "rp5", title: "Adaptateur Audio USB-C Hi-Res SoundCore DAC Pro",
      image: "/product-images/headphone-colors.png", rating: 4.4, ratingCount: 1873,
      priceGNF: 430000, priceEUR: 46,
    },
    {
      id: "rp6", title: "Coussinets de Remplacement Pro X1 — Mousse à Mémoire",
      image: "/product-images/headphone-case.png", rating: 4.8, ratingCount: 987,
      priceGNF: 215000, priceEUR: 23,
    },
  ],
  seller: "SoundCore Boutique Officielle",
  sellerVerified: true,
  sellerSince: "2022",
  sellerRating: 4.8,
  pickupPoints: [
    { id: "pp1", name: "Almamya — Madina", address: "Carrefour Madina, près de la mosquée", city: "Conakry", hours: "8h - 21h", isAvailable: true },
    { id: "pp2", name: "Almamya — Kipé", address: "Route du Niger, Kipé", city: "Conakry", hours: "8h - 20h", isAvailable: true },
    { id: "pp3", name: "Le Marché Africain Labé", address: "Centre-ville, près du marché", city: "Labé", hours: "9h - 18h", isAvailable: true },
    { id: "pp4", name: "Le Marché Africain Kindia", address: "Avenue de la République", city: "Kindia", hours: "9h - 18h", isAvailable: false },
    { id: "pp5", name: "Le Marché Africain Nzérékoré", address: "Quartier Marché Central", city: "Nzérékoré", hours: "9h - 17h", isAvailable: true },
  ],
};

export type Currency = "GNF" | "XOF" | "XAF" | "EUR" | "USD";

export interface CountryConfig {
  code: string;
  name: string;
  currency: Currency;
  flag: string;
  language: string;
  capital: string;
  cities: string[];
}

// Rating distribution
export const ratingDistribution = [
  { stars: 5, percentage: 68 },
  { stars: 4, percentage: 20 },
  { stars: 3, percentage: 7 },
  { stars: 2, percentage: 3 },
  { stars: 1, percentage: 2 },
];

// Re-export product for compatibility
export { product };
export const productsMap: Record<string, typeof product> = { GN: product };
