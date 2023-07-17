import { Containers, Streams } from '@docker/sdk';
import { ExecRequest, ExecResponse } from '@docker/sdk/protos/containers/v1/containers_pb';
import { BytesMessage } from '@docker/sdk/protos/streams/v1/streams_pb';
import * as grpc from '@grpc/grpc-js';
import * as readline from 'readline';



const containerId = `8afc5b13acf5`

const client = new Containers();
const streamsClient = new Streams();

// We ask for a stream first
const stream = streamsClient.newStream();

stream.on('metadata', (metadata: grpc.Metadata) => {
  // the stream id is returned in a gRPC header, we get it
  const streamId = metadata.get('id')[0] as string;
  // Put the streamId into the exec request in order to
  // be able to have an interactive session
  const request = new ExecRequest()
    .setCommand('/bin/bash')
    .setStreamId(streamId)
    .setId(containerId)
    .setTty(true);

  client.exec(request, (err: grpc.ServiceError | null, _: ExecResponse) => {
    if (err != null) {
      throw err;
    }
    // The `exec` request finishes once the stream is closed, we can exit now.
    process.exit();
  });
});

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

// Send each keypress over the stream
process.stdin.on('keypress', (_, key) => {
  const mess = new BytesMessage();
  const a = new Uint8Array(key.sequence.length);
  for (let i = 0; i <= key.sequence.length; i++) {
    a[i] = key.sequence.charCodeAt(i);
  }
  mess.setValue(a);
  stream.write(mess.serializeBinary());
});

stream.on('data', (chunk: any) => {
  const m = BytesMessage.deserializeBinary(chunk);
  process.stdout.write(m.getValue());
});