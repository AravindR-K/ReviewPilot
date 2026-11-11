import { prisma } from '../index.js';

const TOPIC_TEAM_MAP: Record<string, string> = {
  taste: 'kitchen',
  quantity: 'kitchen',
  portion_size: 'kitchen',
  hygiene: 'kitchen',
  delivery_time: 'delivery',
  packaging: 'packaging',
  price: 'management',
  staff_behavior: 'management',
};

export async function processAction() {
  // Find analyzed negative/neutral reviews that don't have tasks yet
  const reviews = await prisma.review.findMany({
    where: {
      status: { in: ['analyzed', 'reply_drafted', 'reply_auto_sent', 'reply_approved'] },
      sentiment: { in: ['negative', 'neutral'] },
      tasks: { none: {} },
    },
    take: 10,
    orderBy: { createdAt: 'asc' },
  });

  let processed = 0;

  for (const review of reviews) {
    try {
      const topics = Array.isArray(review.topics) ? (review.topics as string[]) : [];

      for (const topic of topics) {
        const team = TOPIC_TEAM_MAP[topic] || 'management';
        const priority = review.urgency === 'urgent' ? 'urgent' : review.sentiment === 'negative' ? 'high' : 'normal';

        // Check for similar recent tasks (grouping)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const similarTasks = await prisma.task.count({
          where: {
            team,
            title: { contains: topic.replace('_', ' ') },
            createdAt: { gte: sevenDaysAgo },
            status: { not: 'done' },
          },
        });

        const topicLabel = topic.replace(/_/g, ' ');
        const title = similarTasks >= 3
          ? `${similarTasks + 1} complaints about ${topicLabel} this week`
          : `Complaint: ${topicLabel}`;

        const description = `Customer "${review.customerName}" reported an issue with ${topicLabel}.\n\nOriginal review: "${review.reviewText.substring(0, 200)}${review.reviewText.length > 200 ? '...' : ''}"${similarTasks >= 3 ? `\n\n⚠️ This is a recurring issue — ${similarTasks + 1} similar complaints this week.` : ''}`;

        await prisma.task.create({
          data: {
            reviewId: review.id,
            team,
            title,
            description,
            priority,
          },
        });
      }
      processed++;
    } catch (error) {
      console.error(`Action error for review ${review.id}:`, error);
    }
  }

  if (processed > 0) {
    await prisma.agentStatus.update({
      where: { id: 'action' },
      data: {
        lastRunAt: new Date(),
        processedCount: { increment: processed },
        lastError: null,
      },
    });
  }

  return processed;
}
