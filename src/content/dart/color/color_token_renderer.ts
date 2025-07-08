import { IToken } from "src/core/types/core-types";
import { generateIdentifier } from "src/core/naming/identifier_gen";
import { NamingTarget } from "src/core/types/naming_types";
import { extractColorValue } from "src/content/types/color_value";


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