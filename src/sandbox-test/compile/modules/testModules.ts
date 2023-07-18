import { IModule } from "./IModule"

export class POSTModule implements IModule {
  async run(with_: object, ctx: object): Promise<object> {
    return await new Promise((resolve, reject) => {
      //sleep 1 second
      setTimeout(() => {
        resolve({})
      }, 1000)
    })
  }
}