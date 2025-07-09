import { TokenGroup, Token } from "@supernovaio/sdk-exporters"
import { CoreTokenType, mapRawTypeToCoreTokenType } from "src/core/entity/token";

export interface ITokenGroup {
    id: string;
    name: string;
    parentGroupId: string | null;
    tokenType: CoreTokenType;
    raw: TokenGroup;
}

export interface IToken {
    id: string;
    name: string;
    parentGroupId: string;
    tokenType: CoreTokenType;
    raw: Token;
}

export function toITokenGroup(raw: TokenGroup): ITokenGroup {
    const mapped = mapRawTypeToCoreTokenType(raw.tokenType);
    return {
        id: raw.id,
        name: raw.name,
        parentGroupId: raw.parentGroupId,
        tokenType: mapped,
        raw,
    };
}


export function toIToken(raw: Token): IToken {
    const mapped = mapRawTypeToCoreTokenType(raw.tokenType);
    return {
        id: raw.id,
        name: raw.name,
        parentGroupId: raw.parentGroupId,
        tokenType: mapped,
        raw,
    };
}