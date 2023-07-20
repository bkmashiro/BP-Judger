import { GuessNumberGameTemplate } from "../bot_template/GuessNumber.template";

class MyBot extends GuessNumberGameTemplate {
  l=0
  r=1000000
  
  async Move(ctx: object) : Promise<object> {
    let mid=(this.l+this.r)/2
    const gusses = ctx['moves']

    if(gusses.length === 0) {
      console.log(`I guess ${mid}`)
      return { guess: mid }
    }

    const lastGuess = gusses[gusses.length - 1]
    const number = lastGuess['move']['guess']
    const result = lastGuess['compare_result']

    if(result === '<') {
      this.l = number
    } else {
      this.r = number
    }

    mid = Math.floor((this.l + this.r) / 2)
    console.log(`I guess ${mid}`)

    return { guess: mid }
  }
}

const bot = new MyBot("d9668c37-6c28-4b46-8c88-6d550da1410d", "0.0.0.0:8848");
bot.Ready()
