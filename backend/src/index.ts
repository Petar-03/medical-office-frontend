import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ message: 'Backend is running' });
});

app.use('/api', apiRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
