import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { CreateReviewSchema, ImportReviewsSchema, ApproveReviewSchema } from '../schemas/review.schema.js';
import { z } from 'zod';

function paramId(req: Request): string {
  return req.params.id as string;
}

export const reviewRoutes = Router();

// POST / — Create a new review
reviewRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = CreateReviewSchema.parse(req.body);

    const review = await prisma.review.create({
      data: {
        platform: parsed.platform,
        platformId: parsed.platformId || null,
        customerName: parsed.customerName,
        rating: parsed.rating ?? null,
        reviewText: parsed.reviewText,
        status: 'new_raw',
      },
    });

    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET / — List reviews with filters, search, and pagination
reviewRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const {
      status,
      sentiment,
      urgency,
      page = '1',
      limit = '20',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (sentiment) where.sentiment = sentiment;
    if (urgency) where.urgency = urgency;
    if (search) {
      where.reviewText = { contains: search, mode: 'insensitive' };
    }

    const allowedSortFields = ['createdAt', 'rating', 'updatedAt', 'customerName'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [safeSortBy]: safeSortOrder },
        include: { tasks: true },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      reviews,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error listing reviews:', error);
    res.status(500).json({ error: 'Failed to list reviews' });
  }
});

// GET /:id — Single review with tasks
reviewRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: { tasks: true },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// PATCH /:id/approve — Approve a drafted reply
reviewRoutes.patch('/:id/approve', async (req: Request, res: Response) => {
  try {
    const parsed = ApproveReviewSchema.parse(req.body);

    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.status !== 'reply_drafted') {
      res.status(400).json({ error: 'Review is not in reply_drafted status' });
      return;
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        status: 'reply_approved',
        replyApprovedBy: parsed.approvedBy,
        replyApprovedAt: new Date(),
        finalReply: review.draftReply,
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Failed to approve review' });
  }
});

// PATCH /:id/reject — Reject a drafted reply (re-queue for responder)
reviewRoutes.patch('/:id/reject', async (req: Request, res: Response) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.status !== 'reply_drafted') {
      res.status(400).json({ error: 'Review is not in reply_drafted status' });
      return;
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        status: 'analyzed',
        draftReply: null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ error: 'Failed to reject review' });
  }
});

// POST /import — Bulk import reviews
reviewRoutes.post('/import', async (req: Request, res: Response) => {
  try {
    const parsed = ImportReviewsSchema.parse(req.body);

    const created = await prisma.review.createMany({
      data: parsed.reviews.map(r => ({
        platform: r.platform,
        platformId: r.platformId || null,
        customerName: r.customerName,
        rating: r.rating ?? null,
        reviewText: r.reviewText,
        status: 'new_raw',
      })),
    });

    res.status(201).json({ count: created.count, message: `${created.count} reviews imported` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error importing reviews:', error);
    res.status(500).json({ error: 'Failed to import reviews' });
  }
});
