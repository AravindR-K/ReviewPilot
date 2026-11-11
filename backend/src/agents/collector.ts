import { prisma } from '../index.js';
import { detectLanguage } from '../services/language-detect.js';
import { isSpam } from '../utils/spam-detector.js';
import { isDuplicate } from '../utils/dedup.js';

export async function processCollector() {
  const reviews = await prisma.review.findMany({
    where: { status: 'new_raw' },
    take: 10,
    orderBy: { createdAt: 'asc' },
  });

  let processed = 0;

  for (const review of reviews) {
    try {
      // Check duplicate
      const dup = await isDuplicate(review.platformId, review.reviewText);
      if (dup) {
        await prisma.review.update({
          where: { id: review.id },
          data: { status: 'duplicate', isDuplicate: true },
        });
        processed++;
        continue;
      }

      // Check spam
      if (isSpam(review.reviewText)) {
        await prisma.review.update({
          where: { id: review.id },
          data: { status: 'spam', isSpam: true },
        });
        processed++;
        continue;
      }

      // Detect language
      const language = detectLanguage(review.reviewText);

      await prisma.review.update({
        where: { id: review.id },
        data: { status: 'collected', language },
      });
      processed++;
    } catch (error) {
      console.error(`Collector error for review ${review.id}:`, error);
    }
  }

  // Update agent status
  if (processed > 0) {
    await prisma.agentStatus.update({
      where: { id: 'collector' },
      data: {
        lastRunAt: new Date(),
        processedCount: { increment: processed },
        lastError: null,
      },
    });
  }

  return processed;
}
