const cache = new Map<number, Intl.NumberFormat>();

export function formatValue(value: number | null, precision: number): string {
  if (value === null) return "";
  let nf = cache.get(precision);
  if (!nf) {
    nf = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    cache.set(precision, nf);
  }
  // Intl uses a narrow no-break space as thousands separator; keep it as-is.
  return nf.format(value);
}
