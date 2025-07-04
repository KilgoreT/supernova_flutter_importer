import { ColorToken, TokenGroup, TokenType } from "@supernovaio/sdk-exporters";

/**
 * Приводит имя токена к допустимому формату.
 * @param name Имя токена, которое нужно привести к допустимому формату.
 *
 * Функция очищает имя токена, заменяя недопустимые символы на подчеркивания,
 * удаляя начальные цифры и добавляя суффикс, если имя совпадает с ключевым словом Dart.
 * 
 * @returns Приведенное к допустимому формату имя токена.
 */
function sanitizeIdentifier(name: string): string {
    const dartKeywords = new Set([
        "abstract", "else", "import", "super", "as", "enum", "in", "switch", "assert",
        "export", "interface", "sync", "async", "extends", "is", "this", "await",
        "extension", "late", "throw", "break", "external", "library", "true", "case",
        "factory", "mixin", "try", "catch", "false", "new", "typedef", "class", "final",
        "null", "var", "const", "finally", "on", "void", "continue", "for", "operator",
        "while", "covariant", "Function", "part", "with", "default", "get", "required",
        "yield", "deferred", "hide", "rethrow", "do", "if", "return", "dynamic",
        "implements", "set"
    ]);


    let clean = name
        .replace(/&(\w)?/g, (_, next) => 'And' + (next ? next.toUpperCase() : ''))
        .replace(/[^a-zA-Z0-9]/g, '_');
    if (/^\d+$/.test(clean)) {
        clean = 'lvl' + clean;
    }
    if (dartKeywords.has(clean)) {
        clean = clean + 'Token';
    }
    return clean;
}

function toPascalCase(name: string): string {
    return name
        .split(/[_\-\s]/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

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

function buildTokenTree(tokens: ColorToken[], tokenGroups: TokenGroup[]): TreeNode {
    const root: TreeNode = { children: new Map() };

    for (const token of tokens) {
        console.log(`Processing token: ${token.name} | Path: ${token.tokenPath ? token.tokenPath.join(' > ') : 'N/A'}`);

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


function splitTokensByTopGroup(
    tokens: ColorToken[]
): Map<string, ColorToken[]> {
    const map = new Map<string, ColorToken[]>();
    for (const token of tokens) {
        // console.log(`Processing token: ${token.name}`);
        const root = token.tokenPath?.[0];
        // console.log(`Root path: ${root}`);
        if (!root) {
            // console.log(`Token ${token.name} has no root path, skipping.`);
            continue;
        }
        const key = sanitizeIdentifier(root);
        // console.log(`Processing token key: ${key}`);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(token);
        // console.log(`Added token ${token.name} to group ${key}`);
        // console.log('--------------------------------------------------');
    }
    return map;
}

function capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toFileName(input: string): string {
    return input
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
        .toLowerCase();
}

function ll(input: string): void {
    const lines = input.split('\n');
    for (const line of lines) {
        console.log(line);
    }
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
        const tree = buildTokenTree(groupTokens, groups);
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