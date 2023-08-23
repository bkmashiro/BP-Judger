import { EventEmitter } from "events";
import { IModule } from "../IModule"
import { BKPileline, Context } from "src/pipelining/pipelining";
import { FileCache } from "../FileCacheModule/fileCacheModule";
import { Logger } from "@nestjs/common";
import { existsSync } from "fs";
import * as path from "path";

export class CompileModule implements IModule {
  private static cache: FileCache = FileCache.instance
  async run(_with: object, ctx: Context) {
    const compile_pipeline = _with['compile_pipeline']
    const compile_pipeline_name = _with['compile_pipeline_name']
    const code_fingerprint = _with['code_fingerprint']  // md5 of code
    const ignore_cache = _with['ignore_cache'] ?? false
    let pipeline_ctx = _with['pipeline_ctx'] ?? {}
    const inherit_ctx = _with['inherit_ctx'] ?? true
    const expect_output = _with['expect'] ? path.resolve(path.join(ctx.cwd, _with['expect'])) : undefined
    console.log(`Expect output: ${expect_output}`)
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
    if(inherit_ctx) {
      pipeline_ctx = Object.assign(pipeline_ctx, ctx)
    }
    // not found, compile
    let rets: object
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
  
    // check output
    if (expect_output) {
      if (!existsSync(expect_output)){
        return {
          __code__: 1,
          hit_cache: false,
          code_fingerprint,
          error: `Expect output ${expect_output} not found`
        }
      }
    }

    return {
      __code__: 0,
      hit_cache: false,
      code_fingerprint,
      rets,
      expect_output
    }
  }
}

