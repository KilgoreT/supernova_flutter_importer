import { Token } from "@supernovaio/sdk-exporters";
import { sanitizeIdentifier } from "../utils/sanitize";

/**
 * Группирует токены по их первой части tokenPath (топовой группе).
 * Используется всеми типами токенов (цвет, типографика и т.д.).
 */
export function splitTokensByTopGroup<T extends Token>(
    tokens: T[]
): Map<string, T[]> {
    const map = new Map<string, T[]>();

    for (const token of tokens) {
        const root = token.tokenPath?.[0];
        console.log(`Root: ${root}`);
        if (!root) continue;

        const key = sanitizeIdentifier(root);
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key)!.push(token);
    }

    return map;
}
