import {
    IToken,
    generateIdentifier,
    NamingTarget,

} from "src/content";

import { extractColorValue } from "src/content/entities/color_value";


export function renderColorToken(
    token: IToken,
    keywords: Set<string>,
    customIdentifiers: string[],
    level: number,
    isStatic: boolean = false,
): string {

    const indent = (lvl: number) => '  '.repeat(lvl);

    const colorValue = extractColorValue(token);
    if (!colorValue) return '';
    let out = '';

    const fieldName = generateIdentifier(
        token.name,
        NamingTarget.Field,
        keywords,
        customIdentifiers,
    );

    if (isStatic) {
        out += indent(level + 1) + `static final ${fieldName} = const Color(0x${colorValue.toUpperCase()});\n`;
    } else {
        out += indent(level + 1) + `final ${fieldName} = const Color(0x${colorValue.toUpperCase()});\n`;
    }

    return out;
}