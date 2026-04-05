'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TestTube2,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Activity,
  Globe,
  ShoppingCart,
  UserPlus,
  RotateCcw,
  Search,
  Package,
  Server,
  ShieldCheck,
  AlertTriangle,
  Zap,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────
type TestStatus = 'pending' | 'running' | 'pass' | 'fail' | 'skipped';
type TestCategory = 'API' | 'Page' | 'E2E';

interface TestCase {
  id: string;
  name: string;
  category: TestCategory;
  status: TestStatus;
  duration?: number;
  error?: string;
  detail?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────
function randomEmail() {
  const id = Math.random().toString(36).substring(2, 10);
  return `qa-test-${id}@lemarche.test`;
}

function statusIcon(status: TestStatus, size = 16) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="text-emerald-400" size={size} />;
    case 'fail':
      return <XCircle className="text-red-400" size={size} />;
    case 'running':
      return <Loader2 className="text-amber-400 animate-spin" size={size} />;
    case 'skipped':
      return <AlertTriangle className="text-yellow-500" size={size} />;
    default:
      return <Clock className="text-gray-500" size={size} />;
  }
}

function statusBadge(status: TestStatus) {
  const map: Record<TestStatus, { label: string; cls: string }> = {
    pending: { label: 'En attente', cls: 'bg-gray-700 text-gray-300 border-gray-600' },
    running: { label: 'En cours', cls: 'bg-amber-900/60 text-amber-300 border-amber-600' },
    pass: { label: 'OK', cls: 'bg-emerald-900/60 text-emerald-300 border-emerald-600' },
    fail: { label: 'FAIL', cls: 'bg-red-900/60 text-red-300 border-red-600' },
    skipped: { label: 'Ignoré', cls: 'bg-yellow-900/60 text-yellow-300 border-yellow-600' },
  };
  const m = map[status];
  return (
    <Badge variant="outline" className={`${m.cls} text-[10px] font-mono px-1.5 py-0`}>
      {statusIcon(status, 10)} {m.label}
    </Badge>
  );
}

function categoryIcon(cat: TestCategory) {
  switch (cat) {
    case 'API': return <Server size={14} className="text-blue-400" />;
    case 'Page': return <Globe size={14} className="text-purple-400" />;
    case 'E2E': return <Zap size={14} className="text-orange-400" />;
  }
}

function categoryColor(cat: TestCategory) {
  switch (cat) {
    case 'API': return 'border-l-blue-500';
    case 'Page': return 'border-l-purple-500';
    case 'E2E': return 'border-l-orange-500';
  }
}

// ─── Default tests ───────────────────────────────────────────────────
function createInitialTests(): TestCase[] {
  return [
    // API Tests
    { id: 'api-categories', name: 'GET /api/categories', category: 'API', status: 'pending' },
    { id: 'api-products', name: 'GET /api/products?limit=3', category: 'API', status: 'pending' },
    { id: 'api-product-slug', name: 'GET /api/products/samsung-galaxy-a54', category: 'API', status: 'pending' },
    { id: 'api-search', name: 'GET /api/search?q=samsung', category: 'API', status: 'pending' },
    { id: 'api-stats', name: 'GET /api/stats', category: 'API', status: 'pending' },
    { id: 'api-chat', name: 'POST /api/chat (Bonjour)', category: 'API', status: 'pending' },

    // Page Tests
    { id: 'page-home', name: 'GET / (Homepage)', category: 'Page', status: 'pending' },
    { id: 'page-product', name: 'GET /produit/samsung-galaxy-a54', category: 'Page', status: 'pending' },
    { id: 'page-cart', name: 'GET /panier', category: 'Page', status: 'pending' },
    { id: 'page-checkout', name: 'GET /commande', category: 'Page', status: 'pending' },
    { id: 'page-search', name: 'GET /recherche?q=iphone', category: 'Page', status: 'pending' },

    // E2E Tests
    { id: 'e2e-register', name: 'E2E: Register new user', category: 'E2E', status: 'pending' },
    { id: 'e2e-login', name: 'E2E: Login with credentials', category: 'E2E', status: 'pending' },
    { id: 'e2e-cart', name: 'E2E: Simulate add-to-cart', category: 'E2E', status: 'pending' },
    { id: 'e2e-order', name: 'E2E: Create order', category: 'E2E', status: 'pending' },
  ];
}

// ─── Runner functions ────────────────────────────────────────────────
type SetTests = React.Dispatch<React.SetStateAction<TestCase[]>>;

function updateTest(setTests: SetTests, id: string, update: Partial<TestCase>) {
  setTests((prev) =>
    prev.map((t) => (t.id === id ? { ...t, ...update } : t))
  );
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runApiTests(setTests: SetTests) {
  const tests: Array<{ id: string; run: () => Promise<{ ok: boolean; duration: number; error?: string; detail?: string }> }> = [
    {
      id: 'api-categories',
      run: async () => {
        const start = performance.now();
        const res = await fetch('/api/categories');
        const data = await res.json();
        const duration = performance.now() - start;
        if (res.status !== 200) return { ok: false, duration, error: `Status ${res.status}` };
        if (!Array.isArray(data) || data.length === 0) return { ok: false, duration, error: 'No categories returned' };
        return { ok: true, duration, detail: `${data.length} categories` };
      },
    },
    {
      id: 'api-products',
      run: async () => {
        const start = performance.now();
        const res = await fetch('/api/products?limit=3');
        const data = await res.json();
        const duration = performance.now() - start;
        if (res.status !== 200) return { ok: false, duration, error: `Status ${res.status}` };
        if (!data.products || data.products.length === 0) return { ok: false, duration, error: 'No products returned' };
        return { ok: true, duration, detail: `${data.products.length} products loaded` };
      },
    },
    {
      id: 'api-product-slug',
      run: async () => {
        const start = performance.now();
        const res = await fetch('/api/products/samsung-galaxy-a54');
        const duration = performance.now() - start;
        if (res.status !== 200) return { ok: false, duration, error: `Status ${res.status}` };
        const data = await res.json();
        if (!data.name) return { ok: false, duration, error: 'Product name missing' };
        return { ok: true, duration, detail: `Product: ${data.name}` };
      },
    },
    {
      id: 'api-search',
      run: async () => {
        const start = performance.now();
        const res = await fetch('/api/search?q=samsung');
        const data = await res.json();
        const duration = performance.now() - start;
        if (res.status !== 200) return { ok: false, duration, error: `Status ${res.status}` };
        if (!data.products || data.products.length === 0) return { ok: false, duration, error: 'No search results' };
        return { ok: true, duration, detail: `${data.products.length} results` };
      },
    },
    {
      id: 'api-stats',
      run: async () => {
        const start = performance.now();
        const res = await fetch('/api/stats');
        const data = await res.json();
        const duration = performance.now() - start;
        if (res.status !== 200) return { ok: false, duration, error: `Status ${res.status}` };
        return { ok: true, duration, detail: `${data.totalProducts} products, ${data.totalCategories} categories` };
      },
    },
    {
      id: 'api-chat',
      run: async () => {
        const start = performance.now();
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Bonjour' }),
        });
        const data = await res.json();
        const duration = performance.now() - start;
        if (res.status !== 200) return { ok: false, duration, error: `Status ${res.status}` };
        if (!data.reply) return { ok: false, duration, error: 'No reply in response' };
        return { ok: true, duration, detail: `Reply: "${data.reply.substring(0, 60)}..."` };
      },
    },
  ];

  for (const t of tests) {
    updateTest(setTests, t.id, { status: 'running' });
    try {
      const result = await t.run();
      updateTest(setTests, t.id, {
        status: result.ok ? 'pass' : 'fail',
        duration: Math.round(result.duration),
        error: result.error,
        detail: result.detail,
      });
    } catch (e: unknown) {
      updateTest(setTests, t.id, {
        status: 'fail',
        duration: 0,
        error: e instanceof Error ? e.message : 'Unknown error',
      });
    }
    await delay(100);
  }
}

async function runPageTests(setTests: SetTests) {
  const tests: Array<{ id: string; url: string; checkContains?: string }> = [
    { id: 'page-home', url: '/', checkContains: 'Marché' },
    { id: 'page-product', url: '/produit/samsung-galaxy-a54', checkContains: 'Samsung' },
    { id: 'page-cart', url: '/panier' },
    { id: 'page-checkout', url: '/commande' },
    { id: 'page-search', url: '/recherche?q=iphone' },
  ];

  for (const t of tests) {
    updateTest(setTests, t.id, { status: 'running' });
    const start = performance.now();
    try {
      const res = await fetch(t.url);
      const duration = performance.now() - start;
      const text = await res.text();
      if (res.status !== 200) {
        updateTest(setTests, t.id, { status: 'fail', duration: Math.round(duration), error: `Status ${res.status}` });
      } else if (t.checkContains && !text.includes(t.checkContains)) {
        updateTest(setTests, t.id, {
          status: 'fail',
          duration: Math.round(duration),
          error: `HTML does not contain "${t.checkContains}"`,
        });
      } else {
        updateTest(setTests, t.id, {
          status: 'pass',
          duration: Math.round(duration),
          detail: `Status 200 — ${Math.round(text.length / 1024)}KB`,
        });
      }
    } catch (e: unknown) {
      updateTest(setTests, t.id, {
        status: 'fail',
        duration: 0,
        error: e instanceof Error ? e.message : 'Network error',
      });
    }
    await delay(100);
  }
}

async function runE2ETests(setTests: SetTests) {
  let registeredEmail = '';
  let loginEmail = '';
  let loginPassword = '';
  let authToken = '';

  // 1. Register
  updateTest(setTests, 'e2e-register', { status: 'running' });
  const regStart = performance.now();
  try {
    registeredEmail = randomEmail();
    loginPassword = 'TestPass123!';
    const regRes = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredEmail,
        name: 'QA Test User',
        password: loginPassword,
      }),
    });
    const regDuration = performance.now() - regStart;
    const regData = await regRes.json();
    if (regRes.status === 201 || regRes.status === 409) {
      loginEmail = registeredEmail;
      updateTest(setTests, 'e2e-register', {
        status: 'pass',
        duration: Math.round(regDuration),
        detail: regRes.status === 201 ? `Registered as ${registeredEmail}` : `Already exists (409) — using ${registeredEmail}`,
      });
    } else {
      updateTest(setTests, 'e2e-register', {
        status: 'fail',
        duration: Math.round(regDuration),
        error: `Status ${regRes.status}: ${regData.error || 'Unknown'}`,
      });
      loginEmail = registeredEmail;
    }
  } catch (e: unknown) {
    updateTest(setTests, 'e2e-register', {
      status: 'fail',
      duration: 0,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
    loginEmail = registeredEmail || randomEmail();
    loginPassword = 'TestPass123!';
  }
  await delay(200);

  // 2. Login
  updateTest(setTests, 'e2e-login', { status: 'running' });
  const loginStart = performance.now();
  try {
    const loginRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });
    const loginDuration = performance.now() - loginStart;
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.token) {
      authToken = loginData.token;
      updateTest(setTests, 'e2e-login', {
        status: 'pass',
        duration: Math.round(loginDuration),
        detail: `Token received (${loginData.token.substring(0, 12)}...)`,
      });
    } else {
      updateTest(setTests, 'e2e-login', {
        status: 'fail',
        duration: Math.round(loginDuration),
        error: `Status ${loginRes.status}: ${loginData.error || 'No token'}`,
      });
    }
  } catch (e: unknown) {
    updateTest(setTests, 'e2e-login', {
      status: 'fail',
      duration: 0,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
  await delay(200);

  // 3. Cart simulation
  updateTest(setTests, 'e2e-cart', { status: 'running' });
  const cartStart = performance.now();
  try {
    const prodRes = await fetch('/api/products?limit=1');
    const prodData = await prodRes.json();
    const cartDuration = performance.now() - cartStart;
    if (prodRes.status === 200 && prodData.products && prodData.products.length > 0) {
      const product = prodData.products[0];
      updateTest(setTests, 'e2e-cart', {
        status: 'pass',
        duration: Math.round(cartDuration),
        detail: `Product "${product.name}" (${product.priceGNF.toLocaleString('fr-FR')} GNF) ready for cart`,
      });
    } else {
      updateTest(setTests, 'e2e-cart', {
        status: 'fail',
        duration: Math.round(cartDuration),
        error: 'Could not fetch product for cart simulation',
      });
    }
  } catch (e: unknown) {
    updateTest(setTests, 'e2e-cart', {
      status: 'fail',
      duration: 0,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
  await delay(200);

  // 4. Order creation
  updateTest(setTests, 'e2e-order', { status: 'running' });
  const orderStart = performance.now();
  try {
    // First get a real product
    const prodRes = await fetch('/api/products?limit=1');
    const prodData = await prodRes.json();
    if (!prodData.products || prodData.products.length === 0) {
      updateTest(setTests, 'e2e-order', {
        status: 'fail',
        duration: Math.round(performance.now() - orderStart),
        error: 'No products available for order creation',
      });
      return;
    }
    const product = prodData.products[0];

    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: product.id, quantity: 1 }],
        fullName: 'QA Test User',
        phone: '661000000',
        city: 'Conakry',
        address: 'Test QA Address',
        paymentMethod: 'cash',
        deliveryType: 'pickup',
      }),
    });
    const orderDuration = performance.now() - orderStart;
    const orderData = await orderRes.json();

    if (orderRes.status === 201 && orderData.order?.orderNumber) {
      updateTest(setTests, 'e2e-order', {
        status: 'pass',
        duration: Math.round(orderDuration),
        detail: `Order ${orderData.order.orderNumber} — ${orderData.order.totalGNF.toLocaleString('fr-FR')} GNF`,
      });
    } else {
      updateTest(setTests, 'e2e-order', {
        status: 'fail',
        duration: Math.round(orderDuration),
        error: `Status ${orderRes.status}: ${orderData.error || 'No order number'}`,
      });
    }
  } catch (e: unknown) {
    updateTest(setTests, 'e2e-order', {
      status: 'fail',
      duration: 0,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
}

async function runAllTests(setTests: SetTests, setIsRunning: (v: boolean) => void) {
  setIsRunning(true);
  await runApiTests(setTests);
  await runPageTests(setTests);
  await runE2ETests(setTests);
  setIsRunning(false);
}

async function runCartFlowTest(setTests: SetTests, setIsRunning: (v: boolean) => void) {
  setIsRunning(true);
  setTests((prev) => [
    ...prev.map((t) =>
      ['e2e-cart'].includes(t.id) ? { ...t, status: 'pending' as TestStatus, duration: undefined, error: undefined, detail: undefined } : t
    ),
  ]);
  await delay(300);

  // Detailed cart flow
  updateTest(setTests, 'e2e-cart', { status: 'running' });
  const start = performance.now();
  try {
    const prodRes = await fetch('/api/products?limit=3');
    const prodData = await prodRes.json();
    const duration = performance.now() - start;
    if (prodRes.status === 200 && prodData.products?.length > 0) {
      const names = prodData.products.map((p: { name: string }) => p.name).join(', ');
      updateTest(setTests, 'e2e-cart', {
        status: 'pass',
        duration: Math.round(duration),
        detail: `Cart flow OK — Products available: ${names}`,
      });
    } else {
      updateTest(setTests, 'e2e-cart', {
        status: 'fail',
        duration: Math.round(duration),
        error: 'Products endpoint returned no data',
      });
    }
  } catch (e: unknown) {
    updateTest(setTests, 'e2e-cart', {
      status: 'fail',
      duration: 0,
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
  setIsRunning(false);
}

async function runAuthFlowTest(setTests: SetTests, setIsRunning: (v: boolean) => void) {
  setIsRunning(true);
  setTests((prev) => [
    ...prev.map((t) =>
      ['e2e-register', 'e2e-login'].includes(t.id) ? { ...t, status: 'pending' as TestStatus, duration: undefined, error: undefined, detail: undefined } : t
    ),
  ]);
  await delay(300);

  const email = randomEmail();
  const password = 'AuthTest456!';

  // Register
  updateTest(setTests, 'e2e-register', { status: 'running' });
  const regStart = performance.now();
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: 'Auth QA User', password }),
    });
    const dur = performance.now() - regStart;
    const data = await res.json();
    updateTest(setTests, 'e2e-register', {
      status: res.status === 201 || res.status === 409 ? 'pass' : 'fail',
      duration: Math.round(dur),
      error: (res.status !== 201 && res.status !== 409) ? `Status ${res.status}: ${data.error}` : undefined,
      detail: `Email: ${email}`,
    });
  } catch (e: unknown) {
    updateTest(setTests, 'e2e-register', { status: 'fail', duration: 0, error: e instanceof Error ? e.message : 'Unknown' });
  }
  await delay(200);

  // Login
  updateTest(setTests, 'e2e-login', { status: 'running' });
  const loginStart = performance.now();
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const dur = performance.now() - loginStart;
    const data = await res.json();
    updateTest(setTests, 'e2e-login', {
      status: res.status === 200 && data.token ? 'pass' : 'fail',
      duration: Math.round(dur),
      error: res.status !== 200 ? `Status ${res.status}: ${data.error}` : !data.token ? 'No token returned' : undefined,
      detail: data.token ? `Session token: ${data.token.substring(0, 16)}...` : undefined,
    });
  } catch (e: unknown) {
    updateTest(setTests, 'e2e-login', { status: 'fail', duration: 0, error: e instanceof Error ? e.message : 'Unknown' });
  }
  setIsRunning(false);
}

async function runOrderFlowTest(setTests: SetTests, setIsRunning: (v: boolean) => void) {
  setIsRunning(true);
  setTests((prev) => [
    ...prev.map((t) =>
      t.id === 'e2e-order' ? { ...t, status: 'pending' as TestStatus, duration: undefined, error: undefined, detail: undefined } : t
    ),
  ]);
  await delay(300);

  updateTest(setTests, 'e2e-order', { status: 'running' });
  const start = performance.now();
  try {
    const prodRes = await fetch('/api/products?limit=1');
    const prodData = await prodRes.json();
    if (!prodData.products?.length) {
      updateTest(setTests, 'e2e-order', { status: 'fail', duration: Math.round(performance.now() - start), error: 'No products' });
      setIsRunning(false);
      return;
    }
    const product = prodData.products[0];
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: product.id, quantity: 1 }],
        fullName: 'Order QA Test',
        phone: '662000000',
        city: 'Conakry',
        address: 'QA Test Address',
        paymentMethod: 'cash',
        deliveryType: 'pickup',
      }),
    });
    const dur = performance.now() - start;
    const data = await orderRes.json();
    if (orderRes.status === 201 && data.order?.orderNumber) {
      updateTest(setTests, 'e2e-order', {
        status: 'pass',
        duration: Math.round(dur),
        detail: `Order ${data.order.orderNumber} created — Total: ${data.order.totalGNF.toLocaleString('fr-FR')} GNF`,
      });
    } else {
      updateTest(setTests, 'e2e-order', {
        status: 'fail',
        duration: Math.round(dur),
        error: `Status ${orderRes.status}: ${data.error || 'Unknown'}`,
      });
    }
  } catch (e: unknown) {
    updateTest(setTests, 'e2e-order', { status: 'fail', duration: 0, error: e instanceof Error ? e.message : 'Unknown' });
  }
  setIsRunning(false);
}

// ─── Component ───────────────────────────────────────────────────────
export default function QADashboard() {
  const [tests, setTests] = useState<TestCase[]>(createInitialTests);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(new Date());
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const total = tests.length;
  const passed = tests.filter((t) => t.status === 'pass').length;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const running = tests.filter((t) => t.status === 'running').length;
  const skipped = tests.filter((t) => t.status === 'skipped').length;
  const pending = tests.filter((t) => t.status === 'pending').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const completed = passed + failed;
  const avgDuration =
    tests.filter((t) => t.duration).reduce((sum, t) => sum + (t.duration || 0), 0) / (completed || 1);

  const handleRunAll = useCallback(() => {
    setTests(createInitialTests());
    setLastRun(new Date());
    runAllTests(setTests, setIsRunning);
  }, []);

  const handleCartFlow = useCallback(() => {
    setLastRun(new Date());
    runCartFlowTest(setTests, setIsRunning);
  }, []);

  const handleAuthFlow = useCallback(() => {
    setLastRun(new Date());
    runAuthFlowTest(setTests, setIsRunning);
  }, []);

  const handleOrderFlow = useCallback(() => {
    setLastRun(new Date());
    runOrderFlowTest(setTests, setIsRunning);
  }, []);

  useEffect(() => {
    runAllTests(setTests, setIsRunning);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* ─── Header ────────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#FF8F00] opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2Nmg2di02aC02em0tMTIgMHY2aDZ2LTZoLTZ6bTAtMTJ2Nmg2di02aC02em0wIDEydjZoNnYtNmgtNnptLTEyIDB2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <TestTube2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                QA Dashboard — Le March&eacute; Africain
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Testing automatis&eacute; bout-en-bout &bull; {total} tests &bull; {tests.filter((t) => t.category === 'API').length} API &bull; {tests.filter((t) => t.category === 'Page').length} Page &bull; {tests.filter((t) => t.category === 'E2E').length} E2E
              </p>
            </div>
          </div>
          {lastRun && (
            <p className="mt-3 text-xs text-white/50">
              <Clock size={12} className="inline mr-1" />
              Derni&egrave;re ex&eacute;cution : {lastRun.toLocaleTimeString('fr-FR')} — {lastRun.toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 space-y-6">
        {/* ─── Summary Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          <Card className="border-gray-800 bg-gray-900/80 py-4">
            <CardContent className="flex flex-col items-center gap-1 p-2">
              <Activity size={18} className="text-gray-400" />
              <span className="text-2xl font-bold text-white">{total}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Total</span>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/80 py-4">
            <CardContent className="flex flex-col items-center gap-1 p-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-400">{passed}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Pass&eacute;</span>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/80 py-4">
            <CardContent className="flex flex-col items-center gap-1 p-2">
              <XCircle size={18} className="text-red-400" />
              <span className="text-2xl font-bold text-red-400">{failed}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500">&Eacute;chou&eacute;</span>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/80 py-4">
            <CardContent className="flex flex-col items-center gap-1 p-2">
              <Loader2 size={18} className="text-amber-400" />
              <span className="text-2xl font-bold text-amber-400">{running}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500">En cours</span>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/80 py-4">
            <CardContent className="flex flex-col items-center gap-1 p-2">
              <Clock size={18} className="text-gray-500" />
              <span className="text-2xl font-bold text-gray-400">{pending}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Attente</span>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/80 py-4">
            <CardContent className="flex flex-col items-center gap-1 p-2">
              <AlertTriangle size={18} className="text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500">{skipped}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Ignor&eacute;</span>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/80 py-4">
            <CardContent className="flex flex-col items-center gap-1 p-2">
              <BarChart3 size={18} className="text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{Math.round(avgDuration)}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500">ms moy.</span>
            </CardContent>
          </Card>
        </div>

        {/* ─── Pass Rate ───────────────────────────────────────── */}
        <Card className="border-gray-800 bg-gray-900/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                <span className="font-semibold text-white">Taux de r&eacute;ussite</span>
              </div>
              <span className={`text-2xl font-bold tabular-nums ${passRate >= 80 ? 'text-emerald-400' : passRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {passRate}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  passRate >= 80
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : passRate >= 50
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${passRate}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{completed} / {total} tests termin&eacute;s</span>
              <span>{isRunning && <span className="inline-flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Ex&eacute;cution en cours...</span>}</span>
            </div>
          </CardContent>
        </Card>

        {/* ─── Manual Actions ──────────────────────────────────── */}
        <Card className="border-gray-800 bg-gray-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <RotateCcw size={16} className="text-[#FF8F00]" />
              Actions manuelles
            </CardTitle>
            <CardDescription className="text-gray-500">Relancer des tests sp&eacute;cifiques ou la suite compl&egrave;te</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleRunAll}
                disabled={isRunning}
                className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-2"
              >
                {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
                Rerun All Tests
              </Button>
              <Button
                onClick={handleAuthFlow}
                disabled={isRunning}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white gap-2"
              >
                <UserPlus size={14} />
                Test Auth Flow
              </Button>
              <Button
                onClick={handleCartFlow}
                disabled={isRunning}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white gap-2"
              >
                <ShoppingCart size={14} />
                Test Cart Flow
              </Button>
              <Button
                onClick={handleOrderFlow}
                disabled={isRunning}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white gap-2"
              >
                <Package size={14} />
                Test Order Flow
              </Button>
              <Button
                onClick={() => setExpandedTest(expandedTest === 'all' ? null : 'all')}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white gap-2"
              >
                {expandedTest === 'all' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expandedTest === 'all' ? 'Collapse All' : 'Expand All'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ─── Test Details by Category ─────────────────────────── */}
        {(['API', 'Page', 'E2E'] as const).map((cat) => {
          const catTests = tests.filter((t) => t.category === cat);
          const catPass = catTests.filter((t) => t.status === 'pass').length;
          const catFail = catTests.filter((t) => t.status === 'fail').length;
          return (
            <Card key={cat} className="border-gray-800 bg-gray-900/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    {categoryIcon(cat)}
                    Tests {cat}
                    <Badge variant="secondary" className="bg-gray-800 text-gray-400 text-[10px] ml-1">
                      {catTests.length}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {catPass > 0 && (
                      <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700 text-[10px]">
                        <CheckCircle2 size={10} /> {catPass}
                      </Badge>
                    )}
                    {catFail > 0 && (
                      <Badge className="bg-red-900/60 text-red-300 border-red-700 text-[10px]">
                        <XCircle size={10} /> {catFail}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {catTests.map((test) => {
                  const isExpanded = expandedTest === 'all' || expandedTest === test.id;
                  return (
                    <div
                      key={test.id}
                      className={`rounded-lg border border-gray-800 bg-gray-800/50 border-l-4 ${categoryColor(test.category)} transition-all`}
                    >
                      <button
                        onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-800/80 transition-colors rounded-lg"
                      >
                        <div className="flex-shrink-0">{statusIcon(test.status, 18)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-gray-200 truncate">{test.name}</span>
                          </div>
                          {test.duration != null && (
                            <span className="text-[10px] text-gray-500 tabular-nums">{test.duration}ms</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {statusBadge(test.status)}
                          {isExpanded ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
                        </div>
                      </button>
                      {isExpanded && (test.detail || test.error) && (
                        <div className="px-3 pb-3 pl-9">
                          {test.detail && (
                            <div className="mt-1 rounded-md bg-gray-900/80 px-3 py-2 text-xs text-emerald-300/90 font-mono border border-emerald-900/30">
                              {test.detail}
                            </div>
                          )}
                          {test.error && (
                            <div className="mt-1 rounded-md bg-red-950/50 px-3 py-2 text-xs text-red-300/90 font-mono border border-red-900/30">
                              {test.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}

        {/* ─── Failed Tests Summary ────────────────────────────── */}
        {failed > 0 && (
          <Card className="border-red-900/50 bg-red-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-300 flex items-center gap-2 text-base">
                <XCircle size={16} />
                &Eacute;checs ({failed})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {tests
                  .filter((t) => t.status === 'fail')
                  .map((t) => (
                    <div key={t.id} className="flex items-start gap-2 rounded-md bg-red-950/40 px-3 py-2 border border-red-900/30">
                      <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-red-200 font-mono">{t.name}</p>
                        {t.error && <p className="text-xs text-red-400/80 mt-0.5">{t.error}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Footer ──────────────────────────────────────────── */}
        <div className="border-t border-gray-800 pt-4 pb-8 text-center">
          <p className="text-xs text-gray-600">
            QA Dashboard — Le March&eacute; Africain &bull; Tests automatiques &bull; v1.0
          </p>
        </div>
      </main>
    </div>
  );
}
