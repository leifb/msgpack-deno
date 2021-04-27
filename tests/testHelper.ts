
export function repeat<T>(x: T, n: number): T[] {
    let res = [];
    for (let i = 0; i < n; ++i) {
        res.push(x);
    }
    return res;
}

export function repeats(s: string, n: number): string {
    let res = "";
    for (let i = 0; i < n; ++i) {
        res += s;
    }
    return res;
}

export function fmtBuf(buf: Uint8Array): string {
    const list = Array.prototype.map.call(buf, x => `0${x.toString(16)}`.slice(-2)).join(",");
    return `[${list}]`;
}

export function opEqual(test: any): (x: any, y: any) => boolean {
    if (test.eq) {
        return test.eq;
    }
    return (x, y) => x === y;
}

export function arrayEqual(x: any[], y: any[]): boolean {
    return x.length === y.length
        && x.every((v, i) => v === y[i]);
}

export function objectEqual(x: any, y: any): boolean {
    for (const p in x) {
        if (!(p in y) || x[p] !== y[p]) {
            return false;
        }
    }
    for (const p in y) {
        if (!(p in x) || x[p] !== y[p]) {
            return false;
        }
    }
    return true;
}

export function bufEqual(left: Uint8Array, right: Uint8Array): boolean {
    if (left.length !== right.length) {
        return false;
    }
    for (let i = 0; i < left.length; ++i) {
        if (left[i] !== right[i]) {
            return false;
        }
    }
    return true;
}

export function dateEqual(left: Date, right: Date): boolean {
    return left.getTime() === right.getTime();
}
