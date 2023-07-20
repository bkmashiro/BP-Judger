#include <iostream>
#include <cstdlib>
#include <ctime>
#include <chrono>
#include <thread>

int main() {
    srand(time(nullptr)); // 使用当前时间作为随机数种子
    std::this_thread::sleep_for(std::chrono::seconds(3));
    int* ptr[10]; // 存储申请到的指针

    for (int i = 0; i < 10; ++i) {
        // 生成随机的内存大小（1000000到10000000之间的随机数）
        int size = (rand() % 10 + 1)*1000000;

        // 动态分配内存
        ptr[i] = new int[size];

        std::cout << "申请了大小为 " << size*4/1024 << "KB的内存\n";

        // 休眠一秒钟
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    // 释放内存
    for (int i = 0; i < 10; ++i) {
        delete[] ptr[i];
    }

    return 0;
}
