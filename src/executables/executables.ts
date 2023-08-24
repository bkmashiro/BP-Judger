import { Executable } from "src/modules/game/dto/create-game.dto";
import { FileCache } from "src/pipelining/modules/FileCacheModule/fileCacheModule";
import { Job } from "src/pipelining/pipelining.decl";
import { FileHelper, createCodeFingerprint } from "src/utils";
import * as path from 'path'
import * as fs from 'fs'
import { config } from "src/configs/config";
import { BKPileline } from "src/pipelining/pipelining";

export namespace Executables {
  export async function prepare(exec: Executable) {
    const { source } = exec
    if (!source) throw new Error('Code not found')
    // cache
    const code_fingerprint = createCodeFingerprint({
      src: source,
      lang: exec.config.lang,
      version: exec.config.version
    })

    if (await FileCache.instance.has(code_fingerprint)) { // if cached, skip compile
      const codeOutPath = await FileCache.instance.get(code_fingerprint)
      // console.log(`Code ${code_fingerprint} found in cache`)
      return codeOutPath
    }

    // prepare files, dirs ( src file, and a temp dir)
    const { basePath, codePath } = await prepareFs(code_fingerprint, source);

    const ctx = {
      '@input': codePath, 'cwd': basePath, 'INPUT_BOT_FILE_NAME': `src`
    }

    const pipeline = CompileStrategy.getPipeline(exec.config.lang, exec.config.version)
    let pipe: BKPileline
    try{
      pipe = BKPileline.fromJobAbbrs(pipeline).ctx(ctx) //this pipeline has only one job
      await pipe.run()
    } catch (e) {
      console.log(`Error when compiling code ${code_fingerprint}`, e)
      throw e
    }
    const codeOutPath = pipe.getRet('compile').expect_output
    // cache
    await FileCache.instance.set(code_fingerprint, codeOutPath)
    // TODO implement this
    return codeOutPath 
    // TODO  this is not correct, some language may not have this output
    // May create another module to notifiy the pipeline the infos.
  }

  async function prepareFs(code_fingerprint: string, source: string) {
    const basePath = path.resolve(path.join(config.CODE_FILE_TEMP_DIR, code_fingerprint));
    const codePath = path.resolve(path.join(basePath, `src`));
    await new FileHelper()
      .push('mkdir', basePath)
      .push('write', codePath, source)
      .push('chown', codePath, config.uid, config.gid)
      .push('chgrp', codePath, config.uid, config.gid)
      .run();
    return { basePath, codePath };
  }
}



/**
 * Note that:
 * 
 * Predefined Variables:
 * 
 * `@src`: the root of the project
 * 
 * `@input`: the input file
 * 
 * `@output`: the output file (that should be generated)
 * 
 * the output of the job will be stored in `<job_name>.__ret__`
 */
export namespace CompileStrategy {
  export type limitations = {
    memory_limit_kb: number;
    time_limit_ms: number;
    
  } & {file_no_limit: number;}

  type JailAbbr = {
    use_jail: boolean
    mount: string[]
    mount_ro: string[]
    mount_tmp: string[]
    netns: string
  }

  export type JobAbbr = ({
    require: string
    with: { [key: string]: string; };
  } | {
    use: string;
    with?: { [key: string]: string; };
  } |
  {
    run: string;
  }) & Partial<limitations> & Partial<JailAbbr> & {
    name?: string
  }


  type LangOption = {
    [lang: string]: JobAbbr[]
  }
  const c = {}

  const cpp: LangOption = {
    'cpp14-grpc': [
      {
        require: 'c++14_grpc_player_compile',
        with: {
          in_file_name: '${@input}',
          out_file_name: '${@output}',
        }
      }
    ]
  }

  export const langs: { [langName: string]: LangOption } = {
    c, cpp
  }


  export function getPipeline(lang: string, label: string) {
    try {
      return langs[lang][label]
    } catch (e) {
      throw new Error(`Cannot find pipeline for lang=${lang}, label=${label}`)
    }
  }
}