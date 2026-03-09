import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User';

const MONGO_URI = process.env.MONGO_URI!;

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  const existing = await User.findOne({ email: 'staff@clinic.com' });
  if (existing) {
    console.log('User already exists:', existing.email);
    process.exit(0);
    return;
  }
  const user = await User.create({
    email: 'staff@clinic.com',
    password: 'Staff123!',
    role: 'staff',
  });
  console.log('Created user:', user.email, user.role);
  process.exit(0);
};
seed().catch((err) => { console.error(err); process.exit(1); });