import { ColorToken, TokenGroup } from "@supernovaio/sdk-exporters";
import { splitTokensByTopGroup } from '../core/split';
import {
    sanitizeIdentifier,
    toPascalCase,
    capitalizeFirstLetter,
    toFileName
} from './index';

type TreeNode = {
    children: Map<string, TreeNode>;
    value?: string;
};

/**
 * Преобразует токен цвета в строку цвета Dart.
 * Заодно меняем формат RRGGBBAA на AARRGGBB, чтобы соответствовать формату Dart.
 */
function toDartColor(token: ColorToken): string | null {
    const rawHex = token.toHex8?.();
    if (!rawHex || !rawHex.startsWith("#") || rawHex.length !== 9) return null;

    const hex = rawHex.slice(1);
    const reordered = hex.slice(6, 8) + hex.slice(0, 6);
    return `Color(0x${reordered.toUpperCase()})`;
}

// , tokenGroups: TokenGroup[]
function buildTokenTree(tokens: ColorToken[]): TreeNode {
    const root: TreeNode = { children: new Map() };

    for (const token of tokens) {
        // console.log(`Processing token: ${token.name} | Path: ${token.tokenPath ? token.tokenPath.join(' > ') : 'N/A'}`);

        if (!token.tokenPath || token.tokenPath.length < 1) continue;

        const dartColor = toDartColor(token);
        if (!dartColor) continue;

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
            value: dartColor,
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
    out += indent(1) + `const ${className}._();\n\n`;

    for (const [key, child] of node.children) {
        const fieldName = capitalizeFirstLetter(toPascalCase(sanitizeIdentifier(key)));
        const subClass = [...path, key].map(toPascalCase).join('');

        if (child.value !== undefined) {
            out += indent(1) + `final ${fieldName} = const ${child.value};\n`;
        } else {

            const fieldDeclaration = level === 0
                ? `static final ${fieldName} = const ${subClass}._();`
                : `final ${fieldName} = const ${subClass}._();`;
            out += indent(1) + `${fieldDeclaration}\n`;
        }
    }

    out += `}\n\n`;

    for (const [key, child] of node.children) {
        if (child.value === undefined) {
            out += generateDartFromTree(child, [...path, key], level + 1);
        }
    }

    return out;
}

export function generateColors(
    groups: TokenGroup[],
    tokens: ColorToken[]
): Array<{
    name: string;
    path: string;
    content: string
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
            path: `./supernova/color`,
            content: `import 'package:flutter/material.dart';\n\n${body.trim()}`,
        });
    }

    return result;
}