import { connect, set } from 'mongoose';
import { users } from '../Data.js';
import { userModel } from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const PASSWORD_HASH_SALT_ROUNDS = 10;

set('strictQuery', true);
export const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGO_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await seedUsers();
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

async function seedUsers() {
    const usersCount = await userModel.countDocuments();
    if (usersCount >0 ) {
        console.log('Users seed is already done!');
        return;
    }
    for ( let user of users ) {
        user.password = await bcrypt.hash(user.password, PASSWORD_HASH_SALT_ROUNDS);
        await userModel.create(user);
    }
    console.log('Users seed is done!');
};