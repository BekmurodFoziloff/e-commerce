import redis from 'redis';
import logger from '../utils/logger.js';

class RedisService {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    });
    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });
    this.client.on('error', (error) => {
      logger.error(`Error connecting to Redis: ${error}`);
    });
  }

  async setValue(key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, async (error) => {
        if (error) {
          reject(`Error setting key from Redis: ${error}`);
        } else {
          this.client.expire(key, 300, async (error) => {
            if (error) throw error;
          });
          resolve();
        }
      });
    });
  }

  async getValue(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, async (error, result) => {
        if (error) {
          reject(`Error retrieving key from Redis: ${error}`);
        } else {
          resolve(result);
        }
      });
    });
  }

  async deleteValue(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, async (error) => {
        if (error) {
          reject(`Error deleting key from Redis: ${error}`);
        } else {
          resolve();
        }
      });
    });
  }
}

export default new RedisService();
