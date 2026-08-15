// Parameter validation helper to prevent malicious Cypher parameter injections

export function sanitizeCveId(cveInput?: string | null): string {
  if (!cveInput) return 'CVE-2021-44228';
  const cleaned = cveInput.trim().toUpperCase();
  // Standard CVE format: CVE-YYYY-NNNN+
  if (/^CVE-\d{4}-\d{4,7}$/.test(cleaned)) {
    return cleaned;
  }
  // Sanitize alphanumeric + dash
  return cleaned.replace(/[^A-Z0-9-]/g, '').slice(0, 25) || 'CVE-2021-44228';
}

export function sanitizeStringParam(paramInput?: string | null, fallback = ''): string {
  if (!paramInput) return fallback;
  return paramInput.trim().replace(/[<>'"/]/g, '').slice(0, 100);
}
