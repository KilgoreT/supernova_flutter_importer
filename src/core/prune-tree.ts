import type { TokenTree, TreeNode } from 'src/core/types/tree-types'

export function pruneTokenTree(tree: TokenTree): TokenTree {
    function pruneRec(node: TreeNode): TreeNode | null {
        const newChildren = new Map<string, TreeNode>();

        for (const [childName, childNode] of node.children.entries()) {
            const prunedChild = pruneRec(childNode);
            if (prunedChild !== null) {
                newChildren.set(childName, prunedChild);
            }
        }

        const hasTokens = (node.tokens?.length ?? 0) > 0;

        if (newChildren.size === 0 && !hasTokens) {
            return null; // Невалидный
        }

        return {
            ...node,
            children: newChildren,
        };
    }

    const prunedRoots: TreeNode[] = [];

    for (const root of tree.roots) {
        const pruned = pruneRec(root);
        if (pruned !== null) {
            prunedRoots.push(pruned);
        }
    }

    return { roots: prunedRoots };
}

