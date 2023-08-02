export interface IModule {
  run(with_: WithContext, ctx: RuntimeContext): Promise<ModuleRunResult>
}

export type WithContext = object
export type RuntimeContext = object
export type ModuleRunResult = {
  __code__: number,
  [key: string]: any
}