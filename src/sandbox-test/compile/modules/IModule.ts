export interface IModule {
  run(with_: object, ctx: object): Promise<object>
}
