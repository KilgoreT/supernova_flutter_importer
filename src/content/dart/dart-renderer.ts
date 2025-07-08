import { IToken } from "src/core/types/core-types";
import { IRenderer } from "src/core/render/renderer";
import { TokenRendererRegistry } from "src/core/render/token_renderer";

export class DartRenderer implements IRenderer {

    constructor(private readonly registry: TokenRendererRegistry) { }

    indent(level: number) {
        return '  '.repeat(level);
    }

    openClass(className: string, level: number): string {
        const indent = this.indent(level);
        return `${indent}class ${className} {\n${indent}  ${className}._();\n\n`;
    }
    closeClass(level: number): string {
        return this.indent(level) + `}\n\n`;
    }
    renderFieldReference(fieldName: string, className: string, isStatic: boolean, level: number): string {
        const indent = this.indent(level + 1);
        if (isStatic) {
            return `${indent}static final ${fieldName} = ${className}._();\n`;
        } else {
            return `${indent}final ${fieldName} = ${className}._();\n`;
        }
    }

    renderToken(
        token: IToken,
        keywords: Set<string>,
        customIdentifiers: string[],
        isStatic: boolean = false,
        level: number,
    ): string {
        return this.registry.render(token, keywords, customIdentifiers, level, isStatic);
    }
}