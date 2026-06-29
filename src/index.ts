import express from 'express';
import cors from 'cors';
import { authRouter, taskRouter, projectRouter } from './routes';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limiter';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/projects', projectRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
