// Funil de eventos Meta Pixel (framework FOP).
// A inicialização do pixel e o external_id vivem em src/components/MetaPixel.astro.
//
// Escada de eventos nesta página:
//   PageView        -> load (disparado no HEAD)
//   ViewContent     -> scroll 25% | 10s | play do vídeo
//   AddToWishlist   -> scroll 50% | 30s | 50% do vídeo assistido
//   InitiateCheckout-> clique em qualquer CTA da Hotmart
//   AddPaymentInfo / Purchase -> vêm da Hotmart, não daqui.

const PRODUCT = {
  content_name: 'Guia Clínico de Complicações na HOF',
  content_category: 'E-book / Harmonização Orofacial',
  content_type: 'product',
  content_ids: ['ebook-hof-guia-clinico'],
};

const PRICE = { value: 69.9, currency: 'BRL' };

type Win = Window & {
  fbq?: (...args: unknown[]) => void;
  __fopEventId?: () => string;
};

const w = window as Win;
const fired = new Set<string>();

function track(event: string, params: Record<string, unknown> = {}) {
  if (fired.has(event)) return;
  fired.add(event);
  if (typeof w.fbq !== 'function') return;
  const eventID = w.__fopEventId ? w.__fopEventId() : undefined;
  w.fbq('track', event, { ...PRODUCT, ...params }, eventID ? { eventID } : undefined);
}

const viewContent = () => track('ViewContent');
const addToWishlist = () => track('AddToWishlist', PRICE);

// --- Scroll depth -----------------------------------------------------------
function scrollDepth() {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 100;
  return ((window.scrollY || doc.scrollTop) / scrollable) * 100;
}

function onScroll() {
  const depth = scrollDepth();
  if (depth >= 25) viewContent();
  if (depth >= 50) addToWishlist();
  if (fired.has('ViewContent') && fired.has('AddToWishlist')) {
    window.removeEventListener('scroll', onScroll);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // páginas curtas / carregadas já roladas

// --- Tempo na página --------------------------------------------------------
const timers = [
  window.setTimeout(viewContent, 10_000),
  window.setTimeout(addToWishlist, 30_000),
];
window.addEventListener('pagehide', () => timers.forEach(clearTimeout), { once: true });

// --- Vídeo (VSL) ------------------------------------------------------------
const video = document.querySelector<HTMLVideoElement>('#video video');
if (video) {
  video.addEventListener('play', viewContent, { once: true });
  video.addEventListener('timeupdate', function onProgress() {
    if (!video.duration || !isFinite(video.duration)) return;
    if (video.currentTime / video.duration >= 0.5) {
      addToWishlist();
      video.removeEventListener('timeupdate', onProgress);
    }
  });
}

// --- CTA -> checkout Hotmart ------------------------------------------------
// Todos os CTAs são <a href="https://pay.hotmart.com/...">, então um único
// listener delegado cobre hero, PriceCard, CTA final e o sticky do mobile.
document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  const link = target?.closest?.('a[href*="pay.hotmart.com"]');
  if (!link) return;
  track('InitiateCheckout', PRICE);
});
