import { Entity } from "typeorm"

export type GameruleID = string

@Entity()
export class GameruleInstance {
  id: number
  responce_time: number
  memory_limit: number


  static fromObject(gamerule: any): GameruleInstance {
    throw new Error("Method not implemented.");
  }

  prepare() {}
}
