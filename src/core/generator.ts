import { TreeNode } from "src/core/entity/tree";
import { IRenderer } from "src/core/render/renderer"
import { generateIdentifier } from "src/core/naming/identifier_gen";
import { NamingTarget } from "src/core/entity/naming";


export function generateFileContent(
    startNode: TreeNode,
    renderer: IRenderer,
    keywords: Set<string>,
    customIdentifiers: string[],
    isStatic: boolean = false,
    classPrefix: string = '',
    level: number = 0,
): string {

    const className = generateIdentifier(
        startNode.tokenGroup.name,
        NamingTarget.Class,
        keywords,
        customIdentifiers,
        classPrefix,
    );

    let out = renderer.openClass(className, level);

    for (const [, child] of startNode.children) {
        const fieldName = generateIdentifier(
            child.tokenGroup.name,
            NamingTarget.Field,
            keywords,
            customIdentifiers,
        );
        const childClassName = generateIdentifier(
            fieldName,
            NamingTarget.Class,
            keywords,
            customIdentifiers,
            className,
        );
        out += renderer.renderFieldReference(fieldName, childClassName, isStatic, level);
    }

    for (const token of startNode.tokens ?? []) {
        out += renderer.renderToken(token, keywords, customIdentifiers, isStatic, level);
    }

    out += renderer.closeClass(level);

    for (const [, child] of startNode.children) {
        // Дочерние классы всегда НЕстатические (правило наследования статуса)
        out += generateFileContent(child, renderer, keywords, customIdentifiers, false, className, level);
    }
    return out;
}