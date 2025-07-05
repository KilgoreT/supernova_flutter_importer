/**
 * Приводит имя токена к допустимому формату.
 * @param name Имя токена, которое нужно привести к допустимому формату.
 *
 * Функция очищает имя токена, заменяя недопустимые символы на подчеркивания,
 * удаляя начальные цифры и добавляя суффикс, если имя совпадает с ключевым словом Dart.
 * 
 * @returns Приведенное к допустимому формату имя токена.
 */
export function sanitizeIdentifier(name: string): string {
    const dartKeywords = new Set([
        "abstract", "else", "import", "super", "as", "enum", "in", "switch", "assert",
        "export", "interface", "sync", "async", "extends", "is", "this", "await",
        "extension", "late", "throw", "break", "external", "library", "true", "case",
        "factory", "mixin", "try", "catch", "false", "new", "typedef", "class", "final",
        "null", "var", "const", "finally", "on", "void", "continue", "for", "operator",
        "while", "covariant", "Function", "part", "with", "default", "get", "required",
        "yield", "deferred", "hide", "rethrow", "do", "if", "return", "dynamic",
        "implements", "set", "title"
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

export function toPascalCase(name: string): string {
    return name
        .split(/[_\-\s]/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

export function capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toFileName(input: string): string {
    return input
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
        .toLowerCase();
}