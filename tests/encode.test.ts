import { Tag, posFixintTag, negFixintTag, fixstrTag, fixarrayTag, fixmapTag } from "../src/tags.ts";
import { Nil, Bool, Int, Uint, Float, Bytes, Str, Arr, Map, Raw, Time, Any, Struct, Union } from "../src/types.ts";
import { encode } from "../src/index.ts";
import { bufEqual, fmtBuf, repeat, repeats } from "./testHelper.ts"

Deno.test("encode", () => {
	const tests = [
		// nil
		{
			val: undefined,
			typ: Nil,
			bin: [Tag.Nil],
		},
		{
			val: null,
			typ: Nil,
			bin: [Tag.Nil],
		},
		{
			val: 7,
			typ: Nil,
			bin: [Tag.Nil],
		},
		{
			val: "foo",
			typ: Nil,
			bin: [Tag.Nil],
		},
		{
			val: [7, "foo"],
			typ: Nil,
			bin: [Tag.Nil],
		},
		// bool
		{
			val: true,
			typ: Bool,
			bin: [Tag.True],
		},
		{
			val: false,
			typ: Bool,
			bin: [Tag.False],
		},
		// int
		{
			val: 7,
			typ: Int,
			bin: [posFixintTag(7)],
		},
		{
			val: -7,
			typ: Int,
			bin: [negFixintTag(-7)],
		},
		{
			val: -128,
			typ: Int,
			bin: [Tag.Int8, 0x80],
		},
		{
			val: -32768,
			typ: Int,
			bin: [Tag.Int16, 0x80, 0x0],
		},
		{
			val: 32767,
			typ: Int,
			bin: [Tag.Int16, 0x7f, 0xff],
		},
		{
			val: 2147483647,
			typ: Int,
			bin: [Tag.Int32, 0x7f, 0xff, 0xff, 0xff],
		},
		{
			val: -2147483648,
			typ: Int,
			bin: [Tag.Int32, 0x80, 0x0, 0x0, 0x0],
		},
		{
			val: 2147483648,
			typ: Int,
			bin: [Tag.Int64, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00],
		},
		{
			val: 4294967296,
			typ: Int,
			bin: [Tag.Int64, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00],
		},
		{
			val: -2147483649,
			typ: Int,
			bin: [Tag.Int64, 0xff, 0xff, 0xff, 0xff, 0x7f, 0xff, 0xff, 0xff],
		},
		{
			val: 549764202560,
			typ: Int,
			bin: [Tag.Int64, 0x00, 0x00, 0x00, 0x80, 0x00, 0x80, 0x00, 0x40],
		},
		{
			val: -549764202560,
			typ: Int,
			bin: [Tag.Int64, 0xff, 0xff, 0xff, 0x7f, 0xff, 0x7f, 0xff, 0xc0],
		},
		// uint
		{
			val: 7,
			typ: Uint,
			bin: [posFixintTag(7)],
		},
		{
			val: 255,
			typ: Uint,
			bin: [Tag.Uint8, 0xff],
		},
		{
			val: 65535,
			typ: Uint,
			bin: [Tag.Uint16, 0xff, 0xff],
		},
		{
			val: 4294967295,
			typ: Uint,
			bin: [Tag.Uint32, 0xff, 0xff, 0xff, 0xff],
		},
		{
			val: 4294967296,
			typ: Uint,
			bin: [Tag.Uint64, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00],
		},
		{
			val: 549764202560,
			typ: Uint,
			bin: [Tag.Uint64, 0x00, 0x00, 0x00, 0x80, 0x00, 0x80, 0x00, 0x40],
		},
		// float
		{
			val: 3.141592,
			typ: Float,
			bin: [Tag.Float64, 0x40, 0x09, 0x21, 0xfa, 0xfc, 0x8b, 0x00, 0x7a],
		},
		// bytes
		{
			val: (new Uint8Array(repeat(0x30, 1))).buffer,
			typ: Bytes,
			bin: [Tag.Bin8, 0x1].concat(repeat(0x30, 1)),
		},
		{
			val: (new Uint8Array(repeat(0x30, 256))).buffer,
			typ: Bytes,
			bin: [Tag.Bin16, 0x01, 0x00].concat(repeat(0x30, 256)),
		},
		{
			val: (new Uint8Array(repeat(0x30, 65536))).buffer,
			typ: Bytes,
			bin: [Tag.Bin32, 0x00, 0x01, 0x00, 0x00].concat(repeat(0x30, 65536)),
		},
		// string
		{
			val: "0",
			typ: Str,
			bin: [fixstrTag(1), 0x30],
		},
		{
			val: "ä",
			typ: Str,
			bin: [fixstrTag(2), 0xc3, 0xa4],
		},
		{
			val: "∞",
			typ: Str,
			bin: [fixstrTag(3), 0xe2, 0x88, 0x9e],
		},
		{
			val: "𐍈",
			typ: Str,
			bin: [fixstrTag(4), 0xf0, 0x90, 0x8d, 0x88],
		},
		{
			val: repeats("0", 7),
			typ: Str,
			bin: [fixstrTag(7)].concat(repeat(0x30, 7)),
		},
		{
			val: repeats("0", 32),
			typ: Str,
			bin: [Tag.Str8, 0x20].concat(repeat(0x30, 32)),
		},
		{
			val: repeats("0", 256),
			typ: Str,
			bin: [Tag.Str16, 0x01, 0x00].concat(repeat(0x30, 256)),
		},
		{
			val: repeats("0", 65536),
			typ: Str,
			bin: [Tag.Str32, 0x00, 0x01, 0x00, 0x00].concat(repeat(0x30, 65536)),
		},
		// array (32 bit not testable due to oom)
		{
			val: repeat(13, 7),
			typ: Arr,
			bin: [fixarrayTag(7)].concat(repeat(posFixintTag(13), 7)),
		},
		{
			val: repeat(13, 65535),
			typ: Arr,
			bin: [Tag.Array16, 0xff, 0xff].concat(repeat(posFixintTag(13), 65535)),
		},
		// map
		{
			val: { a: 7, b: 13 },
			typ: Map,
			bin: [fixmapTag(2), fixstrTag(1), 0x61, posFixintTag(7), fixstrTag(1), 0x62, posFixintTag(13)],
		},
		// raw
		{
			val: (new Uint8Array(repeat(0x30, 7))).buffer,
			typ: Raw,
			bin: repeat(0x30, 7),
		},
		// time
		{
			val: new Date(Date.UTC(2017, 8, 26, 13, 14, 15)),
			typ: Time,
			bin: [Tag.Ext8, 12, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x59, 0xca, 0x52, 0xa7],
		},
		{
			val: new Date(Date.UTC(2017, 8, 26, 13, 14, 15, 16)),
			typ: Time,
			bin: [Tag.Ext8, 12, 0xff, 0x00, 0xf4, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x59, 0xca, 0x52, 0xa7],
		},
		// any
		{
			val: undefined,
			typ: Any,
			bin: [Tag.Nil],
		},
		{
			val: null,
			typ: Any,
			bin: [Tag.Nil],
		},
		{
			val: true,
			typ: Any,
			bin: [Tag.True],
		},
		{
			val: false,
			typ: Any,
			bin: [Tag.False],
		},
		{
			val: -128,
			typ: Any,
			bin: [Tag.Int8, 0x80],
		},
		{
			val: 255,
			typ: Any,
			bin: [Tag.Uint8, 0xff],
		},
		{
			val: 3.141592,
			typ: Any,
			bin: [Tag.Float64, 0x40, 0x09, 0x21, 0xfa, 0xfc, 0x8b, 0x00, 0x7a],
		},
		{
			val: new Uint8Array([0x0a, 0x0b, 0x0c]),
			typ: Any,
			bin: [Tag.Bin8, 0x03, 0x0a, 0x0b, 0x0c],
		},
		{
			val: (new Uint8Array([0x0a, 0x0b, 0x0c])).buffer,
			typ: Any,
			bin: [Tag.Bin8, 0x03, 0x0a, 0x0b, 0x0c],
		},
		{
			val: "12345678901234567890123456789012",
			typ: Any,
			bin: [Tag.Str8, 0x20, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x30, 0x31, 0x32],
		},
		{
			val: [],
			typ: Any,
			bin: [fixarrayTag(0)],
		},
		{
			val: {},
			typ: Any,
			bin: [fixmapTag(0)],
		},
		{
			val: new Date(Date.UTC(2017, 8, 26, 13, 14, 15, 16)),
			typ: Any,
			bin: [Tag.Ext8, 12, 0xff, 0x00, 0xf4, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x59, 0xca, 0x52, 0xa7],
		},
		// struct
		{
			val: {
				foo: 7,
				bar: "7",
			},
			typ: Struct({
				1: ["foo", Int],
				3: ["bar", Str],
			}),
			bin: [fixmapTag(2), posFixintTag(1), posFixintTag(7), posFixintTag(3), fixstrTag(1), 0x37],
		},
		// union
		{
			val: 7,
			typ: Union({
				4: Int,
				6: Str,
				ordinalOf(v: any): number { return 4; },
			}),
			bin: [fixarrayTag(2), posFixintTag(4), posFixintTag(7)],
		},
		{
			val: "7",
			typ: Union({
				13: Str,
				14: Int,
				ordinalOf(v: any): number { return 13; },
			}),
			bin: [fixarrayTag(2), posFixintTag(13), fixstrTag(1), 0x37],
		},
	];

	for (let i = 0; i < tests.length; ++i) {
		const test = tests[i];
		try {
			const bin = encode<any>(test.val, test.typ);
			const expected = new Uint8Array(test.bin);
			if (!bufEqual(bin, expected)) {
				throw new Error(`unexpected encoding at ${i} for '${test.val}': ${fmtBuf(bin)}, expected ${fmtBuf(expected)}`);
			}
		} catch (e) {
			throw new Error(`unexpected encoding error at ${i} for '${test.val}': ${e}`);
		}
	}
});
