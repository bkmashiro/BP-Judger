// Generated by the gRPC C++ plugin.
// If you make any local change, they will be lost.
// source: player.proto
#ifndef GRPC_player_2eproto__INCLUDED
#define GRPC_player_2eproto__INCLUDED

#include "player.pb.h"

#include <functional>
#include <grpcpp/generic/async_generic_service.h>
#include <grpcpp/support/async_stream.h>
#include <grpcpp/support/async_unary_call.h>
#include <grpcpp/support/client_callback.h>
#include <grpcpp/client_context.h>
#include <grpcpp/completion_queue.h>
#include <grpcpp/support/message_allocator.h>
#include <grpcpp/support/method_handler.h>
#include <grpcpp/impl/proto_utils.h>
#include <grpcpp/impl/rpc_method.h>
#include <grpcpp/support/server_callback.h>
#include <grpcpp/impl/server_callback_handlers.h>
#include <grpcpp/server_context.h>
#include <grpcpp/impl/service_type.h>
#include <grpcpp/support/status.h>
#include <grpcpp/support/stub_options.h>
#include <grpcpp/support/sync_stream.h>

class PlayerProxy final {
 public:
  static constexpr char const* service_full_name() {
    return "PlayerProxy";
  }
  class StubInterface {
   public:
    virtual ~StubInterface() {}
    std::unique_ptr< ::grpc::ClientReaderWriterInterface< ::JsonMessage, ::JsonMessage>> Move(::grpc::ClientContext* context) {
      return std::unique_ptr< ::grpc::ClientReaderWriterInterface< ::JsonMessage, ::JsonMessage>>(MoveRaw(context));
    }
    std::unique_ptr< ::grpc::ClientAsyncReaderWriterInterface< ::JsonMessage, ::JsonMessage>> AsyncMove(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq, void* tag) {
      return std::unique_ptr< ::grpc::ClientAsyncReaderWriterInterface< ::JsonMessage, ::JsonMessage>>(AsyncMoveRaw(context, cq, tag));
    }
    std::unique_ptr< ::grpc::ClientAsyncReaderWriterInterface< ::JsonMessage, ::JsonMessage>> PrepareAsyncMove(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq) {
      return std::unique_ptr< ::grpc::ClientAsyncReaderWriterInterface< ::JsonMessage, ::JsonMessage>>(PrepareAsyncMoveRaw(context, cq));
    }
    class async_interface {
     public:
      virtual ~async_interface() {}
      virtual void Move(::grpc::ClientContext* context, ::grpc::ClientBidiReactor< ::JsonMessage,::JsonMessage>* reactor) = 0;
    };
    typedef class async_interface experimental_async_interface;
    virtual class async_interface* async() { return nullptr; }
    class async_interface* experimental_async() { return async(); }
   private:
    virtual ::grpc::ClientReaderWriterInterface< ::JsonMessage, ::JsonMessage>* MoveRaw(::grpc::ClientContext* context) = 0;
    virtual ::grpc::ClientAsyncReaderWriterInterface< ::JsonMessage, ::JsonMessage>* AsyncMoveRaw(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq, void* tag) = 0;
    virtual ::grpc::ClientAsyncReaderWriterInterface< ::JsonMessage, ::JsonMessage>* PrepareAsyncMoveRaw(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq) = 0;
  };
  class Stub final : public StubInterface {
   public:
    Stub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options = ::grpc::StubOptions());
    std::unique_ptr< ::grpc::ClientReaderWriter< ::JsonMessage, ::JsonMessage>> Move(::grpc::ClientContext* context) {
      return std::unique_ptr< ::grpc::ClientReaderWriter< ::JsonMessage, ::JsonMessage>>(MoveRaw(context));
    }
    std::unique_ptr<  ::grpc::ClientAsyncReaderWriter< ::JsonMessage, ::JsonMessage>> AsyncMove(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq, void* tag) {
      return std::unique_ptr< ::grpc::ClientAsyncReaderWriter< ::JsonMessage, ::JsonMessage>>(AsyncMoveRaw(context, cq, tag));
    }
    std::unique_ptr<  ::grpc::ClientAsyncReaderWriter< ::JsonMessage, ::JsonMessage>> PrepareAsyncMove(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq) {
      return std::unique_ptr< ::grpc::ClientAsyncReaderWriter< ::JsonMessage, ::JsonMessage>>(PrepareAsyncMoveRaw(context, cq));
    }
    class async final :
      public StubInterface::async_interface {
     public:
      void Move(::grpc::ClientContext* context, ::grpc::ClientBidiReactor< ::JsonMessage,::JsonMessage>* reactor) override;
     private:
      friend class Stub;
      explicit async(Stub* stub): stub_(stub) { }
      Stub* stub() { return stub_; }
      Stub* stub_;
    };
    class async* async() override { return &async_stub_; }

   private:
    std::shared_ptr< ::grpc::ChannelInterface> channel_;
    class async async_stub_{this};
    ::grpc::ClientReaderWriter< ::JsonMessage, ::JsonMessage>* MoveRaw(::grpc::ClientContext* context) override;
    ::grpc::ClientAsyncReaderWriter< ::JsonMessage, ::JsonMessage>* AsyncMoveRaw(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq, void* tag) override;
    ::grpc::ClientAsyncReaderWriter< ::JsonMessage, ::JsonMessage>* PrepareAsyncMoveRaw(::grpc::ClientContext* context, ::grpc::CompletionQueue* cq) override;
    const ::grpc::internal::RpcMethod rpcmethod_Move_;
  };
  static std::unique_ptr<Stub> NewStub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options = ::grpc::StubOptions());

  class Service : public ::grpc::Service {
   public:
    Service();
    virtual ~Service();
    virtual ::grpc::Status Move(::grpc::ServerContext* context, ::grpc::ServerReaderWriter< ::JsonMessage, ::JsonMessage>* stream);
  };
  template <class BaseClass>
  class WithAsyncMethod_Move : public BaseClass {
   private:
    void BaseClassMustBeDerivedFromService(const Service* /*service*/) {}
   public:
    WithAsyncMethod_Move() {
      ::grpc::Service::MarkMethodAsync(0);
    }
    ~WithAsyncMethod_Move() override {
      BaseClassMustBeDerivedFromService(this);
    }
    // disable synchronous version of this method
    ::grpc::Status Move(::grpc::ServerContext* /*context*/, ::grpc::ServerReaderWriter< ::JsonMessage, ::JsonMessage>* /*stream*/)  override {
      abort();
      return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
    }
    void RequestMove(::grpc::ServerContext* context, ::grpc::ServerAsyncReaderWriter< ::JsonMessage, ::JsonMessage>* stream, ::grpc::CompletionQueue* new_call_cq, ::grpc::ServerCompletionQueue* notification_cq, void *tag) {
      ::grpc::Service::RequestAsyncBidiStreaming(0, context, stream, new_call_cq, notification_cq, tag);
    }
  };
  typedef WithAsyncMethod_Move<Service > AsyncService;
  template <class BaseClass>
  class WithCallbackMethod_Move : public BaseClass {
   private:
    void BaseClassMustBeDerivedFromService(const Service* /*service*/) {}
   public:
    WithCallbackMethod_Move() {
      ::grpc::Service::MarkMethodCallback(0,
          new ::grpc::internal::CallbackBidiHandler< ::JsonMessage, ::JsonMessage>(
            [this](
                   ::grpc::CallbackServerContext* context) { return this->Move(context); }));
    }
    ~WithCallbackMethod_Move() override {
      BaseClassMustBeDerivedFromService(this);
    }
    // disable synchronous version of this method
    ::grpc::Status Move(::grpc::ServerContext* /*context*/, ::grpc::ServerReaderWriter< ::JsonMessage, ::JsonMessage>* /*stream*/)  override {
      abort();
      return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
    }
    virtual ::grpc::ServerBidiReactor< ::JsonMessage, ::JsonMessage>* Move(
      ::grpc::CallbackServerContext* /*context*/)
      { return nullptr; }
  };
  typedef WithCallbackMethod_Move<Service > CallbackService;
  typedef CallbackService ExperimentalCallbackService;
  template <class BaseClass>
  class WithGenericMethod_Move : public BaseClass {
   private:
    void BaseClassMustBeDerivedFromService(const Service* /*service*/) {}
   public:
    WithGenericMethod_Move() {
      ::grpc::Service::MarkMethodGeneric(0);
    }
    ~WithGenericMethod_Move() override {
      BaseClassMustBeDerivedFromService(this);
    }
    // disable synchronous version of this method
    ::grpc::Status Move(::grpc::ServerContext* /*context*/, ::grpc::ServerReaderWriter< ::JsonMessage, ::JsonMessage>* /*stream*/)  override {
      abort();
      return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
    }
  };
  template <class BaseClass>
  class WithRawMethod_Move : public BaseClass {
   private:
    void BaseClassMustBeDerivedFromService(const Service* /*service*/) {}
   public:
    WithRawMethod_Move() {
      ::grpc::Service::MarkMethodRaw(0);
    }
    ~WithRawMethod_Move() override {
      BaseClassMustBeDerivedFromService(this);
    }
    // disable synchronous version of this method
    ::grpc::Status Move(::grpc::ServerContext* /*context*/, ::grpc::ServerReaderWriter< ::JsonMessage, ::JsonMessage>* /*stream*/)  override {
      abort();
      return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
    }
    void RequestMove(::grpc::ServerContext* context, ::grpc::ServerAsyncReaderWriter< ::grpc::ByteBuffer, ::grpc::ByteBuffer>* stream, ::grpc::CompletionQueue* new_call_cq, ::grpc::ServerCompletionQueue* notification_cq, void *tag) {
      ::grpc::Service::RequestAsyncBidiStreaming(0, context, stream, new_call_cq, notification_cq, tag);
    }
  };
  template <class BaseClass>
  class WithRawCallbackMethod_Move : public BaseClass {
   private:
    void BaseClassMustBeDerivedFromService(const Service* /*service*/) {}
   public:
    WithRawCallbackMethod_Move() {
      ::grpc::Service::MarkMethodRawCallback(0,
          new ::grpc::internal::CallbackBidiHandler< ::grpc::ByteBuffer, ::grpc::ByteBuffer>(
            [this](
                   ::grpc::CallbackServerContext* context) { return this->Move(context); }));
    }
    ~WithRawCallbackMethod_Move() override {
      BaseClassMustBeDerivedFromService(this);
    }
    // disable synchronous version of this method
    ::grpc::Status Move(::grpc::ServerContext* /*context*/, ::grpc::ServerReaderWriter< ::JsonMessage, ::JsonMessage>* /*stream*/)  override {
      abort();
      return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
    }
    virtual ::grpc::ServerBidiReactor< ::grpc::ByteBuffer, ::grpc::ByteBuffer>* Move(
      ::grpc::CallbackServerContext* /*context*/)
      { return nullptr; }
  };
  typedef Service StreamedUnaryService;
  typedef Service SplitStreamedService;
  typedef Service StreamedService;
};


#endif  // GRPC_player_2eproto__INCLUDED