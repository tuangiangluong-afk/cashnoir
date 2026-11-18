// Abonnement Pass lié au compte Google (et non plus à un cookie) : l'état vient des événements Stripe.
const DAY = 24 * 3600 * 1000;
const GRACE = 2 * DAY; // marge pour un renouvellement légèrement en retard

export const passKey = (uid) => `pass:${uid}`;
export const subKey = (subId) => `sub:${subId}`;
export const isActive = (rec, now = Date.now()) => Boolean(rec && rec.until > now);

const subIdOf = (o) => o?.subscription || o?.parent?.subscription_details?.subscription || (o?.object === 'subscription' ? o.id : '') || '';

/** Applique un événement Stripe sur le magasin { get, set }. Renvoie { uid, rec } si un abonnement a changé, sinon null. */
export async function applyStripeEvent(event, store, now = Date.now()) {
  const o = event?.data?.object;
  if (!o) return null;
  const save = async (uid, patch) => {
    const rec = { ...((await store.get(passKey(uid))) || {}), ...patch };
    await store.set(passKey(uid), rec);
    return { uid, rec };
  };
  if (event.type === 'checkout.session.completed') {
    const uid = String(o.client_reference_id || o.metadata?.uid || '');
    const paid = o.payment_status === 'paid' || (o.mode === 'subscription' && o.status === 'complete');
    if (!uid || !paid) return null;
    if (o.subscription) await store.set(subKey(o.subscription), { uid });
    return save(uid, { until: now + (o.mode === 'subscription' ? 33 * DAY : 30 * DAY), sub: o.subscription || null, customer: o.customer || null, status: 'active' });
  }
  const sub = subIdOf(o);
  const link = sub ? await store.get(subKey(sub)) : null;
  const uid = link?.uid || String(o.metadata?.uid || '');
  if (!uid) return null;
  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
    const end = (o.lines?.data?.[0]?.period?.end || 0) * 1000;
    return save(uid, { until: (end > now ? end : now + 32 * DAY) + GRACE, status: 'active' });
  }
  if (event.type === 'customer.subscription.deleted') return save(uid, { until: now, status: 'canceled' });
  if (event.type === 'customer.subscription.updated') {
    if (['canceled', 'unpaid', 'incomplete_expired'].includes(o.status)) return save(uid, { until: now, status: o.status });
    // Résiliation programmée : l'accès court jusqu'à la fin de la période déjà payée.
    if (o.cancel_at_period_end) {
      const end = (o.current_period_end || o.items?.data?.[0]?.current_period_end || 0) * 1000;
      if (end > 0) return save(uid, { until: end, status: 'canceling' });
    }
  }
  return null;
}
