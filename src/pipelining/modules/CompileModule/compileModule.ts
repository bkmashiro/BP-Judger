import { EventEmitter } from "events";
import { IModule } from "../IModule"
import { BKPileline } from "src/pipelining/pipelining";
import { FileCache } from "../FileCacheModule/fileCacheModule";
import { Logger } from "@nestjs/common";

export class CompileModule implements IModule {
  private static cache: FileCache = FileCache.instance
  async run(with_: object, ctx: object) {
    const compile_pipeline = with_['compile_pipeline']
    const compile_pipeline_name = with_['compile_pipeline_name']
    const code_fingerprint = with_['code_fingerprint']  // md5 of code
    const ignore_cache = with_['ignore_cache']
    const pipeline_ctx = with_['pipeline_ctx']
    // look up cache
    if (!ignore_cache) {
      const cache = await CompileModule.cache.get(code_fingerprint)
      if (cache) {
        return {
          __code__: 0,
          hit_cache: true,
          code_fingerprint,
          ...cache
        }
      }
    }
    // not found, compile
    let rets
    try{
      if (compile_pipeline_name) {
        rets = await BKPileline.predefined(compile_pipeline_name).ctx(pipeline_ctx).run()
      } else {
        rets = await new BKPileline(compile_pipeline).ctx(pipeline_ctx).run()
      }
      // CompileModule.cache.set(code_fingerprint, rets)

    } catch (err) {
      return {
        __code__: 1,
        hit_cache: false,
        code_fingerprint,
        error: err
      }
    }
  
    return {
      __code__: 0,
      hit_cache: false,
      code_fingerprint,
      rets
    }
  }
}

