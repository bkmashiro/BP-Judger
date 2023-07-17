#include <iostream>
#include <chrono>
#include <random>
#include <thread>
#include <cstdlib>

// 产生指定范围内的随机整数
int getRandomNumber(int min, int max) {
    static std::random_device rd;
    static std::mt19937 mt(rd());
    std::uniform_int_distribution<int> dist(min, max);
    return dist(mt);
}

// 模拟计算任务
void performComputation(int duration) {
    auto startTime = std::chrono::steady_clock::now();
    while (true) {
        auto currentTime = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(currentTime - startTime).count();
        if (elapsed >= duration)
            break;
    }
}

// 模拟睡眠任务
void performSleep(int duration) {
    std::this_thread::sleep_for(std::chrono::milliseconds(duration));
}

int main(int argc, char* argv[]) {
    if (argc != 5 + 1) {
        std::cout << "Usage: " << argv[0] << " <numTasks> <computationMin> <computationMax> <sleepMin> <sleepMax>" << std::endl;
        return 1;
    }

    int numTasks = std::atoi(argv[1]);
    int computationMin = std::atoi(argv[2]);
    int computationMax = std::atoi(argv[3]);
    int sleepMin = std::atoi(argv[4]);
    int sleepMax = std::atoi(argv[5]);

    for (int i = 0; i < numTasks; ++i) {
        int computationDuration = getRandomNumber(computationMin, computationMax); // 计算任务持续时间（毫秒）
        int sleepDuration = getRandomNumber(sleepMin, sleepMax); // 睡眠任务持续时间（毫秒）

        std::cout << "Task " << (i + 1) << ": Busy = " << computationDuration << "ms, Idle = " << sleepDuration << "ms" << std::endl;

        performComputation(computationDuration);
        performSleep(sleepDuration);
    }

    return 0;
}
