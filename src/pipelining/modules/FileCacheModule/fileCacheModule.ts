import { LRUCache } from "./LRU.cache"

interface ICacheLayer {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  has(key: string): Promise<boolean>
  init(): Promise<void>
}

class LocalFileCacheLayer implements ICacheLayer {
  max_cache_count = 514 
  cache_dir = ''
  cache: Map<string, any> = new Map()
  lru: LRUCache<string> = new LRUCache<string>(this.max_cache_count)


  init(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  get(key: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  set(key: string, value: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  has(key: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}

class OSSFileCacheLayer implements ICacheLayer {
  init(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  get(key: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  set(key: string, value: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  has(key: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}

class FileCache {
  private cacheLayers: ICacheLayer[] = []
  constructor() {
    this.cacheLayers.push(new LocalFileCacheLayer())
    this.cacheLayers.push(new OSSFileCacheLayer())
  }
  async get(key: string): Promise<any> {
    for (const layer of this.cacheLayers) {
      if (await layer.has(key)) {
        return await layer.get(key) // if not find, will fall back to next layer
      }
    }
    return null
  }
  async set(key: string, value: any): Promise<void> {
    for (const layer of this.cacheLayers) {
      await layer.set(key, value)
    }
  }
  async has(key: string): Promise<boolean> {
    for (const layer of this.cacheLayers) {
      if (await layer.has(key)) {
        return true
      }
    }
    return false
  }
}