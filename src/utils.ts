import { createHash } from "crypto";
import { Code } from "./modules/player/entities/playerFacade.entity";
import * as fs from 'fs/promises';
import { Version, VersionDescriptor } from "./modules/game/dto/create-game.dto";


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
      console.log(`Required variable ${variable} not found in context, context: `, context)
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
/**
 * Note that this will capture the stack trace of the caller
 * @param action 
 * @param ms 
 * @returns 
 */
export function timeout<T>(action: Promise<T>, ms: number): Promise<T> {
  const stackTrace = new Error().stack;  // This is used for better debugging
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms at \n ${stackTrace}`))
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

export function ifUndefinedThenAssign(obj: any, key: string, value: any) {
  if (!obj) return
  if (!obj.hasOwnProperty(key)) {
    obj[key] = value
  }
}

export function createCodeFingerprint(code:Pick<Code, 'src' | 'lang' | 'version'>) {
  return createHash('sha256')
    .update(code.src)
    .update(code.lang)
    .update(code.version)
    .digest('hex')
}

export async function timed<T>(func: () => Promise<T>): Promise<[T, number]> {
  const start = Date.now()
  const result = await func()
  const end = Date.now()
  return Promise.resolve([result, end - start])
}

export function propEqualsThenDo<T>(obj: any, prop: string, value: any, func: (obj: any) => T) {
  if (obj.hasOwnProperty(prop) && obj[prop] === value) {
    return func(obj)
  }
  // Do nothing
  return undefined
}

export function ifTrueThenDo<T>(condition: boolean | undefined, func: () => T) {
  if (condition) {
    return func()
  }
  return undefined
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

function compareVersions(v1: Version, v2: Version): number {
  if (v1.major !== v2.major) {
    return v1.major - v2.major;
  }
  if (v1.minor !== v2.minor) {
    return v1.minor - v2.minor;
  }
  return v1.patch - v2.patch;
}

function isVersionInRange(version: Version, descriptor: VersionDescriptor): boolean {
  const comparison = compareVersions(version, descriptor.version);

  switch (descriptor.sign) {
    case ">":
      return comparison > 0;
    case ">=":
      return comparison >= 0;
    case "=":
      return comparison === 0;
    case "<=":
      return comparison <= 0;
    case "<":
      return comparison < 0;
    default:
      throw new Error("Invalid comparison sign");
  }
}

function isVersionInRanges(version: Version, ranges: VersionDescriptor[]): boolean {
  for (const range of ranges) {
    if (!isVersionInRange(version, range)) {
      return false;
    }
  }
  return true;
}

function formatVersionDescriptor(descriptor: VersionDescriptor): string {
  return `${descriptor.sign}${formatVersion(descriptor.version)}`;
}

function formatVersion(version: Version): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function parseVersion(versionStr: string): Version | null {
  const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/;
  const matches = versionStr.match(versionRegex);

  if (!matches) {
    return null; // Invalid version string format
  }

  const [, majorStr, minorStr, patchStr] = matches;
  const major = parseInt(majorStr, 10);
  const minor = parseInt(minorStr, 10);
  const patch = parseInt(patchStr, 10);

  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    return null; // Invalid numeric components
  }

  return { major, minor, patch };
}

function parseVersionDescriptor(descriptorStr: string): VersionDescriptor | null {
  const versionDescriptorRegex = /^([><=]+)(\d+\.\d+\.\d+)$/;
  const matches = descriptorStr.match(versionDescriptorRegex);

  if (!matches) {
    return null; // Invalid version descriptor string format
  }

  const [, sign, versionStr] = matches;
  const version = parseVersion(versionStr);

  if (!version) {
    return null; // Invalid version format
  }

  return { version, sign: sign as VersionDescriptor['sign'] };
}