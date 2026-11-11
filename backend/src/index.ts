import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { PrismaClient } from '@prisma/client';
import { reviewRoutes } from './routes/reviews.js';
import { taskRoutes } from './routes/tasks.js';
import { insightRoutes } from './routes/insights.js';
import { agentRoutes } from './routes/agents.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { startWorkers } from './agents/worker.js';

export const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

async function initializeAgentStatuses() {
  const agentIds = ['collector', 'analyzer', 'responder', 'action', 'insights'];
  for (const id of agentIds) {
    await prisma.agentStatus.upsert({
      where: { id },
      update: {},
      create: { id, isActive: true, processedCount: 0 },
    });
  }
}

async function main() {
  await initializeAgentStatuses();
  await startWorkers();
  app.listen(config.port, () => {
    console.log(`🚀 ReviewPilot backend running on http://localhost:${config.port}`);
  });
}

main().catch(console.error);
