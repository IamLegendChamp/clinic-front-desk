import 'dotenv/config';
import { connectDB } from './config/db';
import { createApp } from './app';

const PORT = process.env.PORT ?? 5001;

const start = async () => {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => console.log(`Server on Port ${PORT}`));
};
start();
