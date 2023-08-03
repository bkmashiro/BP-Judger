import { IPlayerInst } from "../../player/entities/player.entity";
import { Game } from "./game.entity";


export class Gameover {
  game: Game
  winner: IPlayerInst
  output: string
}