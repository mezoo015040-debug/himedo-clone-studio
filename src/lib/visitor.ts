export const getOrCreateVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');

  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('visitor_id', visitorId);
  }

  return visitorId;
};

export const normalizeDomain = (value?: string | null): string | null => {
  if (!value) return null;

  try {
    const hostname = new URL(value).hostname.replace(/^www\./, '').trim();
    return hostname && hostname !== 'undefined' && hostname !== 'null' ? hostname : null;
  } catch {
    const cleaned = value
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0]
      .trim();

    return cleaned && cleaned !== 'undefined' && cleaned !== 'null' ? cleaned : null;
  }
};

export const getLandingDomain = (): string => {
  const existing = localStorage.getItem('landing_domain');
  const normalizedExisting = normalizeDomain(existing);
  if (normalizedExisting) {
    localStorage.setItem('landing_domain', normalizedExisting);
    return normalizedExisting;
  }
  localStorage.removeItem('landing_domain');

  const domain =
    normalizeDomain(window.location.hostname) ||
    normalizeDomain(window.location.host) ||
    normalizeDomain(window.location.href) ||
    'غير معروف';
  localStorage.setItem('landing_domain', domain);
  return domain;
};

export const getVisitorContext = () => ({
  visitor_id: getOrCreateVisitorId(),
  landing_domain: getLandingDomain(),
});