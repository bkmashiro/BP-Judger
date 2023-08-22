
import { Code } from "src/modules/player/entities/playerFacade.entity"
import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"

@Entity('bot')
export class BotConfig {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  name: string
  @Column()
  @Index({unique: false}) // if merged, set this to a foreign key
  by: number // user id
  @Column({type: 'json'})
  code: Code
  @Column({nullable: true, type: 'simple-array'})
  tags: string[]
  @Column({default: 'unknown'})
  lang: string
  @Column({default: '0.0.0'})
  version: string
  @Column({default: 'unknown'})
  filename: string
  @Column({default: false})
  do_compile: boolean
  @Column({default: 'unknown'})
  compile_pipeline_name?: string  
  @Column({default: 'unknown'})
  run_pipeline_name: string
}
