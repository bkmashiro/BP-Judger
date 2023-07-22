#include "bot.h"
#include "player_proxy_client.h"

class MyBot : public Bot {
public:
  // using Bot::Bot;
  MyBot(std::string url, std::string uuid) : Bot(url, uuid) {}
  json Move(json &ctx) override {
    json reply;
    reply["move"] = "114514";
    return reply;
  }
};

int main() {
  std::unique_ptr<MyBot> myBot = std::unique_ptr<MyBot>(new MyBot("",""));
  myBot->Ready();
}

