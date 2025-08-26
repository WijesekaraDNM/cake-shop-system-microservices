import handler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import * as userService from '../services/userService.js';
import bcrypt from 'bcryptjs';

const loginUser = handler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.getUserByEmail(email);
  if (!user) {
    console.log("user not found")
    return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'No user found with this email.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    console.log("Invalid password")
    return res.status(401).json({ code: 'INVALID_PASSWORD', message: 'Password is incorrect.' });
  }
  console.log(user)
  console.log(passwordMatches)
  res.json(generateTokenResponse(user));
});

const registerUser = handler(async (req, res) => {
  const { name, email, password, address } = req.body;

  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ code: 'USER_EXISTS', message: 'User already exists, please login!' });
  }

  const newUser = await userService.createUser({ name, email, password, address });

  res.status(201).json(generateTokenResponse(newUser));
});

const generateTokenResponse = (user) => {
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token,
  };
};

export default {
  loginUser,
  registerUser,
};
