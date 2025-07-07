export function toPascalCase(name: string): string {
    return name
        .split(/[_\-\s]/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

export function toSnakeCase(name: string): string {
    return name
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
}

export function toCamelCase(name: string): string {
    return name
        .split(/[_\-\s]/)
        .filter(Boolean)
        .map((part, index) => {
            if (index === 0) return part.toLowerCase();
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join('');
}

export function capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}