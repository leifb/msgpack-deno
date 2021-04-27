import { Tag } from "./tags.ts";

export function typeError(tag: Tag, expected: string): never {
	throw new TypeError(`unexpected tag 0x${tag.toString(16)} (${expected} expected)`);
}
