import {
    IToken,
    generateIdentifier,
    NamingTarget,

} from "src/content/index";
import { extractTypographyStyle } from "src/content/entities/typography_style";

export function renderTypographyToken(
    token: IToken,
    keywords: Set<string>,
    customIdentifiers: string[],
    level: number,
    isStatic: boolean = false,
): string {

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
    const fieldName = generateIdentifier(
        token.name,
        NamingTarget.Field,
        keywords,
        customIdentifiers,
    );

    if (isStatic) {
        out += indent(level + 1) + `static final ${fieldName} = TextStyle(\n`;
    } else {
        out += indent(level + 1) + `final ${fieldName} = TextStyle(\n`;
    }
    out += indent(level + 2) + `${styleBody},\n`;
    out += indent(level + 1) + `);\n\n`;

    return out;
}