import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { products } from '@/lib/mock-service';
import type { Lang } from '@/lib/i18n';

type SeoCopy = {
  title: string;
  description: string;
};

const publicSeo: Record<string, { fr: SeoCopy; ar: SeoCopy }> = {
  '/': {
    fr: { title: 'Nutrition sportive en Algérie | Plazza Nutrition', description: 'Découvrez la nutrition sportive, les accessoires et la livraison COD en Algérie avec le catalogue visuel Plazza Nutrition.' },
    ar: { title: 'تغذية رياضية في الجزائر | بلازا نيوتريشن', description: 'اكتشف التغذية الرياضية والإكسسوارات والتوصيل عند الاستلام في الجزائر مع كتالوج بلازا نيوتريشن.' },
  },
  '/shop': {
    fr: { title: 'Catalogue nutrition sportive | Plazza Nutrition', description: 'Parcourez les références de nutrition sportive, bien-être et accessoires disponibles dans le catalogue Plazza Nutrition.' },
    ar: { title: 'كتالوج التغذية الرياضية | بلازا نيوتريشن', description: 'تصفح منتجات التغذية الرياضية والعافية والإكسسوارات في كتالوج بلازا نيوتريشن.' },
  },
  '/categories': {
    fr: { title: 'Catégories nutrition sportive | Plazza Nutrition', description: 'Explorez les catégories protein, performance, wellness et accessoires de Plazza Nutrition.' },
    ar: { title: 'فئات التغذية الرياضية | بلازا نيوتريشن', description: 'استكشف فئات البروتين والأداء والعافية والإكسسوارات من بلازا نيوتريشن.' },
  },
  '/search': {
    fr: { title: 'Rechercher un produit | Plazza Nutrition', description: 'Trouvez une référence de nutrition sportive, de bien-être ou un accessoire dans le catalogue Plazza Nutrition.' },
    ar: { title: 'البحث عن منتج | بلازا نيوتريشن', description: 'ابحث عن منتج للتغذية الرياضية أو العافية أو الإكسسوارات في كتالوج بلازا نيوتريشن.' },
  },
  '/promotions': {
    fr: { title: 'Promotions et offres | Plazza Nutrition', description: 'Consultez les offres et conditions à confirmer du catalogue Plazza Nutrition en Algérie.' },
    ar: { title: 'العروض والتخفيضات | بلازا نيوتريشن', description: 'اطلع على عروض وشروط كتالوج بلازا نيوتريشن في الجزائر.' },
  },
  '/delivery': {
    fr: { title: 'Livraison en Algérie | Plazza Nutrition', description: 'Consultez les informations de livraison et de paiement à la réception de Plazza Nutrition.' },
    ar: { title: 'التوصيل في الجزائر | بلازا نيوتريشن', description: 'اطلع على معلومات التوصيل والدفع عند الاستلام من بلازا نيوتريشن.' },
  },
  '/help': {
    fr: { title: 'Aide et questions fréquentes | Plazza Nutrition', description: 'Trouvez les informations utiles pour parcourir le catalogue et préparer votre commande Plazza Nutrition.' },
    ar: { title: 'المساعدة والأسئلة الشائعة | بلازا نيوتريشن', description: 'اعثر على المعلومات اللازمة لتصفح الكتالوج وتجهيز طلبك من بلازا نيوتريشن.' },
  },
  '/contact': {
    fr: { title: 'Contactez Plazza Nutrition', description: 'Contactez Plazza Nutrition pour toute question sur le catalogue, la livraison ou votre parcours de commande.' },
    ar: { title: 'تواصل مع بلازا نيوتريشن', description: 'تواصل مع بلازا نيوتريشن بخصوص الكتالوج أو التوصيل أو مسار طلبك.' },
  },
  '/about': {
    fr: { title: 'À propos de Plazza Nutrition', description: 'Découvrez l’approche de Plazza Nutrition pour une expérience claire de nutrition sportive en Algérie.' },
    ar: { title: 'عن بلازا نيوتريشن', description: 'تعرّف على نهج بلازا نيوتريشن في تقديم تجربة واضحة للتغذية الرياضية في الجزائر.' },
  },
  '/policies': {
    fr: { title: 'Politiques de la boutique | Plazza Nutrition', description: 'Consultez les politiques de la boutique Plazza Nutrition avant de préparer votre commande.' },
    ar: { title: 'سياسات المتجر | بلازا نيوتريشن', description: 'اطلع على سياسات متجر بلازا نيوتريشن قبل تجهيز طلبك.' },
  },
  '/terms': {
    fr: { title: 'Conditions d’utilisation | Plazza Nutrition', description: 'Consultez les conditions d’utilisation de l’expérience Plazza Nutrition.' },
    ar: { title: 'شروط الاستخدام | بلازا نيوتريشن', description: 'اطلع على شروط استخدام تجربة بلازا نيوتريشن.' },
  },
  '/privacy': {
    fr: { title: 'Confidentialité | Plazza Nutrition', description: 'Consultez les informations de confidentialité de Plazza Nutrition.' },
    ar: { title: 'الخصوصية | بلازا نيوتريشن', description: 'اطلع على معلومات الخصوصية لدى بلازا نيوتريشن.' },
  },
};

const privateSeo: Record<string, { fr: SeoCopy; ar: SeoCopy }> = {
  '/cart': {
    fr: { title: 'Votre panier | Plazza Nutrition', description: 'Vérifiez les références sélectionnées avant de préparer votre commande Plazza Nutrition.' },
    ar: { title: 'سلة مشترياتك | بلازا نيوتريشن', description: 'راجع المنتجات المختارة قبل تجهيز طلبك من بلازا نيوتريشن.' },
  },
  '/checkout': {
    fr: { title: 'Préparer la commande | Plazza Nutrition', description: 'Renseignez vos informations de livraison pour préparer une commande Plazza Nutrition.' },
    ar: { title: 'تجهيز الطلب | بلازا نيوتريشن', description: 'أدخل معلومات التوصيل لتجهيز طلبك من بلازا نيوتريشن.' },
  },
  '/confirmation': {
    fr: { title: 'Confirmation de commande | Plazza Nutrition', description: 'Consultez le statut de confirmation de votre parcours Plazza Nutrition.' },
    ar: { title: 'تأكيد الطلب | بلازا نيوتريشن', description: 'اطلع على حالة تأكيد مسار طلبك من بلازا نيوتريشن.' },
  },
  '/login': {
    fr: { title: 'Connexion | Plazza Nutrition', description: 'Accédez à votre espace Plazza Nutrition.' },
    ar: { title: 'تسجيل الدخول | بلازا نيوتريشن', description: 'ادخل إلى مساحة بلازا نيوتريشن الخاصة بك.' },
  },
  '/register': {
    fr: { title: 'Créer un compte | Plazza Nutrition', description: 'Créez votre espace client Plazza Nutrition.' },
    ar: { title: 'إنشاء حساب | بلازا نيوتريشن', description: 'أنشئ مساحة العميل الخاصة بك في بلازا نيوتريشن.' },
  },
  '/recover': {
    fr: { title: 'Récupérer l’accès | Plazza Nutrition', description: 'Récupérez l’accès à votre espace Plazza Nutrition.' },
    ar: { title: 'استعادة الوصول | بلازا نيوتريشن', description: 'استعد الوصول إلى مساحة بلازا نيوتريشن الخاصة بك.' },
  },
  '/verify': {
    fr: { title: 'Vérifier votre accès | Plazza Nutrition', description: 'Vérifiez votre accès à l’espace Plazza Nutrition.' },
    ar: { title: 'تحقق من الوصول | بلازا نيوتريشن', description: 'تحقق من وصولك إلى مساحة بلازا نيوتريشن.' },
  },
  '/account': {
    fr: { title: 'Mon compte | Plazza Nutrition', description: 'Gérez votre espace client Plazza Nutrition.' },
    ar: { title: 'حسابي | بلازا نيوتريشن', description: 'أدر مساحة العميل الخاصة بك في بلازا نيوتريشن.' },
  },
  '/orders': {
    fr: { title: 'Mes commandes | Plazza Nutrition', description: 'Consultez vos commandes et leur statut dans votre espace Plazza Nutrition.' },
    ar: { title: 'طلباتي | بلازا نيوتريشن', description: 'راجع طلباتك وحالتها في مساحة بلازا نيوتريشن.' },
  },
};

function copyFor(lang: Lang, copy: { fr: SeoCopy; ar: SeoCopy }) {
  return copy[lang];
}

function upsertMeta(name: string, content: string, property = false) {
  const attribute = property ? 'property' : 'name';
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function routeMetadata(path: string, lang: Lang): { copy: SeoCopy; noIndex: boolean; type: 'website' | 'product' } {
  const productMatch = path.match(/^\/shop\/([^/]+)$/);
  if (productMatch) {
    const product = products.find((item) => item.id === productMatch[1]);
    if (product) {
      return {
        copy: lang === 'ar'
          ? { title: `${product.arabicName} | بلازا نيوتريشن`, description: `اطلع على تفاصيل ${product.arabicName} في كتالوج بلازا نيوتريشن.` }
          : { title: `${product.name} | Plazza Nutrition`, description: `Découvrez ${product.name} dans le catalogue de nutrition sportive Plazza Nutrition.` },
        noIndex: false,
        type: 'product',
      };
    }
    return {
      copy: lang === 'ar'
        ? { title: 'المنتج غير موجود | بلازا نيوتريشن', description: 'هذا المنتج غير موجود في كتالوج بلازا نيوتريشن.' }
        : { title: 'Produit introuvable | Plazza Nutrition', description: 'Cette référence n’existe pas dans le catalogue Plazza Nutrition.' },
      noIndex: true,
      type: 'website',
    };
  }
  if (privateSeo[path]) return { copy: copyFor(lang, privateSeo[path]), noIndex: true, type: 'website' };
  if (publicSeo[path]) return { copy: copyFor(lang, publicSeo[path]), noIndex: false, type: 'website' };
  if (path.startsWith('/ops')) {
    return {
      copy: lang === 'ar'
        ? { title: 'إدارة العمليات | بلازا نيوتريشن', description: 'مساحة العمليات المحلية لبلازا نيوتريشن.' }
        : { title: 'Opérations | Plazza Nutrition', description: 'Espace local des opérations Plazza Nutrition.' },
      noIndex: true,
      type: 'website',
    };
  }
  return {
    copy: lang === 'ar'
      ? { title: 'صفحة غير موجودة | بلازا نيوتريشن', description: 'لم يتم العثور على الصفحة المطلوبة في بلازا نيوتريشن.' }
      : { title: 'Page introuvable | Plazza Nutrition', description: 'La page demandée n’existe pas sur Plazza Nutrition.' },
    noIndex: true,
    type: 'website',
  };
}

export function SeoHead({ lang }: { lang: Lang }) {
  const [location] = useLocation();

  useEffect(() => {
    const path = location.replace(/\/+$/, '') || '/';
    const { copy, noIndex, type } = routeMetadata(path, lang);
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const origin = window.location.origin;
    const canonical = `${origin}${basePath}${path === '/' ? '/' : path}`;
    const image = `${origin}${basePath}/og-image.svg`;

    document.title = copy.title;
    document.documentElement.lang = lang === 'ar' ? 'ar-DZ' : 'fr-DZ';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    upsertMeta('description', copy.description);
    upsertMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('og:title', copy.title, true);
    upsertMeta('og:description', copy.description, true);
    upsertMeta('og:type', type, true);
    upsertMeta('og:url', canonical, true);
    upsertMeta('og:image', image, true);
    upsertMeta('og:locale', lang === 'ar' ? 'ar_DZ' : 'fr_DZ', true);
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', copy.title);
    upsertMeta('twitter:description', copy.description);
    upsertMeta('twitter:image', image);
    upsertLink('canonical', canonical);
  }, [lang, location]);

  return null;
}