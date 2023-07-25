/**
 * Generated by the protoc-gen-ts.  DO NOT EDIT!
 * compiler version: 4.23.1
 * source: gamerule.proto
 * git: https://github.com/thesayyn/protoc-gen-ts */
import * as pb_1 from "google-protobuf";
import * as grpc_1 from "@grpc/grpc-js";
export class GameId extends pb_1.Message {
    #one_of_decls: number[][] = [];
    constructor(data?: any[] | {
        value?: string;
    }) {
        super();
        pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
        if (!Array.isArray(data) && typeof data == "object") {
            if ("value" in data && data.value != undefined) {
                this.value = data.value;
            }
        }
    }
    get value() {
        return pb_1.Message.getFieldWithDefault(this, 1, "") as string;
    }
    set value(value: string) {
        pb_1.Message.setField(this, 1, value);
    }
    static fromObject(data: {
        value?: string;
    }): GameId {
        const message = new GameId({});
        if (data.value != null) {
            message.value = data.value;
        }
        return message;
    }
    toObject() {
        const data: {
            value?: string;
        } = {};
        if (this.value != null) {
            data.value = this.value;
        }
        return data;
    }
    serialize(): Uint8Array;
    serialize(w: pb_1.BinaryWriter): void;
    serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
        const writer = w || new pb_1.BinaryWriter();
        if (this.value.length)
            writer.writeString(1, this.value);
        if (!w)
            return writer.getResultBuffer();
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): GameId {
        const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new GameId();
        while (reader.nextField()) {
            if (reader.isEndGroup())
                break;
            switch (reader.getFieldNumber()) {
                case 1:
                    message.value = reader.readString();
                    break;
                default: reader.skipField();
            }
        }
        return message;
    }
    serializeBinary(): Uint8Array {
        return this.serialize();
    }
    static deserializeBinary(bytes: Uint8Array): GameId {
        return GameId.deserialize(bytes);
    }
}
export class Data extends pb_1.Message {
    #one_of_decls: number[][] = [];
    constructor(data?: any[] | {
        value?: string;
    }) {
        super();
        pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
        if (!Array.isArray(data) && typeof data == "object") {
            if ("value" in data && data.value != undefined) {
                this.value = data.value;
            }
        }
    }
    get value() {
        return pb_1.Message.getFieldWithDefault(this, 1, "") as string;
    }
    set value(value: string) {
        pb_1.Message.setField(this, 1, value);
    }
    static fromObject(data: {
        value?: string;
    }): Data {
        const message = new Data({});
        if (data.value != null) {
            message.value = data.value;
        }
        return message;
    }
    toObject() {
        const data: {
            value?: string;
        } = {};
        if (this.value != null) {
            data.value = this.value;
        }
        return data;
    }
    serialize(): Uint8Array;
    serialize(w: pb_1.BinaryWriter): void;
    serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
        const writer = w || new pb_1.BinaryWriter();
        if (this.value.length)
            writer.writeString(1, this.value);
        if (!w)
            return writer.getResultBuffer();
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Data {
        const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new Data();
        while (reader.nextField()) {
            if (reader.isEndGroup())
                break;
            switch (reader.getFieldNumber()) {
                case 1:
                    message.value = reader.readString();
                    break;
                default: reader.skipField();
            }
        }
        return message;
    }
    serializeBinary(): Uint8Array {
        return this.serialize();
    }
    static deserializeBinary(bytes: Uint8Array): Data {
        return Data.deserialize(bytes);
    }
}
export class GameRuleResp extends pb_1.Message {
    #one_of_decls: number[][] = [];
    constructor(data?: any[] | {
        gameId?: GameId;
        data?: Data;
    }) {
        super();
        pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
        if (!Array.isArray(data) && typeof data == "object") {
            if ("gameId" in data && data.gameId != undefined) {
                this.gameId = data.gameId;
            }
            if ("data" in data && data.data != undefined) {
                this.data = data.data;
            }
        }
    }
    get gameId() {
        return pb_1.Message.getWrapperField(this, GameId, 1) as GameId;
    }
    set gameId(value: GameId) {
        pb_1.Message.setWrapperField(this, 1, value);
    }
    get has_gameId() {
        return pb_1.Message.getField(this, 1) != null;
    }
    get data() {
        return pb_1.Message.getWrapperField(this, Data, 2) as Data;
    }
    set data(value: Data) {
        pb_1.Message.setWrapperField(this, 2, value);
    }
    get has_data() {
        return pb_1.Message.getField(this, 2) != null;
    }
    static fromObject(data: {
        gameId?: ReturnType<typeof GameId.prototype.toObject>;
        data?: ReturnType<typeof Data.prototype.toObject>;
    }): GameRuleResp {
        const message = new GameRuleResp({});
        if (data.gameId != null) {
            message.gameId = GameId.fromObject(data.gameId);
        }
        if (data.data != null) {
            message.data = Data.fromObject(data.data);
        }
        return message;
    }
    toObject() {
        const data: {
            gameId?: ReturnType<typeof GameId.prototype.toObject>;
            data?: ReturnType<typeof Data.prototype.toObject>;
        } = {};
        if (this.gameId != null) {
            data.gameId = this.gameId.toObject();
        }
        if (this.data != null) {
            data.data = this.data.toObject();
        }
        return data;
    }
    serialize(): Uint8Array;
    serialize(w: pb_1.BinaryWriter): void;
    serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
        const writer = w || new pb_1.BinaryWriter();
        if (this.has_gameId)
            writer.writeMessage(1, this.gameId, () => this.gameId.serialize(writer));
        if (this.has_data)
            writer.writeMessage(2, this.data, () => this.data.serialize(writer));
        if (!w)
            return writer.getResultBuffer();
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): GameRuleResp {
        const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new GameRuleResp();
        while (reader.nextField()) {
            if (reader.isEndGroup())
                break;
            switch (reader.getFieldNumber()) {
                case 1:
                    reader.readMessage(message.gameId, () => message.gameId = GameId.deserialize(reader));
                    break;
                case 2:
                    reader.readMessage(message.data, () => message.data = Data.deserialize(reader));
                    break;
                default: reader.skipField();
            }
        }
        return message;
    }
    serializeBinary(): Uint8Array {
        return this.serialize();
    }
    static deserializeBinary(bytes: Uint8Array): GameRuleResp {
        return GameRuleResp.deserialize(bytes);
    }
}
export class GameRuleQuery extends pb_1.Message {
    #one_of_decls: number[][] = [];
    constructor(data?: any[] | {
        gameId?: GameId;
        data?: Data;
    }) {
        super();
        pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [], this.#one_of_decls);
        if (!Array.isArray(data) && typeof data == "object") {
            if ("gameId" in data && data.gameId != undefined) {
                this.gameId = data.gameId;
            }
            if ("data" in data && data.data != undefined) {
                this.data = data.data;
            }
        }
    }
    get gameId() {
        return pb_1.Message.getWrapperField(this, GameId, 1) as GameId;
    }
    set gameId(value: GameId) {
        pb_1.Message.setWrapperField(this, 1, value);
    }
    get has_gameId() {
        return pb_1.Message.getField(this, 1) != null;
    }
    get data() {
        return pb_1.Message.getWrapperField(this, Data, 2) as Data;
    }
    set data(value: Data) {
        pb_1.Message.setWrapperField(this, 2, value);
    }
    get has_data() {
        return pb_1.Message.getField(this, 2) != null;
    }
    static fromObject(data: {
        gameId?: ReturnType<typeof GameId.prototype.toObject>;
        data?: ReturnType<typeof Data.prototype.toObject>;
    }): GameRuleQuery {
        const message = new GameRuleQuery({});
        if (data.gameId != null) {
            message.gameId = GameId.fromObject(data.gameId);
        }
        if (data.data != null) {
            message.data = Data.fromObject(data.data);
        }
        return message;
    }
    toObject() {
        const data: {
            gameId?: ReturnType<typeof GameId.prototype.toObject>;
            data?: ReturnType<typeof Data.prototype.toObject>;
        } = {};
        if (this.gameId != null) {
            data.gameId = this.gameId.toObject();
        }
        if (this.data != null) {
            data.data = this.data.toObject();
        }
        return data;
    }
    serialize(): Uint8Array;
    serialize(w: pb_1.BinaryWriter): void;
    serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
        const writer = w || new pb_1.BinaryWriter();
        if (this.has_gameId)
            writer.writeMessage(1, this.gameId, () => this.gameId.serialize(writer));
        if (this.has_data)
            writer.writeMessage(2, this.data, () => this.data.serialize(writer));
        if (!w)
            return writer.getResultBuffer();
    }
    static deserialize(bytes: Uint8Array | pb_1.BinaryReader): GameRuleQuery {
        const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new GameRuleQuery();
        while (reader.nextField()) {
            if (reader.isEndGroup())
                break;
            switch (reader.getFieldNumber()) {
                case 1:
                    reader.readMessage(message.gameId, () => message.gameId = GameId.deserialize(reader));
                    break;
                case 2:
                    reader.readMessage(message.data, () => message.data = Data.deserialize(reader));
                    break;
                default: reader.skipField();
            }
        }
        return message;
    }
    serializeBinary(): Uint8Array {
        return this.serialize();
    }
    static deserializeBinary(bytes: Uint8Array): GameRuleQuery {
        return GameRuleQuery.deserialize(bytes);
    }
}
interface GrpcUnaryServiceInterface<P, R> {
    (message: P, metadata: grpc_1.Metadata, options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
    (message: P, metadata: grpc_1.Metadata, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
    (message: P, options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
    (message: P, callback: grpc_1.requestCallback<R>): grpc_1.ClientUnaryCall;
}
interface GrpcStreamServiceInterface<P, R> {
    (message: P, metadata: grpc_1.Metadata, options?: grpc_1.CallOptions): grpc_1.ClientReadableStream<R>;
    (message: P, options?: grpc_1.CallOptions): grpc_1.ClientReadableStream<R>;
}
interface GrpWritableServiceInterface<P, R> {
    (metadata: grpc_1.Metadata, options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
    (metadata: grpc_1.Metadata, callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
    (options: grpc_1.CallOptions, callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
    (callback: grpc_1.requestCallback<R>): grpc_1.ClientWritableStream<P>;
}
interface GrpcChunkServiceInterface<P, R> {
    (metadata: grpc_1.Metadata, options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<P, R>;
    (options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<P, R>;
}
interface GrpcPromiseServiceInterface<P, R> {
    (message: P, metadata: grpc_1.Metadata, options?: grpc_1.CallOptions): Promise<R>;
    (message: P, options?: grpc_1.CallOptions): Promise<R>;
}
export abstract class UnimplementedGameRuleProxyServiceService {
    static definition = {
        ValidateGamePreRequirements: {
            path: "/GameRuleProxyService/ValidateGamePreRequirements",
            requestStream: true,
            responseStream: true,
            requestSerialize: (message: GameRuleResp) => Buffer.from(message.serialize()),
            requestDeserialize: (bytes: Buffer) => GameRuleResp.deserialize(new Uint8Array(bytes)),
            responseSerialize: (message: GameRuleQuery) => Buffer.from(message.serialize()),
            responseDeserialize: (bytes: Buffer) => GameRuleQuery.deserialize(new Uint8Array(bytes))
        },
        ValidateMovePostRequirements: {
            path: "/GameRuleProxyService/ValidateMovePostRequirements",
            requestStream: true,
            responseStream: true,
            requestSerialize: (message: GameRuleResp) => Buffer.from(message.serialize()),
            requestDeserialize: (bytes: Buffer) => GameRuleResp.deserialize(new Uint8Array(bytes)),
            responseSerialize: (message: GameRuleQuery) => Buffer.from(message.serialize()),
            responseDeserialize: (bytes: Buffer) => GameRuleQuery.deserialize(new Uint8Array(bytes))
        },
        ValidateMove: {
            path: "/GameRuleProxyService/ValidateMove",
            requestStream: true,
            responseStream: true,
            requestSerialize: (message: GameRuleResp) => Buffer.from(message.serialize()),
            requestDeserialize: (bytes: Buffer) => GameRuleResp.deserialize(new Uint8Array(bytes)),
            responseSerialize: (message: GameRuleQuery) => Buffer.from(message.serialize()),
            responseDeserialize: (bytes: Buffer) => GameRuleQuery.deserialize(new Uint8Array(bytes))
        },
        AcceptMove: {
            path: "/GameRuleProxyService/AcceptMove",
            requestStream: true,
            responseStream: true,
            requestSerialize: (message: GameRuleResp) => Buffer.from(message.serialize()),
            requestDeserialize: (bytes: Buffer) => GameRuleResp.deserialize(new Uint8Array(bytes)),
            responseSerialize: (message: GameRuleQuery) => Buffer.from(message.serialize()),
            responseDeserialize: (bytes: Buffer) => GameRuleQuery.deserialize(new Uint8Array(bytes))
        },
        InitGame: {
            path: "/GameRuleProxyService/InitGame",
            requestStream: true,
            responseStream: true,
            requestSerialize: (message: GameRuleResp) => Buffer.from(message.serialize()),
            requestDeserialize: (bytes: Buffer) => GameRuleResp.deserialize(new Uint8Array(bytes)),
            responseSerialize: (message: GameRuleQuery) => Buffer.from(message.serialize()),
            responseDeserialize: (bytes: Buffer) => GameRuleQuery.deserialize(new Uint8Array(bytes))
        }
    };
    [method: string]: grpc_1.UntypedHandleCall;
    abstract ValidateGamePreRequirements(call: grpc_1.ServerDuplexStream<GameRuleResp, GameRuleQuery>): void;
    abstract ValidateMovePostRequirements(call: grpc_1.ServerDuplexStream<GameRuleResp, GameRuleQuery>): void;
    abstract ValidateMove(call: grpc_1.ServerDuplexStream<GameRuleResp, GameRuleQuery>): void;
    abstract AcceptMove(call: grpc_1.ServerDuplexStream<GameRuleResp, GameRuleQuery>): void;
    abstract InitGame(call: grpc_1.ServerDuplexStream<GameRuleResp, GameRuleQuery>): void;
}
export class GameRuleProxyServiceClient extends grpc_1.makeGenericClientConstructor(UnimplementedGameRuleProxyServiceService.definition, "GameRuleProxyService", {}) {
    constructor(address: string, credentials: grpc_1.ChannelCredentials, options?: Partial<grpc_1.ChannelOptions>) {
        super(address, credentials, options);
    }
    ValidateGamePreRequirements: GrpcChunkServiceInterface<GameRuleResp, GameRuleQuery> = (metadata?: grpc_1.Metadata | grpc_1.CallOptions, options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<GameRuleResp, GameRuleQuery> => {
        return super.ValidateGamePreRequirements(metadata, options);
    };
    ValidateMovePostRequirements: GrpcChunkServiceInterface<GameRuleResp, GameRuleQuery> = (metadata?: grpc_1.Metadata | grpc_1.CallOptions, options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<GameRuleResp, GameRuleQuery> => {
        return super.ValidateMovePostRequirements(metadata, options);
    };
    ValidateMove: GrpcChunkServiceInterface<GameRuleResp, GameRuleQuery> = (metadata?: grpc_1.Metadata | grpc_1.CallOptions, options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<GameRuleResp, GameRuleQuery> => {
        return super.ValidateMove(metadata, options);
    };
    AcceptMove: GrpcChunkServiceInterface<GameRuleResp, GameRuleQuery> = (metadata?: grpc_1.Metadata | grpc_1.CallOptions, options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<GameRuleResp, GameRuleQuery> => {
        return super.AcceptMove(metadata, options);
    };
    InitGame: GrpcChunkServiceInterface<GameRuleResp, GameRuleQuery> = (metadata?: grpc_1.Metadata | grpc_1.CallOptions, options?: grpc_1.CallOptions): grpc_1.ClientDuplexStream<GameRuleResp, GameRuleQuery> => {
        return super.InitGame(metadata, options);
    };
}