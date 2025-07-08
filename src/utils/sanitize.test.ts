/**
 * Unit tests for utility functions `sanitizeIdentifier` and `appendSuffixIfKeyword`.
 *
 * Test cases:
 *
 * sanitizeIdentifier:
 * - Replaces special characters with underscores.
 * - Converts `&` into `And` with capital letter after it.
 * - Adds `lvl` prefix if the name is purely numeric.
 * - Leaves valid identifiers unchanged.
 *
 * appendSuffixIfKeyword:
 * - Appends a suffix if the identifier is in a keyword set.
 * - Leaves the name unchanged if it's not in the keyword set.
 * - Supports custom keyword sets for suffix logic.
 */

import { describe, it, expect } from 'vitest';
import {
    sanitizeIdentifier,
    appendSuffixIfKeyword,
} from 'src/utils/sanitize';

describe('sanitizeIdentifier', () => {
    it('replaces special characters with underscores', () => {
        expect(sanitizeIdentifier('foo&bar-baz')).toBe('fooAndBar_baz');
        expect(sanitizeIdentifier('a b!c')).toBe('a_b_c');
    });

    it('capitalizes letter after &', () => {
        expect(sanitizeIdentifier('b&w')).toBe('bAndW');
    });

    it('adds lvl prefix if name is numeric', () => {
        expect(sanitizeIdentifier('123')).toBe('lvl123');
    });

    it('does not modify valid identifier', () => {
        expect(sanitizeIdentifier('myValue')).toBe('myValue');
    });
});

describe('appendSuffixIfKeyword', () => {
    const keywords = new Set(['class', 'return', 'async']);
    const customIdentifiers: string[] = [];

    it('appends Token suffix if identifier is in keyword set', () => {
        expect(appendSuffixIfKeyword('class', 'Token', customIdentifiers, keywords)).toBe('classToken');
        expect(appendSuffixIfKeyword('return', 'Token', customIdentifiers, keywords)).toBe('returnToken');
    });

    it('does not modify if identifier is not in keyword set', () => {
        expect(appendSuffixIfKeyword('myValue', 'Token', customIdentifiers, keywords)).toBe('myValue');
        expect(appendSuffixIfKeyword('data_loader', 'Token', customIdentifiers, keywords)).toBe('data_loader');
    });

    it('works with empty keyword set', () => {
        expect(appendSuffixIfKeyword('class', 'Token', customIdentifiers, new Set())).toBe('class');
    });

    it('appends custom suffix', () => {
        const customKeywords = new Set(['await']);
        expect(appendSuffixIfKeyword('await', 'Key', customIdentifiers, customKeywords)).toBe('awaitKey');
    });
});
