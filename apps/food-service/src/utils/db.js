import { connect, set } from 'mongoose';
import { cakes } from '../Data.js';
import { foodModel } from '../models/foodModel.js';

set('strictQuery', true);
export const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGO_URI,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // await seedFoods();
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

async function seedFoods(){
  const foods = await foodModel.countDocuments();
  if (foods > 0){
      console.log ('Foods seed id already done!');
      return;
  }
  for (const cake of cakes) {
      cake.imageUrl = `/foods/${cake.imageUrl}`;
      await foodModel.create(cake);
  }
  console.log('Food seed is done!');
}
