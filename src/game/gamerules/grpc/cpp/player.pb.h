// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: player.proto

#ifndef GOOGLE_PROTOBUF_INCLUDED_player_2eproto_2epb_2eh
#define GOOGLE_PROTOBUF_INCLUDED_player_2eproto_2epb_2eh

#include <limits>
#include <string>
#include <type_traits>

#include "google/protobuf/port_def.inc"
#if PROTOBUF_VERSION < 4023000
#error "This file was generated by a newer version of protoc which is"
#error "incompatible with your Protocol Buffer headers. Please update"
#error "your headers."
#endif  // PROTOBUF_VERSION

#if 4023001 < PROTOBUF_MIN_PROTOC_VERSION
#error "This file was generated by an older version of protoc which is"
#error "incompatible with your Protocol Buffer headers. Please"
#error "regenerate this file with a newer version of protoc."
#endif  // PROTOBUF_MIN_PROTOC_VERSION
#include "google/protobuf/port_undef.inc"
#include "google/protobuf/io/coded_stream.h"
#include "google/protobuf/arena.h"
#include "google/protobuf/arenastring.h"
#include "google/protobuf/generated_message_util.h"
#include "google/protobuf/metadata_lite.h"
#include "google/protobuf/generated_message_reflection.h"
#include "google/protobuf/message.h"
#include "google/protobuf/repeated_field.h"  // IWYU pragma: export
#include "google/protobuf/extension_set.h"  // IWYU pragma: export
#include "google/protobuf/unknown_field_set.h"
// @@protoc_insertion_point(includes)

// Must be included last.
#include "google/protobuf/port_def.inc"

#define PROTOBUF_INTERNAL_EXPORT_player_2eproto

PROTOBUF_NAMESPACE_OPEN
namespace internal {
class AnyMetadata;
}  // namespace internal
PROTOBUF_NAMESPACE_CLOSE

// Internal implementation detail -- do not use these members.
struct TableStruct_player_2eproto {
  static const ::uint32_t offsets[];
};
extern const ::PROTOBUF_NAMESPACE_ID::internal::DescriptorTable
    descriptor_table_player_2eproto;
class JsonMessage;
struct JsonMessageDefaultTypeInternal;
extern JsonMessageDefaultTypeInternal _JsonMessage_default_instance_;
PROTOBUF_NAMESPACE_OPEN
template <>
::JsonMessage* Arena::CreateMaybeMessage<::JsonMessage>(Arena*);
PROTOBUF_NAMESPACE_CLOSE


// ===================================================================


// -------------------------------------------------------------------

class JsonMessage final :
    public ::PROTOBUF_NAMESPACE_ID::Message /* @@protoc_insertion_point(class_definition:JsonMessage) */ {
 public:
  inline JsonMessage() : JsonMessage(nullptr) {}
  ~JsonMessage() override;
  template<typename = void>
  explicit PROTOBUF_CONSTEXPR JsonMessage(::PROTOBUF_NAMESPACE_ID::internal::ConstantInitialized);

  JsonMessage(const JsonMessage& from);
  JsonMessage(JsonMessage&& from) noexcept
    : JsonMessage() {
    *this = ::std::move(from);
  }

  inline JsonMessage& operator=(const JsonMessage& from) {
    CopyFrom(from);
    return *this;
  }
  inline JsonMessage& operator=(JsonMessage&& from) noexcept {
    if (this == &from) return *this;
    if (GetOwningArena() == from.GetOwningArena()
  #ifdef PROTOBUF_FORCE_COPY_IN_MOVE
        && GetOwningArena() != nullptr
  #endif  // !PROTOBUF_FORCE_COPY_IN_MOVE
    ) {
      InternalSwap(&from);
    } else {
      CopyFrom(from);
    }
    return *this;
  }

  inline const ::PROTOBUF_NAMESPACE_ID::UnknownFieldSet& unknown_fields() const {
    return _internal_metadata_.unknown_fields<::PROTOBUF_NAMESPACE_ID::UnknownFieldSet>(::PROTOBUF_NAMESPACE_ID::UnknownFieldSet::default_instance);
  }
  inline ::PROTOBUF_NAMESPACE_ID::UnknownFieldSet* mutable_unknown_fields() {
    return _internal_metadata_.mutable_unknown_fields<::PROTOBUF_NAMESPACE_ID::UnknownFieldSet>();
  }

  static const ::PROTOBUF_NAMESPACE_ID::Descriptor* descriptor() {
    return GetDescriptor();
  }
  static const ::PROTOBUF_NAMESPACE_ID::Descriptor* GetDescriptor() {
    return default_instance().GetMetadata().descriptor;
  }
  static const ::PROTOBUF_NAMESPACE_ID::Reflection* GetReflection() {
    return default_instance().GetMetadata().reflection;
  }
  static const JsonMessage& default_instance() {
    return *internal_default_instance();
  }
  static inline const JsonMessage* internal_default_instance() {
    return reinterpret_cast<const JsonMessage*>(
               &_JsonMessage_default_instance_);
  }
  static constexpr int kIndexInFileMessages =
    0;

  friend void swap(JsonMessage& a, JsonMessage& b) {
    a.Swap(&b);
  }
  inline void Swap(JsonMessage* other) {
    if (other == this) return;
  #ifdef PROTOBUF_FORCE_COPY_IN_SWAP
    if (GetOwningArena() != nullptr &&
        GetOwningArena() == other->GetOwningArena()) {
   #else  // PROTOBUF_FORCE_COPY_IN_SWAP
    if (GetOwningArena() == other->GetOwningArena()) {
  #endif  // !PROTOBUF_FORCE_COPY_IN_SWAP
      InternalSwap(other);
    } else {
      ::PROTOBUF_NAMESPACE_ID::internal::GenericSwap(this, other);
    }
  }
  void UnsafeArenaSwap(JsonMessage* other) {
    if (other == this) return;
    ABSL_DCHECK(GetOwningArena() == other->GetOwningArena());
    InternalSwap(other);
  }

  // implements Message ----------------------------------------------

  JsonMessage* New(::PROTOBUF_NAMESPACE_ID::Arena* arena = nullptr) const final {
    return CreateMaybeMessage<JsonMessage>(arena);
  }
  using ::PROTOBUF_NAMESPACE_ID::Message::CopyFrom;
  void CopyFrom(const JsonMessage& from);
  using ::PROTOBUF_NAMESPACE_ID::Message::MergeFrom;
  void MergeFrom( const JsonMessage& from) {
    JsonMessage::MergeImpl(*this, from);
  }
  private:
  static void MergeImpl(::PROTOBUF_NAMESPACE_ID::Message& to_msg, const ::PROTOBUF_NAMESPACE_ID::Message& from_msg);
  public:
  PROTOBUF_ATTRIBUTE_REINITIALIZES void Clear() final;
  bool IsInitialized() const final;

  ::size_t ByteSizeLong() const final;
  const char* _InternalParse(const char* ptr, ::PROTOBUF_NAMESPACE_ID::internal::ParseContext* ctx) final;
  ::uint8_t* _InternalSerialize(
      ::uint8_t* target, ::PROTOBUF_NAMESPACE_ID::io::EpsCopyOutputStream* stream) const final;
  int GetCachedSize() const final { return _impl_._cached_size_.Get(); }

  private:
  void SharedCtor(::PROTOBUF_NAMESPACE_ID::Arena* arena);
  void SharedDtor();
  void SetCachedSize(int size) const final;
  void InternalSwap(JsonMessage* other);

  private:
  friend class ::PROTOBUF_NAMESPACE_ID::internal::AnyMetadata;
  static ::absl::string_view FullMessageName() {
    return "JsonMessage";
  }
  protected:
  explicit JsonMessage(::PROTOBUF_NAMESPACE_ID::Arena* arena);
  public:

  static const ClassData _class_data_;
  const ::PROTOBUF_NAMESPACE_ID::Message::ClassData*GetClassData() const final;

  ::PROTOBUF_NAMESPACE_ID::Metadata GetMetadata() const final;

  // nested types ----------------------------------------------------

  // accessors -------------------------------------------------------

  enum : int {
    kJsonFieldNumber = 1,
  };
  // string json = 1;
  void clear_json() ;
  const std::string& json() const;




  template <typename Arg_ = const std::string&, typename... Args_>
  void set_json(Arg_&& arg, Args_... args);
  std::string* mutable_json();
  PROTOBUF_NODISCARD std::string* release_json();
  void set_allocated_json(std::string* ptr);

  private:
  const std::string& _internal_json() const;
  inline PROTOBUF_ALWAYS_INLINE void _internal_set_json(
      const std::string& value);
  std::string* _internal_mutable_json();

  public:
  // @@protoc_insertion_point(class_scope:JsonMessage)
 private:
  class _Internal;

  template <typename T> friend class ::PROTOBUF_NAMESPACE_ID::Arena::InternalHelper;
  typedef void InternalArenaConstructable_;
  typedef void DestructorSkippable_;
  struct Impl_ {
    ::PROTOBUF_NAMESPACE_ID::internal::ArenaStringPtr json_;
    mutable ::PROTOBUF_NAMESPACE_ID::internal::CachedSize _cached_size_;
  };
  union { Impl_ _impl_; };
  friend struct ::TableStruct_player_2eproto;
};

// ===================================================================




// ===================================================================


#ifdef __GNUC__
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wstrict-aliasing"
#endif  // __GNUC__
// -------------------------------------------------------------------

// JsonMessage

// string json = 1;
inline void JsonMessage::clear_json() {
  _impl_.json_.ClearToEmpty();
}
inline const std::string& JsonMessage::json() const {
  // @@protoc_insertion_point(field_get:JsonMessage.json)
  return _internal_json();
}
template <typename Arg_, typename... Args_>
inline PROTOBUF_ALWAYS_INLINE void JsonMessage::set_json(Arg_&& arg,
                                                     Args_... args) {
  ;
  _impl_.json_.Set(static_cast<Arg_&&>(arg), args..., GetArenaForAllocation());
  // @@protoc_insertion_point(field_set:JsonMessage.json)
}
inline std::string* JsonMessage::mutable_json() {
  std::string* _s = _internal_mutable_json();
  // @@protoc_insertion_point(field_mutable:JsonMessage.json)
  return _s;
}
inline const std::string& JsonMessage::_internal_json() const {
  return _impl_.json_.Get();
}
inline void JsonMessage::_internal_set_json(const std::string& value) {
  ;


  _impl_.json_.Set(value, GetArenaForAllocation());
}
inline std::string* JsonMessage::_internal_mutable_json() {
  ;
  return _impl_.json_.Mutable( GetArenaForAllocation());
}
inline std::string* JsonMessage::release_json() {
  // @@protoc_insertion_point(field_release:JsonMessage.json)
  return _impl_.json_.Release();
}
inline void JsonMessage::set_allocated_json(std::string* value) {
  _impl_.json_.SetAllocated(value, GetArenaForAllocation());
  #ifdef PROTOBUF_FORCE_COPY_DEFAULT_STRING
        if (_impl_.json_.IsDefault()) {
          _impl_.json_.Set("", GetArenaForAllocation());
        }
  #endif  // PROTOBUF_FORCE_COPY_DEFAULT_STRING
  // @@protoc_insertion_point(field_set_allocated:JsonMessage.json)
}

#ifdef __GNUC__
#pragma GCC diagnostic pop
#endif  // __GNUC__

// @@protoc_insertion_point(namespace_scope)


// @@protoc_insertion_point(global_scope)

#include "google/protobuf/port_undef.inc"

#endif  // GOOGLE_PROTOBUF_INCLUDED_player_2eproto_2epb_2eh