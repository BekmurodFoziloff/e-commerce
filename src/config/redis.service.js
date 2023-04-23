import redis from 'redis';
import logger from '../utils/logger.js';

class RedisService {
  constructor() {
    this.client = redis.createClient({
      host: '127.0.0.1',
      port: 6379
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
