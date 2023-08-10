#include "bot.h"

class MyBot : public Bot {
  int res = 114510;
public:
  using Bot::Bot;
  json Move(json &ctx) override {
    json reply;
    reply["guess"] = res++;
    LOG("MyBot Guessed " << res)
    return reply;
  }
};

int main() {
  std::unique_ptr<MyBot> myBot = std::unique_ptr<MyBot>(new MyBot("0.0.0.0:8848", "d9668c37-6c28-4b46-8c88-6d550da1410d"));
  myBot->Ready();
  LOG("MyBot End")
  return 0;
}

