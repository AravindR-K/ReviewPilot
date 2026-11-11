import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { UpdateTaskSchema } from '../schemas/task.schema.js';
import { z } from 'zod';

export const taskRoutes = Router();

// GET /summary — Complaint counts grouped by team and topic (last 7 days)
// NOTE: This must come BEFORE /:id to avoid route conflict
taskRoutes.get('/summary', async (_req: Request, res: Response) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        team: true,
        title: true,
        priority: true,
        status: true,
      },
    });

    const summary: Record<string, { total: number; open: number; topics: Record<string, number> }> = {};

    for (const task of tasks) {
      if (!summary[task.team]) {
        summary[task.team] = { total: 0, open: 0, topics: {} };
      }
      summary[task.team].total++;
      if (task.status !== 'done') {
        summary[task.team].open++;
      }

      // Extract topic from title like "Complaint: delivery time" or "4 complaints about delivery time this week"
      const topicMatch = task.title.match(/Complaint:\s*(.+)/i) || task.title.match(/complaints? about (.+?) this week/i);
      const topic = topicMatch ? topicMatch[1].trim() : 'other';
      summary[task.team].topics[topic] = (summary[task.team].topics[topic] || 0) + 1;
    }

    res.json({ summary, period: '7 days' });
  } catch (error) {
    console.error('Error fetching task summary:', error);
    res.status(500).json({ error: 'Failed to fetch task summary' });
  }
});

// GET / — List tasks with filters
taskRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const { team, status, priority, grouped } = req.query as Record<string, string>;

    const where: any = {};
    if (team) where.team = team;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        review: {
          select: {
            id: true,
            customerName: true,
            reviewText: true,
            rating: true,
          },
        },
      },
    });

    if (grouped === 'true') {
      const groupedTasks: Record<string, typeof tasks> = {};
      for (const task of tasks) {
        if (!groupedTasks[task.team]) {
          groupedTasks[task.team] = [];
        }
        groupedTasks[task.team].push(task);
      }
      res.json({ tasks: groupedTasks, grouped: true });
      return;
    }

    res.json({ tasks });
  } catch (error) {
    console.error('Error listing tasks:', error);
    res.status(500).json({ error: 'Failed to list tasks' });
  }
});

// PATCH /:id — Update task status
taskRoutes.patch('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = UpdateTaskSchema.parse(req.body);

    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { status: parsed.status },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});
