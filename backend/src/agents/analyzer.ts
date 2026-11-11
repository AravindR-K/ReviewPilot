import { prisma } from '../index.js';
import { callClaudeJSON } from '../services/claude.js';
import { AnalyzerOutputSchema, type AnalyzerOutput } from '../schemas/agent-output.schema.js';

export async function processAnalyzer() {
  const reviews = await prisma.review.findMany({
    where: { status: 'collected' },
    take: 5,
    orderBy: { createdAt: 'asc' },
  });

  let processed = 0;

  for (const review of reviews) {
    try {
      const prompt = `Analyze this restaurant review and return a JSON response.

Review: "${review.reviewText}"
Rating: ${review.rating ? review.rating + '/5' : 'not provided'}
Language detected: ${review.language || 'en'}

Return ONLY valid JSON (no markdown, no explanation):
{
  "sentiment": "positive" | "neutral" | "negative",
  "topics": [...],
  "urgency": "normal" | "urgent",
  "urgency_reason": null | "food_poisoning" | "foreign_object" | "allergic_reaction" | "health_hazard"
}

Valid topics: "taste", "quantity", "delivery_time", "packaging", "price", "hygiene", "portion_size", "staff_behavior"

Rules:
- Detect sarcasm (e.g., "Wow, only 2 hours for delivery, amazing 👏" is NEGATIVE about delivery_time)
- Mixed reviews (good food + bad delivery) should be "neutral" sentiment with all relevant topics
- Any mention of food poisoning, foreign objects, insects, hair in food, allergic reactions = urgency "urgent"
- Consider the rating: 1-2 stars lean negative, 4-5 lean positive
- Always return at least one topic`;

      const result = await callClaudeJSON<AnalyzerOutput>(prompt, 'haiku');
      const validated = AnalyzerOutputSchema.parse(result);

      await prisma.review.update({
        where: { id: review.id },
        data: {
          status: 'analyzed',
          sentiment: validated.sentiment,
          topics: validated.topics,
          urgency: validated.urgency,
          urgencyReason: validated.urgency_reason,
        },
      });
      processed++;
    } catch (error) {
      console.error(`Analyzer error for review ${review.id}:`, error);
      // Don't block the pipeline — log and continue
      await prisma.agentStatus.update({
        where: { id: 'analyzer' },
        data: { lastError: String(error) },
      });
    }
  }

  if (processed > 0) {
    await prisma.agentStatus.update({
      where: { id: 'analyzer' },
      data: {
        lastRunAt: new Date(),
        processedCount: { increment: processed },
        lastError: null,
      },
    });
  }

  return processed;
}
