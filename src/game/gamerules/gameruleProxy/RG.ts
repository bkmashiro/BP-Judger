import { JSONMessage, UnimplementedGameRuleProxyServiceService, } from "./grpc/ts/jsonmsg"
import { ServerDuplexStream, ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { randomUUID } from "crypto";
// import { ifNotNullDo } from "../../../utils";
// import * as grpc from '@grpc/grpc-js';
import { EventEmitter } from "events";
import { GameID, PlayerID } from "src/pipelining/modules/playerModule/player";
import { GameRuleProxyManager } from "./GameRuleProxy2";
export type RgSectionId = GameID | PlayerID
export type RgData = {
  id: RgSectionId,
  [key: string]: string | number
}
export type MsgId = string
export type RgMsg = {
  action: "ready" | "ACK" | "query" | "return" | "FORBIDDEN",
  msgId: MsgId,
  data: RgData,
}

const FORBIDDEN_MSG_OF = (id: MsgId) => ({ action: "FORBIDDEN", msgId: id, data: {} }) as RgMsg
const ACK_MSG_OF = (id: MsgId) => ({ action: "ACK", msgId: id, data: {} }) as RgMsg

export class RG extends EventEmitter {
  static newMsgId = randomUUID
  static RGS = new Map<GameID | PlayerID, RG>()
  id: RgSectionId
  funcName: string
  stream: ServerDuplexStream<JSONMessage, JSONMessage>
  onQueryHandler: (msg: RgMsg) => RgData
  constructor(
    id: RgSectionId,
    funcName: string,
    stream: ServerDuplexStream<JSONMessage, JSONMessage>,
    onQueryHandler: (msg: RgMsg) => RgData) {
    super()
    this.id = id
    this.funcName = funcName
    this.stream = stream
    this.onQueryHandler = onQueryHandler
    stream.on('data', (data: JSONMessage) => {
      const msg = Obj(data) as RgMsg
      const action = ActionOf(msg)
      if (action === "ready") this.onReady(msg)
      if (action === "ACK") this.onACK(msg)
      if (action === "query") this.onQuery(msg)
      if (action === "return") this.onReturn(msg)
    })
  }

  onReady(msg: RgMsg) {
    console.log("onReady")
    this.writeRgMsg(ACK_MSG_OF(MsgIdOf(msg)))
    const id = DataOf(msg)?.["id"] // if this is passive, id is null, id is not null if this is active
    if (id) { // set id when received one
      this.id = id
      RG.RGS.set(id, this)
      GameRuleProxyManager.getGameRuleProxy(id).register_rg(this)
    } else throw new Error("[RG.onReady] No id found in data")
    this.emit("on-ready", msg)
  }

  onACK(msg: RgMsg) {
    console.log("onACK")
    this.emit("on-ack", msg)
  }

  onQuery(msg: RgMsg) {
    console.log("onQuery")
    if(!this.onQueryHandler) throw new Error("onQueryHandler is null")
    const resp = this.onQueryHandler(msg)
    this.writeRgMsg({ action: "return", msgId: MsgIdOf(msg), data: resp })
    this.emit("on-query", msg)
  }

  onReturn(msg: RgMsg) {
    console.log("onReturn")
    const cb = this.quires_cb_resolve.get(MsgIdOf(msg))
    if (cb) {
      cb(DataOf(msg))
      this.rm_cb(MsgIdOf(msg))
    } else {
      console.log("No cb found for msgId", MsgIdOf(msg))
    }
    this.emit("on-return", msg)
  }

  quires_cb_resolve: Map<MsgId, (value: RgData | PromiseLike<RgData>) => void> = new Map()
  quires_cb_reject: Map<MsgId, (reason?: any) => void> = new Map()

  rm_cb = (msgId: MsgId) => {
    this.quires_cb_resolve.delete(msgId)
    this.quires_cb_reject.delete(msgId)
  }

  async doQuery(data: Omit<RgData, "id"> = {}, timeout = 1000): Promise<RgData> {
    if(!this.id) throw new Error("id is null")
    const data_with_id = { ...data, id: this.id } as RgData
    this.writeRgMsg({ action: "query", msgId: RG.newMsgId(), data: data_with_id })
    const _msgId = RG.newMsgId()
    try {
      return await withTimeout(new Promise((resolve, reject) => {
        this.quires_cb_resolve.set(_msgId, resolve);
        this.quires_cb_reject.set(_msgId, reject);
      }), timeout);
    } finally {
      this.rm_cb(_msgId);
    }
  }

  ready_cb_resolve: (value: RgData | PromiseLike<RgData>) => void
  ready_cb_reject: (reason?: any) => void

  async doReady(data: Omit<RgData, "id"> = {}, timeout = 1000): Promise<RgData> {
    if(!this.id) throw new Error("id is null")
    this.writeRgMsg({ action: "ready", msgId: RG.newMsgId(), data: { id: this.id } })
    try {
      return await withTimeout(new Promise((resolve, reject) => {
        this.ready_cb_resolve = resolve;
        this.ready_cb_reject = reject;
      }), timeout);
    } finally {
      this.ready_cb_resolve = null;
      this.ready_cb_reject = null;
    }
  }

  writeRgMsg(msg: RgMsg) {
    this.stream.write(JSONMessage.fromObject({ value: JSON.stringify(msg) }))
  }

  static get(id: RgSectionId) {
    return RG.RGS.get(id)
  }
}



function Obj(jsonMsg: JSONMessage) {
  return jsonMsg.toObject()
}

function ActionOf(msg: RgMsg) {
  if (!msg) throw new Error("msg is null")
  return msg.action
}

function DataOf(msg: RgMsg) {
  if (!msg) throw new Error("msg is null")
  return msg.data
}

function MsgIdOf(msg: RgMsg) {
  if (!msg) throw new Error("msg is null")
  return msg.msgId
}

function withTimeout(promise, ms): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Promise timeout'));
    }, ms);

    promise.then((result) => {
      clearTimeout(timeoutId);
      resolve(result);
    }).catch((error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}
