import { config } from "src/configs/config"
import { LRUCache } from "./LRU.cache"
import * as fs from 'fs/promises'
import {constants} from 'fs'
import { IModule } from "../IModule"

export class FileCahceModule implements IModule {
  async run(with_: object, ctx: object) {
    const key = with_['key']
    const value = with_['value']
    const action = with_['action']
    let code = -1
    let ret = null
    const cache = FileCache.instance
    if (action === 'get') {
      ret = await cache.get(key)
      if (ret) {
        code = 0
      }
    } else if (action === 'set') {
      await cache.set(key, value)
      // console.log('set', key, value)
      ret = `cache set ${key} ${value}`
      code = 0
    } else if (action === 'has') {
      const ret = await cache.has(key)
      if (ret) {
        code = 0
      }
    } else if (action === 'remove') {
      const ret = await cache.remove(key)
      if (ret) {
        code = 0
      }
    }

    return {
      __code__: code,
      ret
    }
  }
}

interface ICacheLayer {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  has(key: string): Promise<boolean>
  remove(key: string): Promise<boolean>
  init(): Promise<void>
}

class LocalFileCacheLayer implements ICacheLayer {
  max_cache_count = 514 
  cache_dir = config.compiled_cache
  lru: LRUCache<string> = new LRUCache<string>(this.max_cache_count)

  constructor() {
    this.init()
  }

  async init(): Promise<void> {
    //make dir
    await fs.mkdir(this.cache_dir, { recursive: true })
    // load cache
    const files = await fs.readdir(this.cache_dir)
    for (const file of files) {
      const cache_path = `${this.cache_dir}/${file}`
      const key = file
      this.lru.put(key, cache_path)
    }
  }
  get(key: string): Promise<any> {
    return Promise.resolve(this.lru.get(key))
  }
  set(key: string, value: any): Promise<void> {
    // move to cache dir
    const cache_path = `${this.cache_dir}/${key}`
    this.lru.put(key, cache_path)
    return fs.copyFile(value, cache_path)
    // return fs.promises.rename(value, cache_path)
  }
  async has(key: string): Promise<boolean> {
    //test if file exists
    try {
      await fs.access(`${this.cache_dir}/${key}`, constants.F_OK)
      return Promise.resolve(true)
    } catch (err) {
      return Promise.resolve(false)
    }
  }
  remove(key: string): Promise<boolean> {
    return Promise.resolve(this.lru.remove(key))
  }
}

class OSSFileCacheLayer implements ICacheLayer {
  remove(key: string): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
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

export class FileCache implements ICacheLayer {
  private static _instance: FileCache
  
  static get instance(): FileCache {
    if (!this._instance) {
      this._instance = new FileCache()
    }
    return this._instance
  }

  private cacheLayers: ICacheLayer[] = []

  private constructor() {
    this.cacheLayers.push(new LocalFileCacheLayer())
    // this.cacheLayers.push(new OSSFileCacheLayer())
  }
  init(): Promise<void> {
    throw new Error("Method not implemented.")
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
  async remove(key: string): Promise<boolean> {
    for (const layer of this.cacheLayers) {
      await layer.remove(key)
    }
    return true
  }
}