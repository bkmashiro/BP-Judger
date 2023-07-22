#ifndef PLAYER_PROXY_CLIENT_H
#define PLAYER_PROXY_CLIENT_H

#include <iostream>
#include <thread>
#include <player.grpc.pb.h>
#include <grpcpp/grpcpp.h>
#include <nlohmann/json.hpp>

using grpc::Channel;
using grpc::ClientContext;
using grpc::ClientReaderWriter;
using grpc::CompletionQueue;
using grpc::Status;

using json = nlohmann::json;

#define LOG(x) std::cout << x << std::endl;

class PlayerProxyClient
{
public:
  explicit PlayerProxyClient(std::shared_ptr<Channel> channel)
      : stub_(PlayerProxy::NewStub(channel)) {}

  void PerformMoves(std::function<json(json)> Move)
  {
    ClientContext context;
    stream = std::shared_ptr<ClientReaderWriter<JsonMessage, JsonMessage>>(stub_->Move(&context));

    // Create a thread to read responses from the server concurrently
    std::thread response_reader([&]()
                                {
      JsonMessage response;
      while (stream->Read(&response)) {
          json j = json::parse(response.json());
          // call the bot's Move function, which is passed in as a parameter
          json reply = Move(j);
      } });

    // Wait for the response reader thread to finish and close the stream on the server side
    response_reader.join();
    // Signal that the writes are done and close the stream on the client side
    stream->WritesDone();
    Status status = stream->Finish();
    if (!status.ok())
    {
      std::cerr << "RPC failed: " << status.error_code() << ": " << status.error_message() << std::endl;
    }
    else
    {
      LOG("Game over successfully, exit")
    }
  }
  void Write(std::string str)
  {
    JsonMessage request;
    request.set_json(str);
    stream->Write(request);
  }

private:
  std::unique_ptr<PlayerProxy::Stub> stub_;
  std::shared_ptr<ClientReaderWriter<JsonMessage, JsonMessage>> stream;
};

#endif // PLAYER_PROXY_CLIENT_H
