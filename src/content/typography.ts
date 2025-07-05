import { TypographyToken, TokenGroup } from "@supernovaio/sdk-exporters";
import { splitTokensByTopGroup } from '../core/split';

import {
    sanitizeIdentifier,
    toPascalCase,
    capitalizeFirstLetter,
    toFileName
} from './index';

type TreeNode = {
    children: Map<string, TreeNode>;
    fontFamily?: string; // Dart font family!
    fontWeight?: string; // Dart font weight!
    fontSize?: string; // Dart font size!
    letterSpacing?: string; // Dart letter spacing!
    lineHeight?: string; // Dart line height!
    textDecoration?: string; // Dart text decoration!
    textCase?: string; // Dart text case!
    paragraphIndent?: string; // Dart paragraph indent!
    paragraphSpacing?: string; // Dart paragraph spacing!
};

/**
 * Преобразует токен цвета в строку цвета Dart.
 * Заодно меняем формат RRGGBBAA на AARRGGBB, чтобы соответствовать формату Dart.
 */
// function toDartColor(token: ColorToken): string | null {
//     const rawHex = token.toHex8?.();
//     if (!rawHex || !rawHex.startsWith("#") || rawHex.length !== 9) return null;

//     const hex = rawHex.slice(1);
//     const reordered = hex.slice(6, 8) + hex.slice(0, 6);
//     return `Color(0x${reordered.toUpperCase()})`;
// }

// , tokenGroups: TokenGroup[]
function buildTokenTree(tokens: TypographyToken[]): TreeNode {
    const root: TreeNode = { children: new Map() };

    for (const token of tokens) {
        // console.log(`Processing token: ${token.name} | Path: ${token.tokenPath ? token.tokenPath.join(' > ') : 'N/A'}`);

        if (!token.tokenPath || token.tokenPath.length < 1) continue;


        /**
         * fontFamily:
         *      text: Lora,
         *      referencedTokenId: 02147cda-8461-4808-a5f3-3fd786bdd2ae
         * 
         * fontWeight:
         *     text: 600,
         *     referencedTokenId: 747dbb2c-71ee-4676-a000-a18007b762b8,
         * 
         * textDecoration:
         *      value: None, Strikethrough
         *      referencedTokenId: null
         * 
         * 
         * 
         * fontSize:
         *     unit: Pixels,
         *     measure: 30,
         *     referencedTokenId: null
         * textCase:
         *      value: Original,
         *      referencedTokenId: null
         * letterSpacing:
         *      unit: Pixels,
         *      measure: 0,
         *      referencedTokenId: null
         * lineHeight:
         *      unit: Pixels,
         *      measure: 34,
         *      referencedTokenId: null
         * paragraphIndent:
         *      unit: Pixels,
         *      measure: 0,
         *      referencedTokenId: null
         * paragraphSpacing:
         *      unit: Pixels,
         *      measure: 0,
         *      referencedTokenId: null
         * referencedTokenId: null
         */
        // console.log(`Token value: ${token.value ? JSON.stringify(token.value) : 'N/A'}`);

        const fontFamily = token.value?.fontFamily?.text;
        // console.log(`Font Family: ${fontFamily || 'N/A'}`);

        const fontWeight = `w${token.value?.fontWeight?.text}`;
        // console.log(`Font Weight: ${fontWeight || 'N/A'}`);

        const fontSize = token.value?.fontSize?.measure;
        // console.log(`Font Size: ${fontSize || 'N/A'}`);

        // "Text Decoration: Strikethrough"
        // Text Decoration: None
        const textDecoration = token.value?.textDecoration?.value;
        // console.log(`Text Decoration: ${textDecoration || 'N/A'}`);

        const textCase = token.value?.textCase?.value;
        // console.log(`Text Case: ${textCase || 'N/A'}`);

        // Letter Spacing: 0.07 | null
        const letterSpacing = token.value?.letterSpacing?.measure;
        // console.log(`Letter Spacing: ${letterSpacing || 'N/A'}`);


        const lineHeight = token.value?.lineHeight?.measure !== undefined ? token.value?.lineHeight?.measure : 0;
        // console.log(`Line Height: ${lineHeight || 'N/A'}`);
        const adaptiveHeight = lineHeight / fontSize;
        // console.log(`Height: ${lineHeight} % ${fontSize} = ${lineHeight / fontSize || 'N/A'}`);

        // console.log(`======== ${token.name}========`);


        // const dartColor = toDartColor(token);
        // if (!dartColor) continue;

        // Убираем первый элемент (группу), потому что она уже использована в splitTokensByTopGroup
        const subPath = token.tokenPath.slice(1).map(sanitizeIdentifier);
        const tokenName = sanitizeIdentifier(token.name);

        let node = root;
        for (const segment of subPath) {
            if (!node.children.has(segment)) {
                node.children.set(segment, { children: new Map() });
            }
            node = node.children.get(segment)!;
        }

        node.children.set(toPascalCase(tokenName), {
            children: new Map(),
            fontFamily: fontFamily ? sanitizeIdentifier(fontFamily) : undefined,
            fontWeight: fontWeight ? sanitizeIdentifier(fontWeight) : undefined,
            fontSize: fontSize !== undefined ? `${fontSize}` : undefined,

            letterSpacing: letterSpacing !== undefined ? `${letterSpacing}` : `0`,
            lineHeight: `${adaptiveHeight}`,
            textDecoration: textDecoration ? sanitizeIdentifier(textDecoration) : undefined,
            textCase: textCase ? sanitizeIdentifier(textCase) : undefined,
        });
    }

    return root;
}

function generateDartFromTree(
    node: TreeNode,
    path: string[] = [],
    level: number = 0
): string {
    const className = path.map(toPascalCase).join('');
    const indent = (lvl: number) => '  '.repeat(lvl);

    let out = `class ${className} {\n`;
    out += indent(1) + `${className}._();\n\n`;

    for (const [key, child] of node.children) {
        const fieldName = capitalizeFirstLetter(toPascalCase(sanitizeIdentifier(key)));
        const subClassName = [...path, key].map(toPascalCase).join('');

        const isLeaf = child.children.size === 0;

        if (isLeaf) {
            // Генерируем TextStyle
            const styleParts: string[] = [];

            if (child.fontFamily)
                styleParts.push(`fontFamily: '${child.fontFamily}'`);

            styleParts.push(`package: 'ui_kit_litnet_audio'`);

            if (child.fontWeight)
                styleParts.push(`fontWeight: FontWeight.${child.fontWeight}`);

            if (child.textCase)
                if (child.textCase === 'Italic')
                    styleParts.push(`fontStyle: FontStyle.italic`);
                else
                    styleParts.push(`fontStyle: FontStyle.normal`);

            if (child.fontSize)
                styleParts.push(`fontSize: h${child.fontSize}`);

            if (child.textDecoration)
                if (child.textDecoration === 'Strikethrough')
                    styleParts.push(`decoration: TextDecoration.lineThrough`);
                else if (child.textDecoration === 'Underline')
                    styleParts.push(`decoration: TextDecoration.underline`);
                else if (child.textDecoration === 'Overline')
                    styleParts.push(`decoration: TextDecoration.overline`);
                else
                    styleParts.push(`decoration: TextDecoration.none`);

            if (child.letterSpacing)
                styleParts.push(`letterSpacing: ${child.letterSpacing}`);

            if (child.lineHeight)
                styleParts.push(`height: ${child.lineHeight}`);;

            styleParts.push(`leadingDistribution: TextLeadingDistribution.even`);

            const styleBody = styleParts.join(',\n' + indent(3));
            if (level === 0) {
                out += indent(1) + `static final ${fieldName} = TextStyle(\n${indent(2)}${styleBody},\n${indent(1)});\n`;
            } else {
                out += indent(1) + `final ${fieldName} = TextStyle(\n${indent(2)}${styleBody},\n${indent(1)});\n`;
            }
        } else {
            const declaration =
                level === 0
                    ? `static final ${capitalizeFirstLetter(fieldName)} = ${subClassName}._();`
                    : `final ${fieldName} = ${subClassName}._();`;
            out += indent(1) + `${declaration}\n`;
        }

        // if (child.value !== undefined) {
        //     out += indent(1) + `final ${fieldName} = const ${child.value};\n`;
        // } else {

        //     const fieldDeclaration = level === 0
        //         ? `static final ${fieldName} = const ${subClass}._();`
        //         : `final ${fieldName} = const ${subClass}._();`;
        //     out += indent(1) + `${fieldDeclaration}\n`;
        // }
    }

    out += `}\n\n`;

    for (const [key, child] of node.children) {
        if (child.children.size > 0) {
            out += generateDartFromTree(child, [...path, key], level + 1);
        }
    }

    // for (const [key, child] of node.children) {
    //     if (child.value === undefined) {
    //         out += generateDartFromTree(child, [...path, key], level + 1);
    //     }
    // }

    return out;
}

export function generateTypography(
    groups: TokenGroup[],
    tokens: TypographyToken[]
): Array<{
    name: string;
    path: string;
    content: string;
}> {

    const tokenMap = splitTokensByTopGroup(tokens);
    const result: Array<{ name: string; path: string; content: string }> = [];

    for (const [groupKey, groupTokens] of tokenMap.entries()) {
        const tree = buildTokenTree(groupTokens);
        const className = toPascalCase(groupKey);
        const fileName = toFileName(className);
        const body = generateDartFromTree(tree, [className]);
        result.push({
            name: fileName,
            path: `supernova/text_style`,
            content: `import 'package:flutter/material.dart';\nimport 'package:ui_kit_litnet_audio/utils/sizes.dart';\n\n${body.trim()}`,
        });
    }

    return result;
}