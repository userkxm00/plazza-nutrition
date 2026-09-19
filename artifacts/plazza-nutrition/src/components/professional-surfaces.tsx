import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
  AlertCircle, Archive, ArrowLeft, ArrowRight, BarChart3, Bell, Boxes, Check, CheckCircle2, ChevronDown, ChevronUp, Clock3,
  ClipboardCheck, CreditCard, Download, FileText, History, Info, LockKeyhole, Menu, Package,
  PackageCheck, Plus, Receipt, RefreshCcw, Scan, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, Tag, Truck, UserRound, Users, Wallet, X,
} from 'lucide-react';
import { formatDa, orders, products, type Product } from '@/lib/mock-service';
import { categoryName, orderDate, productName, type Lang } from '@/lib/i18n';
import {
  Boundary, InputField, Metric, OpsTable, PageHeader as SurfaceTitle, PlazzaButton, SelectField, StatusBadge,
} from '@/components/plazza-ui';

type CartLine = { product: Product; quantity: number };
type OpsKind =
  | 'dashboard' | 'orders' | 'customers' | 'products' | 'categories' | 'inventory' | 'movements'
  | 'purchasing' | 'receiving' | 'batches' | 'delivery' | 'returns' | 'exchanges' | 'refunds'
  | 'pos' | 'cash' | 'finance' | 'expenses' | 'profitability' | 'reports' | 'coupons'
  | 'reviews' | 'staff' | 'roles' | 'notifications' | 'audit' | 'settings';

const copy = (lang: Lang, fr: string, ar: string) => lang === 'ar' ? ar : fr;
const money = (value: number) => formatDa(value);

type CoverageState = {
  label: [string, string];
  detail: [string, string];
  href: string;
  tone: 'good' | 'warn' | 'bad' | 'info' | 'neutral';
};

function StateCoveragePanel({ lang, states }: { lang: Lang; states: CoverageState[] }) {
  return <section className="mt-7 border hairline bg-[hsl(var(--card))] p-5 sm:p-6" aria-labelledby="state-coverage-title">
    <div className="flex flex-wrap items-end justify-between gap-3 border-b hairline pb-4">
      <div>
        <p className="eyebrow">{copy(lang, 'États reliés aux pages', 'الحالات المرتبطة بالصفحات')}</p>
        <h2 id="state-coverage-title" className="display mt-1 text-2xl uppercase">{copy(lang, 'Parcours à vérifier', 'مسارات للتحقق')}</h2>
      </div>
      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{copy(lang, 'Fixtures locales · aucun effet serveur', 'بيانات محلية · دون أثر على الخادم')}</span>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {states.map((state) => <Link key={state.label[0]} href={state.href} className="focus-ring border hairline p-4 transition-colors hover:border-[hsl(var(--primary))]">
        <StatusBadge label={copy(lang, state.label[0], state.label[1])} tone={state.tone} />
        <p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{copy(lang, state.detail[0], state.detail[1])}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold text-[hsl(var(--primary))]">{copy(lang, 'Ouvrir la surface', 'فتح الصفحة')}<ArrowRight size={13} /></span>
      </Link>)}
    </div>
  </section>;
}

function PreviewDialog({ lang, title, description, close, children, onConfirm, confirmLabel, destructive = false }: {
  lang: Lang; title: string; description: string; close: () => void; children?: ReactNode; onConfirm?: () => void; confirmLabel?: string; destructive?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => dialogRef.current
      ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
      : [];
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = originalOverflow; document.removeEventListener('keydown', onKeyDown); previous?.focus(); };
  }, [close]);
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[hsl(var(--secondary)/.65)] sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="preview-dialog-title" aria-describedby="preview-dialog-description" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <div ref={dialogRef} className="max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-y-auto border hairline bg-[hsl(var(--background))] p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{copy(lang, 'Aperçu local', 'معاينة محلية')}</p><h2 id="preview-dialog-title" className="display mt-1 text-3xl uppercase">{title}</h2></div><button type="button" onClick={close} className="focus-ring p-1" aria-label={copy(lang, 'Fermer', 'إغلاق')}><X size={18} /></button></div>
      <p id="preview-dialog-description" className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>
      {children && <div className="mt-5">{children}</div>}
      <Boundary tone={destructive ? 'warn' : 'neutral'}>{copy(lang, 'Aucune donnée ne sera enregistrée ni transmise dans cette version.', 'لن يتم حفظ أو إرسال أي بيانات في هذه النسخة.')}</Boundary>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><PlazzaButton variant="outline" onClick={close}>{copy(lang, 'Annuler', 'إلغاء')}</PlazzaButton>{onConfirm && <PlazzaButton variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel ?? copy(lang, 'Confirmer la prévisualisation', 'تأكيد المعاينة')}</PlazzaButton>}</div>
    </div>
  </div>;
}

function Spec({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="border hairline bg-[hsl(var(--muted)/.25)] p-3"><p className="eyebrow">{label}</p><p className={`mt-2 text-xs font-bold ${mono ? 'mono' : ''}`}>{value}</p></div>;
}

function ProductMedia({ product, active, onSelect }: { product: Product; active: number; onSelect: (index: number) => void }) {
  return <div><div className={`product-visual product-visual--${product.tone} relative aspect-square overflow-hidden`}><img src={product.media} alt={product.mediaAlt || product.name} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-[hsl(var(--secondary)/.18)]" /><span className="fixture-label absolute start-5 top-5 border border-white/30 bg-[hsl(var(--secondary)/.5)] px-2 py-1 text-[9px] font-bold uppercase tracking-[.15em] text-white">{product.mediaSource === 'merchant' ? 'MERCHANT MEDIA' : 'REFERENCE MEDIA'}</span><button type="button" className="focus-ring absolute bottom-5 end-5 border border-white/40 bg-[hsl(var(--secondary)/.55)] px-3 py-2 text-[10px] font-bold text-white" onClick={() => onSelect(active)}>{copyText('Zoom', 'تكبير')}</button></div><div className="mt-3 grid grid-cols-4 gap-2">{[0, 1, 2, 3].map((index) => <button type="button" key={index} onClick={() => onSelect(index)} className={`focus-ring aspect-square overflow-hidden border ${active === index ? 'border-[hsl(var(--primary))]' : 'hairline'} bg-[hsl(var(--muted)/.5)]`} aria-label={`${copyText('Image', 'صورة')} ${index + 1}`}><img src={product.media} alt="" className="h-full w-full object-cover opacity-75" /></button>)}</div></div>;
}

function copyText(fr: string, ar: string) {
  return document.documentElement.lang.startsWith('ar') ? ar : fr;
}

const fieldArabic: Record<string, string> = {
  'Référence commande': 'مرجع الطلب', Client: 'العميل', Statut: 'الحالة', 'Motif / note': 'السبب / الملاحظة',
  'Nom complet': 'الاسم الكامل', Téléphone: 'الهاتف', 'Adresse / wilaya': 'العنوان / الولاية', 'Note opérationnelle': 'ملاحظة تشغيلية',
  'Nom produit': 'اسم المنتج', 'SKU / barcode': 'SKU / الرمز الشريطي', 'Prix / disponibilité': 'السعر / التوفر', Visibilité: 'الظهور',
  'Nom de catégorie': 'اسم الفئة', 'Type / marque': 'النوع / العلامة', 'Ordre d’affichage': 'ترتيب العرض',
  'Produit / lot': 'المنتج / الدفعة', Expiration: 'انتهاء الصلاحية', Quantité: 'الكمية', Disposition: 'المعالجة',
  'Commande / expédition': 'الطلب / الشحنة', Destinataire: 'المستلم', Transporteur: 'شركة التوصيل', 'Exception / prochaine étape': 'الاستثناء / الخطوة التالية',
  'Commande / article': 'الطلب / العنصر', Motif: 'السبب', 'État reçu': 'حالة الاستلام', Décision: 'القرار',
  'Variant demandé': 'الصيغة المطلوبة', 'Différence de prix': 'فرق السعر', 'Demande / commande': 'الطلب / المعاملة',
  Montant: 'المبلغ', Méthode: 'الطريقة', 'Motif / approbateur': 'السبب / المعتمد', Code: 'الرمز',
  'Règle / remise': 'القاعدة / الخصم', Validité: 'الصلاحية', 'Limite d’usage': 'حد الاستخدام',
  'Commande / produit': 'الطلب / المنتج', 'Motif de décision': 'سبب القرار', Modérateur: 'المشرف',
  Événement: 'الحدث', Canal: 'القناة', Acteur: 'المنفذ', Action: 'الإجراء', Entité: 'الكيان',
  Période: 'الفترة', Section: 'القسم', Valeur: 'القيمة', 'Raison du changement': 'سبب التغيير',
};

const fieldLabel = (lang: Lang, label: string) => copy(lang, label, fieldArabic[label] ?? label);

export function ProfessionalProductSurface({ lang, addToCart }: { lang: Lang; addToCart: (product: Product) => void }) {
  const [, params] = useRoute('/shop/:id');
  const requestedProduct = products.find((item) => item.id === params?.id);
  const product = requestedProduct ?? products[0];
  const notFound = !requestedProduct;
  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState(product.format);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<'details' | 'nutrition' | 'reviews'>('details');
  const [zoom, setZoom] = useState(false);
  const [notice, setNotice] = useState('');
  const add = () => { for (let index = 0; index < quantity; index += 1) addToCart(product); setNotice(copy(lang, 'Ajout local prévisualisé.', 'تمت معاينة الإضافة محلياً.')); };
  const related = products.filter((item) => item.id !== product.id).slice(0, 3);
  if (notFound) return <main className="mx-auto max-w-[900px] px-5 py-16 pb-28 lg:py-24">
    <Link href="/shop" className="focus-ring mb-7 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))]"><ArrowLeft size={15} />{copy(lang, 'Retour au catalogue', 'العودة إلى الكتالوج')}</Link>
    <div className="border hairline bg-[hsl(var(--card))] p-7 sm:p-10">
      <StatusBadge label={copy(lang, 'Not found', 'غير موجود')} tone="bad" icon={AlertCircle} />
      <h1 className="display mt-5 text-5xl uppercase">{copy(lang, 'Référence introuvable', 'المرجع غير موجود')}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy(lang, 'Cette référence ne correspond à aucun produit de la fixture locale. Aucun produit de remplacement ne sera affiché.', 'هذا المرجع لا يطابق أي منتج في البيانات المحلية. لن يتم عرض منتج بديل.')}</p>
      <Link href="/shop" className="focus-ring mt-7 inline-flex bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-white">{copy(lang, 'Revenir au catalogue', 'العودة إلى الكتالوج')}</Link>
      <Boundary tone="warn">{copy(lang, 'Le catalogue autoritaire devra fournir la référence, le contenu et la disponibilité avant affichage.', 'يجب أن يوفر الكتالوج الموثوق المرجع والمحتوى والتوفر قبل العرض.')}</Boundary>
    </div>
  </main>;
  return <main className="mx-auto max-w-[1240px] px-5 py-10 pb-28 lg:px-10 lg:py-14">
    <Link href="/shop" className="focus-ring mb-7 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))]"><ArrowLeft size={15} />{copy(lang, 'Retour au catalogue', 'العودة إلى الكتالوج')}</Link>
     <div className="grid gap-9 lg:grid-cols-[.95fr_1.05fr]"><ProductMedia product={product} active={activeImage} onSelect={(index) => { setActiveImage(index); setZoom(index === activeImage); }} /><section><p className="eyebrow">{categoryName(lang, product.category)} / {product.id}</p><h1 className="display mt-3 text-5xl font-semibold uppercase leading-[.93] sm:text-7xl">{productName(lang, product.name, product.arabicName)}</h1><p className="mt-4 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{lang === 'ar' ? 'مرجع بصري لروتين تغذية واضح. التفاصيل التجارية النهائية بانتظار اعتماد التاجر.' : product.detail}</p><div className="mt-7 flex flex-wrap items-end gap-4"><span className="mono text-2xl font-bold">{money(product.price)}</span><StatusBadge label={product.stock > 0 ? copy(lang, `${product.stock} en fixture`, `${product.stock} ضمن البيانات`) : copy(lang, 'Rupture', 'غير متوفر')} tone={product.stock > 0 ? 'good' : 'bad'} icon={product.stock > 0 ? CheckCircle2 : AlertCircle} /></div><div className="mt-7 grid gap-5 border-y hairline py-6 sm:grid-cols-2"><SelectField label={copy(lang, 'Format / variante', 'الحجم / الصيغة')} value={variant} onChange={setVariant} options={[[product.format, product.format], ['pending', copy(lang, 'Format à confirmer', 'الحجم يحتاج إلى تأكيد')], ['unavailable', copy(lang, 'Variant indisponible', 'الصيغة غير متاحة')]]} /><div><span className="mb-2 block text-xs font-bold">{copy(lang, 'Quantité', 'الكمية')}</span><div className="flex h-11 w-fit items-center border hairline"><button type="button" className="focus-ring px-4" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label={copy(lang, 'Diminuer', 'تقليل')}>−</button><span className="mono px-3">{quantity}</span><button type="button" className="focus-ring px-4" onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))} aria-label={copy(lang, 'Augmenter', 'زيادة')} disabled={!product.stock}>+</button></div><p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">{product.stock ? copy(lang, `Maximum ${product.stock} unité(s) dans la fixture.`, `الحد الأقصى ${product.stock} وحدة ضمن البيانات.`) : copy(lang, 'Quantité indisponible.', 'الكمية غير متاحة.')}</p></div></div>{variant === 'pending' && <Boundary tone="warn">{copy(lang, 'Cette variante attend une confirmation marchand et ne peut pas être ajoutée.', 'هذه الصيغة بانتظار اعتماد التاجر ولا يمكن إضافتها.')}</Boundary>}{variant === 'unavailable' && <Boundary tone="warn">{copy(lang, 'Cette variante est indisponible dans la fixture.', 'هذه الصيغة غير متاحة ضمن البيانات التجريبية.')}</Boundary>}<div className="mt-5 flex items-start gap-3 border hairline bg-[hsl(var(--muted)/.35)] p-4 text-xs"><Truck size={17} className="mt-0.5 text-[hsl(var(--primary))]" /><span>{copy(lang, 'Livraison et délai : à calculer par le service autoritaire après adresse.', 'التوصيل والمدة: يحسبهما الخادم بعد إدخال العنوان.')}</span></div><div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={!product.stock || variant !== product.format} onClick={add} className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{product.stock ? copy(lang, 'Ajouter au panier', 'أضف إلى السلة') : copy(lang, 'Rupture', 'غير متوفر')}<Plus size={15} /></button>{notice && <span className="self-center text-xs font-bold text-[hsl(var(--accent-foreground))]" role="status">{notice}</span>}</div><Boundary tone="warn">{copy(lang, 'Le prix comparé, la marque, le SKU, le code-barres, la nutrition, les ingrédients et l’usage restent des champs marchand-owned.', 'السعر المقارن والعلامة وSKU والرمز الشريطي والقيم الغذائية والمكونات وطريقة الاستخدام بانتظار بيانات التاجر.')}</Boundary></section></div>
     <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><section><div className="flex gap-2 overflow-x-auto border-b hairline">{(['details', 'nutrition', 'reviews'] as const).map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={`focus-ring whitespace-nowrap border-b-2 px-3 py-3 text-xs font-bold ${tab === item ? 'border-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))]'}`}>{item === 'details' ? copy(lang, 'Détails', 'التفاصيل') : item === 'nutrition' ? copy(lang, 'Nutrition', 'القيم الغذائية') : copy(lang, 'Avis', 'الآراء')}</button>)}</div>{tab === 'details' && <div className="grid gap-3 py-6 sm:grid-cols-2"><Spec label={copy(lang, 'Marque', 'العلامة')} value={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} /><Spec label="SKU" value={copy(lang, 'À fournir', 'بانتظار البيانات')} mono /><Spec label={copy(lang, 'Code-barres', 'الرمز الشريطي')} value={copy(lang, 'À fournir', 'بانتظار البيانات')} mono /><Spec label={copy(lang, 'Format', 'الحجم')} value={product.format} /><Spec label={copy(lang, 'Variante', 'الصيغة')} value={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} /><Spec label={copy(lang, 'Prix comparé', 'السعر المقارن')} value={copy(lang, 'Non fourni', 'غير مقدم')} mono /><Spec label={copy(lang, 'Remise', 'الخصم')} value={copy(lang, 'Non calculée', 'غير محسوب')} /><Spec label={copy(lang, 'Note / avis', 'التقييم / الآراء')} value={copy(lang, 'Non fourni', 'غير مقدم')} /><Spec label={copy(lang, 'Délai de livraison', 'مدة التوصيل')} value={copy(lang, 'Après adresse', 'بعد إدخال العنوان')} /><Spec label={copy(lang, 'Usage', 'طريقة الاستخدام')} value={copy(lang, 'Conseil à valider', 'النصيحة بانتظار الاعتماد')} /></div>}{tab === 'nutrition' && <div className="grid gap-3 py-6 sm:grid-cols-2"><Spec label={copy(lang, 'Table nutritionnelle', 'الجدول الغذائي')} value={copy(lang, 'À fournir', 'بانتظار البيانات')} /><Spec label={copy(lang, 'Ingrédients', 'المكونات')} value={copy(lang, 'À fournir', 'بانتظار البيانات')} /><Spec label={copy(lang, 'Allégations', 'الادعاءات')} value={copy(lang, 'Aucune allégation affichée', 'لا توجد ادعاءات معروضة')} /><div className="sm:col-span-2"><Boundary>{copy(lang, 'Aucune valeur nutritionnelle, liste d’ingrédients ou allégation ne sera inventée avant validation marchand.', 'لن يتم اختلاق أي قيمة غذائية أو قائمة مكونات أو ادعاء قبل اعتماد التاجر.')}</Boundary></div></div>}{tab === 'reviews' && <div className="py-6"><div className="border hairline p-6 text-center"><Sparkles className="mx-auto text-[hsl(var(--primary))]" /><h2 className="display mt-4 text-3xl uppercase">{copy(lang, 'Aucun avis fabriqué', 'لا توجد آراء مختلقة')}</h2><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Les avis réels seront modérés avant publication.', 'ستخضع الآراء الحقيقية للمراجعة قبل النشر.')}</p></div></div>}</section><aside className="border hairline bg-[hsl(var(--card))] p-5"><p className="eyebrow">{copy(lang, 'Dans la même routine', 'ضمن الروتين نفسه')}</p><div className="mt-5 space-y-3">{related.map((item) => <Link key={item.id} href={`/shop/${item.id}`} className="focus-ring flex items-center gap-3 border-b hairline pb-3"><div className={`product-visual product-visual--${item.tone} grid h-14 w-14 shrink-0 place-items-center`}><Package className="text-white/55" size={18} /></div><span className="min-w-0 text-xs font-bold">{productName(lang, item.name, item.arabicName)}<small className="mono mt-1 block text-[10px] font-normal">{money(item.price)}</small></span></Link>)}</div></aside></div>
    {zoom && <PreviewDialog lang={lang} title={copy(lang, 'Zoom média', 'تكبير الوسائط')} description={copy(lang, 'Image de référence agrandie pour vérifier la zone visuelle.', 'صورة مرجعية مكبرة لمراجعة المنطقة البصرية.')} close={() => setZoom(false)}><img src={product.media} alt={product.mediaAlt || ''} className="max-h-[55vh] w-full object-contain" /></PreviewDialog>}
  </main>;
}

export function ProfessionalCheckoutSurface({ lang, cart }: { lang: Lang; cart: CartLine[] }) {
  const [mode, setMode] = useState<'guest' | 'account'>('guest');
  const [delivery, setDelivery] = useState<'home' | 'desk'>('home');
  const [form, setForm] = useState({ name: '', phone: '', address: '', wilaya: '', commune: '', note: '' });
  const [touched, setTouched] = useState(false);
  const [quoteState, setQuoteState] = useState<'idle' | 'failed' | 'ready'>('idle');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const required = (key: keyof typeof form) => touched && !form[key] ? copy(lang, 'Champ requis.', 'هذا الحقل مطلوب.') : undefined;
  const deliveryError = touched && delivery === 'desk' ? copy(lang, 'Point relais non configuré dans cette version.', 'نقطة الاستلام غير مهيأة في هذه النسخة.') : undefined;
  const update = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setTouched(true); if (!cart.length || !form.name || !form.phone || !form.address || !form.wilaya || !form.commune || quoteState === 'failed' || delivery === 'desk') return; setBusy(true); window.setTimeout(() => { setBusy(false); setSubmitted(true); }, 450); };
  if (!cart.length) return <main className="mx-auto max-w-[900px] px-5 py-16"><SurfaceTitle eyebrow={copy(lang, 'Checkout / indisponible', 'الدفع / غير متاح')} title={copy(lang, 'Panier vide', 'السلة فارغة')} description={copy(lang, 'Ajoutez une référence avant de commencer le devis local.', 'أضف منتجاً قبل بدء التسعير المحلي.')} /><div className="border hairline p-10 text-center"><PackageCheck className="mx-auto text-[hsl(var(--primary))]" size={28} /><Link href="/shop" className="focus-ring mt-5 inline-flex bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-white">{copy(lang, 'Voir la boutique', 'عرض المتجر')}</Link></div></main>;
   if (submitted) return <main className="mx-auto max-w-[900px] px-5 py-16"><div className="border hairline bg-[hsl(var(--card))] p-7 sm:p-10"><StatusBadge label={copy(lang, 'Pending / local', 'قيد الانتظار / محلي')} tone="warn" icon={AlertCircle} /><h1 className="display mt-5 text-5xl uppercase">{copy(lang, 'Confirmation en attente', 'التأكيد قيد الانتظار')}</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy(lang, 'Référence locale PREVIEW-1048. Le serveur devra confirmer le prix, la livraison et la création de commande.', 'المرجع المحلي PREVIEW-1048. يجب على الخادم تأكيد السعر والتوصيل وإنشاء الطلب.')}</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><Spec label={copy(lang, 'Référence', 'المرجع')} value="PREVIEW-1048" mono /><Spec label={copy(lang, 'Paiement', 'الدفع')} value="COD" /><Spec label={copy(lang, 'Total', 'الإجمالي')} value={money(subtotal)} mono /></div><div className="mt-7 flex flex-wrap gap-3"><Link href="/shop" className="focus-ring bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-white">{copy(lang, 'Retour à la boutique', 'العودة إلى المتجر')}</Link><Link href="/confirmation" className="focus-ring border hairline px-5 py-3 text-xs font-bold">{copy(lang, 'Voir les états de confirmation', 'عرض حالات التأكيد')}</Link><button type="button" onClick={() => setSubmitted(false)} className="focus-ring border hairline px-5 py-3 text-xs font-bold">{copy(lang, 'Modifier localement', 'تعديل محلي')}</button><button type="button" onClick={() => window.print()} className="focus-ring border hairline px-5 py-3 text-xs font-bold">{copy(lang, 'Imprimer', 'طباعة')}</button></div><Boundary tone="warn">{copy(lang, 'Aucun compte, paiement, stock ou envoi réel n’a été créé.', 'لم يتم إنشاء حساب أو دفعة أو مخزون أو شحنة حقيقية.')}</Boundary></div></main>;
  return <main className="mx-auto max-w-[1240px] px-5 py-10 pb-28 lg:px-10 lg:py-14"><SurfaceTitle eyebrow={copy(lang, 'Étape 02 / COD', 'الخطوة 02 / الدفع عند الاستلام')} title={copy(lang, 'On livre où ?', 'أين نوصّل؟')} description={copy(lang, 'Un formulaire calme avec validation par champ et frontière serveur explicite.', 'نموذج واضح مع تحقق لكل حقل وحدود خادم معلنة.')} /><div className="mb-7 flex flex-wrap gap-2"><button type="button" onClick={() => setMode('guest')} className={`focus-ring border px-4 py-2 text-xs font-bold ${mode === 'guest' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Continuer en invité', 'المتابعة كزائر')}</button><button type="button" onClick={() => setMode('account')} className={`focus-ring border px-4 py-2 text-xs font-bold ${mode === 'account' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'J’ai un compte', 'لدي حساب')}</button>{mode === 'account' && <span className="self-center text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Connexion future : aucune session n’est ouverte.', 'تسجيل الدخول مستقبلاً: لا توجد جلسة مفتوحة.')}</span>}</div><form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><div className="space-y-7"><section className="border hairline bg-[hsl(var(--card))] p-5 sm:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">01 / {copy(lang, 'Coordonnées', 'بيانات التواصل')}</p><h2 className="display mt-2 text-3xl uppercase">{copy(lang, 'Votre destination', 'وجهتك')}</h2></div><UserRound size={19} className="text-[hsl(var(--primary))]" /></div><div className="grid gap-5 sm:grid-cols-2"><InputField label={copy(lang, 'Nom complet', 'الاسم الكامل')} value={form.name} onChange={update('name')} placeholder={copy(lang, 'Ex. Amel Mansouri', 'مثال: أمل منصوري')} required error={required('name')} /><InputField label={copy(lang, 'Téléphone', 'الهاتف')} value={form.phone} onChange={update('phone')} placeholder="+213 5x xx xx xx" required error={required('phone')} /><div className="sm:col-span-2"><InputField label={copy(lang, 'Adresse complète', 'العنوان الكامل')} value={form.address} onChange={update('address')} placeholder={copy(lang, 'Rue, numéro, quartier', 'الشارع، الرقم، الحي')} required error={required('address')} /></div><SelectField label={copy(lang, 'Wilaya', 'الولاية')} value={form.wilaya} onChange={update('wilaya')} options={[['', copy(lang, 'Sélectionner', 'اختر')], ['alger', 'Alger / الجزائر'], ['oran', 'Oran / وهران'], ['blida', 'Blida / البليدة']]} error={required('wilaya')} /><InputField label={copy(lang, 'Commune', 'البلدية')} value={form.commune} onChange={update('commune')} placeholder={copy(lang, 'Commune', 'البلدية')} required error={required('commune')} /><div className="sm:col-span-2"><InputField label={copy(lang, 'Note de livraison', 'ملاحظة التوصيل')} value={form.note} onChange={update('note')} placeholder={copy(lang, 'Optionnel', 'اختياري')} /></div></div></section><section className="border hairline bg-[hsl(var(--card))] p-5 sm:p-7"><p className="eyebrow">02 / {copy(lang, 'Livraison', 'التوصيل')}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className={`flex cursor-pointer gap-3 border p-4 ${delivery === 'home' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)]' : 'hairline'}`}><input type="radio" name="delivery" checked={delivery === 'home'} onChange={() => setDelivery('home')} /><span><b className="block text-sm">{copy(lang, 'À domicile', 'إلى المنزل')}</b><small className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Tarif à confirmer', 'التعرفة تحدد لاحقاً')}</small></span></label><label className={`flex cursor-pointer gap-3 border p-4 ${delivery === 'desk' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)]' : 'hairline'}`}><input type="radio" name="delivery" checked={delivery === 'desk'} onChange={() => setDelivery('desk')} aria-describedby={delivery === 'desk' ? 'delivery-unavailable' : undefined} /><span><b className="block text-sm">{copy(lang, 'Stop-desk / point relais', 'نقطة استلام')}</b><small className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Disponible à confirmer', 'التوفر يحتاج إلى تأكيد')}</small></span></label></div>{delivery === 'desk' && <div className="mt-4 grid gap-3 sm:grid-cols-2"><SelectField label={copy(lang, 'Point relais', 'نقطة الاستلام')} value="pending" onChange={() => undefined} options={[['pending', copy(lang, 'À confirmer par le serveur', 'يؤكده الخادم لاحقاً')]]} disabled error={deliveryError} /><div id="delivery-unavailable"><Boundary tone="warn">{copy(lang, 'Aucun point relais réel n’est configuré dans cette fixture.', 'لا توجد نقطة استلام حقيقية مهيأة في هذه البيانات.')}</Boundary></div></div>}{quoteState === 'failed' && <div className="mt-4 flex items-start gap-3 border border-[hsl(var(--destructive)/.5)] bg-[hsl(var(--destructive)/.08)] p-4 text-xs" role="alert"><AlertCircle size={17} className="text-[hsl(var(--destructive))]" /><span className="flex-1">{copy(lang, 'Le devis de livraison n’a pas pu être lu. Réessayez sans créer de commande.', 'تعذر قراءة تسعيرة التوصيل. أعد المحاولة دون إنشاء طلب.')}</span><button type="button" onClick={() => setQuoteState('ready')} className="focus-ring underline">{copy(lang, 'Réessayer', 'إعادة المحاولة')}</button></div>}<button type="button" onClick={() => setQuoteState(quoteState === 'failed' ? 'ready' : 'failed')} className="focus-ring mt-4 text-xs font-bold underline">{quoteState === 'failed' ? copy(lang, 'Réessayer le devis', 'إعادة تسعير التوصيل') : copy(lang, 'Simuler un devis indisponible', 'معاينة عدم توفر التسعير')}</button></section><section className="border hairline bg-[hsl(var(--card))] p-5 sm:p-7"><p className="eyebrow">03 / {copy(lang, 'Paiement', 'الدفع')}</p><div className="mt-5 flex items-start gap-3 border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)] p-4"><CreditCard size={19} className="mt-0.5 text-[hsl(var(--primary))]" /><div><p className="text-sm font-bold">{copy(lang, 'Paiement à la livraison', 'الدفع عند الاستلام')}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{copy(lang, 'Aucun paiement n’est capturé dans cette maquette.', 'لا يتم تحصيل أي دفعة في هذا النموذج.')}</p></div></div></section></div><aside className="h-fit border hairline bg-[hsl(var(--secondary))] p-5 text-white sm:p-7 lg:sticky lg:top-24"><p className="eyebrow text-white/55">{copy(lang, 'Résumé recalculable', 'ملخص قابل لإعادة الحساب')}</p>{cart.map((line) => <div key={line.product.id} className="flex justify-between gap-3 border-b border-white/10 py-4 text-xs"><span>{line.quantity} × {productName(lang, line.product.name, line.product.arabicName)}</span><span className="mono">{money(line.product.price * line.quantity)}</span></div>)}<div className="mt-5 flex justify-between font-bold"><span>{copy(lang, 'Total indicatif', 'الإجمالي التقديري')}</span><span className="mono">{money(subtotal)}</span></div><Boundary tone="warn">{copy(lang, 'Prix, livraison et stock finaux restent server-owned.', 'السعر والشحن والمخزون النهائي من اختصاص الخادم.')}</Boundary><button type="submit" disabled={busy || quoteState === 'failed'} className="focus-ring mt-6 flex w-full items-center justify-center gap-2 bg-[hsl(var(--primary))] py-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">{busy ? copy(lang, 'Préparation…', 'جارٍ التحضير…') : copy(lang, 'Prévisualiser la confirmation', 'معاينة التأكيد')}<ArrowRight size={15} /></button></aside></form></main>;
}

const opsLinks: Array<[OpsKind, string, typeof Boxes]> = [
  ['dashboard', 'dashboard', Boxes], ['orders', 'orders', ClipboardCheck], ['customers', 'customers', Users], ['products', 'products', Package],
  ['categories', 'categories', Tag], ['inventory', 'inventory', Archive], ['movements', 'movements', History], ['purchasing', 'purchasing', Download],
  ['receiving', 'receiving', PackageCheck], ['batches', 'batches', Archive], ['delivery', 'delivery', Truck], ['returns', 'returns', RefreshCcw],
  ['exchanges', 'exchanges', RefreshCcw], ['refunds', 'refunds', Receipt], ['pos', 'pos', CreditCard], ['cash', 'cash', Wallet],
  ['finance', 'finance', Wallet], ['expenses', 'expenses', FileText], ['profitability', 'profitability', BarChart3], ['reports', 'reports', FileText],
  ['coupons', 'coupons', Tag], ['reviews', 'reviews', Sparkles], ['staff', 'staff', ShieldCheck], ['roles', 'roles', LockKeyhole],
  ['notifications', 'notifications', Bell], ['audit', 'audit', FileText], ['settings', 'settings', SlidersHorizontal],
];

const opsLabels: Record<OpsKind, [string, string]> = {
  dashboard: ['Vue d’ensemble', 'نظرة عامة'], orders: ['Commandes', 'الطلبات'], customers: ['Clients', 'العملاء'], products: ['Produits', 'المنتجات'],
  categories: ['Catégories', 'الفئات'], inventory: ['Inventaire', 'الجرد'], movements: ['Mouvements', 'الحركات'], purchasing: ['Achats', 'المشتريات'],
  receiving: ['Réception', 'الاستلام'], batches: ['Lots & expiration', 'الدفعات والانتهاء'], delivery: ['Livraison', 'التوصيل'], returns: ['Retours', 'الإرجاع'],
  exchanges: ['Échanges', 'الاستبدال'], refunds: ['Remboursements', 'المبالغ المستردة'], pos: ['POS', 'نقطة البيع'], cash: ['Caisse', 'الصندوق'],
  finance: ['Finance', 'المالية'], expenses: ['Dépenses', 'المصروفات'], profitability: ['Rentabilité', 'الربحية'], reports: ['Rapports', 'التقارير'],
  coupons: ['Coupons', 'القسائم'], reviews: ['Avis', 'الآراء'], staff: ['Équipe', 'الفريق'], roles: ['Rôles', 'الأدوار'],
  notifications: ['Notifications', 'الإشعارات'], audit: ['Audit', 'التدقيق'], settings: ['Paramètres', 'الإعدادات'],
};

const opsNavGroups: Array<{ id: string; label: [string, string]; items: OpsKind[] }> = [
  { id: 'work', label: ['Travail', 'العمل'], items: ['dashboard', 'orders', 'customers'] },
  { id: 'catalogue', label: ['Catalogue', 'الكتالوج'], items: ['products', 'categories', 'coupons', 'reviews'] },
  { id: 'logistics', label: ['Logistique', 'اللوجستيك'], items: ['inventory', 'movements', 'purchasing', 'receiving', 'batches', 'delivery', 'returns', 'exchanges', 'refunds'] },
  { id: 'finance', label: ['Finance & caisse', 'المالية والصندوق'], items: ['pos', 'cash', 'finance', 'expenses', 'profitability', 'reports'] },
  { id: 'control', label: ['Contrôle', 'التحكم'], items: ['staff', 'roles', 'notifications', 'audit', 'settings'] },
];

function OpsFrame({ lang, active, children }: { lang: Lang; active: OpsKind; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ work: true });
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
  useEffect(() => {
    const activeGroup = opsNavGroups.find((group) => group.items.includes(active))?.id;
    if (activeGroup) setOpenGroups((current) => ({ ...current, [activeGroup]: true }));
  }, [active]);
  const iconFor = (key: OpsKind) => opsLinks.find(([link]) => link === key)?.[2] ?? Boxes;
  return <div className="flex min-h-[calc(100dvh-64px)] bg-[hsl(var(--background))]"><aside id="professional-ops-navigation" className={`${open ? 'block' : 'hidden'} fixed inset-y-16 start-0 z-40 w-72 overflow-y-auto border-e border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] p-4 lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-64px)]`} aria-label={copy(lang, 'Navigation opérations', 'تنقل العمليات')}>
    <div className="mb-5 flex items-center justify-between lg:hidden"><span className="eyebrow text-white/55">{copy(lang, 'Sections', 'الأقسام')}</span><button type="button" className="focus-ring text-white" onClick={() => setOpen(false)} aria-label={copy(lang, 'Fermer', 'إغلاق')}><X size={18} /></button></div>
    <div className="mb-5 border border-white/10 bg-white/[.04] p-3"><p className="eyebrow text-white/45">{copy(lang, 'Navigation', 'التنقل')}</p><p className="mt-2 text-xs leading-5 text-white/65">{copy(lang, 'Ouvrez seulement le groupe nécessaire. La section active reste visible.', 'افتح المجموعة التي تحتاجها فقط. سيبقى القسم النشط واضحاً.')}</p></div>
    <nav className="space-y-2" aria-label={copy(lang, 'Sections opérations', 'أقسام العمليات')}>{opsNavGroups.map((group) => {
      const expanded = Boolean(openGroups[group.id]);
      const hasActive = group.items.includes(active);
      return <div key={group.id} className="border-b border-white/10 pb-2">
        <button type="button" className="focus-ring flex w-full items-center justify-between gap-3 px-2 py-2 text-start text-[10px] font-bold uppercase tracking-[.16em] text-white/55 hover:text-white" onClick={() => setOpenGroups((current) => ({ ...current, [group.id]: !expanded }))} aria-expanded={expanded} aria-controls={`ops-group-${group.id}`}>
          <span className={hasActive ? 'text-[hsl(var(--primary))]' : undefined}>{copy(lang, group.label[0], group.label[1])}</span>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expanded && <div id={`ops-group-${group.id}`} className="mt-1 space-y-0.5">{group.items.map((key) => {
          const Icon = iconFor(key);
          const slug = key;
          return <Link href={`/ops/${slug}`} key={key} onClick={() => setOpen(false)} aria-current={key === active ? 'page' : undefined} className={`focus-ring flex items-center gap-3 px-3 py-2.5 text-xs font-semibold ${key === active ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--primary))]' : 'text-white/65 hover:bg-[hsl(var(--sidebar-accent))] hover:text-white'}`}><Icon size={15} aria-hidden="true" />{copy(lang, opsLabels[key][0], opsLabels[key][1])}</Link>;
        })}</div>}
      </div>;
    })}</nav>
  </aside><main className="min-w-0 flex-1"><div className="mx-auto max-w-[1480px] p-4 pb-24 sm:p-6 lg:p-9"><button type="button" onClick={() => setOpen(true)} className="focus-ring mb-5 flex items-center gap-2 text-xs font-bold lg:hidden" aria-expanded={open} aria-controls="professional-ops-navigation"><Menu size={18} aria-hidden="true" />{copy(lang, 'Sections', 'الأقسام')}</button>{children}<div className="mt-8"><Boundary>{copy(lang, 'LOCAL WORKSPACE · V0.2 — actions and statuses are shown locally and are not saved.', 'مساحة محلية · الإصدار ٠.٢ — الإجراءات والحالات معروضة محلياً ولا تُحفظ.')}</Boundary></div></div></main></div>;
}

function OpsRailFrame({ lang, active, children }: { lang: Lang; active: OpsKind; children: ReactNode }) {
  const shortcuts: Array<[OpsKind, string]> = [
    ['products', 'catalogue'],
    ['inventory', 'logistics'],
    ['finance', 'finance'],
    ['settings', 'control'],
  ];
  const activeLabel = opsLabels[active];
  return <div className="min-h-[calc(100dvh-64px)] bg-[hsl(var(--background))]">
    <nav className="border-b border-[hsl(var(--secondary)/.16)] bg-[hsl(var(--secondary))] text-white" aria-label={copy(lang, 'Contexte du module', 'سياق الوحدة')}>
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-9">
        <Link href="/ops" className="focus-ring flex shrink-0 items-center gap-2 border border-white/20 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:border-[hsl(var(--primary))]" data-testid="link-ops-all-modules"><ArrowLeft size={14} />{copy(lang, 'Tous les modules', 'كل الوحدات')}</Link>
        <span className="hidden h-5 w-px bg-white/15 sm:block" aria-hidden="true" />
        <span className="flex min-w-0 items-center gap-2 border border-[hsl(var(--primary)/.7)] bg-[hsl(var(--primary)/.14)] px-3 py-2 text-[11px] font-bold" aria-current="page"><span className="h-1.5 w-1.5 bg-[hsl(var(--primary))]" />{copy(lang, activeLabel[0], activeLabel[1])}</span>
        <div className="flex w-full gap-1 overflow-x-auto pt-1 sm:ms-auto sm:w-auto sm:pt-0">{shortcuts.map(([key, group]) => <Link href={`/ops/${key}`} key={key} className={`focus-ring flex shrink-0 items-center gap-2 px-2.5 py-2 text-[10px] font-bold transition-colors ${key === active ? 'text-[hsl(var(--primary))]' : 'text-white/55 hover:text-white'}`} data-testid={`link-ops-rail-${key}`}><span className="hidden md:inline">{copy(lang, opsLabels[key][0], opsLabels[key][1])}</span><span className="md:hidden">{copy(lang, group, group === 'catalogue' ? 'الكتالوج' : group === 'logistics' ? 'اللوجستيك' : group === 'finance' ? 'المالية' : 'التحكم')}</span></Link>)}</div>
      </div>
    </nav>
    <main className="min-w-0"><div className="mx-auto max-w-[1480px] p-4 pb-24 sm:p-6 lg:p-9">{children}<div className="mt-8"><Boundary>{copy(lang, 'LOCAL WORKSPACE · V0.2 — actions and statuses are shown locally and are not saved.', 'مساحة محلية · الإصدار ٠.٢ — الإجراءات والحالات معروضة محلياً ولا تُحفظ.')}</Boundary></div></div></main>
  </div>;
}

function OpsHeader({ lang, title, description, action }: { lang: Lang; title: string; description: string; action?: ReactNode }) {
  return <SurfaceTitle eyebrow={copy(lang, 'Opérations / local', 'العمليات / محلي')} title={title} description={description} action={action} />;
}

function FormPanel({ lang, title, children, onSubmit, submitLabel }: { lang: Lang; title: string; children: ReactNode; onSubmit: (event: FormEvent) => void; submitLabel: string }) {
  return <form onSubmit={onSubmit} className="border hairline bg-[hsl(var(--card))] p-5 sm:p-7"><h2 className="display text-2xl uppercase">{title}</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div><div className="mt-6 flex flex-wrap items-center gap-3"><PlazzaButton type="submit">{submitLabel}</PlazzaButton><Boundary>{copy(lang, 'Enregistrement local de prévisualisation uniquement.', 'حفظ محلي للمعاينة فقط.')}</Boundary></div></form>;
}

function ProfessionalInventory({ lang, kind }: { lang: Lang; kind: 'inventory' | 'movements' }) {
  const [filter, setFilter] = useState('all');
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ product: '', quantity: '', type: 'adjustment', motif: '', batch: '', operator: '' });
  const setDraftValue = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const rows = [['Whey isolate', '14', '0', '0', '0', 'Disponible'], ['Creatine', '8', '2', '0', '0', 'Réservé'], ['Pre-workout', '3', '0', '1', '0', 'Low stock'], ['Daily essentials', '0', '0', '0', '2', 'Rupture'], ['Mass routine', '21', '0', '0', '0', 'Expire bientôt']];
  const filtered = filter === 'all' ? rows : rows.filter((row) => row[5].toLowerCase().includes(filter));
  return <><OpsHeader lang={lang} title={copy(lang, kind === 'inventory' ? 'Inventaire de contrôle' : 'Mouvements & ajustements', kind === 'inventory' ? 'جرد رقابي' : 'حركات وتعديلات المخزون')} description={copy(lang, 'Les quantités et mouvements sont lisibles, traçables et explicitement locaux.', 'الكميات والحركات واضحة وقابلة للتتبع ومعلنة كمحلية.')} action={<button type="button" className="focus-ring bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white" onClick={() => setSaved(false)}>{copy(lang, 'Nouvel ajustement', 'تعديل جديد')}</button>} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label={copy(lang, 'Disponible', 'متاح')} value="79" note={copy(lang, 'unités locales', 'وحدات محلية')} tone="good" /><Metric label={copy(lang, 'Réservé', 'محجوز')} value="02" note={copy(lang, 'à rapprocher', 'بانتظار المطابقة')} /><Metric label={copy(lang, 'Damaged', 'تالف')} value="02" note={copy(lang, 'source locale', 'مصدر محلي')} tone="warn" /><Metric label={copy(lang, 'Expire bientôt', 'ينتهي قريباً')} value="01" note={copy(lang, 'lot à confirmer', 'الدفعة تحتاج إلى تأكيد')} tone="warn" /></div><div className="mt-7 flex flex-wrap gap-2">{[['all', 'Tout'], ['low', 'Low stock'], ['rupture', 'Rupture'], ['expire', 'Expire']].map(([value, label]) => <button type="button" key={value} onClick={() => setFilter(value)} className={`focus-ring border px-3 py-2 text-xs font-bold ${filter === value ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, label, value === 'all' ? 'الكل' : value === 'low' ? 'مخزون منخفض' : value === 'rupture' ? 'غير متوفر' : 'ينتهي قريباً')}</button>)}</div><div className="mt-4"><OpsTable columns={[copy(lang, 'Produit', 'المنتج'), 'Available', 'Reserved', 'Committed', 'Damaged', copy(lang, 'État', 'الحالة')]} rows={filtered.map((row) => row.map((cell, index) => index === 5 ? copy(lang, cell, cell === 'Disponible' ? 'متوفر' : cell === 'Réservé' ? 'محجوز' : cell === 'Low stock' ? 'مخزون منخفض' : cell === 'Rupture' ? 'غير متوفر' : 'ينتهي قريباً') : cell))} /></div><div className="mt-7"><FormPanel lang={lang} title={copy(lang, 'Ajustement contrôlé', 'تعديل مراقب')} submitLabel={saved ? copy(lang, 'Aperçu enregistré', 'تم حفظ المعاينة') : copy(lang, 'Prévisualiser le mouvement', 'معاينة الحركة')} onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><InputField label={copy(lang, 'Produit', 'المنتج')} value={draft.product} onChange={setDraftValue('product')} placeholder={copy(lang, 'Sélectionner', 'اختر')} required /><InputField label={copy(lang, 'Quantité', 'الكمية')} value={draft.quantity} onChange={setDraftValue('quantity')} placeholder="0" type="number" required /><SelectField label={copy(lang, 'Type', 'النوع')} value={draft.type} onChange={setDraftValue('type')} options={[['adjustment', copy(lang, 'Ajustement', 'تعديل')], ['damage', copy(lang, 'Endommagé', 'تالف')], ['release', copy(lang, 'Libération', 'تحرير')]]} /><InputField label={copy(lang, 'Motif', 'السبب')} value={draft.motif} onChange={setDraftValue('motif')} placeholder={copy(lang, 'Motif obligatoire', 'السبب مطلوب')} required /><InputField label={copy(lang, 'Lot / batch', 'الدفعة')} value={draft.batch} onChange={setDraftValue('batch')} placeholder={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} /><InputField label={copy(lang, 'Opérateur', 'المنفذ')} value={draft.operator} onChange={setDraftValue('operator')} placeholder="Session locale" /></FormPanel></div></>;
}

function ProfessionalReceiving({ lang, receiving }: { lang: Lang; receiving: boolean }) {
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ supplier: '', reference: '', expected: '', received: '', cost: '', batch: '', note: '' });
  const setDraftValue = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const title = receiving ? copy(lang, 'Réception & lots', 'الاستلام والدفعات') : copy(lang, 'Achats fournisseurs', 'مشتريات الموردين');
  return <><OpsHeader lang={lang} title={title} description={copy(lang, receiving ? 'Réception partielle, écart, coût, lot et expiration dans une fiche opérable.' : 'Supplier et purchase order restent séparés des quantités reçues.', receiving ? 'الاستلام الجزئي والفارق والتكلفة والدفعة والانتهاء في بطاقة عملية.' : 'المورد وأمر الشراء منفصلان عن الكميات المستلمة.')} action={<StatusBadge label={copy(lang, 'Fixture local', 'بيانات محلية')} tone="warn" icon={Info} />} /><div className="grid gap-3 sm:grid-cols-3"><Metric label={copy(lang, 'En attente', 'قيد الانتظار')} value="03" note={copy(lang, 'bons locaux', 'أوامر محلية')} tone="warn" /><Metric label={copy(lang, 'Partiel', 'جزئي')} value="01" note={copy(lang, 'écart ouvert', 'فارق مفتوح')} /><Metric label={copy(lang, 'Fournisseurs', 'الموردون')} value="02" note={copy(lang, 'à confirmer', 'بانتظار التأكيد')} /></div><div className="mt-7"><OpsTable columns={[copy(lang, 'Bon', 'الأمر'), copy(lang, 'Fournisseur', 'المورد'), copy(lang, 'Attendu', 'المتوقع'), copy(lang, 'Reçu', 'المستلم'), copy(lang, 'Écart', 'الفارق'), copy(lang, 'État', 'الحالة')]} rows={[['PO-LOCAL-08', 'Fournisseur à confirmer', '18', '12', '6', 'Partiel'], ['PO-LOCAL-07', 'Source locale', '8', '8', '0', 'À contrôler'], ['PO-LOCAL-06', 'À fournir', '24', '0', '24', 'Brouillon']]} /></div><div className="mt-7"><FormPanel lang={lang} title={receiving ? copy(lang, 'Enregistrer une réception', 'تسجيل استلام') : copy(lang, 'Nouvel achat', 'شراء جديد')} submitLabel={saved ? copy(lang, 'Aperçu enregistré', 'تم حفظ المعاينة') : copy(lang, 'Prévisualiser', 'معاينة')} onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><InputField label={copy(lang, 'Fournisseur', 'المورد')} value={draft.supplier} onChange={setDraftValue('supplier')} placeholder={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} required /><InputField label="PO / référence" value={draft.reference} onChange={setDraftValue('reference')} placeholder="PO-LOCAL-08" required /><InputField label={copy(lang, 'Quantité attendue', 'الكمية المتوقعة')} value={draft.expected} onChange={setDraftValue('expected')} placeholder="18" type="number" required /><InputField label={copy(lang, 'Quantité reçue', 'الكمية المستلمة')} value={draft.received} onChange={setDraftValue('received')} placeholder="12" type="number" required /><InputField label={copy(lang, 'Coût unitaire', 'تكلفة الوحدة')} value={draft.cost} onChange={setDraftValue('cost')} placeholder={copy(lang, 'À fournir', 'بانتظار البيانات')} type="number" /><InputField label={copy(lang, 'Lot / expiration', 'الدفعة / الانتهاء')} value={draft.batch} onChange={setDraftValue('batch')} placeholder={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} /><div className="sm:col-span-2"><InputField label={copy(lang, 'Note de réception / résolution', 'ملاحظة الاستلام / الحل')} value={draft.note} onChange={setDraftValue('note')} placeholder={copy(lang, 'Décrire l’écart', 'صف الفارق')} /></div></FormPanel></div><Boundary tone="warn">{copy(lang, 'Une réception partielle ne ferme pas automatiquement le bon et ne modifie aucun stock réel.', 'الاستلام الجزئي لا يغلق الأمر تلقائياً ولا يغير أي مخزون حقيقي.')}</Boundary></>;
}

function ProfessionalPos({ lang, cash = false }: { lang: Lang; cash?: boolean }) {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState('');
  const [dialog, setDialog] = useState<'payment' | 'cash' | null>(null);
  const [saved, setSaved] = useState(false);
  const productButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const visible = products.filter((product) => `${product.name} ${product.id} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  const add = (product: Product) => setCart((current) => current.some((line) => line.product.id === product.id) ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }]);
  const change = (id: string, delta: number) => setCart((current) => current.flatMap((line) => line.product.id === id ? line.quantity + delta <= 0 ? [] : [{ ...line, quantity: line.quantity + delta }] : [line]));
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const moveProductFocus = (index: number, direction: 'next' | 'previous' | 'rowNext' | 'rowPrevious') => {
    const delta = direction === 'next' ? 1 : direction === 'previous' ? -1 : direction === 'rowNext' ? 2 : -2;
    productButtons.current[index + delta]?.focus();
  };
  if (cash) return <><OpsHeader lang={lang} title={copy(lang, 'Clôture caisse', 'إغلاق الصندوق')} description={copy(lang, 'Float, attendu, réel, variance, opérateur et approbation sont visibles sans fausse réconciliation.', 'الرصيد الافتتاحي والمتوقع والفعلي والفارق والمنفذ والاعتماد واضحة دون مطابقة وهمية.')} action={<button type="button" onClick={() => setDialog('cash')} className="focus-ring bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white">{copy(lang, 'Prévisualiser clôture', 'معاينة الإغلاق')}</button>} /><div className="grid gap-3 sm:grid-cols-4"><Metric label={copy(lang, 'Session', 'الجلسة')} value={copy(lang, 'OUVERTE', 'مفتوحة')} note={copy(lang, 'localement', 'محلياً')} tone="good" /><Metric label={copy(lang, 'Float', 'الرصيد')} value="—" note={copy(lang, 'à saisir', 'بانتظار الإدخال')} tone="warn" /><Metric label={copy(lang, 'Attendu', 'المتوقع')} value="—" note={copy(lang, 'ventes brouillon', 'مبيعات مسودة')} /><Metric label={copy(lang, 'Variance', 'الفارق')} value="—" note={copy(lang, 'à rapprocher', 'بانتظار المطابقة')} tone="warn" /></div><div className="mt-7 grid gap-5 lg:grid-cols-2"><FormPanel lang={lang} title={copy(lang, 'Rapprochement local', 'مطابقة محلية')} submitLabel={saved ? copy(lang, 'Aperçu enregistré', 'تم حفظ المعاينة') : copy(lang, 'Prévisualiser', 'معاينة')} onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><InputField label={copy(lang, 'Opérateur', 'المنفذ')} value="" onChange={() => undefined} placeholder="Session locale" required /><InputField label={copy(lang, 'Float d’ouverture', 'الرصيد الافتتاحي')} value="" onChange={() => undefined} placeholder="0" type="number" required /><InputField label={copy(lang, 'Espèces comptées', 'النقد المعدود')} value="" onChange={() => undefined} placeholder="0" type="number" required /><InputField label={copy(lang, 'Note de variance', 'ملاحظة الفارق')} value="" onChange={() => undefined} placeholder={copy(lang, 'Motif à fournir', 'السبب بانتظار البيانات')} /></FormPanel><div className="border hairline bg-[hsl(var(--card))] p-6"><p className="eyebrow">{copy(lang, 'Contrôle', 'التحقق')}</p><div className="mt-5 space-y-4 text-xs"><div className="flex justify-between"><span>{copy(lang, 'Ventes POS', 'مبيعات POS')}</span><StatusBadge label={copy(lang, 'Brouillon', 'مسودة')} tone="warn" /></div><div className="flex justify-between"><span>{copy(lang, 'Approbation', 'الاعتماد')}</span><StatusBadge label={copy(lang, 'Non disponible', 'غير متوفر')} tone="neutral" icon={LockKeyhole} /></div><Boundary tone="warn">{copy(lang, 'La clôture reste non autoritaire sans service financier.', 'لا يتم اعتماد الإغلاق دون خدمة مالية موثوقة.')}</Boundary></div></div></div>{dialog && <PreviewDialog lang={lang} title={copy(lang, 'Clôturer la caisse', 'إغلاق الصندوق')} description={copy(lang, 'Vérifiez les champs avant une future soumission financière.', 'راجع الحقول قبل الإرسال المالي مستقبلاً.')} close={() => setDialog(null)} onConfirm={() => { setDialog(null); setSaved(true); }} confirmLabel={copy(lang, 'Confirmer la prévisualisation', 'تأكيد المعاينة')} />}</>;
  return <><OpsHeader lang={lang} title={copy(lang, 'POS & caisse', 'نقطة البيع والصندوق')} description={copy(lang, 'Interface rapide pour rechercher, sélectionner, préparer le ticket et garder la vente en brouillon.', 'واجهة سريعة للبحث والاختيار وتحضير الإيصال مع إبقاء البيع مسودة.')} action={<button type="button" onClick={() => setDialog('cash')} className="focus-ring border hairline px-4 py-2 text-xs font-bold"><Wallet size={14} className="me-1 inline" />{copy(lang, 'Clôturer', 'إغلاق')}</button>} /><div className="grid gap-5 xl:grid-cols-[1fr_380px]"><section className="border hairline bg-[hsl(var(--card))] p-5" aria-labelledby="pos-products-title"><h2 id="pos-products-title" className="sr-only">{copy(lang, 'Sélectionner un produit', 'اختيار منتج')}</h2><div role="search" aria-label={copy(lang, 'Recherche POS', 'بحث نقطة البيع')} className="flex items-center gap-2 border hairline px-3 py-3"><Search size={16} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Rechercher ou scanner…', 'ابحث أو امسح…')} aria-label={copy(lang, 'Recherche produit', 'بحث عن منتج')} aria-controls="pos-product-results" /><Scan size={16} aria-hidden="true" /></div><div id="pos-product-results" className="mt-5 grid gap-2 sm:grid-cols-2" aria-live="polite">{visible.map((product, index) => <button type="button" key={product.id} ref={(element) => { productButtons.current[index] = element; }} onClick={() => add(product)} onKeyDown={(event) => { if (event.key === 'ArrowRight') { event.preventDefault(); moveProductFocus(index, 'next'); } else if (event.key === 'ArrowLeft') { event.preventDefault(); moveProductFocus(index, 'previous'); } else if (event.key === 'ArrowDown') { event.preventDefault(); moveProductFocus(index, 'rowNext'); } else if (event.key === 'ArrowUp') { event.preventDefault(); moveProductFocus(index, 'rowPrevious'); } }} disabled={!product.stock} aria-label={`${productName(lang, product.name, product.arabicName)} · ${product.stock ? copy(lang, 'Disponible', 'متوفر') : copy(lang, 'Rupture', 'غير متوفر')}`} aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight" className="focus-ring flex items-center justify-between border hairline p-3 text-start disabled:cursor-not-allowed disabled:opacity-45"><span><b className="block text-xs">{productName(lang, product.name, product.arabicName)}</b><small className="mono text-[10px]">{money(product.price)} · {product.stock ? copy(lang, 'Disponible', 'متوفر') : copy(lang, 'Rupture', 'غير متوفر')}</small></span><Plus size={15} aria-hidden="true" /></button>)}{!visible.length && <p className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Aucun produit trouvé.', 'لم يتم العثور على منتج.')}</p>}</div></section><aside className="border hairline bg-[hsl(var(--secondary))] p-5 text-white" aria-labelledby="pos-cart-title"><p id="pos-cart-title" className="eyebrow text-white/55">{copy(lang, 'Panier caisse · brouillon', 'سلة الصندوق · مسودة')}</p><div className="mt-4"><InputField label={copy(lang, 'Client / recherche', 'العميل / البحث')} value={customer} onChange={setCustomer} placeholder={copy(lang, 'Optionnel', 'اختياري')} /></div><div className="min-h-40 py-4" aria-live="polite">{cart.length ? cart.map((line) => <div key={line.product.id} className="border-b border-white/10 py-3 text-xs"><div className="flex justify-between gap-2"><span>{line.quantity} × {productName(lang, line.product.name, line.product.arabicName)}</span><span className="mono">{money(line.product.price * line.quantity)}</span></div><div className="mt-2 flex items-center gap-2"><button type="button" aria-label={`${copy(lang, 'Diminuer la quantité de', 'تقليل كمية')} ${productName(lang, line.product.name, line.product.arabicName)}`} className="focus-ring border border-white/25 px-2" onClick={() => change(line.product.id, -1)}>−</button><span aria-label={`${line.quantity} ${copy(lang, 'unité(s)', 'وحدة')}`}>{line.quantity}</span><button type="button" aria-label={`${copy(lang, 'Augmenter la quantité de', 'زيادة كمية')} ${productName(lang, line.product.name, line.product.arabicName)}`} className="focus-ring border border-white/25 px-2" onClick={() => change(line.product.id, 1)}>+</button></div></div>) : <p className="py-8 text-center text-xs text-white/55">{copy(lang, 'Aucun article ajouté', 'لم تتم إضافة أي عنصر')}</p>}</div><div className="border-t border-white/15 pt-4"><div className="flex justify-between font-bold"><span>{copy(lang, 'Total indicatif', 'الإجمالي التقديري')}</span><span className="mono" aria-live="polite">{money(total)}</span></div><button type="button" disabled={!cart.length} onClick={() => setDialog('payment')} className="focus-ring mt-4 w-full bg-[hsl(var(--primary))] py-3 text-xs font-bold disabled:opacity-40">{copy(lang, 'Préparer paiement / reçu', 'تحضير الدفع / الإيصال')}</button><p className="mt-4 flex items-center gap-2 text-[10px] text-white/55"><LockKeyhole size={13} aria-hidden="true" />{copy(lang, 'En ligne visuel · aucune vente engagée', 'حالة اتصال مرئية · لا يوجد بيع ملتزم به')}</p></div></aside></div>{dialog === 'payment' && <PreviewDialog lang={lang} title={copy(lang, 'Paiement / reçu', 'الدفع / الإيصال')} description={copy(lang, 'Le ticket reste une prévisualisation et aucune transaction n’est capturée.', 'يبقى الإيصال معاينة ولا يتم تحصيل أي معاملة.')} close={() => setDialog(null)} onConfirm={() => { setDialog(null); setSaved(true); }} confirmLabel={copy(lang, 'Prévisualiser le reçu', 'معاينة الإيصال')}><SelectField label={copy(lang, 'Mode de paiement', 'طريقة الدفع')} value="cod" onChange={() => undefined} options={[['cod', 'COD'], ['cash', copy(lang, 'Espèces', 'نقداً')]]} /><div className="mt-4">{saved && <Boundary tone="success">{copy(lang, 'Reçu local prévisualisé.', 'تمت معاينة الإيصال محلياً.')}</Boundary>}</div></PreviewDialog>}</>;
}

 function ProfessionalPeople({ lang, roles = false }: { lang: Lang; roles?: boolean }) {
  const [dialog, setDialog] = useState(false);
   const [saved, setSaved] = useState(false);
  const permissions = ['orders', 'customers', 'inventory', 'finance', 'settings'];
   return <><OpsHeader lang={lang} title={copy(lang, roles ? 'Rôles & permissions' : 'Équipe & droits', roles ? 'الأدوار والصلاحيات' : 'الفريق والصلاحيات')} description={copy(lang, 'Chaque accès est affiché avec portée, état, acteur et frontière de permission.', 'كل وصول معروض مع النطاق والحالة والمنفذ وحدود الصلاحية.')} action={<button type="button" onClick={() => { setSaved(false); setDialog(true); }} className="focus-ring bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} className="me-1 inline" />{copy(lang, roles ? 'Nouveau rôle' : 'Inviter', roles ? 'دور جديد' : 'دعوة')}</button>} /><div className="grid gap-3 sm:grid-cols-3"><Metric label={copy(lang, 'Membres', 'الأعضاء')} value="05" note={copy(lang, 'fixture', 'بيانات محلية')} /><Metric label={copy(lang, 'Rôles', 'الأدوار')} value="06" note={copy(lang, 'scope à confirmer', 'النطاق يحتاج إلى تأكيد')} /><Metric label={copy(lang, 'Refusé', 'مرفوض')} value="01" note={copy(lang, 'état démontré', 'حالة معروضة')} tone="warn" /></div>{roles ? <div className="mt-7 overflow-x-auto border hairline bg-[hsl(var(--card))]"><table className="w-full min-w-[720px] text-xs"><thead className="bg-[hsl(var(--muted)/.55)]"><tr><th className="px-4 py-3 text-start">{copy(lang, 'Permission', 'الصلاحية')}</th><th className="px-4 py-3 text-start">Owner</th><th className="px-4 py-3 text-start">Manager</th><th className="px-4 py-3 text-start">Operator</th><th className="px-4 py-3 text-start">Finance</th></tr></thead><tbody>{permissions.map((permission, index) => <tr key={permission} className="border-t hairline"><td className="px-4 py-4 font-bold">{permission}</td>{['Tout', index < 4 ? 'Lecture / action' : 'Refusé', index < 3 ? 'Action' : 'Refusé', permission === 'finance' ? 'Action' : 'Lecture'].map((value, itemIndex) => <td key={itemIndex} className="px-4 py-4"><StatusBadge label={copy(lang, value, value === 'Refusé' ? 'مرفوض' : value === 'Action' ? 'إجراء' : value === 'Lecture' ? 'قراءة' : 'الكل')} tone={value === 'Refusé' ? 'bad' : value === 'Action' ? 'good' : 'info'} icon={value === 'Refusé' ? LockKeyhole : Check} /></td>)}</tr>)}</tbody></table></div> : <OpsTable columns={[copy(lang, 'Membre', 'العضو'), copy(lang, 'Rôle', 'الدور'), copy(lang, 'Portée', 'النطاق'), copy(lang, 'État', 'الحالة'), copy(lang, 'Audit', 'التدقيق')]} rows={[['Amine M.', 'Owner', 'Tout', 'Actif', 'Aujourd’hui · local'], ['Sara K.', 'Orders operator', 'Orders / clients', 'Actif', 'Aujourd’hui · local'], ['Yacine R.', 'Finance', 'Lecture finance', 'Actif', 'Hier · local'], ['Compte local', 'Warehouse', 'Stock / achats', 'Forbidden', 'Règle à confirmer']]} />}{saved && <div className="mt-5"><Boundary tone="success">{copy(lang, roles ? 'Rôle prévisualisé localement.' : 'Invitation prévisualisée localement.', roles ? 'تمت معاينة الدور محلياً.' : 'تمت معاينة الدعوة محلياً.')}</Boundary></div>}<ModuleStateRail lang={lang} saved={saved} onRetry={() => setSaved(false)} onSuccess={() => setSaved(true)} />{dialog && <PreviewDialog lang={lang} title={copy(lang, roles ? 'Nouveau rôle' : 'Inviter un membre', roles ? 'دور جديد' : 'دعوة عضو')} description={copy(lang, 'Le changement sera seulement prévisualisé jusqu’à la connexion du service d’identité.', 'سيتم عرض التغيير كمعاينة فقط حتى ربط خدمة الهوية.')} close={() => setDialog(false)} onConfirm={() => { setDialog(false); setSaved(true); }} confirmLabel={copy(lang, 'Prévisualiser', 'معاينة')}><InputField label={copy(lang, 'Nom / email', 'الاسم / البريد')} value="" onChange={() => undefined} placeholder="nom@exemple.dz" required /><div className="mt-4"><SelectField label={copy(lang, 'Rôle', 'الدور')} value="operator" onChange={() => undefined} options={[['operator', 'Operator'], ['manager', 'Manager'], ['finance', 'Finance']]} /></div></PreviewDialog>}</>;
}

function ProfessionalFinance({ lang, kind }: { lang: Lang; kind: 'finance' | 'expenses' | 'profitability' | 'reports' }) {
  const [period, setPeriod] = useState('7d');
  const [channel, setChannel] = useState('all');
  const [exported, setExported] = useState(false);
  const title = kind === 'reports' ? copy(lang, 'Rapports & KPIs', 'التقارير والمؤشرات') : kind === 'expenses' ? copy(lang, 'Dépenses', 'المصروفات') : kind === 'profitability' ? copy(lang, 'Rentabilité', 'الربحية') : copy(lang, 'Finance', 'المالية');
  return <><OpsHeader lang={lang} title={title} description={copy(lang, 'Lecture analytique avec filtres visibles et aucune marge, COGS ou dépense inventée.', 'قراءة تحليلية مع مرشحات واضحة دون اختراع هامش أو تكلفة أو مصروف.')} action={<button type="button" onClick={() => setExported(true)} className="focus-ring border hairline px-4 py-2 text-xs font-bold"><Download size={14} className="me-1 inline" />{copy(lang, 'Exporter la vue', 'تصدير العرض')}</button>} /><div className="grid gap-4 border hairline bg-[hsl(var(--card))] p-5 sm:grid-cols-3"><SelectField label={copy(lang, 'Période', 'الفترة')} value={period} onChange={setPeriod} options={[['7d', '7 jours'], ['30d', '30 jours'], ['custom', copy(lang, 'À définir', 'يحدد لاحقاً')]]} /><SelectField label={copy(lang, 'Canal', 'القناة')} value={channel} onChange={setChannel} options={[['all', copy(lang, 'Tous', 'الكل')], ['store', copy(lang, 'Boutique', 'المتجر')], ['pos', 'POS']]} /><SelectField label={copy(lang, 'Produit', 'المنتج')} value="all" onChange={() => undefined} options={[['all', copy(lang, 'Tous', 'الكل')], ...products.slice(0, 3).map((product) => [product.id, productName(lang, product.name, product.arabicName)] as [string, string])]} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label={copy(lang, 'Revenu affiché', 'الإيراد المعروض')} value="286 400 DA" note={`${period} · ${channel}`} tone="info" /><Metric label={copy(lang, 'Remises', 'الخصومات')} value="—" note={copy(lang, 'non fourni', 'غير متوفر')} tone="warn" /><Metric label="COGS" value="—" note={copy(lang, 'coût manquant', 'التكلفة مفقودة')} tone="warn" /><Metric label={copy(lang, 'Bénéfice', 'الربح')} value="—" note={copy(lang, 'non calculable', 'لا يمكن حسابه')} tone="warn" /></div><div className="mt-7 grid gap-7 lg:grid-cols-[1.2fr_.8fr]"><OpsTable columns={[copy(lang, 'Période', 'الفترة'), copy(lang, 'Commandes', 'الطلبات'), copy(lang, 'Valeur', 'القيمة'), copy(lang, 'Lecture', 'القراءة')]} rows={[['Aujourd’hui', '1', '14 300 DA', 'COD · à confirmer'], ['Hier', '3', '272 100 DA', 'Mix fixture'], ['Total', '4', '286 400 DA', 'Local uniquement']]} /><div className="border hairline bg-[hsl(var(--card))] p-6"><p className="eyebrow">{copy(lang, 'Base de calcul', 'أساس الحساب')}</p><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy(lang, 'Les revenus visibles viennent des fixtures de commandes. Les coûts, remboursements et dépenses attendent les contrats marchands.', 'القيم الظاهرة من بيانات الطلبات المحلية. التكاليف والمبالغ المستردة والمصروفات بانتظار عقود التاجر.')}</p>{exported && <div className="mt-5"><Boundary tone="success">{copy(lang, 'Export local préparé. Aucun fichier réel n’a été transmis.', 'تم تحضير التصدير محلياً. لم يتم إرسال أي ملف حقيقي.')}</Boundary></div>}</div></div></>;
}

function orderTone(status: string): 'good' | 'warn' | 'bad' | 'info' {
  if (status === 'Livrée') return 'good';
  if (status === 'Expédiée' || status === 'En préparation') return 'info';
  if (status.includes('Échec')) return 'bad';
  return 'warn';
}

function ProfessionalDashboard({ lang }: { lang: Lang }) {
  const attention = orders.filter((order) => order.status === 'À confirmer' || order.status.includes('Échec'));
  const lowStock = products.filter((product) => product.stock <= 3);
  const prepared = orders.filter((order) => order.status === 'En préparation').length;
  const delivered = orders.filter((order) => order.status === 'Livrée').length;
  const metrics: Array<[string, string, string, 'good' | 'warn' | 'info']> = [
    [copy(lang, 'À traiter', 'تحتاج إلى إجراء'), String(attention.length), copy(lang, 'commandes à vérifier', 'طلبات تحتاج إلى تحقق'), 'warn' as const],
    [copy(lang, 'En préparation', 'قيد التحضير'), String(prepared), copy(lang, 'dans la file locale', 'في قائمة المعاينة'), 'info' as const],
    [copy(lang, 'Livrées', 'تم توصيلها'), String(delivered), copy(lang, 'dans le relevé local', 'في السجل المحلي'), 'good' as const],
    [copy(lang, 'Stock bas', 'مخزون منخفض'), String(lowStock.length), copy(lang, 'références à surveiller', 'منتجات تحتاج متابعة'), 'warn' as const],
  ];
  return <>
    <OpsHeader
      lang={lang}
      title={copy(lang, 'Vue d’ensemble', 'نظرة عامة')}
      description={copy(lang, 'Ce qui demande une action, ce qui avance et ce qui change — sans masquer la frontière des données locales.', 'ما يحتاج إلى إجراء وما يتحرك وما يتغير — مع إبقاء حدود البيانات المحلية واضحة.')}
      action={<StatusBadge label={copy(lang, 'Lecture locale', 'قراءة محلية')} tone="warn" icon={Info} />}
    />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, note, tone]) => <Metric key={label} label={label} value={value} note={note} tone={tone} />)}
    </div>
    <div className="mt-7 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <section className="border hairline bg-[hsl(var(--card))]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b hairline p-5">
          <div>
            <p className="eyebrow">{copy(lang, 'File d’attention', 'قائمة الانتباه')}</p>
            <h2 className="display mt-1 text-2xl uppercase">{copy(lang, 'À traiter maintenant', 'ما يحتاج إلى معالجة الآن')}</h2>
          </div>
          <Link href="/ops/orders" className="focus-ring flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]">{copy(lang, 'Voir les commandes', 'عرض الطلبات')}<ArrowRight size={14} /></Link>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[620px] text-start text-xs">
            <thead className="bg-[hsl(var(--muted)/.55)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              <tr><th className="px-5 py-3 text-start">{copy(lang, 'Référence', 'المرجع')}</th><th className="px-5 py-3 text-start">{copy(lang, 'Client', 'العميل')}</th><th className="px-5 py-3 text-start">{copy(lang, 'Destination', 'الوجهة')}</th><th className="px-5 py-3 text-start">{copy(lang, 'État', 'الحالة')}</th><th className="px-5 py-3 text-start">{copy(lang, 'Total', 'الإجمالي')}</th></tr>
            </thead>
            <tbody>{attention.map((order) => <tr className="border-t hairline" key={order.id}><td className="px-5 py-4 mono font-bold">{order.id}</td><td className="px-5 py-4">{order.customer}</td><td className="px-5 py-4 text-[hsl(var(--muted-foreground))]">{order.city}</td><td className="px-5 py-4"><StatusBadge label={copy(lang, order.status, order.status === 'À confirmer' ? 'بانتظار التأكيد' : 'فشل التوصيل')} tone={orderTone(order.status)} icon={order.status.includes('Échec') ? AlertCircle : Clock3} /></td><td className="px-5 py-4 mono font-bold">{order.total}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="divide-y hairline md:hidden">
          {attention.map((order) => <Link href={`/orders/${order.id}`} key={order.id} className="focus-ring block p-4">
            <div className="flex items-start justify-between gap-3"><span className="mono text-xs font-bold">{order.id}</span><StatusBadge label={copy(lang, order.status, order.status === 'À confirmer' ? 'بانتظار التأكيد' : 'فشل التوصيل')} tone={orderTone(order.status)} icon={order.status.includes('Échec') ? AlertCircle : Clock3} /></div>
            <p className="mt-3 text-sm font-bold">{order.customer}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{order.city} · {order.total}</p>
          </Link>)}
          {!attention.length && <p className="p-5 text-sm text-[hsl(var(--muted-foreground))]">{copy(lang, 'Aucune commande à traiter.', 'لا توجد طلبات تحتاج إلى معالجة.')}</p>}
        </div>
      </section>
      <section className="border hairline bg-[hsl(var(--secondary))] p-5 text-white">
        <p className="eyebrow text-white/55">{copy(lang, 'Signal stock', 'إشارة المخزون')}</p>
        <h2 className="display mt-2 text-3xl uppercase">{copy(lang, 'À surveiller', 'تحتاج إلى متابعة')}</h2>
        <div className="mt-6 space-y-3">
          {lowStock.map((product) => <Link href="/ops/inventory" key={product.id} className="focus-ring flex items-center justify-between gap-3 border-b border-white/10 pb-3 text-xs">
            <span><b className="block text-white">{productName(lang, product.name, product.arabicName)}</b><small className="mt-1 block text-white/55">{categoryName(lang, product.category)}</small></span>
            <span className="mono shrink-0 text-[hsl(var(--primary))]">{product.stock} {copy(lang, 'unités', 'وحدات')}</span>
          </Link>)}
        </div>
        <Link href="/ops/inventory" className="focus-ring mt-7 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]">{copy(lang, 'Ouvrir l’inventaire', 'فتح الجرد')}<ArrowRight size={14} /></Link>
      </section>
    </div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_.8fr]">
      <section className="border hairline bg-[hsl(var(--card))] p-5">
        <div className="flex items-end justify-between gap-3 border-b hairline pb-4"><div><p className="eyebrow">{copy(lang, 'Activité récente', 'النشاط الأخير')}</p><h2 className="display mt-1 text-2xl uppercase">{copy(lang, 'Mouvement de la journée', 'حركة اليوم')}</h2></div><History size={17} className="text-[hsl(var(--primary))]" /></div>
          <div className="mt-4 space-y-4">{orders.slice(0, 3).map((order) => <div className="flex gap-3 text-xs" key={order.id}><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><div><p className="font-bold"><bdi className="mono">{order.id}</bdi> · {order.customer}</p><p className="mt-1 text-[hsl(var(--muted-foreground))]"><span className="date-value">{orderDate(lang, order.date)}</span> · {order.status}</p></div></div>)}</div>
      </section>
      <Boundary tone="warn">{copy(lang, 'Cette vue lit des fixtures locales. Les chiffres, permissions, transitions et actions finales devront venir des contrats autoritaires.', 'هذه الشاشة تقرأ بيانات محلية. الأرقام والصلاحيات والانتقالات والإجراءات النهائية يجب أن تأتي من عقود موثوقة.')}</Boundary>
    </div>
    <StateCoveragePanel lang={lang} states={[
      { label: ['Loading', 'جارٍ التحميل'], detail: ['Clients : skeleton puis lecture locale.', 'العملاء: هيكل تحميل ثم قراءة محلية.'], href: '/ops/customers', tone: 'info' },
      { label: ['No search results', 'لا توجد نتائج بحث'], detail: ['Commandes : recherche et filtre sans résultat.', 'الطلبات: بحث ومرشح بلا نتائج.'], href: '/ops/orders', tone: 'neutral' },
      { label: ['Unauthorized / expired', 'غير مصرح / منتهية'], detail: ['Compte : session locale expirée, puis reprise.', 'الحساب: جلسة محلية منتهية ثم استئناف.'], href: '/account', tone: 'warn' },
      { label: ['Forbidden', 'ممنوع'], detail: ['Rôles : accès refusé visible par permission.', 'الأدوار: يظهر الرفض حسب الصلاحية.'], href: '/ops/roles', tone: 'bad' },
      { label: ['Not found', 'غير موجود'], detail: ['Produit inconnu : aucun fallback silencieux.', 'منتج غير معروف: دون بديل صامت.'], href: '/shop/not-found-reference', tone: 'bad' },
      { label: ['Pending / unavailable', 'قيد الانتظار / غير متاح'], detail: ['Checkout et livraison gardent leurs blocages explicites.', 'الدفع والتوصيل يحافظان على حالات التوقف الواضحة.'], href: '/checkout', tone: 'warn' },
      { label: ['Low stock / failed delivery', 'مخزون منخفض / فشل التوصيل'], detail: ['Inventaire et commandes portent les alertes métier.', 'الجرد والطلبات يحملان تنبيهات العمل.'], href: '/ops/inventory', tone: 'warn' },
      { label: ['Success / retry', 'نجاح / إعادة المحاولة'], detail: ['Confirmation et actions locales restent réversibles.', 'التأكيد والإجراءات المحلية قابلة لإعادة المحاولة.'], href: '/confirmation', tone: 'good' },
    ]} />
  </>;
}

function ProfessionalOrders({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const statuses = Array.from(new Set(orders.map((order) => order.status)));
  const visible = orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer} ${order.city}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === 'all' || order.status === status);
  });
  const selectedOrder = orders.find((order) => order.id === selected);
  return <>
    <OpsHeader
      lang={lang}
      title={copy(lang, 'Commandes opérationnelles', 'الطلبات التشغيلية')}
      description={copy(lang, 'Recherche rapide, lecture de l’état et prochaine action sans mélanger la commande locale et la commande confirmée.', 'بحث سريع وقراءة واضحة للحالة والخطوة التالية دون خلط بين الطلب المحلي والطلب المؤكد.')}
      action={<StatusBadge label={copy(lang, `${visible.length} résultats`, `${visible.length} نتائج`)} tone="info" icon={ClipboardCheck} />}
    />
    <section className="border hairline bg-[hsl(var(--card))] p-4 sm:p-5" aria-label={copy(lang, 'Liste et filtres des commandes', 'قائمة ومرشحات الطلبات')}>
      <div className="filter-row flex flex-col gap-3 lg:flex-row" role="group" aria-label={copy(lang, 'Filtres des commandes', 'مرشحات الطلبات')} aria-controls="professional-orders-results">
        <label className="flex min-w-0 flex-1 items-center gap-2 border hairline bg-[hsl(var(--background))] px-3 py-3">
          <Search size={16} aria-hidden="true" className="shrink-0 text-[hsl(var(--muted-foreground))]" /><span className="sr-only">{copy(lang, 'Rechercher une commande', 'بحث عن طلب')}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="focus-ring w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Référence, client ou ville…', 'المرجع أو العميل أو الولاية…')} aria-label={copy(lang, 'Rechercher une commande', 'بحث عن طلب')} aria-controls="professional-orders-results" />
        </label>
        <div className="flex gap-2 overflow-x-auto" aria-label={copy(lang, 'Statut de commande', 'حالة الطلب')}>
          <button type="button" onClick={() => setStatus('all')} aria-pressed={status === 'all'} className={`focus-ring whitespace-nowrap border px-3 py-2 text-xs font-bold ${status === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Toutes', 'الكل')}</button>
          {statuses.map((item) => <button type="button" onClick={() => setStatus(item)} aria-pressed={status === item} key={item} className={`focus-ring whitespace-nowrap border px-3 py-2 text-xs font-bold ${status === item ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, item, item === 'À confirmer' ? 'بانتظار التأكيد' : item === 'En préparation' ? 'قيد التحضير' : item === 'Expédiée' ? 'تم الشحن' : 'تم التوصيل')}</button>)}
        </div>
      </div>
      <div id="professional-orders-results" className="mt-4 hidden overflow-x-auto md:block" aria-live="polite">
        <table className="w-full min-w-[760px] text-start text-xs">
          <thead className="bg-[hsl(var(--muted)/.55)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><tr><th className="px-4 py-3 text-start">{copy(lang, 'Référence', 'المرجع')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Client', 'العميل')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Destination', 'الوجهة')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Date', 'التاريخ')}</th><th className="px-4 py-3 text-start">{copy(lang, 'État', 'الحالة')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Total', 'الإجمالي')}</th><th className="px-4 py-3 text-start"><span className="sr-only">{copy(lang, 'Action', 'إجراء')}</span></th></tr></thead>
           <tbody>{visible.map((order) => <tr className="border-t hairline" key={order.id}><td className="px-4 py-4 mono font-bold"><bdi>{order.id}</bdi></td><td className="px-4 py-4"><bdi>{order.customer}</bdi></td><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]"><bdi>{order.city}</bdi></td><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]"><span className="date-value">{orderDate(lang, order.date)}</span></td><td className="px-4 py-4"><StatusBadge label={copy(lang, order.status, order.status === 'À confirmer' ? 'بانتظار التأكيد' : order.status === 'En préparation' ? 'قيد التحضير' : order.status === 'Expédiée' ? 'تم الشحن' : 'تم التوصيل')} tone={orderTone(order.status)} icon={order.status.includes('Échec') ? AlertCircle : order.status === 'Livrée' ? CheckCircle2 : Clock3} /></td><td className="px-4 py-4 mono font-bold"><bdi>{order.total}</bdi></td><td className="px-4 py-4 text-end"><button type="button" onClick={() => setSelected(order.id)} aria-haspopup="dialog" className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">{copy(lang, 'Ouvrir', 'فتح')}</button></td></tr>)}</tbody>
        </table>
      </div>
       <div className="divide-y hairline md:hidden" aria-live="polite">{visible.map((order) => <button type="button" onClick={() => setSelected(order.id)} key={order.id} aria-haspopup="dialog" className="focus-ring block w-full py-4 text-start">
        <div className="flex items-start justify-between gap-3"><span className="mono text-xs font-bold">{order.id}</span><StatusBadge label={copy(lang, order.status, order.status === 'À confirmer' ? 'بانتظار التأكيد' : order.status === 'En préparation' ? 'قيد التحضير' : order.status === 'Expédiée' ? 'تم الشحن' : 'تم التوصيل')} tone={orderTone(order.status)} icon={order.status === 'Livrée' ? CheckCircle2 : Clock3} /></div>
         <p className="mt-3 text-sm font-bold"><bdi>{order.customer}</bdi></p><div className="mt-1 flex justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]"><span><bdi>{order.city}</bdi> · <span className="date-value">{orderDate(lang, order.date)}</span></span><span className="mono font-bold text-[hsl(var(--foreground))]"><bdi>{order.total}</bdi></span></div>
      </button>)}</div>
      {!visible.length && <div className="py-12 text-center"><Archive className="mx-auto text-[hsl(var(--primary))]" size={24} /><p className="mt-3 text-sm font-bold">{copy(lang, 'Aucune commande trouvée', 'لم يتم العثور على طلبات')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Modifiez la recherche ou le filtre.', 'غيّر البحث أو المرشح.')}</p></div>}
    </section>
    <Boundary tone="warn">{copy(lang, 'Les actions de confirmation, d’annulation, de livraison et de remboursement restent protégées par le futur service autoritaire.', 'إجراءات التأكيد والإلغاء والتوصيل والاسترداد ستبقى محمية بواسطة الخدمة الموثوقة مستقبلاً.')}</Boundary>
    {selectedOrder && <PreviewDialog lang={lang} title={selectedOrder.id} description={copy(lang, 'Lecture locale de la commande et de son état courant.', 'قراءة محلية للطلب وحالته الحالية.')} close={() => setSelected(null)} onConfirm={() => setSelected(null)} confirmLabel={copy(lang, 'Fermer la lecture', 'إغلاق القراءة')}><div className="grid gap-3 sm:grid-cols-2"><Spec label={copy(lang, 'Client', 'العميل')} value={selectedOrder.customer} /><Spec label={copy(lang, 'Destination', 'الوجهة')} value={selectedOrder.city} /><Spec label={copy(lang, 'État', 'الحالة')} value={copy(lang, selectedOrder.status, selectedOrder.status === 'À confirmer' ? 'بانتظار التأكيد' : selectedOrder.status === 'En préparation' ? 'قيد التحضير' : selectedOrder.status === 'Expédiée' ? 'تم الشحن' : 'تم التوصيل')} /><Spec label={copy(lang, 'Total', 'الإجمالي')} value={selectedOrder.total} mono /></div></PreviewDialog>}
  </>;
}

type LocalCustomer = {
  id: string;
  name: string;
  city: string;
  orders: number;
  lastOrder: string;
  status: string;
};

function localCustomers(): LocalCustomer[] {
  const grouped = new Map<string, LocalCustomer>();
  orders.forEach((order) => {
    const current = grouped.get(order.customer);
    if (current) {
      current.orders += 1;
      current.lastOrder = order.date;
      current.status = order.status;
      return;
    }
    grouped.set(order.customer, {
      id: `customer-${order.customer.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: order.customer,
      city: order.city,
      orders: 1,
      lastOrder: order.date,
      status: order.status,
    });
  });
  return Array.from(grouped.values());
}

function ProfessionalCustomers({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<LocalCustomer | null>(null);
  const [dialog, setDialog] = useState<'new' | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState({ name: '', phone: '', city: '', note: '' });
  const customers = useMemo(() => localCustomers(), []);
  const visible = customers.filter((customer) => `${customer.name} ${customer.city} ${customer.status}`.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(timer);
  }, []);
  const updateDraft = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const openNew = () => {
    setSaved(false);
    setDraft({ name: '', phone: '', city: '', note: '' });
    setDialog('new');
  };
  return <>
    <OpsHeader
      lang={lang}
      title={copy(lang, 'Fiches clients', 'بطاقات العملاء')}
      description={copy(lang, 'Retrouver rapidement un client, lire son historique local et préparer la prochaine action sans masquer les données manquantes.', 'اعثر على العميل بسرعة واقرأ سجله المحلي وحضّر الخطوة التالية دون إخفاء البيانات الناقصة.')}
      action={<button type="button" onClick={openNew} className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />{copy(lang, 'Préparer une fiche', 'تحضير بطاقة')}</button>}
    />
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric label={copy(lang, 'Clients visibles', 'العملاء الظاهرون')} value={String(customers.length)} note={copy(lang, 'issus des commandes locales', 'من الطلبات المحلية')} tone="info" />
      <Metric label={copy(lang, 'Commandes liées', 'الطلبات المرتبطة')} value={String(orders.length)} note={copy(lang, 'lecture du fixture', 'قراءة البيانات المحلية')} tone="good" />
      <Metric label={copy(lang, 'Profil à compléter', 'ملف يحتاج إكمالاً')} value={copy(lang, 'Téléphone', 'الهاتف')} note={copy(lang, 'non fourni dans le fixture', 'غير مقدم في البيانات')} tone="warn" />
    </div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2 border hairline bg-[hsl(var(--background))] px-3 py-3">
          <Search size={16} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
          <span className="sr-only">{copy(lang, 'Rechercher un client', 'البحث عن عميل')}</span>
          <input data-testid="input-ops-customers-search" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Nom, ville ou état…', 'الاسم أو الولاية أو الحالة…')} />
        </label>
        <StatusBadge label={copy(lang, `${visible.length} fiches`, `${visible.length} بطاقات`)} tone="info" icon={Users} />
      </div>
      {loading ? <div className="mt-4 space-y-3" aria-label={copy(lang, 'Chargement des clients', 'تحميل العملاء')}><div className="skeleton h-12 w-full" /><div className="skeleton h-12 w-full" /><div className="skeleton h-12 w-4/5" /></div>
        : error ? <div className="mt-4 border border-[hsl(var(--destructive)/.45)] bg-[hsl(var(--destructive)/.06)] p-6" role="alert"><p className="text-sm font-bold">{copy(lang, 'La lecture locale a échoué.', 'تعذرت القراءة المحلية.')}</p><button type="button" onClick={() => { setError(false); setLoading(true); window.setTimeout(() => setLoading(false), 260); }} className="focus-ring mt-3 text-xs font-bold underline">{copy(lang, 'Réessayer', 'إعادة المحاولة')}</button></div>
        : visible.length ? <><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-start text-xs"><thead className="bg-[hsl(var(--muted)/.55)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><tr><th className="px-4 py-3 text-start">{copy(lang, 'Client', 'العميل')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Ville', 'المدينة')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Commandes', 'الطلبات')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Dernière activité', 'آخر نشاط')}</th><th className="px-4 py-3 text-start">{copy(lang, 'État', 'الحالة')}</th><th className="px-4 py-3 text-end">{copy(lang, 'Lecture', 'قراءة')}</th></tr></thead><tbody>{visible.map((customer) => <tr className="border-t hairline" key={customer.id}><td className="px-4 py-4 font-bold"><bdi>{customer.name}</bdi></td><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]"><bdi>{customer.city}</bdi></td><td className="px-4 py-4 mono"><bdi>{customer.orders}</bdi></td><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]"><span className="date-value">{orderDate(lang, customer.lastOrder)}</span></td><td className="px-4 py-4"><StatusBadge label={copy(lang, customer.status, customer.status === 'À confirmer' ? 'بانتظار التأكيد' : customer.status === 'En préparation' ? 'قيد التحضير' : customer.status === 'Expédiée' ? 'تم الشحن' : 'تم التوصيل')} tone={orderTone(customer.status)} icon={customer.status === 'Livrée' ? CheckCircle2 : Clock3} /></td><td className="px-4 py-4 text-end"><button type="button" onClick={() => setSelected(customer)} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]" data-testid={`button-view-customer-${customer.id}`}>{copy(lang, 'Ouvrir', 'فتح')}</button></td></tr>)}</tbody></table></div><div className="divide-y hairline md:hidden">{visible.map((customer) => <button type="button" key={customer.id} onClick={() => setSelected(customer)} className="focus-ring block w-full py-4 text-start" data-testid={`card-customer-${customer.id}`}><div className="flex items-start justify-between gap-3"><span className="text-sm font-bold"><bdi>{customer.name}</bdi></span><StatusBadge label={copy(lang, customer.status, customer.status === 'À confirmer' ? 'بانتظار التأكيد' : customer.status === 'En préparation' ? 'قيد التحضير' : customer.status === 'Expédiée' ? 'تم الشحن' : 'تم التوصيل')} tone={orderTone(customer.status)} /></div><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]"><bdi>{customer.city}</bdi> · <span className="numeric-value">{customer.orders}</span> {copy(lang, 'commande(s)', 'طلب')}</p></button>)}</div></>
        : <div className="py-12 text-center"><UserRound className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 text-sm font-bold">{copy(lang, 'Aucun client dans cette lecture.', 'لا يوجد عميل في هذه القراءة.')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Modifiez la recherche ou préparez une fiche locale.', 'غيّر البحث أو حضّر بطاقة محلية.')}</p></div>}
    </section>
    {saved && <div className="mt-5"><Boundary tone="success">{copy(lang, 'Fiche client prévisualisée localement. Aucun profil n’a été créé.', 'تمت معاينة بطاقة العميل محلياً. لم يتم إنشاء أي ملف.')}</Boundary></div>}
    <Boundary tone="warn">{copy(lang, 'Les coordonnées complètes, l’identité, l’historique fiable et les actions client restent server-owned.', 'بيانات الاتصال الكاملة والهوية والسجل الموثوق وإجراءات العميل تبقى من اختصاص الخادم.')}</Boundary>
    {selected && <PreviewDialog lang={lang} title={selected.name} description={copy(lang, 'Lecture du profil et des commandes visibles dans le fixture local.', 'قراءة الملف والطلبات الظاهرة في البيانات المحلية.')} close={() => setSelected(null)} confirmLabel={copy(lang, 'Fermer la lecture', 'إغلاق القراءة')} onConfirm={() => setSelected(null)}><div className="grid gap-3 sm:grid-cols-2"><Spec label={copy(lang, 'Ville', 'المدينة')} value={selected.city} /><Spec label={copy(lang, 'Commandes', 'الطلبات')} value={String(selected.orders)} mono /><Spec label={copy(lang, 'Dernière activité', 'آخر نشاط')} value={orderDate(lang, selected.lastOrder)} /><Spec label={copy(lang, 'Téléphone', 'الهاتف')} value={copy(lang, 'Masqué dans le fixture', 'مخفي في البيانات')} /><div className="sm:col-span-2"><Boundary>{copy(lang, 'La fiche peut être lue ici, mais aucune information client ne peut être confirmée depuis cette surface locale.', 'يمكن قراءة البطاقة هنا، لكن لا يمكن تأكيد معلومات العميل من هذه المساحة المحلية.')}</Boundary></div></div><div className="mt-5"><OpsTable columns={[copy(lang, 'Commande', 'الطلب'), copy(lang, 'Destination', 'الوجهة'), copy(lang, 'État', 'الحالة'), copy(lang, 'Date', 'التاريخ')]} rows={orders.filter((order) => order.customer === selected.name).map((order) => [order.id, order.city, order.status, orderDate(lang, order.date)])} /></div></PreviewDialog>}
    {dialog === 'new' && <PreviewDialog lang={lang} title={copy(lang, 'Préparer une fiche', 'تحضير بطاقة')} description={copy(lang, 'Saisissez les champs disponibles pour vérifier le futur parcours de création.', 'أدخل الحقول المتاحة للتحقق من مسار الإنشاء المستقبلي.')} close={() => setDialog(null)} onConfirm={() => { setDialog(null); setSaved(true); }} confirmLabel={copy(lang, 'Prévisualiser la fiche', 'معاينة البطاقة')}><div className="grid gap-4 sm:grid-cols-2"><InputField label={copy(lang, 'Nom complet', 'الاسم الكامل')} value={draft.name} onChange={updateDraft('name')} placeholder={copy(lang, 'Nom du client', 'اسم العميل')} required /><InputField label={copy(lang, 'Téléphone', 'الهاتف')} value={draft.phone} onChange={updateDraft('phone')} placeholder="+213 …" /><InputField label={copy(lang, 'Ville / wilaya', 'المدينة / الولاية')} value={draft.city} onChange={updateDraft('city')} placeholder={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} /><InputField label={copy(lang, 'Note opérationnelle', 'ملاحظة تشغيلية')} value={draft.note} onChange={updateDraft('note')} placeholder={copy(lang, 'Optionnel', 'اختياري')} /></div></PreviewDialog>}
  </>;
}

type LocalProduct = Product & { visibility: 'Publié' | 'Brouillon' };

function ProfessionalProducts({ lang }: { lang: Lang }) {
  const [catalog, setCatalog] = useState<LocalProduct[]>(() => products.map((product) => ({ ...product, visibility: product.stock ? 'Publié' : 'Brouillon' })));
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState('all');
  const [selected, setSelected] = useState<LocalProduct | null>(null);
  const [editing, setEditing] = useState<LocalProduct | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ name: '', category: '', price: '', stock: '', visibility: 'Brouillon' });
  const visible = catalog.filter((product) => `${product.name} ${product.arabicName} ${product.id} ${product.category}`.toLowerCase().includes(query.toLowerCase()) && (availability === 'all' || (availability === 'available' ? product.stock > 0 : product.stock === 0)));
  const updateDraft = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const openCreate = () => {
    setSaved(false);
    setEditing(null);
    setDraft({ name: '', category: '', price: '', stock: '', visibility: 'Brouillon' });
    setEditorOpen(true);
  };
  const openEdit = (product: LocalProduct) => {
    setSaved(false);
    setEditing(product);
    setDraft({ name: product.name, category: product.category, price: String(product.price), stock: String(product.stock), visibility: product.visibility });
    setEditorOpen(true);
  };
  const saveDraft = () => {
    if (!draft.name || !draft.category || !draft.price) return;
    if (editing) {
      setCatalog((current) => current.map((product) => product.id === editing.id ? { ...product, name: draft.name, category: draft.category, price: Number(draft.price), stock: Number(draft.stock || 0), visibility: draft.visibility as LocalProduct['visibility'] } : product));
    } else {
      const id = `local-${Date.now()}`;
      setCatalog((current) => [...current, { id, name: draft.name, arabicName: draft.name, category: draft.category, format: 'format à confirmer', price: Number(draft.price), stock: Number(draft.stock || 0), tone: 'paper', detail: 'Fixture local à compléter.', tags: [], visibility: draft.visibility as LocalProduct['visibility'] }]);
    }
    setEditing(null);
    setEditorOpen(false);
    setSaved(true);
  };
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Catalogue produits', 'كتالوج المنتجات')} description={copy(lang, 'Maintenir une lecture nette du catalogue, de la disponibilité et des champs encore détenus par le marchand.', 'حافظ على قراءة واضحة للكتالوج والتوفر والحقول التي لا تزال من اختصاص التاجر.')} action={<button type="button" onClick={openCreate} className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />{copy(lang, 'Nouveau produit', 'منتج جديد')}</button>} />
    <div className="grid gap-3 sm:grid-cols-3"><Metric label={copy(lang, 'Références', 'المراجع')} value={String(catalog.length)} note={copy(lang, 'fixture + brouillons locaux', 'بيانات ومسودات محلية')} /><Metric label={copy(lang, 'Disponibles', 'متوفرة')} value={String(catalog.filter((product) => product.stock > 0).length)} note={copy(lang, 'stock de référence', 'مخزون مرجعي')} tone="good" /><Metric label={copy(lang, 'À compléter', 'تحتاج إكمالاً')} value={copy(lang, 'SKU', 'SKU')} note={copy(lang, 'champ marchand-owned', 'حقل من اختصاص التاجر')} tone="warn" /></div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5"><div className="flex flex-col gap-3 lg:flex-row"><label className="flex min-w-0 flex-1 items-center gap-2 border hairline bg-[hsl(var(--background))] px-3 py-3"><Search size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">{copy(lang, 'Rechercher un produit', 'البحث عن منتج')}</span><input data-testid="input-ops-products-search" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Produit, SKU ou catégorie…', 'المنتج أو SKU أو الفئة…')} /></label><div className="flex gap-2"><button type="button" onClick={() => setAvailability('all')} className={`focus-ring border px-3 py-2 text-xs font-bold ${availability === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Tout', 'الكل')}</button><button type="button" onClick={() => setAvailability('available')} className={`focus-ring border px-3 py-2 text-xs font-bold ${availability === 'available' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Disponible', 'متوفر')}</button><button type="button" onClick={() => setAvailability('out')} className={`focus-ring border px-3 py-2 text-xs font-bold ${availability === 'out' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Rupture', 'غير متوفر')}</button></div></div>{visible.length ? <><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-start text-xs"><thead className="bg-[hsl(var(--muted)/.55)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><tr><th className="px-4 py-3 text-start">{copy(lang, 'Produit', 'المنتج')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Catégorie', 'الفئة')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Prix', 'السعر')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Stock', 'المخزون')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Visibilité', 'الظهور')}</th><th className="px-4 py-3 text-end">{copy(lang, 'Actions', 'الإجراءات')}</th></tr></thead><tbody>{visible.map((product) => <tr className="border-t hairline" key={product.id}><td className="px-4 py-4"><div className="flex items-center gap-3"><div className={`product-visual product-visual--${product.tone} grid h-10 w-10 shrink-0 place-items-center`}><Package size={16} className="text-white/70" /></div><span><b className="block">{productName(lang, product.name, product.arabicName)}</b><small className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{product.id}</small></span></div></td><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]">{categoryName(lang, product.category)}</td><td className="px-4 py-4 mono font-bold">{money(product.price)}</td><td className="px-4 py-4"><StatusBadge label={product.stock ? `${product.stock} ${copy(lang, 'unités', 'وحدات')}` : copy(lang, 'Rupture', 'غير متوفر')} tone={product.stock ? 'good' : 'bad'} /></td><td className="px-4 py-4"><StatusBadge label={copy(lang, product.visibility, product.visibility === 'Publié' ? 'منشور' : 'مسودة')} tone={product.visibility === 'Publié' ? 'info' : 'warn'} /></td><td className="px-4 py-4 text-end"><button type="button" onClick={() => setSelected(product)} className="focus-ring me-3 text-xs font-bold text-[hsl(var(--muted-foreground))]" data-testid={`button-read-product-${product.id}`}>{copy(lang, 'Lire', 'قراءة')}</button><button type="button" onClick={() => openEdit(product)} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]" data-testid={`button-edit-product-${product.id}`}>{copy(lang, 'Modifier', 'تعديل')}</button></td></tr>)}</tbody></table></div><div className="divide-y hairline md:hidden">{visible.map((product) => <div key={product.id} className="py-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{productName(lang, product.name, product.arabicName)}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{categoryName(lang, product.category)} · {money(product.price)}</p></div><StatusBadge label={product.stock ? `${product.stock}` : copy(lang, 'Rupture', 'غير متوفر')} tone={product.stock ? 'good' : 'bad'} /></div><div className="mt-3 flex gap-3"><button type="button" onClick={() => setSelected(product)} className="focus-ring border hairline px-3 py-2 text-xs font-bold">{copy(lang, 'Lire', 'قراءة')}</button><button type="button" onClick={() => openEdit(product)} className="focus-ring border border-[hsl(var(--primary))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary))]">{copy(lang, 'Modifier', 'تعديل')}</button></div></div>)}</div></> : <div className="py-12 text-center"><Package className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 text-sm font-bold">{copy(lang, 'Aucun produit trouvé.', 'لم يتم العثور على منتج.')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Essayez une autre recherche ou disponibilité.', 'جرّب بحثاً أو توفراً آخر.')}</p></div>}</section>
    {saved && <div className="mt-5"><Boundary tone="success">{copy(lang, 'Aperçu produit local enregistré dans cette session. Aucun catalogue serveur n’a changé.', 'تم حفظ معاينة المنتج محلياً في هذه الجلسة. لم يتغير كتالوج الخادم.')}</Boundary></div>}
    <Boundary tone="warn">{copy(lang, 'SKU, code-barres, marque, prix comparé, nutrition, ingrédients et allégations restent server-owned.', 'SKU والرمز الشريطي والعلامة والسعر المقارن والقيم الغذائية والمكونات والادعاءات تبقى من اختصاص الخادم.')}</Boundary>
     <ModuleStateRail lang={lang} saved={saved} onRetry={() => setSaved(false)} onSuccess={() => setSaved(true)} />
    {selected && <PreviewDialog lang={lang} title={productName(lang, selected.name, selected.arabicName)} description={copy(lang, 'Lecture de référence avant modification du catalogue local.', 'قراءة المرجع قبل تعديل الكتالوج المحلي.')} close={() => setSelected(null)} onConfirm={() => setSelected(null)} confirmLabel={copy(lang, 'Fermer la lecture', 'إغلاق القراءة')}><div className="grid gap-3 sm:grid-cols-2"><Spec label={copy(lang, 'Catégorie', 'الفئة')} value={categoryName(lang, selected.category)} /><Spec label={copy(lang, 'Prix', 'السعر')} value={money(selected.price)} mono /><Spec label={copy(lang, 'Stock fixture', 'مخزون البيانات')} value={String(selected.stock)} mono /><Spec label={copy(lang, 'Format', 'الحجم')} value={selected.format} /><Spec label="SKU" value={copy(lang, 'À fournir', 'بانتظار البيانات')} mono /><Spec label={copy(lang, 'Marque', 'العلامة')} value={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} /></div></PreviewDialog>}
    {editorOpen && <PreviewDialog lang={lang} title={editing ? copy(lang, 'Modifier le produit', 'تعديل المنتج') : copy(lang, 'Nouveau produit', 'منتج جديد')} description={copy(lang, 'Les champs sont contrôlés localement et le résultat reste une prévisualisation.', 'الحقول محلية والنتيجة تبقى معاينة.')} close={() => { setEditorOpen(false); setEditing(null); setDraft({ name: '', category: '', price: '', stock: '', visibility: 'Brouillon' }); }} onConfirm={saveDraft} confirmLabel={editing ? copy(lang, 'Prévisualiser la modification', 'معاينة التعديل') : copy(lang, 'Prévisualiser le produit', 'معاينة المنتج')}><div className="grid gap-4 sm:grid-cols-2"><InputField label={copy(lang, 'Nom produit', 'اسم المنتج')} value={draft.name} onChange={updateDraft('name')} placeholder={copy(lang, 'Nom à confirmer', 'اسم يحتاج إلى تأكيد')} required /><InputField label={copy(lang, 'Catégorie', 'الفئة')} value={draft.category} onChange={updateDraft('category')} placeholder={copy(lang, 'Catégorie existante', 'فئة موجودة')} required /><InputField label={copy(lang, 'Prix', 'السعر')} value={draft.price} onChange={updateDraft('price')} placeholder="0" type="number" required /><InputField label={copy(lang, 'Stock', 'المخزون')} value={draft.stock} onChange={updateDraft('stock')} placeholder="0" type="number" /><SelectField label={copy(lang, 'Visibilité', 'الظهور')} value={draft.visibility} onChange={updateDraft('visibility')} options={[['Publié', copy(lang, 'Publié', 'منشور')], ['Brouillon', copy(lang, 'Brouillon', 'مسودة')]]} /></div></PreviewDialog>}
  </>;
}

type LocalCategory = { id: string; name: string; brand: string; products: number; visibility: 'Visible' | 'Masquée' };

function ProfessionalCategories({ lang }: { lang: Lang }) {
  const initial = useMemo(() => Array.from(new Set(products.map((product) => product.category))).map((name) => ({ id: `category-${name.toLowerCase()}`, name, brand: 'À confirmer', products: products.filter((product) => product.category === name).length, visibility: 'Visible' as const })), []);
  const [categories, setCategories] = useState<LocalCategory[]>(initial);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<LocalCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ name: '', brand: '', visibility: 'Visible' });
  const visible = categories.filter((category) => `${category.name} ${category.brand}`.toLowerCase().includes(query.toLowerCase()));
  const updateDraft = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const openCreate = () => { setEditing(null); setSaved(false); setDraft({ name: '', brand: '', visibility: 'Visible' }); setDialogOpen(true); };
  const openEdit = (category: LocalCategory) => { setEditing(category); setSaved(false); setDraft({ name: category.name, brand: category.brand, visibility: category.visibility }); setDialogOpen(true); };
  const save = () => {
    if (!draft.name) return;
    if (editing) setCategories((current) => current.map((category) => category.id === editing.id ? { ...category, name: draft.name, brand: draft.brand || 'À confirmer', visibility: draft.visibility as LocalCategory['visibility'] } : category));
    else setCategories((current) => [...current, { id: `local-category-${Date.now()}`, name: draft.name, brand: draft.brand || 'À confirmer', products: 0, visibility: draft.visibility as LocalCategory['visibility'] }]);
    setDialogOpen(false);
    setSaved(true);
  };
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Catégories & marques', 'الفئات والعلامات')} description={copy(lang, 'Organiser les rayons visibles et préparer la structure de marque sans inventer de données marchandes.', 'نظّم الأقسام الظاهرة وحضّر بنية العلامة دون اختلاق بيانات تجارية.')} action={<button type="button" onClick={openCreate} className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />{copy(lang, 'Nouvelle catégorie', 'فئة جديدة')}</button>} />
    <div className="grid gap-3 sm:grid-cols-3"><Metric label={copy(lang, 'Catégories', 'الفئات')} value={String(categories.length)} note={copy(lang, 'issues du catalogue local', 'من الكتالوج المحلي')} tone="info" /><Metric label={copy(lang, 'Produits classés', 'المنتجات المصنفة')} value={String(products.length)} note={copy(lang, 'références visibles', 'مراجع ظاهرة')} tone="good" /><Metric label={copy(lang, 'Marques', 'العلامات')} value={copy(lang, 'À confirmer', 'يحتاج تأكيداً')} note={copy(lang, 'aucune marque fournie', 'لم تقدم أي علامة')} tone="warn" /></div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5"><label className="flex items-center gap-2 border hairline bg-[hsl(var(--background))] px-3 py-3"><Search size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">{copy(lang, 'Rechercher une catégorie', 'البحث عن فئة')}</span><input data-testid="input-ops-categories-search" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Catégorie ou marque…', 'الفئة أو العلامة…')} /></label>{visible.length ? <><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[720px] text-start text-xs"><thead className="bg-[hsl(var(--muted)/.55)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><tr><th className="px-4 py-3 text-start">{copy(lang, 'Catégorie', 'الفئة')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Marque', 'العلامة')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Produits', 'المنتجات')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Visibilité', 'الظهور')}</th><th className="px-4 py-3 text-end">{copy(lang, 'Action', 'الإجراء')}</th></tr></thead><tbody>{visible.map((category) => <tr className="border-t hairline" key={category.id}><td className="px-4 py-4 font-bold">{categoryName(lang, category.name)}</td><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]">{category.brand === 'À confirmer' ? copy(lang, category.brand, 'يحتاج إلى تأكيد') : category.brand}</td><td className="px-4 py-4 mono">{category.products}</td><td className="px-4 py-4"><StatusBadge label={copy(lang, category.visibility, 'ظاهر')} tone="good" icon={Tag} /></td><td className="px-4 py-4 text-end"><button type="button" onClick={() => openEdit(category)} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]" data-testid={`button-edit-category-${category.id}`}>{copy(lang, 'Modifier', 'تعديل')}</button></td></tr>)}</tbody></table></div><div className="divide-y hairline md:hidden">{visible.map((category) => <div className="py-4" key={category.id}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{categoryName(lang, category.name)}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{category.brand === 'À confirmer' ? copy(lang, category.brand, 'يحتاج إلى تأكيد') : category.brand} · {category.products} {copy(lang, 'produit(s)', 'منتجات')}</p></div><Tag size={16} className="text-[hsl(var(--primary))]" /></div><button type="button" onClick={() => openEdit(category)} className="focus-ring mt-3 border hairline px-3 py-2 text-xs font-bold">{copy(lang, 'Modifier', 'تعديل')}</button></div>)}</div></> : <div className="py-12 text-center"><Tag className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 text-sm font-bold">{copy(lang, 'Aucune catégorie trouvée.', 'لم يتم العثور على فئة.')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Essayez un autre terme de recherche.', 'جرّب عبارة بحث أخرى.')}</p></div>}</section>
    {saved && <div className="mt-5"><Boundary tone="success">{copy(lang, 'Organisation locale prévisualisée. Aucun rayon serveur n’a changé.', 'تمت معاينة التنظيم المحلي. لم يتغير أي قسم على الخادم.')}</Boundary></div>}
    <Boundary tone="warn">{copy(lang, 'Les slugs, règles de navigation, marques officielles et ordre publié devront être validés par le service marchand.', 'يجب اعتماد الروابط وقواعد التنقل والعلامات الرسمية والترتيب المنشور من خدمة التاجر.')}</Boundary>
     <ModuleStateRail lang={lang} saved={saved} onRetry={() => setSaved(false)} onSuccess={() => setSaved(true)} />
    {dialogOpen && <PreviewDialog lang={lang} title={editing ? copy(lang, 'Modifier la catégorie', 'تعديل الفئة') : copy(lang, 'Nouvelle catégorie', 'فئة جديدة')} description={copy(lang, 'Prévisualisez l’organisation avant toute future écriture serveur.', 'عاين التنظيم قبل أي حفظ مستقبلي على الخادم.')} close={() => setDialogOpen(false)} onConfirm={save} confirmLabel={editing ? copy(lang, 'Prévisualiser la modification', 'معاينة التعديل') : copy(lang, 'Prévisualiser la catégorie', 'معاينة الفئة')}><div className="grid gap-4 sm:grid-cols-2"><InputField label={copy(lang, 'Nom de catégorie', 'اسم الفئة')} value={draft.name} onChange={updateDraft('name')} placeholder={copy(lang, 'Nom à confirmer', 'اسم يحتاج إلى تأكيد')} required /><InputField label={copy(lang, 'Marque', 'العلامة')} value={draft.brand} onChange={updateDraft('brand')} placeholder={copy(lang, 'À fournir', 'بانتظار البيانات')} /><SelectField label={copy(lang, 'Visibilité', 'الظهور')} value={draft.visibility} onChange={updateDraft('visibility')} options={[['Visible', copy(lang, 'Visible', 'ظاهر')], ['Masquée', copy(lang, 'Masquée', 'مخفي')]]} /><InputField label={copy(lang, 'Ordre d’affichage', 'ترتيب العرض')} value="" onChange={() => undefined} placeholder={copy(lang, 'À définir', 'يحدد لاحقاً')} /></div></PreviewDialog>}
  </>;
}

function ModuleStateRail({ lang, saved, onRetry, onSuccess }: { lang: Lang; saved: boolean; onRetry: () => void; onSuccess: () => void }) {
  return <div className="mt-7 grid gap-4 md:grid-cols-3">
    <div className="border hairline bg-[hsl(var(--card))] p-5"><p className="eyebrow">{copy(lang, 'Chargement', 'التحميل')}</p><div className="skeleton mt-4 h-3 w-3/4" /><div className="skeleton mt-2 h-3 w-1/2" /></div>
    <div className="border hairline bg-[hsl(var(--card))] p-5"><p className="eyebrow">{copy(lang, 'Erreur récupérable', 'خطأ قابل لإعادة المحاولة')}</p><p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Prévisualisez un retry local sans appel réseau.', 'عاين إعادة المحاولة محلياً دون اتصال.')}</p><button type="button" onClick={onRetry} className="focus-ring mt-3 text-xs font-bold underline">{copy(lang, 'Réessayer localement', 'إعادة المحاولة محلياً')}</button></div>
    <div className="border hairline bg-[hsl(var(--card))] p-5"><p className="eyebrow">{copy(lang, 'Succès local', 'نجاح محلي')}</p>{saved ? <StatusBadge label={copy(lang, 'Prévisualisé', 'تمت المعاينة')} tone="good" icon={CheckCircle2} /> : <button type="button" onClick={onSuccess} className="focus-ring mt-4 text-xs font-bold underline">{copy(lang, 'Simuler une réussite', 'معاينة النجاح')}</button>}</div>
  </div>;
}

type FulfillmentKind = 'delivery' | 'returns' | 'exchanges' | 'refunds';

function ProfessionalFulfillment({ lang, kind }: { lang: Lang; kind: FulfillmentKind }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<{ ref: string; subject: string; detail: string; status: string } | null>(null);
  const [dialog, setDialog] = useState(false);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const config = {
    delivery: {
      title: ['Livraison & expéditions', 'التوصيل والشحنات'],
      description: ['Suivre la destination, la méthode et le prochain geste sans inventer de transporteur.', 'تابع الوجهة والطريقة والخطوة التالية دون اختلاق شركة توصيل.'],
      action: ['Préparer une expédition', 'تحضير شحنة'],
      metric: ['Expéditions', 'الشحنات'],
      subject: ['Destinataire', 'المستلم'],
      detail: ['Destination', 'الوجهة'],
      statuses: ['À préparer', 'En transit', 'Incident'],
      rows: [
        { ref: 'PN-1048', subject: 'Nadia B.', detail: 'Oran · domicile', status: 'À préparer' },
        { ref: 'PN-1046', subject: 'Amel S.', detail: 'Blida · point à confirmer', status: 'En transit' },
        { ref: 'PN-1043', subject: 'Karim M.', detail: 'Sétif · exception', status: 'Incident' },
      ],
    },
    returns: {
      title: ['Retours', 'الإرجاع'],
      description: ['Examiner l’éligibilité, la condition reçue et la disposition avant toute décision.', 'راجع الأهلية والحالة المستلمة والمعالجة قبل أي قرار.'],
      action: ['Ouvrir une demande', 'فتح طلب إرجاع'],
      metric: ['Demandes ouvertes', 'الطلبات المفتوحة'],
      subject: ['Commande / article', 'الطلب / المنتج'],
      detail: ['Motif', 'السبب'],
      statuses: ['À inspecter', 'En attente', 'Refusé'],
      rows: [
        { ref: 'RET-014', subject: 'PN-1045 · whey', detail: 'Article à inspecter', status: 'À inspecter' },
        { ref: 'RET-013', subject: 'PN-1042 · créatine', detail: 'Motif à confirmer', status: 'En attente' },
        { ref: 'RET-011', subject: 'PN-1039 · shaker', detail: 'Hors fenêtre locale', status: 'Refusé' },
      ],
    },
    exchanges: {
      title: ['Échanges', 'الاستبدال'],
      description: ['Comparer l’article demandé, le variant de remplacement et la différence éventuelle.', 'قارن المنتج المطلوب والصيغة البديلة وأي فرق محتمل.'],
      action: ['Préparer un échange', 'تحضير استبدال'],
      metric: ['Dossiers actifs', 'الملفات النشطة'],
      subject: ['Commande / article', 'الطلب / المنتج'],
      detail: ['Variant demandé', 'الصيغة المطلوبة'],
      statuses: ['À valider', 'Préparation', 'Différence à calculer'],
      rows: [
        { ref: 'EXC-006', subject: 'PN-1047 · whey', detail: 'Format 2 kg à confirmer', status: 'À valider' },
        { ref: 'EXC-005', subject: 'PN-1041 · créatine', detail: 'Stock de remplacement local', status: 'Préparation' },
        { ref: 'EXC-004', subject: 'PN-1038 · pre-workout', detail: 'Prix à calculer', status: 'Différence à calculer' },
      ],
    },
    refunds: {
      title: ['Remboursements', 'المبالغ المستردة'],
      description: ['Vérifier le montant, la méthode et l’approbation sans présenter de mouvement financier réel.', 'تحقق من المبلغ والطريقة والاعتماد دون عرض حركة مالية حقيقية.'],
      action: ['Préparer un remboursement', 'تحضير استرداد'],
      metric: ['À rapprocher', 'بانتظار المطابقة'],
      subject: ['Demande / commande', 'الطلب / المعاملة'],
      detail: ['Montant / méthode', 'المبلغ / الطريقة'],
      statuses: ['À approuver', 'Préparé', 'Bloqué'],
      rows: [
        { ref: 'RFD-008', subject: 'PN-1045', detail: '11 600 DA · méthode à définir', status: 'À approuver' },
        { ref: 'RFD-007', subject: 'PN-1036', detail: '5 400 DA · aperçu préparé', status: 'Préparé' },
        { ref: 'RFD-006', subject: 'PN-1031', detail: 'Approbateur manquant', status: 'Bloqué' },
      ],
    },
  }[kind];
  const translateStatus = (status: string) => {
    const arabic: Record<string, string> = {
      'À préparer': 'بانتظار التحضير', 'En transit': 'قيد التوصيل', Incident: 'استثناء',
      'À inspecter': 'بانتظار الفحص', 'En attente': 'قيد الانتظار', Refusé: 'مرفوض',
      'À valider': 'بانتظار الاعتماد', Préparation: 'قيد التحضير', 'Différence à calculer': 'فرق يحتاج حساباً',
      'À approuver': 'بانتظار الاعتماد', Préparé: 'تم التحضير', Bloqué: 'متوقف',
    };
    return copy(lang, status, arabic[status] ?? status);
  };
  const tone = (status: string): 'good' | 'warn' | 'bad' | 'info' => status === 'Préparé' || status === 'En transit' ? 'good' : status === 'Refusé' || status === 'Bloqué' || status === 'Incident' ? 'bad' : status === 'À inspecter' || status === 'À approuver' ? 'warn' : 'info';
  const visible = config.rows.filter((row) => `${row.ref} ${row.subject} ${row.detail}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || row.status === filter));
  const updateDraft = (value: string) => setDraft(value);
  const title = copy(lang, config.title[0], config.title[1]);
  return <>
    <OpsHeader lang={lang} title={title} description={copy(lang, config.description[0], config.description[1])} action={<button type="button" onClick={() => { setSaved(false); setDraft(''); setDialog(true); }} className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />{copy(lang, config.action[0], config.action[1])}</button>} />
    <div className="grid gap-3 sm:grid-cols-3"><Metric label={copy(lang, config.metric[0], config.metric[1])} value={String(config.rows.length)} note={copy(lang, 'fixture local', 'بيانات محلية')} tone="info" /><Metric label={copy(lang, 'En attente', 'قيد الانتظار')} value={String(config.rows.filter((row) => row.status !== 'Préparé' && row.status !== 'En transit').length)} note={copy(lang, 'prochaine action visible', 'الخطوة التالية واضحة')} tone="warn" /><Metric label={copy(lang, 'Boundary', 'حد البيانات')} value="LOCAL" note={copy(lang, 'aucun mouvement réel', 'لا توجد حركة حقيقية')} tone="good" /></div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row"><label className="flex min-w-0 flex-1 items-center gap-2 border hairline bg-[hsl(var(--background))] px-3 py-3"><Search size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">{copy(lang, 'Rechercher', 'بحث')}</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Référence, client ou état…', 'المرجع أو العميل أو الحالة…')} /></label><div className="flex gap-2 overflow-x-auto"><button type="button" onClick={() => setFilter('all')} className={`focus-ring whitespace-nowrap border px-3 py-2 text-xs font-bold ${filter === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Tout', 'الكل')}</button>{config.statuses.map((status) => <button type="button" key={status} onClick={() => setFilter(status)} className={`focus-ring whitespace-nowrap border px-3 py-2 text-xs font-bold ${filter === status ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{translateStatus(status)}</button>)}</div></div>
      {error && <div className="mt-4 flex items-center justify-between gap-3 border border-[hsl(var(--destructive)/.45)] bg-[hsl(var(--destructive)/.06)] p-4 text-xs" role="alert"><span>{copy(lang, 'La lecture de cette file a échoué localement.', 'تعذرت قراءة هذه القائمة محلياً.')}</span><button type="button" onClick={() => setError(false)} className="focus-ring font-bold underline">{copy(lang, 'Réessayer', 'إعادة المحاولة')}</button></div>}
      {visible.length ? <><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-start text-xs"><thead className="bg-[hsl(var(--muted)/.55)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><tr><th className="px-4 py-3 text-start">{copy(lang, 'Référence', 'المرجع')}</th><th className="px-4 py-3 text-start">{copy(lang, config.subject[0], config.subject[1])}</th><th className="px-4 py-3 text-start">{copy(lang, config.detail[0], config.detail[1])}</th><th className="px-4 py-3 text-start">{copy(lang, 'État', 'الحالة')}</th><th className="px-4 py-3 text-end">{copy(lang, 'Lecture', 'قراءة')}</th></tr></thead><tbody>{visible.map((row) => <tr key={row.ref} className="border-t hairline"><td className="px-4 py-4 mono font-bold">{row.ref}</td><td className="px-4 py-4 font-bold">{row.subject}</td><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]">{row.detail}</td><td className="px-4 py-4"><StatusBadge label={translateStatus(row.status)} tone={tone(row.status)} icon={row.status === 'Incident' || row.status === 'Bloqué' ? AlertCircle : row.status === 'Préparé' || row.status === 'En transit' ? CheckCircle2 : Clock3} /></td><td className="px-4 py-4 text-end"><button type="button" onClick={() => setSelected(row)} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">{copy(lang, 'Ouvrir', 'فتح')}</button></td></tr>)}</tbody></table></div><div className="divide-y hairline md:hidden">{visible.map((row) => <button type="button" key={row.ref} onClick={() => setSelected(row)} className="focus-ring block w-full py-4 text-start"><div className="flex items-start justify-between gap-3"><span className="mono text-xs font-bold">{row.ref}</span><StatusBadge label={translateStatus(row.status)} tone={tone(row.status)} /></div><p className="mt-3 text-sm font-bold">{row.subject}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{row.detail}</p></button>)}</div></> : <div className="py-14 text-center"><Archive className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 text-sm font-bold">{copy(lang, 'Aucun dossier dans cette vue.', 'لا توجد ملفات في هذا العرض.')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Modifiez la recherche ou le filtre.', 'غيّر البحث أو المرشح.')}</p></div>}
    </section>
    <ModuleStateRail lang={lang} saved={saved} onRetry={() => setError(false)} onSuccess={() => setSaved(true)} />
    <Boundary tone="warn">{copy(lang, 'Les décisions, remboursements, effets stock et événements transporteur restent server-owned.', 'القرارات والمبالغ المستردة وتأثير المخزون وأحداث شركة التوصيل تبقى من اختصاص الخادم.')}</Boundary>
    {selected && <PreviewDialog lang={lang} title={selected.ref} description={copy(lang, 'Lecture de la fiche et de sa prochaine action locale.', 'قراءة الملف وخطوته التالية محلياً.')} close={() => setSelected(null)} onConfirm={() => { setSelected(null); setSaved(true); }} confirmLabel={copy(lang, 'Prévisualiser la suite', 'معاينة الخطوة التالية')}><div className="grid gap-3 sm:grid-cols-2"><Spec label={copy(lang, config.subject[0], config.subject[1])} value={selected.subject} /><Spec label={copy(lang, config.detail[0], config.detail[1])} value={selected.detail} /><Spec label={copy(lang, 'État', 'الحالة')} value={translateStatus(selected.status)} /><Spec label={copy(lang, 'Acteur', 'المنفذ')} value={copy(lang, 'Session locale', 'جلسة محلية')} /><div className="sm:col-span-2"><InputField label={copy(lang, 'Note de traitement', 'ملاحظة المعالجة')} value={draft} onChange={updateDraft} placeholder={copy(lang, 'Optionnel mais visible dans la preview', 'اختياري لكنه يظهر في المعاينة')} /></div></div></PreviewDialog>}
    {dialog && <PreviewDialog lang={lang} title={title} description={copy(lang, 'Préparez le prochain geste sans créer de mouvement réel.', 'حضّر الخطوة التالية دون إنشاء حركة حقيقية.')} close={() => setDialog(false)} onConfirm={() => { setDialog(false); setSaved(true); }} confirmLabel={copy(lang, 'Prévisualiser', 'معاينة')}><div className="grid gap-4 sm:grid-cols-2"><InputField label={copy(lang, config.subject[0], config.subject[1])} value={draft} onChange={updateDraft} placeholder={copy(lang, 'Référence à confirmer', 'مرجع يحتاج إلى تأكيد')} required /><SelectField label={copy(lang, 'État initial', 'الحالة الأولية')} value="pending" onChange={() => undefined} options={[['pending', copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')], ['blocked', copy(lang, 'Bloqué', 'متوقف')]]} /><InputField label={copy(lang, 'Note opérateur', 'ملاحظة المنفذ')} value="" onChange={() => undefined} placeholder={copy(lang, 'Optionnel', 'اختياري')} /></div></PreviewDialog>}
  </>;
}

function ProfessionalCoupons({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [dialog, setDialog] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ code: '', rule: '', limit: '' });
  const rows = [
    { code: 'WELCOME-LOCAL', rule: 'Règle à fournir', valid: 'Dates à confirmer', usage: '0 / limite inconnue', state: 'Brouillon' },
    { code: 'RECOVERY-LOCAL', rule: 'Aucune remise calculée', valid: 'Non publié', usage: 'Non actif', state: 'Désactivé' },
    { code: 'ATHLETE-LOCAL', rule: 'Éligibilité à confirmer', valid: 'Période locale', usage: 'Usage à confirmer', state: 'À valider' },
  ];
  const visible = rows.filter((row) => `${row.code} ${row.rule} ${row.state}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || row.state === filter));
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Coupons & promotions', 'القسائم والعروض')} description={copy(lang, 'Préparer des règles lisibles sans inventer de remise, d’éligibilité ou de période de validité.', 'حضّر قواعد واضحة دون اختلاق خصم أو أهلية أو فترة صلاحية.')} action={<button type="button" onClick={() => { setSaved(false); setDraft({ code: '', rule: '', limit: '' }); setDialog(true); }} className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />{copy(lang, 'Nouveau coupon', 'قسيمة جديدة')}</button>} />
    <div className="grid gap-3 sm:grid-cols-3"><Metric label={copy(lang, 'Règles locales', 'القواعد المحلية')} value={String(rows.length)} note={copy(lang, 'aucune remise active', 'لا يوجد خصم فعال')} tone="info" /><Metric label={copy(lang, 'À valider', 'بانتظار الاعتماد')} value="03" note={copy(lang, 'conditions marchandes', 'شروط تجارية')} tone="warn" /><Metric label={copy(lang, 'Usage', 'الاستخدام')} value="—" note={copy(lang, 'source server-owned', 'مصدر موثوق لاحقاً')} /></div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5"><div className="flex flex-col gap-3 lg:flex-row"><label className="flex flex-1 items-center gap-2 border hairline bg-[hsl(var(--background))] px-3 py-3"><Tag size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">{copy(lang, 'Rechercher un coupon', 'البحث عن قسيمة')}</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Code ou règle…', 'الرمز أو القاعدة…')} /></label><div className="flex gap-2"><button type="button" onClick={() => setFilter('all')} className={`focus-ring border px-3 py-2 text-xs font-bold ${filter === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Tout', 'الكل')}</button><button type="button" onClick={() => setFilter('Brouillon')} className={`focus-ring border px-3 py-2 text-xs font-bold ${filter === 'Brouillon' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Brouillons', 'المسودات')}</button></div></div>{visible.length ? <><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[780px] text-start text-xs"><thead className="bg-[hsl(var(--muted)/.55)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><tr><th className="px-4 py-3 text-start">CODE</th><th className="px-4 py-3 text-start">{copy(lang, 'Règle', 'القاعدة')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Validité', 'الصلاحية')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Usage', 'الاستخدام')}</th><th className="px-4 py-3 text-start">{copy(lang, 'État', 'الحالة')}</th><th className="px-4 py-3 text-end">{copy(lang, 'Action', 'الإجراء')}</th></tr></thead><tbody>{visible.map((row) => <tr className="border-t hairline" key={row.code}><td className="px-4 py-4 mono font-bold">{row.code}</td><td className="px-4 py-4">{row.rule}</td><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]">{row.valid}</td><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]">{row.usage}</td><td className="px-4 py-4"><StatusBadge label={row.state} tone={row.state === 'Désactivé' ? 'neutral' : row.state === 'À valider' ? 'warn' : 'info'} icon={row.state === 'À valider' ? AlertCircle : Tag} /></td><td className="px-4 py-4 text-end"><button type="button" onClick={() => setDialog(true)} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">{copy(lang, 'Modifier', 'تعديل')}</button></td></tr>)}</tbody></table></div><div className="divide-y hairline md:hidden">{visible.map((row) => <button type="button" onClick={() => setDialog(true)} key={row.code} className="focus-ring block w-full py-4 text-start"><div className="flex items-start justify-between gap-3"><span className="mono text-xs font-bold">{row.code}</span><StatusBadge label={row.state} tone={row.state === 'À valider' ? 'warn' : 'info'} /></div><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{row.rule} · {row.usage}</p></button>)}</div></> : <div className="py-14 text-center"><Tag className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 text-sm font-bold">{copy(lang, 'Aucun coupon trouvé.', 'لم يتم العثور على قسيمة.')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Le filtre ne correspond à aucune règle locale.', 'لا يطابق المرشح أي قاعدة محلية.')}</p></div>}</section>
    {saved && <div className="mt-5"><Boundary tone="success">{copy(lang, 'Coupon prévisualisé localement. Aucun code réel n’est actif.', 'تمت معاينة القسيمة محلياً. لا يوجد رمز حقيقي فعال.')}</Boundary></div>}
    <Boundary tone="warn">{copy(lang, 'Les règles d’éligibilité, de remise, de période et de limite d’usage doivent être validées par le marchand et le service autoritaire.', 'يجب اعتماد قواعد الأهلية والخصم والفترة وحد الاستخدام من التاجر والخدمة الموثوقة.')}</Boundary>
     <ModuleStateRail lang={lang} saved={saved} onRetry={() => setSaved(false)} onSuccess={() => setSaved(true)} />
    {dialog && <PreviewDialog lang={lang} title={copy(lang, 'Coupon local', 'قسيمة محلية')} description={copy(lang, 'Contrôlez la forme de la règle avant sa future publication.', 'راجع شكل القاعدة قبل نشرها مستقبلاً.')} close={() => setDialog(false)} onConfirm={() => { setDialog(false); setSaved(true); }} confirmLabel={copy(lang, 'Prévisualiser le coupon', 'معاينة القسيمة')}><div className="grid gap-4 sm:grid-cols-2"><InputField label={copy(lang, 'Code', 'الرمز')} value={draft.code} onChange={(value) => setDraft((current) => ({ ...current, code: value }))} placeholder="CODE-À-CONFIRMER" required /><InputField label={copy(lang, 'Règle / remise', 'القاعدة / الخصم')} value={draft.rule} onChange={(value) => setDraft((current) => ({ ...current, rule: value }))} placeholder={copy(lang, 'Condition à fournir', 'شرط بانتظار البيانات')} required /><InputField label={copy(lang, 'Limite d’usage', 'حد الاستخدام')} value={draft.limit} onChange={(value) => setDraft((current) => ({ ...current, limit: value }))} placeholder={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} /><SelectField label={copy(lang, 'État', 'الحالة')} value="draft" onChange={() => undefined} options={[['draft', copy(lang, 'Brouillon', 'مسودة')], ['disabled', copy(lang, 'Désactivé', 'معطل')]]} /></div></PreviewDialog>}
  </>;
}

function ProfessionalReviews({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<{ id: string; subject: string; rating: string; status: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const rows = [
    { id: 'REV-021', subject: 'PN-1048 · whey', rating: '— / 5', status: 'En attente' },
    { id: 'REV-020', subject: 'PN-1045 · créatine', rating: '— / 5', status: 'À vérifier' },
    { id: 'REV-018', subject: 'PN-1039 · shaker', rating: '— / 5', status: 'Masqué' },
  ];
  const visible = rows.filter((row) => `${row.id} ${row.subject} ${row.status}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || row.status === filter));
  const statusTone = (status: string): 'warn' | 'info' | 'neutral' => status === 'Masqué' ? 'neutral' : status === 'À vérifier' ? 'warn' : 'info';
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Avis & modération', 'الآراء والمراجعة')} description={copy(lang, 'Lire, vérifier et préparer une décision sans afficher d’évaluation ou de contenu non fourni.', 'اقرأ وراجع وحضّر القرار دون عرض تقييم أو محتوى غير مقدم.')} action={<StatusBadge label={copy(lang, `${visible.length} à revoir`, `${visible.length} للمراجعة`)} tone="info" icon={Sparkles} />} />
    <div className="grid gap-3 sm:grid-cols-3"><Metric label={copy(lang, 'En attente', 'قيد الانتظار')} value="02" note={copy(lang, 'modération locale', 'مراجعة محلية')} tone="warn" /><Metric label={copy(lang, 'Avis visibles', 'الآراء الظاهرة')} value="00" note={copy(lang, 'aucun avis inventé', 'لا توجد آراء مختلقة')} tone="good" /><Metric label={copy(lang, 'Signal', 'الإشارة')} value="—" note={copy(lang, 'rating à fournir', 'التقييم بانتظار البيانات')} /></div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row"><label className="flex flex-1 items-center gap-2 border hairline bg-[hsl(var(--background))] px-3 py-3"><Search size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">{copy(lang, 'Rechercher un avis', 'البحث عن رأي')}</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Commande, produit ou état…', 'الطلب أو المنتج أو الحالة…')} /></label><div className="flex gap-2 overflow-x-auto"><button type="button" onClick={() => setFilter('all')} className={`focus-ring whitespace-nowrap border px-3 py-2 text-xs font-bold ${filter === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Tout', 'الكل')}</button>{['En attente', 'À vérifier', 'Masqué'].map((status) => <button type="button" key={status} onClick={() => setFilter(status)} className={`focus-ring whitespace-nowrap border px-3 py-2 text-xs font-bold ${filter === status ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, status, status === 'En attente' ? 'قيد الانتظار' : status === 'À vérifier' ? 'يحتاج مراجعة' : 'مخفي')}</button>)}</div></div>{visible.length ? <><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[720px] text-start text-xs"><thead className="bg-[hsl(var(--muted)/.55)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><tr><th className="px-4 py-3 text-start">{copy(lang, 'Référence', 'المرجع')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Commande / produit', 'الطلب / المنتج')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Note', 'التقييم')}</th><th className="px-4 py-3 text-start">{copy(lang, 'État', 'الحالة')}</th><th className="px-4 py-3 text-end">{copy(lang, 'Décision', 'القرار')}</th></tr></thead><tbody>{visible.map((row) => <tr className="border-t hairline" key={row.id}><td className="px-4 py-4 mono font-bold">{row.id}</td><td className="px-4 py-4">{row.subject}</td><td className="px-4 py-4 mono">{row.rating}</td><td className="px-4 py-4"><StatusBadge label={copy(lang, row.status, row.status === 'En attente' ? 'قيد الانتظار' : row.status === 'À vérifier' ? 'يحتاج مراجعة' : 'مخفي')} tone={statusTone(row.status)} icon={row.status === 'À vérifier' ? AlertCircle : Sparkles} /></td><td className="px-4 py-4 text-end"><button type="button" onClick={() => setSelected(row)} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">{copy(lang, 'Examiner', 'مراجعة')}</button></td></tr>)}</tbody></table></div><div className="divide-y hairline md:hidden">{visible.map((row) => <button type="button" onClick={() => setSelected(row)} key={row.id} className="focus-ring block w-full py-4 text-start"><div className="flex items-start justify-between gap-3"><span className="mono text-xs font-bold">{row.id}</span><StatusBadge label={copy(lang, row.status, row.status === 'En attente' ? 'قيد الانتظار' : row.status === 'À vérifier' ? 'يحتاج مراجعة' : 'مخفي')} tone={statusTone(row.status)} /></div><p className="mt-3 text-sm font-bold">{row.subject}</p><p className="mt-1 mono text-xs text-[hsl(var(--muted-foreground))]">{row.rating}</p></button>)}</div></> : <div className="py-14 text-center"><Sparkles className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 text-sm font-bold">{copy(lang, 'Aucun avis dans cette vue.', 'لا توجد آراء في هذا العرض.')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Les avis réels seront fournis puis modérés.', 'سيتم تقديم الآراء الحقيقية ثم مراجعتها.')}</p></div>}</section>
    {saved && <div className="mt-5"><Boundary tone="success">{copy(lang, 'Décision de modération prévisualisée localement.', 'تمت معاينة قرار المراجعة محلياً.')}</Boundary></div>}
    <Boundary tone="warn">{copy(lang, 'Le texte, la note, l’identité du client et l’historique de modération restent merchant/server-owned.', 'النص والتقييم وهوية العميل وسجل المراجعة تبقى من اختصاص التاجر والخادم.')}</Boundary>
     <ModuleStateRail lang={lang} saved={saved} onRetry={() => setSaved(false)} onSuccess={() => setSaved(true)} />
    {selected && <PreviewDialog lang={lang} title={selected.id} description={copy(lang, 'Aucun contenu d’avis n’est affiché tant que la source réelle n’est pas fournie.', 'لا يتم عرض محتوى الرأي حتى يتم توفير المصدر الحقيقي.')} close={() => setSelected(null)} onConfirm={() => { setSelected(null); setSaved(true); }} confirmLabel={copy(lang, 'Prévisualiser la décision', 'معاينة القرار')}><div className="grid gap-4 sm:grid-cols-2"><Spec label={copy(lang, 'Commande / produit', 'الطلب / المنتج')} value={selected.subject} /><Spec label={copy(lang, 'Note', 'التقييم')} value={selected.rating} mono /><Spec label={copy(lang, 'État', 'الحالة')} value={copy(lang, selected.status, selected.status === 'En attente' ? 'قيد الانتظار' : selected.status === 'À vérifier' ? 'يحتاج مراجعة' : 'مخفي')} /><SelectField label={copy(lang, 'Décision locale', 'القرار المحلي')} value="pending" onChange={() => undefined} options={[['pending', copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')], ['approve', copy(lang, 'Préparer approbation', 'تحضير الاعتماد')], ['reject', copy(lang, 'Préparer rejet', 'تحضير الرفض')]]} /><div className="sm:col-span-2"><InputField label={copy(lang, 'Motif si rejet', 'سبب الرفض إن وجد')} value="" onChange={() => undefined} placeholder={copy(lang, 'Obligatoire dans le futur flux', 'إجباري في المسار المستقبلي')} /></div></div></PreviewDialog>}
  </>;
}

function ProfessionalNotifications({ lang }: { lang: Lang }) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selected, setSelected] = useState<{ id: string; title: string; detail: string; unread: boolean } | null>(null);
  const [read, setRead] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const events = [
    { id: 'evt-1048', title: 'Commande à confirmer', detail: 'PN-1048 · Nadia B. · Oran', unread: true },
    { id: 'evt-stock', title: 'Stock à surveiller', detail: 'Pre-workout / citrus · 3 unités', unread: true },
    { id: 'evt-local', title: 'Boundary fournisseur', detail: 'Aucun événement externe connecté', unread: false },
  ];
  const visible = events.filter((event) => filter === 'all' || (event.unread && !read.includes(event.id)));
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 240);
    return () => window.clearTimeout(timer);
  }, []);
  const retry = () => {
    setError(false);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 240);
  };
  const markRead = (id: string) => {
    setRead((current) => current.includes(id) ? current : [...current, id]);
    setSaved(true);
  };
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Centre de notifications', 'مركز الإشعارات')} description={copy(lang, 'Rassembler les événements utiles à l’opérateur, avec une origine et un état de lecture explicites.', 'اجمع الأحداث المفيدة للمنفذ مع مصدر وحالة قراءة واضحة.')} action={<StatusBadge label={copy(lang, `${events.filter((event) => event.unread && !read.includes(event.id)).length} non lues`, `${events.filter((event) => event.unread && !read.includes(event.id)).length} غير مقروءة`)} tone="warn" icon={Bell} />} />
    <section className="border hairline bg-[hsl(var(--card))]"><div className="flex flex-wrap items-center justify-between gap-3 border-b hairline p-5"><div><p className="eyebrow">{copy(lang, 'Inbox opérateur', 'صندوق المنفذ')}</p><h2 className="display mt-1 text-3xl uppercase">{copy(lang, 'À regarder', 'للمراجعة')}</h2></div><div className="flex gap-2"><button type="button" onClick={() => setFilter('all')} className={`focus-ring border px-3 py-2 text-xs font-bold ${filter === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Toutes', 'الكل')}</button><button type="button" onClick={() => setFilter('unread')} className={`focus-ring border px-3 py-2 text-xs font-bold ${filter === 'unread' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'Non lues', 'غير مقروءة')}</button></div></div><div className="divide-y hairline">{visible.map((event) => <button type="button" key={event.id} onClick={() => { markRead(event.id); setSelected(event); }} className="focus-ring flex w-full items-start gap-4 p-5 text-start"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${event.unread && !read.includes(event.id) ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted-foreground)/.35)]'}`} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><b className="text-sm">{event.title}</b><small className="mono text-[10px] text-[hsl(var(--muted-foreground))]">LOCAL</small></span><span className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{event.detail}</span></span><ArrowRight size={15} className="mt-1 shrink-0 text-[hsl(var(--primary))]" /></button>)}{!visible.length && <div className="px-5 py-14 text-center"><Bell className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 text-sm font-bold">{copy(lang, 'Aucune notification dans cette vue.', 'لا توجد إشعارات في هذا العرض.')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Les événements de fournisseur restent à connecter.', 'أحداث المزود بانتظار الربط.')}</p></div>}</div></section>
    {saved && <div className="mt-5"><Boundary tone="success">{copy(lang, 'Notification marquée comme lue localement.', 'تم تعليم الإشعار كمقروء محلياً.')}</Boundary></div>}
    <ModuleStateRail lang={lang} saved={saved} onRetry={() => { setError(false); setLoading(true); window.setTimeout(() => setLoading(false), 240); }} onSuccess={() => setSaved(true)} />
    <Boundary tone="warn">{copy(lang, 'Les événements sont des fixtures locales. Aucun email, SMS, push ou événement fournisseur n’est envoyé.', 'الأحداث محلية. لا يتم إرسال بريد أو SMS أو إشعار أو حدث مزود.')}</Boundary>
    {selected && <PreviewDialog lang={lang} title={selected.title} description={copy(lang, 'Détail local de l’événement sélectionné.', 'تفاصيل محلية للحدث المحدد.')} close={() => setSelected(null)} onConfirm={() => setSelected(null)} confirmLabel={copy(lang, 'Fermer', 'إغلاق')}><Spec label={copy(lang, 'Détail', 'التفاصيل')} value={selected.detail} /><div className="mt-4"><StatusBadge label={copy(lang, 'Lu localement', 'تمت قراءته محلياً')} tone="good" icon={Check} /></div></PreviewDialog>}
  </>;
}

function ProfessionalAudit({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<{ id: string; actor: string; action: string; entity: string; time: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const rows = [
    { id: 'AUD-081', actor: 'Session locale', action: 'Prévisualisation produit', entity: 'whey-01', time: 'Aujourd’hui · 10:42' },
    { id: 'AUD-080', actor: 'Session locale', action: 'Lecture commande', entity: 'PN-1048', time: 'Aujourd’hui · 10:18' },
    { id: 'AUD-079', actor: 'Fixture système', action: 'Signal stock', entity: 'pre-03', time: 'Hier · 17:06' },
  ];
  const visible = rows.filter((row) => `${row.id} ${row.actor} ${row.action} ${row.entity}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Journal d’audit', 'سجل التدقيق')} description={copy(lang, 'Rendre chaque lecture et prévisualisation traçable sans prétendre à un journal immuable avant le serveur.', 'اجعل كل قراءة ومعاينة قابلة للتتبع دون الادعاء بوجود سجل غير قابل للتغيير قبل الخادم.')} action={<StatusBadge label={copy(lang, 'Lecture seule', 'قراءة فقط')} tone="info" icon={FileText} />} />
    <section className="border hairline bg-[hsl(var(--card))] p-4 sm:p-5"><div className="flex items-center gap-2 border hairline bg-[hsl(var(--background))] px-3 py-3"><Search size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">{copy(lang, 'Filtrer le journal', 'تصفية السجل')}</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Acteur, action ou entité…', 'المنفذ أو الإجراء أو الكيان…')} /></div>{visible.length ? <><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[820px] text-start text-xs"><thead className="bg-[hsl(var(--muted)/.55)] text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><tr><th className="px-4 py-3 text-start">{copy(lang, 'Heure', 'الوقت')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Acteur', 'المنفذ')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Action', 'الإجراء')}</th><th className="px-4 py-3 text-start">{copy(lang, 'Entité', 'الكيان')}</th><th className="px-4 py-3 text-end">{copy(lang, 'Détail', 'التفاصيل')}</th></tr></thead><tbody>{visible.map((row) => <tr className="border-t hairline" key={row.id}><td className="px-4 py-4 text-[hsl(var(--muted-foreground))]"><span className="date-value">{orderDate(lang, row.time)}</span></td><td className="px-4 py-4">{row.actor}</td><td className="px-4 py-4 font-bold">{row.action}</td><td className="px-4 py-4 mono">{row.entity}</td><td className="px-4 py-4 text-end"><button type="button" onClick={() => setSelected(row)} className="focus-ring text-xs font-bold text-[hsl(var(--primary))]">{copy(lang, 'Voir', 'عرض')}</button></td></tr>)}</tbody></table></div><div className="divide-y hairline md:hidden">{visible.map((row) => <button type="button" key={row.id} onClick={() => setSelected(row)} className="focus-ring block w-full py-4 text-start"><div className="flex items-start justify-between gap-3"><span className="mono text-xs font-bold">{row.id}</span><span className="date-value text-[10px] text-[hsl(var(--muted-foreground))]">{orderDate(lang, row.time)}</span></div><p className="mt-2 text-sm font-bold">{row.action}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{row.actor} · {row.entity}</p></button>)}</div></> : <div className="py-14 text-center"><FileText className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 text-sm font-bold">{copy(lang, 'Aucun événement trouvé.', 'لم يتم العثور على أحداث.')}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Le journal local ne contient pas cette recherche.', 'لا يحتوي السجل المحلي على هذا البحث.')}</p></div>}</section>
    {saved && <div className="mt-5"><Boundary tone="success">{copy(lang, 'Événement lu dans la session locale.', 'تمت قراءة الحدث في الجلسة المحلية.')}</Boundary></div>}
    <ModuleStateRail lang={lang} saved={saved} onRetry={() => setSaved(false)} onSuccess={() => setSaved(true)} />
    <Boundary tone="warn">{copy(lang, 'Un audit immuable, signé et filtrable par rôle sera server-owned. Cette vue reste un aperçu de contrat.', 'التدقيق غير القابل للتغيير والموقع والقابل للتصفية حسب الدور سيكون من اختصاص الخادم. هذه معاينة للعقد فقط.')}</Boundary>
    {selected && <PreviewDialog lang={lang} title={selected.id} description={copy(lang, 'Lecture d’un événement local sans possibilité de le modifier.', 'قراءة حدث محلي دون إمكانية تعديله.')} close={() => setSelected(null)} onConfirm={() => setSelected(null)} confirmLabel={copy(lang, 'Fermer', 'إغلاق')}><div className="grid gap-3 sm:grid-cols-2"><Spec label={copy(lang, 'Acteur', 'المنفذ')} value={selected.actor} /><Spec label={copy(lang, 'Action', 'الإجراء')} value={selected.action} /><Spec label={copy(lang, 'Entité', 'الكيان')} value={selected.entity} mono /><Spec label={copy(lang, 'Heure', 'الوقت')} value={orderDate(lang, selected.time)} /></div></PreviewDialog>}
  </>;
}

function ProfessionalSettings({ lang }: { lang: Lang }) {
  const [section, setSection] = useState('identity');
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ primary: '', state: 'draft', note: '' });
  const sections = [
    ['identity', 'Identité marchand', 'هوية التاجر'],
    ['delivery', 'Livraison', 'التوصيل'],
    ['notifications', 'Notifications', 'الإشعارات'],
    ['security', 'Sécurité & sessions', 'الأمان والجلسات'],
  ];
  const labels: Record<string, [string, string, string]> = {
    identity: ['Identité du workspace', 'هوية مساحة العمل', 'Nom affiché, contact et liens de politique à confirmer.'],
    delivery: ['Règles de livraison', 'قواعد التوصيل', 'Zones, tarifs, délais et points relais restent à fournir.'],
    notifications: ['Préférences de notifications', 'تفضيلات الإشعارات', 'Les canaux et événements seront connectés plus tard.'],
    security: ['Sécurité & sessions', 'الأمان والجلسات', 'La session, les rôles et l’expiration seront server-owned.'],
  };
  const [titleFr, titleAr, descriptionFr] = labels[section];
  const updateDraft = (key: keyof typeof draft) => (value: string) => {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: value }));
  };
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Paramètres', 'الإعدادات')} description={copy(lang, 'Rassembler les décisions merchant-owned dans une surface lisible, sans donner l’impression qu’elles sont déjà sauvegardées.', 'اجمع قرارات التاجر في مساحة واضحة دون الإيحاء بأنها محفوظة فعلياً.')} action={saved ? <StatusBadge label={copy(lang, 'Aperçu enregistré', 'تم حفظ المعاينة')} tone="good" icon={CheckCircle2} /> : <button type="button" onClick={() => setSaved(true)} className="focus-ring bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white">{copy(lang, 'Prévisualiser les changements', 'معاينة التغييرات')}</button>} />
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]"><nav className="border hairline bg-[hsl(var(--card))] p-2" aria-label={copy(lang, 'Sections des paramètres', 'أقسام الإعدادات')}>{sections.map(([key, fr, ar]) => <button type="button" key={key} onClick={() => { setSection(key); setSaved(false); }} className={`focus-ring flex w-full items-start gap-3 px-3 py-3 text-start text-xs font-bold ${section === key ? 'bg-[hsl(var(--secondary))] text-white' : 'hover:bg-[hsl(var(--muted)/.6)]'}`}><SlidersHorizontal size={15} className="mt-0.5 shrink-0" />{copy(lang, fr, ar)}</button>)}</nav><section className="border hairline bg-[hsl(var(--card))] p-5 sm:p-7"><p className="eyebrow">{copy(lang, 'Section merchant-owned', 'قسم من اختصاص التاجر')}</p><h2 className="display mt-2 text-3xl uppercase">{copy(lang, titleFr, titleAr)}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy(lang, descriptionFr, section === 'identity' ? 'الاسم الظاهر ووسائل الاتصال وروابط السياسات تحتاج إلى تأكيد.' : section === 'delivery' ? 'المناطق والتعرفة والمدة ونقاط الاستلام بانتظار البيانات.' : section === 'notifications' ? 'سيتم ربط القنوات والأحداث لاحقاً.' : 'الجلسة والأدوار وانتهاء الصلاحية ستكون من اختصاص الخادم.')}</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><InputField label={copy(lang, section === 'identity' ? 'Nom affiché' : section === 'delivery' ? 'Zone / wilaya' : section === 'notifications' ? 'Canal principal' : 'Durée de session', section === 'identity' ? 'الاسم الظاهر' : section === 'delivery' ? 'المنطقة / الولاية' : section === 'notifications' ? 'القناة الرئيسية' : 'مدة الجلسة')} value={draft.primary} onChange={updateDraft('primary')} placeholder={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} /><SelectField label={copy(lang, 'État de la configuration', 'حالة الإعداد')} value={draft.state} onChange={updateDraft('state')} options={[['draft', copy(lang, 'Brouillon local', 'مسودة محلية')], ['pending', copy(lang, 'À valider', 'بانتظار الاعتماد')]]} /><div className="sm:col-span-2"><InputField label={copy(lang, 'Note de changement', 'ملاحظة التغيير')} value={draft.note} onChange={updateDraft('note')} placeholder={copy(lang, 'Pourquoi cette valeur doit-elle changer ?', 'لماذا يجب تغيير هذه القيمة؟')} /></div></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><Spec label={copy(lang, 'État', 'الحالة')} value={draft.state === 'pending' ? copy(lang, 'À valider', 'بانتظار الاعتماد') : copy(lang, 'Brouillon local', 'مسودة محلية')} /><Spec label={copy(lang, 'Dernière modification', 'آخر تعديل')} value={draft.note || copy(lang, 'Non disponible', 'غير متوفر')} /><Spec label={copy(lang, 'Approbateur', 'المعتمد')} value={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} /></div></section></div>
    <ModuleStateRail lang={lang} saved={saved} onRetry={() => setSaved(false)} onSuccess={() => setSaved(true)} />
    <Boundary tone="warn">{copy(lang, 'Aucune préférence, politique, tarif ou session ne sera persisté depuis cette maquette.', 'لن يتم حفظ أي تفضيل أو سياسة أو تعرفة أو جلسة من هذا النموذج.')}</Boundary>
  </>;
}

function ProfessionalGeneric({ lang, kind }: { lang: Lang; kind: OpsKind }) {
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState('');
  const [dialog, setDialog] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const labels: Partial<Record<OpsKind, [string, string]>> = {
    dashboard: ['Vue d’ensemble', 'نظرة عامة'], orders: ['Commandes opérationnelles', 'الطلبات التشغيلية'], customers: ['Fiches clients', 'بطاقات العملاء'], products: ['Fiches produits', 'بطاقات المنتجات'],
    categories: ['Catégories & marques', 'الفئات والعلامات'], batches: ['Lots & expiration', 'الدفعات والانتهاء'], delivery: ['Livraison & expéditions', 'التوصيل والشحنات'],
    returns: ['Retours', 'الإرجاع'], exchanges: ['Échanges', 'الاستبدال'], refunds: ['Remboursements', 'المبالغ المستردة'], coupons: ['Coupons', 'القسائم'],
    reviews: ['Avis / modération', 'الآراء / المراجعة'], notifications: ['Notifications', 'الإشعارات'], audit: ['Audit', 'التدقيق'], settings: ['Paramètres', 'الإعدادات'],
  };
  const [titleFr, titleAr] = labels[kind] ?? ['Module opérationnel', 'وحدة تشغيلية'];
  const fields: Partial<Record<OpsKind, Array<[string, string]>>> = {
    orders: [['Référence commande', 'PN-1048'], ['Client', 'Nom ou téléphone'], ['Statut', 'À confirmer'], ['Motif / note', 'Ajouter une note opérateur']],
    customers: [['Nom complet', 'Nom du client'], ['Téléphone', '+213 …'], ['Adresse / wilaya', 'Oran / commune'], ['Note opérationnelle', 'Optionnel']],
    products: [['Nom produit', 'Nom à confirmer'], ['SKU / barcode', 'Référence marchand'], ['Prix / disponibilité', 'À fournir'], ['Visibilité', 'Publié ou brouillon']],
    categories: [['Nom de catégorie', 'Nom à confirmer'], ['Type / marque', 'Catégorie ou marque'], ['Ordre d’affichage', '0'], ['Visibilité', 'Visible ou masquée']],
    batches: [['Produit / lot', 'Produit et numéro de lot'], ['Expiration', 'AAAA-MM-JJ'], ['Quantité', '0'], ['Disposition', 'À contrôler']],
    delivery: [['Commande / expédition', 'Référence'], ['Destinataire', 'Nom et téléphone'], ['Transporteur', 'À confirmer'], ['Exception / prochaine étape', 'Décrire la situation']],
    returns: [['Commande / article', 'Référence et article'], ['Motif', 'Motif à confirmer'], ['État reçu', 'Non inspecté'], ['Décision', 'En attente de revue']],
    exchanges: [['Commande / article', 'Référence et article'], ['Variant demandé', 'Format à confirmer'], ['Différence de prix', 'À calculer'], ['Décision', 'En attente de revue']],
    refunds: [['Demande / commande', 'Référence'], ['Montant', 'À confirmer'], ['Méthode', 'À définir'], ['Motif / approbateur', 'Trace requise']],
    coupons: [['Code', 'CODE-À-CONFIRMER'], ['Règle / remise', 'Condition à fournir'], ['Validité', 'Dates à fournir'], ['Limite d’usage', 'À confirmer']],
    reviews: [['Commande / produit', 'Référence'], ['Statut', 'En attente'], ['Motif de décision', 'Obligatoire si rejet'], ['Modérateur', 'Session locale']],
    notifications: [['Événement', 'Type d’événement'], ['Destinataire', 'Client ou opérateur'], ['Canal', 'À connecter'], ['État', 'Non lu / lu']],
    audit: [['Acteur', 'Utilisateur ou système'], ['Action', 'Action effectuée'], ['Entité', 'Référence'], ['Période', 'Date ou intervalle']],
    settings: [['Section', 'Identité, livraison ou sécurité'], ['Valeur', 'Valeur à confirmer'], ['État', 'Brouillon'], ['Raison du changement', 'Trace requise']],
  };
  const moduleFields = fields[kind] ?? [['Référence', 'À confirmer'], ['Statut', 'En attente'], ['Responsable', 'Session locale'], ['Note', 'Optionnel']];
  const rows = kind === 'orders' ? [['PN-1048', 'Nadia B.', 'À confirmer', '14 300 DA'], ['PN-1047', 'Yanis K.', 'En préparation', '8 900 DA'], ['PN-1046', 'Amel S.', 'Échec livraison', '5 400 DA']] : kind === 'customers' ? [['Nadia B.', 'Oran · +213 …', '2 commandes', 'À vérifier'], ['Yanis K.', 'Alger · +213 …', '1 commande', 'Actif']] : [['LOCAL-01', 'Détail à confirmer', 'Action locale', 'En attente'], ['LOCAL-02', 'Fixture visible', 'Données futures', 'Non connecté']];
  const visibleRows = filter ? rows.filter((row) => row.join(' ').toLowerCase().includes(filter.toLowerCase())) : rows;
  return <><OpsHeader lang={lang} title={copy(lang, titleFr, titleAr)} description={copy(lang, 'Vue locale avec recherche, état, champs métier et frontière serveur explicite.', 'عرض محلي مع بحث وحالة وحقول العمل وحدود خادم واضحة.')} action={<button type="button" onClick={() => { setSaved(false); setDraft({}); setDialog(true); }} className="focus-ring bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} className="me-1 inline" />{copy(lang, 'Nouvelle action', 'إجراء جديد')}</button>} /><div className="flex flex-col gap-3 sm:flex-row"><label className="flex flex-1 items-center gap-2 border hairline bg-[hsl(var(--card))] px-3 py-3"><Search size={16} /><span className="sr-only">{copy(lang, 'Rechercher', 'بحث')}</span><input value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Rechercher dans la vue…', 'ابحث في العرض…')} /></label><StatusBadge label={copy(lang, 'Fixture local', 'بيانات محلية')} tone="warn" icon={Info} /></div><div className="mt-5"><OpsTable columns={[copy(lang, 'Référence', 'المرجع'), copy(lang, 'Détail', 'التفاصيل'), copy(lang, 'Suite', 'الخطوة التالية'), copy(lang, 'État', 'الحالة')]} rows={visibleRows.map((row) => row.map((cell) => copy(lang, cell, cell === 'En attente' ? 'قيد الانتظار' : cell === 'Actif' ? 'نشط' : cell === 'Action locale' ? 'إجراء محلي' : cell)))} /></div><div className="mt-5 border hairline bg-[hsl(var(--card))] p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">{copy(lang, 'Contrat de la fiche', 'حقول هذه الوحدة')}</p><h2 className="display mt-1 text-2xl uppercase">{copy(lang, 'Champs à confirmer', 'الحقول التي تحتاج اعتماداً')}</h2></div><StatusBadge label={copy(lang, 'Merchant-owned', 'من اختصاص التاجر')} tone="warn" icon={Info} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{moduleFields.map(([label, placeholder]) => <div key={label} className="border hairline bg-[hsl(var(--muted)/.25)] p-3"><p className="eyebrow">{fieldLabel(lang, label)}</p><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{placeholder}</p></div>)}</div></div><div className="mt-7 grid gap-5 md:grid-cols-3"><div className="border hairline bg-[hsl(var(--card))] p-5"><p className="eyebrow">{copy(lang, 'Loading', 'التحميل')}</p><div className="skeleton mt-4 h-3 w-3/4" /><div className="skeleton mt-2 h-3 w-1/2" /></div><div className="border hairline bg-[hsl(var(--card))] p-5"><p className="eyebrow">{copy(lang, 'Error / retry', 'خطأ / إعادة')}</p><button type="button" onClick={() => setSaved(true)} className="focus-ring mt-4 text-xs font-bold underline">{copy(lang, 'Réessayer localement', 'إعادة المحاولة محلياً')}</button></div><div className="border hairline bg-[hsl(var(--card))] p-5"><p className="eyebrow">{copy(lang, 'Success', 'نجاح')}</p>{saved ? <StatusBadge label={copy(lang, 'Prévisualisé', 'تمت المعاينة')} tone="good" icon={CheckCircle2} /> : <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">{copy(lang, 'Aucune action soumise', 'لم يتم إرسال إجراء')}</p>}</div></div><Boundary tone="warn">{copy(lang, 'Les transitions, filtres et actions restent locales jusqu’à la connexion du service autoritaire.', 'تبقى الانتقالات والمرشحات والإجراءات محلية حتى ربط الخدمة المعتمدة.')}</Boundary>{dialog && <PreviewDialog lang={lang} title={copy(lang, titleFr, titleAr)} description={copy(lang, 'Complétez les champs visibles avant toute future soumission serveur.', 'أكمل الحقول الظاهرة قبل أي إرسال مستقبلي إلى الخادم.')} close={() => setDialog(false)} onConfirm={() => { setDialog(false); setSaved(true); }} confirmLabel={copy(lang, 'Prévisualiser l’action', 'معاينة الإجراء')}><div className="grid gap-4 sm:grid-cols-2">{moduleFields.map(([label, placeholder], index) => <InputField key={label} label={fieldLabel(lang, label)} value={draft[label] ?? ''} onChange={(value) => setDraft((current) => ({ ...current, [label]: value }))} placeholder={placeholder} required={index < 2} />)}</div></PreviewDialog>}</>;
}

function ProfessionalMovements({ lang }: { lang: Lang }) {
  const [filter, setFilter] = useState('all');
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ product: '', type: 'adjustment', quantity: '', source: '', reason: '' });
  const movements = [
    ['MOV-104', 'Aujourd’hui · 10:42', 'Pre-workout', 'Ajustement', '+2', '5', 'Amine M.'],
    ['MOV-103', 'Aujourd’hui · 09:18', 'Whey isolate', 'Réception', '+12', '14', 'Sara K.'],
    ['MOV-102', 'Hier · 16:05', 'Daily essentials', 'Dommage', '-1', '0', 'Amine M.'],
    ['MOV-101', 'Hier · 11:30', 'Creatine', 'Réservation', '-2', '8', 'Système'],
  ];
  const visible = filter === 'all' ? movements : movements.filter((row) => row[3].toLowerCase().includes(filter));
  const update = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  return <>
    <OpsHeader
      lang={lang}
      title={copy(lang, 'Journal des mouvements', 'سجل حركات المخزون')}
      description={copy(lang, 'Un historique séparé du niveau de stock : chaque entrée montre la source, le changement, le solde après mouvement et l’opérateur.', 'سجل مستقل عن مستوى المخزون: كل حركة توضح المصدر والتغيير والرصيد بعد الحركة والمنفذ.')}
      action={<button type="button" onClick={() => setSaved(false)} className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />{copy(lang, 'Nouveau mouvement', 'حركة جديدة')}</button>}
    />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label={copy(lang, 'Aujourd’hui', 'اليوم')} value="04" note={copy(lang, 'mouvements locaux', 'حركات محلية')} tone="info" />
      <Metric label={copy(lang, 'Réceptions', 'الاستلامات')} value="01" note={copy(lang, 'entrée stock', 'إدخال للمخزون')} tone="good" />
      <Metric label={copy(lang, 'Ajustements', 'التعديلات')} value="02" note={copy(lang, 'à justifier', 'تحتاج سبباً')} tone="warn" />
      <Metric label={copy(lang, 'Dommages', 'التالف')} value="01" note={copy(lang, 'à traiter', 'تحتاج معالجة')} tone="warn" />
    </div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2 border hairline bg-[hsl(var(--background))] px-3 py-3">
          <Search size={16} className="text-[hsl(var(--muted-foreground))]" />
          <span className="sr-only">{copy(lang, 'Rechercher un mouvement', 'البحث عن حركة')}</span>
          <input className="w-full bg-transparent text-sm outline-none" placeholder={copy(lang, 'Référence, produit ou opérateur…', 'المرجع أو المنتج أو المنفذ…')} />
        </label>
        <div className="flex gap-2 overflow-x-auto">
          {[
            ['all', copy(lang, 'Tout', 'الكل')],
            ['réception', copy(lang, 'Réceptions', 'استلام')],
            ['ajustement', copy(lang, 'Ajustements', 'تعديلات')],
            ['dommage', copy(lang, 'Dommages', 'تالف')],
          ].map(([value, label]) => <button type="button" key={value} onClick={() => setFilter(value)} className={`focus-ring whitespace-nowrap border px-3 py-2 text-xs font-bold ${filter === value ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{label}</button>)}
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <OpsTable columns={[copy(lang, 'Référence', 'المرجع'), copy(lang, 'Date', 'التاريخ'), copy(lang, 'Produit', 'المنتج'), copy(lang, 'Type', 'النوع'), copy(lang, 'Variation', 'التغيير'), copy(lang, 'Après', 'بعد الحركة'), copy(lang, 'Opérateur', 'المنفذ')]} rows={visible.map((row) => row.map((cell, index) => index === 3 ? copy(lang, cell, cell === 'Réception' ? 'استلام' : cell === 'Ajustement' ? 'تعديل' : cell === 'Dommage' ? 'تالف' : 'حجز') : cell))} />
      </div>
    </section>
    <div className="mt-7">
      <FormPanel lang={lang} title={copy(lang, 'Créer un mouvement contrôlé', 'إنشاء حركة مراقبة')} submitLabel={saved ? copy(lang, 'Aperçu enregistré', 'تم حفظ المعاينة') : copy(lang, 'Prévisualiser le mouvement', 'معاينة الحركة')} onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
        <InputField label={copy(lang, 'Produit', 'المنتج')} value={draft.product} onChange={update('product')} placeholder={copy(lang, 'Choisir une référence', 'اختر مرجعاً')} required />
        <SelectField label={copy(lang, 'Type de mouvement', 'نوع الحركة')} value={draft.type} onChange={update('type')} options={[['adjustment', copy(lang, 'Ajustement', 'تعديل')], ['receipt', copy(lang, 'Réception', 'استلام')], ['damage', copy(lang, 'Dommage', 'تالف')], ['reservation', copy(lang, 'Réservation', 'حجز')]]} />
        <InputField label={copy(lang, 'Quantité', 'الكمية')} value={draft.quantity} onChange={update('quantity')} placeholder="0" type="number" required />
        <InputField label={copy(lang, 'Source / document', 'المصدر / الوثيقة')} value={draft.source} onChange={update('source')} placeholder="PO-LOCAL-08" required />
        <div className="sm:col-span-2"><InputField label={copy(lang, 'Motif obligatoire', 'السبب الإجباري')} value={draft.reason} onChange={update('reason')} placeholder={copy(lang, 'Pourquoi ce mouvement ?', 'لماذا حدثت هذه الحركة؟')} required /></div>
      </FormPanel>
    </div>
  </>;
}

function ProfessionalPurchasing({ lang }: { lang: Lang }) {
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ supplier: '', reference: '', expected: '', product: '', quantity: '', cost: '' });
  const orders = [
    ['PO-LOCAL-08', 'Fournisseur à confirmer', '2 références', '18 unités', 'À approuver'],
    ['PO-LOCAL-07', 'Source locale', '1 référence', '8 unités', 'En préparation'],
    ['PO-LOCAL-06', 'À fournir', '3 références', '24 unités', 'Brouillon'],
  ];
  const update = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Achats fournisseurs', 'مشتريات الموردين')} description={copy(lang, 'Préparer les commandes fournisseurs séparément de la réception : fournisseur, lignes, coût, approbation et date attendue.', 'تحضير أوامر الموردين بشكل مستقل عن الاستلام: المورد والأسطر والتكلفة والاعتماد والتاريخ المتوقع.')} action={<button type="button" onClick={() => setSaved(false)} className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />{copy(lang, 'Nouvel achat', 'شراء جديد')}</button>} />
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric label={copy(lang, 'À approuver', 'بانتظار الاعتماد')} value="01" note={copy(lang, 'commande fournisseur', 'أمر مورد')} tone="warn" />
      <Metric label={copy(lang, 'En préparation', 'قيد التحضير')} value="01" note={copy(lang, 'réception future', 'استلام لاحق')} tone="info" />
      <Metric label={copy(lang, 'Fournisseurs', 'الموردون')} value="02" note={copy(lang, 'à confirmer', 'بانتظار التأكيد')} tone="good" />
    </div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b hairline pb-4"><div><p className="eyebrow">{copy(lang, 'Bons fournisseurs', 'أوامر الموردين')}</p><h2 className="display mt-1 text-2xl uppercase">{copy(lang, 'À suivre', 'للمتابعة')}</h2></div><StatusBadge label={copy(lang, 'Lecture locale', 'قراءة محلية')} tone="info" icon={FileText} /></div>
      <div className="mt-5 overflow-x-auto"><OpsTable columns={[copy(lang, 'Bon', 'الأمر'), copy(lang, 'Fournisseur', 'المورد'), copy(lang, 'Lignes', 'الأسطر'), copy(lang, 'Quantité', 'الكمية'), copy(lang, 'État', 'الحالة')]} rows={orders.map((row) => row.map((cell, index) => index === 4 ? copy(lang, cell, cell === 'À approuver' ? 'بانتظار الاعتماد' : cell === 'En préparation' ? 'قيد التحضير' : 'مسودة') : cell))} /></div>
    </section>
    <div className="mt-7"><FormPanel lang={lang} title={copy(lang, 'Préparer un bon fournisseur', 'تحضير أمر مورد')} submitLabel={saved ? copy(lang, 'Aperçu enregistré', 'تم حفظ المعاينة') : copy(lang, 'Prévisualiser le bon', 'معاينة الأمر')} onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
      <InputField label={copy(lang, 'Fournisseur', 'المورد')} value={draft.supplier} onChange={update('supplier')} placeholder={copy(lang, 'À confirmer', 'يحتاج إلى تأكيد')} required />
      <InputField label={copy(lang, 'Référence du bon', 'مرجع الأمر')} value={draft.reference} onChange={update('reference')} placeholder="PO-LOCAL-09" required />
      <InputField label={copy(lang, 'Date attendue', 'التاريخ المتوقع')} value={draft.expected} onChange={update('expected')} placeholder="2026-09-26" type="date" required />
      <InputField label={copy(lang, 'Produit', 'المنتج')} value={draft.product} onChange={update('product')} placeholder={copy(lang, 'Référence catalogue', 'مرجع الكتالوج')} required />
      <InputField label={copy(lang, 'Quantité', 'الكمية')} value={draft.quantity} onChange={update('quantity')} placeholder="0" type="number" required />
      <InputField label={copy(lang, 'Coût unitaire', 'تكلفة الوحدة')} value={draft.cost} onChange={update('cost')} placeholder={copy(lang, 'À fournir', 'بانتظار البيانات')} type="number" />
    </FormPanel></div>
  </>;
}

function ProfessionalExpenses({ lang }: { lang: Lang }) {
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({ vendor: '', category: 'Logistique', amount: '', date: '', note: '' });
  const expenses = [
    ['EXP-001', 'Livraison', 'Transporteur à confirmer', '—', 'À saisir'],
    ['EXP-002', 'Emballage', 'Fournisseur local', '—', 'À approuver'],
    ['EXP-003', 'Outils', 'Source locale', '—', 'Brouillon'],
  ];
  const update = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Registre des dépenses', 'سجل المصروفات')} description={copy(lang, 'Une vue dédiée aux charges : fournisseur, catégorie, justificatif, montant et approbation. Aucun coût ne sera inventé.', 'واجهة مخصصة للمصروفات: المورد والفئة والإثبات والمبلغ والاعتماد. لن يتم اختلاق أي تكلفة.')} action={<button type="button" onClick={() => setSaved(false)} className="focus-ring flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white"><Plus size={14} />{copy(lang, 'Nouvelle dépense', 'مصروف جديد')}</button>} />
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric label={copy(lang, 'Ce mois', 'هذا الشهر')} value="—" note={copy(lang, 'montant à fournir', 'المبلغ بانتظار البيانات')} tone="warn" />
      <Metric label={copy(lang, 'À approuver', 'بانتظار الاعتماد')} value="02" note={copy(lang, 'lignes locales', 'أسطر محلية')} tone="info" />
      <Metric label={copy(lang, 'Justificatifs', 'الإثباتات')} value="—" note={copy(lang, 'non connectés', 'غير مرتبطة')} tone="warn" />
    </div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b hairline pb-4"><div><p className="eyebrow">{copy(lang, 'Charges opérationnelles', 'المصاريف التشغيلية')}</p><h2 className="display mt-1 text-2xl uppercase">{copy(lang, 'Registre à compléter', 'سجل يحتاج إلى إكمال')}</h2></div><StatusBadge label={copy(lang, 'Montants non fournis', 'المبالغ غير مقدمة')} tone="warn" icon={Receipt} /></div>
      <div className="mt-5 overflow-x-auto"><OpsTable columns={[copy(lang, 'Référence', 'المرجع'), copy(lang, 'Catégorie', 'الفئة'), copy(lang, 'Fournisseur', 'المورد'), copy(lang, 'Montant', 'المبلغ'), copy(lang, 'État', 'الحالة')]} rows={expenses.map((row) => row.map((cell, index) => index === 4 ? copy(lang, cell, cell === 'À saisir' ? 'بانتظار الإدخال' : cell === 'À approuver' ? 'بانتظار الاعتماد' : 'مسودة') : cell))} /></div>
    </section>
    <div className="mt-7"><FormPanel lang={lang} title={copy(lang, 'Ajouter une dépense', 'إضافة مصروف')} submitLabel={saved ? copy(lang, 'Aperçu enregistré', 'تم حفظ المعاينة') : copy(lang, 'Prévisualiser la dépense', 'معاينة المصروف')} onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
      <InputField label={copy(lang, 'Fournisseur', 'المورد')} value={draft.vendor} onChange={update('vendor')} placeholder={copy(lang, 'Nom du fournisseur', 'اسم المورد')} required />
      <SelectField label={copy(lang, 'Catégorie', 'الفئة')} value={draft.category} onChange={update('category')} options={[['Logistique', copy(lang, 'Logistique', 'اللوجستيك')], ['Packaging', copy(lang, 'Emballage', 'التغليف')], ['Tools', copy(lang, 'Outils', 'الأدوات')], ['Other', copy(lang, 'Autre', 'أخرى')]]} />
      <InputField label={copy(lang, 'Montant', 'المبلغ')} value={draft.amount} onChange={update('amount')} placeholder={copy(lang, 'À fournir', 'بانتظار البيانات')} type="number" required />
      <InputField label={copy(lang, 'Date', 'التاريخ')} value={draft.date} onChange={update('date')} placeholder="2026-09-19" type="date" required />
      <div className="sm:col-span-2"><InputField label={copy(lang, 'Note / justificatif', 'ملاحظة / إثبات')} value={draft.note} onChange={update('note')} placeholder={copy(lang, 'Référence du document', 'مرجع الوثيقة')} /></div>
    </FormPanel></div>
  </>;
}

function ProfessionalProfitability({ lang }: { lang: Lang }) {
  const rows = [
    ['Whey isolate', 'Boutique', '14 300 DA', '—', '—', 'COGS à fournir'],
    ['Creatine', 'Boutique', '8 900 DA', '—', '—', 'COGS à fournir'],
    ['Pre-workout', 'COD', '5 400 DA', '—', '—', 'COGS à fournir'],
  ];
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Rentabilité par référence', 'الربحية حسب المرجع')} description={copy(lang, 'Comparer ventes, coût et marge uniquement lorsque les données COGS sont validées. Les valeurs manquantes restent visibles.', 'مقارنة المبيعات والتكلفة والهامش فقط بعد اعتماد تكلفة البضاعة. تبقى القيم الناقصة ظاهرة.')} action={<StatusBadge label={copy(lang, 'COGS requis', 'تكلفة البضاعة مطلوبة')} tone="warn" icon={Info} />} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label={copy(lang, 'Ventes affichées', 'المبيعات المعروضة')} value="28 600 DA" note={copy(lang, 'commandes locales', 'طلبات محلية')} tone="info" />
      <Metric label={copy(lang, 'COGS', 'تكلفة البضاعة')} value="—" note={copy(lang, 'à fournir', 'بانتظار البيانات')} tone="warn" />
      <Metric label={copy(lang, 'Marge', 'الهامش')} value="—" note={copy(lang, 'non calculée', 'غير محسوب')} tone="warn" />
      <Metric label={copy(lang, 'Couverture', 'التغطية')} value="0%" note={copy(lang, 'coût non connecté', 'التكلفة غير مرتبطة')} tone="warn" />
    </div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b hairline pb-4"><div><p className="eyebrow">{copy(lang, 'Lecture transparente', 'قراءة شفافة')}</p><h2 className="display mt-1 text-2xl uppercase">{copy(lang, 'Marge à confirmer', 'الهامش يحتاج إلى تأكيد')}</h2></div><select className="plazza-field focus-ring text-xs"><option>{copy(lang, '7 jours', '٧ أيام')}</option><option>{copy(lang, '30 jours', '٣٠ يوماً')}</option></select></div>
      <div className="mt-5 overflow-x-auto"><OpsTable columns={[copy(lang, 'Produit', 'المنتج'), copy(lang, 'Canal', 'القناة'), copy(lang, 'Ventes', 'المبيعات'), copy(lang, 'COGS', 'التكلفة'), copy(lang, 'Marge', 'الهامش'), copy(lang, 'État', 'الحالة')]} rows={rows.map((row) => row.map((cell, index) => index === 5 ? copy(lang, cell, 'التكلفة بانتظار الاعتماد') : cell))} /></div>
      <Boundary tone="warn">{copy(lang, 'Aucune marge, commission, coût transport ou bénéfice ne sera déduit sans règle marchand validée.', 'لن يتم اشتقاق أي هامش أو عمولة أو تكلفة توصيل أو ربح دون قاعدة تاجر معتمدة.')}</Boundary>
    </section>
  </>;
}

function ProfessionalReports({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState('sales');
  const [saved, setSaved] = useState(false);
  const reports = [
    ['sales', copy(lang, 'Ventes et commandes', 'المبيعات والطلبات'), copy(lang, 'Lire le volume par période, statut et canal.', 'قراءة الحجم حسب الفترة والحالة والقناة.'), 'CSV / PDF'],
    ['stock', copy(lang, 'Disponibilité stock', 'توفر المخزون'), copy(lang, 'Suivre disponible, réservé, endommagé et expiration.', 'متابعة المتاح والمحجوز والتالف والانتهاء.'), 'CSV'],
    ['delivery', copy(lang, 'Livraison et exceptions', 'التوصيل والاستثناءات'), copy(lang, 'Isoler les échecs, retours et délais à confirmer.', 'عزل حالات الفشل والإرجاع والمدد التي تحتاج تأكيداً.'), 'CSV / PDF'],
    ['finance', copy(lang, 'Lecture financière', 'القراءة المالية'), copy(lang, 'Regrouper revenus, dépenses et COGS validés.', 'جمع الإيرادات والمصاريف وتكاليف البضاعة المعتمدة.'), 'À connecter'],
  ];
  const active = reports.find(([id]) => id === selected) ?? reports[0];
  return <>
    <OpsHeader lang={lang} title={copy(lang, 'Catalogue des rapports', 'كتالوج التقارير')} description={copy(lang, 'Choisir le rapport, son filtre et son export sans réutiliser une seule vue financière pour tous les besoins.', 'اختيار التقرير والمرشح والتصدير دون إعادة استخدام لوحة مالية واحدة لكل الحالات.')} action={<button type="button" onClick={() => setSaved(true)} className="focus-ring flex items-center gap-2 border hairline px-4 py-2 text-xs font-bold"><Download size={14} />{copy(lang, 'Exporter la vue', 'تصدير العرض')}</button>} />
    <div className="grid gap-4 md:grid-cols-2">
      {reports.map(([id, title, description, format]) => <button type="button" key={id} onClick={() => { setSelected(id); setSaved(false); }} className={`focus-ring border p-5 text-start transition-colors ${selected === id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)]' : 'hairline bg-[hsl(var(--card))]'}`}><div className="flex items-start justify-between gap-3"><FileText size={19} className="text-[hsl(var(--primary))]" /><StatusBadge label={format} tone={format === 'À connecter' ? 'warn' : 'info'} /></div><h2 className="mt-7 text-sm font-bold">{title}</h2><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{description}</p><span className="mt-5 inline-flex text-[10px] font-bold text-[hsl(var(--primary))]">{copy(lang, 'Ouvrir le rapport', 'فتح التقرير')}<ArrowRight size={13} className="ms-2" /></span></button>)}
    </div>
    <section className="mt-7 border hairline bg-[hsl(var(--card))] p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b hairline pb-5"><div><p className="eyebrow">{copy(lang, 'Rapport sélectionné', 'التقرير المحدد')}</p><h2 className="display mt-1 text-3xl uppercase">{active[1]}</h2></div><div className="flex gap-2"><select className="plazza-field focus-ring text-xs"><option>{copy(lang, '7 jours', '٧ أيام')}</option><option>{copy(lang, '30 jours', '٣٠ يوماً')}</option></select><select className="plazza-field focus-ring text-xs"><option>{copy(lang, 'Tous les canaux', 'كل القنوات')}</option><option>COD</option><option>Boutique</option></select></div></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric label={copy(lang, 'Source', 'المصدر')} value="LOCAL" note={copy(lang, 'lecture fixture', 'قراءة محلية')} tone="info" /><Metric label={copy(lang, 'Lignes', 'الأسطر')} value="03" note={copy(lang, 'aperçu', 'معاينة')} /><Metric label={copy(lang, 'État', 'الحالة')} value={saved ? copy(lang, 'PRÊT', 'جاهز') : 'LOCAL'} note={copy(lang, 'aucun fichier créé', 'لم يتم إنشاء ملف')} tone={saved ? 'good' : 'warn'} /></div>
      <Boundary tone="warn">{copy(lang, 'L’export réel, les plages personnalisées et les données financières dépendent du service autoritaire.', 'التصدير الحقيقي والفترات المخصصة والبيانات المالية تعتمد على الخدمة الموثوقة.')}</Boundary>
    </section>
  </>;
}

export type OpsNavigationMode = 'sidebar' | 'rail';

export function ProfessionalOperationsSurface({ lang, navigationMode = 'sidebar' }: { lang: Lang; navigationMode?: OpsNavigationMode }) {
  const [location] = useLocation();
  const slug = (location.split('/')[2] || 'dashboard') as OpsKind;
  const known = opsLinks.some(([key]) => key === slug) ? slug : 'dashboard';
  let content: ReactNode;
  if (known === 'dashboard') content = <ProfessionalDashboard lang={lang} />;
  else if (known === 'orders') content = <ProfessionalOrders lang={lang} />;
  else if (known === 'customers') content = <ProfessionalCustomers lang={lang} />;
  else if (known === 'products') content = <ProfessionalProducts lang={lang} />;
  else if (known === 'categories') content = <ProfessionalCategories lang={lang} />;
  else if (known === 'inventory') content = <ProfessionalInventory lang={lang} kind="inventory" />;
  else if (known === 'movements') content = <ProfessionalMovements lang={lang} />;
  else if (known === 'purchasing') content = <ProfessionalPurchasing lang={lang} />;
  else if (known === 'receiving') content = <ProfessionalReceiving lang={lang} receiving />;
  else if (known === 'pos') content = <ProfessionalPos lang={lang} />;
  else if (known === 'cash') content = <ProfessionalPos lang={lang} cash />;
  else if (known === 'staff') content = <ProfessionalPeople lang={lang} />;
  else if (known === 'roles') content = <ProfessionalPeople lang={lang} roles />;
  else if (known === 'delivery' || known === 'returns' || known === 'exchanges' || known === 'refunds') content = <ProfessionalFulfillment lang={lang} kind={known} />;
  else if (known === 'finance') content = <ProfessionalFinance lang={lang} kind="finance" />;
  else if (known === 'expenses') content = <ProfessionalExpenses lang={lang} />;
  else if (known === 'profitability') content = <ProfessionalProfitability lang={lang} />;
  else if (known === 'reports') content = <ProfessionalReports lang={lang} />;
  else if (known === 'coupons') content = <ProfessionalCoupons lang={lang} />;
  else if (known === 'reviews') content = <ProfessionalReviews lang={lang} />;
  else if (known === 'notifications') content = <ProfessionalNotifications lang={lang} />;
  else if (known === 'audit') content = <ProfessionalAudit lang={lang} />;
  else if (known === 'settings') content = <ProfessionalSettings lang={lang} />;
  else content = <ProfessionalGeneric lang={lang} kind={known} />;
  return navigationMode === 'rail'
    ? <OpsRailFrame lang={lang} active={known}>{content}</OpsRailFrame>
    : <OpsFrame lang={lang} active={known}>{content}</OpsFrame>;
}

export function ProfessionalConfirmationSurface({ lang }: { lang: Lang }) {
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<'pending' | 'failed' | 'success'>('pending');
  const copyReference = async () => {
    setCopied(true);
    if (navigator.clipboard) await navigator.clipboard.writeText('PREVIEW-1048').catch(() => undefined);
    window.setTimeout(() => setCopied(false), 2200);
  };
  const statusCopy = state === 'failed'
    ? [copy(lang, 'Échec de confirmation', 'فشل التأكيد'), copy(lang, 'Le serveur n’a pas pu confirmer le devis local. Aucune commande n’a été créée.', 'تعذر على الخادم تأكيد التسعيرة المحلية. لم يتم إنشاء أي طلب.'), 'bad'] as const
    : state === 'success'
      ? [copy(lang, 'Succès local', 'نجاح محلي'), copy(lang, 'Le parcours est complet en local. La création réelle reste à connecter.', 'اكتمل المسار محلياً. إنشاء الطلب الحقيقي بانتظار الربط.'), 'good'] as const
      : [copy(lang, 'Pending / local', 'قيد الانتظار / محلي'), copy(lang, 'Référence locale PREVIEW-1048. Le serveur devra confirmer le prix, la livraison et la création de commande.', 'المرجع المحلي PREVIEW-1048. يجب على الخادم تأكيد السعر والتوصيل وإنشاء الطلب.'), 'warn'] as const;
  return <main className="mx-auto max-w-[900px] px-5 py-16 pb-28 lg:py-24"><div className="mb-5 flex flex-wrap gap-2" aria-label={copy(lang, 'États de confirmation', 'حالات التأكيد')}><button type="button" onClick={() => setState('pending')} className={`focus-ring border px-3 py-2 text-[11px] font-bold ${state === 'pending' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'hairline'}`}>{copy(lang, 'En attente', 'قيد الانتظار')}</button><button type="button" onClick={() => setState('failed')} className={`focus-ring border px-3 py-2 text-[11px] font-bold ${state === 'failed' ? 'border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/.08)]' : 'hairline'}`}>{copy(lang, 'Échec', 'فشل')}</button><button type="button" onClick={() => setState('success')} className={`focus-ring border px-3 py-2 text-[11px] font-bold ${state === 'success' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.15)]' : 'hairline'}`}>{copy(lang, 'Succès local', 'نجاح محلي')}</button></div><div className="border hairline bg-[hsl(var(--card))] p-7 sm:p-10"><StatusBadge label={statusCopy[0]} tone={statusCopy[2]} icon={state === 'failed' ? AlertCircle : state === 'success' ? CheckCircle2 : Clock3} /><h1 className="display mt-5 text-5xl uppercase">{state === 'failed' ? copy(lang, 'Confirmation impossible', 'تعذر التأكيد') : state === 'success' ? copy(lang, 'Parcours local terminé', 'اكتمل المسار المحلي') : copy(lang, 'Confirmation en attente', 'التأكيد قيد الانتظار')}</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{statusCopy[1]}</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><Spec label={copy(lang, 'Référence', 'المرجع')} value="PREVIEW-1048" mono /><Spec label={copy(lang, 'Paiement', 'الدفع')} value="COD" /><Spec label={copy(lang, 'Tâche suivante', 'الخطوة التالية')} value={state === 'failed' ? copy(lang, 'Réessayer le devis', 'إعادة التسعير') : state === 'success' ? copy(lang, 'Validation serveur', 'اعتماد الخادم') : copy(lang, 'Confirmation serveur', 'تأكيد الخادم')} /></div>{state === 'failed' && <div className="mt-6 flex items-start gap-3 border border-[hsl(var(--destructive)/.5)] bg-[hsl(var(--destructive)/.08)] p-4 text-xs" role="alert"><AlertCircle size={17} className="shrink-0 text-[hsl(var(--destructive))]" /><span>{copy(lang, 'Réessayez le devis ou revenez au checkout. Aucun stock n’a été réservé.', 'أعد التسعير أو عد إلى الدفع. لم يتم حجز أي مخزون.')}</span></div>}{state === 'success' && <div className="mt-6 flex items-start gap-3 border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.1)] p-4 text-xs" role="status"><CheckCircle2 size={17} className="shrink-0 text-[hsl(var(--accent-foreground))]" /><span>{copy(lang, 'Succès de prévisualisation uniquement : aucun ordre, paiement ou envoi réel.', 'نجاح المعاينة فقط: لم يتم إنشاء طلب أو دفع أو شحنة حقيقية.')}</span></div>}<div className="mt-7 flex flex-wrap gap-3"><Link href="/shop" className="focus-ring bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-white">{copy(lang, 'Retour à la boutique', 'العودة إلى المتجر')}</Link>{state === 'failed' ? <Link href="/checkout" className="focus-ring border hairline px-5 py-3 text-xs font-bold">{copy(lang, 'Retour au checkout', 'العودة إلى الدفع')}</Link> : <button type="button" onClick={() => setState('pending')} className="focus-ring border hairline px-5 py-3 text-xs font-bold">{copy(lang, 'Réessayer', 'إعادة المحاولة')}</button>}<button type="button" onClick={copyReference} className="focus-ring border hairline px-5 py-3 text-xs font-bold">{copied ? copy(lang, 'Référence copiée', 'تم نسخ المرجع') : copy(lang, 'Copier la référence', 'نسخ المرجع')}</button><button type="button" onClick={() => window.print()} className="focus-ring border hairline px-5 py-3 text-xs font-bold">{copy(lang, 'Imprimer', 'طباعة')}</button></div><Boundary tone={state === 'success' ? 'success' : 'warn'}>{copy(lang, 'Cette confirmation est une preuve visuelle du parcours, pas une commande réelle.', 'هذا التأكيد إثبات بصري للمسار وليس طلباً حقيقياً.')}</Boundary></div></main>;
}