import { TreeNode } from "src/core/types/tree-types";
import { IRenderer } from "src/core/render/renderer"
import { generateIdentifier } from "src/core/naming/identifier_gen";
import { NamingTarget } from "src/core/types/naming_types";


export function generateFile(
    startNode: TreeNode,
    renderer: IRenderer,
    isStatic: boolean = false,
    classPrefix: string = '',
    level: number = 0,
): string {

    const className = generateIdentifier(
        startNode.tokenGroup.name,
        NamingTarget.Class,
        classPrefix,
    );

    let out = renderer.openClass(className, level);

    for (const [, child] of startNode.children) {
        const fieldName = generateIdentifier(
            child.tokenGroup.name,
            NamingTarget.Field,
        );
        const childClassName = generateIdentifier(
            fieldName,
            NamingTarget.Class,
            className,
        );
        out += renderer.renderFieldReference(fieldName, childClassName, isStatic, level);
    }

    for (const token of startNode.tokens ?? []) {
        out += renderer.renderToken(token, isStatic, level);
    }

    out += renderer.closeClass(level);

    for (const [, child] of startNode.children) {
        out += generateFile(child, renderer, false, className, level);
    }
    return out;
}