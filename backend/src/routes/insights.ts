import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { triggerInsights } from '../agents/worker.js';
import { z } from 'zod';

export const insightRoutes = Router();

const GenerateInsightsSchema = z.object({
  periodDays: z.number().int().min(1).max(90).optional().default(7),
});

// POST /generate — Trigger insights generation via pg-boss
insightRoutes.post('/generate', async (req: Request, res: Response) => {
  try {
    const parsed = GenerateInsightsSchema.parse(req.body || {});
    await triggerInsights(parsed.periodDays);
    res.json({ message: 'Report generation started', periodDays: parsed.periodDays });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error triggering insights:', error);
    res.status(500).json({ error: 'Failed to trigger insights generation' });
  }
});

// GET / — List all reports, newest first
insightRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const reports = await prisma.insightReport.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reports });
  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

// GET /:id — Single report
insightRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const report = await prisma.insightReport.findUnique({
      where: { id: req.params.id },
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});
