// type Token = {
//     name: string;
//     tokenPath: string[] | null;
//     propertyValues: Record<string, string | boolean | number>;
// };

// type TokenGroup = {
//     id: string;
//     name: string;
//     parentGroupId: string | null;
// };

// type TreeNode = {
//     children: Map<string, TreeNode>;
//     value?: string;
// };

// function sanitizeIdentifier(name: string): string {
//     const dartKeywords = new Set([
//         "abstract", "else", "import", "super", "as", "enum", "in", "switch", "assert",
//         "export", "interface", "sync", "async", "extends", "is", "this", "await",
//         "extension", "late", "throw", "break", "external", "library", "true", "case",
//         "factory", "mixin", "try", "catch", "false", "new", "typedef", "class", "final",
//         "null", "var", "const", "finally", "on", "void", "continue", "for", "operator",
//         "while", "covariant", "Function", "part", "with", "default", "get", "required",
//         "yield", "deferred", "hide", "rethrow", "do", "if", "return", "dynamic",
//         "implements", "set"
//     ]);

//     let clean = name.replace(/[^a-zA-Z0-9]/g, '_');
//     if (/^\d/.test(clean)) {
//         clean = 'clr' + clean;
//     }
//     if (dartKeywords.has(clean)) {
//         clean = clean + 'Token';
//     }
//     return clean;
// }

// function toPascalCase(name: string): string {
//     return name
//         .split(/[_\-\s]/)
//         .filter(Boolean)
//         .map(part => part.charAt(0).toUpperCase() + part.slice(1))
//         .join('');
// }

// function buildTokenTree(tokens: Token[]): TreeNode {
//     const root: TreeNode = { children: new Map() };

//     for (const token of tokens) {
//         if (!token.tokenPath || token.tokenPath.length === 0) continue;

//         const path = token.tokenPath.map(sanitizeIdentifier);
//         const tokenName = sanitizeIdentifier(token.name);
//         const tokenValue =
//             typeof token.propertyValues["value"] === "string"
//                 ? token.propertyValues["value"]
//                 : JSON.stringify(token.propertyValues["value"]);

//         let node = root;
//         for (const segment of path) {
//             if (!node.children.has(segment)) {
//                 node.children.set(segment, { children: new Map() });
//             }
//             node = node.children.get(segment)!;
//         }

//         node.children.set(toPascalCase(tokenName), {
//             children: new Map(),
//             value: tokenValue,
//         });
//     }

//     return root;
// }

// function generateDartFromTree(
//     node: TreeNode,
//     path: string[] = []
// ): string {
//     const className = path.length > 0 ? path.map(toPascalCase).join('_') : 'Root';
//     const dartClassName = path.length > 0 ? path.map(toPascalCase).join('') : 'ColorTokens';

//     const indent = (level: number) => '  '.repeat(level);

//     let out = `class ${dartClassName} {\n`;
//     out += indent(1) + `const ${dartClassName}._();\n\n`;

//     for (const [key, child] of node.children) {
//         if (child.value !== undefined) {
//             out += indent(1) + `final ${key} = '${child.value}';\n`;
//         } else {
//             const fieldClassName = [...path, key].map(toPascalCase).join('');
//             out += indent(1) + `final ${key} = const ${fieldClassName}._();\n`;
//         }
//     }

//     out += `}\n\n`;

//     // Рекурсивно создаём вложенные классы
//     for (const [key, child] of node.children) {
//         if (child.value === undefined) {
//             out += generateDartFromTree(child, [...path, key]);
//         }
//     }

//     return out;
// }

// function splitTokensByTopGroup(tokens: Token[]): Map<string, Token[]> {
//     const map = new Map<string, Token[]>();
//     for (const token of tokens) {
//         const root = token.tokenPath?.[0];
//         if (!root) continue;
//         const key = sanitizeIdentifier(root);
//         if (!map.has(key)) map.set(key, []);
//         map.get(key)!.push(token);
//     }
//     return map;
// }

// // ✅ Главная функция
// export function generateColors(
//     groups: TokenGroup[],
//     tokens: Token[]
// ): Array<{ name: string; content: string }> {
//     const tokenMap = splitTokensByTopGroup(tokens);

//     const result: Array<{ name: string; content: string }> = [];

//     for (const [groupKey, groupTokens] of tokenMap.entries()) {
//         const tree = buildTokenTree(groupTokens);
//         const className = toPascalCase(groupKey);
//         const content = generateDartFromTree(tree, [className]);
//         result.push({
//             name: className,
//             content: content.trim(),
//         });
//     }

//     return result;
// }
