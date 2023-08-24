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

export namespace Timely {
  const logger = new Logger("Timely")
  export class Timely {
    private marks : {}
    private events : {}

    public mark(name: string, interval: number) {
      if (name == undefined) {
        throw new Error("Trigger name can not be undefined.")
      }

      if (interval == undefined) {
        throw new Error("Trigger interval can not be undefined.")
      }

      if (this.marks[name] != undefined) {
        throw new Error(`Trigger ${name} is already defined.`)
      }

      this.marks[name] = interval
    }

    public unmark(name: string) {
      if (name == undefined) {
        throw new Error("Trigger name can not be undefined.")
      }

      if (this.marks[name] == undefined) {
        throw new Error(`Trigger ${name} is not defined.`)
      }

      delete this.marks[name]
      delete this.events[name]
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

      // Check if the trigger has timed out.
      const dif = this.now - this.events[name]

      if (dif >= this.marks[name]) {
        this.unmark(name)
        throw new TimeoutException(`Mark ${name} timed out.`)
      } else {
        this.events[name] = this.now
      }

      return dif
    }
    
    public get now() : number {
      return performance.now()
    }
  }

  export class TimeoutException extends Error {
    constructor(message: string) {
      super(message)
      this.name = "TimeoutException"
    }
  }
}