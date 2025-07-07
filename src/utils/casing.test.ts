/**
 * Test cases for casing utilities:
 *
 * toPascalCase:
 * - "my_value"         -> "MyValue"
 * - "my-value"         -> "MyValue"
 * - "my value"         -> "MyValue"
 * - "__value--name"    -> "ValueName"
 * - "AlreadyPascal"    -> "Alreadypascal"
 * - ""                 -> ""
 *
 * toSnakeCase:
 * - "MyValue"          -> "my_value"
 * - "myValue"          -> "my_value"
 * - "HTMLParser"       -> "html_parser"
 * - "NASAData"         -> "nasa_data"
 * - "my-value"         -> "my_value"
 * - "my value here"    -> "my_value_here"
 * - "my__value--here"  -> "my_value_here"
 * - ""                 -> ""
 *
 * toCamelCase:
 * - "my_value"         -> "myValue"
 * - "my-value"         -> "myValue"
 * - "my value here"    -> "myValueHere"
 * - "MyValue"          -> "myvalue"
 * - "HTML_parser"      -> "htmlParser"
 * - "__value--name"    -> "valueName"
 * - ""                 -> ""
 */

import { describe, it, expect } from 'vitest';
import { toPascalCase, toSnakeCase, toCamelCase } from './casing';

describe('toPascalCase', () => {
    it('converts snake_case to PascalCase', () => {
        expect(toPascalCase('my_value')).toBe('MyValue');
    });

    it('converts kebab-case to PascalCase', () => {
        expect(toPascalCase('my-value')).toBe('MyValue');
    });

    it('converts space-separated to PascalCase', () => {
        expect(toPascalCase('my value')).toBe('MyValue');
    });

    it('ignores empty parts', () => {
        expect(toPascalCase('__value--name')).toBe('ValueName');
    });

    it('does not preserve PascalCase', () => {
        expect(toPascalCase('AlreadyPascal')).toBe('AlreadyPascal');
    });

    it('handles empty string', () => {
        expect(toPascalCase('')).toBe('');
    });
});

describe('toSnakeCase', () => {
    it('converts PascalCase to snake_case', () => {
        expect(toSnakeCase('MyValue')).toBe('my_value');
    });

    it('converts camelCase to snake_case', () => {
        expect(toSnakeCase('myValue')).toBe('my_value');
    });

    it('handles acronyms', () => {
        expect(toSnakeCase('HTMLParser')).toBe('html_parser');
        expect(toSnakeCase('NASAData')).toBe('nasa_data');
    });

    it('handles kebab-case', () => {
        expect(toSnakeCase('my-value')).toBe('my_value');
    });

    it('handles space-separated strings', () => {
        expect(toSnakeCase('my value here')).toBe('my_value_here');
    });

    it('collapses multiple delimiters', () => {
        expect(toSnakeCase('my__value--here')).toBe('my_value_here');
    });

    it('handles empty string', () => {
        expect(toSnakeCase('')).toBe('');
    });
});

describe('toCamelCase', () => {
    it('converts snake_case to camelCase', () => {
        expect(toCamelCase('my_value')).toBe('myValue');
    });

    it('converts kebab-case to camelCase', () => {
        expect(toCamelCase('my-value')).toBe('myValue');
    });

    it('converts space-separated to camelCase', () => {
        expect(toCamelCase('my value here')).toBe('myValueHere');
    });

    it('does not preserve PascalCase', () => {
        expect(toCamelCase('MyValue')).toBe('myvalue');
    });

    it('handles acronyms', () => {
        expect(toCamelCase('HTML_parser')).toBe('htmlParser');
    });

    it('skips empty parts', () => {
        expect(toCamelCase('__value--name')).toBe('valueName');
    });

    it('handles empty string', () => {
        expect(toCamelCase('')).toBe('');
    });
});
