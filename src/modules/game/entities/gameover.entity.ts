import { IPlayerFacade } from "../../player/entities/player.entity";
import { Game } from "./game.entity";


export class Gameover {
  game: Game
  winner: IPlayerFacade
  output: string
}