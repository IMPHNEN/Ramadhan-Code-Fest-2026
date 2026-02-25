import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { projectRoutes } from './routes/projectRoutes';
import { initDb } from './db/client';

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_request, response) => {
  response.json({ ok: true });
});

app.use('/api/projects', projectRoutes);
app.use(errorHandler);

async function start(): Promise<void> {
  await initDb();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

void start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
