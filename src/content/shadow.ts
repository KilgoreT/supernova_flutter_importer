
import {
    TokenTree,
    filterTreeByTokenType,
    DefinedTokenType,
    NamingTarget,
    generateIdentifier,
    TokenRendererRegistry,
    generateFileContent,

} from "src/content/index";

import { DartRenderer } from "src/generators/dart/renderer";
import { renderShadowToken } from "src/generators/dart/tokens/shadow_renderer";
import { exportConfiguration } from "..";
import { combineImports, SHADOW_IMPORTS } from "src/utils/imports";


export function generateShadow(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
): Array<{
    name: string;
    path: string;
    content: string;
}> {

    const result: Array<{ name: string; path: string; content: string }> = [];
    const shadowPath = exportConfiguration.shadowPath;
    const shadowTree = filterTreeByTokenType(tree, DefinedTokenType.Shadow);

    const registry = new TokenRendererRegistry();
    registry.register(DefinedTokenType.Shadow, renderShadowToken);
    const renderer = new DartRenderer(
        registry,
    );

    for (const root of shadowTree.roots) {
        for (const [, startNode] of root.children) {
            const body = generateFileContent(
                startNode,
                renderer,
                keywords,
                customIdentifiers,
                true,
            );
            const fileName = generateIdentifier(
                startNode.tokenGroup.name,
                NamingTarget.File,
                keywords,
                customIdentifiers,
            );
            result.push({
                name: fileName,
                path: shadowPath,
                content: `${combineImports(SHADOW_IMPORTS)}\n\n${body.trim()}`,
            });
        }
    }
    return result;
}