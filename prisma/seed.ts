/* eslint-disable no-console */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ==================== CATEGORIES ====================
  console.log('Creating categories...')

  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: 'audio' },
      update: {},
      create: {
        name: 'Audio',
        slug: 'audio',
        description: 'Casques, enceintes, écouteurs et tout le matériel audio',
        image: '/product-images/headphones-main.png',
        order: 1,
      },
    }),
    db.category.upsert({
      where: { slug: 'telephones' },
      update: {},
      create: {
        name: 'Téléphones',
        slug: 'telephones',
        description: 'Smartphones et téléphones de toutes marques',
        image: '/product-images/smartphone-main.png',
        order: 2,
      },
    }),
    db.category.upsert({
      where: { slug: 'informatique' },
      update: {},
      create: {
        name: 'Informatique',
        slug: 'informatique',
        description: 'Ordinateurs, tablettes et accessoires informatiques',
        image: '/product-images/tablet-main.png',
        order: 3,
      },
    }),
    db.category.upsert({
      where: { slug: 'maison' },
      update: {},
      create: {
        name: 'Maison',
        slug: 'maison',
        description: 'Objets connectés, domotique et articles pour la maison',
        image: '/product-images/speaker-main.png',
        order: 4,
      },
    }),
    db.category.upsert({
      where: { slug: 'accessoires' },
      update: {},
      create: {
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Coques, chargeurs, batteries et accessoires tech',
        image: '/product-images/powerbank-main.png',
        order: 5,
      },
    }),
    db.category.upsert({
      where: { slug: 'sport' },
      update: {},
      create: {
        name: 'Sport',
        slug: 'sport',
        description: 'Montres connectées, bracelets sport et accessoires fitness',
        image: '/product-images/smartwatch-main.png',
        order: 6,
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Helper to find category by slug
  const cat = (slug: string) => categories.find((c) => c.slug === slug)!

  // ==================== PRODUCTS ====================
  console.log('Creating products...')

  const productsData = [
    {
      slug: 'soundcore-pro-x1',
      name: 'SoundCore Pro X1',
      brand: 'SoundCore',
      description:
        'Casque Bluetooth Premium avec réduction de bruit active (ANC). Son Hi-Res certifié, confort exceptionnel pour une utilisation prolongée. Autonomie de 40 heures avec ANC activé et 60 heures en mode standard.',
      features: JSON.stringify([
        'Réduction de bruit active (ANC) hybride',
        'Son Hi-Res certifié LDAC',
        'Autonomie 40h ANC / 60h standard',
        'Bluetooth 5.3 multipoint',
        'Microphones 6MEMS pour appels crystal',
        'Pliable avec étui de transport inclus',
        'Application personnalisable EQ',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'SoundCore' },
        { name: 'Type', value: 'Casque supra-auriculaire' },
        { name: 'Connectivité', value: 'Bluetooth 5.3' },
        { name: 'ANC', value: 'Hybride adaptatif' },
        { name: 'Autonomie', value: '40h (ANC) / 60h' },
        { name: 'Poids', value: '250g' },
        { name: 'Codecs', value: 'LDAC, AAC, SBC' },
        { name: 'Dimensions plié', value: '18 x 16 x 8 cm' },
      ]),
      images: JSON.stringify([
        '/product-images/headphones-main.png',
        '/product-images/headphones-side.png',
        '/product-images/headphones-case.png',
        '/product-images/headphones-worn.png',
      ]),
      priceGNF: 2400000,
      originalPriceGNF: 3700000,
      rating: 4.7,
      ratingCount: 128,
      salesCount: 89,
      stock: 15,
      isFeatured: true,
      isOfficial: true,
      categorySlug: 'audio',
      seller: 'SoundCore Officiel',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
        { id: 'silver', label: 'Argent', hex: '#C0C0C0' },
        { id: 'navy', label: 'Bleu Marine', hex: '#1e3a5f' },
      ]),
    },
    {
      slug: 'soundcore-boom-3',
      name: 'SoundCore Boom 3',
      brand: 'SoundCore',
      description:
        'Enceinte Bluetooth portable avec basses puissantes. Étanche IPX7, parfaite pour vos aventures outdoor. Son 360° immersif avec LED personnalisables.',
      features: JSON.stringify([
        'Son 360° immersif',
        'Basses profondes BassUp',
        'Étanche IPX7',
        'Autonomie 24 heures',
        'LED personnalisables',
        'Pairing stéréo TWS',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'SoundCore' },
        { name: 'Type', value: 'Enceinte portable' },
        { name: 'Connectivité', value: 'Bluetooth 5.3' },
        { name: 'Puissance', value: '30W' },
        { name: 'Autonomie', value: '24 heures' },
        { name: 'Étanchéité', value: 'IPX7' },
        { name: 'Poids', value: '680g' },
      ]),
      images: JSON.stringify([
        '/product-images/speaker-main.png',
        '/product-images/soundcore-boom-3-angle.png',
        '/product-images/soundcore-boom-3-lifestyle.png',
      ]),
      priceGNF: 770000,
      originalPriceGNF: 1100000,
      rating: 4.5,
      ratingCount: 85,
      salesCount: 62,
      stock: 22,
      isFeatured: false,
      isOfficial: true,
      categorySlug: 'audio',
      seller: 'SoundCore Officiel',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
        { id: 'blue', label: 'Bleu', hex: '#2563eb' },
        { id: 'red', label: 'Rouge', hex: '#dc2626' },
      ]),
    },
    {
      slug: 'samsung-galaxy-a54',
      name: 'Samsung Galaxy A54',
      brand: 'Samsung',
      description:
        'Smartphone Samsung Galaxy A54 5G avec écran Super AMOLED 6.4 pouces, appareil photo triple 50MP, processeur Exynos 1380 et batterie 5000mAh. Le meilleur rapport qualité-prix de Samsung.',
      features: JSON.stringify([
        'Écran Super AMOLED 6.4" FHD+ 120Hz',
        'Appareil photo triple 50MP OIS',
        'Processeur Exynos 1380',
        'Batterie 5000mAh charge rapide 25W',
        '5G compatible',
        'Certifié IP67 étanche',
        'One UI 5.1 basé sur Android 13',
        '4 ans de mises à jour de sécurité',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'Samsung' },
        { name: 'Modèle', value: 'Galaxy A54 5G' },
        { name: 'Écran', value: '6.4" Super AMOLED FHD+ 120Hz' },
        { name: 'Processeur', value: 'Exynos 1380' },
        { name: 'RAM', value: '8 Go' },
        { name: 'Stockage', value: '128 Go' },
        { name: 'Appareil photo', value: '50MP + 12MP + 5MP' },
        { name: 'Batterie', value: '5000 mAh' },
        { name: 'Système', value: 'Android 13 / One UI 5.1' },
      ]),
      images: JSON.stringify([
        '/product-images/smartphone-main.png',
        '/product-images/samsung-galaxy-a54-back.png',
        '/product-images/samsung-galaxy-a54-screen.png',
      ]),
      priceGNF: 4200000,
      originalPriceGNF: 5100000,
      rating: 4.6,
      ratingCount: 210,
      salesCount: 156,
      stock: 8,
      isFeatured: true,
      isOfficial: true,
      categorySlug: 'telephones',
      seller: 'Samsung Certified',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir Graphite', hex: '#1a1a1a' },
        { id: 'white', label: 'Blanc', hex: '#f5f5f5' },
        { id: 'purple', label: 'Violet', hex: '#7c3aed' },
        { id: 'lime', label: 'Citron Vert', hex: '#84cc16' },
      ]),
    },
    {
      slug: 'xiaomi-band-8-pro',
      name: 'Xiaomi Band 8 Pro',
      brand: 'Xiaomi',
      description:
        'Montre connectée avec écran AMOLED 1.74 pouces, suivi santé complet, GPS intégré et autonomie de 14 jours. Votre partenaire fitness au quotidien.',
      features: JSON.stringify([
        'Écran AMOLED 1.74" 450 nits',
        'Plus de 150 modes sportifs',
        'GPS intégré',
        'Suivi SpO2, fréquence cardiaque, sommeil',
        'Autonomie 14 jours',
        'Étanche 5 ATM',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'Xiaomi' },
        { name: 'Modèle', value: 'Smart Band 8 Pro' },
        { name: 'Écran', value: '1.74" AMOLED 450 nits' },
        { name: 'Santé', value: 'FC, SpO2, sommeil, stress' },
        { name: 'Sport', value: '150+ modes' },
        { name: 'GPS', value: 'Intégré' },
        { name: 'Autonomie', value: '14 jours' },
        { name: 'Étanchéité', value: '5 ATM' },
      ]),
      images: JSON.stringify(['/product-images/smartwatch-main.png']),
      priceGNF: 350000,
      originalPriceGNF: 500000,
      rating: 4.3,
      ratingCount: 156,
      salesCount: 120,
      stock: 45,
      isFeatured: false,
      isOfficial: true,
      categorySlug: 'sport',
      seller: 'Xiaomi Store',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
        { id: 'blue', label: 'Bleu', hex: '#2563eb' },
        { id: 'rose', label: 'Rose', hex: '#f472b6' },
      ]),
    },
    {
      slug: 'soundcore-elite-sport',
      name: 'SoundCore Elite Sport',
      brand: 'SoundCore',
      description:
        'Écouteurs True Wireless Stereo premium avec ANC adaptatif, son Hi-Res et basses personnalisables. Parfaits pour le sport et le quotidien.',
      features: JSON.stringify([
        'ANC adaptatif personnalisable',
        'Son Hi-Res LDAC',
        'Basses ajustables BassUp',
        'Autonomie 8h + 32h avec boîtier',
        'Étanche IPX5',
        'Multipoint Bluetooth 5.3',
        'Appels cristallins 6 microphones',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'SoundCore' },
        { name: 'Type', value: 'Écouteurs TWS' },
        { name: 'ANC', value: 'Adaptatif hybride' },
        { name: 'Autonomie', value: '8h + 32h (boîtier)' },
        { name: 'Bluetooth', value: '5.3 multipoint' },
        { name: 'Étanchéité', value: 'IPX5' },
        { name: 'Poids écouteur', value: '5.3g' },
        { name: 'Codecs', value: 'LDAC, AAC, SBC' },
      ]),
      images: JSON.stringify(['/product-images/earbuds-main.png']),
      priceGNF: 1280000,
      originalPriceGNF: 1710000,
      rating: 4.6,
      ratingCount: 95,
      salesCount: 73,
      stock: 30,
      isFeatured: true,
      isOfficial: true,
      categorySlug: 'audio',
      seller: 'SoundCore Officiel',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
        { id: 'white', label: 'Blanc', hex: '#f5f5f5' },
      ]),
    },
    {
      slug: 'anker-powercore-20000',
      name: 'Anker PowerCore 20000',
      brand: 'Anker',
      description:
        'Batterie externe 20000mAh haute capacité avec charge rapide PowerIQ 2.0. Rechargez jusqu\'à 3 appareils simultanément. Compact et fiable.',
      features: JSON.stringify([
        'Capacité 20000mAh',
        'Charge rapide PowerIQ 2.0',
        '3 sorties USB-A',
        '2 entrées (Micro-USB + USB-C)',
        'Recharge complète en 4h',
        'ProtectionMultiProtect 12 points',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'Anker' },
        { name: 'Capacité', value: '20000 mAh' },
        { name: 'Sorties', value: '3x USB-A' },
        { name: 'Entrées', value: 'Micro-USB + USB-C' },
        { name: 'Puissance max', value: '18W' },
        { name: 'Poids', value: '356g' },
        { name: 'Recharge', value: '4 heures' },
      ]),
      images: JSON.stringify(['/product-images/powerbank-main.png']),
      priceGNF: 310000,
      originalPriceGNF: null,
      rating: 4.4,
      ratingCount: 67,
      salesCount: 45,
      stock: 50,
      isFeatured: false,
      isOfficial: true,
      categorySlug: 'accessoires',
      seller: 'Anker Certified',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
        { id: 'white', label: 'Blanc', hex: '#f5f5f5' },
      ]),
    },
    {
      slug: 'lenovo-tab-m10-plus',
      name: 'Lenovo Tab M10 Plus',
      brand: 'Lenovo',
      description:
        'Tablette 10.6 pouces avec écran 2K FHD+, processeur Snapdragon, 4 Go RAM et 64 Go de stockage. Parfaite pour le divertissement et le travail léger.',
      features: JSON.stringify([
        'Écran 2K FHD+ 10.6" IPS',
        'Enceintes stéréo Dolby Atmos',
        'Processeur Snapdragon 680',
        '4 Go RAM / 64 Go stockage',
        'Android 13 avec Google Kids',
        'Autonomie 12 heures',
        'Lecteur d\'empreintes digitales',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'Lenovo' },
        { name: 'Modèle', value: 'Tab M10 Plus Gen 3' },
        { name: 'Écran', value: '10.6" IPS 2K FHD+' },
        { name: 'Processeur', value: 'Snapdragon 680' },
        { name: 'RAM', value: '4 Go' },
        { name: 'Stockage', value: '64 Go (microSD 1TB)' },
        { name: 'Appareil photo', value: '8MP arrière / 8MP avant' },
        { name: 'Batterie', value: '5000 mAh, 12h' },
        { name: 'Audio', value: 'Stéréo Dolby Atmos' },
      ]),
      images: JSON.stringify(['/product-images/tablet-main.png']),
      priceGNF: 1350000,
      originalPriceGNF: 1800000,
      rating: 4.3,
      ratingCount: 42,
      salesCount: 28,
      stock: 12,
      isFeatured: false,
      isOfficial: true,
      categorySlug: 'informatique',
      seller: 'Lenovo Store',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'gray', label: 'Gris Ardoise', hex: '#64748b' },
        { id: 'blue', label: 'Bleu', hex: '#2563eb' },
      ]),
    },
    {
      slug: 'soundcore-wave',
      name: 'SoundCore Wave',
      brand: 'SoundCore',
      description:
        'Casque col de cygne Bluetooth léger avec son cristallin et basses renforcées. Confort optimal pour le sport et le quotidien. Autonomie 18 heures.',
      features: JSON.stringify([
        'Col de cygne flexible',
        'Magnets auto-rangement',
        'Son cristallin BassUp',
        'Autonomie 18 heures',
        'Étanche IPX5',
        'Bluetooth 5.3',
        'Appels clairs 2 microphones',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'SoundCore' },
        { name: 'Type', value: 'Casque col de cygne' },
        { name: 'Bluetooth', value: '5.3' },
        { name: 'Autonomie', value: '18 heures' },
        { name: 'Étanchéité', value: 'IPX5' },
        { name: 'Poids', value: '28g' },
        { name: 'Charge', value: 'USB-C, 1.5h' },
      ]),
      images: JSON.stringify(['/product-images/neckband-main.png']),
      priceGNF: 515000,
      originalPriceGNF: null,
      rating: 4.2,
      ratingCount: 55,
      salesCount: 38,
      stock: 35,
      isFeatured: false,
      isOfficial: false,
      categorySlug: 'sport',
      seller: 'TechZone Conakry',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
        { id: 'navy', label: 'Bleu Marine', hex: '#1e3a5f' },
      ]),
    },
    {
      slug: 'support-premium-aluminium',
      name: 'Support Premium Aluminium',
      brand: 'SoundCore',
      description:
        'Support casque en aluminium de qualité premium. Design élégant compatible avec tous les casques supra-auriculaires. Base antidérapante et embout en cuir synthétique.',
      features: JSON.stringify([
        'Aluminium brossé de qualité premium',
        'Compatible tous casques supra-auriculaires',
        'Base antidérapante en caoutchouc',
        'Embout en cuir synthétique',
        'Montage facile sans outils',
        'Design minimaliste élégant',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'SoundCore' },
        { name: 'Matériau', value: 'Aluminium brossé' },
        { name: 'Hauteur', value: '27 cm' },
        { name: 'Base', value: '13 cm diamètre' },
        { name: 'Poids', value: '320g' },
        { name: 'Couleur', value: 'Argent / Noir' },
      ]),
      images: JSON.stringify(['/product-images/headphone-stand.png']),
      priceGNF: 300000,
      originalPriceGNF: null,
      rating: 4.5,
      ratingCount: 30,
      salesCount: 18,
      stock: 20,
      isFeatured: false,
      isOfficial: false,
      categorySlug: 'accessoires',
      seller: 'TechZone Conakry',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'silver', label: 'Argent', hex: '#C0C0C0' },
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
      ]),
    },
    {
      slug: 'jbl-charge-5',
      name: 'JBL Charge 5',
      brand: 'JBL',
      description:
        'Enceinte Bluetooth JBL Charge 5 avec son JBL Pro exceptionnel, étanche IP67, et fonction powerbank intégrée. Profitez de votre musique partout.',
      features: JSON.stringify([
        'Son JBL Pro optimisé',
        'Driver tweeter séparé + 2 passifs',
        'Étanche IP67 poussière et eau',
        'Fonction powerbank intégré',
        'Autonomie 20 heures',
        'PartyBoost pour pairing',
        'App JBL Portable EQ personnalisé',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'JBL' },
        { name: 'Type', value: 'Enceinte portable' },
        { name: 'Puissance', value: '30W RMS' },
        { name: 'Bluetooth', value: '5.1' },
        { name: 'Autonomie', value: '20 heures' },
        { name: 'Étanchéité', value: 'IP67' },
        { name: 'Poids', value: '960g' },
        { name: 'Powerbank', value: 'Oui, USB-C' },
      ]),
      images: JSON.stringify(['/product-images/jbl-charge-5-main.png']),
      priceGNF: 920000,
      rating: 4.7,
      ratingCount: 142,
      salesCount: 98,
      stock: 18,
      isFeatured: false,
      isOfficial: true,
      categorySlug: 'audio',
      seller: 'JBL Official',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
        { id: 'blue', label: 'Bleu', hex: '#2563eb' },
        { id: 'red', label: 'Rouge', hex: '#dc2626' },
        { id: 'teal', label: 'Turquoise', hex: '#0d9488' },
        { id: 'gray', label: 'Gris', hex: '#6b7280' },
      ]),
    },
    {
      slug: 'samsung-galaxy-buds-fe',
      name: 'Samsung Galaxy Buds FE',
      brand: 'Samsung',
      description:
        'Écouteurs Samsung Galaxy Buds FE avec ANC et son AKG. Confort léger, étanches IPX2, parfaits pour une utilisation quotidienne avec vos appareils Samsung.',
      features: JSON.stringify([
        'ANC (Réduction de bruit active)',
        'Son signé AKG',
        'Autonomie 6h + 21h avec boîtier',
        'Étanches IPX2',
        '3 tailles de embouts fournis',
        '360 Audio compatible Samsung',
        'SmartThings Find',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'Samsung' },
        { name: 'Type', value: 'Écouteurs TWS' },
        { name: 'ANC', value: 'Oui' },
        { name: 'Audio', value: 'AKG tuning' },
        { name: 'Autonomie', value: '6h + 21h (boîtier)' },
        { name: 'Bluetooth', value: '5.2' },
        { name: 'Étanchéité', value: 'IPX2' },
        { name: 'Poids', value: '5.6g par écouteur' },
      ]),
      images: JSON.stringify(['/product-images/samsung-buds-fe-main.png']),
      priceGNF: 450000,
      originalPriceGNF: 650000,
      rating: 4.2,
      ratingCount: 78,
      salesCount: 55,
      stock: 40,
      isFeatured: false,
      isOfficial: true,
      categorySlug: 'audio',
      seller: 'Samsung Certified',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
        { id: 'white', label: 'Blanc', hex: '#f5f5f5' },
      ]),
    },
    {
      slug: 'tecno-spark-20-pro',
      name: 'Tecno Spark 20 Pro',
      brand: 'Tecno',
      description:
        'Smartphone abordable avec écran IPS 6.8 pouces, double caméra AI 50MP, batterie 5000mAh. Le choix intelligent pour votre quotidien.',
      features: JSON.stringify([
        'Écran IPS 6.8" HD+ 90Hz',
        'Double caméra AI 50MP',
        'Processeur Helio G85',
        'Batterie 5000mAh charge rapide 18W',
        'Empreinte digitale latérale',
        'Android 13 avec HiOS 13',
        '128 Go stockage extensible 256 Go',
        'Design texturé anti-traces',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'Tecno' },
        { name: 'Modèle', value: 'Spark 20 Pro' },
        { name: 'Écran', value: '6.8" IPS HD+ 90Hz' },
        { name: 'Processeur', value: 'MediaTek Helio G85' },
        { name: 'RAM', value: '4 Go' },
        { name: 'Stockage', value: '128 Go (microSD 256 Go)' },
        { name: 'Appareil photo', value: '50MP + 0.08MP / 8MP avant' },
        { name: 'Batterie', value: '5000 mAh, 18W' },
        { name: 'Système', value: 'Android 13 / HiOS 13' },
      ]),
      images: JSON.stringify([
        '/product-images/tecno-spark-main.png',
        '/product-images/tecno-spark-screen.png',
      ]),
      priceGNF: 1850000,
      originalPriceGNF: 2200000,
      rating: 4.1,
      ratingCount: 89,
      salesCount: 67,
      stock: 25,
      isFeatured: true,
      isOfficial: true,
      categorySlug: 'telephones',
      seller: 'Tecno Mobile Guinée',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir Étoilé', hex: '#1a1a1a' },
        { id: 'white', label: 'Blanc Nacré', hex: '#f5f5f0' },
        { id: 'blue', label: 'Bleu Horizon', hex: '#1e40af' },
      ]),
    },
    {
      slug: 'oraimo-powerbank-30000',
      name: 'Oraimo Traveler 4',
      brand: 'Oraimo',
      description:
        'Batterie externe 30000mAh ultra-capacité avec charge rapide 22.5W. Rechargez votre téléphone jusqu\'à 7 fois. Parfait pour les voyages.',
      features: JSON.stringify([
        'Capacité 30000mAh ultra-haute',
        'Charge rapide 22.5W',
        '2 sorties USB-A + 1 USB-C',
        'Recharge complète en 5h',
        'Charge simultanée 3 appareils',
        'Affichage LED de la capacité',
        'Protection MultiProtect 12 points',
        'Compatible tous smartphones',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'Oraimo' },
        { name: 'Modèle', value: 'Traveler 4' },
        { name: 'Capacité', value: '30000 mAh' },
        { name: 'Sorties', value: '2x USB-A + 1x USB-C' },
        { name: 'Puissance max', value: '22.5W' },
        { name: 'Poids', value: '520g' },
        { name: 'Recharge', value: '5 heures' },
        { name: 'Dimensions', value: '15 x 7 x 3 cm' },
      ]),
      images: JSON.stringify([
        '/product-images/oraimo-powerbank-main.png',
        '/product-images/oraimo-powerbank-ports.png',
      ]),
      priceGNF: 420000,
      originalPriceGNF: 550000,
      rating: 4.5,
      ratingCount: 123,
      salesCount: 95,
      stock: 35,
      isFeatured: false,
      isOfficial: true,
      categorySlug: 'accessoires',
      seller: 'Oraimo Official',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir', hex: '#1a1a1a' },
        { id: 'white', label: 'Blanc', hex: '#f5f5f5' },
      ]),
    },
    {
      slug: 'xiaomi-redmi-a3',
      name: 'Xiaomi Redmi A3',
      brand: 'Xiaomi',
      description:
        'Smartphone d\'entrée de gamme avec écran 6.7 pouces HD+, processeur Helio G36, double caméra et batterie 5000mAh. Performance fiable à petit prix.',
      features: JSON.stringify([
        'Écran 6.7" HD+ 60Hz',
        'Processeur Helio G36',
        'Double caméra 8MP AI',
        'Batterie 5000mAh',
        'Empreinte digitale arrière',
        'Android 14 Go Edition',
        '64 Go stockage extensible',
        'Design élégant et fin',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'Xiaomi' },
        { name: 'Modèle', value: 'Redmi A3' },
        { name: 'Écran', value: '6.7" HD+ IPS 60Hz' },
        { name: 'Processeur', value: 'MediaTek Helio G36' },
        { name: 'RAM', value: '3 Go' },
        { name: 'Stockage', value: '64 Go (microSD 1TB)' },
        { name: 'Appareil photo', value: '8MP AI + 0.08MP / 5MP avant' },
        { name: 'Batterie', value: '5000 mAh, 10W' },
        { name: 'Système', value: 'Android 14 Go Edition' },
      ]),
      images: JSON.stringify(['/product-images/redmi-a3-main.png']),
      priceGNF: 950000,
      originalPriceGNF: null,
      rating: 3.9,
      ratingCount: 56,
      salesCount: 40,
      stock: 40,
      isFeatured: false,
      isOfficial: true,
      categorySlug: 'telephones',
      seller: 'Xiaomi Store',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir Carbone', hex: '#1a1a1a' },
        { id: 'blue', label: 'Bleu Marine', hex: '#1e3a5f' },
        { id: 'green', label: 'Vert Forêt', hex: '#2d5016' },
      ]),
    },
    {
      slug: 'casque-gaming-rgb',
      name: 'ProGamer Headset RGB',
      brand: 'ProGamer',
      description:
        'Casque gaming avec micro pivotant, son surround 7.1, réduction de bruit et LED RGB personnalisables. Compatible PC, PS4, Xbox, Switch.',
      features: JSON.stringify([
        'Son surround 7.1 virtuel',
        'Micro pivotant réducteur de bruit',
        'LED RGB personnalisables',
        'Coussinets mémoire de forme',
        'Compatible PC, PS4, Xbox, Switch',
        'Volume et mute sur l\'écouteur',
        'Câble tressé 2.2m anti-nœuds',
        'Poids léger 320g',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'ProGamer' },
        { name: 'Type', value: 'Casque gaming supra-auriculaire' },
        { name: 'Son', value: 'Surround 7.1 virtuel' },
        { name: 'Micro', value: 'Pivotant, réduction de bruit' },
        { name: 'Connectivité', value: 'Jack 3.5mm + USB' },
        { name: 'LED', value: 'RGB personnalisables' },
        { name: 'Poids', value: '320g' },
        { name: 'Câble', value: '2.2m tressé' },
      ]),
      images: JSON.stringify([
        '/product-images/headphone-gaming-main.png',
        '/product-images/headphone-gaming-side.png',
        '/product-images/headphone-gaming-worn.png',
      ]),
      priceGNF: 650000,
      originalPriceGNF: 850000,
      rating: 4.3,
      ratingCount: 72,
      salesCount: 48,
      stock: 20,
      isFeatured: false,
      isOfficial: false,
      categorySlug: 'audio',
      seller: 'GameZone Conakry',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'black', label: 'Noir/Rouge', hex: '#1a1a1a' },
        { id: 'blue', label: 'Noir/Bleu', hex: '#2563eb' },
      ]),
    },
    {
      slug: 'tp-link-tapo-c200',
      name: 'TP-Link Tapo C200',
      brand: 'TP-Link',
      description:
        'Caméra WiFi intérieure 1080p avec rotation panoramique 360°, vision nocturne, détection de mouvement et audio bidirectionnel. Surveillance accessible depuis votre smartphone.',
      features: JSON.stringify([
        'Rotation 360° pan / 114° tilt',
        'Vision nocturne jusqu\'à 9m',
        'Détection de mouvement et alarme',
        'Audio bidirectionnel',
        'Full HD 1080p',
        'Compatible Alexa & Google Home',
        'Stockage microSD jusqu\'à 256 Go',
      ]),
      specifications: JSON.stringify([
        { name: 'Marque', value: 'TP-Link' },
        { name: 'Modèle', value: 'Tapo C200' },
        { name: 'Résolution', value: '1080p Full HD' },
        { name: 'Rotation', value: '360° pan / 114° tilt' },
        { name: 'Vision nocturne', value: '9 mètres' },
        { name: 'WiFi', value: '2.4 GHz' },
        { name: 'Stockage', value: 'microSD 256 Go' },
        { name: 'Audio', value: 'Bidirectionnel' },
      ]),
      images: JSON.stringify(['/product-images/camera-main.png']),
      priceGNF: 185000,
      originalPriceGNF: 250000,
      rating: 4.1,
      ratingCount: 34,
      salesCount: 22,
      stock: 25,
      isFeatured: false,
      isOfficial: true,
      categorySlug: 'maison',
      seller: 'TP-Link Partner',
      sellerVerified: true,
      colors: JSON.stringify([
        { id: 'white', label: 'Blanc', hex: '#f5f5f5' },
      ]),
    },
  ]

  const products = await Promise.all(
    productsData.map((p) =>
      db.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          description: p.description,
          features: p.features,
          specifications: p.specifications,
          images: p.images,
          priceGNF: p.priceGNF,
          originalPriceGNF: p.originalPriceGNF,
          rating: p.rating,
          ratingCount: p.ratingCount,
          salesCount: p.salesCount,
          stock: p.stock,
          isFeatured: p.isFeatured,
          isOfficial: p.isOfficial,
          categoryId: cat(p.categorySlug).id,
          seller: p.seller,
          sellerVerified: p.sellerVerified,
          colors: p.colors,
        },
      })
    )
  )

  console.log(`✅ Created ${products.length} products`)

  // ==================== COUPONS ====================
  console.log('Creating coupons...')

  const coupons = await Promise.all([
    db.coupon.upsert({
      where: { code: 'AFRI50' },
      update: {},
      create: {
        code: 'AFRI50',
        label: 'Réduction 50 000 GNF',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderGNF: 200000,
        maxUses: 500,
        isActive: true,
      },
    }),
    db.coupon.upsert({
      where: { code: 'PREMIER15' },
      update: {},
      create: {
        code: 'PREMIER15',
        label: '15% de réduction',
        discountType: 'percentage',
        discountValue: 15,
        minOrderGNF: 500000,
        maxUses: 200,
        isActive: true,
      },
    }),
    db.coupon.upsert({
      where: { code: 'LIVRAISON' },
      update: {},
      create: {
        code: 'LIVRAISON',
        label: 'Livraison gratuite',
        discountType: 'fixed',
        discountValue: 0,
        minOrderGNF: 100000,
        maxUses: 1000,
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${coupons.length} coupons`)

  // ==================== ADMIN USER ====================
  console.log('Creating admin user...')

  const adminPassword = await bcrypt.hash('Admin123!', 10);

  await db.user.upsert({
    where: { email: 'admin@lemarche-africain.com' },
    update: {
      name: 'Administrateur',
      phone: '+224 628 00 00 00',
      city: 'Conakry',
      role: 'admin',
      pointsBalance: 0,
      password: adminPassword,
    },
    create: {
      email: 'admin@lemarche-africain.com',
      password: adminPassword,
      name: 'Administrateur',
      phone: '+224 628 00 00 00',
      city: 'Conakry',
      role: 'admin',
      pointsBalance: 0,
    },
  });

  console.log('✅ Created admin user')

  // ==================== REVIEWS ====================
  console.log('Creating reviews for first product...')

  // Delete all existing reviews before seeding for idempotence
  await db.review.deleteMany({});

  const reviewsData = [
    {
      productId: products[0].id,
      author: 'Aboubacar Diallo',
      rating: 5,
      title: 'Excellent casque, qualité audiophile !',
      body: "J'ai acheté ce casque il y a 2 semaines et je suis impressionné. La réduction de bruit est incroyable, surtout dans les transports en commun. Le son est riche et détaillé. Je recommande vivement !",
      verified: true,
      location: 'Conakry, Guinée',
    },
    {
      productId: products[0].id,
      author: 'Mariam Camara',
      rating: 4,
      title: 'Très bon rapport qualité-prix',
      body: "Très satisfait de cet achat. Le confort est top pour les longues sessions. Seul petit bémol : l'application pourrait être plus intuitive. Sinon, la qualité audio est au rendez-vous.",
      verified: true,
      location: 'Kindia, Guinée',
    },
    {
      productId: products[0].id,
      author: 'Ibrahima Condé',
      rating: 5,
      title: 'Le meilleur casque que j\'ai eu',
      body: "Après avoir essayé plusieurs marques, celui-ci est de loin le meilleur. L'ANC est puissant, la batterie tient vraiment 40h et le son LDAC est exceptionnel. Livraison rapide via Le Marché Africain.",
      verified: true,
      location: 'Labe, Guinée',
    },
    {
      productId: products[0].id,
      author: 'Fatoumata Bah',
      rating: 5,
      title: 'Parfait pour le télétravail',
      body: "J'utilise ce casque tous les jours pour mes réunions en visio. Les micros sont parfaits, mes collègues m'entendent très bien même avec le bruit de fond. Et le confort sur les oreilles est excellent.",
      verified: false,
      location: 'Nzérékoré, Guinée',
    },
    {
      productId: products[0].id,
      author: 'Mamadou Sylla',
      rating: 4,
      title: 'Bon produit mais livraison un peu longue',
      body: "Le casque en lui-même est parfait. Qualité sonore, ANC, confort... tout est au top. Juste que la livraison a pris 5 jours au lieu de 3. Mais le produit vaut largement l'attente.",
      verified: true,
      location: 'Kankan, Guinée',
    },
    {
      productId: products[0].id,
      author: 'Aissatou Touré',
      rating: 5,
      title: 'Qualité premium à prix accessible',
      body: "Ce casque rivalise avec des modèles à 5 millions GNF. La qualité de construction est solide, le pliage est pratique et l'étui de transport est un plus. Merci Le Marché Africain !",
      verified: true,
      location: 'Conakry, Guinée',
    },
    {
      productId: products[0].id,
      author: 'Oumar Keïta',
      rating: 3,
      title: 'Bon casque mais un peu lourd',
      body: "La qualité audio est indéniable, mais après 3 heures d'utilisation je ressens une pression sur les oreilles. Peut-être qu'il faut un temps d'adaptation. L'ANC par contre est bluffant.",
      verified: false,
      location: 'Mamou, Guinée',
    },
    {
      productId: products[0].id,
      author: 'Djenaba Kanté',
      rating: 5,
      title: 'J\'adore la couleur bleu marine !',
      body: "En plus d'être performant, il est magnifique en bleu marine. Mes amis sont jaloux ! Le son est clair, les basses sont profondes sans saturer. Un vrai régal pour les oreilles.",
      verified: true,
      location: 'Conakry, Guinée',
    },
  ]

  const reviews = await db.review.createMany({
    data: reviewsData,
  });

  console.log(`✅ Created ${reviews.count} reviews`)

  // ==================== SAMPLE ORDER ====================
  console.log('Creating sample order...')

  const orderNumber = 'LMA-SEED-SAMPLE-01';

  await db.order.upsert({
    where: { orderNumber },
    update: {},
    create: {
      orderNumber,
      userId: null,
      items: JSON.stringify([
        {
          productId: products[0].id,
          name: products[0].name,
          slug: products[0].slug,
          price: products[0].priceGNF,
          quantity: 1,
          color: 'black',
          image: '/product-images/headphones-main.png',
        },
      ]),
      subtotalGNF: products[0].priceGNF,
      deliveryFeeGNF: 25000,
      totalGNF: products[0].priceGNF + 25000,
      status: 'delivered',
      paymentMethod: 'orange_money',
      deliveryType: 'domicile',
      fullName: 'Aboubacar Diallo',
      phone: '+224 628 12 34 56',
      city: 'Conakry',
      address: 'Cité IPC, Ratoma',
      country: 'GN',
      currency: 'GNF',
      notes: 'Livraison après 14h svp',
    },
  });

  console.log(`✅ Created sample order: ${orderNumber}`)

  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${products.length} products`)
  console.log(`   - ${coupons.length} coupons`)
  console.log(`   - ${reviews.count} reviews`)
  console.log(`   - 1 admin user`)
  console.log(`   - 1 order`)
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
