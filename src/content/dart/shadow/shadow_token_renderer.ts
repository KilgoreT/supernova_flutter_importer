import { IToken } from "src/core/types/core-types";
import { generateIdentifier } from "src/core/naming/identifier_gen";
import { NamingTarget } from "src/core/types/naming_types";
import { ShadowToken } from "@supernovaio/sdk-exporters";


export function renderShadowToken(token: IToken, isStatic: boolean = false, level: number): string {

    const indent = (lvl: number) => '  '.repeat(lvl);

    const shadowToken = token.raw as ShadowToken

    if (!shadowToken) return '';
    let out = '';

    const fieldName = generateIdentifier(token.name, NamingTarget.Field);

    if (isStatic) {
        out += indent(level + 1) + `static final ${fieldName} = const Shadow(0x${shadowToken.toString().toUpperCase()});\n`;
    } else {
        out += indent(level + 1) + `final ${fieldName} = const Shadow(0x${shadowToken.toString().toUpperCase()});\n`;
    }

    return out;
}