import { describe, it, expect } from 'vitest';
import {
    sanitizeIdentifier,
    toPascalCase,
    capitalizeFirstLetter,
    toFileName
} from './sanitize';

describe('sanitizeIdentifier', () => {
    it('replaces special characters with underscores', () => {
        expect(sanitizeIdentifier('foo&bar-baz')).toBe('fooAndBar_baz');
        expect(sanitizeIdentifier('a b!c')).toBe('a_b_c');
    });

    it('capitalizes letter after &', () => {
        expect(sanitizeIdentifier('b&w')).toBe('bAndW');
    });

    it('adds prefix if name is numeric', () => {
        expect(sanitizeIdentifier('123')).toBe('lvl123');
    });

    it('adds Token suffix if name is a Dart keyword', () => {
        expect(sanitizeIdentifier('class')).toBe('classToken');
        expect(sanitizeIdentifier('return')).toBe('returnToken');
    });

    it('does not modify valid name', () => {
        expect(sanitizeIdentifier('myValue')).toBe('myValue');
    });
});

describe('toPascalCase', () => {
    it('converts snake_case to PascalCase', () => {
        expect(toPascalCase('my_value')).toBe('MyValue');
    });

    it('converts kebab-case to PascalCase', () => {
        expect(toPascalCase('my-value')).toBe('MyValue');
    });

    it('converts space-separated to PascalCase', () => {
        expect(toPascalCase('my value here')).toBe('MyValueHere');
    });

    it('ignores empty parts', () => {
        expect(toPascalCase('__value--name')).toBe('ValueName');
    });
});


describe('capitalizeFirstLetter', () => {
    it('capitalizes the first letter', () => {
        expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('returns empty string for empty input', () => {
        expect(capitalizeFirstLetter('')).toBe('');
    });

    it('returns the same string if already capitalized', () => {
        expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });

    it('handles single character', () => {
        expect(capitalizeFirstLetter('a')).toBe('A');
    });
});

describe('toFileName', () => {
    it('converts PascalCase to snake_case', () => {
        expect(toFileName('BasicText')).toBe('basic_text');
        expect(toFileName('VeryLongName')).toBe('very_long_name');
    });

    it('handles consecutive capitals', () => {
        expect(toFileName('HTMLParser')).toBe('html_parser');
        expect(toFileName('NASAData')).toBe('nasa_data');
    });

    it('handles lowerCamelCase', () => {
        expect(toFileName('myTestCase')).toBe('my_test_case');
    });

    it('handles single word', () => {
        expect(toFileName('Simple')).toBe('simple');
    });

    it('returns empty string for empty input', () => {
        expect(toFileName('')).toBe('');
    });
});
