import { IPlayerFacade } from "../../player/entities/playerFacade.entity";
import { GameFacade } from "./gameFacade.entity";


export class Gameover {
  game: GameFacade
  winner: IPlayerFacade
  output: string
}