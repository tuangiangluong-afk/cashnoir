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

export function updateAnalyticsConsent(granted: boolean) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cashnoir_consent', granted ? 'granted' : 'denied');
  } catch {}
  window.dataLayer = window.dataLayer || [];
  const fn = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof fn === 'function') {
    fn('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  } else {
    window.dataLayer.push(['consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' }] as unknown as Record<string, unknown>);
  }
}
