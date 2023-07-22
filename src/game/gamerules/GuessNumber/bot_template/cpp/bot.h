#ifndef BOT_H
#define BOT_H

#include "player_proxy_client.h"

using json = nlohmann::json;

#define LOG(x) std::cout << x << std::endl;

class Bot
{
public:
  Bot() = delete;
  Bot(Bot &) = delete;
  Bot(Bot &&) = delete;
  Bot(std::string url, std::string uuid)
  {
    LOG("Bot initializing")
    init();
    LOG("Bot initialized")
  }
  void Ready()
  {
    client->Write(json::object(
                      {{"by", uuid},
                       {"action", "ready"}})
                      .dump());
    LOG("Bot ready")
  }

  virtual json Move(json &ctx) = 0;

private:
  std::unique_ptr<PlayerProxyClient> client;
  std::string url;
  std::string uuid;

  void init()
  {
    client = std::unique_ptr<PlayerProxyClient>(new PlayerProxyClient(grpc::CreateChannel(url, grpc::InsecureChannelCredentials())));
    client->PerformMoves([&](json ctx)
                               { return Move(ctx); });
  }

  void WriteMove(json inner)
  {
    json outer;
    outer["by"] = uuid;
    outer["action"] = "move";
    outer["move"] = inner;
    client->Write(outer.dump());
  }
};

#endif // BOT_H
