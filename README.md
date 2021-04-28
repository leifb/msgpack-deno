# msgpack-deno

`msgpack-deno` is a [MessagePack](http://msgpack.org/) implementation for the deno runtime in TypeScript. It has been forked and adapted to work with deno from [mprot/msgpack-js](https://github.com/mprot/msgpack-js).
Changes are mostly limited to types and imports, the actual implementation of the encoding and decoding is still the same.

## Encoding

To encode objects into the binary MessagePack format, an `encode` function is provided:

```typescript
function encode<T>(v: T, typ?: Type<T>): Uint8Array;
```

This function takes an object of an arbitrary type and converts it to its binary representation. If the type of the object is known in advance, an optional `typ` parameter could be passed to indicate the encoding algorithm. For an automatic type detection this parameter could be omitted. All available types are exported by `mod.ts`.

## Decoding

To decode binary MessagePack data into objects, a `decode` function is provided:

```typescript
function decode<T>(buf: BufferSource, typ?: Type<T>): T;
```

This function takes a buffer containing the binary data and converts it to an object. The buffer could either be an `ArrayBuffer` or an `ArrayBufferView` and should contain valid MessagePack data. If a certain type is expected, an optional `typ` parameter could be passed, using the same types as `encode`. For automatic detection from the buffer's content this parameter could be omitted.

## Example

```typescript
import {encode, decode} from "messagepack";

const bin1 = encode({foo: 7, bar: "seven"});
const obj = decode(bin1);
console.log(obj);

const bin2 = encode("foobar");
const str = decode(bin2);
console.log(str);
```

## Types

Bothe the `encode` and `decode` functions can take a type parameter to hint the type of what is being encoded or decoded. If the object or the binary data has an incompatible type, an error will be thrown.

The following types are supported:
* `Nil` for null values,
* `Bool` for boolean values,
* `Int` for signed integer values,
* `Uint` for unsigned integer values,
* `Float` for floating-point values,
* `Bytes` for binary data,
* `Str` for string values,
* `Arr` for arrays,
* `Map` for objects,
* `Raw` for already encoded values,
* `Time` for date and time values, and
* `Any` for automatically detecting the type and forward it to one of the types above.

The `Arr` and `Map` types provide generic encoding and decoding for their elements, i.e. `Arr` and `Map` essentially equal `Any[]` and `Map<Str, Any>` respectively. If more stringent element types are required, the `TypedArr` and `TypedMap` functions could be used instead:

```typescript
import {TypedArr, TypedMap, Int, Str} from "messagepack";

const IntArray = TypedArr(Int);
const IntStrMap = TypedMap(Int, Str);
```

### Structs

A struct is an object type with a predefined shape. To define such a type, the function

```typescript
function Struct(fields: Fields): Type<Obj<any>>;
```

can be used, which creates a type out of the predefined fields. All fields, that do not belong to the struct definition, will be omitted during the encoding and decoding process. To save some bytes and allow name changes, a struct is not simply encoded as a map with string keys. Instead, each field consists of a name, a type, and an ordinal, where the ordinal is used to uniquely identify a field.

Here is an example, how define a struct:

```typescript
import {Struct, Int, Str} from "messagepack";

const S = Struct({
    // ordinal: [name, type],
    1: ["foo", Int],
    2: ["bar", Str],
});
```

If only the encoding or decoding capability is necessary, the functions

```typescript
function structEncoder(fields: Fields): EncodeFunc<any>;
function structDecoder(fields: Fields): DecodeFunc<any>;
```

can be used to create encoder and decoder functions respectively.

### Unions

A union is a value, that can be one of several types. To define a union type, the function

```typescript
function Union(branches: Branches): Type<any>;
```

can be used, which creates a type out of the predefined branches. Each branch consists of an ordinal and a type. If a type should be encoded or decoded, that is not part of the union definition, an exception will be thrown.

Here is an example, how to define a union:

```typescript
import {Union, Int, Str} from "messagepack";

const U = Union({
    // ordinal: type,
    1: Int,
    2: Str,
});
```

If only the encoding or decoding capability is necessary, the functions

```typescript
function unionEncoder(branches: Branches): EncodeFunc<any>;
function unionDecoder(branches: Branches): DecodeFunc<any>;
```

can be used to create encoder and decoder functions respectively.
