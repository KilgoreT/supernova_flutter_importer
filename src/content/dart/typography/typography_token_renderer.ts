import { IToken } from "src/core/types/core-types";
import { extractTypographyStyle } from "src/content/types/typography_style";
import { generateIdentifier } from "src/core/naming/identifier_gen";
import { NamingTarget } from "src/core/types/naming_types";

export function renderTypographyToken(token: IToken, isStatic: boolean = false, level: number): string {

    const indent = (lvl: number) => '  '.repeat(lvl);

    const params = extractTypographyStyle(token);
    let out = '';
    if (params == null) return out;
    const styleParts: string[] = [];

    if (params.fontFamily)
        styleParts.push(`fontFamily: '${params.fontFamily}'`);
    styleParts.push(`package: 'ui_kit_litnet_audio'`);
    if (params.fontWeight)
        styleParts.push(`fontWeight: FontWeight.${params.fontWeight}`);
    if (params.textCase)
        styleParts.push(`fontStyle: FontStyle.${params.textCase === 'Italic' ? 'italic' : 'normal'}`);
    if (params.fontSize)
        styleParts.push(`fontSize: h${params.fontSize}`);
    if (params.textDecoration) {
        if (params.textDecoration === 'Strikethrough')
            styleParts.push(`decoration: TextDecoration.lineThrough`);
        else if (params.textDecoration === 'Underline')
            styleParts.push(`decoration: TextDecoration.underline`);
        else if (params.textDecoration === 'Overline')
            styleParts.push(`decoration: TextDecoration.overline`);
        else
            styleParts.push(`decoration: TextDecoration.none`);
    }
    if (params.letterSpacing)
        styleParts.push(`letterSpacing: ${params.letterSpacing}`);
    if (params.lineHeight)
        styleParts.push(`height: ${params.lineHeight}`);

    styleParts.push(`leadingDistribution: TextLeadingDistribution.even`);

    const styleBody = styleParts.join(',\n' + indent(level + 3));
    const fieldName = generateIdentifier(token.name, NamingTarget.Field);

    if (isStatic) {
        out += indent(level + 1) + `static final ${fieldName} = TextStyle(\n`;
    } else {
        out += indent(level + 1) + `final ${fieldName} = TextStyle(\n`;
    }
    out += indent(level + 2) + `${styleBody},\n`;
    out += indent(level + 1) + `);\n\n`;

    return out;
}