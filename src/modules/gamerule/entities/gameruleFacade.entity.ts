import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

export type GameruleID = string

@Entity()
export class GameruleFacade {
  @PrimaryGeneratedColumn()
  id: number

  @Column({default: 1000})
  responce_time: number

  @Column({default: 256})
  memory_limit: number


  static fromObject(gamerule: any): GameruleFacade {
    throw new Error("Method not implemented.");
  }

  prepare() {}
}
