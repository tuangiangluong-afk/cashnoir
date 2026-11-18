// Tracking GTM / GA4 via window.dataLayer (G-5FRQL2KYFD via GTM-PD89CCNJ)

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export function trackPageView(page_path: string, page_title?: string) {
  trackEvent('page_view', { page_path, page_title: page_title || document.title });
}
