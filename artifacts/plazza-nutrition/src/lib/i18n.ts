export type Lang = 'fr' | 'ar';

const dictionary = {
  fr: {
    store: 'Boutique', categories: 'Catégories', promotions: 'Promotions', delivery: 'Livraison',
    search: 'Rechercher', language: 'Changer la langue', openOps: 'Ouvrir les opérations', customerLogin: 'Connexion',
    openCart: 'Ouvrir le panier', home: 'Accueil', shop: 'Boutique', cart: 'Panier', fixture: 'Fixture visuel', merchantMedia: 'Média marchand', referenceMedia: 'Image de référence', mediaPending: 'Aucun média marchand approuvé',
    localFixture: 'Données locales', localData: 'Données visuelles locales', localNotice: 'Interface de démonstration · données locales · aucune action ne crée un enregistrement réel',
    algeria: 'ALGÉRIE', selection: 'La sélection', seeAll: 'Tout voir', startHere: 'Commencez ici.',
    heroTrain: 'Entraînez-vous', heroIntent: 'avec intention.', moreFocus: 'Plus de focus.', noFakeCertainty: 'Pas de fausse certitude.',
    exploreShop: 'Explorer la boutique', understandDelivery: 'Comprendre la livraison', productFirst: 'Le produit d’abord',
    productFirstText: 'Prix, format et disponibilité restent visibles avant le storytelling.', codClearly: 'COD, clairement',
    codClearlyText: 'Un parcours court avec wilaya, commune et mode de livraison explicites.', bilingual: 'Bilingue par défaut',
    bilingualText: 'Français LTR et arabe RTL partagent le même niveau de soin.', routine: 'Votre routine',
    aboutApproach: 'Notre approche', trainingNutrition: 'Nutrition de performance, présentée sans bruit. Explorez le catalogue, choisissez votre routine et gardez la livraison COD claire.',
    productFixtureNotice: 'Les références affichées sont des fixtures visuels, pas des images marchandes approuvées. Catalogue, emballages, tarifs et allégations restent à connecter.',
    findFit: 'Trouvez votre routine.', chooseLane: 'Choisissez votre terrain.', shelf: 'Le rayon.',
     reset: 'Réinitialiser', all: 'Tout', available: 'Disponible', outOfStock: 'Rupture', filters: 'Filtres', availability: 'Disponibilité', sort: 'Trier', applyFilters: 'Appliquer les filtres', visualReferences: '{count} références visuelles',
    searchPlaceholder: 'Rechercher un produit, une catégorie…', noResults: 'Aucun résultat dans le fixture',
    tryOther: 'Essayez une autre recherche ou retirez les filtres.', productAdded: 'Ajouté à votre panier local',
    add: 'Ajouter', addToCart: 'Ajouter au panier', unavailable: 'Indisponible', stockFixture: '{count} unités en fixture locale',
    unavailableFixture: 'Indisponible dans ce fixture', visualAvailability: 'Disponibilité visualisée',
    noStockFixture: 'Rupture affichée dans ce fixture local', noStockReserved: 'Maquette locale : aucun stock n’est réservé.',
    backToShop: 'Retour au catalogue', back: 'Retour', yourSelection: 'Votre sélection', emptyCart: 'Votre panier est vide',
    addReference: 'Ajoutez une référence depuis la boutique.', viewShop: 'Voir la boutique', subtotalFixture: 'Sous-total fixture',
    deliveryCalculated: 'Livraison calculée par le futur service autoritaire. Aucun taux n’est simulé ici.',
    seeCart: 'Voir le panier', stepSelection: 'Étape 01 / sélection', yourCart: 'Votre panier.',
    exploreToStart: 'Explorez le catalogue pour commencer.', summary: 'Résumé', subtotal: 'Sous-total',
    toDetermine: 'À déterminer', indicativeTotal: 'Total prévisionnel', serverConfirms: 'Le serveur devra confirmer le total final et les frais de livraison.',
    continueCod: 'Continuer en COD', stepCod: 'Étape 02 / COD', whereDeliver: 'On livre où ?',
    demoJourney: 'Un parcours de démonstration. La soumission ci-dessous ne crée aucune commande réelle.',
    contactDetails: 'Vos coordonnées', destination: 'Destination', payment: 'Paiement', fullName: 'Nom complet',
    phone: 'Téléphone', wilaya: 'Wilaya', commune: 'Commune', homeDelivery: 'À domicile', relayPoint: 'Point relais',
    rateToConfirm: 'Tarif à confirmer', ifAvailable: 'Si disponible', cashOnDelivery: 'Paiement à la livraison',
    codPresented: 'Le COD est le mode présenté par ce frontend. Aucun paiement n’est capturé.',
    requiredFields: 'Complétez les champs obligatoires pour continuer.', preparingView: 'Préparation de la vue…',
    previewConfirmation: 'Prévisualiser la confirmation', yourOrder: 'Votre commande', cartEmpty: 'Votre panier est vide.',
    totalIndicative: 'Total indicatif', readyToConnect: 'C’est prêt à être branché.', successFixture: 'Vue de succès / fixture',
    codPreviewed: 'Le parcours COD a été prévisualisé. Aucun ordre, stock, paiement ou expédition réelle n’a été créé.',
    returnShop: 'Retour à la boutique', seeAccount: 'Voir le compte', customerSpace: 'Espace client', yourAccount: 'Votre compte.',
    orders: 'Commandes', trackOrders: 'Suivre vos commandes et leurs états.', returns: 'Retours', returnRules: 'Règles et demandes après livraison.',
    profile: 'Profil', profileText: 'Connexion et données à brancher.', mockupState: 'État de la maquette',
    notConnected: 'La connexion, le profil et la persistance sont volontairement non branchés dans cette phase.',
    yourOrders: 'Vos commandes.', allOrders: 'Toutes les commandes', localOrder: 'Commande locale / état visuel',
    importantNote: 'Note importante', timelineText: 'Cette timeline illustre les états possibles. Elle ne consulte pas une commande réelle et ne fournit pas de suivi transporteur.',
    afterDelivery: 'Après livraison', help: 'Aide', contact: 'Contact', policies: 'Politiques', terms: 'Conditions', privacy: 'Confidentialité', exchanges: 'Échanges', reviews: 'Avis',
    selectionMoment: 'Sélection du moment', afterDeliveryText: 'Cette zone préparera les demandes de retour, leur motif, état et suivi. Aucune demande réelle n’est enregistrée dans cette maquette.',
    helpAction: 'Consulter l’aide', anotherFormat: 'Un autre format ?', exchangeText: 'Visualisez ici les règles d’échange, l’écart de prix et l’état de la nouvelle préparation, une fois les politiques marchandes connectées.',
    policyAction: 'Voir les politiques', experienceMatters: 'Votre expérience compte', reviewsText: 'Les avis affichés ici seront connectés au futur service de modération. Aucun avis n’est fabriqué pour cette expérience.',
    startShopping: 'Commencer mes achats', deliveryKicker: 'Clair, avant de commander', deliveryText: 'Choisissez entre livraison à domicile et point relais lorsque disponible. Les tarifs, zones et capacités du transporteur seront fournis par la configuration marchande.',
    helpKicker: 'On vous guide', helpText: 'Retrouvez ici les réponses sur le COD, la préparation, la livraison et les retours. Cette base de contenu est un fixture local.',
    contactKicker: 'Parlons de votre commande', contactText: 'Un espace de contact bilingue sera relié aux canaux choisis par Plazza Nutrition. Pour l’instant, ce bouton ne transmet aucun message.',
    aboutKicker: 'Discipline, sans bruit', aboutTitle: 'À propos de Plazza', aboutText: 'Une direction premium et athlétique pour une expérience nutrition plus fiable. Cette présentation est une proposition visuelle, pas une déclaration commerciale.',
    policiesKicker: 'À lire avant achat', policiesText: 'Les politiques de livraison, retours, confidentialité et conditions sont des emplacements de contenu. Les versions finales nécessitent validation légale.',
    termsKicker: 'Document à venir', termsText: 'Les conditions générales seront publiées ici après validation du marchand et de son conseil.',
    privacyKicker: 'Document à venir', privacyText: 'La politique de confidentialité finale reste à fournir. Ce frontend ne collecte ni ne persiste vos données.',
    workspace: 'Espace opérations', fixturePreview: 'Workspace / aperçu fixture', fixtureMode: 'MODE FIXTURE · V0.1', navigation: 'Navigation',
    work: 'Travail', catalogue: 'Catalogue', stock: 'Stock', flow: 'Flux', finance: 'Finance', control: 'Contrôle',
    overview: 'Vue d’ensemble', customers: 'Clients', products: 'Produits', movements: 'Mouvements', purchasing: 'Achats & réception',
    inventory: 'Inventaire', shipments: 'Expéditions', receiving: 'Réception', batches: 'Lots & expiration', refunds: 'Remboursements', cash: 'Caisse',
    expenses: 'Dépenses', profitability: 'Rentabilité', coupons: 'Coupons',
    pos: 'POS', reports: 'Rapports', team: 'Équipe', notifications: 'Notifications', settings: 'Paramètres',
    roles: 'Rôles', audit: 'Audit', returnStore: 'Retour boutique', closeNavigation: 'Fermer la navigation',
    sections: 'Sections', localWorkspace: 'ESPACE LOCAL · V0.1', fixtureBoundary: 'Chaque chiffre de cet espace est un fixture local. Totaux, stock, permissions, bénéfices et transitions restent du ressort du futur serveur.',
    boundary: 'Frontière explicite', attention: 'Attention', treatment: 'À traiter', waiting: 'En attente', done: 'Terminé', allFilters: 'Tout',
    newProduct: 'Nouveau produit', newAdjustment: 'Nouvel ajustement', newAction: 'Nouvelle action', workflow: 'Flux de travail',
    processNow: 'À traiter maintenant', recentOrders: 'Commandes récentes', exportView: 'Exporter la vue', visualReference: 'Référentiel visuel',
    productsAvailability: 'Produits et disponibilité', edit: 'Modifier', modulePreparing: 'Module en préparation', traceWork: 'Suivez le travail.',
    localChecklist: 'Checklist locale', readableFilters: 'Filtres lisibles', explicitAudit: 'Audit explicite', noPersistence: 'Aucune persistance', visibleRole: 'Rôle visible',
    staffRoles: 'PROPRIÉTAIRE · MANAGER · OPÉRATEUR COMMANDES · CAISSIER · OPÉRATEUR ENTREPÔT · FINANCE',
    sessionLocal: 'Session locale / non engagée', newSale: 'Nouvelle vente', onlineVisual: 'En ligne visuel', offlineDraft: 'Brouillon local hors engagement',
    searchOrScan: 'Rechercher ou scanner…', registerCart: 'Panier caisse', noItems: 'Aucun article ajouté', draftVisual: 'Les ventes restent des brouillons visuels.',
    prepareTicket: 'Préparer le ticket', shortcutSearch: 'Recherche / scan', shortcutAdd: 'Ajouter article', shortcutClear: 'Vider brouillon',
    cashSession: 'Session de caisse', sessionOpen: 'Session ouverte localement', noCommit: 'Aucune vente n’est engagée ni transmise.', actionLocal: 'Action locale',
    localActionText: 'Ce formulaire démontre l’état et la validation de l’interface. Il ne persiste rien et ne déclenche aucun service de production.',
    label: 'Libellé', cancel: 'Annuler', saveView: 'Enregistrer la vue', close: 'Fermer', emptyReference: 'Le panier attend votre première référence',
    loading: 'Chargement', empty: 'Vide', error: 'Erreur', stateReady: 'État prêt à connecter', noRealAction: 'Aucune action réelle',
    statusConfirm: 'À confirmer', statusPreparing: 'En préparation', statusShipped: 'Expédiée', statusDelivered: 'Livrée', statusOut: 'Rupture', statusWatch: 'À surveiller', statusAvailable: 'Disponible',
    decreaseQuantity: 'Diminuer la quantité', increaseQuantity: 'Augmenter la quantité',
     financeGross: 'Chiffre visuel', financePending: 'Flux en attente', financeDelivered: 'Livrées',
     sevenDayFixture: 'fixture · 7 jours', ordersFromFixture: 'commandes du fixture', deliveredFromFixture: 'commande livrée du fixture',
     financeLedger: 'Journal visuel', financeReadout: 'Lecture des commandes', financeBoundary: 'Lecture calculée à partir des commandes locales uniquement. Marge, encaissement et rapprochement restent server-owned.',
     reportInventory: 'Inventaire visuel', reportCategoryReadout: 'Disponibilité par catégorie', reportAvailable: 'disponibles', reportUnits: 'unités',
     reportReadout: 'Signal de pilotage', reportDecision: 'Décider avec les faits disponibles.', reportOrders: 'Commandes locales', reportCatalog: 'Références catalogue', reportBoundary: 'Aucun taux de conversion, bénéfice ou prévision n’est inventé dans ce rapport.',
  },
  ar: {
    store: 'المتجر', categories: 'الفئات', promotions: 'العروض', delivery: 'التوصيل', search: 'بحث', language: 'تغيير اللغة',
    openOps: 'فتح العمليات', customerLogin: 'تسجيل الدخول', openCart: 'فتح السلة', home: 'الرئيسية', shop: 'المتجر', cart: 'السلة', fixture: 'مرجع بصري تجريبي', merchantMedia: 'وسائط التاجر', referenceMedia: 'صورة مرجعية', mediaPending: 'لا توجد وسائط تجارية معتمدة بعد',
    localFixture: 'بيانات محلية', localData: 'بيانات مرئية محلية', localNotice: 'واجهة تجريبية · بيانات محلية · لا ينشئ أي إجراء سجلاً حقيقياً',
    algeria: 'الجزائر', selection: 'مختاراتنا', seeAll: 'عرض الكل', startHere: 'ابدأ من هنا',
    exploreShop: 'استكشف المتجر', understandDelivery: 'تعرّف على التوصيل', productFirst: 'المنتج أولاً',
    productFirstText: 'السعر والحجم والتوفر واضحة قبل أي قصة تسويقية.', codClearly: 'الدفع عند الاستلام بوضوح',
    codClearlyText: 'مسار مختصر يوضح الولاية والبلدية وطريقة التوصيل.', bilingual: 'ثنائي اللغة افتراضياً',
    bilingualText: 'الفرنسية والعربية RTL تحظيان بالمستوى نفسه من العناية.', routine: 'روتينك',
    aboutApproach: 'نهجنا', trainingNutrition: 'تغذية للتمرين بلا مبالغة. تصفّح الكتالوج، اختر ما يناسب روتينك، واترك تفاصيل الدفع عند الاستلام واضحة.',
    productFixtureNotice: 'هذه مراجع بصرية محلية وليست صور منتجات معتمدة. التغليف والأسعار والمواصفات والادعاءات تنتظر بيانات التاجر.',
    findFit: 'اعثر على ما يلائم روتينك', chooseLane: 'اختر مسارك', shelf: 'رفّك يبدأ هنا',
     reset: 'إعادة ضبط', all: 'الكل', available: 'متوفر', outOfStock: 'غير متوفر', filters: 'المرشحات', availability: 'التوفر', sort: 'الترتيب', applyFilters: 'تطبيق المرشحات', visualReferences: '{count} مراجع بصرية',
    searchPlaceholder: 'ابحث باسم المنتج أو الفئة…', noResults: 'لا توجد مراجع مطابقة', tryOther: 'غيّر عبارة البحث أو أزل أحد المرشحات.',
    productAdded: 'أضيف المنتج إلى سلتك المحلية', add: 'أضف', addToCart: 'أضف إلى السلة', unavailable: 'غير متوفر',
    stockFixture: '{count} وحدات ضمن البيانات المحلية', unavailableFixture: 'غير متوفر ضمن هذه البيانات', visualAvailability: 'التوفر المعروض',
    noStockFixture: 'نفاد معروض ضمن البيانات المحلية', noStockReserved: 'نموذج محلي: لم يتم حجز أي مخزون.',
    backToShop: 'العودة إلى الكتالوج', back: 'رجوع', yourSelection: 'اختياراتك', emptyCart: 'السلة بانتظار اختيارك',
    addReference: 'أضف مرجعاً من المتجر لتراه هنا.', viewShop: 'عرض المتجر', subtotalFixture: 'المجموع الفرعي المحلي',
    deliveryCalculated: 'سيحسب التوصيل لاحقاً من خلال الخدمة المعتمدة. لا توجد تعرفة محاكاة هنا.', seeCart: 'عرض السلة',
    stepSelection: 'الخطوة 01 / الاختيار', yourCart: 'سلتك', exploreToStart: 'استكشف الكتالوج للبدء.', summary: 'الملخص',
    subtotal: 'المجموع الفرعي', toDetermine: 'يحدد لاحقاً', indicativeTotal: 'الإجمالي التقديري', serverConfirms: 'سيؤكد الخادم الإجمالي النهائي ورسوم التوصيل.',
    continueCod: 'المتابعة بالدفع عند الاستلام', stepCod: 'الخطوة 02 / الدفع عند الاستلام', whereDeliver: 'أين نوصّل؟',
    demoJourney: 'مسار توضيحي. الإرسال أدناه لا ينشئ طلباً حقيقياً.', contactDetails: 'بيانات التواصل', destination: 'الوجهة',
    payment: 'الدفع', fullName: 'الاسم الكامل', phone: 'الهاتف', wilaya: 'الولاية', commune: 'البلدية', homeDelivery: 'التوصيل إلى المنزل',
    relayPoint: 'نقطة استلام', rateToConfirm: 'التعرفة تحدد لاحقاً', ifAvailable: 'عند توفرها', cashOnDelivery: 'الدفع عند الاستلام',
    codPresented: 'الدفع عند الاستلام هو الخيار المعروض هنا. لا يتم تحصيل أي دفعة.', requiredFields: 'أكمل الحقول المطلوبة للمتابعة.',
    preparingView: 'جارٍ تحضير العرض…', previewConfirmation: 'معاينة التأكيد', yourOrder: 'طلبك', cartEmpty: 'سلتك فارغة.',
    totalIndicative: 'الإجمالي التقديري', readyToConnect: 'جاهز للربط.', successFixture: 'عرض نجاح / بيانات تجريبية',
    codPreviewed: 'تمت معاينة مسار الدفع عند الاستلام. لم يتم إنشاء طلب أو مخزون أو دفعة أو شحنة حقيقية.',
    returnShop: 'العودة إلى المتجر', seeAccount: 'عرض الحساب', customerSpace: 'مساحة العميل', yourAccount: 'حسابك',
    orders: 'الطلبات', trackOrders: 'تابع طلباتك وحالاتها.', returns: 'المرتجعات', returnRules: 'القواعد والطلبات بعد التوصيل.',
    profile: 'الملف الشخصي', profileText: 'تسجيل الدخول والبيانات قيد الربط.', mockupState: 'حالة النموذج',
    notConnected: 'تسجيل الدخول والملف الشخصي والحفظ الدائم غير مفعّلة عمداً في هذه المرحلة.',
    yourOrders: 'طلباتك', allOrders: 'كل الطلبات', localOrder: 'طلب محلي / حالة مرئية', importantNote: 'ملاحظة مهمة',
    timelineText: 'يوضح هذا الخط الحالات الممكنة. لا يستعلم عن طلب حقيقي ولا يقدم تتبعاً لشركة التوصيل.',
    afterDelivery: 'بعد التوصيل', help: 'المساعدة', contact: 'تواصل', policies: 'السياسات', terms: 'الشروط', privacy: 'الخصوصية', exchanges: 'الاستبدال', reviews: 'الآراء',
    selectionMoment: 'اختيار اللحظة', afterDeliveryText: 'ستجهز هذه المساحة طلبات الإرجاع وسببها وحالتها ومتابعتها. لا يتم حفظ أي طلب حقيقي في هذا النموذج.',
    helpAction: 'اطّلع على المساعدة', anotherFormat: 'صيغة أخرى؟', exchangeText: 'ستعرض هنا قواعد الاستبدال وفارق السعر وحالة التحضير الجديدة بعد ربط سياسات التاجر.',
    policyAction: 'عرض السياسات', experienceMatters: 'تجربتك تهمنا', reviewsText: 'سترتبط الآراء المعروضة مستقبلاً بخدمة المراجعة. لم يتم اختلاق أي رأي لهذه التجربة.',
    startShopping: 'ابدأ التسوق', deliveryKicker: 'بوضوح قبل الطلب', deliveryText: 'اختر التوصيل إلى المنزل أو نقطة الاستلام عند توفرها. يحدد إعداد التاجر الأسعار والمناطق وقدرات الناقل.',
    helpKicker: 'نرشدك', helpText: 'ستجد هنا إجابات حول الدفع عند الاستلام والتحضير والتوصيل والإرجاع. هذا المحتوى محلي تجريبي.',
    contactKicker: 'لنتحدث عن طلبك', contactText: 'سترتبط مساحة التواصل ثنائية اللغة بالقنوات التي يحددها بلازا نيوتريشن. الزر حالياً لا يرسل أي رسالة.',
    aboutKicker: 'انضباط بلا ضجيج', aboutTitle: 'عن بلازا', aboutText: 'توجه راقٍ ورياضي لتجربة تغذية أكثر موثوقية. هذا العرض اقتراح بصري وليس تصريحاً تجارياً.',
    policiesKicker: 'اقرأ قبل الشراء', policiesText: 'سياسات التوصيل والإرجاع والخصوصية والشروط هنا أماكن محتوى. تحتاج النسخ النهائية إلى اعتماد قانوني.',
    termsKicker: 'وثيقة قادمة', termsText: 'ستنشر الشروط العامة هنا بعد اعتماد التاجر ومستشاره.', privacyKicker: 'وثيقة قادمة',
    privacyText: 'سياسة الخصوصية النهائية لم تقدم بعد. لا تجمع هذه الواجهة بياناتك ولا تحفظها.',
    workspace: 'مساحة العمليات', fixturePreview: 'مساحة العمل / معاينة تجريبية', fixtureMode: 'وضع تجريبي · إصدار 0.1',
    heroTrain: 'تدرّب', heroIntent: 'بنية واضحة.', moreFocus: 'تركيز أكثر.', noFakeCertainty: 'لا يقين زائف.',
    navigation: 'التنقل', work: 'العمل', catalogue: 'الكتالوج', stock: 'المخزون', flow: 'التدفق', finance: 'المالية', control: 'التحكم',
    overview: 'نظرة عامة', customers: 'العملاء', products: 'المنتجات', movements: 'الحركات', purchasing: 'المشتريات والاستلام',
    inventory: 'الجرد', shipments: 'الشحنات', receiving: 'الاستلام', batches: 'الدفعات والانتهاء', refunds: 'المبالغ المستردة', cash: 'الصندوق',
    expenses: 'المصروفات', profitability: 'الربحية', coupons: 'القسائم',
    pos: 'نقطة البيع', reports: 'التقارير', team: 'الفريق', notifications: 'الإشعارات', settings: 'الإعدادات',
    roles: 'الأدوار', audit: 'التدقيق', returnStore: 'العودة إلى المتجر', closeNavigation: 'إغلاق التنقل',
    sections: 'الأقسام', localWorkspace: 'مساحة محلية · إصدار 0.1', fixtureBoundary: 'كل رقم في هذه المساحة تجريبي محلي. الإجماليات والمخزون والصلاحيات والأرباح والانتقالات من اختصاص الخادم المستقبلي.',
    boundary: 'حدود واضحة', attention: 'قيد الانتباه', treatment: 'قيد المعالجة', waiting: 'قيد الانتظار', done: 'مكتمل', allFilters: 'الكل',
    newProduct: 'منتج جديد', newAdjustment: 'تعديل جديد', newAction: 'إجراء جديد', workflow: 'سير العمل', processNow: 'ما يحتاج معالجة الآن',
    recentOrders: 'الطلبات الأخيرة', exportView: 'تصدير العرض', visualReference: 'مرجع مرئي', productsAvailability: 'المنتجات والتوفر',
    edit: 'تعديل', modulePreparing: 'الوحدة قيد التحضير', traceWork: 'تتبع العمل', localChecklist: 'قائمة محلية',
    readableFilters: 'مرشحات واضحة', explicitAudit: 'تدقيق واضح', noPersistence: 'لا يوجد حفظ', visibleRole: 'الدور ظاهر',
    staffRoles: 'المالك · المدير · مشغّل الطلبات · أمين الصندوق · مشغّل المستودع · المالية',
    sessionLocal: 'جلسة محلية / غير ملتزمة', newSale: 'بيع جديد', onlineVisual: 'متصل بصرياً', offlineDraft: 'مسودة محلية غير ملتزمة',
    searchOrScan: 'ابحث أو امسح…', registerCart: 'سلة نقطة البيع', noItems: 'لم تتم إضافة أي عناصر', draftVisual: 'المبيعات تبقى مسودات مرئية.',
    prepareTicket: 'تحضير الإيصال', shortcutSearch: 'بحث / مسح', shortcutAdd: 'إضافة عنصر', shortcutClear: 'مسح المسودة',
    cashSession: 'جلسة النقد', sessionOpen: 'جلسة مفتوحة محلياً', noCommit: 'لم يتم الالتزام بأي بيع أو إرساله.', actionLocal: 'إجراء محلي',
    localActionText: 'يعرض هذا النموذج حالة الواجهة والتحقق منها. لا يحفظ شيئاً ولا يشغل خدمة إنتاج.',
    label: 'التسمية', cancel: 'إلغاء', saveView: 'حفظ العرض', close: 'إغلاق', emptyReference: 'السلة بانتظار أول مرجع',
    loading: 'جارٍ التحميل', empty: 'فارغ', error: 'خطأ', stateReady: 'حالة جاهزة للربط', noRealAction: 'لا يوجد إجراء حقيقي',
    statusConfirm: 'بانتظار التأكيد', statusPreparing: 'قيد التحضير', statusShipped: 'تم الشحن', statusDelivered: 'تم التوصيل',
    statusOut: 'غير متوفر', statusWatch: 'تحت المراقبة', statusAvailable: 'متوفر', decreaseQuantity: 'إنقاص الكمية', increaseQuantity: 'زيادة الكمية',
     financeGross: 'الإيراد المعروض', financePending: 'التدفق المعلق', financeDelivered: 'تم توصيلها',
     sevenDayFixture: 'بيانات تجريبية · ٧ أيام', ordersFromFixture: 'طلبات من البيانات المحلية', deliveredFromFixture: 'طلب موصل من البيانات المحلية',
     financeLedger: 'السجل المرئي', financeReadout: 'قراءة الطلبات', financeBoundary: 'قراءة مبنية على الطلبات المحلية فقط. الهامش والتحصيل والمطابقة مسؤولية الخادم.',
     reportInventory: 'المخزون المرئي', reportCategoryReadout: 'التوفر حسب الفئة', reportAvailable: 'متوفر', reportUnits: 'وحدات',
     reportReadout: 'قراءة التشغيل', reportDecision: 'قرارات مبنية على المتاح.', reportOrders: 'الطلبات المحلية', reportCatalog: 'مراجع الكتالوج', reportBoundary: 'لا توجد نسب تحويل أو أرباح أو توقعات مختلقة في هذا التقرير.',
  },
} as const;

export type TranslationKey = keyof typeof dictionary.fr;
export type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export function createTranslator(lang: Lang): Translate {
  return (key, vars) => {
    let value: string = dictionary[lang][key] ?? dictionary.fr[key];
    if (vars) Object.entries(vars).forEach(([name, replacement]) => { value = value.replace(`{${name}}`, String(replacement)); });
    return value;
  };
}

export function productName(lang: Lang, name: string, arabicName: string) {
  return lang === 'ar' ? arabicName : name;
}

export function categoryName(lang: Lang, category: string) {
  if (lang === 'fr') return category;
  const values: Record<string, string> = { Protein: 'بروتين', Performance: 'أداء', Wellness: 'عافية', Accessories: 'إكسسوارات' };
  return values[category] ?? category;
}

export function orderDate(lang: Lang, value: string) {
  if (lang === 'fr') return value;
  return value
    .replace('Aujourd’hui', 'اليوم')
    .replace('Aujourd\'hui', 'اليوم')
    .replace('Hier', 'أمس');
}

export function statusText(lang: Lang, status: string, t: Translate) {
  if (status.includes('confirm')) return t('statusConfirm');
  if (status.includes('préparation')) return t('statusPreparing');
  if (status.includes('Expédi')) return t('statusShipped');
  if (status.includes('Livr')) return t('statusDelivered');
  if (status === 'Rupture') return t('statusOut');
  if (status.includes('surve')) return t('statusWatch');
  return t('statusAvailable');
}