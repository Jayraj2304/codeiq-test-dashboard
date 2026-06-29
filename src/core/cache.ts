export interface CacheOptions {
  ttlMs: number;
  maxSize?: number;
  onEvict?: (key: string) => void;
}

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export class MemoryCache<K = string, V = unknown> {
  private store = new Map<K, CacheEntry<V>>();
  private options: Required<CacheOptions>;
  private hitCount = 0;
  private missCount = 0;

  constructor(options: CacheOptions) {
    this.options = {
      ttlMs: options.ttlMs,
      maxSize: options.maxSize ?? 1000,
      onEvict: options.onEvict ?? (() => {}),
    };
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.missCount++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.options.onEvict(key);
      this.missCount++;
      return undefined;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hitCount++;
    return entry.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    if (this.store.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.options.ttlMs),
      accessCount: 0,
      lastAccessed: Date.now(),
    });
  }

  has(key: K): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
      size: this.store.size,
      maxSize: this.options.maxSize,
    };
  }

  private evictLRU() {
    let oldest: K | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldest = key;
      }
    }

    if (oldest !== null) {
      this.store.delete(oldest);
      this.options.onEvict(oldest);
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        this.options.onEvict(key);
      }
    }
  }
}
