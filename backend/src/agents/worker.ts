import PgBoss from 'pg-boss';
import { config } from '../config.js';
import { prisma } from '../index.js';
import { processCollector } from './collector.js';
import { processAnalyzer } from './analyzer.js';
import { processResponder } from './responder.js';
import { processAction } from './action.js';
import { processInsights } from './insights.js';

let boss: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (!boss) {
    boss = new PgBoss(config.databaseUrl);
    boss.on('error', (error) => console.error('pg-boss error:', error));
    await boss.start();
    console.log('📋 pg-boss started');
  }
  return boss;
}

async function isAgentActive(agentId: string): Promise<boolean> {
  const agent = await prisma.agentStatus.findUnique({ where: { id: agentId } });
  return agent?.isActive ?? true;
}

async function runAgent(agentId: string, fn: () => Promise<any>) {
  try {
    if (await isAgentActive(agentId)) {
      await fn();
    }
  } catch (error) {
    console.error(`Agent ${agentId} error:`, error);
    await prisma.agentStatus.update({
      where: { id: agentId },
      data: { lastError: String(error) },
    }).catch(() => {});
  }
}

export async function startWorkers() {
  const b = await getBoss();

  // Register handlers
  await b.work('collector-queue', { pollingIntervalSeconds: 2 }, async () => {
    await runAgent('collector', processCollector);
  });

  await b.work('analyzer-queue', { pollingIntervalSeconds: 2 }, async () => {
    await runAgent('analyzer', processAnalyzer);
  });

  await b.work('responder-queue', { pollingIntervalSeconds: 2 }, async () => {
    await runAgent('responder', processResponder);
  });

  await b.work('action-queue', { pollingIntervalSeconds: 2 }, async () => {
    await runAgent('action', processAction);
  });

  await b.work('insights-queue', { pollingIntervalSeconds: 2 }, async (job: any) => {
    const periodDays = job.data?.periodDays || 7;
    await runAgent('insights', () => processInsights(periodDays));
  });

  // Use setInterval to send periodic jobs
  setInterval(async () => {
    try {
      await b.send('collector-queue', {}, { singletonKey: 'collector', singletonSeconds: 4 });
      await b.send('analyzer-queue', {}, { singletonKey: 'analyzer', singletonSeconds: 4 });
      await b.send('responder-queue', {}, { singletonKey: 'responder', singletonSeconds: 4 });
    } catch (error) {
      console.error('Error scheduling pipeline jobs:', error);
    }
  }, 5000);

  setInterval(async () => {
    try {
      await b.send('action-queue', {}, { singletonKey: 'action', singletonSeconds: 8 });
    } catch (error) {
      console.error('Error scheduling action job:', error);
    }
  }, 10000);

  console.log('🤖 All agent workers started');
}

export async function triggerAllAgents() {
  const b = await getBoss();
  await b.send('collector-queue', {});
  await b.send('analyzer-queue', {});
  await b.send('responder-queue', {});
  await b.send('action-queue', {});
}

export async function triggerInsights(periodDays: number = 7) {
  const b = await getBoss();
  await b.send('insights-queue', { periodDays });
}
