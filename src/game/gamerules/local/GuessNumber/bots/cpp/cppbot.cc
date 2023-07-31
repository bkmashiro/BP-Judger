#include <iostream>
#include <grpcpp/grpcpp.h>
#include <thread>
#include "../../../../../players/playerProxy/grpc/cpp/player.grpc.pb.h"

#define LOG(x) std::cout << x << std::endl;

using grpc::Channel;
using grpc::ClientContext;
using grpc::ClientReaderWriter;
using grpc::CompletionQueue;
using grpc::Status;

#include <nlohmann/json.hpp>
using json = nlohmann::json;

class PlayerProxyClient
{
public:
    PlayerProxyClient(std::shared_ptr<Channel> channel)
        : stub_(PlayerProxy::NewStub(channel)) {}

    void PerformMoves(const std::vector<std::string> &moves)
    {
        ClientContext context;
        stream = std::shared_ptr<ClientReaderWriter<JsonMessage, JsonMessage>>(stub_->Move(&context));

        // Create a thread to read responses from the server concurrently
        std::thread response_reader([&](){
            JsonMessage response;
            while (stream->Read(&response)) {
                json j = json::parse(response.json());
                handleResponse(j);
            } 
        });

        // Send requests to the server
        for (const std::string &move : moves)
        {
            Write(move);
        }

        // Wait for the response reader thread to finish and close the stream on the server side
        response_reader.join();

        // Signal that the writes are done and close the stream on the client side
        stream->WritesDone();
        Status status = stream->Finish();
        if (!status.ok())
        {
            std::cerr << "RPC failed: " << status.error_code() << ": " << status.error_message() << std::endl;
        } else {
            LOG("Game over, exit")
        }
    }

private:
    std::unique_ptr<PlayerProxy::Stub> stub_;
    std::shared_ptr<ClientReaderWriter<JsonMessage, JsonMessage>> stream;
    bool handleResponse(const json &j)
    {
        if(j.find("action")!=j.end()) {
            const std::string action = j["action"];
            if(action == "move") {
                json reply;
                reply["guess"] = Move();
                WriteWarpped(reply);
            }
        }
        return true;
    }

    void Write(std::string str) {
        JsonMessage request;
        request.set_json(str);
        stream->Write(request);
    }

    void WriteWarpped(json inner){
        json outer;
        outer["by"] = "d9668c37-6c28-4b46-8c88-6d550da1410d";
        outer["action"] = "move";
        outer["move"] = inner;
        Write(outer.dump());
    }

    int vbase = 114505;
    int Move() {
        LOG("Guessed: " << vbase)
        return vbase++;
    }
};

int main()
{
    PlayerProxyClient client(grpc::CreateChannel("0.0.0.0:8848", grpc::InsecureChannelCredentials()));
    client.PerformMoves({"{\"by\": \"d9668c37-6c28-4b46-8c88-6d550da1410d\", \"action\": \"ready\"}"});

    return 0;
}
