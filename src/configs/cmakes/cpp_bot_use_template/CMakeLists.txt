cmake_minimum_required(VERSION 3.8)


project(Player C CXX)

include(./common.cmake)

find_program(CCACHE_FOUND ccache)
if(CCACHE_FOUND)
    set_property(GLOBAL PROPERTY RULE_LAUNCH_COMPILE ccache)
    set_property(GLOBAL PROPERTY RULE_LAUNCH_LINK ccache) # Less useful to do it for linking, see edit2
    message(STATUS "Using CCache")
endif(CCACHE_FOUND)

if(NOT DEFINED PLAYER_PROTO_FILE_PATH)
    message(FATAL_ERROR "missing PLAYER_PROTO_FILE_PATH")
endif()
if(NOT DEFINED BOT_H)
    message(FATAL_ERROR "missing BOT_H")
endif()
if(NOT DEFINED PLAYER_PROXY_CLIENT_H)
    message(FATAL_ERROR "missing PLAYER_PROXY_CLIENT_H")
endif()
if(NOT DEFINED INPUT_BOT_FILE_NAME)
    message(FATAL_ERROR "missing INPUT_BOT_FILE_NAME")
endif()



# Proto file
get_filename_component(player_proto "${PLAYER_PROTO_FILE_PATH}" ABSOLUTE)
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


# Add bot.h and player_proxy_client.h to the source files list
set(SOURCES
  ${BOT_H}
  ${PLAYER_PROXY_CLIENT_H}
  # Add other source files here
)

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
  ${INPUT_BOT_FILE_NAME})
  add_executable(${_target} "${_target}.cc" ${SOURCES})  # Add ${SOURCES} here
  target_link_libraries(${_target}
    player_grpc_proto
    absl::flags
    absl::flags_parse
    ${_REFLECTION}
    ${_GRPC_GRPCPP}
    ${_PROTOBUF_LIBPROTOBUF})
endforeach()
