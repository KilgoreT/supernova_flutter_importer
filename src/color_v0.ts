type Token = {
    id: string;
    name: string;
    tokenPath: string[] | null;
    propertyValues: Record<string, string | boolean | number>;
};

type TokenGroup = {
    id: string;
    name: string;
    parentGroupId: string | null;
};

type TreeNode = {
    children: Map<string, TreeNode>;
    value?: string;
};

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
        .replace(/&/g, 'And')
        .replace(/[^a-zA-Z0-9]/g, '_');
    if (/^\d+$/.test(clean)) {
        clean = 'clr' + clean;
    }
    if (dartKeywords.has(clean)) {
        clean += 'Token';
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

function buildTokenTree(tokens: Token[]): TreeNode {
    const root: TreeNode = { children: new Map() };

    for (const token of tokens) {
        if (!token.tokenPath || token.tokenPath.length === 0) continue;

        const path = token.tokenPath.map(sanitizeIdentifier);
        const tokenName = sanitizeIdentifier(token.name);

        const rawValue = token.propertyValues["value"];
        let dartColor: string;
        if (typeof rawValue === "string" && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(rawValue)) {
            const hex = rawValue.replace('#', '').padStart(6, '0');
            dartColor = `Color(0xFF${hex.toUpperCase()})`;
        } else {
            dartColor = 'Color(0xFF000000)'; // fallback
        }


        let node = root;
        for (const segment of path) {
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
    path: string[] = []
): string {
    const className = path.map(toPascalCase).join('');
    const indent = (level: number) => '  '.repeat(level);

    let out = `class ${className} {\n`;
    out += indent(1) + `const ${className}._();\n\n`;

    for (const [key, child] of node.children) {
        if (child.value !== undefined) {
            out += indent(1) + `final ${key} = const ${child.value};\n`;
        } else {
            const childClass = [...path, key].map(toPascalCase).join('');
            out += indent(1) + `final ${key} = const ${childClass}._();\n`;
        }
    }
    out += `}\n\n`;

    for (const [key, child] of node.children) {
        if (child.value === undefined) {
            out += generateDartFromTree(child, [...path, key]);
        }
    }
    return out;
}

function splitTokensByTopGroup(tokens: Token[]): Map<string, Token[]> {
    const map = new Map<string, Token[]>();
    for (const token of tokens) {
        const root = token.tokenPath?.[0];
        if (!root) continue;
        const key = sanitizeIdentifier(root);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(token);
    }
    return map;
}

function extractColorValue(token: Token, mappedTokens: Map<string, Token>): string | null {
    const visited = new Set<string>();
    let current: Token | undefined = token;

    while (current) {
        if (visited.has(current.id)) return null;
        visited.add(current.id);

        const value: any = (current as any).value || {};
        const hex = value.hex;

        if (typeof hex === 'string' && hex.startsWith('#')) {
            const clean = hex.replace('#', '').toUpperCase();
            if (clean.length === 6) return `Color(0xFF${clean})`;
            if (clean.length === 8) return `Color(0x${clean})`;
            return null;
        }

        const refId = value.referencedTokenId;
        if (typeof refId === 'string') {
            current = mappedTokens.get(refId);
        } else {
            break;
        }
    }

    return null;
}

function hexToDartColor(hex: string): string {
    const clean = hex.replace('#', '').toUpperCase();
    if (clean.length === 6) {
        return `Color(0xFF${clean})`;
    } else if (clean.length === 8) {
        return `Color(0x${clean})`;
    } else {
        return `Color(0xFF000000)`; // fallback — чёрный
    }
}

export function generateColors(
    groups: TokenGroup[],
    tokens: Token[]
): Array<{ name: string; content: string }> {
    const tokenMap = splitTokensByTopGroup(tokens);
    const result: Array<{ name: string; content: string }> = [];

    for (const [groupKey, groupTokens] of tokenMap.entries()) {
        const tree = buildTokenTree(groupTokens);
        const className = toPascalCase(groupKey);
        const body = generateDartFromTree(tree, [className]);
        const disclaimer = `/* This file was generated by Supernova, don't change by hand */\n\nimport 'package:flutter/material.dart';\n\n`;
        result.push({
            name: className,
            content: disclaimer + body.trim(),
        });
    }

    return result;
}