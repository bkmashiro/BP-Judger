import { createHash } from "crypto";
import { Code } from "./modules/player/entities/player.entity";
import * as fs from 'fs/promises';


export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function render(template: string, context: object) {
  if (!template) return null
  const required_vars = template.match(/\${(.*?)}/g)?.map((variable) => variable.slice(2, -1))
  check_required_variables(required_vars, context)
  return template.replace(/\${(.*?)}/g, (match, variable) => context[variable]);
}

export function check_required_variables(required_vars, context) {
  if (!required_vars || required_vars.length === 0) {
    return
  }
  for (const variable of required_vars) {
    if (!context.hasOwnProperty(variable)) {
      throw new Error(`Variable ${variable} not found in context`)
    }
  }
}

export function recursive_render_obj(obj: object, ctx: object) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => recursive_render_obj(item, ctx));
    } else {
      const processedObj: { [key: string]: any } = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          processedObj[key] = recursive_render_obj(obj[key], ctx);
        }
      }
      return processedObj;
    }
  } else {
    if (typeof obj === 'string') {
      return render(obj, ctx);
    } else {
      return obj;
    }
  }
}

export function timeout(action: Promise<any>, ms: number): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`))
    }, ms)
    action.then((result) => {
      resolve(result)
    }).catch((err) => {
      reject(err)
    })
  })
}


export function All(set: any, predicate: ((item: any) => boolean)) {
  for (const item of set) {
    if (!predicate(item)) {
      return false
    }
  }
  return true
}

export function Any(set: any, predicate: ((item: any) => boolean)) {
  for (const item of set) {
    if (predicate(item)) {
      return true
    }
  }
  return false
}

export function ifNotNullDo(func: any, ...args: any[]) {
  if (func) {
    func(...args)
  }
}

export function createCodeFingerprint(code: Code) {
  return createHash('sha256')
    .update(code.src)
    .update(code.lang)
    .update(code.version)
    .digest('hex')
}

// WARNING: TYPE GYMNASTICS AHEAD
// YOU SHALL NOT CHANGE ANYTHING BELOW
type FunctionArgs<T> = T extends (...args: infer Args) => any ? Args : never;

type FileHelperTaskType = keyof typeof FileHelper.map;

type FileHelperTask<T extends FileHelperTaskType> = {
  name: T;
  args: FunctionArgs<typeof FileHelper.map[T]>;
};

export class FileHelper {
  private tasks: FileHelperTask<FileHelperTaskType>[] = [];

  push<T extends FileHelperTaskType>(name: T, ...args: FunctionArgs<typeof FileHelper.map[T]>) {
    this.tasks.push({ name, args });
    return this;
  }
  private finished = []
  async run() {
    for (const task of this.tasks) {
      try {
        await FileHelper.map[task.name].apply(null, task.args);
        this.finished.push(task)
      } catch(err) {
        throw err
      }
    }
  }

  async rollback() {
    for (const task of this.finished.reverse()) {
      try {
        await FileHelper.rollback[task.name]?.apply(null, task.args);
      } catch(err) {
        throw err
      }
    }
  }

  static map = {
    mkdir: async (target: string) => {
      await fs.mkdir(target, { recursive: true });
    },
    write: fs.writeFile,
    chown: fs.chown,
    chgrp: fs.chown,
    chmod: fs.chmod,
    copy: fs.copyFile,
    move: fs.rename,
    delete: fs.unlink,
  };
  
  static rollback = {
    mkdir: deleteNth(0),
    write: deleteNth(0),
    copy:  deleteNth(1),
    move: swapArguments(fs.rename, 1, 0),
  }
}

function deleteNth(n: number) {
  return args => fs.unlink(args[n])
}

type StringFromNumber<N extends number> = `${N}`

type ArgumentMap<Args extends any[], IndexFrom extends number, IndexTo extends number> = {
  [Index in keyof Args]: Index extends StringFromNumber<IndexFrom>? Args[IndexTo] : Index extends  StringFromNumber<IndexTo> ? Args[IndexFrom]: Args[Index];
};

function swap<T>(arr: T[], i: number, j: number): void {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

/** Note that you will not see the arg name change, but it's actually swapped. 
 * 
 * So make sure what are you doing!
*/
function swapArguments<T extends any[], IndexFrom extends number, IndexTo extends number>(
  fn: (...args: T) => any,
  indexFrom: IndexFrom,
  indexTo: IndexTo
): (...args: ArgumentMap<T, IndexFrom, IndexTo>) => any {
  return (...args) => {
    swap(args, indexFrom, indexTo)
    const swappedArgs = args as ArgumentMap<T, IndexFrom, IndexTo>;
    return fn.apply(null, swappedArgs);
  };
}