import { lazy, Suspense, useEffect, useMemo, useState, useRef, createContext, useContext, type ComponentType, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import {
  AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bell, Box, Boxes, Check, CheckCircle2, ChevronDown, ChevronUp, CircleHelp, ClipboardList,
  CreditCard, Download, FileText, Globe2, Heart, History, Home, LayoutDashboard, ListFilter,
  LockKeyhole, LogOut, Menu, Package, PackageCheck, Pencil, Plus, Receipt, RefreshCw, Search, Settings, ShieldCheck, ShoppingBag, ShoppingCart,
  SlidersHorizontal, Sparkles, Tag, Truck, UserRound, Users, Wallet, X, ScanLine, Clock3,
} from 'lucide-react';
import NotFound from '@/pages/not-found';
import { formatDa, opsStats, orderProductIds, orders, products, type Product } from '@/lib/mock-service';
import { categoryName, createTranslator, orderDate, productName, statusText, type Lang, type Translate, type TranslationKey } from '@/lib/i18n';
import { BrandMark } from '@/components/brand-mark';
import { EmptyState } from '@/components/plazza-ui';
import { SeoHead } from '@/components/seo-head';

const CustomerAftercareSurface = lazy(() => import('@/components/coverage-surfaces').then(({ CustomerAftercareSurface: Component }) => ({ default: Component })));
const CustomerAccountSurface = lazy(() => import('@/components/coverage-surfaces').then(({ CustomerAccountSurface: Component }) => ({ default: Component })));
const CustomerAuthSurface = lazy(() => import('@/components/coverage-surfaces').then(({ CustomerAuthSurface: Component }) => ({ default: Component })));
const EnhancedCartSurface = lazy(() => import('@/components/coverage-surfaces').then(({ EnhancedCartSurface: Component }) => ({ default: Component })));
const ProfessionalCheckoutSurface = lazy(() => import('@/components/professional-surfaces').then(({ ProfessionalCheckoutSurface: Component }) => ({ default: Component })));
const ProfessionalConfirmationSurface = lazy(() => import('@/components/professional-surfaces').then(({ ProfessionalConfirmationSurface: Component }) => ({ default: Component })));
const ProfessionalOperationsSurface = lazy(() => import('@/components/professional-surfaces').then(({ ProfessionalOperationsSurface: Component }) => ({ default: Component })));
const ProfessionalProductSurface = lazy(() => import('@/components/professional-surfaces').then(({ ProfessionalProductSurface: Component }) => ({ default: Component })));

const queryClient = new QueryClient();
type Mode = 'store' | 'ops';
type OpsTheme = 'theme1' | 'theme2';
type CartLine = { product: Product; quantity: number };
type NavIcon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
const I18nContext = createContext<{ lang: Lang; t: Translate }>({ lang: 'fr', t: createTranslator('fr') });
const useI18n = () => useContext(I18nContext);
const DEMO_OPS_CREDENTIALS = { email: 'ops@plazza.dz', password: 'PlazzaOps2026!' } as const;
const inlineCopy = (lang: Lang, fr: string, ar: string) => lang === 'ar' ? ar : fr;

const storeLinks: Array<[string, string, NavIcon]> = [
  ['store', '/shop', ShoppingBag], ['categories', '/categories', ListFilter],
  ['promotions', '/promotions', Tag], ['delivery', '/delivery', Truck],
];
const opsGroups: Array<{ label: TranslationKey; items: Array<[TranslationKey, string, NavIcon]> }> = [
  { label: 'work', items: [['overview', '/ops/dashboard', LayoutDashboard], ['orders', '/ops/orders', ClipboardList], ['customers', '/ops/customers', Users]] },
  { label: 'catalogue', items: [['products', '/ops/products', Package], ['categories', '/ops/categories', ListFilter], ['coupons', '/ops/coupons', Tag]] },
  { label: 'stock', items: [['inventory', '/ops/inventory', Box], ['movements', '/ops/movements', History], ['purchasing', '/ops/purchasing', Download], ['receiving', '/ops/receiving', PackageCheck], ['batches', '/ops/batches', Boxes]] },
  { label: 'flow', items: [['delivery', '/ops/delivery', Truck], ['returns', '/ops/returns', RefreshCw], ['exchanges', '/ops/exchanges', RefreshCw], ['refunds', '/ops/refunds', Receipt], ['pos', '/ops/pos', CreditCard], ['cash', '/ops/cash', Wallet]] },
  { label: 'finance', items: [['finance', '/ops/finance', Wallet], ['expenses', '/ops/expenses', Receipt], ['profitability', '/ops/profitability', BarChart3], ['reports', '/ops/reports', BarChart3]] },
  { label: 'control', items: [['team', '/ops/staff', Users], ['roles', '/ops/roles', ShieldCheck], ['notifications', '/ops/notifications', Bell], ['audit', '/ops/audit', History], ['settings', '/ops/settings', Settings]] },
];

function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const requested = new URLSearchParams(window.location.search).get('lang');
    if (requested === 'ar' || requested === 'fr') return requested;
    return (window.localStorage.getItem('plazza-lang') as Lang) || 'fr';
  });
  const [mode, setMode] = useState<Mode>(() => window.location.pathname.startsWith('/ops') ? 'ops' : 'store');
  const [opsAuthenticated, setOpsAuthenticated] = useState(() => window.localStorage.getItem('plazza-ops-session') === 'active');
  const [opsTheme, setOpsTheme] = useState<OpsTheme>(() => window.localStorage.getItem('plazza-ops-theme') === 'theme2' ? 'theme2' : 'theme1');
  const [customerAuthenticated, setCustomerAuthenticated] = useState(() => window.localStorage.getItem('plazza-customer-session') === 'active');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const t = useMemo(() => createTranslator(lang), [lang]);
  useEffect(() => {
    window.localStorage.setItem('plazza-lang', lang);
    document.documentElement.lang = lang === 'ar' ? 'ar-DZ' : 'fr-DZ';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);
  useEffect(() => {
    window.localStorage.setItem('plazza-ops-theme', opsTheme);
  }, [opsTheme]);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const addToCart = (product: Product) => {
    setCart((current) => current.some((line) => line.product.id === product.id)
      ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line)
      : [...current, { product, quantity: 1 }]);
    setNotice(t('productAdded'));
    window.setTimeout(() => setNotice(''), 2200);
  };
  const updateQuantity = (id: string, change: number) => setCart((current) => current.flatMap((line) => line.product.id === id
    ? line.quantity + change <= 0 ? [] : [{ ...line, quantity: line.quantity + change }]
    : [line]));
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <I18nContext.Provider value={{ lang, t }}>
            <div className={`grain min-h-[100dvh] ${dir === 'rtl' ? 'rtl' : ''}`} dir={dir}>
              <SeoHead lang={lang} />
              {mode === 'store'
                 ? <StoreHeader setLang={setLang} customerAuthenticated={customerAuthenticated} cartCount={cartCount} onCart={() => setCartOpen(true)} />
                 : <OpsHeader setLang={setLang} setMode={setMode} authenticated={opsAuthenticated} theme={opsTheme} setTheme={setOpsTheme} onSignOut={() => { window.localStorage.removeItem('plazza-ops-session'); setOpsAuthenticated(false); setMode('store'); }} />}
              {notice && <div className="fixed top-20 left-1/2 z-40 -translate-x-1/2 animate-rise rounded-full bg-[hsl(var(--secondary))] px-4 py-2 text-xs font-semibold text-[hsl(var(--secondary-foreground))] shadow-xl" role="status" data-testid="status-cart-feedback">{notice}</div>}
              <RoutedErrorBoundary>
                <Suspense fallback={<RouteLoading lang={lang} />}>
                  <Switch>
                  <Route path="/" component={() => <HomePage addToCart={addToCart} />} />
                  <Route path="/shop" component={() => <ShopPage addToCart={addToCart} />} />
                  <Route path="/shop/:id" component={() => <ProfessionalProductSurface lang={lang} addToCart={addToCart} />} />
                  <Route path="/categories" component={() => <ShopPage addToCart={addToCart} categoryMode />} />
                  <Route path="/search" component={() => <ShopPage addToCart={addToCart} searchMode />} />
                  <Route path="/promotions" component={() => <PromotionsPage />} />
                  <Route path="/cart" component={() => <EnhancedCartSurface lang={lang} cart={cart} updateQuantity={updateQuantity} />} />
                  <Route path="/checkout" component={() => <ProfessionalCheckoutSurface lang={lang} cart={cart} />} />
                  <Route path="/confirmation" component={() => <ProfessionalConfirmationSurface lang={lang} />} />
                  <Route path="/login" component={() => <CustomerAuthSurface kind="login" lang={lang} onAuthenticated={() => setCustomerAuthenticated(true)} />} />
                  <Route path="/register" component={() => <CustomerAuthSurface kind="register" lang={lang} onAuthenticated={() => setCustomerAuthenticated(true)} />} />
                  <Route path="/recover" component={() => <CustomerAuthSurface kind="recover" lang={lang} />} />
                  <Route path="/verify" component={() => <CustomerAuthSurface kind="verify" lang={lang} />} />
                  <Route path="/account" component={() => <CustomerAccountSurface lang={lang} onSignOut={() => setCustomerAuthenticated(false)} />} />
                  <Route path="/account/profile" component={() => <CustomerAccountSurface lang={lang} page="profile" onSignOut={() => setCustomerAuthenticated(false)} />} />
                  <Route path="/account/addresses" component={() => <CustomerAccountSurface lang={lang} page="addresses" onSignOut={() => setCustomerAuthenticated(false)} />} />
                  <Route path="/orders" component={() => <OrdersPage />} />
                  <Route path="/orders/:id" component={() => <OrderDetailPage />} />
                  <Route path="/returns" component={() => <CustomerAftercareSurface lang={lang} kind="returns" />} />
                  <Route path="/returns/request" component={() => <CustomerAftercareSurface lang={lang} kind="returns" />} />
                  <Route path="/exchanges" component={() => <CustomerAftercareSurface lang={lang} kind="exchanges" />} />
                  <Route path="/exchanges/request" component={() => <CustomerAftercareSurface lang={lang} kind="exchanges" />} />
                  <Route path="/reviews" component={() => <CustomerAftercareSurface lang={lang} kind="reviews" />} />
                  <Route path="/reviews/submit" component={() => <CustomerAftercareSurface lang={lang} kind="reviews" />} />
                  <Route path="/delivery" component={() => <InfoPage titleKey="delivery" kickerKey="deliveryKicker" bodyKey="deliveryText" actionKey="startShopping" actionPath="/shop" />} />
                  <Route path="/help" component={() => <InfoPage titleKey="help" kickerKey="helpKicker" bodyKey="helpText" actionKey="contact" actionPath="/contact" />} />
                  <Route path="/contact" component={() => <InfoPage titleKey="contact" kickerKey="contactKicker" bodyKey="contactText" actionKey="help" actionPath="/help" />} />
                  <Route path="/about" component={() => <InfoPage titleKey="aboutTitle" kickerKey="aboutKicker" bodyKey="aboutText" actionKey="exploreShop" actionPath="/shop" />} />
                  <Route path="/policies" component={() => <InfoPage titleKey="policies" kickerKey="policiesKicker" bodyKey="policiesText" actionKey="back" actionPath="/" />} />
                  <Route path="/terms" component={() => <InfoPage titleKey="terms" kickerKey="termsKicker" bodyKey="termsText" actionKey="back" actionPath="/" />} />
                  <Route path="/privacy" component={() => <InfoPage titleKey="privacy" kickerKey="privacyKicker" bodyKey="privacyText" actionKey="back" actionPath="/" />} />
                    <Route path="/ops" component={() => <OperationsRouter authenticated={opsAuthenticated} theme={opsTheme} onAuthenticated={() => { window.localStorage.setItem('plazza-ops-session', 'active'); setOpsAuthenticated(true); }} onReturnStore={() => setMode('store')} />} />
                    <Route path="/ops/:rest*" component={() => <OperationsRouter authenticated={opsAuthenticated} theme={opsTheme} onAuthenticated={() => { window.localStorage.setItem('plazza-ops-session', 'active'); setOpsAuthenticated(true); }} onReturnStore={() => setMode('store')} />} />
                  <Route component={NotFound} />
                  </Switch>
                </Suspense>
              </RoutedErrorBoundary>
              {mode === 'store' && <MobileStoreNav cartCount={cartCount} />}
              {cartOpen && <CartDrawer cart={cart} updateQuantity={updateQuantity} close={() => setCartOpen(false)} />}
            </div>
          </I18nContext.Provider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RouteLoading({ lang }: { lang: Lang }) {
  return <main className="mx-auto flex min-h-[45dvh] max-w-[900px] items-center justify-center px-5 py-16" role="status">
    <p className="eyebrow">{lang === 'ar' ? 'جارٍ تحميل الصفحة' : 'Chargement de la page'}</p>
  </main>;
}

function StoreHeader({ setLang, customerAuthenticated, cartCount, onCart }: { setLang: (v: Lang) => void; customerAuthenticated: boolean; cartCount: number; onCart: () => void }) {
  const { lang, t } = useI18n();
  const [location, navigate] = useLocation();
  return <header className="store-header sticky top-0 z-30 border-b hairline bg-[hsl(var(--background)/.92)] backdrop-blur-md">
    <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-4 px-5 lg:px-10">
      <Link href="/" className="focus-ring flex shrink-0 items-center" data-testid="link-home"><BrandMark showName lockup={lang} animated={!location.startsWith('/checkout')} /></Link>
      <nav className="hidden items-center gap-5 lg:flex" aria-label={t('navigation')}>{storeLinks.map(([key, path, Icon]) => <Link key={path} href={path} aria-current={location === path || location.startsWith(`${path}/`) ? 'page' : undefined} className="focus-ring flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]" data-testid={`link-store-${path.slice(1)}`}><Icon size={15} strokeWidth={1.7} />{t(key as Parameters<Translate>[0])}</Link>)}</nav>
      <div className="ms-auto flex items-center gap-2">
        <button type="button" className="focus-ring hidden items-center gap-2 border border-transparent px-2 py-2 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] sm:flex" onClick={() => navigate('/search')} data-testid="button-search"><Search size={17} /> <span className="hidden xl:inline">{t('search')}</span></button>
        <button type="button" className="focus-ring flex items-center gap-1 rounded-sm border hairline px-2.5 py-2 text-[11px] font-bold" onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} aria-label={t('language')} data-testid="button-language"><Globe2 size={15} />{lang === 'fr' ? 'العربية' : 'FR'}</button>
         <Link href={customerAuthenticated ? '/account' : '/login'} className="focus-ring flex items-center gap-1.5 rounded-sm border hairline px-2.5 py-2 text-[11px] font-bold" aria-label={customerAuthenticated ? t('seeAccount') : t('customerLogin')} data-testid="link-customer-account"><UserRound size={16} /><span className="hidden xl:inline">{customerAuthenticated ? t('seeAccount') : t('customerLogin')}</span></Link>
       <button type="button" className="focus-ring relative rounded-sm bg-[hsl(var(--secondary))] p-2.5 text-[hsl(var(--primary))]" onClick={onCart} aria-label={t('openCart')} data-testid="button-open-cart"><ShoppingCart size={18} />{cartCount > 0 && <span className="absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[hsl(var(--primary))] px-1 text-[10px] font-bold text-white" data-testid="text-cart-count">{cartCount}</span>}</button>
      </div>
    </div>
  </header>;
}

function OpsHeader({ setLang, setMode, authenticated, theme, setTheme, onSignOut }: { setLang: (v: Lang) => void; setMode: (v: Mode) => void; authenticated: boolean; theme: OpsTheme; setTheme: (v: OpsTheme) => void; onSignOut: () => void }) {
  const { lang, t } = useI18n();
  const [location, navigate] = useLocation();
  const themeLabel = inlineCopy(lang, 'Thème d’espace', 'نمط المساحة');
  const chooseTheme = (nextTheme: OpsTheme) => {
    setTheme(nextTheme);
    if (nextTheme === 'theme2' && location !== '/ops') navigate('/ops');
  };
  return <header className="sticky top-0 z-30 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]"><div className="flex min-h-16 items-center justify-between gap-3 px-4 py-2 lg:px-7"><div className="flex min-w-0 items-center gap-3"><button className="focus-ring grid h-9 w-9 shrink-0 items-center justify-center bg-transparent p-0" onClick={() => { setMode('store'); navigate('/'); }} aria-label={t('returnStore')} data-testid="button-return-store"><BrandMark inverse animated={false} /></button><div className="min-w-0"><p className="truncate text-xs font-bold uppercase tracking-[.16em]">Plazza / Ops</p><p className="mono truncate text-[10px] text-[hsl(var(--sidebar-foreground)/.55)]">{t('localWorkspace')}</p></div></div><div className="flex items-center gap-2 sm:gap-3"><span className="hidden items-center gap-2 text-[11px] text-[hsl(var(--sidebar-foreground)/.65)] xl:flex"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> {t('fixtureMode')}</span>{authenticated && <div className="flex items-center border border-[hsl(var(--sidebar-border))] p-0.5" role="group" aria-label={themeLabel} data-testid="ops-theme-switcher"><button type="button" className={`focus-ring flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold transition-colors ${theme === 'theme1' ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--primary))]' : 'text-[hsl(var(--sidebar-foreground)/.65)] hover:text-white'}`} onClick={() => chooseTheme('theme1')} aria-pressed={theme === 'theme1'} aria-label={inlineCopy(lang, 'Thème 1 : navigation latérale', 'النمط 1: تنقل جانبي')} data-testid="button-ops-theme-1"><Menu size={13} /> <span className="hidden lg:inline">{inlineCopy(lang, 'Thème 1', 'النمط 1')}</span></button><button type="button" className={`focus-ring flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold transition-colors ${theme === 'theme2' ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--sidebar-foreground)/.65)] hover:text-white'}`} onClick={() => chooseTheme('theme2')} aria-pressed={theme === 'theme2'} aria-label={inlineCopy(lang, 'Thème 2 : lanceur de modules', 'النمط 2: مشغل الوحدات')} data-testid="button-ops-theme-2"><LayoutDashboard size={13} /> <span className="hidden lg:inline">{inlineCopy(lang, 'Thème 2', 'النمط 2')}</span></button></div>}{authenticated && <button className="focus-ring p-2 text-[hsl(var(--sidebar-foreground)/.7)] hover:text-white" onClick={() => navigate('/ops/notifications')} aria-label={t('notifications')} data-testid="button-ops-notifications"><Bell size={18} /></button>}<button className="focus-ring flex items-center gap-1 border border-[hsl(var(--sidebar-border))] px-2.5 py-1.5 text-xs font-bold" onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} aria-label={t('language')} data-testid="button-ops-language"><Globe2 size={14} /><span className="hidden sm:inline">{lang === 'fr' ? 'العربية' : 'FR'}</span></button>{authenticated && <button type="button" className="focus-ring flex items-center gap-2 border border-[hsl(var(--sidebar-border))] px-2 py-1.5 text-xs font-bold" onClick={() => { onSignOut(); navigate('/'); }} aria-label={lang === 'ar' ? 'تسجيل الخروج' : 'Se déconnecter'} data-testid="button-ops-sign-out"><span className="grid h-6 w-6 place-items-center rounded-full bg-[hsl(var(--primary)/.2)] text-[10px] text-[hsl(var(--primary))]">AM</span><LogOut size={14} /></button>}</div></div></header>;
}

function OpsAuthSurface({ lang, onAuthenticated, onReturnStore }: { lang: Lang; onAuthenticated: () => void; onReturnStore: () => void }) {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState<string>(DEMO_OPS_CREDENTIALS.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim().toLowerCase() !== DEMO_OPS_CREDENTIALS.email || password !== DEMO_OPS_CREDENTIALS.password) {
      setError(true);
      return;
    }
    setError(false);
    onAuthenticated();
    navigate('/ops/dashboard');
  };
  return <main className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-[1120px] items-center gap-10 px-5 py-12 lg:grid-cols-[.9fr_1.1fr] lg:px-10">
    <section className="border-s-2 border-[hsl(var(--primary))] ps-6">
      <p className="eyebrow">{lang === 'ar' ? 'مساحة محمية' : 'Espace protégé'}</p>
      <h1 className="display mt-3 text-6xl font-semibold uppercase leading-[.9] sm:text-8xl">Plazza / Ops</h1>
      <p className="mt-6 max-w-md text-sm leading-7 text-[hsl(var(--muted-foreground))]">{lang === 'ar' ? 'سجّل الدخول للوصول إلى العمليات والطلبات والمخزون.' : 'Connectez-vous pour accéder aux opérations, commandes et stocks.'}</p>
      <div className="mt-8 flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))]"><LockKeyhole size={16} className="text-[hsl(var(--primary))]" />{lang === 'ar' ? 'الدخول مطلوب قبل لوحة التحكم' : 'Connexion requise avant le workspace'}</div>
    </section>
    <form onSubmit={submit} className="border hairline bg-[hsl(var(--card))] p-6 sm:p-9" noValidate>
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{lang === 'ar' ? 'دخول الفريق' : 'Accès équipe'}</p><h2 className="display mt-2 text-3xl uppercase">{lang === 'ar' ? 'تسجيل الدخول' : 'Connexion'}</h2></div><ShieldCheck size={22} className="text-[hsl(var(--primary))]" /></div>
      <label className="mt-7 block text-xs font-bold"><span className="mb-2 block">{lang === 'ar' ? 'البريد المهني' : 'Email professionnel'}</span><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring w-full border hairline bg-[hsl(var(--background))] px-3 py-3 text-sm" placeholder="ops@plazza.dz" required /></label>
      <label className="mt-5 block text-xs font-bold"><span className="mb-2 block">{lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="focus-ring w-full border hairline bg-[hsl(var(--background))] px-3 py-3 text-sm" placeholder="••••••••" required /></label>
      <p className="mt-3 text-[10px] leading-5 text-[hsl(var(--muted-foreground))]">{lang === 'ar' ? 'بيانات العرض: ops@plazza.dz / PlazzaOps2026!' : 'Démo : ops@plazza.dz / PlazzaOps2026!'}</p>
      {error && <p className="mt-4 text-xs font-bold text-[hsl(var(--destructive))]" role="alert">{lang === 'ar' ? 'أدخل البريد وكلمة المرور للمتابعة.' : 'Saisissez votre email et votre mot de passe pour continuer.'}</p>}
      <div className="mt-5 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><input id="ops-remember" type="checkbox" className="accent-[hsl(var(--primary))]" /> <label htmlFor="ops-remember">{lang === 'ar' ? 'تذكر هذا الجهاز' : 'Se souvenir de cet appareil'}</label></div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="submit" className="focus-ring flex flex-1 items-center justify-center gap-2 bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-white" data-testid="button-ops-login">{lang === 'ar' ? 'دخول إلى العمليات' : 'Entrer dans Ops'}<ArrowRight size={15} /></button><button type="button" onClick={() => { onReturnStore(); navigate('/'); }} className="focus-ring border hairline px-5 py-3 text-xs font-bold">{lang === 'ar' ? 'العودة للمتجر' : 'Retour boutique'}</button></div>
      <div className="mt-6 border-t hairline pt-4 text-[10px] leading-5 text-[hsl(var(--muted-foreground))]">{lang === 'ar' ? 'واجهة دخول تجريبية فقط: لا يتم إرسال أو حفظ بيانات الاعتماد بعد.' : 'Interface de connexion uniquement : aucun identifiant n’est envoyé ni persisté dans cette version.'}</div>
    </form>
  </main>;
}

function OpsLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const { t } = useI18n();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);
  return <div className="flex min-h-[calc(100dvh-64px)] bg-[hsl(var(--background))]"><aside id="ops-navigation" className={`${mobileOpen ? 'block' : 'hidden'} fixed inset-y-16 start-0 z-20 w-64 border-e border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] p-4 lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-64px)]`} aria-label={t('navigation')}><div className="mb-6 flex items-center justify-between lg:hidden"><span className="eyebrow text-[hsl(var(--sidebar-foreground)/.65)]">{t('navigation')}</span><button className="focus-ring" onClick={() => setMobileOpen(false)} aria-label={t('closeNavigation')} data-testid="button-close-ops-nav"><X size={18} /></button></div>{opsGroups.map((group) => <div className="mb-5" key={group.label}><p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.4)]">{t(group.label)}</p>{group.items.map(([key, path, Icon]) => <Link href={path} key={path} onClick={() => setMobileOpen(false)} aria-current={location === path || location.startsWith(path + '/') ? 'page' : undefined} className={`focus-ring mb-0.5 flex items-center gap-3 px-2.5 py-2 text-xs font-semibold transition-colors ${location === path || location.startsWith(path + '/') ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--primary))]' : 'text-[hsl(var(--sidebar-foreground)/.7)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid={`link-ops-${path.split('/').pop()}`}><Icon size={15} strokeWidth={1.7} />{t(key)}</Link>)}</div>)}</aside><main className="min-w-0 flex-1"><div className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-9"><button className="focus-ring mb-5 flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] lg:hidden" onClick={() => setMobileOpen(true)} aria-expanded={mobileOpen} aria-controls="ops-navigation" data-testid="button-open-ops-nav"><Menu size={18} /> {t('sections')}</button><div className="mb-8 flex flex-col justify-between gap-4 border-b hairline pb-6 sm:flex-row sm:items-end"><div><p className="eyebrow mb-2">{t('fixturePreview')}</p><h1 className="display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl" data-testid="text-ops-title">{title}</h1><p className="mt-2 max-w-2xl text-sm text-[hsl(var(--muted-foreground))]">{subtitle}</p></div><span className="flex items-center gap-2 self-start border hairline bg-[hsl(var(--card))] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] sm:self-auto"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> {t('localData')}</span></div>{children}</div></main></div>;
}

function MobileStoreNav({ cartCount }: { cartCount: number }) {
  const { t } = useI18n();
  const [location] = useLocation();
  return <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t hairline bg-[hsl(var(--background)/.96)] px-2 py-2 backdrop-blur-md lg:hidden" aria-label={t('navigation')}><Link href="/" aria-current={location === '/' ? 'page' : undefined} className="focus-ring grid place-items-center gap-1 py-1 text-[10px] font-bold text-[hsl(var(--muted-foreground))]" data-testid="link-mobile-home"><Home size={18} />{t('home')}</Link><Link href="/shop" aria-current={location === '/shop' || location.startsWith('/shop/') ? 'page' : undefined} className="focus-ring grid place-items-center gap-1 py-1 text-[10px] font-bold text-[hsl(var(--muted-foreground))]" data-testid="link-mobile-shop"><ShoppingBag size={18} />{t('shop')}</Link><Link href="/search" aria-current={location === '/search' ? 'page' : undefined} className="focus-ring grid place-items-center gap-1 py-1 text-[10px] font-bold text-[hsl(var(--muted-foreground))]" data-testid="link-mobile-search"><Search size={18} />{t('search')}</Link><Link href="/cart" aria-current={location === '/cart' ? 'page' : undefined} className="focus-ring relative grid place-items-center gap-1 py-1 text-[10px] font-bold text-[hsl(var(--muted-foreground))]" data-testid="link-mobile-cart"><ShoppingCart size={18} />{t('cart')}{cartCount > 0 && <span className="absolute end-5 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[hsl(var(--primary))] text-[9px] text-white">{cartCount}</span>}</Link></nav>;
}

function ProductVisual({ product, large = false }: { product: Product; large?: boolean }) {
  const { t, lang } = useI18n();
  return <div className={`product-visual product-visual--${product.tone} relative overflow-hidden ${large ? 'aspect-square' : 'aspect-[4/5]'}`} data-testid={`visual-product-${product.id}`}>
    {product.media ? <img src={product.media} alt={product.mediaAlt || productName(lang, product.name, product.arabicName)} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center" role="img" aria-label={`${t('fixture')}: ${productName(lang, product.name, product.arabicName)}`}><div className="border border-white/25 px-5 py-4 text-center text-white/80"><Package size={22} className="mx-auto mb-2" aria-hidden="true" /><p className="text-[10px] font-bold uppercase tracking-[.18em]">{t('fixture')}</p><p className="mt-1 max-w-[13rem] text-[10px] leading-4">{t('mediaPending')}</p></div></div>}
    <div className="absolute inset-0 bg-[hsl(var(--secondary)/.16)] mix-blend-multiply" />
    <div className="absolute -end-12 top-8 h-48 w-48 rotate-12 border border-white/25" />
    <div className="absolute -end-2 top-14 h-32 w-32 rotate-12 border border-white/20" />
    <div className="absolute start-5 top-5 z-10 flex items-center gap-2"><span className="fixture-label border border-white/35 bg-[hsl(var(--secondary)/.48)] px-2 py-1 text-[9px] font-bold uppercase tracking-[.18em] text-white">{product.media ? (product.mediaSource === 'merchant' ? t('merchantMedia') : t('referenceMedia')) : t('fixture')}</span><span className="mono text-[9px] text-white/70">PN / {product.id.slice(0, 3).toUpperCase()}</span></div>
    <div className="absolute bottom-7 start-5 border-s-2 border-[hsl(var(--primary))] ps-3 text-white"><p className="display text-3xl font-bold uppercase leading-[.92]">{categoryName(lang, product.category)}</p><p className="mt-2 max-w-[180px] text-xs text-white/75">{product.format.replace('visual fixture', t('fixture'))}</p></div>
    <div className="absolute bottom-4 end-4 text-6xl font-black tracking-tighter text-white/15">PN</div><div className="absolute bottom-4 start-5 end-5 h-px bg-white/20" />
  </div>;
}

function ProductCard({ product, addToCart }: { product: Product; addToCart: (p: Product) => void }) {
  const { t, lang } = useI18n();
  const [, navigate] = useLocation();
  const name = productName(lang, product.name, product.arabicName);
  const [favorite, setFavorite] = useState(false);
  return <article className="group animate-rise" data-testid={`card-product-${product.id}`}><button className="focus-ring block w-full text-start" onClick={() => navigate(`/shop/${product.id}`)} data-testid={`button-view-product-${product.id}`}><ProductVisual product={product} /></button><div className="pt-3"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{categoryName(lang, product.category)}</p><h3 className="mt-1 text-sm font-bold leading-tight">{name}</h3><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{product.format.replace('visual fixture', t('fixture'))}</p></div><button className={`focus-ring p-1 transition-colors ${favorite ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]'}`} onClick={() => setFavorite((current) => !current)} aria-label={`${t('add')} ${name}`} aria-pressed={favorite} data-testid={`button-favorite-${product.id}`}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button></div><div className="mt-4 flex items-center justify-between gap-2"><span className="mono text-sm font-bold">{formatDa(product.price)}</span><button disabled={!product.stock} className="focus-ring flex items-center gap-1.5 bg-[hsl(var(--secondary))] px-3 py-2 text-[11px] font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40" onClick={(event) => { event.stopPropagation(); addToCart(product); }} data-testid={`button-add-cart-${product.id}`}><Plus size={14} /> {product.stock ? t('add') : t('unavailable')}</button></div><p className={`mt-2 text-[10px] font-bold ${product.stock > 0 ? 'text-[hsl(var(--muted-foreground))]' : 'text-[hsl(var(--destructive))]'}`}>{product.stock > 0 ? t('stockFixture', { count: product.stock }) : t('unavailableFixture')}</p></div></article>;
}

function HomePage({ addToCart }: { addToCart: (p: Product) => void }) {
  const { t, lang } = useI18n();
  const heroProduct = products[0];
  const nextProduct = products[1];
  return (
    <main>
      <section className="hero-grid relative overflow-hidden bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
        <div className="mx-auto grid max-w-[1440px] items-end gap-12 px-5 py-14 sm:py-20 lg:grid-cols-[.95fr_1.05fr] lg:px-10 lg:py-24">
          <div className="relative z-10 animate-rise">
            <p className="eyebrow mb-5 text-[hsl(var(--primary))]">PLAZZA NUTRITION / {t('algeria')}</p>
             <h1 className="display max-w-3xl text-5xl font-bold uppercase leading-[.92] tracking-tight sm:text-8xl lg:text-[7.4rem]" data-testid="text-home-hero">
              {t('heroTrain')}<br /><span className="text-[hsl(var(--primary))]">{t('heroIntent')}</span>
            </h1>
             <p className="mt-8 hidden max-w-md text-sm leading-6 text-[hsl(var(--secondary-foreground)/.68)] sm:block">{t('trainingNutrition')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-white hover:bg-[hsl(var(--primary)/.9)]" data-testid="link-hero-shop">{t('exploreShop')} <ArrowRight size={16} /></Link>
               <Link href="/delivery" className="focus-ring hidden items-center gap-2 border border-[hsl(var(--secondary-foreground)/.25)] px-5 py-3 text-xs font-bold hover:border-[hsl(var(--primary))] sm:flex" data-testid="link-hero-delivery">{t('understandDelivery')}</Link>
            </div>
          </div>
           <div className="hero-product-frame relative min-h-[320px] animate-rise animate-rise-2 sm:min-h-[380px] lg:min-h-[480px]">
            <div className="absolute inset-0 grid grid-cols-[1.18fr_.82fr] gap-3 sm:gap-5">
              <Link href={`/shop/${heroProduct.id}`} className="focus-ring relative mt-8 block self-end sm:mt-0" data-testid="link-hero-product-primary">
                <ProductVisual product={heroProduct} large />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-[hsl(var(--secondary)/.82)] to-transparent p-4 pt-20 text-white">
                  <div><p className="eyebrow text-white/60">{categoryName(lang, heroProduct.category)}</p><p className="mt-1 max-w-[12rem] text-sm font-bold">{productName(lang, heroProduct.name, heroProduct.arabicName)}</p></div>
                  <span className="mono text-xs font-bold">{formatDa(heroProduct.price)}</span>
                </div>
              </Link>
             <div className="hidden flex-col gap-3 sm:flex">
                <div className="flex-1 border border-white/15 bg-white/[.04] p-4 sm:p-5">
                  <p className="eyebrow text-white/50">{t('selection')}</p>
                  <p className="display mt-3 text-3xl font-bold uppercase leading-none text-white sm:text-4xl">{categoryName(lang, heroProduct.category)}</p>
                  <p className="mt-4 text-xs leading-5 text-white/60">{heroProduct.format.replace('visual fixture', t('fixture'))}</p>
                </div>
                <Link href={`/shop/${nextProduct.id}`} className="focus-ring block border border-[hsl(var(--primary)/.55)] bg-[hsl(var(--primary)/.1)] p-4 transition-colors hover:bg-[hsl(var(--primary)/.2)] sm:p-5" data-testid="link-hero-product-secondary">
                  <div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[hsl(var(--primary))]">{categoryName(lang, nextProduct.category)}</p><p className="mt-2 text-sm font-bold text-white">{productName(lang, nextProduct.name, nextProduct.arabicName)}</p></div><ArrowRight size={16} className="mt-1 text-[hsl(var(--primary))]" /></div>
                  <p className="mono mt-5 text-xs text-white/70">{formatDa(nextProduct.price)}</p>
                </Link>
              </div>
            </div>
            <span className="absolute -bottom-6 end-0 max-w-32 text-end text-[9px] uppercase leading-4 tracking-widest text-[hsl(var(--secondary-foreground)/.5)]">{t('fixture')}<br />{t('localFixture')}</span>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 flex items-end justify-between gap-4"><div><p className="eyebrow mb-2">{t('selection')}</p><h2 className="display text-4xl font-semibold uppercase sm:text-5xl">{t('startHere')}</h2></div><Link href="/shop" className="focus-ring flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]" data-testid="link-home-all-products">{t('seeAll')} <ArrowRight size={15} /></Link></div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}</div>
      </section>
      <section className="border-y hairline bg-[hsl(var(--muted)/.55)]"><div className="mx-auto grid max-w-[1440px] gap-px bg-[hsl(var(--border))] sm:grid-cols-3"><TrustTile number="01" title={t('productFirst')} text={t('productFirstText')} icon={<Package size={18} />} /><TrustTile number="02" title={t('codClearly')} text={t('codClearlyText')} icon={<Truck size={18} />} /><TrustTile number="03" title={t('bilingual')} text={t('bilingualText')} icon={<Globe2 size={18} />} /></div></section>
      <section className="mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-24"><div><p className="eyebrow mb-3">{t('routine')}</p><h2 className="display text-5xl font-semibold uppercase leading-[.93]">{t('moreFocus')}</h2></div><div className="border-s hairline ps-6"><p className="max-w-xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">{t('trainingNutrition')}</p><Link href="/about" className="focus-ring mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" data-testid="link-home-about">{t('aboutApproach')} <ArrowRight size={15} /></Link></div></section>
    </main>
  );
}

function TrustTile({ number, title, text, icon }: { number: string; title: string; text: string; icon: ReactNode }) { return <div className="bg-[hsl(var(--background))] px-5 py-8 lg:px-10"><div className="mb-7 flex items-center justify-between"><span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{number}</span><span className="text-[hsl(var(--primary))]">{icon}</span></div><h3 className="font-bold">{title}</h3><p className="mt-2 max-w-xs text-xs leading-5 text-[hsl(var(--muted-foreground))]">{text}</p></div>; }

function ShopPage({ addToCart, categoryMode = false, searchMode = false }: { addToCart: (p: Product) => void; categoryMode?: boolean; searchMode?: boolean }) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tout');
  const [availability, setAvailability] = useState('Tout');
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterDialogRef = useRef<HTMLDivElement>(null);
  const filterLabels = lang === 'ar'
    ? { all: 'الكل', available: 'متوفر', out: 'غير متوفر', selection: 'اختيار', low: 'السعر تصاعدياً', high: 'السعر تنازلياً', name: 'الاسم' }
    : { all: 'Tout', available: 'Disponible', out: 'Rupture', selection: 'Sélection', low: 'Prix croissant', high: 'Prix décroissant', name: 'Nom' };
  const filtered = useMemo(() => products
    .filter((p) => (category === 'Tout' || p.category === category) && (availability === 'Tout' || (availability === 'Disponible' ? p.stock > 0 : p.stock === 0)) && `${p.name} ${p.arabicName} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : 0), [category, availability, query, sort]);
  const clear = () => { setQuery(''); setCategory('Tout'); setAvailability('Tout'); setSort('featured'); };
  useEffect(() => {
    if (!filtersOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => filterDialogRef.current
      ? Array.from(filterDialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), input:not([disabled]), [href]'))
      : [];
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false);
      if (event.key !== 'Tab') return;
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [filtersOpen]);
  return <main className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-14"><div className="mb-12 max-w-2xl animate-rise"><p className="eyebrow mb-3">{searchMode ? t('search') : categoryMode ? t('categories') : `${t('shop')} / ${t('fixture')}`}</p><h1 className="display text-6xl font-semibold uppercase leading-[.9] sm:text-8xl">{searchMode ? t('findFit') : categoryMode ? t('chooseLane') : t('shelf')}</h1><p className="mt-5 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{t('productFixtureNotice')}</p></div><div className="mb-8 border-y hairline py-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><label className="focus-within:border-[hsl(var(--primary))] relative flex min-w-0 flex-1 items-center gap-3 border hairline bg-[hsl(var(--card))] px-3 py-2.5"><Search size={17} aria-hidden="true" className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">{t('search')}</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('search')} className="focus-ring w-full bg-transparent text-sm outline-none" data-testid="input-product-search" /></label><button type="button" className="focus-ring flex items-center justify-center gap-2 border hairline px-3 py-2.5 text-xs font-bold lg:hidden" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} aria-controls="shop-filters-dialog" data-testid="button-open-shop-filters"><SlidersHorizontal size={15} aria-hidden="true" /> {t('filters')}</button><div className="hidden gap-2 overflow-auto lg:flex" role="group" aria-label={t('filters')}><select aria-label={t('categories')} value={category} onChange={(e) => setCategory(e.target.value)} className="focus-ring border hairline bg-[hsl(var(--card))] px-3 py-2 text-xs font-bold" data-testid="select-product-category"><option value="Tout">{filterLabels.all}</option><option value="Protein">Protein</option><option value="Performance">Performance</option><option value="Wellness">Wellness</option><option value="Accessories">Accessories</option></select><select aria-label={t('availability')} value={availability} onChange={(e) => setAvailability(e.target.value)} className="focus-ring border hairline bg-[hsl(var(--card))] px-3 py-2 text-xs font-bold" data-testid="select-product-availability"><option value="Tout">{filterLabels.all}</option><option value="Disponible">{filterLabels.available}</option><option value="Rupture">{filterLabels.out}</option></select><select aria-label={t('sort')} value={sort} onChange={(e) => setSort(e.target.value)} className="focus-ring border hairline bg-[hsl(var(--card))] px-3 py-2 text-xs font-bold" data-testid="select-product-sort"><option value="featured">{filterLabels.selection}</option><option value="price-low">{filterLabels.low}</option><option value="price-high">{filterLabels.high}</option><option value="name">{filterLabels.name}</option></select></div></div></div><div className="mb-5 flex items-center justify-between"><span className="text-xs font-bold text-[hsl(var(--muted-foreground))]" data-testid="text-product-result-count" aria-live="polite">{t('visualReferences', { count: filtered.length })}</span><button className="focus-ring flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))]" onClick={clear} data-testid="button-reset-filters"><SlidersHorizontal size={15} aria-hidden="true" /> {t('reset')}</button></div>{filtered.length ? <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}</div> : <EmptyState title={t('noResults')} text={t('tryOther')} action={t('reset')} onAction={clear} />}{filtersOpen && <div id="shop-filters-dialog" className="fixed inset-0 z-50 flex items-end bg-[hsl(var(--secondary)/.55)] p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="shop-filters-title" dir={lang === 'ar' ? 'rtl' : 'ltr'}><div ref={filterDialogRef} className="max-h-[calc(100dvh-1rem)] w-full overflow-y-auto border hairline bg-[hsl(var(--background))] p-5 sm:max-w-md"><div className="flex items-center justify-between"><h2 id="shop-filters-title" className="display text-2xl uppercase">{t('filters')}</h2><button type="button" className="focus-ring p-2" onClick={() => setFiltersOpen(false)} aria-label={t('close')}><X size={18} /></button></div><div className="mt-5 grid gap-4"><label className="text-xs font-bold">{t('categories')}<select value={category} onChange={(e) => setCategory(e.target.value)} className="focus-ring mt-2 w-full border hairline bg-[hsl(var(--card))] px-3 py-3 text-sm"><option value="Tout">{filterLabels.all}</option><option value="Protein">Protein</option><option value="Performance">Performance</option><option value="Wellness">Wellness</option><option value="Accessories">Accessories</option></select></label><label className="text-xs font-bold">{t('availability')}<select value={availability} onChange={(e) => setAvailability(e.target.value)} className="focus-ring mt-2 w-full border hairline bg-[hsl(var(--card))] px-3 py-3 text-sm"><option value="Tout">{filterLabels.all}</option><option value="Disponible">{filterLabels.available}</option><option value="Rupture">{filterLabels.out}</option></select></label><label className="text-xs font-bold">{t('sort')}<select value={sort} onChange={(e) => setSort(e.target.value)} className="focus-ring mt-2 w-full border hairline bg-[hsl(var(--card))] px-3 py-3 text-sm"><option value="featured">{filterLabels.selection}</option><option value="price-low">{filterLabels.low}</option><option value="price-high">{filterLabels.high}</option><option value="name">{filterLabels.name}</option></select></label></div><button type="button" className="focus-ring mt-6 w-full bg-[hsl(var(--primary))] py-3 text-xs font-bold text-white" onClick={() => setFiltersOpen(false)}>{t('applyFilters')}</button></div></div>}</main>;
}

function PromotionsPage() {
  const { lang } = useI18n();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'invalid' | 'expired' | 'used'>('idle');
  const isArabic = lang === 'ar';
  const text = (fr: string, ar: string) => isArabic ? ar : fr;
  const offers = [
    { index: '01', title: text('Offre catalogue', 'عرض الكتالوج'), detail: text('Produit, seuil et période à fournir par le marchand.', 'المنتج والحد الأدنى والفترة بانتظار بيانات التاجر.'), state: text('Brouillon', 'مسودة'), tone: 'bg-[hsl(var(--primary)/.1)]' },
    { index: '02', title: text('Avantage livraison', 'ميزة التوصيل'), detail: text('Zones, seuil de panier et tarif à confirmer.', 'المناطق والحد الأدنى للسلة والتعرفة تحتاج إلى تأكيد.'), state: text('À configurer', 'يحتاج إلى إعداد'), tone: 'bg-[hsl(var(--accent)/.25)]' },
    { index: '03', title: text('Code promotionnel', 'رمز ترويجي'), detail: text('Aucun code réel n’est actif dans cette fixture.', 'لا يوجد رمز حقيقي مفعّل ضمن هذه البيانات.'), state: text('Non actif', 'غير مفعّل'), tone: 'bg-[hsl(var(--secondary)/.08)]' },
  ];
  return <main className="mx-auto max-w-[1240px] px-5 py-10 pb-28 lg:px-10 lg:py-16"><div className="mb-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end"><div className="max-w-3xl"><p className="eyebrow mb-3">{text('Promotions / sélection', 'العروض / المختارات')}</p><h1 className="display text-6xl font-semibold uppercase leading-[.9] sm:text-8xl">{text('Des offres, avec leurs conditions.', 'عروض واضحة بشروطها.')}</h1></div><div className="border-s-2 border-[hsl(var(--primary))] ps-5"><p className="text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text('Les offres restent lisibles sans remise ou validité inventée. Les règles finales appartiennent au catalogue marchand.', 'تبقى العروض واضحة دون اختلاق خصم أو صلاحية. القواعد النهائية من اختصاص كتالوج التاجر.')}</p></div></div><div className="grid gap-4 md:grid-cols-3">{offers.map((offer) => <article className={`border hairline p-5 ${offer.tone}`} key={offer.title}><div className="flex items-center justify-between"><span className="mono text-xs text-[hsl(var(--muted-foreground))]">{offer.index}</span><span className="border border-current/20 px-2 py-1 text-[10px] font-bold uppercase">{offer.state}</span></div><h2 className="display mt-10 text-3xl uppercase">{offer.title}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{offer.detail}</p><div className="mt-7 h-1 w-12 bg-[hsl(var(--primary))]" /></article>)}</div><section className="mt-8 grid gap-8 lg:grid-cols-[1fr_.8fr]"><div className="border hairline bg-[hsl(var(--secondary))] p-6 text-white sm:p-8"><p className="eyebrow text-white/55">{text('Vérifier un code', 'تحقق من رمز')}</p><h2 className="display mt-3 text-4xl uppercase">{text('Aucune remise sans règle.', 'لا خصم بلا قاعدة.')}</h2><label className="mt-7 block"><span className="mb-2 block text-xs font-bold">{text('Code promotionnel', 'الرمز الترويجي')}</span><div className="flex"><input value={code} onChange={(event) => { setCode(event.target.value); setStatus('idle'); }} className="min-w-0 flex-1 border border-white/15 bg-white/10 px-3 py-3 text-sm outline-none placeholder:text-white/40" placeholder="CODE-À-CONFIRMER" /><button type="button" className="focus-ring bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold" onClick={() => setStatus(code ? code.toLowerCase().includes('used') ? 'used' : code.toLowerCase().includes('expired') ? 'expired' : 'invalid' : 'idle')}>{text('Vérifier', 'تحقق')}</button></div></label>{status !== 'idle' && <p className="mt-4 border-s-2 border-[hsl(var(--primary))] px-3 py-2 text-xs" role="alert">{status === 'used' ? text('Code déjà utilisé — état de fixture.', 'الرمز مستخدم مسبقاً — حالة تجريبية.') : status === 'expired' ? text('Code expiré — état de fixture.', 'الرمز منتهي — حالة تجريبية.') : text('Code invalide ou non configuré — aucune remise appliquée.', 'الرمز غير صالح أو غير مهيأ — لم يطبق أي خصم.')}</p>}</div><div className="border hairline p-6 sm:p-8"><p className="eyebrow">{text('À confirmer avant mise en ligne', 'يجب تأكيده قبل الإطلاق')}</p><ul className="mt-5 space-y-4 text-sm text-[hsl(var(--muted-foreground))]"><li className="border-b hairline pb-3">{text('Règle de remise et éligibilité', 'قاعدة الخصم والأهلية')}</li><li className="border-b hairline pb-3">{text('Période, limite et cumul', 'الفترة والحد وإمكانية الجمع')}</li><li className="border-b hairline pb-3">{text('Effet sur livraison et retours', 'الأثر على التوصيل والإرجاع')}</li></ul><Link href="/shop" className="focus-ring mt-7 inline-flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-white">{text('Retourner au catalogue', 'العودة إلى الكتالوج')}<ArrowRight size={15} /></Link></div></section></main>;
}

function ProductPage({ addToCart }: { addToCart: (p: Product) => void }) {
  const { t, lang } = useI18n();
  const [, params] = useRoute('/shop/:id');
  const product = products.find((item) => item.id === params?.id) ?? products[0];
  const [quantity, setQuantity] = useState(1);
  const name = productName(lang, product.name, product.arabicName);
  return <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-14"><Link href="/shop" className="focus-ring mb-8 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))]" data-testid="link-back-shop"><ArrowLeft size={15} /> {t('backToShop')}</Link><div className="grid gap-10 lg:grid-cols-[1fr_.85fr] lg:gap-20"><div className="animate-rise"><ProductVisual product={product} large /></div><div className="flex flex-col justify-center animate-rise animate-rise-1"><p className="eyebrow mb-3">{categoryName(lang, product.category)} · {t('fixture')}</p><h1 className="display max-w-xl text-6xl font-semibold uppercase leading-[.9] sm:text-8xl" data-testid="text-product-name">{name}</h1><p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">{product.format.replace('visual fixture', t('fixture'))}</p><p className="mono mt-8 text-2xl font-bold" data-testid="text-product-price">{formatDa(product.price)}</p><p className="mt-6 max-w-lg text-sm leading-7 text-[hsl(var(--muted-foreground))]">{lang === 'ar' ? 'عنصر تجريبي مرئي لروتين تغذية واضح. التفاصيل والادعاءات النهائية تحتاج إلى معلومات التاجر.' : product.detail}</p><div className="mt-8 border-y hairline py-5"><p className="text-xs font-bold">{t('visualAvailability')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{product.stock > 0 ? t('stockFixture', { count: product.stock }) : t('noStockFixture')}</p></div><div className="mt-7 flex flex-wrap gap-3"><div className="flex items-center border hairline"><button className="focus-ring p-3" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label={t('decreaseQuantity')} data-testid="button-decrease-quantity">−</button><span className="mono w-9 text-center text-sm" data-testid="text-product-quantity">{quantity}</span><button className="focus-ring p-3" onClick={() => setQuantity(quantity + 1)} aria-label={t('increaseQuantity')} data-testid="button-increase-quantity"><Plus size={15} /></button></div><button className="focus-ring flex flex-1 items-center justify-center gap-2 bg-[hsl(var(--primary))] px-6 py-3 text-xs font-bold text-white sm:flex-none" onClick={() => { Array.from({ length: quantity }).forEach(() => addToCart(product)); }} disabled={product.stock === 0} data-testid="button-product-add-cart"><ShoppingCart size={16} /> {product.stock === 0 ? t('unavailable') : t('addToCart')}</button></div><p className="mt-4 flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]"><Sparkles size={13} className="text-[hsl(var(--primary))]" /> {t('noStockReserved')}</p></div></div></main>;
}

function CartDrawer({ cart, updateQuantity, close }: { cart: CartLine[]; updateQuantity: (id: string, change: number) => void; close: () => void }) {
  const { t, lang } = useI18n();
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const drawerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLElement>('button, a, input, select, textarea')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const focusable = drawerRef.current ? Array.from(drawerRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])')) : [];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [close]);
  return <div className="fixed inset-0 z-50 bg-[hsl(var(--secondary)/.35)]" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" dir={lang === 'ar' ? 'rtl' : 'ltr'}><button className="absolute inset-0 cursor-default" aria-label={t('close')} onClick={close} data-testid="button-close-cart-overlay" /><aside ref={drawerRef} className="absolute end-0 top-0 flex h-full w-full max-w-md flex-col bg-[hsl(var(--background))] p-5 shadow-2xl sm:p-7"><div className="flex items-center justify-between border-b hairline pb-5"><div><p className="eyebrow">{t('yourSelection')}</p><h2 id="cart-drawer-title" className="display mt-1 text-3xl uppercase">{t('cart')}</h2></div><button className="focus-ring p-2" onClick={close} aria-label={t('close')} data-testid="button-close-cart"><X size={20} /></button></div>{cart.length ? <><div className="flex-1 overflow-auto py-5">{cart.map((line) => <div className="flex gap-3 border-b hairline py-4" key={line.product.id}><div className="w-16 shrink-0"><ProductVisual product={line.product} /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold">{productName(lang, line.product.name, line.product.arabicName)}</p><p className="mono mt-1 text-xs">{formatDa(line.product.price)}</p><div className="mt-3 flex items-center gap-3"><button onClick={() => updateQuantity(line.product.id, -1)} className="focus-ring border hairline px-2 py-1" aria-label={t('decreaseQuantity')} data-testid={`button-drawer-decrease-${line.product.id}`}>−</button><span className="mono text-xs">{line.quantity}</span><button onClick={() => updateQuantity(line.product.id, 1)} className="focus-ring border hairline px-2 py-1" aria-label={t('increaseQuantity')} data-testid={`button-drawer-increase-${line.product.id}`}><Plus size={12} /></button></div></div></div>)}</div><div className="border-t hairline pt-5"><div className="flex items-center justify-between"><span className="text-xs font-bold">{t('subtotalFixture')}</span><span className="mono font-bold" data-testid="text-cart-total">{formatDa(total)}</span></div><p className="mt-2 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{t('deliveryCalculated')}</p><Link href="/cart" onClick={close} className="focus-ring mt-5 flex items-center justify-center gap-2 bg-[hsl(var(--primary))] py-3 text-xs font-bold text-white" data-testid="link-drawer-cart">{t('seeCart')} <ArrowRight size={15} /></Link></div></> : <EmptyState title={t('emptyCart')} text={t('addReference')} action={t('viewShop')} onAction={close} link="/shop" />}</aside></div>;
}

function CartPage({ cart, updateQuantity }: { cart: CartLine[]; updateQuantity: (id: string, change: number) => void }) {
  const { t, lang } = useI18n();
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  return <main className="mx-auto max-w-[1200px] px-5 py-10 lg:px-10 lg:py-16"><div className="mb-10"><p className="eyebrow mb-3">{t('stepSelection')}</p><h1 className="display text-6xl font-semibold uppercase">{t('yourCart')}</h1></div>{cart.length === 0 ? <EmptyState title={t('emptyReference')} text={t('exploreToStart')} action={t('exploreShop')} link="/shop" /> : <div className="grid gap-10 lg:grid-cols-[1.3fr_.7fr]"><div>{cart.map((line) => <div className="flex gap-4 border-t hairline py-5" key={line.product.id}><div className="w-24 shrink-0 sm:w-32"><ProductVisual product={line.product} /></div><div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row"><div><p className="eyebrow">{categoryName(lang, line.product.category)}</p><h2 className="mt-1 font-bold">{productName(lang, line.product.name, line.product.arabicName)}</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{line.product.format.replace('visual fixture', t('fixture'))}</p></div><div className="flex items-end justify-between gap-5 sm:flex-col sm:items-end"><span className="mono font-bold">{formatDa(line.product.price * line.quantity)}</span><div className="flex items-center border hairline"><button className="focus-ring px-2 py-1" onClick={() => updateQuantity(line.product.id, -1)} aria-label={t('decreaseQuantity')} data-testid={`button-cart-decrease-${line.product.id}`}>−</button><span className="mono px-2 text-xs">{line.quantity}</span><button className="focus-ring px-2 py-1" onClick={() => updateQuantity(line.product.id, 1)} aria-label={t('increaseQuantity')} data-testid={`button-cart-increase-${line.product.id}`}><Plus size={13} /></button></div></div></div></div>)}</div><aside className="h-fit border hairline bg-[hsl(var(--card))] p-5 sm:p-7"><p className="eyebrow">{t('summary')}</p><div className="mt-5 flex justify-between text-sm"><span>{t('subtotal')}</span><span className="mono font-bold">{formatDa(total)}</span></div><div className="mt-3 flex justify-between text-sm text-[hsl(var(--muted-foreground))]"><span>{t('delivery')}</span><span>{t('toDetermine')}</span></div><div className="my-5 border-t hairline pt-5"><div className="flex justify-between"><span className="font-bold">{t('indicativeTotal')}</span><span className="mono font-bold">{formatDa(total)}</span></div><p className="mt-2 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{t('serverConfirms')}</p></div><Link href="/checkout" className="focus-ring flex items-center justify-center gap-2 bg-[hsl(var(--primary))] py-3 text-xs font-bold text-white" data-testid="link-start-checkout">{t('continueCod')} <ArrowRight size={15} /></Link></aside></div>}</main>;
}

function CheckoutPage({ cart }: { cart: CartLine[] }) {
  const { t, lang } = useI18n();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: '', phone: '', wilaya: '', commune: '', delivery: 'home' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const submit = (event: FormEvent) => { event.preventDefault(); setTouched(true); if (!form.name || !form.phone || !form.wilaya || !form.commune) { setError(t('requiredFields')); return; } setError(''); setBusy(true); window.setTimeout(() => { setBusy(false); navigate('/confirmation'); }, 650); };
  return <main className="mx-auto max-w-[1200px] px-5 py-10 lg:px-10 lg:py-16"><div className="mb-10"><p className="eyebrow mb-3">{t('stepCod')}</p><h1 className="display text-6xl font-semibold uppercase">{t('whereDeliver')}</h1><p className="mt-3 max-w-xl text-sm text-[hsl(var(--muted-foreground))]">{t('demoJourney')}</p></div><div className="grid gap-10 lg:grid-cols-[1fr_.7fr]"><form onSubmit={submit} className="space-y-7" noValidate><FormSection title={t('contactDetails')} index="01"><div className="grid gap-4 sm:grid-cols-2"><Field label={t('fullName')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder={lang === 'ar' ? 'مثال: أمل منصوري' : 'Ex. Amel Mansouri'} required invalid={touched && !form.name} testId="input-checkout-name" /><Field label={t('phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="05 5x xx xx xx" required invalid={touched && !form.phone} testId="input-checkout-phone" /></div></FormSection><FormSection title={t('destination')} index="02"><div className="grid gap-4 sm:grid-cols-2"><Field label={t('wilaya')} value={form.wilaya} onChange={(v) => setForm({ ...form, wilaya: v })} placeholder={lang === 'ar' ? 'الجزائر' : 'Alger'} required invalid={touched && !form.wilaya} testId="input-checkout-wilaya" /><Field label={t('commune')} value={form.commune} onChange={(v) => setForm({ ...form, commune: v })} placeholder={t('commune')} required invalid={touched && !form.commune} testId="input-checkout-commune" /></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className={`focus-within:border-[hsl(var(--primary))] flex cursor-pointer gap-3 border p-4 ${form.delivery === 'home' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)]' : 'hairline'}`}><input type="radio" checked={form.delivery === 'home'} onChange={() => setForm({ ...form, delivery: 'home' })} name="delivery" data-testid="radio-delivery-home" /><span><b className="block text-sm">{t('homeDelivery')}</b><small className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{t('rateToConfirm')}</small></span></label><label className={`focus-within:border-[hsl(var(--primary))] flex cursor-pointer gap-3 border p-4 ${form.delivery === 'desk' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)]' : 'hairline'}`}><input type="radio" checked={form.delivery === 'desk'} onChange={() => setForm({ ...form, delivery: 'desk' })} name="delivery" data-testid="radio-delivery-desk" /><span><b className="block text-sm">{t('relayPoint')}</b><small className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{t('ifAvailable')}</small></span></label></div></FormSection><FormSection title={t('payment')} index="03"><div className="flex items-start gap-3 border hairline bg-[hsl(var(--muted)/.4)] p-4"><CreditCard className="mt-0.5 text-[hsl(var(--primary))]" size={18} /><div><b className="text-sm">{t('cashOnDelivery')}</b><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{t('codPresented')}</p></div></div></FormSection>{error && <p className="border-s-2 border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/.08)] px-3 py-2 text-xs font-bold text-[hsl(var(--destructive))]" role="alert" data-testid="alert-checkout-error">{error}</p>}<button className="focus-ring flex w-full items-center justify-center gap-2 bg-[hsl(var(--primary))] py-4 text-xs font-bold text-white disabled:opacity-50" disabled={busy || cart.length === 0} aria-describedby={cart.length === 0 ? 'checkout-disabled-reason' : undefined} data-testid="button-submit-checkout">{busy ? t('preparingView') : t('previewConfirmation')} <ArrowRight size={16} /></button>{cart.length === 0 && <p id="checkout-disabled-reason" className="text-xs font-bold text-[hsl(var(--muted-foreground))]" role="status">{lang === 'ar' ? 'أضف منتجاً إلى السلة قبل متابعة المعاينة.' : 'Ajoutez une référence au panier avant de continuer.'}</p>}</form><aside className="h-fit border hairline bg-[hsl(var(--card))] p-5 lg:sticky lg:top-24"><p className="eyebrow">{t('yourOrder')}</p>{cart.length ? cart.map((line) => <div className="mt-4 flex justify-between gap-3 text-xs" key={line.product.id}><span>{line.quantity} × {productName(lang, line.product.name, line.product.arabicName)}</span><span className="mono font-bold">{formatDa(line.product.price * line.quantity)}</span></div>) : <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">{t('cartEmpty')}</p>}<div className="mt-6 border-t hairline pt-5"><div className="flex justify-between font-bold"><span>{t('totalIndicative')}</span><span className="mono">{formatDa(total)}</span></div></div></aside></div></main>;
}

function FormSection({ title, index, children }: { title: string; index: string; children: ReactNode }) { return <section className="border-t hairline pt-5"><div className="mb-5 flex items-center gap-3"><span className="mono text-[10px] text-[hsl(var(--primary))]">{index}</span><h2 className="font-bold">{title}</h2></div>{children}</section>; }
function Field({ label, value, onChange, placeholder, required, invalid, testId }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; required?: boolean; invalid?: boolean; testId: string }) { return <label className="block"><span className="mb-2 block text-xs font-bold">{label}{required && <span className="text-[hsl(var(--primary))]"> *</span>}</span><input className={`focus-ring w-full border bg-[hsl(var(--card))] px-3 py-3 text-sm outline-none ${invalid ? 'border-[hsl(var(--destructive))]' : 'hairline'}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid={testId} aria-invalid={invalid} /></label>; }

function ConfirmationPage() { const { t } = useI18n(); return <main className="mx-auto max-w-3xl px-5 py-16 text-center lg:py-28"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[hsl(var(--accent)/.55)] text-[hsl(var(--secondary))]"><Check size={28} /></div><p className="eyebrow mt-8">{t('successFixture')}</p><h1 className="display mt-3 text-6xl font-semibold uppercase sm:text-8xl">{t('readyToConnect')}</h1><p className="mx-auto mt-6 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{t('codPreviewed')}</p><div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/shop" className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-white" data-testid="link-confirmation-shop">{t('returnShop')} <ArrowRight size={15} /></Link><Link href="/account" className="focus-ring flex items-center gap-2 border hairline px-5 py-3 text-xs font-bold" data-testid="link-confirmation-account">{t('seeAccount')}</Link></div></main>; }
function AccountPage() { const { t } = useI18n(); return <main className="mx-auto max-w-[1200px] px-5 py-10 lg:px-10 lg:py-16"><p className="eyebrow mb-3">{t('customerSpace')}</p><h1 className="display text-6xl font-semibold uppercase">{t('yourAccount')}</h1><div className="mt-10 grid gap-5 sm:grid-cols-3"><AccountTile icon={<ClipboardList />} title={t('orders')} text={t('trackOrders')} href="/orders" /><AccountTile icon={<RefreshCw />} title={t('returns')} text={t('returnRules')} href="/returns" /><AccountTile icon={<UserRound />} title={t('profile')} text={t('profileText')} href="/help" /></div><div className="mt-12 border hairline bg-[hsl(var(--muted)/.35)] p-6"><p className="eyebrow">{t('mockupState')}</p><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{t('notConnected')}</p></div></main>; }
function AccountTile({ icon, title, text, href }: { icon: ReactNode; title: string; text: string; href: string }) { return <Link href={href} className="focus-ring border hairline bg-[hsl(var(--card))] p-5 transition-transform hover:-translate-y-1" data-testid={`link-account-${title.toLowerCase()}`}><span className="text-[hsl(var(--primary))]">{icon}</span><h2 className="mt-7 font-bold">{title}</h2><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{text}</p><ArrowRight size={15} className="mt-7" /></Link>; }
 function OrdersPage() { const { t, lang } = useI18n(); return <main className="mx-auto max-w-[1200px] px-5 py-10 lg:px-10 lg:py-16"><p className="eyebrow mb-3">{t('customerSpace')}</p><h1 className="display text-6xl font-semibold uppercase">{t('yourOrders')}</h1><div className="mt-10 border-t hairline">{orders.map((order) => <Link href={`/orders/${order.id}`} key={order.id} className="focus-ring flex flex-col gap-3 border-b hairline py-5 transition-colors hover:bg-[hsl(var(--muted)/.45)] sm:flex-row sm:items-center sm:justify-between" data-testid={`link-order-${order.id}`}><div><p className="mono text-xs font-bold">{order.id}</p><p className="mt-1 text-sm"><span className="date-value">{orderDate(lang, order.date)}</span> · <span className="numeric-value">{order.items}</span> {lang === 'ar' ? 'عنصر' : 'article(s)'}</p></div><div className="flex items-center gap-5"><StatusLabel status={order.status} /><span className="mono text-sm font-bold">{order.total}</span><ArrowRight size={15} /></div></Link>)}</div></main>; }
function OrderDetailPage() {
  const { t, lang } = useI18n();
  const [, params] = useRoute('/orders/:id');
  const [cancelled, setCancelled] = useState(false);
  const [deliveryRetry, setDeliveryRetry] = useState(false);
  const order = orders.find((item) => item.id === params?.id) ?? orders[0];
  const lines = (orderProductIds[order.id] ?? []).map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product));
  const subtotal = lines.reduce((sum, product) => sum + product.price, 0);
  const failedDelivery = order.id === 'PN-1046';
  const canCancel = order.status === 'À confirmer' && !cancelled;
  const text = (fr: string, ar: string) => lang === 'ar' ? ar : fr;
  const timeline = [
     [text('Commande créée', 'تم إنشاء الطلب'), <span className="date-value">{orderDate(lang, order.date)}</span>, CheckCircle2],
    [text('Confirmation en attente', 'بانتظار التأكيد'), text('Équipe locale', 'الفريق المحلي'), Clock3],
    [text('Suivi transporteur', 'تتبع الناقل'), text('Non disponible dans la fixture', 'غير متوفر ضمن البيانات التجريبية'), Truck],
  ] as const;
  return <main className="mx-auto max-w-[1160px] px-5 py-10 lg:px-10 lg:py-16">
    <Link href="/orders" className="focus-ring mb-8 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))]" data-testid="link-back-orders"><ArrowLeft size={15} /> {t('allOrders')}</Link>
    <div className="flex flex-col justify-between gap-5 border-b hairline pb-7 sm:flex-row sm:items-end">
      <div><p className="eyebrow">{t('localOrder')}</p><h1 className="display mt-2 text-5xl font-semibold uppercase">{order.id}</h1><p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{text('Dernière lecture locale · aucune donnée serveur', 'آخر قراءة محلية · لا توجد بيانات من الخادم')}</p></div>
      <div className="flex flex-wrap items-center gap-4"><StatusLabel status={order.status} /><button type="button" disabled={!canCancel} onClick={() => setCancelled(true)} className="focus-ring border hairline px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-customer-cancel-order">{cancelled ? text('Annulation prévisualisée', 'تمت معاينة الإلغاء') : canCancel ? text('Annuler la commande', 'إلغاء الطلب') : text('Annulation indisponible', 'الإلغاء غير متاح')}</button></div>
    </div>
     {failedDelivery && <div className="mt-6 flex items-start gap-3 border border-[hsl(var(--destructive)/.5)] bg-[hsl(var(--destructive)/.08)] p-4 text-xs" role="alert" data-testid="alert-customer-failed-delivery"><AlertTriangle size={17} className="shrink-0 text-[hsl(var(--destructive))]" /><div><b>{text('Échec de livraison — état fixture', 'فشل التوصيل — حالة تجريبية')}</b><p className="mt-1 leading-5">{text('Le transporteur et la re-tentative restent à configurer. Aucun incident réel n’a été ouvert.', 'الناقل وإعادة المحاولة بانتظار الإعداد. لم يفتح أي بلاغ حقيقي.')}</p><button type="button" onClick={() => setDeliveryRetry(true)} className="focus-ring mt-3 underline" data-testid="button-customer-delivery-retry">{deliveryRetry ? text('Re-tentative préparée localement', 'تم تحضير إعادة المحاولة محلياً') : text('Préparer une re-tentative locale', 'تحضير إعادة محاولة محلية')}</button>{deliveryRetry && <p className="mt-2 text-[11px] font-bold text-[hsl(var(--accent-foreground))]" role="status">{text('Aucun transporteur réel n’a été contacté.', 'لم يتم التواصل مع أي ناقل حقيقي.')}</p>}</div></div>}
    <div className="mt-8 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-5">
        <section className="border hairline bg-[hsl(var(--card))] p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><h2 className="display text-2xl uppercase">{text('Articles de la commande', 'عناصر الطلب')}</h2><StatusLabel status={order.status} /></div><div className="mt-5 border-t hairline">{lines.map((product) => <div key={product.id} className="flex items-center justify-between gap-4 border-b hairline py-4"><div><p className="text-sm font-bold">{productName(lang, product.name, product.arabicName)}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{product.format} · {text('quantité 1', 'الكمية ١')}</p></div><span className="mono text-sm font-bold">{formatDa(product.price)}</span></div>)}</div><div className="mt-5 space-y-2 text-xs"><div className="flex justify-between"><span>{text('Sous-total', 'المجموع الفرعي')}</span><span className="mono">{formatDa(subtotal)}</span></div><div className="flex justify-between"><span>{text('Livraison', 'التوصيل')}</span><span className="text-[hsl(var(--muted-foreground))]">{text('À confirmer', 'يحدد لاحقاً')}</span></div><div className="mt-3 flex justify-between border-t hairline pt-4 text-sm font-bold"><span>{text('Total indicatif', 'الإجمالي التقديري')}</span><span className="mono">{order.total}</span></div></div></section>
        <section className="border hairline p-5 sm:p-7"><h2 className="display text-2xl uppercase">{text('Historique de commande', 'سجل الطلب')}</h2><div className="mt-6 space-y-5">{timeline.map(([label, detail, Icon], index) => <div key={label} className="flex gap-3"><div className="flex flex-col items-center"><span className="grid h-7 w-7 place-items-center rounded-full bg-[hsl(var(--accent)/.55)] text-[hsl(var(--secondary))]"><Icon size={14} /></span>{index < timeline.length - 1 && <span className="mt-1 h-full min-h-6 w-px bg-[hsl(var(--border))]" />}</div><div className="pb-2"><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{detail}</p></div></div>)}</div></section>
      </div>
      <aside className="space-y-5">
        <section className="border hairline bg-[hsl(var(--card))] p-5"><h2 className="display text-2xl uppercase">{text('Paiement', 'الدفع')}</h2><div className="mt-5 flex items-center justify-between text-xs"><span>{text('Méthode', 'الطريقة')}</span><span className="flex items-center gap-2 font-bold"><CreditCard size={14} /> COD</span></div><p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{text('Aucun paiement n’est capturé dans cette maquette.', 'لا يتم تحصيل أي دفعة ضمن هذا النموذج.')}</p></section>
        <section className="border hairline bg-[hsl(var(--card))] p-5"><h2 className="display text-2xl uppercase">{text('Livraison', 'التوصيل')}</h2><div className="mt-5 space-y-3 text-xs"><div className="flex justify-between gap-3"><span>{text('Méthode', 'الطريقة')}</span><span className="font-bold">{text('À confirmer', 'يحدد لاحقاً')}</span></div><div className="flex justify-between gap-3"><span>{text('Destination', 'الوجهة')}</span><span className="font-bold">{order.city}</span></div><div className="flex justify-between gap-3"><span>{text('Suivi', 'التتبع')}</span><span>{text('Non disponible', 'غير متوفر')}</span></div></div></section>
        <section className="border hairline p-5"><h2 className="display text-2xl uppercase">{text('Adresse', 'العنوان')}</h2><p className="mt-5 text-sm font-bold">{order.customer}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{text(`${order.city} · commune à confirmer`, `${order.city} · البلدية تحتاج إلى تأكيد`)}</p><p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{text('Adresse et téléphone masqués dans le fixture.', 'العنوان والهاتف مخفيان في البيانات التجريبية.')}</p></section>
      </aside>
    </div>
    <div className="mt-6 border hairline bg-[hsl(var(--muted)/.35)] p-5"><p className="eyebrow">{t('importantNote')}</p><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{t('timelineText')}</p></div>
  </main>;
}
function StatusLabel({ status }: { status: string }) {
  const { t, lang } = useI18n();
  const isConfirm = status.includes('confirm');
  const isPreparing = status.includes('préparation');
  const isDelivered = status.includes('Livr');
  const isOut = status.includes('Rupture');
  const tone = isConfirm ? 'primary' : isPreparing ? 'accent' : isDelivered ? 'chart-3' : isOut ? 'destructive' : 'chart-4';
  const Icon = isConfirm ? Clock3 : isPreparing ? Package : isDelivered ? PackageCheck : isOut ? AlertTriangle : CheckCircle2;
  return <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--${tone}))]`} aria-label={statusText(lang, status, t)}><Icon size={13} strokeWidth={2} aria-hidden="true" />{statusText(lang, status, t)}</span>;
}
function InfoPage({ titleKey, kickerKey, bodyKey, actionKey, actionPath }: { titleKey: Parameters<Translate>[0]; kickerKey: Parameters<Translate>[0]; bodyKey: Parameters<Translate>[0]; actionKey: Parameters<Translate>[0]; actionPath: string }) { const { t } = useI18n(); return <main className="mx-auto max-w-[1100px] px-5 py-16 lg:px-10 lg:py-24"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow mb-3">{t(kickerKey)}</p><h1 className="display text-7xl font-semibold uppercase leading-[.88]">{t(titleKey)}</h1></div><div className="border-s hairline ps-7"><p className="max-w-xl text-xl leading-9 text-[hsl(var(--muted-foreground))]">{t(bodyKey)}</p><Link href={actionPath} className="focus-ring mt-8 inline-flex items-center gap-2 bg-[hsl(var(--secondary))] px-5 py-3 text-xs font-bold text-white" data-testid="link-info-action">{t(actionKey)} <ArrowRight size={15} /></Link></div></div></main>; }

function OpsLauncherTheme2({ lang, onReturnStore }: { lang: Lang; onReturnStore: () => void }) {
  const { t } = useI18n();
  const alternateT = useMemo(() => createTranslator(lang === 'fr' ? 'ar' : 'fr'), [lang]);
  const priority: Array<[TranslationKey, string, NavIcon, string]> = [
    ['orders', '/ops/orders', ClipboardList, 'bg-[hsl(var(--primary))]'],
    ['pos', '/ops/pos', CreditCard, 'bg-[hsl(var(--secondary))]'],
    ['inventory', '/ops/inventory', Box, 'bg-[hsl(var(--accent))]'],
    ['delivery', '/ops/delivery', Truck, 'bg-[hsl(var(--chart-3))]'],
  ];
  const zoneStyles: Record<string, string> = {
    catalogue: 'border-t-[hsl(var(--chart-3))]',
    stock: 'border-t-[hsl(var(--accent))]',
    flow: 'border-t-[hsl(var(--chart-4))]',
    finance: 'border-t-[hsl(var(--secondary))]',
    control: 'border-t-[hsl(var(--primary))]',
  };
  return <main className="min-h-[calc(100dvh-64px)] bg-[hsl(var(--background))] px-4 py-7 sm:px-6 sm:py-10 lg:px-10 lg:py-12" aria-labelledby="ops-launcher-title">
    <div className="mx-auto max-w-[1380px]">
      <section className="grid gap-7 border-b hairline pb-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 bg-[hsl(var(--primary))]" /><p className="eyebrow">{inlineCopy(lang, 'Poste de pilotage / aujourd’hui', 'مركز القيادة / اليوم')}</p></div>
          <h1 id="ops-launcher-title" className="display mt-4 max-w-3xl text-5xl font-semibold uppercase leading-[.88] tracking-tight sm:text-7xl">{inlineCopy(lang, 'Le contrôle commence ici.', 'تبدأ السيطرة من هنا.')}</h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{inlineCopy(lang, 'Un accès court aux gestes qui font tourner Plazza : commander, encaisser, compter, expédier.', 'وصول سريع إلى الإجراءات التي تحرك بلازا: الطلب والتحصيل والجرد والإرسال.')}</p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex w-full items-center justify-between gap-4 border hairline bg-[hsl(var(--card))] p-4 lg:max-w-sm"><div><p className="eyebrow">{inlineCopy(lang, 'État local', 'الحالة المحلية')}</p><p className="mt-2 text-sm font-bold">{inlineCopy(lang, '4 signaux à regarder', '٤ إشارات للمراجعة')}</p></div><span className="mono text-2xl font-bold text-[hsl(var(--primary))]">04</span></div>
          <Link href="/ops/dashboard" className="focus-ring inline-flex w-full items-center justify-between gap-3 border hairline bg-[hsl(var(--secondary))] px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-[hsl(var(--primary))] lg:max-w-sm" data-testid="link-ops-launcher-dashboard"><span className="flex items-center gap-2"><LayoutDashboard size={15} />{inlineCopy(lang, 'Ouvrir le tableau de bord', 'فتح لوحة التحكم')}</span><ArrowRight size={14} /></Link>
          <Link href="/" onClick={onReturnStore} className="focus-ring inline-flex w-fit items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" data-testid="link-ops-launcher-store"><ArrowLeft size={15} />{t('returnStore')}</Link>
        </div>
      </section>
      <section className="mt-7" aria-labelledby="ops-priority-title">
        <div className="mb-3 flex items-center justify-between gap-3"><div><p className="eyebrow">{inlineCopy(lang, 'Priorités opérateur', 'أولويات المنفذ')}</p><h2 id="ops-priority-title" className="display mt-1 text-2xl uppercase">{inlineCopy(lang, 'Les quatre gestes utiles', 'الإجراءات الأربعة المهمة')}</h2></div><span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">01—04</span></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{priority.map(([key, path, Icon, tone], index) => <Link href={path} key={path} className={`focus-ring group relative min-h-[148px] overflow-hidden border border-[hsl(var(--secondary)/.2)] p-5 text-white transition-transform hover:-translate-y-1 ${tone}`} data-testid={`link-ops-priority-${path.split('/').pop()}`} aria-label={`${t(key)} / ${alternateT(key)}`}><span className="absolute -end-5 -top-7 text-white/10"><Icon size={112} strokeWidth={1} /></span><span className="relative flex h-full flex-col justify-between"><span className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center border border-white/25"><Icon size={19} /></span><span className="mono text-[10px] text-white/65">0{index + 1}</span></span><span><span className="block text-lg font-bold">{t(key)}</span><span className="mt-1 block text-[10px] text-white/70">{alternateT(key)}</span></span></span></Link>)}</div>
      </section>
      <section className="mt-9 grid gap-7 xl:grid-cols-[1fr_300px]" aria-label={inlineCopy(lang, 'Zones opérationnelles', 'المناطق التشغيلية')}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{opsGroups.filter((group) => group.label !== 'work').map((group, groupIndex) => <section key={group.label} className={`border border-t-4 hairline bg-[hsl(var(--card))] ${zoneStyles[group.label] ?? 'border-t-[hsl(var(--primary))]'}`} aria-labelledby={`ops-launcher-group-${group.label}`}><div className="flex items-start justify-between gap-3 p-5 pb-4"><div><p className="eyebrow">{group.label === 'stock' ? inlineCopy(lang, 'Logistique / stock', 'اللوجستيك / المخزون') : group.label === 'flow' ? inlineCopy(lang, 'Logistique / flux', 'اللوجستيك / التدفق') : t(group.label)}</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{group.label === 'stock' || group.label === 'flow' ? inlineCopy(lang, 'Logistique', 'اللوجستيك') : alternateT(group.label)}</p></div><span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">0{groupIndex + 1}</span></div><h2 id={`ops-launcher-group-${group.label}`} className="sr-only">{t(group.label)}</h2><div className="grid grid-cols-2 gap-px border-t hairline bg-[hsl(var(--border)/.75)]">{group.items.slice(0, 6).map(([key, path, Icon]) => <Link href={path} key={path} className="focus-ring group flex min-h-[104px] flex-col justify-between bg-[hsl(var(--card))] p-4 text-start transition-colors hover:bg-[hsl(var(--muted)/.55)]" data-testid={`link-ops-zone-${path.split('/').pop()}`} aria-label={`${t(key)} / ${alternateT(key)}`}><span className="flex items-start justify-between gap-2"><Icon size={19} strokeWidth={1.7} className="text-[hsl(var(--primary))]" /><ArrowRight size={13} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1" /></span><span><span className="block text-xs font-bold leading-4">{t(key)}</span><span className="mt-1 block text-[10px] text-[hsl(var(--muted-foreground))]">{alternateT(key)}</span></span></Link>)}</div></section>)}</div>
        <aside className="border hairline bg-[hsl(var(--secondary))] p-5 text-white xl:sticky xl:top-24 xl:self-start"><p className="eyebrow text-white/55">{inlineCopy(lang, 'Contexte compact', 'سياق مختصر')}</p><h2 className="display mt-2 text-3xl uppercase">{inlineCopy(lang, 'À garder en vue.', 'ما يجب أن يبقى واضحاً.')}</h2><div className="mt-6 divide-y divide-white/10">{opsStats.map((stat, index) => <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0" key={stat.label} data-testid={`status-ops-launcher-${index}`}><div><p className="text-[10px] uppercase tracking-wider text-white/50">{index === 0 ? t('attention') : index === 1 ? t('treatment') : index === 2 ? t('finance') : t('stock')}</p><p className="mono mt-1 text-lg font-bold">{stat.value}</p></div><span className={`h-2 w-2 ${index === 0 ? 'bg-[hsl(var(--primary))]' : index === 1 ? 'bg-[hsl(var(--accent))]' : index === 2 ? 'bg-[hsl(var(--chart-3))]' : 'bg-[hsl(var(--chart-4))]'}`} /></div>)}</div><div className="mt-7 border-t border-white/10 pt-4 text-[10px] leading-5 text-white/55">{t('fixtureBoundary')}</div></aside>
      </section>
      <div className="mt-8 flex items-center gap-3 border-t hairline pt-5 text-[10px] text-[hsl(var(--muted-foreground))]"><span className="h-2 w-2 bg-[hsl(var(--accent))]" />{t('fixtureMode')}<span className="ms-auto mono">{inlineCopy(lang, 'NAVIGATION LOCALE', 'تنقل محلي')}</span></div>
    </div>
  </main>;
}

function OperationsRouter({ authenticated, theme, onAuthenticated, onReturnStore }: { authenticated: boolean; theme: OpsTheme; onAuthenticated: () => void; onReturnStore: () => void }) {
  const { lang } = useI18n();
  const [location, navigate] = useLocation();
  useEffect(() => {
    if (authenticated && location === '/ops/login') navigate('/ops/dashboard');
  }, [authenticated, location, navigate]);
  if (!authenticated) return <OpsAuthSurface lang={lang} onAuthenticated={onAuthenticated} onReturnStore={onReturnStore} />;
  if (location === '/ops/login') return null;
  if (theme === 'theme2' && location === '/ops') return <OpsLauncherTheme2 lang={lang} onReturnStore={onReturnStore} />;
  return <ProfessionalOperationsSurface lang={lang} navigationMode={theme === 'theme2' ? 'rail' : 'sidebar'} />;
}

function OpsPage({ slug, title, subtitle }: { slug: string; title: string; subtitle: string }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState('all');
  const [dialog, setDialog] = useState(false);
  const isDashboard = slug === 'dashboard';
  const isOrders = slug === 'orders';
  const isProducts = slug === 'products' || slug === 'inventory';
  const isPos = slug === 'pos';
  const statKeys: Array<[string, string, string]> = [['attention', opsStats[0].value, opsStats[0].note], ['treatment', opsStats[1].value, opsStats[1].note], ['finance', opsStats[2].value, opsStats[2].note], ['stock', opsStats[3].value, opsStats[3].note]];
  return <OpsLayout title={title} subtitle={subtitle}><div className="space-y-7">
     {isDashboard && <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{statKeys.map(([key, value, note], index) => <div className="ops-metric border hairline bg-[hsl(var(--card))] p-5" key={key}><div className="flex items-center justify-between"><span className="eyebrow">{t(key as Parameters<Translate>[0])}</span><span className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-[hsl(var(--primary))]' : index === 1 ? 'bg-[hsl(var(--accent))]' : index === 2 ? 'bg-[hsl(var(--chart-3))]' : 'bg-[hsl(var(--chart-4))]'}`} /></div><p className="mono mt-5 text-2xl font-bold">{value}</p><p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">{note}</p></div>)}</div><div className="grid gap-7 lg:grid-cols-[1.3fr_.7fr]"><OpsTable title={t('processNow')} action={t('orders')} onAction={() => setDialog(true)} /><OpsInsight /></div></>}
    {!isDashboard && isPos && <PosPanel onAction={() => setDialog(true)} />}
    {!isDashboard && !isPos && <><div className="flex flex-col justify-between gap-3 border-b hairline pb-4 sm:flex-row sm:items-center"><div className="flex gap-2 overflow-auto">{[['all', 'allFilters'], ['attention', 'attention'], ['waiting', 'waiting'], ['done', 'done']].map(([value, key]) => <button key={value} className={`focus-ring whitespace-nowrap px-3 py-2 text-xs font-bold ${filter === value ? 'bg-[hsl(var(--secondary))] text-white' : 'border hairline text-[hsl(var(--muted-foreground))]'}`} onClick={() => setFilter(value)} data-testid={`button-filter-${value}`}>{t(key as Parameters<Translate>[0])}</button>)}</div><button className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-3 py-2 text-xs font-bold text-white" onClick={() => setDialog(true)} data-testid="button-ops-primary"><Plus size={15} /> {slug === 'products' ? t('newProduct') : slug === 'adjustments' ? t('newAdjustment') : t('newAction')}</button></div>{isOrders ? <OpsTable title={t('recentOrders')} action={t('exportView')} onAction={() => setDialog(true)} /> : isProducts ? <ProductOpsTable /> : <OpsModuleContent slug={slug} />}</>}
    {dialog && <OpsDialog title={slug === 'products' ? t('newProduct') : slug === 'pos' ? t('prepareTicket') : t('actionLocal')} close={() => setDialog(false)} />}
  </div></OpsLayout>;
}

function OpsTable({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  const { t, lang } = useI18n();
  return <section className="border hairline bg-[hsl(var(--card))]"><div className="flex items-center justify-between border-b hairline p-4 sm:p-5"><div><p className="eyebrow">{t('workflow')}</p><h2 className="mt-1 font-bold">{title}</h2></div><button className="focus-ring flex items-center gap-2 text-[11px] font-bold text-[hsl(var(--primary))]" onClick={onAction} data-testid="button-table-action">{action} <ArrowRight size={14} /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-start text-xs"><thead className="bg-[hsl(var(--muted)/.5)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><tr><th className="px-5 py-3 text-start">{lang === 'ar' ? 'المرجع' : 'Référence'}</th><th className="px-5 py-3 text-start">{lang === 'ar' ? 'العميل' : 'Client'}</th><th className="px-5 py-3 text-start">{lang === 'ar' ? 'الموقع' : 'Localisation'}</th><th className="px-5 py-3 text-start">{lang === 'ar' ? 'المبلغ' : 'Montant'}</th><th className="px-5 py-3 text-start">{lang === 'ar' ? 'الحالة' : 'État'}</th></tr></thead><tbody>{orders.map((order) => <tr className="border-t hairline" key={order.id}><td className="px-5 py-4 mono font-bold">{order.id}</td><td className="px-5 py-4">{order.customer}</td><td className="px-5 py-4 text-[hsl(var(--muted-foreground))]">{order.city}</td><td className="px-5 py-4 mono">{order.total}</td><td className="px-5 py-4"><StatusLabel status={order.status} /></td></tr>)}</tbody></table></div></section>;
}

function OpsInsight() { const { t } = useI18n(); return <section className="border hairline bg-[hsl(var(--secondary))] p-5 text-white"><p className="eyebrow text-white/50">{t('fixtureMode')}</p><h2 className="display mt-3 text-3xl uppercase">{t('noFakeCertainty')}</h2><p className="mt-4 text-sm leading-6 text-white/65">{t('fixtureBoundary')}</p><div className="mt-8 border-t border-white/15 pt-4 text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]">{t('boundary')}</div></section>; }

function ProductOpsTable() {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState<Product | null>(null);
  return <><section className="border hairline bg-[hsl(var(--card))]"><div className="border-b hairline p-5"><p className="eyebrow">{t('visualReference')}</p><h2 className="mt-1 font-bold">{t('productsAvailability')}</h2></div><div className="divide-y hairline">{products.map((product) => <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" key={product.id}><div className="flex items-center gap-3"><div className="h-10 w-10 shrink-0"><ProductVisual product={product} /></div><div><p className="text-sm font-bold">{productName(lang, product.name, product.arabicName)}</p><p className="text-[11px] text-[hsl(var(--muted-foreground))]">{categoryName(lang, product.category)} · {product.format.replace('visual fixture', t('fixture'))}</p></div></div><div className="flex items-center gap-7 sm:justify-end"><span className="mono text-xs">{formatDa(product.price)}</span><StatusLabel status={product.stock === 0 ? 'Rupture' : product.stock < 5 ? 'À surveiller' : 'Disponible'} /><button type="button" onClick={() => setEditing(product)} className="focus-ring p-2 text-[hsl(var(--muted-foreground))]" aria-label={`${t('edit')} ${productName(lang, product.name, product.arabicName)}`} data-testid={`button-edit-${product.id}`}><Pencil size={15} /></button></div></div>)}</div></section>{editing && <OpsDialog title={`${t('edit')} · ${productName(lang, editing.name, editing.arabicName)}`} close={() => setEditing(null)} />}</>;
}

function OpsModuleContent({ slug }: { slug: string }) {
  const { t } = useI18n();
  if (slug === 'finance') return <FinanceModule />;
  if (slug === 'reports') return <ReportsModule />;
  const copy: Record<string, string> = {
    customers: t('profileText'), movements: t('fixtureBoundary'), purchasing: t('notConnected'), receiving: t('fixtureBoundary'),
    delivery: t('deliveryText'), returns: t('afterDeliveryText'), finance: t('fixtureBoundary'), reports: t('fixtureBoundary'),
    staff: t('staffRoles'), notifications: t('noRealAction'), settings: t('notConnected'),
  };
  return <div className="grid gap-5 lg:grid-cols-[1fr_.65fr]"><div className="border hairline bg-[hsl(var(--card))] p-6"><p className="eyebrow">{t('modulePreparing')}</p><h2 className="display mt-4 text-4xl uppercase">{t('traceWork')}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">{copy[slug] ?? t('fixtureBoundary')}</p><div className="mt-8 grid gap-3 sm:grid-cols-3">{[['loading', 'loading'], ['empty', 'empty'], ['error', 'error']].map(([key, label]) => <div className="border hairline p-3" key={key}><p className="eyebrow">{t(label as Parameters<Translate>[0])}</p><p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{t('stateReady')}</p></div>)}</div></div><div className="border hairline bg-[hsl(var(--muted)/.45)] p-6"><p className="eyebrow">{t('localChecklist')}</p>{[['readableFilters', <SlidersHorizontal size={15} />], ['explicitAudit', <FileText size={15} />], ['noPersistence', <CircleHelp size={15} />], ['visibleRole', <Users size={15} />]].map(([key, icon]) => <div className="flex items-center gap-3 border-b hairline py-4 text-sm" key={key as string}><span className="text-[hsl(var(--accent-foreground))]">{icon as ReactNode}</span>{t(key as Parameters<Translate>[0])}</div>)}</div></div>;
}

function FinanceModule() {
  const { t, lang } = useI18n();
  const delivered = orders.filter((order) => order.status === 'Livrée').length;
  const pending = orders.filter((order) => order.status === 'À confirmer' || order.status === 'En préparation').length;
  const financeMetrics: Array<[string, string, string, NavIcon]> = [
    [t('financeGross'), opsStats[2].value, t('sevenDayFixture'), Wallet],
    [t('financePending'), String(pending), t('ordersFromFixture'), Clock3],
    [t('financeDelivered'), String(delivered), t('deliveredFromFixture'), CheckCircle2],
  ];
  return <div className="space-y-5">
     <div className="grid gap-3 sm:grid-cols-3">{financeMetrics.map(([label, value, note, Icon]) => <div className="ops-metric border hairline bg-[hsl(var(--card))] p-5" key={label}><div className="flex items-start justify-between gap-3"><p className="eyebrow">{label}</p><Icon size={16} className="text-[hsl(var(--primary))]" /></div><p className="mono mt-4 text-2xl font-bold">{value}</p><p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">{note}</p></div>)}</div>
    <section className="border hairline bg-[hsl(var(--card))] p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3 border-b hairline pb-5"><div><p className="eyebrow">{t('financeLedger')}</p><h2 className="mt-1 font-bold">{t('financeReadout')}</h2></div><span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{lang === 'ar' ? 'بيانات محلية' : 'LOCAL FIXTURE'}</span></div><div className="mt-5 space-y-3">{orders.map((order) => <div className="analytical-rule flex flex-wrap items-center justify-between gap-3 border-b hairline pb-3 ps-4 text-xs" key={order.id}><span className="mono font-bold">{order.id}</span><span className="text-[hsl(var(--muted-foreground))]">{order.customer} · {order.city}</span><span className="mono font-bold">{order.total}</span><StatusLabel status={order.status} /></div>)}</div><p className="mt-5 text-[10px] leading-5 text-[hsl(var(--muted-foreground))]">{t('financeBoundary')}</p></section>
  </div>;
}

function ReportsModule() {
  const { t, lang } = useI18n();
  const categoryRows = Array.from(new Set(products.map((product) => product.category))).map((category) => {
    const items = products.filter((product) => product.category === category);
    return { category, count: items.length, available: items.filter((product) => product.stock > 0).length, units: items.reduce((sum, product) => sum + product.stock, 0) };
  });
  return <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><section className="border hairline bg-[hsl(var(--card))] p-5 sm:p-6"><div className="flex items-end justify-between border-b hairline pb-5"><div><p className="eyebrow">{t('reportInventory')}</p><h2 className="mt-1 font-bold">{t('reportCategoryReadout')}</h2></div><BarChart3 size={18} className="text-[hsl(var(--primary))]" /></div><div className="mt-2">{categoryRows.map((row) => <div className="border-b hairline py-4 text-xs" key={row.category}><div className="flex items-center justify-between gap-4"><span className="font-bold">{categoryName(lang, row.category)}</span><span className="mono font-bold">{row.units} {t('reportUnits')}</span></div><div className="mt-3 flex items-center gap-3"><div className="h-1.5 flex-1 bg-[hsl(var(--muted))]" aria-hidden="true"><div className="h-full bg-[hsl(var(--accent))]" style={{ width: `${row.count ? (row.available / row.count) * 100 : 0}%` }} /></div><span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{row.available}/{row.count} {t('reportAvailable')}</span></div></div>)}</div><p className="mt-4 text-[10px] leading-5 text-[hsl(var(--muted-foreground))]">{t('reportBoundary')}</p></section><section className="border hairline bg-[hsl(var(--secondary))] p-5 text-white sm:p-6"><p className="eyebrow text-white/50">{t('reportReadout')}</p><h2 className="display mt-3 text-3xl uppercase">{t('reportDecision')}</h2><div className="mt-7 space-y-4 border-t border-white/15 pt-4 text-xs"><div className="flex justify-between gap-4"><span className="text-white/60">{t('reportOrders')}</span><span className="mono font-bold">{orders.length}</span></div><div className="flex justify-between gap-4"><span className="text-white/60">{t('reportCatalog')}</span><span className="mono font-bold">{products.length}</span></div><div className="flex justify-between gap-4"><span className="text-white/60">{t('reportUnits')}</span><span className="mono font-bold">{products.reduce((sum, product) => sum + product.stock, 0)}</span></div></div><p className="mt-7 border-t border-white/15 pt-4 text-[10px] leading-5 text-white/55">{t('reportBoundary')}</p></section></div>;
}

function PosPanel({ onAction }: { onAction: () => void }) {
  const { t, lang } = useI18n();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const list = products.filter((p) => `${p.name} ${p.arabicName} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
   const add = (product: Product) => setCart((current) => current.some((line) => line.product.id === product.id) ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }]);
   const update = (id: string, change: number) => setCart((current) => current.flatMap((line) => line.product.id === id ? line.quantity + change <= 0 ? [] : [{ ...line, quantity: line.quantity + change }] : [line]));
  const clear = () => setCart([]);
   return <div className="grid gap-5 xl:grid-cols-[1fr_380px]"><section className="border hairline bg-[hsl(var(--card))] p-4 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">{t('sessionLocal')}</p><h2 className="mt-1 font-bold">{t('newSale')}</h2></div><div className="flex items-center gap-3"><span className="flex items-center gap-2 text-[10px] font-bold text-[hsl(var(--accent-foreground))]"><CheckCircle2 size={13} /> {t('onlineVisual')}</span><span className="hidden border-s hairline ps-3 text-[10px] text-[hsl(var(--muted-foreground))] sm:inline">{t('cashSession')}</span></div></div><label className="focus-within:border-[hsl(var(--primary))] mt-5 flex items-center gap-3 border hairline px-3 py-3"><Search size={16} /><input className="w-full bg-transparent text-sm outline-none" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchOrScan')} data-testid="input-pos-search" /><ScanLine size={16} className="text-[hsl(var(--muted-foreground))]" /></label><div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[hsl(var(--muted-foreground))]"><span className="border hairline px-2 py-1">/ {t('shortcutSearch')}</span><span className="border hairline px-2 py-1">↵ {t('shortcutAdd')}</span><button onClick={clear} className="focus-ring border hairline px-2 py-1" data-testid="button-pos-clear">{t('shortcutClear')}</button></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{list.map((product) => { const selected = cart.find((line) => line.product.id === product.id); return <button onClick={() => add(product)} className={`focus-ring flex min-h-16 items-center justify-between border p-3 text-start transition-colors hover:border-[hsl(var(--primary))] ${selected ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`} key={product.id} data-testid={`button-pos-product-${product.id}`} aria-label={`${productName(lang, product.name, product.arabicName)}${selected ? ` · ${selected.quantity}` : ''}`}><span><b className="block text-xs">{productName(lang, product.name, product.arabicName)}</b><small className="mono text-[10px]">{formatDa(product.price)} · {product.stock > 0 ? t('available') : t('outOfStock')}</small></span><span className="flex items-center gap-2">{selected && <span className="mono grid h-6 min-w-6 place-items-center bg-[hsl(var(--secondary))] px-1 text-[10px] text-white">{selected.quantity}</span>}{selected ? <Check size={15} /> : <Plus size={15} />}</span></button>; })}</div>{!list.length && <EmptyState title={t('noResults')} text={t('tryOther')} action={t('reset')} onAction={() => setSearch('')} />}</section><aside className="flex min-h-[360px] flex-col border hairline bg-[hsl(var(--secondary))] p-5 text-white"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-white/50">{t('registerCart')}</p><p className="mt-1 text-[10px] text-white/55">{t('sessionOpen')}</p></div><CreditCard size={18} className="text-[hsl(var(--primary))]" /></div><div className="flex-1 py-6">{cart.length ? cart.map((line) => <div className="border-b border-white/10 py-3 text-xs" key={line.product.id}><div className="flex items-center justify-between gap-3"><span className="min-w-0 truncate">{line.quantity} × {productName(lang, line.product.name, line.product.arabicName)}</span><span className="mono shrink-0">{formatDa(line.product.price * line.quantity)}</span></div><div className="mt-2 flex items-center gap-2"><button className="focus-ring border border-white/20 px-2 py-1 text-[10px]" onClick={() => update(line.product.id, -1)} aria-label={t('decreaseQuantity')} data-testid={`button-pos-decrease-${line.product.id}`}>−</button><span className="mono px-1 text-[10px]">{line.quantity}</span><button className="focus-ring border border-white/20 px-2 py-1 text-[10px]" onClick={() => update(line.product.id, 1)} aria-label={t('increaseQuantity')} data-testid={`button-pos-increase-${line.product.id}`}><Plus size={11} /></button></div></div>) : <div className="flex h-full min-h-48 items-center justify-center text-center"><div><ShoppingCart className="mx-auto text-white/30" size={28} /><p className="mt-3 text-sm text-white/65">{t('noItems')}</p><p className="mt-1 text-[10px] text-white/45">{t('draftVisual')}</p></div></div>}</div><div className="border-t border-white/15 pt-4"><div className="flex justify-between text-sm"><span>{t('totalIndicative')}</span><span className="mono">{formatDa(total)}</span></div><button className="focus-ring mt-4 w-full bg-[hsl(var(--primary))] py-3 text-xs font-bold" onClick={onAction} data-testid="button-pos-checkout">{t('prepareTicket')}</button><p className="mt-3 flex items-center gap-2 text-[10px] text-white/55"><CircleHelp size={13} /> {t('noCommit')}</p></div></aside></div>;
}

function OpsDialog({ title, close }: { title: string; close: () => void }) { const { t } = useI18n(); return <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(var(--secondary)/.5)] p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md border hairline bg-[hsl(var(--background))] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="eyebrow">{t('actionLocal')}</p><h2 className="display mt-1 text-3xl uppercase">{title}</h2></div><button className="focus-ring" onClick={close} aria-label={t('close')} data-testid="button-close-ops-dialog"><X size={18} /></button></div><p className="mt-5 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{t('localActionText')}</p><label className="mt-6 block"><span className="mb-2 block text-xs font-bold">{t('label')}</span><input className="focus-ring w-full border hairline bg-[hsl(var(--card))] px-3 py-3 text-sm" placeholder={t('label')} data-testid="input-ops-dialog" /></label><div className="mt-6 flex justify-end gap-2"><button className="focus-ring border hairline px-4 py-2 text-xs font-bold" onClick={close} data-testid="button-cancel-ops-dialog">{t('cancel')}</button><button className="focus-ring bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white" onClick={close} data-testid="button-confirm-ops-dialog">{t('saveView')}</button></div></div></div>; }
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }

export default App;