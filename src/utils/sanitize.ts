
const dartKeywords = new Set([
    "abstract", "else", "import", "super", "as", "enum", "in", "switch", "assert",
    "export", "interface", "sync", "async", "extends", "is", "this", "await",
    "extension", "late", "throw", "break", "external", "library", "true", "case",
    "factory", "mixin", "try", "catch", "false", "new", "typedef", "class", "final",
    "null", "var", "const", "finally", "on", "void", "continue", "for", "operator",
    "while", "covariant", "Function", "part", "with", "default", "get", "required",
    "yield", "deferred", "hide", "rethrow", "do", "if", "return", "dynamic",
    "implements", "set", "title", "error", "shadow"
]);

export function appendSuffixIfKeyword(
    name: string,
    postfix: string,
    keywords: Set<string> = dartKeywords
): string {
    return keywords.has(name) ? `${name}${postfix}` : name;
}

export function sanitizeIdentifier(name: string): string {
    return name
        .replace(/&(\w)?/g, (_, next) => 'And' + (next ? next.toUpperCase() : ''))
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/^(\d+)/, 'lvl$1');
}