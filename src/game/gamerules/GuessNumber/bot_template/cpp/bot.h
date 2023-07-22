#ifndef BOT_H
#define BOT_H
#include <vector>
#include "player_proxy_client.h"

using json = nlohmann::json;

#define LOG(x) std::cout << x << std::endl;

class Bot
{
public:
  Bot() = delete;
  Bot(Bot &) = delete;
  Bot(Bot &&) = delete;
  Bot(std::string url, std::string uuid) : url(url), uuid(uuid)
  {
    LOG("Bot created with ip " << url << ",uuid=" << uuid)
  }

  void Ready()
  {
    initial_msg.push_back(json::object(
                              {{"by", uuid},
                               {"action", "ready"}})
                              .dump());
    LOG("Bot ready")
    init();
  }

  virtual json Move(json &ctx) = 0;

private:
  std::unique_ptr<PlayerProxyClient> client;
  std::string url;
  std::string uuid;
  std::vector<std::string> initial_msg;

  void init()
  {
    LOG("Proxy init with ip" << url)
    client = std::unique_ptr<PlayerProxyClient>(new PlayerProxyClient(grpc::CreateChannel(url, grpc::InsecureChannelCredentials())));
    LOG("Proxy init done")
    client->PerformMoves([&](json ctx)
                         { 
                          auto mov = Move(ctx);
                          return WarpMove(mov); },
                         initial_msg);
  }

  json WarpMove(json &inner)
  {
    json outer;
    outer["by"] = uuid;
    outer["action"] = "move";
    outer["move"] = inner;
    return outer;
  }
};

#endif // BOT_H
