/**
 * Unit tests for `pruneTokenTree` function
 *
 * This function recursively prunes invalid nodes from a TokenTree.
 *
 * A node is considered invalid and must be pruned if:
 * 1. It is a **leaf node** (has no children), has a **parent**, and has **no tokens**.
 * 2. It is a **root node** and has **no children** and **no tokens**.
 * 3. If pruning child nodes causes a parent node to become invalid per rules above,
 *    the parent node should also be recursively pruned.
 *
 * Covered test cases:
 * - [x] Empty tree
 * - [x] Root without children or tokens (pruned)
 * - [x] Root with tokens (kept)
 * - [x] Root with valid children (kept)
 * - [x] Non-root leaf without tokens (pruned)
 * - [x] Parent becomes invalid after child pruning (recursive prune)
 * - [x] Mixed validity: only valid branches remain
 * - [x] Nodes with multiple children where some are pruned
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from 'vitest';
import { pruneTokenTree } from './prune-tree';
import type { TokenTree, TreeNode } from './types/tree-types';
import type { ITokenGroup, IToken } from './types/core-types';
import { CoreTokenType, DefinedTokenType } from './types/token-types';

function mockGroup(
    id: string,
    name: string,
    parentGroupId: string | null,
    type: CoreTokenType
): ITokenGroup {
    return {
        id,
        name,
        parentGroupId,
        tokenType: type,
        raw: {} as any,
    };
}

function mockToken(
    id: string,
    parentGroupId: string,
    type: CoreTokenType
): IToken {
    return {
        id,
        name: id,
        parentGroupId,
        tokenType: type,
        raw: {} as any,
    };
}

function node(
    group: ITokenGroup,
    children: TreeNode[] = [],
    tokens: IToken[] = []
): TreeNode {
    return {
        tokenGroup: group,
        tokens,
        children: new Map(children.map((c) => [c.tokenGroup.name, c])),
    };
}

describe('pruneTokenTree', () => {
    it('removes all roots if tree is empty', () => {
        const tree: TokenTree = { roots: [] };
        const pruned = pruneTokenTree(tree);
        expect(pruned.roots).toEqual([]);
    });

    it('removes root with no children and no tokens', () => {
        const root = node(mockGroup('g1', 'Root', null, DefinedTokenType.Color));
        const tree: TokenTree = { roots: [root] };
        const pruned = pruneTokenTree(tree);
        expect(pruned.roots).toEqual([]);
    });

    it('keeps root if it has tokens', () => {
        const token = mockToken('t1', 'g1', DefinedTokenType.Color);
        const root = node(mockGroup('g1', 'Root', null, DefinedTokenType.Color), [], [token]);
        const tree: TokenTree = { roots: [root] };
        const pruned = pruneTokenTree(tree);
        expect(pruned.roots.length).toBe(1);
        expect(pruned.roots[0].tokens).toContain(token);
    });

    it('keeps root with valid child', () => {
        const token = mockToken('t1', 'g2', DefinedTokenType.Color);
        const child = node(mockGroup('g2', 'Child', 'g1', DefinedTokenType.Color), [], [token]);
        const root = node(mockGroup('g1', 'Root', null, DefinedTokenType.Color), [child]);
        const tree: TokenTree = { roots: [root] };
        const pruned = pruneTokenTree(tree);
        expect(pruned.roots[0].children.size).toBe(1);
    });

    it('prunes leaf child with no tokens', () => {
        const child = node(mockGroup('g2', 'Child', 'g1', DefinedTokenType.Color));
        const root = node(mockGroup('g1', 'Root', null, DefinedTokenType.Color), [child]);
        const tree: TokenTree = { roots: [root] };
        const pruned = pruneTokenTree(tree);
        expect(pruned.roots).toEqual([]);
    });

    it('recursively prunes parent if only child removed and parent has no tokens', () => {
        const leaf = node(mockGroup('g3', 'Leaf', 'g2', DefinedTokenType.Color));
        const mid = node(mockGroup('g2', 'Mid', 'g1', DefinedTokenType.Color), [leaf]);
        const root = node(mockGroup('g1', 'Root', null, DefinedTokenType.Color), [mid]);
        const tree: TokenTree = { roots: [root] };
        const pruned = pruneTokenTree(tree);
        expect(pruned.roots).toEqual([]);
    });

    it('keeps valid subtrees and prunes invalid ones', () => {
        const validLeaf = node(
            mockGroup('g3', 'ValidLeaf', 'g2', DefinedTokenType.Color),
            [],
            [mockToken('t1', 'g3', DefinedTokenType.Color)]
        );
        const invalidLeaf = node(mockGroup('g4', 'InvalidLeaf', 'g2', DefinedTokenType.Color));
        const mid = node(mockGroup('g2', 'Mid', 'g1', DefinedTokenType.Color), [validLeaf, invalidLeaf]);
        const root = node(mockGroup('g1', 'Root', null, DefinedTokenType.Color), [mid]);
        const tree: TokenTree = { roots: [root] };
        const pruned = pruneTokenTree(tree);

        const midNode = pruned.roots[0].children.get('Mid');
        expect(midNode?.children.has('ValidLeaf')).toBe(true);
        expect(midNode?.children.has('InvalidLeaf')).toBe(false);
    });
});