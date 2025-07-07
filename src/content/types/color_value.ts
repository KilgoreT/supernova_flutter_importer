import { ColorToken } from "@supernovaio/sdk-exporters";
import { IToken } from "src/core/types/core-types";


function toDartColor(token: ColorToken): string | null {
    const rawHex = token.toHex8?.();
    if (!rawHex || !rawHex.startsWith("#") || rawHex.length !== 9) return null;

    const hex = rawHex.slice(1);
    const reordered = hex.slice(6, 8) + hex.slice(0, 6);
    return `${reordered.toUpperCase()}`;
}

export function extractColorValue(token: IToken): string | null {
    const tokenColor = token.raw as ColorToken;
    return toDartColor(tokenColor);
}