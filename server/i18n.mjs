// Messages d'erreur du serveur dans la langue du joueur (en-tête X-Game-Locale envoyé par le client).
// Les textes français d'origine restent la référence : une clé absente garde le français.
const E = {
  'Aucun deal validé par le serveur pour cette partie.': ['The server has not validated any deal for this run.', 'El servidor no ha validado ningún trato en esta partida.'],
  'Aucune négociation enregistrée pour ce contrat.': ['No negotiation recorded for this contract.', 'No hay ninguna negociación registrada para este contrato.'],
  'Authentification requise.': ['Authentication required.', 'Se requiere autenticación.'],
  'Ce ticket ne correspond pas à la journée en cours.': ['This ticket does not match the current day.', 'Este ticket no corresponde al día actual.'],
  'Cette session de paiement a déjà été utilisée.': ['This payment session has already been used.', 'Esta sesión de pago ya se ha utilizado.'],
  'Contrat quotidien déjà tenté aujourd’hui depuis cette connexion. Reviens demain.': ['Daily contract already attempted today from this connection. Come back tomorrow.', 'Contrato diario ya intentado hoy desde esta conexión. Vuelve mañana.'],
  'Conversation invalide.': ['Invalid conversation.', 'Conversación no válida.'],
  'Conversation trop longue.': ['Conversation too long.', 'Conversación demasiado larga.'],
  'Format de date invalide.': ['Invalid date format.', 'Formato de fecha no válido.'],
  'Fournisseur non supporté.': ['Unsupported provider.', 'Proveedor no compatible.'],
  'Gemini ne répond pas (délai dépassé). Réessaie dans un instant.': ['Gemini is not responding (timed out). Try again in a moment.', 'Gemini no responde (tiempo agotado). Inténtalo de nuevo en un momento.'],
  'Le quota Gemini est atteint pour le moment. Réessaie plus tard.': ['The Gemini quota is reached for now. Try again later.', 'Se ha alcanzado la cuota de Gemini por ahora. Inténtalo más tarde.'],
  'Identifiant utilisateur Google invalide.': ['Invalid Google user ID.', 'ID de usuario de Google no válido.'],
  'Impossible de lire le profil Google.': ['Could not read the Google profile.', 'No se pudo leer el perfil de Google.'],
  'OAuth Google non configuré.': ['Google sign-in is not configured.', 'El inicio de sesión de Google no está configurado.'],
  'Ollama injoignable sur 127.0.0.1:11434.': ['Ollama is unreachable on 127.0.0.1:11434.', 'Ollama no responde en 127.0.0.1:11434.'],
  'Origine non autorisée.': ['Origin not allowed.', 'Origen no permitido.'],
  'Origine requise et non autorisée.': ['Origin required and not allowed.', 'Origen requerido y no permitido.'],
  'Paiement non confirmé par Stripe.': ['Payment not confirmed by Stripe.', 'Pago no confirmado por Stripe.'],
  'Partie inconnue ou expirée. Recharge la page.': ['Unknown or expired run. Reload the page.', 'Partida desconocida o caducada. Recarga la página.'],
  'Payload Stripe illisible.': ['Unreadable Stripe payload.', 'Datos de Stripe ilegibles.'],
  'Prix incohérent avec la négociation enregistrée.': ['Price inconsistent with the recorded negotiation.', 'Precio incoherente con la negociación registrada.'],
  'Requête invalide.': ['Invalid request.', 'Solicitud no válida.'],
  'Route introuvable.': ['Route not found.', 'Ruta no encontrada.'],
  'SESSION_SECRET non configuré : Pass non émis.': ['SESSION_SECRET is not configured: Pass not issued.', 'SESSION_SECRET no está configurado: Pase no emitido.'],
  'SESSION_SECRET non configuré sur le serveur.': ['SESSION_SECRET is not configured on the server.', 'SESSION_SECRET no está configurado en el servidor.'],
  'STRIPE_WEBHOOK_SECRET non configuré.': ['STRIPE_WEBHOOK_SECRET is not configured.', 'STRIPE_WEBHOOK_SECRET no está configurado.'],
  'Score déjà envoyé pour cette partie.': ['Score already submitted for this run.', 'Puntuación ya enviada para esta partida.'],
  'Session Stripe invalide.': ['Invalid Stripe session.', 'Sesión de Stripe no válida.'],
  'Signature Stripe invalide.': ['Invalid Stripe signature.', 'Firma de Stripe no válida.'],
  'Stripe a refusé la création de la session.': ['Stripe refused to create the session.', 'Stripe rechazó crear la sesión.'],
  'Stripe non configuré.': ['Stripe is not configured.', 'Stripe no está configurado.'],
  'Ticket de run invalide. Recharge la page pour en obtenir un.': ['Invalid run ticket. Reload the page to get a new one.', 'Ticket de partida no válido. Recarga la página para obtener uno nuevo.'],
  'Ticket de run invalide.': ['Invalid run ticket.', 'Ticket de partida no válido.'],
  'Ticket expiré : le contrat a changé de journée.': ['Ticket expired: the contract has moved to a new day.', 'Ticket caducado: el contrato ha cambiado de día.'],
  'Transaction OAuth invalide ou expirée (anti-CSRF).': ['Invalid or expired OAuth transaction (anti-CSRF).', 'Transacción OAuth no válida o caducada (anti-CSRF).'],
  'Trop de requêtes. Ralentis le rythme.': ['Too many requests. Slow down.', 'Demasiadas solicitudes. Baja el ritmo.'],
  'Un deal a déjà été enregistré pour cette partie.': ['A deal has already been recorded for this run.', 'Ya se registró un trato en esta partida.'],
  'Échec échange OAuth Google.': ['Google OAuth exchange failed.', 'Falló el intercambio OAuth de Google.'],
};

const KEY_RE = /^([A-Z_]+_API_KEY) non configurée sur le serveur\.$/;
const DYN = [
  [/^Déjà (\d+) scores publiés aujourd'hui depuis cette connexion\.$/, (n) => [`Already ${n} scores published today from this connection.`, `Ya se publicaron ${n} puntuaciones hoy desde esta conexión.`]],
  [/^Quota gratuit atteint \((\d+) répliques\/jour\)\. Débloque le Pass Syndicat pour négocier en illimité\.$/, (n) => [`Free quota reached (${n} replies/day). Unlock the Syndicate Pass for unlimited negotiation.`, `Cuota gratuita alcanzada (${n} réplicas/día). Desbloquea el Pase del Sindicato para negociar sin límite.`]],
  [/^Quota quotidien atteint \((\d+) répliques\/jour\)\. Reviens demain\.$/, (n) => [`Daily quota reached (${n} replies/day). Come back tomorrow.`, `Cuota diaria alcanzada (${n} réplicas/día). Vuelve mañana.`]],
  [/^(Gemini|Groq|DeepSeek) a refusé la requête \((\d+)\)\.$/, (p, c) => [`${p} rejected the request (${c}).`, `${p} rechazó la solicitud (${c}).`]],
  [/^Ollama a répondu (\d+)\.$/, (c) => [`Ollama answered ${c}.`, `Ollama respondió ${c}.`]],
  [/^Modèle non autorisé\. Autorisés : (.*)$/, (l) => [`Model not allowed. Allowed: ${l}`, `Modelo no permitido. Permitidos: ${l}`]],
];

/** Traduit un message d'erreur du serveur (fr → en/es) ; renvoie le texte d'origine si la langue est fr ou le message inconnu. */
export function localizeServerError(message, locale) {
  if (locale !== 'en' && locale !== 'es') return message;
  const i = locale === 'en' ? 0 : 1;
  if (E[message]) return E[message][i];
  const k = KEY_RE.exec(message);
  if (k) return locale === 'en' ? `${k[1]} is not configured on the server.` : `${k[1]} no está configurada en el servidor.`;
  for (const [re, fn] of DYN) {
    const m = re.exec(message);
    if (m) return fn(...m.slice(1))[i];
  }
  return message;
}

/** Langue demandée par le client (en-tête X-Game-Locale), limitée à fr/en/es. */
export function requestLocale(req) {
  const h = String(req.headers['x-game-locale'] || '').slice(0, 2).toLowerCase();
  return h === 'en' || h === 'es' ? h : 'fr';
}
