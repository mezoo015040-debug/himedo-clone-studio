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
    return new URL(value).hostname.replace(/^www\./, '') || null;
  } catch {
    const cleaned = value
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0]
      .trim();

    return cleaned || null;
  }
};

export const getLandingDomain = (): string => {
  const existing = localStorage.getItem('landing_domain');
  if (existing) return existing;

  const domain = normalizeDomain(window.location.hostname) || window.location.hostname || 'غير معروف';
  localStorage.setItem('landing_domain', domain);
  return domain;
};

export const getVisitorContext = () => ({
  visitor_id: getOrCreateVisitorId(),
  landing_domain: getLandingDomain(),
});