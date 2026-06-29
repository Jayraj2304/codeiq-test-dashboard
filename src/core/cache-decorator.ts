import { MemoryCache } from './cache';

const methodCaches = new WeakMap<object, Map<string, MemoryCache>>();

export interface CacheDecoratorOptions {
  ttlMs: number;
  maxSize?: number;
  keyPrefix?: string;
  keyGenerator?: (...args: any[]) => string;
}

export function Cached(options: CacheDecoratorOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: any, ...args: any[]) {
      let instanceCache = methodCaches.get(this);
      if (!instanceCache) {
        instanceCache = new Map();
        methodCaches.set(this, instanceCache);
      }

      const cacheKey = options.keyPrefix
        ? `${options.keyPrefix}:${propertyKey}`
        : propertyKey;

      let cache = instanceCache.get(cacheKey);
      if (!cache) {
        cache = new MemoryCache({
          ttlMs: options.ttlMs,
          maxSize: options.maxSize ?? 100,
        });
        instanceCache.set(cacheKey, cache);
      }

      const key = options.keyGenerator
        ? options.keyGenerator(...args)
        : JSON.stringify(args);

      const cached = cache.get(key);
      if (cached !== undefined) {
        return cached;
      }

      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((value) => {
          cache!.set(key, value);
          return value;
        });
      }

      cache.set(key, result);
      return result;
    };

    return descriptor;
  };
}

export function invalidateCache(target: any, propertyKey: string) {
  const instanceCache = methodCaches.get(target);
  if (instanceCache) {
    instanceCache.delete(propertyKey);
  }
}
