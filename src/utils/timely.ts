/* 
      _____                    _____                    _____                    _____                    _____        _____          
     /\    \                  /\    \                  /\    \                  /\    \                  /\    \      |\    \         
    /::\    \                /::\    \                /::\____\                /::\    \                /::\____\     |:\____\        
    \:::\    \               \:::\    \              /::::|   |               /::::\    \              /:::/    /     |::|   |        
     \:::\    \               \:::\    \            /:::::|   |              /::::::\    \            /:::/    /      |::|   |        
      \:::\    \               \:::\    \          /::::::|   |             /:::/\:::\    \          /:::/    /       |::|   |        
       \:::\    \               \:::\    \        /:::/|::|   |            /:::/__\:::\    \        /:::/    /        |::|   |        
       /::::\    \              /::::\    \      /:::/ |::|   |           /::::\   \:::\    \      /:::/    /         |::|   |        
      /::::::\    \    ____    /::::::\    \    /:::/  |::|___|______    /::::::\   \:::\    \    /:::/    /          |::|___|______  
     /:::/\:::\    \  /\   \  /:::/\:::\    \  /:::/   |::::::::\    \  /:::/\:::\   \:::\    \  /:::/    /           /::::::::\    \ 
    /:::/  \:::\____\/::\   \/:::/  \:::\____\/:::/    |:::::::::\____\/:::/__\:::\   \:::\____\/:::/____/           /::::::::::\____\
   /:::/    \::/    /\:::\  /:::/    \::/    /\::/    / ~~~~~/:::/    /\:::\   \:::\   \::/    /\:::\    \          /:::/~~~~/~~      
  /:::/    / \/____/  \:::\/:::/    / \/____/  \/____/      /:::/    /  \:::\   \:::\   \/____/  \:::\    \        /:::/    /         
 /:::/    /            \::::::/    /                       /:::/    /    \:::\   \:::\    \       \:::\    \      /:::/    /          
/:::/    /              \::::/____/                       /:::/    /      \:::\   \:::\____\       \:::\    \    /:::/    /           
\::/    /                \:::\    \                      /:::/    /        \:::\   \::/    /        \:::\    \   \::/    /            
 \/____/                  \:::\    \                    /:::/    /          \:::\   \/____/          \:::\    \   \/____/             
                           \:::\    \                  /:::/    /            \:::\    \               \:::\    \                      
                            \:::\____\                /:::/    /              \:::\____\               \:::\____\                     
                             \::/    /                \::/    /                \::/    /                \::/    /                     
                              \/____/                  \/____/                  \/____/                  \/____/                      
                                                                                                                                      

  Timely by baka_mashiro  
  This program is licensed under the MIT License.
*/

import { Logger } from "@nestjs/common"
import { ObjectHasAllKeys } from "../utils"

export namespace Timely {
  const logger = new Logger("Timely")
  export class Timely {
    private marks: {} = {}
    private events: {} = {}

    public mark(name: string, interval: number) {
      if (name === undefined) {
        throw new Error("Mark name can not be undefined.")
      }
      if (interval === undefined) {
        throw new Error("Mark interval can not be undefined.")
      }
      if (ObjectHasAllKeys(this.marks, [name])) {
        throw new Error(`Mark ${name} is already defined.`)
      }

      this.marks[name] = interval

      return this
    }

    public unmark(name: string) {
      if (name == undefined) {
        throw new Error("Mark name can not be undefined.")
      }

      if (this.marks[name] == undefined) {
        throw new Error(`Mark ${name} is not defined.`)
      }

      delete this.marks[name]
      delete this.events[name]
    }

    // start a mark but not emit it
    public start(name: string) {
      if (name == undefined) {
        throw new Error("Mark name can not be undefined.")
      }

      if (this.marks[name] == undefined) {
        throw new Error(`Mark ${name} is not defined.`)
      }

      this.events[name] = this.now
    }

    public emit(name: string): number {
      if (name == undefined) {
        throw new Error("Mark name can not be undefined.")
      }

      // Check if the trigger is marked.
      if (this.marks[name] == undefined) {
        logger.warn(`${name} is not marked but is emitted.`)
        return
      }

      if (this.events[name] == undefined) {
        this.events[name] = this.now
        return
      }

      // Check if the mark has timed out.
      const dif = this.now - this.events[name]

      if (dif >= this.marks[name]) {
        this.unmark(name)
        throw new TimeoutException(`Mark ${name} timed out.`)
      } else {
        this.events[name] = this.now
      }
      console.log(`Mark ${name} takes ${dif}ms`)
      return dif
    }
    /**
     * use emitter to warp a function, when the function is called, the mark will be emitted.
     * @param func 
     */
    public emitter<T extends (...args: any) => any> (func: T, name: string = undefined): T {
      if (name == undefined) {
        name = func.name
      }

      if (name == undefined) {
        throw new Error("Mark name can not be undefined.")
      }

      if (this.marks[name] == undefined) {
        throw new Error(`Mark ${name} is not defined.`)
      }

      return ((args : Parameters<T>) => {
        this.emit(name)
        return func(args) as ReturnType<T>
      }) as T
    }

    /** register func and make alias here! */
    public emitters<T extends {}>(functions: T): T {
      const result = {} as T
      for (const [name, func] of Object.entries(functions)) {
        result[name] = this.emitter(func as any, name)
      }
      return result
    }

    public get now(): number {
      return performance.now()
    }
  }
  type FunctionArgs<T> = T extends (...args: infer Args) => any ? Args : never;

  export class TimeoutException extends Error {
    constructor(message: string) {
      super(message)
      this.name = "TimeoutException"
    }
  }
}


