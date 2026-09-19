export type Product = {
  id: string;
  name: string;
  arabicName: string;
  /** Optional approved merchant media. Keep unset until an asset is supplied. */
  media?: string;
  mediaAlt?: string;
  mediaSource?: 'reference' | 'merchant';
  category: string;
  format: string;
  price: number;
  stock: number;
  tone: string;
  detail: string;
  tags: string[];
};

export const products: Product[] = [
  { id: 'whey-01', name: 'Whey isolate / vanilla', arabicName: 'واي معزول / فانيلا', media: '/product-media/whey-isolate-vanilla.jpg', mediaAlt: 'Public reference photo of a protein supplement container; Plazza merchant packaging to be confirmed.', mediaSource: 'reference', category: 'Protein', format: '1 kg · visual fixture', price: 8900, stock: 14, tone: 'orange', detail: 'A representative catalog fixture for a clean, everyday protein routine.', tags: ['protein', 'recovery'] },
  { id: 'creatine-02', name: 'Creatine monohydrate', arabicName: 'كرياتين مونوهيدرات', media: '/product-media/creatine-monohydrate.jpg', mediaAlt: 'Public reference photo of creatine monohydrate; Plazza merchant packaging to be confirmed.', mediaSource: 'reference', category: 'Performance', format: '300 g · visual fixture', price: 5400, stock: 8, tone: 'ink', detail: 'A representative catalog fixture for strength and training consistency.', tags: ['creatine', 'strength'] },
  { id: 'pre-03', name: 'Pre-workout / citrus', arabicName: 'بري ووركاوت / حمضيات', media: '/product-media/pre-workout-citrus.jpg', mediaAlt: 'Public reference photo of a pre-workout supplement container; Plazza merchant packaging to be confirmed.', mediaSource: 'reference', category: 'Performance', format: '30 servings · visual fixture', price: 6200, stock: 3, tone: 'lime', detail: 'A representative catalog fixture. Claims and formulation require merchant input.', tags: ['energy', 'training'] },
  { id: 'multi-04', name: 'Daily essentials', arabicName: 'الأساسيات اليومية', media: '/product-media/daily-essentials.jpg', mediaAlt: 'Public reference photo of vitamin supplements; Plazza merchant packaging to be confirmed.', mediaSource: 'reference', category: 'Wellness', format: '60 capsules · visual fixture', price: 3200, stock: 0, tone: 'blue', detail: 'A representative catalog fixture for the wellness category.', tags: ['vitamins', 'wellness'] },
  { id: 'mass-05', name: 'Mass routine / chocolate', arabicName: 'روتين الكتلة / شوكولاتة', media: '/product-media/mass-routine-chocolate.jpg', mediaAlt: 'Public reference photo of protein powder; Plazza merchant packaging to be confirmed.', mediaSource: 'reference', category: 'Protein', format: '2 kg · visual fixture', price: 9700, stock: 21, tone: 'amber', detail: 'A representative catalog fixture for a higher-calorie routine.', tags: ['mass', 'protein'] },
  { id: 'shaker-06', name: 'Steel shaker', arabicName: 'شيكر فولاذي', media: '/product-media/steel-shaker.jpg', mediaAlt: 'Public reference photo of a protein shaker; Plazza merchant material specification to be confirmed.', mediaSource: 'reference', category: 'Accessories', format: '700 ml · visual fixture', price: 1800, stock: 36, tone: 'paper', detail: 'A representative accessory visual fixture; final material specs pending.', tags: ['accessory'] },
];

export const opsStats = [
  { label: 'COD à confirmer', value: '18', note: '+4 depuis 08:00', color: 'orange' },
  { label: 'Préparation', value: '11', note: '3 urgentes', color: 'lime' },
  { label: 'Chiffre visuel', value: '286 400 DA', note: 'fixture · 7 jours', color: 'blue' },
  { label: 'Stock à surveiller', value: '06', note: '2 ruptures', color: 'amber' },
];

export const orders = [
  { id: 'PN-1048', customer: 'Nadia B.', city: 'Oran', total: '14 300 DA', status: 'À confirmer', date: 'Aujourd’hui, 10:42', items: 2 },
  { id: 'PN-1047', customer: 'Yanis K.', city: 'Alger', total: '8 900 DA', status: 'En préparation', date: 'Aujourd’hui, 09:18', items: 1 },
  { id: 'PN-1046', customer: 'Amel S.', city: 'Blida', total: '5 400 DA', status: 'Expédiée', date: 'Hier, 17:06', items: 1 },
  { id: 'PN-1045', customer: 'Karim M.', city: 'Sétif', total: '11 600 DA', status: 'Livrée', date: 'Hier, 13:26', items: 2 },
];

/** Local order snapshots keep the customer detail view internally consistent until server data arrives. */
export const orderProductIds: Record<string, string[]> = {
  'PN-1048': ['whey-01', 'creatine-02'],
  'PN-1047': ['whey-01'],
  'PN-1046': ['creatine-02'],
  'PN-1045': ['creatine-02', 'pre-03'],
};

export const fixtureNotice = 'Interface de démonstration · données visuelles locales · aucune action ne crée un enregistrement réel';

export function formatDa(value: number) {
  return `${new Intl.NumberFormat('fr-DZ').format(value)} DA`;
}