export function isSpam(text: string): boolean {
  const spamPatterns = [
    /https?:\/\/\S+/i,           // URLs
    /www\.\S+/i,                  // www links
    /\b(buy|cheap|discount|offer|click here|subscribe)\b/i,
    /(\+?\d{10,})/,              // Phone numbers
    /(.)\1{5,}/,                  // Repeated characters (aaaaaaa)
    /[A-Z\s]{20,}/,              // Long ALL CAPS stretches
  ];

  const matchCount = spamPatterns.filter(p => p.test(text)).length;

  // If text is very short (< 3 words) with no real content
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 3 && !/[⭐🌟👍👎😊😡]/.test(text)) {
    return true;
  }

  return matchCount >= 2; // Match 2+ spam patterns = spam
}
