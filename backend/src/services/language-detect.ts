export function detectLanguage(text: string): string {
  const tamilRange = /[\u0B80-\u0BFF]/;
  const devanagariRange = /[\u0900-\u097F]/;

  const hasTamil = tamilRange.test(text);
  const hasDevanagari = devanagariRange.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);

  if (hasTamil && hasLatin) return 'tanglish';
  if (hasTamil) return 'ta';
  if (hasDevanagari && hasLatin) return 'hinglish';
  if (hasDevanagari) return 'hi';
  return 'en';
}
