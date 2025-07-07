/**
 * Tests for `filterTreeByTokenType` function.
 *
 * ✅ Test cases covered:
 *
 * ── Basic functionality:
 * 1. Filters roots by matching DefinedTokenType
 * 2. Filters roots by matching UnknownTokenType (same raw)
 * 3. Does not match UnknownTokenType with different raw
 * 4. DefinedTokenType and UnknownTokenType never match
 * 5. Empty tree should return empty roots
 *
 * ── Edge cases:
 * 6. Single root matches DefinedTokenType
 * 7. Single root does not match DefinedTokenType
 * 8. Single root matches UnknownTokenType
 * 9. Single root does not match UnknownTokenType
 */

import { describe, it, expect } from 'vitest'
import { filterTreeByTokenType } from './filter-free'
import type { TokenTree, TreeNode } from './types/tree-types'
import { DefinedTokenType, UnknownTokenType } from './types/token-types'

function mockNode(
    name: string,
    type: DefinedTokenType | UnknownTokenType
): TreeNode {
    return {
        tokenGroup: {
            id: name,
            name,
            parentGroupId: null,
            tokenType: type,
            raw: {} as any,
        },
        tokens: [],
        children: new Map(),
    }
}

describe('filterTreeByTokenType', () => {
    it('filters roots by matching DefinedTokenType', () => {
        const tree: TokenTree = {
            roots: [
                mockNode('color', DefinedTokenType.Color),
                mockNode('typography', DefinedTokenType.Typography),
            ],
        }

        const result = filterTreeByTokenType(tree, DefinedTokenType.Color)
        expect(result.roots).toHaveLength(1)
        expect(result.roots[0].tokenGroup.name).toBe('color')
    })

    it('filters roots by matching UnknownTokenType (same raw)', () => {
        const type = new UnknownTokenType('Zhopa')
        const tree: TokenTree = {
            roots: [
                mockNode('zhopa', type),
                mockNode('other', new UnknownTokenType('Other')),
            ],
        }

        const result = filterTreeByTokenType(tree, new UnknownTokenType('Zhopa'))
        expect(result.roots).toHaveLength(1)
        expect(result.roots[0].tokenGroup.name).toBe('zhopa')
    })

    it('does not match UnknownTokenType with different raw', () => {
        const tree: TokenTree = {
            roots: [mockNode('zhopa', new UnknownTokenType('Zhopa'))],
        }

        const result = filterTreeByTokenType(tree, new UnknownTokenType('Zhopa123'))
        expect(result.roots).toHaveLength(0)
    })

    it('DefinedTokenType and UnknownTokenType never match', () => {
        const tree: TokenTree = {
            roots: [
                mockNode('defined', DefinedTokenType.Color),
                mockNode('unknown', new UnknownTokenType('Zhopa')),
            ],
        }

        const result = filterTreeByTokenType(tree, new UnknownTokenType('Zhopa'))
        expect(result.roots.map(r => r.tokenGroup.name)).toEqual(['unknown'])

        const result2 = filterTreeByTokenType(tree, DefinedTokenType.Color)
        expect(result2.roots.map(r => r.tokenGroup.name)).toEqual(['defined'])
    })

    it('empty tree returns empty roots', () => {
        const tree: TokenTree = { roots: [] }
        const result = filterTreeByTokenType(tree, DefinedTokenType.Color)
        expect(result.roots).toEqual([])
    })

    it('single root matches DefinedTokenType', () => {
        const tree: TokenTree = { roots: [mockNode('only', DefinedTokenType.Size)] }
        const result = filterTreeByTokenType(tree, DefinedTokenType.Size)
        expect(result.roots).toHaveLength(1)
    })

    it('single root does not match DefinedTokenType', () => {
        const tree: TokenTree = { roots: [mockNode('only', DefinedTokenType.Size)] }
        const result = filterTreeByTokenType(tree, DefinedTokenType.Color)
        expect(result.roots).toHaveLength(0)
    })

    it('single root matches UnknownTokenType', () => {
        const tree: TokenTree = { roots: [mockNode('only', new UnknownTokenType('Hidden'))] }
        const result = filterTreeByTokenType(tree, new UnknownTokenType('Hidden'))
        expect(result.roots).toHaveLength(1)
    })

    it('single root does not match UnknownTokenType', () => {
        const tree: TokenTree = { roots: [mockNode('only', new UnknownTokenType('Hidden'))] }
        const result = filterTreeByTokenType(tree, new UnknownTokenType('Another'))
        expect(result.roots).toHaveLength(0)
    })
})
