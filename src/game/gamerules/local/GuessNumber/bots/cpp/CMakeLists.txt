cmake_minimum_required(VERSION 3.8)

project(Player C CXX)

include(./common.cmake)

# Proto file
get_filename_component(player_proto "../../../grpc/player.proto" ABSOLUTE)
get_filename_component(player_proto_path "${player_proto}" PATH)

# Generated sources
set(player_proto_srcs "${CMAKE_CURRENT_BINARY_DIR}/player.pb.cc")
set(player_proto_hdrs "${CMAKE_CURRENT_BINARY_DIR}/player.pb.h")
set(player_grpc_srcs "${CMAKE_CURRENT_BINARY_DIR}/player.grpc.pb.cc")
set(player_grpc_hdrs "${CMAKE_CURRENT_BINARY_DIR}/player.grpc.pb.h")
add_custom_command(
      OUTPUT "${player_proto_srcs}" "${player_proto_hdrs}" "${player_grpc_srcs}" "${player_grpc_hdrs}"
      COMMAND ${_PROTOBUF_PROTOC}
      ARGS --grpc_out "${CMAKE_CURRENT_BINARY_DIR}"
        --cpp_out "${CMAKE_CURRENT_BINARY_DIR}"
        -I "${player_proto_path}"
        --plugin=protoc-gen-grpc="${_GRPC_CPP_PLUGIN_EXECUTABLE}"
        "${player_proto}"
      DEPENDS "${player_proto}")

# Include generated *.pb.h files
include_directories("${CMAKE_CURRENT_BINARY_DIR}")

# player_grpc_proto
add_library(player_grpc_proto
  ${player_grpc_srcs}
  ${player_grpc_hdrs}
  ${player_proto_srcs}
  ${player_proto_hdrs})
target_link_libraries(player_grpc_proto
  ${_REFLECTION}
  ${_GRPC_GRPCPP}
  ${_PROTOBUF_LIBPROTOBUF})

# Targets cppbot
foreach(_target
  cppbot)
  add_executable(${_target} "${_target}.cc")
  target_link_libraries(${_target}
    player_grpc_proto
    absl::flags
    absl::flags_parse
    ${_REFLECTION}
    ${_GRPC_GRPCPP}
    ${_PROTOBUF_LIBPROTOBUF})
endforeach()
