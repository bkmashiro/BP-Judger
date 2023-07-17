#include <iostream>
#include <chrono>
#include <random>
#include <thread>
#include <cstdlib>

// 随机数生成器
std::mt19937 &getRandomGenerator()
{
  static std::random_device rd;
  static std::mt19937 generator(rd());
  return generator;
}

// 生成高斯分布的随机数
double generateRandomNumber(double mean, double stddev)
{
  std::normal_distribution<double> distribution(mean, stddev);
  return distribution(getRandomGenerator());
}

// 产生指定范围内的随机整数
int getUniformRandomNumber(int min, int max)
{
  static std::random_device rd;
  static std::mt19937 mt(rd());
  std::uniform_int_distribution<int> dist(min, max);
  return dist(mt);
}

int main(int argc, char *argv[])
{
  if (argc != 5)
  {
    std::cout << "Usage: " << argv[0] << " <numAllocations> <mean> <stddev> <sleepDuration>" << std::endl;
    return 1;
  }

  int numAllocations = std::atoi(argv[1]);
  double mean = std::atof(argv[2]);
  double stddev = std::atof(argv[3]);
  int sleepDurationArg = std::atoi(argv[4]);

  for (int i = 0; i < numAllocations; ++i)
  {
    size_t size = static_cast<size_t>(generateRandomNumber(mean, stddev));
    if (size <= 0)
      size = 1;
    if (size > 1024 * 1024 * 1024 / 32)
      size = 1024 * 1024 / 32;
    std::cout << "Memory allocated:" << size << " Bytes" << std::endl;

    // 动态申请内存
    int *ptr = new int[size];

    // 模拟使用内存（使用随机的睡眠时间）
    int randomSleepDuration = sleepDurationArg;
    std::cout << "Sleep for " << randomSleepDuration << " ms" << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(randomSleepDuration));

    // 销毁内存
    delete[] ptr;
  }

  return 0;
}
