import { Executable } from "src/modules/game/dto/create-game.dto";
import { FileCache } from "src/pipelining/modules/FileCacheModule/fileCacheModule";
import { Job } from "src/pipelining/pipelining.decl";
import { FileHelper, createCodeFingerprint } from "src/utils";
import * as path from 'path'
import * as fs from 'fs'
import { config } from "src/configs/config";
import { BKPileline } from "src/pipelining/pipelining";

namespace Executables {
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
      return codeOutPath
    }

    // prepare files, dirs ( src file, and a temp dir)
    const { basePath, codePath, codeOutPath } = await prepareFs(code_fingerprint, source);

    const ctx = {
      '@src': basePath, '@input': codePath, '@output': codeOutPath, '@cwd': basePath
    }

    const pipeline = CompileStrategy.getPipeline(exec.config.lang, exec.config.version)

    await BKPileline.fromJobAbbrs(pipeline).ctx(ctx).run()
    // TODO implement this
  }

  async function prepareFs(code_fingerprint: string, source: string) {
    const basePath = path.resolve(path.join(config.CODE_FILE_TEMP_DIR, code_fingerprint));
    const codePath = path.resolve(path.join(basePath, `src`));
    const codeOutPath = path.resolve(path.join(basePath, `/build/out`));
    await new FileHelper()
      .push('mkdir', basePath)
      .push('write', codePath, source)
      .push('chown', codePath, config.uid, config.gid)
      .push('chgrp', codePath, config.uid, config.gid)
      .run();
    return { basePath, codePath, codeOutPath };
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
  type limitations = {
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
  }) & Partial<limitations> & Partial<JailAbbr>


  type LangOption = {
    [lang: string]: JobAbbr[]
  }
  const C = {}

  const Cpp: LangOption = {
    '14-grpc': [
      {
        require: 'c++14_grpc_player_compile',
        with: {
          in_file_name: '@input',
          out_file_name: '@output',
        }
      }
    ]
  }

  export const langs: { [langName: string]: LangOption } = {
    C, Cpp
  }


  export function getPipeline(lang: string, label: string) {
    try {
      return langs[lang][label]
    } catch (e) {
      throw new Error(`Cannot find pipeline for lang=${lang}, label=${label}`)
    }
  }
}