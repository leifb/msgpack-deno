import { Tag, posFixintTag, negFixintTag, fixstrTag, fixarrayTag, fixmapTag } from "../src/tags.ts";
import { Nil, Bool, Int, Uint, Float, Bytes, Str, Arr, Map, Raw, Time, Any, Struct, Union } from "../src/types.ts";
import { decode } from "../src/index.ts";
import { arrayEqual, bufEqual, dateEqual, fmtBuf, objectEqual, opEqual, repeat, repeats } from "./testHelper.ts"

Deno.test("decode", () => {
	const tests = [
		// nil
		{
			bin: [Tag.Nil],
			typ: Nil,
			val: null,
		},
		// bool
		{
			bin: [Tag.Nil],
			typ: Bool,
			val: false,
		},
		{
			bin: [Tag.False],
			typ: Bool,
			val: false,
		},
		{
			bin: [Tag.True],
			typ: Bool,
			val: true,
		},
		// int
		{
			bin: [posFixintTag(7)],
			typ: Int,
			val: 7,
		},
		{
			bin: [negFixintTag(-7)],
			typ: Int,
			val: -7,
		},
		{
			bin: [Tag.Nil],
			typ: Int,
			val: 0,
		},
		{
			bin: [Tag.Int8, 0x9e],
			typ: Int,
			val: -98,
		},
		{
			bin: [Tag.Int8, 0x62],
			typ: Int,
			val: 98,
		},
		{
			bin: [Tag.Int8, 0x9e],
			typ: Int,
			val: -98,
		},
		{
			bin: [Tag.Int16, 0x48, 0x72],
			typ: Int,
			val: 18546,
		},
		{
			bin: [Tag.Int16, 0xb7, 0x8e],
			typ: Int,
			val: -18546,
		},
		{
			bin: [Tag.Int32, 0x04, 0x8a, 0x51, 0x9d],
			typ: Int,
			val: 76173725,
		},
		{
			bin: [Tag.Int32, 0xfb, 0x75, 0xae, 0x63],
			typ: Int,
			val: -76173725,
		},
		{
			bin: [Tag.Int64, 0x00, 0x00, 0x04, 0x8a, 0x51, 0x9d, 0x7f, 0xa3],
			typ: Int,
			val: 4992121274275,
		},
		{
			bin: [Tag.Int64, 0xff, 0xff, 0xfb, 0x75, 0xae, 0x62, 0x80, 0x5d],
			typ: Int,
			val: -4992121274275,
		},
		{
			bin: [Tag.Uint8, 0x62],
			typ: Int,
			val: 98,
		},
		{
			bin: [Tag.Uint16, 0x48, 0x72],
			typ: Int,
			val: 18546,
		},
		{
			bin: [Tag.Uint32, 0x04, 0x8a, 0x51, 0x9d],
			typ: Int,
			val: 76173725,
		},
		{
			bin: [Tag.Uint64, 0x00, 0x00, 0x04, 0x8a, 0x51, 0x9d, 0x7f, 0xa3],
			typ: Int,
			val: 4992121274275,
		},
		// uint
		{
			bin: [posFixintTag(7)],
			typ: Int,
			val: 7,
		},
		{
			bin: [Tag.Nil],
			typ: Int,
			val: 0,
		},
		{
			bin: [Tag.Int8, 0x62],
			typ: Int,
			val: 98,
		},
		{
			bin: [Tag.Int16, 0x48, 0x72],
			typ: Int,
			val: 18546,
		},
		{
			bin: [Tag.Int32, 0x04, 0x8a, 0x51, 0x9d],
			typ: Int,
			val: 76173725,
		},
		{
			bin: [Tag.Int64, 0x00, 0x00, 0x04, 0x8a, 0x51, 0x9d, 0x7f, 0xa3],
			typ: Int,
			val: 4992121274275,
		},
		{
			bin: [Tag.Uint8, 0x62],
			typ: Int,
			val: 98,
		},
		{
			bin: [Tag.Uint16, 0x48, 0x72],
			typ: Int,
			val: 18546,
		},
		{
			bin: [Tag.Uint32, 0x04, 0x8a, 0x51, 0x9d],
			typ: Int,
			val: 76173725,
		},
		{
			bin: [Tag.Uint64, 0x00, 0x00, 0x04, 0x8a, 0x51, 0x9d, 0x7f, 0xa3],
			typ: Int,
			val: 4992121274275,
		},
		// float
		{
			bin: [Tag.Nil],
			typ: Float,
			val: 0,
		},
		{
			bin: [Tag.Float32, 0x3f, 0xc0, 0x00, 0x00],
			typ: Float,
			val: 1.5,
		},
		{
			bin: [Tag.Float64, 0x40, 0x09, 0x21, 0xfa, 0xfc, 0x8b, 0x00, 0x7a],
			typ: Float,
			val: 3.141592,
		},
		// bytes
		{
			bin: [fixstrTag(5), 0x30, 0x30, 0x30, 0x30, 0x30],
			typ: Bytes,
			val: new Uint8Array([0x30, 0x30, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Bin8, 0x05, 0x30, 0x30, 0x30, 0x30, 0x30],
			typ: Bytes,
			val: new Uint8Array([0x30, 0x30, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Bin16, 0x01, 0x00].concat(repeat(0x30, 256)),
			typ: Bytes,
			val: new Uint8Array(repeat(0x30, 256)),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Bin32, 0x00, 0x01, 0x00, 0x00].concat(repeat(0x30, 65536)),
			typ: Bytes,
			val: new Uint8Array(repeat(0x30, 65536)),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		// string
		{
			bin: [fixstrTag(2), 0xc3, 0xa4],
			typ: Str,
			val: "ä",
		},
		{
			bin: [fixstrTag(3), 0xe2, 0x88, 0x9e],
			typ: Str,
			val: "∞",
		},
		{
			bin: [fixstrTag(4), 0xf0, 0x90, 0x8d, 0x88],
			typ: Str,
			val: "𐍈",
		},
		{
			bin: [fixstrTag(5), 0x30, 0x30, 0x30, 0x30, 0x30],
			typ: Str,
			val: "00000",
		},
		{
			bin: [Tag.Bin8, 0x05, 0x30, 0x30, 0x30, 0x30, 0x30],
			typ: Str,
			val: "00000",
		},
		{
			bin: [Tag.Bin16, 0x01, 0x00].concat(repeat(0x30, 256)),
			typ: Str,
			val: repeats("0", 256),
		},
		{
			bin: [Tag.Bin32, 0x00, 0x01, 0x00, 0x00].concat(repeat(0x30, 65536)),
			typ: Str,
			val: repeats("0", 65536),
		},
		// array
		{
			bin: [fixarrayTag(2), posFixintTag(7), fixstrTag(1), 0x30],
			typ: Arr,
			val: [7, "0"],
			eq: arrayEqual,
		},
		{
			bin: [Tag.Array16, 0x00, 0x01, negFixintTag(-7)],
			typ: Arr,
			val: [-7],
			eq: arrayEqual,
		},
		{
			bin: [Tag.Array32, 0x00, 0x00, 0x00, 0x01, fixstrTag(3), 0xe2, 0x88, 0x9e],
			typ: Arr,
			val: ["∞"],
			eq: arrayEqual,
		},
		// map
		{
			bin: [fixmapTag(1), fixstrTag(1), 0x61, posFixintTag(7)],
			typ: Map,
			val: { "a": 7 },
			eq: objectEqual,
		},
		{
			bin: [Tag.Map16, 0x00, 0x01, fixstrTag(1), 0x61, posFixintTag(7)],
			typ: Map,
			val: { "a": 7 },
			eq: objectEqual,
		},
		{
			bin: [Tag.Map32, 0x00, 0x00, 0x00, 0x01, fixstrTag(3), 0x69, 0x6e, 0x66, fixstrTag(3), 0xe2, 0x88, 0x9e],
			typ: Map,
			val: { "inf": "∞" },
			eq: objectEqual,
		},
		// raw
		{
			bin: [Tag.True],
			typ: Raw,
			val: new Uint8Array([Tag.True]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Uint8, 0x00],
			typ: Raw,
			val: new Uint8Array([Tag.Uint8, 0x00]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Int16, 0x00, 0x00],
			typ: Raw,
			val: new Uint8Array([Tag.Int16, 0x00, 0x00]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Float32, 0x00, 0x00, 0x00, 0x00],
			typ: Raw,
			val: new Uint8Array([Tag.Float32, 0x00, 0x00, 0x00, 0x00]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Float64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
			typ: Raw,
			val: new Uint8Array([Tag.Float64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Bin8, 0x03, 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.Bin8, 0x03, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Bin16, 0x0, 0x03, 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.Bin16, 0x0, 0x03, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Bin32, 0x0, 0x0, 0x0, 0x03, 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.Bin32, 0x0, 0x0, 0x0, 0x03, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Array16, 0x0, 0x03, Tag.Nil, Tag.Nil, Tag.Nil],
			typ: Raw,
			val: new Uint8Array([Tag.Array16, 0x0, 0x03, Tag.Nil, Tag.Nil, Tag.Nil]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Array32, 0x0, 0x0, 0x0, 0x03, Tag.Nil, Tag.Nil, Tag.Nil],
			typ: Raw,
			val: new Uint8Array([Tag.Array32, 0x0, 0x0, 0x0, 0x03, Tag.Nil, Tag.Nil, Tag.Nil]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Map16, 0x0, 0x03, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil],
			typ: Raw,
			val: new Uint8Array([Tag.Map16, 0x0, 0x03, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Map32, 0x0, 0x0, 0x0, 0x03, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil],
			typ: Raw,
			val: new Uint8Array([Tag.Map32, 0x0, 0x0, 0x0, 0x03, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.FixExt1, 0x0d, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.FixExt1, 0x0d, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.FixExt2, 0x0d, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.FixExt2, 0x0d, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.FixExt4, 0x0d, 0x30, 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.FixExt4, 0x0d, 0x30, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.FixExt8, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.FixExt8, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.FixExt16, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.FixExt16, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Ext8, 0x05, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.Ext8, 0x05, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Ext16, 0x0, 0x05, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.Ext16, 0x0, 0x05, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Ext32, 0x0, 0x0, 0x0, 0x05, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([Tag.Ext32, 0x0, 0x0, 0x0, 0x05, 0x0d, 0x30, 0x30, 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [posFixintTag(7)],
			typ: Raw,
			val: new Uint8Array([posFixintTag(7)]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [negFixintTag(-7)],
			typ: Raw,
			val: new Uint8Array([negFixintTag(-7)]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [fixstrTag(3), 0x30, 0x30, 0x30],
			typ: Raw,
			val: new Uint8Array([fixstrTag(3), 0x30, 0x30, 0x30]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [fixarrayTag(3), Tag.Nil, Tag.Nil, Tag.Nil],
			typ: Raw,
			val: new Uint8Array([fixarrayTag(3), Tag.Nil, Tag.Nil, Tag.Nil]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [fixmapTag(3), Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil],
			typ: Raw,
			val: new Uint8Array([fixmapTag(3), Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil, Tag.Nil]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		// time
		{
			bin: [Tag.FixExt4, 0xff, 0x59, 0xca, 0x52, 0xa7],
			typ: Time,
			val: new Date(Date.UTC(2017, 8, 26, 13, 14, 15)),
			eq: dateEqual,
		},
		{
			bin: [Tag.FixExt8, 0xff, 0x03, 0xd0, 0x90, 0x00, 0x59, 0xca, 0x52, 0xa7],
			typ: Time,
			val: new Date(Date.UTC(2017, 8, 26, 13, 14, 15, 16)),
			eq: dateEqual,
		},
		{
			bin: [Tag.Ext8, 12, 0xff, 0x00, 0xf4, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x59, 0xca, 0x52, 0xa7],
			typ: Time,
			val: new Date(Date.UTC(2017, 8, 26, 13, 14, 15, 16)),
			eq: dateEqual,
		},
		// any
		{
			bin: [Tag.Nil],
			typ: Any,
			val: null,
		},
		{
			bin: [Tag.False],
			typ: Any,
			val: false,
		},
		{
			bin: [Tag.True],
			typ: Any,
			val: true,
		},
		{
			bin: [posFixintTag(7)],
			typ: Any,
			val: 7,
		},
		{
			bin: [negFixintTag(-7)],
			typ: Any,
			val: -7,
		},
		{
			bin: [Tag.Int8, 0x80],
			typ: Any,
			val: -128,
		},
		{
			bin: [Tag.Int16, 0xff, 0x80],
			typ: Any,
			val: -128,
		},
		{
			bin: [Tag.Int32, 0xff, 0xff, 0xff, 0x80],
			typ: Any,
			val: -128,
		},
		{
			bin: [Tag.Int64, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x80],
			typ: Any,
			val: -128,
		},
		{
			bin: [Tag.Uint8, 0x07],
			typ: Any,
			val: 7,
		},
		{
			bin: [Tag.Uint16, 0x01, 0x10],
			typ: Any,
			val: 272,
		},
		{
			bin: [Tag.Uint32, 0x0a, 0x7e, 0x00, 0x43],
			typ: Any,
			val: 176029763,
		},
		{
			bin: [Tag.Uint64, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc],
			typ: Any,
			val: 20015998343868,
		},
		{
			bin: [Tag.Float32, 0x3e, 0x20, 0x00, 0x00],
			typ: Any,
			val: 0.15625,
		},
		{
			bin: [Tag.Float64, 0x40, 0x09, 0x21, 0xfa, 0xfc, 0x8b, 0x00, 0x7a],
			typ: Any,
			val: 3.141592,
		},
		{
			bin: [Tag.Bin8, 0x03, 0x0d, 0x0e, 0x0f],
			typ: Any,
			val: new Uint8Array([0x0d, 0x0e, 0x0f]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Bin16, 0x00, 0x03, 0x0d, 0x0e, 0x0f],
			typ: Any,
			val: new Uint8Array([0x0d, 0x0e, 0x0f]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [Tag.Bin32, 0x00, 0x00, 0x00, 0x03, 0x0d, 0x0e, 0x0f],
			typ: Any,
			val: new Uint8Array([0x0d, 0x0e, 0x0f]),
			eq: (x: any, y: any) => bufEqual(new Uint8Array(x), y),
		},
		{
			bin: [fixstrTag(1), 0x30],
			typ: Any,
			val: "0",
		},
		{
			bin: [Tag.Str8, 0x03, 0xe2, 0x88, 0x9e],
			typ: Any,
			val: "∞",
		},
		{
			bin: [Tag.Str16, 0x00, 0x04, 0xf0, 0x90, 0x8d, 0x88],
			typ: Any,
			val: "𐍈",
		},
		{
			bin: [Tag.Str32, 0x00, 0x00, 0x00, 0x02, 0xc3, 0xa4],
			typ: Any,
			val: "ä",
		},
		{
			bin: [fixarrayTag(1), fixstrTag(1), 0x30],
			typ: Any,
			val: ["0"],
			eq: arrayEqual,
		},
		{
			bin: [Tag.Array16, 0x00, 0x01, posFixintTag(5)],
			typ: Any,
			val: [5],
			eq: arrayEqual,
		},
		{
			bin: [Tag.Array32, 0x00, 0x00, 0x00, 0x01, negFixintTag(-13)],
			typ: Any,
			val: [-13],
			eq: arrayEqual,
		},
		{
			bin: [fixmapTag(1), fixstrTag(1), 0x61, negFixintTag(-12)],
			typ: Any,
			val: { "a": -12 },
			eq: objectEqual,
		},
		{
			bin: [Tag.Map16, 0x00, 0x01, fixstrTag(2), 0xc3, 0xa4, posFixintTag(11)],
			typ: Any,
			val: { "ä": 11 },
			eq: objectEqual,
		},
		{
			bin: [Tag.Map32, 0x00, 0x00, 0x00, 0x01, fixstrTag(2), 0x31, 0x30, fixstrTag(1), 0x32],
			typ: Any,
			val: { "10": "2" },
			eq: objectEqual,
		},
		{
			bin: [Tag.FixExt4, 0xff, 0x59, 0xca, 0x52, 0xa7],
			typ: Any,
			val: new Date(Date.UTC(2017, 8, 26, 13, 14, 15)),
			eq: dateEqual,
		},
		{
			bin: [Tag.FixExt8, 0xff, 0x03, 0xd0, 0x90, 0x00, 0x59, 0xca, 0x52, 0xa7],
			typ: Any,
			val: new Date(Date.UTC(2017, 8, 26, 13, 14, 15, 16)),
			eq: dateEqual,
		},
		{
			bin: [Tag.Ext8, 12, 0xff, 0x00, 0xf4, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x59, 0xca, 0x52, 0xa7],
			typ: Any,
			val: new Date(Date.UTC(2017, 8, 26, 13, 14, 15, 16)),
			eq: dateEqual,
		},
		// struct
		{
			bin: [fixmapTag(2), posFixintTag(1), posFixintTag(7), posFixintTag(3), fixstrTag(1), 0x37],
			typ: Struct({
				1: ["foo", Int],
				3: ["bar", Str],
			}),
			val: {
				foo: 7,
				bar: "7",
			},
			eq: objectEqual,
		},
		// union
		{
			bin: [fixarrayTag(2), posFixintTag(4), posFixintTag(7)],
			typ: Union({
				4: Int,
				6: Str,
				ordinalOf(v: any): number { throw new Error("not implemented"); },
			}),
			val: 7,
		},
		{
			bin: [fixarrayTag(2), posFixintTag(13), fixstrTag(1), 0x37],
			typ: Union({
				13: Str,
				14: Int,
				ordinalOf(v: any): number { throw new Error("not implemented"); },
			}),
			val: "7",
		},
	];

	for (let i = 0; i < tests.length; ++i) {
		const test = tests[i];
		const bin = new Uint8Array(test.bin);
		try {
			const val = decode<any>(bin, test.typ);
			const eq = opEqual(test);
			if (!eq(val, test.val)) {
				throw new Error(`unexpected decoding at ${i} for '${fmtBuf(bin)}': ${val}, expected ${test.val}`);
			}
		} catch (e) {
			throw new Error(`unexpected decoding error at ${i} for '${fmtBuf(bin)}': ${e}`);
		}
	}
});


