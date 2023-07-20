export const config = {
  jobs: [
    // {
    //   name: "compile",
    //   run: "/usr/bin/g++ -O2 -std=c++11 -o ${out_file_name} ${in_file_name}",
    //   onSuccess: "next",
    //   onFailure: "stop",
    //   jail: {
    //     mount: ["/home/shiyuzhe/lev/bp/bp-judger/src/sandbox-test/jail-mount"],
    //     mount_readonly: ["/bin", "/lib", "/lib64/", "/usr/", "/sbin/", "/dev", "/dev/urandom"],
    //     timeout: 10,
    //     mem_max: 256,
    //     user: 1919,
    //     group: 1919,
    //     pid_max: 32,
    //     cwd: "/home/shiyuzhe/lev/bp/bp-judger/src/sandbox-test/jail-mount",
    //     safetySetup: true,
    //     env: {
    //       PATH: "/bin:/usr/bin:/sbin:/usr/sbin:/usr/local/bin:/usr/local/sbin"
    //     }
    //   }
    // },
    // {
    //   name: "gamer-up-noob-1",
    //   use: "gamer",
    //   with: {
    //     exec: "${out_file_name}",
    //     gameId: "${gameId}",
    //     playerType: "noob"
    //   }
    // },
    {
      name: "player-proxy-up",
      use: "player", // Note that this is asynchronized
      with: {
        exec: "${out_file_name}",
        gameId: "${gameId}",
        playerType: "proxy"
      }
    },
    {
      name: "notify",
      use: "post",
      with: {
        url: "https://run.mocky.io/v3/",
        data: {
          data: "${post_url}"
        }
      }
    },
    {
      name: "clean",
      run: "echo Im do some clean work. 上面的都是测试，你可以在/src/config/g++.ts修改"
    }
  ],
  constants: {}
}