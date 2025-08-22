const redis = require('redis');

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    client.on('error', (err) => {
      console.log('Redis Client Error', err);
    });

    await client.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.log('Redis connection failed:', error);
    console.log('Continuing without Redis cache...');
  }
};

const getRedisClient = () => client;

module.exports = { connectRedis, getRedisClient };
