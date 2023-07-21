#include <iostream>
#include <grpcpp/grpcpp.h>
#include "player.grpc.pb.h"

using grpc::Channel;
using grpc::ClientContext;
using grpc::Status;

class PlayerProxyClient {
public:
    PlayerProxyClient(std::shared_ptr<Channel> channel)
        : stub_(PlayerProxy::NewStub(channel)) {}

    // 客户端请求和响应都是流式的
    std::string Move(const std::string& json) {
        JsonMessage request;
        request.set_json(json);

        std::unique_ptr<grpc::ClientReaderWriter<JsonMessage, JsonMessage>> stream(
            stub_->Move(&context)
        );

        // 发送请求
        stream->Write(request);
        stream->WritesDone();

        // 接收响应
        JsonMessage response;
        std::string responseJson;

        while (stream->Read(&response)) {
            responseJson += response.json();
        }

        Status status = stream->Finish();

        if (status.ok()) {
            return responseJson;
        } else {
            return "RPC failed.";
        }
    }

private:
    std::unique_ptr<PlayerProxy::Stub> stub_;
    ClientContext context;
};

int main() {
    PlayerProxyClient client(grpc::CreateChannel("0.0.0.0:8848", grpc::InsecureChannelCredentials()));

    // 客户端代码...
    // 在这里调用 gRPC 服务方法
    std::string jsonRequest = "{\"key\": \"value\"}";
    std::string jsonResponse = client.Move(jsonRequest);
    std::cout << "Received response: " << jsonResponse << std::endl;

    return 0;
}
