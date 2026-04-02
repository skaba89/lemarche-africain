import { create } from "zustand";

// ============================================================
// Types — previously imported from @/data/product
// ============================================================

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

// ============================================================
// Countries & Currencies supported
// ============================================================

export const countries: CountryConfig[] = [
  { code: "GN", name: "Guinée", currency: "GNF", flag: "🇬🇳", language: "fr", capital: "Conakry", cities: ["Conakry", "Nzérékoré", "Kindia", "Labé", "Kankan", "Boké"] },
  { code: "SN", name: "Sénégal", currency: "XOF", flag: "🇸🇳", language: "fr", capital: "Dakar", cities: ["Dakar", "Saint-Louis", "Thiès", "Kaolack", "Ziguinchor"] },
  { code: "ML", name: "Mali", currency: "XOF", flag: "🇲🇱", language: "fr", capital: "Bamako", cities: ["Bamako", "Sikasso", "Mopti", "Kayes", "Gao"] },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF", flag: "🇨🇮", language: "fr", capital: "Abidjan", cities: ["Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San Pedro"] },
  { code: "CM", name: "Cameroun", currency: "XAF", flag: "🇨🇲", language: "fr", capital: "Douala", cities: ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Ngaoundéré"] },
  { code: "NE", name: "Niger", currency: "XOF", flag: "🇳🇪", language: "fr", capital: "Niamey", cities: ["Niamey", "Zinder", "Maradi", "Agadez", "Tahoua"] },
  { code: "BF", name: "Burkina Faso", currency: "XOF", flag: "🇧🇫", language: "fr", capital: "Ouagadougou", cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"] },
  { code: "TD", name: "Tchad", currency: "XAF", flag: "🇹🇩", language: "fr", capital: "N'Djamena", cities: ["N'Djamena", "Moundou", "Sarh"] },
  { code: "GA", name: "Gabon", currency: "XAF", flag: "🇬🇦", language: "fr", capital: "Libreville", cities: ["Libreville", "Port-Gentil", "Franceville"] },
  { code: "CG", name: "Congo", currency: "XAF", flag: "🇨🇬", language: "fr", capital: "Brazzaville", cities: ["Brazzaville", "Pointe-Noire"] },
];

export const currencies: Record<Currency, { symbol: string; name: string; rate: number }> = {
  GNF: { symbol: "GNF", name: "Franc Guinéen", rate: 1 },
  XOF: { symbol: "FCFA", name: "Franc CFA (Ouest)", rate: 6.5596 },
  XAF: { symbol: "FCFA", name: "Franc CFA (Centre)", rate: 6.5596 },
  EUR: { symbol: "€", name: "Euro", rate: 0.0093 },
  USD: { symbol: "$", name: "Dollar US", rate: 0.0101 },
};

export function formatPrice(baseGNF: number, currency: Currency): string {
  const c = currencies[currency];
  const amount = Math.round(baseGNF * c.rate);
  if (currency === "GNF") {
    return amount.toLocaleString("fr-FR") + " " + c.symbol;
  }
  if (currency === "EUR" || currency === "USD") {
    return c.symbol + (amount / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  // FCFA
  return amount.toLocaleString("fr-FR") + " " + c.symbol;
}

export function shortPrice(baseGNF: number, currency: Currency): string {
  const c = currencies[currency];
  const amount = Math.round(baseGNF * c.rate);
  if (currency === "GNF") return (amount / 1000000).toFixed(1) + "M " + c.symbol;
  if (currency === "XOF" || currency === "XAF") return (amount / 1000).toFixed(0) + "K " + c.symbol;
  if (currency === "EUR" || currency === "USD") return c.symbol + (amount / 100).toFixed(0);
  return amount.toLocaleString("fr-FR") + " " + c.symbol;
}

// ============================================================
// Social proof data
// ============================================================

export const socialProofEvents = [
  { buyer: "Mamadou B.", city: "Conakry", country: "GN", time: "il y a 2 min" },
  { buyer: "Aminata D.", city: "Dakar", country: "SN", time: "il y a 5 min" },
  { buyer: "Sékou T.", city: "Abidjan", country: "CI", time: "il y a 8 min" },
  { buyer: "Fatoumata K.", city: "Bamako", country: "ML", time: "il y a 12 min" },
  { buyer: "Ibrahima S.", city: "Douala", country: "CM", time: "il y a 15 min" },
  { buyer: "Hawa C.", city: "Niamey", country: "NE", time: "il y a 18 min" },
  { buyer: "Oumar B.", city: "Ouagadougou", country: "BF", time: "il y a 22 min" },
  { buyer: "Abdoulaye M.", city: "N'Djamena", country: "TD", time: "il y a 25 min" },
  { buyer: "Djénéba T.", city: "Kindia", country: "GN", time: "il y a 28 min" },
  { buyer: "Mariama F.", city: "Libreville", country: "GA", time: "il y a 32 min" },
  { buyer: "Moussa D.", city: "Ziguinchor", country: "SN", time: "il y a 35 min" },
  { buyer: "Awa S.", city: "Brazzaville", country: "CG", time: "il y a 40 min" },
];

// ============================================================
// Store interface
// ============================================================

interface ProductState {
  // Multi-country
  selectedCountry: CountryConfig;
  selectedCurrency: Currency;

  // Delivery
  deliveryType: "domicile" | "pickup";
  selectedPickupPoint: string;
  selectedCity: string;

  // Payment
  paymentMethod: "orange_money" | "mtn_momo" | "wave" | "cash" | "carte";

  // UI state
  isWishlisted: boolean;
  cartCount: number;
  cartTotal: number;
  showSocialProof: boolean;
  socialProofIndex: number;

  // Actions
  setSelectedCountry: (code: string) => void;
  setSelectedCurrency: (c: Currency) => void;
  setDeliveryType: (type: "domicile" | "pickup") => void;
  setSelectedPickupPoint: (id: string) => void;
  setSelectedCity: (city: string) => void;
  setPaymentMethod: (m: "orange_money" | "mtn_momo" | "wave" | "cash" | "carte") => void;
  toggleWishlist: () => void;
  nextSocialProof: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  selectedCountry: countries[0],
  selectedCurrency: "GNF",
  deliveryType: "pickup",
  selectedPickupPoint: "",
  selectedCity: "Conakry",
  paymentMethod: "orange_money",
  isWishlisted: false,
  cartCount: 0,
  cartTotal: 0,
  showSocialProof: true,
  socialProofIndex: 0,

  setSelectedCountry: (code: string) => {
    const country = countries.find((c) => c.code === code) || countries[0];
    set({
      selectedCountry: country,
      selectedCurrency: country.currency as Currency,
      selectedCity: country.capital,
    });
  },

  setSelectedCurrency: (c: Currency) => set({ selectedCurrency: c }),
  setDeliveryType: (type: "domicile" | "pickup") => set({ deliveryType: type }),
  setSelectedPickupPoint: (id: string) => set({ selectedPickupPoint: id }),
  setSelectedCity: (city: string) => set({ selectedCity: city }),
  setPaymentMethod: (m: "orange_money" | "mtn_momo" | "wave" | "cash" | "carte") => set({ paymentMethod: m }),
  toggleWishlist: () => set((s) => ({ isWishlisted: !s.isWishlisted })),
  nextSocialProof: () => set((s) => ({ socialProofIndex: (s.socialProofIndex + 1) % socialProofEvents.length })),
}));
