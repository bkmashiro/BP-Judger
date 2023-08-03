import { Code } from "src/modules/player/entities/player.entity"

export class Bot {
  id: number
  name: string
  by: string // user id
  code: Code
  tags: string[]
  lang: string
  version: string
  filename: string
  do_compile: boolean
  compile_pipeline_name?: string  

  run_pipeline_name: string
}
