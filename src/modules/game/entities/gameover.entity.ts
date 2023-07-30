import { IPlayer } from "../../player/entities/player.entity";
import { Game } from "./game.entity";


export class Gameover {
  game: Game
  winner: IPlayer
  output: string
}