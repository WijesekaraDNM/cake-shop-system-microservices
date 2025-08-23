import { userModel } from '../models/userModel.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async () => {
  return await userModel.find({});
};

export const getUserById = async (id) => {
  return await userModel.findById(id);
};

export const getUserByEmail = async (email) => {
  return await userModel.findOne({ email: email.toLowerCase() });
};

export const createUser = async (userData) => {
  // Hash password before saving new user
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = new userModel({
    ...userData,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
  });
  return await user.save();
};

export const updateUser = async (id, updateData) => {
  const user = await userModel.findById(id);
  if (!user) throw new Error('User not found');
  // If password is updated, hash it
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  Object.assign(user, updateData);
  return await user.save();
};

export const deleteUser = async (id) => {
  const user = await userModel.findById(id);
  if (!user) throw new Error('User not found');
  return await user.remove();
};
