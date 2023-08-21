import { JSONMessage } from "./rg-grpc/ts/jsonmsg"
import { randomUUID } from "crypto";
import * as grpc from '@grpc/grpc-js';
import { EventEmitter } from "events";
import { GameRuleProxyManager } from "./GameRuleProxy";
import { GameID, PlayerID } from "../../../game/players/IPlayer";
export type RgSectionId = GameID | PlayerID
export type RgData = {
  id: RgSectionId,
  [key: string]: string | number | object
  __RET__?: any
}
export type MsgId = string
export type RgMsg = {
  action: "ready" | "ACK" | "query" | "return" | "FORBIDDEN",
  msgId: MsgId,
  data: RgData,
}

const FORBIDDEN_MSG_OF = (id: MsgId) => ({ action: "FORBIDDEN", msgId: id, data: {} }) as RgMsg
const ACK_MSG_OF = (id: MsgId) => ({ action: "ACK", msgId: id, data: {} }) as RgMsg

// Reversed gRPC
export class RG extends EventEmitter {
  static newMsgId = randomUUID
  static RGS = new Map<GameID | PlayerID, RG>()
  id: RgSectionId
  funcName: string
  stream: grpc.ServerDuplexStream<JSONMessage, JSONMessage> | grpc.ClientDuplexStream<JSONMessage, JSONMessage>

  onQueryHandler: (msg: RgData) => any
  constructor(
    id: RgSectionId,
    funcName: string,
    stream: grpc.ServerDuplexStream<JSONMessage, JSONMessage> | grpc.ClientDuplexStream<JSONMessage, JSONMessage>,
    onQueryHandler: (msg: RgData) => any) {
    super()
    this.id = id
    this.funcName = funcName
    this.stream = stream
    this.onQueryHandler = onQueryHandler
    stream.on('data', (data: JSONMessage) => {
      const msg = Obj(data) as RgMsg
      const action = ActionOf(msg)
      // console.log(`RG ${this.funcName} of id ${this.id} received action ${action}, msg is ${JSON.stringify(msg)}`)
      if (action === "ready") this.onReady(msg)
      if (action === "ACK") this.onACK(msg)
      if (action === "query") this.onQuery(msg)
      if (action === "return") this.onReturn(msg)
    })
  }

  onReady(msg: RgMsg) {
    this.writeRgMsg(ACK_MSG_OF(MsgIdOf(msg)))
    const id = DataOf(msg)?.["id"] // if this is passive, id is null, id is not null if this is active
    if (id) { // set id when received one 
      this.id = id //TODO Extrat this
      RG.RGS.set(id, this)
      GameRuleProxyManager.get(id).register_rg(this)
    } else throw new Error("[RG.onReady] No id found in data")
    this.emit("on-ready", msg)
  }

  onACK(msg: RgMsg) {
    this.emit("on-ack", msg)
    this.ready_cb_resolve(msg.data)
    this.rm_cb(MsgIdOf(msg))
  }

  onQuery(msg: RgMsg) {
    if (!this.onQueryHandler) throw new Error("onQueryHandler is null")
    let resp = this.onQueryHandler(DataOf(msg))
    this.writeRgMsg({
      action: "return", msgId: MsgIdOf(msg), data: {
        __RET__: resp,
        id: this.id
      }
    })
    this.emit("on-query", msg)
  }

  onReturn(msg: RgMsg) {
    const cb = this.quires_cb_resolve.get(MsgIdOf(msg))
    if (cb) {
      cb(RetOf(DataOf(msg)))
      this.rm_cb(MsgIdOf(msg))
    } else {
      console.log("No cb found for msgId", MsgIdOf(msg))
      console.log("all cb", this.quires_cb_resolve.keys())
    }
    this.emit("on-return", msg)
  }

  quires_cb_resolve: Map<MsgId, (value: any | PromiseLike<any>) => void> = new Map()
  quires_cb_reject: Map<MsgId, (reason?: any) => void> = new Map()

  rm_cb = (msgId: MsgId) => {
    this.quires_cb_resolve.delete(msgId)
    this.quires_cb_reject.delete(msgId)
  }

  async doQuery(data: Omit<RgData, "id"> = {}, timeout = 1000): Promise<any> {
    // console.log(`[RG.doQuery] ${this.funcName} of id ${this.id} is querying with data ${JSON.stringify(data)}`)
    if (!this.id) throw new Error("id is null")
    const data_with_id = { ...data, id: this.id } as RgData
    const _msgId = RG.newMsgId()
    this.writeRgMsg({ action: "query", msgId: _msgId, data: data_with_id })
    try {
      return await withTimeout(new Promise((resolve, reject) => {
        this.quires_cb_resolve.set(_msgId, resolve);
        this.quires_cb_reject.set(_msgId, reject);
      }), timeout, () => {
        this.quires_cb_resolve.delete(_msgId)
        this.quires_cb_reject.delete(_msgId)
      });
    } catch (e) {
      console.log(`[RG.doQuery] Error: ${e}`)
    }
  }

  ready_cb_resolve: (value: RgData | PromiseLike<RgData>) => void
  ready_cb_reject: (reason?: any) => void

  async Ready(data: Omit<RgData, "id"> = {}, timeout = 1000): Promise<RgData> {
    if (!this.id) throw new Error("id is null")
    this.writeRgMsg({ action: "ready", msgId: RG.newMsgId(), data: { id: this.id } })
    try {
      return await withTimeout(new Promise((resolve, reject) => {
        this.ready_cb_resolve = resolve;
        this.ready_cb_reject = reject;
      }), timeout, () => {
        this.ready_cb_resolve = null;
        this.ready_cb_reject = null;
      });
    } catch (e) {
      console.log(`[RG.doReady] Error: ${e}`)
    }
  }

  writeRgMsg(msg: RgMsg) {
    try {
      this.stream.write(JSONMessage.fromObject({ value: JSON.stringify(msg) }))
    } catch (e) {
      console.log(`[RG.writeRgMsg] Error: ${e}`)
    }
  }

  static get(id: RgSectionId) {
    return RG.RGS.get(id)
  }

  close() {
    this.stream.end()
  }
}

function Obj(jsonMsg: JSONMessage) {
  return JSON.parse(jsonMsg.value) as RgMsg
}

function ActionOf(msg: RgMsg) {
  if (!msg) throw new Error("msg is null")
  return msg.action
}

function DataOf(msg: RgMsg) {
  if (!msg) throw new Error("msg is null")
  return msg.data
}

function RetOf(data: RgData) {
  if (!data) throw new Error("data is null")
  // console.debug(`returing `, data["__RET__"])
  return data["__RET__"]
}

function MsgIdOf(msg: RgMsg) {
  if (!msg) throw new Error("msg is null")
  return msg.msgId
}

function withTimeout(promise, ms, whenFinished: () => any = undefined): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Promise timeout'));
    }, ms);

    promise.then((result) => {
      clearTimeout(timeoutId);
      resolve(result);
      if (whenFinished) whenFinished()
    }).catch((error) => {
      clearTimeout(timeoutId);
      reject(error);
      if (whenFinished) whenFinished()
    });


  });
}
