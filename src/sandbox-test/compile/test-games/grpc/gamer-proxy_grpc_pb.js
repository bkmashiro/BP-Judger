// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var gamer$proxy_pb = require('./gamer-proxy_pb.js');

function serialize_JsonMessage(arg) {
  if (!(arg instanceof gamer$proxy_pb.JsonMessage)) {
    throw new Error('Expected argument of type JsonMessage');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_JsonMessage(buffer_arg) {
  return gamer$proxy_pb.JsonMessage.deserializeBinary(new Uint8Array(buffer_arg));
}


var PlayerProxyService = exports.PlayerProxyService = {
  move: {
    path: '/PlayerProxy/Move',
    requestStream: true,
    responseStream: true,
    requestType: gamer$proxy_pb.JsonMessage,
    responseType: gamer$proxy_pb.JsonMessage,
    requestSerialize: serialize_JsonMessage,
    requestDeserialize: deserialize_JsonMessage,
    responseSerialize: serialize_JsonMessage,
    responseDeserialize: deserialize_JsonMessage,
  },
};

exports.PlayerProxyClient = grpc.makeGenericClientConstructor(PlayerProxyService);
