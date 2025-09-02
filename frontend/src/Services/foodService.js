import { foodApi } from '../axiosconfig';

// Get all food items
export const getAll = async () => {
  const { data } = await foodApi.get('/');
  return data;
};

// Search food items by name
export const search = async (searchTerm) => {
  const { data } = await foodApi.get(`/search/${searchTerm}`);
  return data;
};

// Get all food categories with counts
export const getAllTags = async () => {
  const { data } = await foodApi.get('/categories');
  return data;
};

// Get all food items by category
export const getAllByTag = async (category) => {
  if (category === 'All') return getAll();
  const { data } = await foodApi.get(`/category/${category}`);
  return data;
};

// Get food item by ID
export const getById = async (foodId) => {
  const { data } = await foodApi.get(`/${foodId}`);
  return data;
};

// Create new food item (requires admin auth token)
export const createFood = async (foodData, token) => {
  console.log("foodData service: ", foodData);
  const { data } = await foodApi.post('/', foodData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Update food item by ID (requires admin auth token)
export const updateFood = async (foodId, updateData, token) => {
  const { data } = await foodApi.put(`/${foodId}`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Delete food item by ID (requires admin auth token)
export const deleteFood = async (foodId, token) => {
  const { data } = await foodApi.delete(`/${foodId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
