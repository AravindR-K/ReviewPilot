import { prisma } from '../index.js';
import { callClaude } from '../services/claude.js';
import { config } from '../config.js';

export async function processInsights(periodDays: number = 7) {
  const periodEnd = new Date();
  const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  // Gather data
  const reviews = await prisma.review.findMany({
    where: {
      createdAt: { gte: periodStart, lte: periodEnd },
      status: { notIn: ['spam', 'duplicate', 'new_raw'] },
    },
  });

  if (reviews.length === 0) {
    return null;
  }

  const totalReviews = reviews.length;
  const ratingsArr = reviews.filter(r => r.rating !== null).map(r => r.rating!);
  const avgRating = ratingsArr.length > 0 ? ratingsArr.reduce((a, b) => a + b, 0) / ratingsArr.length : null;

  // Sentiment breakdown
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  reviews.forEach(r => {
    if (r.sentiment && r.sentiment in sentimentCounts) {
      sentimentCounts[r.sentiment as keyof typeof sentimentCounts]++;
    }
  });

  // Topic frequency for negative reviews
  const topicCounts: Record<string, { count: number; examples: string[] }> = {};
  const praiseCounts: Record<string, { count: number; examples: string[] }> = {};

  reviews.forEach(r => {
    const topics = Array.isArray(r.topics) ? (r.topics as string[]) : [];
    topics.forEach(topic => {
      if (r.sentiment === 'negative' || r.sentiment === 'neutral') {
        if (!topicCounts[topic]) topicCounts[topic] = { count: 0, examples: [] };
        topicCounts[topic].count++;
        if (topicCounts[topic].examples.length < 3) {
          topicCounts[topic].examples.push(r.reviewText.substring(0, 100));
        }
      }
      if (r.sentiment === 'positive') {
        if (!praiseCounts[topic]) praiseCounts[topic] = { count: 0, examples: [] };
        praiseCounts[topic].count++;
        if (praiseCounts[topic].examples.length < 3) {
          praiseCounts[topic].examples.push(r.reviewText.substring(0, 100));
        }
      }
    });
  });

  const topComplaints = Object.entries(topicCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([topic, data]) => ({ topic, ...data }));

  const topPraises = Object.entries(praiseCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([topic, data]) => ({ topic, ...data }));

  const urgentCount = reviews.filter(r => r.urgency === 'urgent').length;

  // Check previous period for trend
  const prevPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const prevReviews = await prisma.review.findMany({
    where: {
      createdAt: { gte: prevPeriodStart, lt: periodStart },
      status: { notIn: ['spam', 'duplicate', 'new_raw'] },
    },
  });
  const prevRatings = prevReviews.filter(r => r.rating !== null).map(r => r.rating!);
  const prevAvg = prevRatings.length > 0 ? prevRatings.reduce((a, b) => a + b, 0) / prevRatings.length : null;

  let ratingTrend = 'stable';
  if (avgRating !== null && prevAvg !== null) {
    if (avgRating > prevAvg + 0.2) ratingTrend = 'improving';
    else if (avgRating < prevAvg - 0.2) ratingTrend = 'declining';
  }

  // Generate report with Claude Sonnet
  const prompt = `You are a restaurant business analyst. Write a concise weekly report for the owner of "${config.restaurantName}".

Data for ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}:
- Total reviews: ${totalReviews}
- Average rating: ${avgRating !== null ? avgRating.toFixed(1) : 'N/A'}/5
- Rating trend vs last period: ${ratingTrend}
- Sentiment: ${sentimentCounts.positive} positive, ${sentimentCounts.neutral} neutral, ${sentimentCounts.negative} negative
- Top complaint topics: ${JSON.stringify(topComplaints)}
- Top praised topics: ${JSON.stringify(topPraises)}
- Urgent incidents: ${urgentCount}

Write the report in this EXACT markdown format:

## Weekly Review Report — ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}

### 📊 Overview
(2-3 sentences summary with key numbers)

### 🔴 Top 3 Complaints
(numbered list with counts and one example quote each)

### 🟢 Top 3 Praised Aspects
(numbered list with counts and one example quote each)

### 💡 Suggested Improvement
(one specific, actionable recommendation based on the data)

### ⚠️ Urgent Matters
(list any urgent incidents, or "No urgent incidents this period.")`;

  const fullReport = await callClaude(prompt, 'sonnet');

  // Save to database
  const report = await prisma.insightReport.create({
    data: {
      periodStart,
      periodEnd,
      totalReviews,
      avgRating,
      ratingTrend,
      topComplaints,
      topPraises,
      sentimentBreakdown: sentimentCounts,
      suggestedAction: topComplaints.length > 0
        ? `Focus on improving ${topComplaints[0].topic.replace(/_/g, ' ')} — it's the most frequent complaint.`
        : 'All looking good! Keep up the quality.',
      fullReport,
    },
  });

  await prisma.agentStatus.update({
    where: { id: 'insights' },
    data: {
      lastRunAt: new Date(),
      processedCount: { increment: 1 },
      lastError: null,
    },
  });

  return report;
}
