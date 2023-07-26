export interface IModule {
  run(with_: WithContext, ctx: RuntimeContext): Promise<Record<string, string>>
}

export type WithContext = object
export type RuntimeContext = object
