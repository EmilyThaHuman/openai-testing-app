import localforage from 'localforage';
import { encrypt, decrypt } from '@/lib/utils/encryption';

class CacheService {
  constructor() {
    this.store = localforage.createInstance({
      name: 'openai-testing-cache'
    });
  }

  async get(key) {
    try {
      const item = await this.store.getItem(key);
      if (!item) return null;

      const { value, expiry } = JSON.parse(decrypt(item));
      if (expiry && Date.now() > expiry) {
        await this.delete(key);
        return null;
      }

      return value;
    } catch (error) {
      console.error(error, { context: 'Cache:get' });
      return null;
    }
  }

  async set(key, value, duration = 5 * 60 * 1000) {
    try {
      const item = {
        value,
        expiry: duration ? Date.now() + duration : null
      };
      await this.store.setItem(key, encrypt(JSON.stringify(item)));
    } catch (error) {
      console.error(error, { context: 'Cache:set' });
    }
  }

  async delete(key) {
    await this.store.removeItem(key);
  }

  async clear() {
    await this.store.clear();
  }
}

export const Cache = new CacheService(); 