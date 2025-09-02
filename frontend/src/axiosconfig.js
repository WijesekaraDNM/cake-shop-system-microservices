import axios from 'axios';
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8081';

export const userApi = axios.create({
  baseURL:`${API_GATEWAY_URL}/api/user`  // user service proxy root
});

export const foodApi = axios.create({
  baseURL:`${API_GATEWAY_URL}/api/food`  // food service proxy root
});

export const cartApi = axios.create({
  baseURL:`${API_GATEWAY_URL}/api/cart`  // food service proxy root
});

export const orderApi = axios.create({
  baseURL:`${API_GATEWAY_URL}/api/order`  // food service proxy root
});
