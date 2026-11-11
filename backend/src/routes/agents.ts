import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { triggerAllAgents } from '../agents/worker.js';

export const agentRoutes = Router();

// GET / — List all agent statuses
agentRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const agents = await prisma.agentStatus.findMany({
      orderBy: { id: 'asc' },
    });
    res.json({ agents });
  } catch (error) {
    console.error('Error listing agents:', error);
    res.status(500).json({ error: 'Failed to list agent statuses' });
  }
});

// PATCH /:id/toggle — Toggle agent active status
agentRoutes.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const agent = await prisma.agentStatus.findUnique({
      where: { id: req.params.id },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    const updated = await prisma.agentStatus.update({
      where: { id: req.params.id },
      data: { isActive: !agent.isActive },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error toggling agent:', error);
    res.status(500).json({ error: 'Failed to toggle agent' });
  }
});

// POST /run-all — Manually trigger all active agents
agentRoutes.post('/run-all', async (_req: Request, res: Response) => {
  try {
    await triggerAllAgents();
    res.json({ message: 'All active agents triggered' });
  } catch (error) {
    console.error('Error triggering agents:', error);
    res.status(500).json({ error: 'Failed to trigger agents' });
  }
});
