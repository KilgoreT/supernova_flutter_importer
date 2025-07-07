import type { TokenTree, TreeNode } from './types/tree-types';
import { UnknownTokenType } from './types/token-types';
import type { CoreTokenType } from './types/token-types';

export function filterTreeByTokenType(
    tree: TokenTree,
    targetType: CoreTokenType
): TokenTree {
    return {
        roots: tree.roots.filter((node) =>
            isTokenTypeEqual(node.tokenGroup.tokenType, targetType)
        ),
    };
}

function isTokenTypeEqual(a: CoreTokenType, b: CoreTokenType): boolean {
    if (a === b) return true;

    if (a instanceof UnknownTokenType && b instanceof UnknownTokenType) {
        return a.raw === b.raw;
    }

    return false;
}
