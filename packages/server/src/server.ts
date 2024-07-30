import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { router, createContext } from './trpc';
import { activityRouter } from './routers/activityRouter';
import { journalEntryRouter } from './routers/journalEntryRouter';
import { moodRouter } from './routers/moodRouter';
import { userRouter } from './routers/userRouter';
import { dashboardRouter } from './routers/dashboardRouter';
import { authenticateJWT } from './middleware/auth';
import config from './config';
import type { CustomRequest } from './types/customRequest';

export const appRouter = router({
  activity: activityRouter,
  dashboard: dashboardRouter,
  journalEntry: journalEntryRouter,
  mood: moodRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', (_, res) => {
  res.status(200).send('OK');
});

app.use('/api/trpc/*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('Applying authenticateJWT middleware');
  authenticateJWT(req as CustomRequest, res, next);
});

app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
      console.log('Creating context in tRPC middleware');
      const context = createContext({ req: req as CustomRequest, res });
      console.log('Context created:', context);
      return context;
    },
  })
);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error in server middleware:', err);
  res.status(500).send('Something went wrong!');
});

const port = config.port || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;