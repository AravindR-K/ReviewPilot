import { prisma } from '../index.js';
import { callClaude } from '../services/claude.js';
import { config } from '../config.js';

export async function processResponder() {
  const reviews = await prisma.review.findMany({
    where: { status: 'analyzed' },
    take: 5,
    orderBy: { createdAt: 'asc' },
  });

  let processed = 0;

  for (const review of reviews) {
    try {
      const topics = Array.isArray(review.topics) ? (review.topics as string[]).join(', ') : 'general';

      const prompt = `You are the owner of "${config.restaurantName}", a popular ${config.restaurantType}.
Your brand voice: warm, apologetic when needed, proud of your food, always offer to make it right.

Write a reply to this customer review.

Customer: ${review.customerName}
Review: "${review.reviewText}"
Sentiment: ${review.sentiment}
Topics: ${topics}
Language detected: ${review.language || 'en'}
Urgency: ${review.urgency || 'normal'}

Rules:
- Reply in the SAME language as the review. If Tanglish, reply in Tanglish. If Tamil, reply in Tamil. If Hindi, reply in Hindi.
- Keep it under 100 words.
- If negative: apologize specifically for the issue mentioned, offer to make it right (e.g., free meal, discount).
- If positive: thank them warmly, mention the specific dish or aspect they praised.
- If neutral/mixed: acknowledge both the good and bad, promise improvement on the negatives.
- If urgent (food safety): be extremely apologetic, promise immediate investigation, offer full refund.
- Never be defensive or argumentative.
- Sound human, not corporate.
- Do NOT include any prefix like "Reply:" — just write the reply directly.`;

      const reply = await callClaude(prompt, 'sonnet');
      const cleanReply = reply.replace(/^(Reply|Response|Dear customer):\s*/i, '').trim();

      // Auto-send positive non-urgent reviews, queue negative/urgent for approval
      const autoSend = review.sentiment === 'positive' && review.urgency === 'normal';

      await prisma.review.update({
        where: { id: review.id },
        data: {
          status: autoSend ? 'reply_auto_sent' : 'reply_drafted',
          draftReply: cleanReply,
          replyLanguage: review.language,
          finalReply: autoSend ? cleanReply : null,
        },
      });
      processed++;
    } catch (error) {
      console.error(`Responder error for review ${review.id}:`, error);
      await prisma.agentStatus.update({
        where: { id: 'responder' },
        data: { lastError: String(error) },
      });
    }
  }

  if (processed > 0) {
    await prisma.agentStatus.update({
      where: { id: 'responder' },
      data: {
        lastRunAt: new Date(),
        processedCount: { increment: processed },
        lastError: null,
      },
    });
  }

  return processed;
}
