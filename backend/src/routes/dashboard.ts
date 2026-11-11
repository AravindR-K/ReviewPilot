import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';

export const dashboardRoutes = Router();

// GET /stats — Aggregated dashboard statistics
dashboardRoutes.get('/stats', async (_req: Request, res: Response) => {
  try {
    // Total reviews
    const totalReviews = await prisma.review.count();

    // Average rating (only reviews with ratings)
    const ratingAgg = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { rating: { not: null } },
    });
    const avgRating = ratingAgg._avg.rating ? parseFloat(ratingAgg._avg.rating.toFixed(2)) : null;

    // Pending approvals (reply_drafted status)
    const pendingApprovals = await prisma.review.count({
      where: { status: 'reply_drafted' },
    });

    // Open tasks
    const openTasks = await prisma.task.count({
      where: { status: { not: 'done' } },
    });

    // Sentiment breakdown
    const [positiveCount, neutralCount, negativeCount] = await Promise.all([
      prisma.review.count({ where: { sentiment: 'positive' } }),
      prisma.review.count({ where: { sentiment: 'neutral' } }),
      prisma.review.count({ where: { sentiment: 'negative' } }),
    ]);
    const sentimentBreakdown = {
      positive: positiveCount,
      neutral: neutralCount,
      negative: negativeCount,
    };

    // Rating distribution
    const ratingDistribution = await Promise.all(
      [1, 2, 3, 4, 5].map(async (rating) => ({
        rating,
        count: await prisma.review.count({ where: { rating } }),
      })),
    );

    // Recent reviews (last 10)
    const recentReviewsRaw = await prisma.review.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        rating: true,
        reviewText: true,
        sentiment: true,
        status: true,
        createdAt: true,
      },
    });
    const recentReviews = recentReviewsRaw.map(r => ({
      ...r,
      reviewText: r.reviewText.length > 100 ? r.reviewText.substring(0, 100) + '...' : r.reviewText,
    }));

    // Top topics from negative reviews in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const negativeReviews = await prisma.review.findMany({
      where: {
        sentiment: 'negative',
        createdAt: { gte: thirtyDaysAgo },
        topics: { not: null },
      },
      select: { topics: true },
    });

    const topicFrequency: Record<string, number> = {};
    for (const review of negativeReviews) {
      const topics = Array.isArray(review.topics) ? (review.topics as string[]) : [];
      for (const topic of topics) {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      }
    }
    const topTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic: topic.replace(/_/g, ' '), count }));

    res.json({
      totalReviews,
      avgRating,
      pendingApprovals,
      openTasks,
      sentimentBreakdown,
      ratingDistribution,
      recentReviews,
      topTopics,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});
