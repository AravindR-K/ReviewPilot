import { prisma } from '../index.js';

export async function isDuplicate(platformId: string | null | undefined, reviewText: string): Promise<boolean> {
  if (platformId) {
    const existing = await prisma.review.findFirst({
      where: { platformId, status: { not: 'duplicate' } },
    });
    if (existing) return true;
  }

  // Also check for exact text duplicates in last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const textDup = await prisma.review.findFirst({
    where: {
      reviewText,
      createdAt: { gte: oneDayAgo },
      status: { not: 'duplicate' },
    },
  });

  return !!textDup;
}
