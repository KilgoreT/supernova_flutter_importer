import type { TokenTree, TreeNode } from "./types/tree-types"
import type { ITokenGroup, IToken } from "./types/core-types";

export function buildTokenTree(
    groups: ITokenGroup[],
    tokens: IToken[]
): TokenTree {
    const groupMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Create TreeNode for evert TokenGroup
    for (const group of groups) {
        groupMap.set(group.id, {
            tokenGroup: group,
            children: new Map(),
            tokens: [],
        });
    }

    // Organize groups hierarchically
    for (const groupNode of groupMap.values()) {
        const parentId = groupNode.tokenGroup.parentGroupId;
        if (parentId) {
            const parentNode = groupMap.get(parentId);
            if (
                parentNode &&
                parentNode.tokenGroup.tokenType.toString() === groupNode.tokenGroup.tokenType.toString()
            ) {
                parentNode.children.set(groupNode.tokenGroup.name, groupNode);
            } else {
                roots.push(groupNode);
            }
        } else {
            roots.push(groupNode);
        }
    }

    // Organize tokens into groups
    for (const token of tokens) {
        const groupNode = groupMap.get(token.parentGroupId);
        if (
            groupNode &&
            groupNode.tokenGroup.tokenType.toString() === token.tokenType.toString()
        ) {
            groupNode.tokens!.push(token);
        }
    }

    return { roots };
}

export function printTokenGroupTree(tree: TokenTree): void {
    for (const root of tree.roots) {
        printNode(root, 0);
    }
}

function printNode(node: TreeNode, level: number): void {
    const indent = '  '.repeat(level);
    console.log(`${indent}- Group: ${node.tokenGroup.name}`);

    if (node.tokens && node.tokens.length > 0) {
        for (const token of node.tokens) {
            console.log(`${indent}  • Token: ${token.name} | Type: ${token.tokenType}`);
        }
    }

    for (const child of node.children.values()) {
        printNode(child, level + 1);
    }
}
