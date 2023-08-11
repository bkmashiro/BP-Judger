import { IModule, RuntimeContext, WithContext } from "../IModule"
import axios from 'axios';

export class POSTModule implements IModule {
  async run(with_: WithContext, ctx: RuntimeContext) {
    const url = with_['url']
    const data = with_['data']['data']

    return {
      __code__: 0,
      ret:  JSON.stringify((await axios.post(url + data)).data)
    }
  }
}