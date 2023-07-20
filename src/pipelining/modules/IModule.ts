export interface IModule {
  run(with_: WithContext, ctx: RuntimeContext): Promise<any>
}

export type WithContext = object
export type RuntimeContext = object
