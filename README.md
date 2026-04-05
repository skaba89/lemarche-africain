<p align="center">
  <h1 align="center">
    <img src="https://img.shields.io/badge/Le%20March%C3%A9%20Africain-1B5E20?style=for-the-badge&logoColor=white&labelColor=FF8F00" alt="Le Marché Africain" />
  </h1>
  <p align="center">
    <strong>La #1 marketplace en ligne d'Afrique de l'Ouest</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square&logo=framer" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker" />
    <br>
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  </p>
</p>

---

## Table des matières

- [Apercu](#apercu)
- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Demarrage rapide](#demarrage-rapide)
- [Deploiement](#deploiement)
  - [Docker (recommande)](#docker)
  - [Render](#render)
  - [Railway](#railway)
  - [Fly.io](#flyio)
- [Configuration](#configuration)
- [Structure du projet](#structure-du-projet)
- [API](#api)
- [Compte admin](#compte-admin)
- [Licence](#licence)

---

## Apercu

**Le Marche Africain** est une marketplace e-commerce complete, inspiree d'Amazon et Cdiscount, concue pour le marche africain et plus particulierement la Guinee.

- 16 produits dans 6 categories (electronique, telephones, informatique, maison, accessoires, sport)
- Support multidevise : GNF, XOF, XAF, USD, EUR
- Paiements mobiles africains : Orange Money, MTN MoMo, Wave, Cash
- Interface 100% en francais
- Dark mode complet
- Design responsive mobile-first
- PWA (Progressive Web App)

---

## Fonctionnalites

### E-commerce
- Catalogue produits avec recherche avancee et filtres
- Panier persistant (localStorage + Zustand)
- Checkout multi-etapes (3 etapes avec barre de progression)
- Gestion des coupons de reduction
- Suivi de commande avec timeline
- Facture telechargeable
- Commander a nouveau (Buy Again)

### UX / Design
- Dark mode complet sur toutes les pages
- Animations Framer Motion
- Barre de progression de scroll
- Navigation mobile avec bottom bar
- Apercu rapide des produits (Quick View)
- Comparaison produits (jusqu'a 4)
- Notifications de rupture de stock
- Produits recemment consultes

### Securite
- Authentification par session (HTTP-only cookie)
- Rate limiting sur tous les endpoints sensibles
- Sanitisation des entrees utilisateur
- Protection admin avec garde de role
- Mots de passe hashes (bcrypt)

### Fidelite
- Programme de points (Bronze → Platinum)
- Reductions echangeables contre des points
- Historique des points

### AI
- Chat support client integre (SDK IA)
- Reponses de secours contextuelles

### SEO / PWA
- JSON-LD (Product, Breadcrumb, Organization, WebSite)
- Sitemap.xml dynamique
- robots.txt
- Balises meta OG / Twitter
- Manifest PWA + Service Worker
- Install prompt PWA

---

## Stack technique

| Categorie | Technologie |
|-----------|-------------|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript 5 |
| Stylisme | Tailwind CSS 4 + shadcn/ui |
| Animations | Framer Motion 12 |
| Base de donnees | SQLite via Prisma 6 |
| State client | Zustand 5 |
| Auth | Session HTTP-only cookie + bcrypt |
| Forms | React Hook Form |
| Icons | Lucide React |
| Charts | Recharts |
| Notifications | Sonner |

---

## Demarrage rapide

### Prerequis

- [Node.js](https://nodejs.org/) 20+ ou [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (optionnel)

### Installation

```bash
# Cloner le depot
git clone https://github.com/skaba89/lemarche-africain.git
cd lemarche-africain

# Installer les dependances
bun install

# Initialiser la base de donnees
bun run db:push
bun run seed

# Lancer le serveur de developpement
bun run dev
```

L'application est disponible sur **http://localhost:3000**.

### Avec Docker (uniquement)

```bash
# Builder et lancer (production)
docker compose up --build

# Ou en mode developpement avec hot-reload
docker compose -f docker-compose.dev.yml up --build
```

---

## Deploiement

### Docker

```bash
# Builder l'image
docker build -t lemarche-africain .

# Lancer
docker run -p 3000:3000 -v lemarche-data:/app/db lemarche-africain

# Initialiser la base de donnees (une seule fois)
docker exec <container_id> sh -c "npx prisma db push && npx prisma db seed"
```

### Render

1. Creer un compte sur [render.com](https://render.com)
2. Cliquer sur **New** > **Web Service**
3. Connecter le depot GitHub `skaba89/lemarche-africain`
4. Configurer :
   - **Build Command** : `docker build -t lemarche .`
   - **Start Command** : `node server.js`
   - **Environment** : `NODE_ENV=production`
5. Deployer

> Render offre un **plan gratuit** avec 512 MB RAM.

### Railway

1. Creer un compte sur [railway.app](https://railway.app)
2. Cliquer sur **New Project** > **Deploy from GitHub repo**
3. Selectionner `skaba89/lemarche-africain`
4. Ajouter les variables d'environnement
5. Deployer

> Railway offre **5$ de credit gratuit** par mois.

### Fly.io

1. Installer flyctl : `curl -L https://fly.io/install.sh | sh`
2. Authentifier : `fly auth login`
3. Lancer : `fly launch` et suivre les instructions
4. Deployer : `fly deploy`

> Fly.io offre un **plan gratuit** avec 3 machines shared CPU.

---

## Configuration

### Variables d'environnement

| Variable | Description | Defaut |
|----------|-------------|--------|
| `DATABASE_URL` | URL de la base de donnees SQLite | `file:/app/db/custom.db` |
| `NODE_ENV` | Environnement | `development` |
| `PORT` | Port du serveur | `3000` |

### Compte admin

Le compte administrateur est cree automatiquement lors du seed :

| Champ | Valeur |
|-------|--------|
| Email | `admin@lemarcheafricain.com` |
| Mot de passe | `Admin123!` |

### Coupons de test

| Code | Reduction | Conditions |
|------|-----------|------------|
| `AFRI50` | 50% | Min. 500 000 GNF |
| `PREMIER15` | 15% | Min. 100 000 GNF |
| `LIVRAISON` | Livraison gratuite | Min. 200 000 GNF |

---

## Structure du projet

```
lemarche-africain/
├── public/                    # Assets statiques
│   ├── product-images/        # 36 images produits (IA)
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── robots.txt              # SEO robots
├── prisma/
│   ├── schema.prisma           # Schema SQLite (6 modeles)
│   └── seed.ts                 # Donnees initiales
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── api/                # 31 routes API
│   │   ├── produit/[slug]/     # Page produit
│   │   ├── commande/           # Checkout + confirmation
│   │   ├── panier/             # Panier
│   │   ├── compte/             # Compte utilisateur
│   │   ├── recherche/          # Recherche + filtres
│   │   ├── aide/               # FAQ / Aide
│   │   └── page.tsx            # Page d'accueil
│   ├── components/
│   │   ├── ui/                 # 47 composants shadcn/ui
│   │   ├── product/            # 14 composants produit
│   │   ├── layout/             # Header, Footer, ScrollProgress
│   │   ├── auth/               # AuthModal
│   │   ├── chat/               # ChatWidget IA
│   │   ├── loyalty/            # LoyaltyCard
│   │   ├── admin/              # AdminDashboard
│   │   └── motion/             # Animations FadeIn
│   ├── store/                  # 7 stores Zustand
│   ├── lib/                    # Utilitaires, DB, rate-limit
│   └── middleware.ts           # Next.js middleware
├── Dockerfile                  # Production (multi-stage)
├── Dockerfile.dev              # Developpement
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Dev compose
└── package.json
```

---

## API

L'application expose **31 endpoints API REST** :

### Authentification
| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Deconnexion |
| GET | `/api/auth/me` | Utilisateur courant |

### Produits
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/products` | Liste (filtres, pagination) |
| GET | `/api/products/[slug]` | Detail produit |
| GET | `/api/products/compare` | Comparer des produits |
| POST | `/api/products/notify` | Notification stock |

### Commandes
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/orders` | Commandes par telephone |
| POST | `/api/orders` | Creer une commande |
| GET | `/api/orders/[orderNumber]` | Detail commande |
| GET | `/api/orders/[orderNumber]/invoice` | Facture |
| PATCH | `/api/orders/[orderNumber]/status` | Mettre a jour le statut |

### Administration
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admin/products` | Liste produits admin |
| PATCH | `/api/admin/products/[id]` | Modifier un produit |
| GET | `/api/admin/orders` | Liste commandes admin |
| GET | `/api/admin/stats` | Statistiques dashboard |

---

## Licence

Ce projet est sous licence MIT. Libre de l'utiliser, le modifier et le distribuer.

---

<p align="center">
  <img src="https://img.shields.io/badge/fait_avec_%E2%9D%A4_en_Guin%C3%A9e-1B5E20?style=for-the-badge" alt="Made in Guinea" />
  <br>
  <strong>Le Marche Africain</strong> &mdash; Le commerce en ligne, a l'africaine.
</p>
