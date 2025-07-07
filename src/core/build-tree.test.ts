/**
 * Tests for `buildTokenTree` function.
 *
 * This function builds a hierarchical tree of token groups and assigns tokens
 * to their corresponding group nodes. It supports nesting, orphan handling,
 * and type filtering.
 *
 * ✅ Test cases covered:
 * 
 * ── Basic structure and nesting:
 * 1. Single root group without tokens
 * 2. Multiple root groups
 * 3. Parent-child hierarchy
 * 4. Deep hierarchy (3+ levels)
 * 5. Orphan groups
 *
 * ── Token placement:
 * 6. Token added to root group
 * 7. Token added to nested group
 * 8. Token with unknown group is ignored
 * 9. Multiple tokens in one group
 * 10. Mix of empty and filled groups
 * 11. No groups or tokens
 * 12. Only tokens but no groups
 * 13. Groups with duplicate names but different IDs
 *
 * ── Type filtering:
 * 14. Child group with mismatched type not added
 * 15. Token with mismatched type is ignored
 * 16. Group with `UnknownTokenType` is isolated
 * 17. Token with `UnknownTokenType` is ignored if group has different type
 * 18. Token with `UnknownTokenType` is accepted into matching `UnknownTokenType` group
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from 'vitest'
import { buildTokenTree } from 'src/core/build-tree'
import type { ITokenGroup, IToken } from 'src/core/types/core-types'
import { CoreTokenType, DefinedTokenType, UnknownTokenType } from 'src/core/types/token-types'

function mockGroup(
    id: string,
    name: string,
    parentGroupId: string | null = null,
    type: CoreTokenType = DefinedTokenType.Color
): ITokenGroup {
    return {
        id,
        name,
        parentGroupId,
        tokenType: type,
        raw: {} as any,
    }
}

function mockToken(
    id: string,
    name: string,
    parentGroupId: string,
    type: CoreTokenType = DefinedTokenType.Color
): IToken {
    return {
        id,
        name,
        parentGroupId,
        tokenType: type,
        raw: {} as any,
    }
}

describe('buildTokenTree', () => {
    // ───────────────────────────────────────────────────────
    // 🧱 Basic structure and hierarchy
    // ───────────────────────────────────────────────────────

    describe('Basic structure and nesting', () => {
        it('handles one root group with no tokens', () => {
            const groups = [mockGroup('g1', 'Root')]
            const tokens: IToken[] = []

            const tree = buildTokenTree(groups, tokens)
            expect(tree.roots).toHaveLength(1)
            expect(tree.roots[0].tokenGroup.name).toBe('Root')
            expect(tree.roots[0].tokens).toEqual([])
            expect(tree.roots[0].children.size).toBe(0)
        })

        it('handles multiple root groups with no tokens', () => {
            const groups = [mockGroup('g1', 'G1'), mockGroup('g2', 'G2')]
            const tree = buildTokenTree(groups, [])
            expect(tree.roots).toHaveLength(2)
        })

        it('builds simple parent-child hierarchy', () => {
            const groups = [
                mockGroup('g1', 'Parent'),
                mockGroup('g2', 'Child', 'g1'),
            ]
            const tree = buildTokenTree(groups, [])
            expect(tree.roots).toHaveLength(1)
            expect(tree.roots[0].children.get('Child')).toBeDefined()
        })

        it('builds deep 3-level hierarchy', () => {
            const groups = [
                mockGroup('g1', 'Root'),
                mockGroup('g2', 'Child', 'g1'),
                mockGroup('g3', 'GrandChild', 'g2'),
            ]
            const tree = buildTokenTree(groups, [])
            expect(tree.roots[0].children.get('Child')?.children.get('GrandChild')).toBeDefined()
        })

        it('treats orphan group as root', () => {
            const groups = [mockGroup('g1', 'Orphan', 'nonexistent')]
            const tree = buildTokenTree(groups, [])
            expect(tree.roots).toHaveLength(1)
            expect(tree.roots[0].tokenGroup.name).toBe('Orphan')
        })

        it('handles duplicate group names with different ids', () => {
            const groups = [mockGroup('g1', 'Group'), mockGroup('g2', 'Group')]
            const tree = buildTokenTree(groups, [])
            expect(tree.roots).toHaveLength(2)
        })
    })

    // ───────────────────────────────────────────────────────
    // 🎯 Token placement into groups
    // ───────────────────────────────────────────────────────

    describe('Token placement into groups', () => {
        it('adds token to root group', () => {
            const groups = [mockGroup('g1', 'Root')]
            const tokens = [mockToken('t1', 'ColorPrimary', 'g1')]
            const tree = buildTokenTree(groups, tokens)
            expect(tree.roots[0].tokens).toEqual([tokens[0]])
        })

        it('adds token to nested group', () => {
            const groups = [mockGroup('g1', 'Root'), mockGroup('g2', 'Child', 'g1')]
            const tokens = [mockToken('t1', 'ColorPrimary', 'g2')]
            const tree = buildTokenTree(groups, tokens)
            expect(tree.roots[0].children.get('Child')?.tokens).toEqual([tokens[0]])
        })

        it('ignores token with unknown parentGroupId', () => {
            const groups = [mockGroup('g1', 'Root')]
            const tokens = [mockToken('t1', 'OrphanToken', 'unknown')]
            const tree = buildTokenTree(groups, tokens)
            expect(tree.roots[0].tokens).toEqual([])
        })

        it('adds multiple tokens to a single group', () => {
            const groups = [mockGroup('g1', 'Root')]
            const tokens = [
                mockToken('t1', 'T1', 'g1'),
                mockToken('t2', 'T2', 'g1'),
            ]
            const tree = buildTokenTree(groups, tokens)
            expect(tree.roots[0].tokens).toHaveLength(2)
        })

        it('handles groups with and without tokens', () => {
            const groups = [
                mockGroup('g1', 'Root'),
                mockGroup('g2', 'EmptyChild', 'g1'),
                mockGroup('g3', 'FilledChild', 'g1'),
            ]
            const tokens = [mockToken('t1', 'T1', 'g3')]
            const tree = buildTokenTree(groups, tokens)
            expect(tree.roots[0].children.get('EmptyChild')?.tokens).toEqual([])
            expect(tree.roots[0].children.get('FilledChild')?.tokens).toEqual([tokens[0]])
        })

        it('returns empty tree when given no groups or tokens', () => {
            const tree = buildTokenTree([], [])
            expect(tree.roots).toEqual([])
        })

        it('returns empty roots when only tokens are given', () => {
            const tokens = [mockToken('t1', 'Lonely', 'g1')]
            const tree = buildTokenTree([], tokens)
            expect(tree.roots).toEqual([])
        })
    })

    // ───────────────────────────────────────────────────────
    // 🧪 TokenType filtering logic
    // ───────────────────────────────────────────────────────

    describe('Type-based filtering', () => {
        it('does not add group to parent if token types differ', () => {
            const parent = mockGroup('g1', 'Parent', null, DefinedTokenType.Color)
            const child = mockGroup('g2', 'Child', 'g1', DefinedTokenType.Typography)
            const tree = buildTokenTree([parent, child], [])
            expect(tree.roots.length).toBe(2)
            expect(tree.roots.find(r => r.tokenGroup.id === 'g2')).toBeDefined()
            expect(tree.roots[0].children.size).toBe(0)
        })

        it('ignores token if its type differs from parent group', () => {
            const group = mockGroup('g1', 'Group', null, DefinedTokenType.Color)
            const token = mockToken('t1', 'T1', 'g1', DefinedTokenType.Typography)
            const tree = buildTokenTree([group], [token])
            expect(tree.roots[0].tokens).toHaveLength(0)
        })
    })

    // ───────────────────────────────────────────────────────
    // 🔍 Additional tests for UnknownTokenType behavior
    // ───────────────────────────────────────────────────────

    describe('UnknownTokenType handling', () => {
        it('treats group with UnknownTokenType as root and isolated', () => {
            const groups = [mockGroup('g1', 'UnknownRoot', null, new UnknownTokenType('Zhopа'))]
            const tree = buildTokenTree(groups, [])
            expect(tree.roots).toHaveLength(1)
            expect(tree.roots[0].tokenGroup.tokenType instanceof UnknownTokenType).toBe(true)
        })

        it('does not add UnknownTokenType child to DefinedTokenType parent', () => {
            const parent = mockGroup('g1', 'Parent', null, DefinedTokenType.Color)
            const child = mockGroup('g2', 'UnknownChild', 'g1', new UnknownTokenType('Zhopа'))
            const tree = buildTokenTree([parent, child], [])
            expect(tree.roots.length).toBe(2)
            expect(tree.roots[0].children.size).toBe(0)
        })

        it('does not add DefinedTokenType child to UnknownTokenType parent', () => {
            const parent = mockGroup('g1', 'UnknownParent', null, new UnknownTokenType('ZZZZ'))
            const child = mockGroup('g2', 'ColorChild', 'g1', DefinedTokenType.Color)
            const tree = buildTokenTree([parent, child], [])
            expect(tree.roots.length).toBe(2)
            expect(tree.roots.find(g => g.tokenGroup.id === 'g2')).toBeDefined()
        })

        it('ignores token with UnknownTokenType if group has different type', () => {
            const group = mockGroup('g1', 'Group', null, DefinedTokenType.Color)
            const token = mockToken('t1', 'UnknownToken', 'g1', new UnknownTokenType('Yoba'))
            const tree = buildTokenTree([group], [token])
            expect(tree.roots[0].tokens).toHaveLength(0)
        })

        it('accepts UnknownTokenType token into group with matching UnknownTokenType', () => {
            const group = mockGroup('g1', 'Group', null, new UnknownTokenType('Zhopa'))
            const token = mockToken('t1', 'T1', 'g1', new UnknownTokenType('Zhopa'))
            const tree = buildTokenTree([group], [token])
            expect(tree.roots).toHaveLength(1)
            const root = tree.roots[0]!
            expect(root.tokens?.map(t => t.tokenType.toString())).toEqual(
                [token.tokenType.toString()]
            )
        })
    })
})
