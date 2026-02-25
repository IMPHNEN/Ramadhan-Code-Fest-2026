import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/index';
import './config/database';

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1', routes);

const PORT = process.env.PORT;

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
