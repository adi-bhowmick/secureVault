import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import router from './routes/index.js';
import labService from './services/labService.js';
import initDb from './database/initDb.js';
import seed from './database/seed.js';

dotenv.config();

labService.init();
initDb().then(() => seed()).catch(() => {});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProduction ? process.env.CORS_ORIGIN : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use('/api', router);

if (isProduction) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${isProduction ? 'production' : 'development'}]`);
});

export default app;
