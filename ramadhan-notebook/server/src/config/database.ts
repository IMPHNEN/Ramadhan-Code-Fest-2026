import { MONGO_URI } from './env';
import mongoose from 'mongoose';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

export default mongoose;
