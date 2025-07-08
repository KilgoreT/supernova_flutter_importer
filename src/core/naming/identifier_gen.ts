import { CasingStyle, NamingTarget } from 'src/core/types/naming_types';
import { NamingRuleSet, defaultNamingRules } from 'src/core/naming/naming_rules';
import { sanitizeIdentifier, appendSuffixIfKeyword } from 'src/utils/sanitize';
import { toPascalCase, toCamelCase, toSnakeCase, capitalizeFirstLetter } from 'src/utils/casing';

function applyCasing(str: string, style: CasingStyle): string {
    switch (style) {
        case CasingStyle.PascalCase: return toPascalCase(str);
        case CasingStyle.CamelCase: return toCamelCase(str);
        case CasingStyle.SnakeCase: return toSnakeCase(str);
        case CasingStyle.CapitalizeFirstCase: return capitalizeFirstLetter(str)
        default: return str;
    }
}

export function generateIdentifier(
    input: string,
    target: NamingTarget,
    keywords: Set<string>,
    customIdentifiers: string[],
    prefix: string | null = null,
    suffix: string | null = null,
    rules: Record<NamingTarget, NamingRuleSet> = defaultNamingRules,
): string {
    const rule = rules[target];
    let base = input;

    if (rule.sanitize) {
        base = sanitizeIdentifier(base);
        base = appendSuffixIfKeyword(base, `Token`, customIdentifiers, keywords)
    }

    let transformed = base;
    for (const casing of rule.casings) {
        transformed = applyCasing(transformed, casing);
    }

    return `${prefix || ''}${transformed}${suffix || ''}`;
}