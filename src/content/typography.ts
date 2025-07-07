
import { TokenTree, TreeNode } from "./index";
import { extractTypographyStyle } from "./types/typography_style"
import { filterTreeByTokenType } from "./index";
import { DefinedTokenType } from "./index";
import { IToken } from "./index";
import { NamingTarget } from "../core/types/naming_types";
import { generateIdentifier } from "../core/naming/identifier_gen";

function appendTypographyTokenStyle(
    token: IToken,
    level: number,
    indent: (lvl: number) => string
): string {
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

    const styleBody = styleParts.join(',\n' + indent(3));
    const fieldName = generateIdentifier(token.name, NamingTarget.Field);

    if (level == 0) {
        out += indent(1) + `static final ${fieldName} = TextStyle(\n`;
    } else {
        out += indent(1) + `final ${fieldName} = TextStyle(\n`;
    }
    out += indent(2) + `${styleBody},\n`;
    out += indent(1) + `);\n\n`;

    return out;
}


function generateDartFromTree(
    startNode: TreeNode,
    classPrefix: string = '',
    level: number = 0
): string {

    const indent = (lvl: number) => '  '.repeat(lvl);
    let out = '';

    const className = generateIdentifier(
        startNode.tokenGroup.name,
        NamingTarget.Class,
        classPrefix,
    );
    out += `class ${className} {\n`;
    out += indent(1) + `${className}._();\n\n`;

    for (const [, child] of startNode.children) {
        const fieldName = generateIdentifier(
            child.tokenGroup.name,
            NamingTarget.Field,
        );
        const childClassName = generateIdentifier(
            fieldName,
            NamingTarget.Class,
            className,
        );
        if (level == 0) {
            out += indent(1) + `static final ${fieldName} = ${childClassName}._();\n`;
        } else {
            out += indent(1) + `final ${fieldName} = ${childClassName}._();\n`;
        }
    }

    for (const token of startNode.tokens ?? []) {
        out += appendTypographyTokenStyle(token, level, indent);
    }

    out += `}\n\n`;

    for (const [, child] of startNode.children) {
        out += generateDartFromTree(child, className, level + 1);
    }
    return out;
}

export function generateTypography(
    tree: TokenTree,
): Array<{
    name: string;
    path: string;
    content: string;
}> {

    const typographyTree = filterTreeByTokenType(tree, DefinedTokenType.Typography);

    const result: Array<{ name: string; path: string; content: string }> = [];

    for (const root of typographyTree.roots) {
        for (const [, startNode] of root.children) {
            const body = generateDartFromTree(startNode);
            const fileName = generateIdentifier(
                startNode.tokenGroup.name,
                NamingTarget.File,
            );
            result.push({
                name: fileName,
                path: `supernova/text_style`,
                content: `import 'package:flutter/material.dart'; \nimport 'package:ui_kit_litnet_audio/utils/sizes.dart'; \n\n${body.trim()} `,
            });
        }
    }
    return result;
}