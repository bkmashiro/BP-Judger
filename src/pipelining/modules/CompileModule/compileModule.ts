import { EventEmitter } from "events";
import { IModule } from "../IModule"
import { BKPileline } from "src/pipelining/pipelining";

export class CompileModule implements IModule {
  private static cache: FileCache = new FileCache()
  async run(with_: object, ctx: object) {
    const compile_pipeline = with_['compile_pipeline']
    const exec_fingerprint = with_['code_fingerprint']
    const ignore_cache = with_['ignore_cache']
    // look up cache
    if (!ignore_cache) {
      const cache = await CompileModule.cache.get(exec_fingerprint)
      if (cache) {
        return {
          __code__: 0,
          hit_cache: true,
          exec_fingerprint: exec_fingerprint,
          ...cache
        }
      }
    }
    // not found, compile

    try{
      const rets = await new BKPileline(compile_pipeline).ctx(ctx).run()
      // cache is saved by last job, so we don't need to save it here
    } catch (err) {
      return {
        __code__: 1,
        hit_cache: false,
        exec_fingerprint: exec_fingerprint,
        error: err
      }
    }
  
    return {
      __code__: 0,
      hit_cache: false,
      exec_fingerprint: exec_fingerprint,
    }
  }
}

