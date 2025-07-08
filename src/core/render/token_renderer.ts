import { IToken } from "src/core/types/core-types";
import { DefinedTokenType, UnknownTokenType } from "src/core/types/token-types";

type TokenRendererFn = (
    token: IToken,
    keywords: Set<string>,
    customIdentifiers: string[],
    level: number,
    isStatic: boolean,
) => string;

export class TokenRendererRegistry {
    private renderers = new Map<DefinedTokenType, TokenRendererFn>();

    register(type: DefinedTokenType, fn: TokenRendererFn) {
        this.renderers.set(type, fn);
    }

    render(
        token: IToken,
        keywords: Set<string>,
        customIdentifiers: string[],
        level: number,
        isStatic: boolean = false,
    ): string {
        if (token.tokenType instanceof UnknownTokenType)
            throw new Error(`Unknown token type: ${token.tokenType}`);

        const fn = this.renderers.get(token.tokenType);
        if (!fn) throw new Error(`No renderer registered for token type: ${token.tokenType}`);
        return fn(token, keywords, customIdentifiers, level, isStatic);
    }
}